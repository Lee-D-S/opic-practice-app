import { NextResponse } from "next/server";
import { generateGeminiFeedback } from "@/lib/gemini";
import { localCoachProvider } from "@/lib/coaching";
import type { OPIcLevel, Question } from "@/lib/types";

type FeedbackBody = {
  question: Question;
  transcript: string;
  targetLevel: OPIcLevel;
  answerSeconds: number;
};

export async function POST(request: Request) {
  const body = (await request.json()) as FeedbackBody;

  try {
    const feedback = await generateGeminiFeedback(body);
    return NextResponse.json({ feedback, provider: "gemini" });
  } catch (error) {
    console.warn("Gemini feedback failed. Falling back to local coach.", error);
    const feedback = await localCoachProvider.generateFeedback(body);
    return NextResponse.json({ feedback, provider: "local" });
  }
}
