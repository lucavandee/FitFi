import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  try {
    const path = event.path || "";
    // verwacht: /.netlify/functions/shop-redirect/{merchant}/{id}
    const parts = path.split("/").filter(Boolean);
    const merchant = decodeURIComponent(parts[parts.length - 2] || "unknown");
    const id = decodeURIComponent(parts[parts.length - 1] || "unknown");

    const uParam = (event.queryStringParameters || {}).u || "";
    const target = Buffer.from(uParam, "base64").toString("utf-8");

    if (!/^https?:\/\//i.test(target)) {
      return { statusCode: 400, body: "Invalid target" };
    }

    // Logging kan later naar analytics; nu console
    // eslint-disable-next-line no-console
    console.log("[shop-redirect]", { merchant, id, target });

    return {
      statusCode: 302,
      headers: { Location: target, "Cache-Control": "no-store" },
      body: ""
    };
  } catch {
    return { statusCode: 500, body: "redirect error" };
  }
};