import { NextResponse } from "next/server";
import { compareGeminiAttempts } from "@/lib/gemini";
import { localCoachProvider } from "@/lib/coaching";

type CompareBody = {
  firstTranscript: string;
  secondTranscript: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as CompareBody;

  try {
    const comparison = await compareGeminiAttempts(
      body.firstTranscript,
      body.secondTranscript,
    );
    return NextResponse.json({ comparison, provider: "gemini" });
  } catch (error) {
    console.warn("Gemini comparison failed. Falling back to local coach.", error);
    const comparison = await localCoachProvider.compareAttempts(
      body.firstTranscript,
      body.secondTranscript,
    );
    return NextResponse.json({ comparison, provider: "local" });
  }
}
