// Netlify Functions v2 — Nova met quota gate (HMAC-cookie)
type Mode = "outfits" | "archetype" | "shop";
type Msg = { role: "system" | "user" | "assistant"; content: string };

const ORIGINS = [
  "https://www.fitfi.ai",
  "https://fitfi.ai",
  "https://fitfi.netlify.app",
  "http://localhost:5173",
];

function corsOrigin(o: string | null) {
  try {
    if (!o) return ORIGINS[0];
    if (ORIGINS.includes(o)) return o;
    const u = new URL(o);
    if (
      (u.protocol === "https:" || u.protocol === "http:") &&
      u.hostname.endsWith(".netlify.app")
    )
      return o;
  } catch {}
  return ORIGINS[0];
}

function systemPrompt(m: Mode) {
  const base = [
    "Je bent Nova, premium AI-stylist. Antwoord NL, kort en duidelijk.",
    "Eerst een beknopte menselijke uitleg met bullets.",
    "DAARNA ALTIJD een machine-leesbare JSON payload tussen markers zonder codefences:",
    "<<<FITFI_JSON>>> ... <<<END_FITFI_JSON>>>",
    'JSON schema: {"type":"outfits","version":1,"outfits":[{"id":"string","title":"string","occasion":"string?","why":"string?","matchScore":0-100,"palette":["#RRGGBB",...],"budget":"low|mid|high?","items":[{"role":"top|bottom|outerwear|shoes|accessory","name":"string","color":"string?","note":"string?"}],"shopQuery":"string?"}]}',
    "Zet matchScore integer 0..100. Palet in HEX (max 4). Gebruik korte, merkloze namen. GEEN markdown codefences in de JSON; alleen pure JSON tussen de markers.",
  ].join(" ");
  if (m === "outfits")
    return (
      base + " Geef 3 outfits (casual/smart/business afhankelijk van de vraag)."
    );
  if (m === "archetype")
    return base + " Voeg 2 outfits toe die het archetype belichamen.";
  return base + " Toon shoppingrichtingen als outfits met generieke items.";
}

type Tier = "visitor" | "member" | "plus" | "founder";
const LIMITS: Record<Tier, { perDay: number; perWeek: number }> = {
  visitor: { perDay: 1, perWeek: 1 },
  member: { perDay: 2, perWeek: 3 },
  plus: { perDay: 20, perWeek: 140 },
  founder: { perDay: 40, perWeek: 280 },
};

function parseCookies(h: string | null) {
  const out: Record<string, string> = {};
  if (!h) return out;
  h.split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > 0) {
      out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1));
    }
  });
  return out;
}

function isoDay(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
function isoWeek(d = new Date()) {
  const dt = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const dayNum = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(
    ((dt.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${dt.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function b64u(s: string) {
  return Buffer.from(s).toString("base64url");
}
function ub64u(s: string) {
  return Buffer.from(s, "base64url").toString();
}
async function hmac(input: string, secret: string) {
  const { createHmac } = await import("crypto");
  return createHmac("sha256", secret).update(input).digest("hex");
}

function safeTier(t?: string): Tier {
  const v = (t || "").toLowerCase();
  if (v === "member" || v === "plus" || v === "founder") return v as Tier;
  return "visitor";
}

export default async (req: Request) => {
  const origin = req.headers.get("origin");
  const allow = corsOrigin(origin);
  const acceptsSSE = /text\/event-stream/i.test(
    req.headers.get("accept") || "",
  );

  // Preflight
  if (req.method === "OPTIONS")
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allow,
        "Access-Control-Allow-Headers":
          "content-type, x-fitfi-tier, x-fitfi-uid",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });

  // Health
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        ok: true,
        fn: "nova",
        node: process.version,
        hasKey: !!process.env.OPENAI_API_KEY,
      }),
      {
        headers: {
          "Access-Control-Allow-Origin": allow,
          "Content-Type": "application/json",
        },
      },
    );
  }

  const secret = process.env.FITFI_COOKIE_SECRET || "";
  const key = process.env.OPENAI_API_KEY || "";
  if (!key) {
    const rs = new ReadableStream({
      start(c) {
        c.enqueue(
          `data: ${JSON.stringify({ type: "error", message: "missing OPENAI_API_KEY" })}\n\n`,
        );
        c.enqueue('data: {"type":"done"}\n\n');
        c.close();
      },
    });
    return new Response(rs, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": allow,
      },
    });
  }

  // Parse body
  const { mode, messages, stream } = (await req.json()) as {
    mode: Mode;
    messages: Msg[];
    stream?: boolean;
  };
  const m: Mode = (["outfits", "archetype", "shop"] as Mode[]).includes(mode)
    ? mode
    : "outfits";
  if (!Array.isArray(messages) || !messages.length)
    return new Response("Bad request", {
      status: 400,
      headers: { "Access-Control-Allow-Origin": allow },
    });

  // Quota gate
  const cookies = parseCookies(req.headers.get("cookie"));
  const hdrTier = safeTier(req.headers.get("x-fitfi-tier") || undefined);
  const hdrUid = (req.headers.get("x-fitfi-uid") || "").slice(0, 64);
  const raw = cookies["fitfi_usage"];
  let state: any = null;
  if (raw && secret) {
    try {
      const [payload, sig] = raw.split(".");
      const data = ub64u(payload);
      const mac = await hmac(data, secret);
      if (mac === sig) state = JSON.parse(data);
    } catch {}
  }
  if (!state)
    state = {
      uid: hdrUid || cookies["fitfi_uid"] || "",
      tier: hdrTier,
      day: isoDay(),
      week: isoWeek(),
      counts: { outfits: 0 },
    };
  if (!state.uid) state.uid = hdrUid || Math.random().toString(36).slice(2);
  // tier kan omhoog (member/plus), nooit omlaag:
  const tier = hdrTier === "visitor" ? state.tier || "visitor" : hdrTier;
  state.tier = tier;

  // reset per nieuwe dag/week
  const today = isoDay();
  if (state.day !== today) {
    state.day = today;
    state.counts = { outfits: 0 };
  }
  const thisWeek = isoWeek();
  if (state.week !== thisWeek) {
    state.week =
      thisWeek; /* week tellen impliciet via dagcount som; simpel houden */
  }

  // limieten
  const lim = LIMITS[tier];
  const overDay = state.counts.outfits >= lim.perDay;
  const overWeek = false; // eenvoudige dag-cap voor nu (week-cap kan later via aparte sleutel)
  const withinMode = tier === "visitor" ? m === "outfits" : true;

  if (!withinMode || overDay || overWeek) {
    const enc = new TextEncoder();
    const rs = new ReadableStream({
      start(controller) {
        const send = (o: any) =>
          controller.enqueue(enc.encode(`data: ${JSON.stringify(o)}\n\n`));
        send({
          type: "error",
          code: "quota_exceeded",
          tier,
          message: overDay
            ? "Daglimiet bereikt"
            : "Niet toegestaan in deze tier",
        });
        send({ type: "done" });
        controller.close();
      },
    });
    const headers: any = {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": allow,
    };
    // zet uid cookie (los van signed usage)
    headers["Set-Cookie"] =
      `fitfi_uid=${encodeURIComponent(state.uid)}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
    return new Response(rs, { status: 200, headers });
  }

  // incrementeer en sign cookie
  state.counts.outfits += 1;
  let setCookies = [
    `fitfi_uid=${encodeURIComponent(state.uid)}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`,
  ];
  if (secret) {
    const payload = JSON.stringify(state);
    const sig = await hmac(payload, secret);
    setCookies.push(
      `fitfi_usage=${b64u(payload)}.${sig}; Path=/; Max-Age=604800; SameSite=Lax; Secure`,
    );
  }

  // SSE streaming
  if (acceptsSSE && stream !== false) {
    const enc = new TextEncoder();
    const rs = new ReadableStream({
      start: async (controller) => {
        const send = (o: any) =>
          controller.enqueue(enc.encode(`data: ${JSON.stringify(o)}\n\n`));
        send({ type: "meta", mode: m, model: routeModel(m) });

        try {
          const upstream = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${key}`,
              },
              body: JSON.stringify({
                model: routeModel(m),
                messages: [
                  { role: "system", content: systemPrompt(m) },
                  ...messages,
                ],
                stream: true,
                temperature: 0.7,
              }),
              // @ts-ignore
              duplex: "half",
            },
          );

          if (!upstream.ok || !upstream.body) {
            const txt = await upstream.text().catch(() => "");
            send({
              type: "error",
              message: "upstream error",
              status: upstream.status,
              detail: txt.slice(0, 200),
            });
            send({ type: "done" });
            controller.close();
            return;
          }

          const reader = upstream.body.getReader();
          const dec = new TextDecoder();
          let buf = "";
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            const lines = buf.split("\n");
            buf = lines.pop() || "";
            for (const raw of lines) {
              const l = raw.trim();
              if (!l || !l.startsWith("data:")) continue;
              const payload = l.slice(5).trim();
              if (payload === "[DONE]") continue;
              try {
                const obj = JSON.parse(payload);
                const delta = obj.choices?.[0]?.delta?.content || "";
                if (delta) send({ type: "chunk", delta });
              } catch {}
            }
          }
          send({ type: "done" });
          controller.close();
        } catch (e: any) {
          send({ type: "error", message: "network error" });
          send({ type: "done" });
          controller.close();
        }
      },
    });

    return new Response(rs, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": allow,
        "Set-Cookie": setCookies.join(", "),
      },
    });
  }

  // JSON fallback
  return new Response(
    JSON.stringify({ content: "Nova (fallback): streaming niet actief." }),
    {
      headers: {
        "Access-Control-Allow-Origin": allow,
        "Content-Type": "application/json",
        "Set-Cookie": setCookies.join(", "),
      },
    },
  );
};

function routeModel(m: Mode) {
  if (m === "outfits") return process.env.NOVA_MODEL_OUTFITS || "gpt-4o";
  if (m === "archetype")
    return process.env.NOVA_MODEL_ARCHETYPE || "gpt-4o-mini";
  return process.env.NOVA_MODEL_SHOP || "gpt-4o-mini";
}
