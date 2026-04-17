import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/cors.ts";

const TOPIC_LABELS: Record<string, string> = {
  algemeen: "Algemene vraag",
  pers: "Pers & Media",
  partners: "Partnership & Samenwerking",
  feedback: "Feedback & Suggesties",
  bug: "Bug of technisch probleem",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { name, email, topic, message } = body;

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Verplichte velden ontbreken." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(JSON.stringify({ error: "Serverconfiguratie ontbreekt." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error: dbError } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.trim(),
      topic: topic ?? "algemeen",
      message: message.trim(),
    });

    if (dbError) {
      console.error("DB insert error:", JSON.stringify(dbError));
      throw dbError;
    }

    const topicLabel = TOPIC_LABELS[topic] ?? topic;
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (resendKey) {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "FitFi Contact <info@fitfi.ai>",
          to: ["info@fitfi.ai"],
          reply_to: email.trim(),
          subject: `[Contact] ${topicLabel} — ${name.trim()}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
              <div style="background: #F5F0EB; padding: 32px 32px 24px; border-radius: 12px 12px 0 0;">
                <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #C2654A;">Nieuw contactbericht</p>
                <h1 style="margin: 0; font-size: 22px; font-weight: 700;">${name.trim()}</h1>
              </div>
              <div style="background: #ffffff; padding: 32px; border: 1px solid #E5E5E5; border-top: none; border-radius: 0 0 12px 12px;">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 13px; color: #8A8A8A; width: 100px; vertical-align: top;">E-mail</td>
                    <td style="padding: 8px 0; font-size: 14px; font-weight: 500; color: #1A1A1A;">
                      <a href="mailto:${email.trim()}" style="color: #C2654A; text-decoration: none;">${email.trim()}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 13px; color: #8A8A8A; vertical-align: top;">Onderwerp</td>
                    <td style="padding: 8px 0; font-size: 14px; font-weight: 500; color: #1A1A1A;">${topicLabel}</td>
                  </tr>
                </table>
                <div style="border-top: 1px solid #E5E5E5; padding-top: 24px;">
                  <p style="margin: 0 0 8px; font-size: 13px; color: #8A8A8A; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Bericht</p>
                  <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #4A4A4A; white-space: pre-wrap;">${message.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                </div>
                <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #E5E5E5;">
                  <a href="mailto:${email.trim()}" style="display: inline-block; background: #C2654A; color: white; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 8px;">Beantwoord ${name.trim()}</a>
                </div>
              </div>
              <p style="margin: 20px 0 0; font-size: 12px; color: #8A8A8A; text-align: center;">FitFi.ai — automatisch gegenereerd contactbericht</p>
            </div>
          `,
        }),
      });

      if (!resendRes.ok) {
        const resendErr = await resendRes.text();
        console.error("Resend error:", resendErr);
      }
    } else {
      console.warn("RESEND_API_KEY not set — e-mail not sent, message saved to DB only.");
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-contact-email error:", err);
    return new Response(JSON.stringify({ error: "Er is iets misgegaan." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
