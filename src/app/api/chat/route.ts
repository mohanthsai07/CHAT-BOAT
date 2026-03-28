import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
    }

    // Groq integration path (free API)
    const groqUrl = process.env.GROQ_API_URL;
    if (groqUrl) {
      const groqRes = await fetch(groqUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.GROQ_API_KEY ? { "Authorization": `Bearer ${process.env.GROQ_API_KEY}` } : {}),
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // current free model on Groq
          messages: [
            { 
              role: "system", 
              content: `You are the official AI assistant for Dhanik Bharat Educational Institutions, part of The Lloyd Group. Help prospective students and parents.

INSTITUTION: Dhanik Bharat Educational Institutions (The Lloyd Group), Founded 2025-26, Intermediate college offering IIT-JEE & NEET coaching.

DIRECTOR: Smt. Balalatha Mallavarapu - Former Deputy Director Ministry of Defence, Two-time Civil Services Ranker, Personal mentor to Founding Batch.

COURSES: 1) IIT-JEE Integrated (2 years, Classes 11-12 + JEE prep) 2) NEET UG Integrated (2 years, Classes 11-12 + NEET prep). Both use Pomodoro Study Method.

POMODORO METHOD: 25-min focused study + 5-min breaks + 15-20min break after 4 cycles. Benefits: reduces burnout, improves retention, teaches time discipline.

BRANCHES: Hyderabad (Kukatpally), Vijayawada, Guntur, Vizag

CONTACT: Primary 9555825559 | Alternate 7032305559 | WhatsApp https://wa.me/919555825559

EXAM DATES 2026: NEET UG (May 3), JEE Advanced (May 18)

ADMISSION PROCESS: 1) Enquiry call/WhatsApp 2) Free counselling 3) Fill admission form 4) Fee payment. LIMITED SEATS AVAILABLE.

FEES: NEVER disclose specific fees. Always say: "For exact fee structure and scholarships, please call 9555825559 or WhatsApp us — our team will provide complete breakdown."

RESPONSE STYLE: Warm, helpful, confident tone. Keep under 80 words. Include contact details for admissions/fees. Never invent information. If unsure, direct to 9555825559.` 
            },
            { role: "user", content: message },
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      const groqData = await groqRes.json();
      if (!groqRes.ok) {
        return new Response(JSON.stringify({ error: groqData.error || groqData }), { status: groqRes.status });
      }

      const reply = groqData?.choices?.[0]?.message?.content;
      if (!reply) {
        return new Response(JSON.stringify({ error: "No answer returned from Groq" }), { status: 500 });
      }

      return new Response(JSON.stringify({ reply: reply.trim() }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // Claude integration path
    const claudeUrl = process.env.CLAUDE_API_URL;
    if (claudeUrl) {
      const base = claudeUrl.replace(/\/$/, "");
      const endpoint = base.includes("/v1/") ? base : `${base}/v1/messages`;

      const claudeRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.CLAUDE_API_KEY ? { "x-api-key": process.env.CLAUDE_API_KEY } : {}),
        },
        body: JSON.stringify({
          model: "claude-3.5-mini", // adjust to your available model ID
          messages: [
            { role: "system", content: "You are a helpful educational assistant about Indian government initiatives, including Dhanik Bharat." },
            { role: "user", content: message },
          ],
          max_tokens_to_sample: 800,
          temperature: 0.7,
        }),
      });

      const claudeData = await claudeRes.json();
      if (!claudeRes.ok) {
        return new Response(JSON.stringify({ error: claudeData.error || claudeData }), { status: claudeRes.status });
      }

      const choices = claudeData?.choices || [];
      const firstMessage = choices?.[0]?.message || choices?.[0]?.content;
      const replyText =
        (firstMessage?.content && typeof firstMessage.content === "string" ? firstMessage.content : null) ||
        (Array.isArray(firstMessage?.content) ? firstMessage.content.map((item: any) => item.text || item.content || "").join(" ") : null) ||
        claudeData?.completion || claudeData?.output?.[0]?.content || claudeData?.message?.content || "";

      if (!replyText) {
        return new Response(JSON.stringify({ error: "No answer returned from Claude" }), { status: 500 });
      }

      return new Response(JSON.stringify({ reply: replyText.trim() }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // Fallback to OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), { status: 500 });
    }

    const response = await openai.responses.create({
      model: "gpt-3.5-turbo",
      input: [
        {
          role: "system",
          content: `You are an intelligent educational assistant specializing in financial literacy and government initiatives in India. You have extensive knowledge about various government schemes and financial programs.

When asked about "Dhanik Bharat" or similar queries, provide comprehensive details.
Always be conversational, factual, and clear.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = response.output?.map((o: any) => o.content).join(" ") || response.output_text;

    if (!reply) {
      console.error("No reply from OpenAI response:", response);
      return new Response(JSON.stringify({ error: "No response generated from OpenAI" }), { status: 500 });
    }

    return new Response(JSON.stringify({ reply }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Chat API error:", error);
    const msg = error?.message || "Internal server error";
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}