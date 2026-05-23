import { NextResponse } from "next/server";
import { generateGeminiMockReport } from "@/lib/gemini";
import { buildLocalMockReport } from "@/lib/mockReport";
import type { MockExamAnswer, OPIcLevel } from "@/lib/types";

type MockReportBody = {
  answers: MockExamAnswer[];
  targetLevel: OPIcLevel;
  durationSeconds: number;
};

export async function POST(request: Request) {
  const body = (await request.json()) as MockReportBody;

  try {
    const report = await generateGeminiMockReport(body);
    return NextResponse.json({ report, provider: "gemini" });
  } catch (error) {
    console.warn("Gemini mock report failed. Falling back to local report.", error);
    const report = buildLocalMockReport(body);
    return NextResponse.json({ report, provider: "local" });
  }
}
