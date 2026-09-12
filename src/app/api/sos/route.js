export async function GET() {
  return Response.json({ status: "ok", note: "SafeBand alert system ready. Emails are user-managed." });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const type = ["sos", "fall", "safezone"].includes(body?.type) ? body.type : "sos";
  const recipientEmail = typeof body?.recipientEmail === "string" ? body.recipientEmail.slice(0, 254) : "";

  if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    return Response.json({ ok: false, error: "Invalid recipient email" }, { status: 400 });
  }

  return Response.json({
    ok: true,
    type,
    recipient: recipientEmail,
    message: "Alert recorded. User must send email manually.",
    timestamp: new Date().toISOString(),
  });
}
