// Debug function to verify Nova OpenAI setup
// Access at: /.netlify/functions/debug-nova

import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  const origin = event.headers.origin || (event.headers as any).Origin;
  const allowedOrigins = ["https://www.fitfi.ai", "https://fitfi.ai", "http://localhost:5173", "http://localhost:8888"];

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigins.includes(origin || "") ? origin! : allowedOrigins[0],
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
      body: ""
    };
  }

  const hasUpstream = process.env.NOVA_UPSTREAM;
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  const upstreamValue = process.env.NOVA_UPSTREAM || "(not set)";
  const apiKeyPrefix = process.env.OPENAI_API_KEY?.substring(0, 8) || "(not set)";
  const isEnabled = upstreamValue.toLowerCase() === "on" && hasApiKey;

  const debugInfo = {
    timestamp: new Date().toISOString(),
    status: isEnabled ? "✅ OpenAI ENABLED" : "❌ OpenAI DISABLED",
    details: {
      NOVA_UPSTREAM: {
        value: upstreamValue,
        isCorrect: upstreamValue.toLowerCase() === "on",
        note: "Must be exactly 'on' (lowercase)"
      },
      OPENAI_API_KEY: {
        prefix: apiKeyPrefix,
        isSet: hasApiKey,
        isValid: apiKeyPrefix.startsWith("sk-"),
        note: "Must start with 'sk-'"
      },
      computed: {
        upstreamEnabled: isEnabled,
        willUseOpenAI: isEnabled,
        fallbackToLocal: !isEnabled
      }
    },
    recommendations: []
  };

  // Add recommendations
  if (!hasUpstream || upstreamValue.toLowerCase() !== "on") {
    debugInfo.recommendations.push({
      issue: "NOVA_UPSTREAM not set to 'on'",
      solution: "Set NOVA_UPSTREAM=on in Netlify environment variables"
    });
  }

  if (!hasApiKey) {
    debugInfo.recommendations.push({
      issue: "OPENAI_API_KEY not set",
      solution: "Add your OpenAI API key to Netlify environment variables"
    });
  } else if (!apiKeyPrefix.startsWith("sk-")) {
    debugInfo.recommendations.push({
      issue: "OPENAI_API_KEY format looks incorrect",
      solution: "Verify your API key starts with 'sk-' from OpenAI dashboard"
    });
  }

  if (isEnabled) {
    debugInfo.recommendations.push({
      status: "✅ Configuration looks good!",
      next: "Test conversation in Nova chat. Check function logs for 'Using OpenAI for conversational response'"
    });
  } else {
    debugInfo.recommendations.push({
      status: "⚠️ Configuration incomplete",
      next: "Fix issues above, then redeploy site (clear cache)"
    });
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowedOrigins.includes(origin || "") ? origin! : allowedOrigins[0],
    },
    body: JSON.stringify(debugInfo, null, 2),
  };
};
