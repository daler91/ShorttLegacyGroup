/**
 * Shortt Legacy Group – site Worker.
 *
 * The website itself is static files in ./public, served by Cloudflare Workers
 * static assets. This script only handles POST /api/contact: it checks the
 * contact form and emails it through Cloudflare Email Routing, which is free
 * when sending to a verified destination address. The destination is the
 * CONTACT_TO secret, so it is not stored in this (public) repository.
 */
import { EmailMessage } from "cloudflare:email";

const SERVICES = [
  "General enquiry",
  "IT Recruitment",
  "Data & Analytics",
  "Application Development",
  "IT Consulting",
  "Innovation & Solutions",
];

const LIMITS = { name: 100, phone: 40, email: 254, message: 5000 };
const MAX_BODY_BYTES = 32 * 1024;
// Real people take longer than this to fill in the form; bots usually don't.
const MIN_FILL_MS = 2000;

const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]+$/;
const PHONE_PATTERN = /^[0-9+().\-\s]{6,40}$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Anything that isn't the API goes to the static site (including its 404 page).
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    if (url.pathname !== "/api/contact") return reply({ ok: false, error: "not_found" }, 404);
    if (request.method !== "POST") return reply({ ok: false, error: "method_not_allowed" }, 405, { Allow: "POST" });

    // Only accept the form from this site's own pages.
    if (request.headers.get("Origin") !== url.origin) return reply({ ok: false, error: "forbidden" }, 403);
    if (Number(request.headers.get("Content-Length") || 0) > MAX_BODY_BYTES) {
      return reply({ ok: false, error: "too_large" }, 413);
    }

    let form;
    try {
      form = await request.formData();
    } catch {
      return reply({ ok: false, error: "bad_request" }, 400);
    }

    // Spam traps: a hidden field people never see, and a minimum time on the page.
    // Bots get a normal-looking success so they don't learn to adapt.
    const elapsed = Number(form.get("elapsed_ms"));
    const honeypot = text(form, "hp_field");
    if (honeypot || !(elapsed >= MIN_FILL_MS)) {
      console.log("Dropped likely spam", { honeypot: Boolean(honeypot), elapsed });
      return reply({ ok: true }, 200);
    }

    const enquiry = {
      name: singleLine(text(form, "name")),
      phone: singleLine(text(form, "phone")),
      email: singleLine(text(form, "email")),
      service: singleLine(text(form, "service")),
      message: multiLine(text(form, "message")),
    };
    if (!SERVICES.includes(enquiry.service)) enquiry.service = SERVICES[0];

    const problem = validate(enquiry);
    if (problem) return reply({ ok: false, error: "invalid", message: problem }, 400);

    if (!env.CONTACT_TO || !env.CONTACT_FROM) {
      console.error("Contact form is not configured: set the CONTACT_TO secret and the CONTACT_FROM variable.");
      return reply({ ok: false, error: "not_configured" }, 500);
    }

    try {
      const raw = buildEmail({ from: env.CONTACT_FROM, to: env.CONTACT_TO, enquiry });
      await env.CONTACT_EMAIL.send(new EmailMessage(env.CONTACT_FROM, env.CONTACT_TO, raw));
    } catch (error) {
      console.error("Sending the enquiry failed", error);
      return reply({ ok: false, error: "send_failed" }, 502);
    }

    return reply({ ok: true }, 200);
  },
};

function validate({ name, phone, email, message }) {
  if (!name) return "Please tell us your name.";
  if (name.length > LIMITS.name) return "Please shorten your name.";
  if (!phone && !email) return "Please add a phone number or an email address so we can reply.";
  if (phone && (phone.length > LIMITS.phone || !PHONE_PATTERN.test(phone))) {
    return "That phone number doesn't look right.";
  }
  if (email && (email.length > LIMITS.email || !EMAIL_PATTERN.test(email))) {
    return "That email address doesn't look right.";
  }
  if (!message) return "Please write a short message.";
  if (message.length > LIMITS.message) return "Please shorten your message.";
  return null;
}

function buildEmail({ from, to, enquiry }) {
  const { name, phone, email, service, message } = enquiry;
  const body = [
    "New enquiry from the Shortt Legacy Group website.",
    "",
    `Name:          ${name}`,
    `Phone:         ${phone || "–"}`,
    `Email:         ${email || "–"}`,
    `Interested in: ${service}`,
    "",
    "Message:",
    message.replace(/\n/g, "\r\n"),
    "",
    "—",
    email
      ? `Reply to this email to answer ${name} directly.`
      : `${name} didn't leave an email address. Call or WhatsApp them on ${phone}.`,
  ].join("\r\n");

  const headers = [
    `From: ${mailbox("Shortt Legacy Group website", from)}`,
    `To: <${to}>`,
    email ? `Reply-To: ${mailbox(name, email)}` : null,
    `Subject: ${encodeHeader(`Website enquiry: ${service} - ${name}`)}`,
    `Date: ${new Date().toUTCString().replace("GMT", "+0000")}`,
    `Message-ID: <${crypto.randomUUID()}@${from.split("@")[1]}>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
  ].filter(Boolean);

  return `${headers.join("\r\n")}\r\n\r\n${base64(body).replace(/.{76}/g, "$&\r\n")}\r\n`;
}

// "Display Name" <address>, with RFC 2047 encoding for non-ASCII names.
function mailbox(displayName, address) {
  const phrase = /^[\x20-\x7e]*$/.test(displayName)
    ? `"${displayName.replace(/["\\]/g, "\\$&")}"`
    : encodeHeader(displayName);
  return `${phrase} <${address}>`;
}

// RFC 2047 encoded-words, each kept under the 75-character limit.
function encodeHeader(value) {
  if (/^[\x20-\x7e]*$/.test(value)) return value;
  const encoder = new TextEncoder();
  const words = [];
  let chunk = "";
  for (const char of value) {
    if (encoder.encode(chunk + char).length > 45) {
      words.push(chunk);
      chunk = "";
    }
    chunk += char;
  }
  if (chunk) words.push(chunk);
  return words.map((word) => `=?UTF-8?B?${base64(word)}?=`).join("\r\n ");
}

function base64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function text(form, key) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// Removes line breaks and control characters, so values can't add email headers.
function singleLine(value) {
  return value.replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, " ").replace(/\s{2,}/g, " ").trim();
}

// Normalises line breaks to \n (so length limits match the form's maxlength) and drops control characters.
function multiLine(value) {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "")
    .trim();
}

function reply(data, status, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
