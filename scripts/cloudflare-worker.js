/**
 * Cloudflare Worker: Multi-purpose API proxy
 *
 * Routes:
 *   POST /webhook           — Prismic webhook → triggers GitHub Actions rebuild
 *   POST /contact           — Contact form submission → sends email via Mailgun
 *   GET  /api/instagram-feed — Instagram feed proxy → cached Instagram Graph API
 *
 * Environment variables (set in Cloudflare Worker settings):
 *   GITHUB_TOKEN              - GitHub fine-grained PAT with Actions:Write
 *   WEBHOOK_SECRET            - (optional) secret to verify Prismic webhook requests
 *   MAILGUN_API_KEY           - Mailgun private API key
 *   MAILGUN_DOMAIN            - Mailgun sending domain (e.g., mg.client.co.uk)
 *   RECIPIENT_EMAIL           - Where form submissions are sent (e.g., hello@client.co.uk)
 *   ALLOWED_ORIGIN            - CORS origin for form submissions (e.g., https://org.github.io)
 *   INSTAGRAM_ACCESS_TOKEN    - Long-lived Instagram access token
 *   INSTAGRAM_USER_ID         - Instagram user ID to fetch media from
 *   INSTAGRAM_CACHE_TTL       - (optional) Cache duration in seconds (default: 1800)
 *   INSTAGRAM_LIMIT           - (optional) Number of posts to fetch (default: 8)
 *
 * Replace getrefined and scafell_website with your GitHub org and repo name.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === "OPTIONS") {
      return corsResponse(env, 204);
    }

    // Route by path, validate method per-route
    if (path === "/api/instagram-feed") {
      if (request.method !== "GET") {
        return corsResponse(env, 405, "Method not allowed");
      }
      return handleInstagramFeed(request, env, ctx);
    }

    if (request.method !== "POST") {
      return corsResponse(env, 405, "Method not allowed");
    }

    if (path === "/webhook" || path === "/") {
      return handleWebhook(request, env, url);
    }

    if (path === "/contact") {
      return handleContactForm(request, env);
    }

    return new Response("Not found", { status: 404 });
  },
};

// --- Prismic Webhook Handler ---
async function handleWebhook(request, env, url) {
  if (env.WEBHOOK_SECRET) {
    const secret = url.searchParams.get("secret");
    if (secret !== env.WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const githubResponse = await fetch(
    "https://api.github.com/repos/getrefined/scafell_website/actions/workflows/prismic-rebuild.yml/dispatches",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "scafell_website-webhook",
      },
      body: JSON.stringify({ ref: "main" }),
    }
  );

  if (githubResponse.status === 204) {
    return new Response("Rebuild triggered", { status: 200 });
  }

  const body = await githubResponse.text();
  return new Response(`GitHub API error: ${githubResponse.status} ${body}`, {
    status: 502,
  });
}

// --- Contact Form Handler ---
async function handleContactForm(request, env) {
  let data;
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    data = await request.json();
  } else if (contentType.includes("form")) {
    const formData = await request.formData();
    data = Object.fromEntries(formData.entries());
  } else {
    return corsResponse(env, 400, "Unsupported content type");
  }

  const { name, email, phone, "project-type": projectType, message } = data;

  if (!name || !email) {
    return corsResponse(env, 400, "Name and email are required");
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return corsResponse(env, 400, "Invalid email address");
  }

  // Build email body
  const emailBody = [
    `New enquiry from ${name}`,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    projectType ? `Project Type: ${projectType}` : null,
    ``,
    `Message:`,
    message || "(no message)",
  ]
    .filter(Boolean)
    .join("\n");

  // Send via Mailgun
  const mailgunUrl = `https://api.eu.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`;
  // Use https://api.mailgun.net for US region

  const form = new URLSearchParams();
  form.append("from", `${name} <noreply@${env.MAILGUN_DOMAIN}>`);
  form.append("to", env.RECIPIENT_EMAIL);
  form.append("reply-to", email);
  form.append("subject", `Website Enquiry from ${name}`);
  form.append("text", emailBody);

  const mgResponse = await fetch(mailgunUrl, {
    method: "POST",
    headers: {
      Authorization: "Basic " + btoa(`api:${env.MAILGUN_API_KEY}`),
    },
    body: form,
  });

  if (!mgResponse.ok) {
    const errText = await mgResponse.text();
    console.error("Mailgun error:", errText);
    return corsResponse(env, 500, "Failed to send message. Please try again.");
  }

  return corsResponse(env, 200, "Message sent successfully");
}

// --- Instagram Feed Handler ---
const INSTAGRAM_API_BASE = "https://graph.instagram.com/v24.0";
const INSTAGRAM_FIELDS =
  "id,media_type,media_url,thumbnail_url,permalink,caption,timestamp";
const DEFAULT_INSTAGRAM_LIMIT = 8;
const DEFAULT_CACHE_TTL = 1800;

async function handleInstagramFeed(request, env, ctx) {
  if (!env.INSTAGRAM_ACCESS_TOKEN || !env.INSTAGRAM_USER_ID) {
    return corsResponse(env, 500, "Instagram integration not configured");
  }

  const corsOrigin = env.ALLOWED_ORIGIN || "*";

  // Check cache first
  const cacheKey = new Request("https://cache.internal/instagram-feed");
  const cache = caches.default;

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  // Fetch from Instagram Graph API
  const limit = parseInt(env.INSTAGRAM_LIMIT || String(DEFAULT_INSTAGRAM_LIMIT));
  const url = `${INSTAGRAM_API_BASE}/${env.INSTAGRAM_USER_ID}/media?fields=${INSTAGRAM_FIELDS}&limit=${limit}&access_token=${env.INSTAGRAM_ACCESS_TOKEN}`;

  const apiResponse = await fetch(url);
  if (!apiResponse.ok) {
    return corsResponse(env, 502, "Failed to fetch Instagram feed");
  }

  const json = await apiResponse.json();
  const ttl = parseInt(env.INSTAGRAM_CACHE_TTL || String(DEFAULT_CACHE_TTL));

  const response = new Response(JSON.stringify(json.data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${ttl}`,
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });

  // Non-blocking cache write
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

// --- CORS Helper ---
function corsResponse(env, status, body) {
  const origin = env.ALLOWED_ORIGIN || "*";
  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(
    JSON.stringify({ success: status < 400, message: body || "" }),
    { status, headers }
  );
}
