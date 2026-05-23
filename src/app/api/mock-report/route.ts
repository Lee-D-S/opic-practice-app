import { NextResponse } from "next/server";
import { generateGeminiMockReport } from "@/lib/gemini";
import type { MockExamAnswer, MockExamReport, OPIcLevel } from "@/lib/types";

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

function buildLocalMockReport(body: MockReportBody): MockExamReport {
  const ratedAnswers = body.answers.filter((answer) => !answer.isWarmup);
  const answered = ratedAnswers.filter((answer) => answer.transcript.trim());
  const totalWords = ratedAnswers.reduce(
    (sum, answer) => sum + answer.metrics.wordCount,
    0,
  );

  return {
    summaryKo: `Q1 워밍업을 제외한 평가 연습 문항 ${ratedAnswers.length}개 중 ${answered.length}문항에 답했습니다. 전체 발화량은 약 ${totalWords}단어입니다.`,
    strengthsKo: ["끝까지 모의고사 흐름을 완료했습니다.", "여러 유형의 질문에 답변을 시도했습니다."],
    weaknessesKo: ["일부 답변은 더 긴 발화와 구체적인 예시가 필요합니다.", "질문 유형별 구조를 더 분명히 연습해야 합니다."],
    recommendedPracticeKo: ["경험 질문은 시간 순서로 답하세요.", "역할극은 문제 설명과 요청을 분리해서 말하세요.", "돌발 질문은 의견-이유-예시 순서로 답하세요."],
    estimatedLevel: body.targetLevel,
  };
}
