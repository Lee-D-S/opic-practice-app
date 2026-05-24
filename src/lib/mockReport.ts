import type { MockExamReport, OPIcLevel, MockExamAnswer } from "./types";

export type MockReportInput = {
  answers: MockExamAnswer[];
  targetLevel: OPIcLevel;
  durationSeconds: number;
};

export function buildLocalMockReport(body: MockReportInput): MockExamReport {
  const ratedAnswers = body.answers.filter((answer) => !answer.isWarmup);
  const answered = ratedAnswers.filter((answer) => answer.transcript.trim());
  const totalWords = ratedAnswers.reduce(
    (sum, answer) => sum + answer.metrics.wordCount,
    0,
  );
  const timingKo = buildTimingFeedback(ratedAnswers);

  return {
    summaryKo: `Q1 워밍업을 제외한 평가 연습 문항 ${ratedAnswers.length}개 중 ${answered.length}문항에 답했습니다. 전체 발화량은 약 ${totalWords}단어입니다.`,
    strengthsKo: ["끝까지 모의고사 흐름을 완료했습니다.", "여러 유형의 질문에 답변을 시도했습니다."],
    weaknessesKo: ["일부 답변은 더 긴 발화와 구체적인 예시가 필요합니다.", "질문 유형별 구조를 더 분명히 연습해야 합니다."],
    recommendedPracticeKo: ["경험 질문은 시간 순서로 답하세요.", "역할극은 문제 설명과 요청을 분리해서 말하세요.", "돌발 질문은 의견-이유-예시 순서로 답하세요."],
    timingKo,
    estimatedLevel: body.targetLevel,
  };
}

function buildTimingFeedback(ratedAnswers: MockExamAnswer[]) {
  const answersWithTiming = ratedAnswers.filter(
    (answer) => typeof answer.elapsedSeconds === "number",
  );

  if (answersWithTiming.length === 0) {
    return ["문항별 소요 시간 기록이 없어 시간 사용 분석은 제한적입니다."];
  }

  const totalElapsed = answersWithTiming.reduce(
    (sum, answer) => sum + (answer.elapsedSeconds ?? 0),
    0,
  );
  const averageElapsed = Math.round(totalElapsed / answersWithTiming.length);
  const overRecommended = answersWithTiming.filter(
    (answer) => (answer.elapsedSeconds ?? 0) > answer.metrics.answerSeconds,
  ).length;
  const veryShort = answersWithTiming.filter(
    (answer) => (answer.elapsedSeconds ?? 0) < Math.max(20, answer.metrics.answerSeconds * 0.35),
  ).length;

  return [
    `평가 문항 평균 소요 시간은 약 ${averageElapsed}초입니다.`,
    `권장 답변 시간을 넘긴 문항은 ${overRecommended}개입니다.`,
    veryShort > 0
      ? `${veryShort}개 문항은 매우 짧게 끝났습니다. 핵심 답변 후 예시를 하나 더 붙이는 연습이 필요합니다.`
      : "지나치게 짧게 끝난 문항은 많지 않습니다.",
  ];
}
