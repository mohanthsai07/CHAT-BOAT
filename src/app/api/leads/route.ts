const indianMobileRegex = /^[6-9]\d{9}$/;

interface LeadPayload {
  name?: unknown;
  phone?: unknown;
  city?: unknown;
  cls?: unknown;
  course?: unknown;
  time?: unknown;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LeadPayload;

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const city = typeof body.city === "string" ? body.city.trim() : "";
    const cls = typeof body.cls === "string" ? body.cls.trim() : "";
    const course = typeof body.course === "string" ? body.course.trim() : "";
    const time = typeof body.time === "string" ? body.time.trim() : "";

    if (!name || !phone) {
      return Response.json({ error: "Name and phone are required" }, { status: 400 });
    }

    if (!indianMobileRegex.test(phone)) {
      return Response.json({ error: "Enter a valid 10-digit Indian mobile number" }, { status: 400 });
    }

    const webhookUrl =
      process.env.SHEETS_WEBHOOK ||
      process.env.NEXT_PUBLIC_SHEETS_WEBHOOK ||
      "";

    if (!webhookUrl) {
      return Response.json(
        { error: "Sheets webhook is not configured on the server" },
        { status: 500 }
      );
    }

    const parsedWebhookUrl = new URL(webhookUrl);
    const isAppsScriptWebhook =
      parsedWebhookUrl.hostname === "script.google.com" &&
      parsedWebhookUrl.pathname.includes("/macros/s/") &&
      parsedWebhookUrl.pathname.endsWith("/exec");

    if (!isAppsScriptWebhook) {
      return Response.json(
        {
          error:
            "Invalid webhook URL. Use a Google Apps Script Web App URL ending in /exec, not a docs.google.com sheet or form link.",
        },
        { status: 500 }
      );
    }

    const payload = {
      name,
      phone,
      city,
      class: cls,
      course,
      time: time || new Date().toLocaleString("en-IN"),
    };

    const upstreamResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!upstreamResponse.ok) {
      const upstreamText = await upstreamResponse.text();

      return Response.json(
        {
          error: `Webhook failed with ${upstreamResponse.status}`,
          details: upstreamText.slice(0, 300),
        },
        { status: 502 }
      );
    }

    return Response.json({ ok: true, lead: payload });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected lead submission error";

    return Response.json({ error: message }, { status: 500 });
  }
}
