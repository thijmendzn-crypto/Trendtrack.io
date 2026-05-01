import { NextRequest, NextResponse } from "next/server";
import { getActorId, UnauthorizedError } from "@/app/lib/auth";
import { shops, signals } from "@/app/lib/demo-data";
import type { AssistantResponse } from "@/app/lib/types";

export const dynamic = "force-dynamic";

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
};

type GroqChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function assistantContext(prompt: string) {
  return `User question: ${prompt}\n\nAvailable shops:\n${shops
    .map((shop) => `${shop.name}: ${shop.category}, ${shop.monthlyVisits} visits, ${shop.metaAds} Meta ads. ${shop.insight}`)
    .join("\n")}`;
}

function localAssistant(prompt: string): string {
  const input = prompt.toLowerCase();
  const topShop = shops[0];
  const topSignal = signals[0];

  if (input.includes("email") || input.includes("milled")) {
    return `Start with ${topShop.name}: it has active paid momentum and enough product depth for email research. Pull the newest Milled-style drops, group them by offer, then compare subject lines against Meta ad hooks. First test: discount-led email versus routine-led email.`;
  }

  if (input.includes("ad") || input.includes("creative")) {
    return `${topShop.name} is the best ad target right now. Meta ads are climbing, traffic is still healthy, and the winning pattern is product-in-use creative. Build three hooks: problem proof, routine demo, and comparison against a boring alternative.`;
  }

  if (input.includes("shop") || input.includes("store")) {
    return `Rank ${topShop.name} first, then Obvious Golf Co. ${topShop.name} has stronger traffic and better ad trend consistency. Use the table to inspect products, save the shop, then ask for an outreach or launch plan.`;
  }

  return `${topSignal.name} is still the strongest opportunity. The current app has shop signals, product thumbnails, ad previews and email creative slots. Next move: connect real data sources, then let the assistant summarize winning angles per shop.`;
}

function extractOpenAIText(payload: OpenAIResponse) {
  if (payload.output_text) return payload.output_text;

  return (
    payload.output
      ?.flatMap((item) => item.content || [])
      .map((content) => content.text || "")
      .join("\n")
      .trim() || ""
  );
}

async function runOpenAI(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.1-mini",
      instructions:
        "You are the in-app AI assistant for an ecommerce trend intelligence SaaS. Be concise, practical, and focus on shops, ads, email campaigns, products, and launch actions.",
      input: assistantContext(prompt),
    }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as OpenAIResponse;
  return extractOpenAIText(payload);
}

async function runGroq(prompt: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are the in-app AI assistant for an ecommerce trend intelligence SaaS. Be concise, practical, and focus on shops, ads, email campaigns, products, and launch actions.",
        },
        {
          role: "user",
          content: assistantContext(prompt),
        },
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as GroqChatResponse;
  return payload.choices?.[0]?.message?.content?.trim() || null;
}

export async function POST(request: NextRequest) {
  try {
    await getActorId();
    const body = (await request.json()) as { prompt?: string };
    const prompt = String(body.prompt || "").trim();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const groqText = await runGroq(prompt);
    const openAIText = groqText ? null : await runOpenAI(prompt);
    const response: AssistantResponse = {
      message: {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: groqText || openAIText || localAssistant(prompt),
      },
      suggestions: ["Analyze this shop", "Find winning email angles", "Write outreach copy"],
      source: groqText ? "groq" : openAIText ? "openai" : "local",
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    throw error;
  }
}
