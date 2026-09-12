import nodemailer from "nodemailer";

const SUBJECTS = {
  sos: "SOS Alert",
  fall: "Fall Detected",
  safezone: "Safe Zone Alert",
};

const EMOJI = {
  sos: "\u{1F6A8}",
  fall: "\u{26A0}\u{FE0F}",
  safezone: "\u{1F4CD}",
};

function isConfigured() {
  return Boolean(process.env.EMAIL && process.env.EMAIL_PASS);
}

export async function GET() {
  return Response.json({ configured: isConfigured() });
}

function sanitizeText(value, maxLen) {
  if (typeof value !== "string") return "";
  return value.slice(0, maxLen);
}

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const type = ["sos", "fall", "safezone"].includes(body?.type) ? body.type : "sos";
  const message = sanitizeText(body?.message, 500) || "An emergency alert was triggered.";
  const location =
    body?.location && typeof body.location.lat === "number" && typeof body.location.lng === "number"
      ? { lat: body.location.lat, lng: body.location.lng }
      : null;

  const rawContacts = Array.isArray(body?.contacts) ? body.contacts.slice(0, 20) : [];
  const contacts = rawContacts
    .map((c) => ({
      name: sanitizeText(c?.name, 100) || "Contact",
      email: sanitizeText(c?.email, 254),
    }))
    .filter((c) => isValidEmail(c.email));

  if (!isConfigured()) {
    return Response.json({ ok: true, simulated: true });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS },
  });

  const subject = `${EMOJI[type]} ${SUBJECTS[type]}`;
  const mapsLink = location ? `https://maps.google.com/?q=${location.lat},${location.lng}` : null;
  const html = `
    <div style="font-family:sans-serif;max-width:480px">
      <h2 style="color:#de1249">${subject}</h2>
      <p>${message}</p>
      ${mapsLink ? `<p><a href="${mapsLink}" target="_blank">View live location on Google Maps</a></p>` : "<p>Location unavailable.</p>"}
      <p style="color:#5a6472;font-size:12px">Sent automatically by SafeBand.</p>
    </div>
  `;

  const sentTo = [];
  const failed = [];

  for (const contact of contacts) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: contact.email,
        subject,
        html,
      });
      sentTo.push(contact.email);
    } catch {
      failed.push(contact.email);
    }
  }

  return Response.json({ ok: true, simulated: false, sentTo, failed });
}
