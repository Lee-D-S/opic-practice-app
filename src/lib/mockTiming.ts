import type { MockExamAnswer, MockExamResult } from "./types";

export type MockTimingSummary = {
  averageElapsedSeconds: number | null;
  overRecommendedCount: number;
  ratedAnswerCount: number;
  timedAnswerCount: number;
  totalElapsedSeconds: number;
  veryShortCount: number;
};

export type MockTimingTrend = {
  averageElapsedSeconds: number | null;
  averageOverRecommendedCount: number;
  averageVeryShortCount: number;
  latest: MockTimingSummary | null;
  previous: MockTimingSummary | null;
};

export function summarizeMockTiming(
  answers: MockExamAnswer[],
): MockTimingSummary {
  const ratedAnswers = answers.filter((answer) => !answer.isWarmup);
  const timedAnswers = ratedAnswers.filter(
    (answer) => typeof answer.elapsedSeconds === "number",
  );
  const totalElapsedSeconds = timedAnswers.reduce(
    (sum, answer) => sum + (answer.elapsedSeconds ?? 0),
    0,
  );
  const averageElapsedSeconds =
    timedAnswers.length > 0
      ? Math.round(totalElapsedSeconds / timedAnswers.length)
      : null;
  const overRecommendedCount = timedAnswers.filter(
    (answer) => (answer.elapsedSeconds ?? 0) > answer.metrics.answerSeconds,
  ).length;
  const veryShortCount = timedAnswers.filter(
    (answer) =>
      (answer.elapsedSeconds ?? 0) <
      Math.max(20, answer.metrics.answerSeconds * 0.35),
  ).length;

  return {
    averageElapsedSeconds,
    overRecommendedCount,
    ratedAnswerCount: ratedAnswers.length,
    timedAnswerCount: timedAnswers.length,
    totalElapsedSeconds,
    veryShortCount,
  };
}

export function buildMockTimingTrend(
  results: MockExamResult[],
): MockTimingTrend {
  const summaries = results
    .map((result) => summarizeMockTiming(result.answers))
    .filter((summary) => summary.timedAnswerCount > 0);
  const recent = summaries.slice(0, 3);

  if (recent.length === 0) {
    return {
      averageElapsedSeconds: null,
      averageOverRecommendedCount: 0,
      averageVeryShortCount: 0,
      latest: null,
      previous: null,
    };
  }

  return {
    averageElapsedSeconds: average(
      recent.map((summary) => summary.averageElapsedSeconds ?? 0),
    ),
    averageOverRecommendedCount: average(
      recent.map((summary) => summary.overRecommendedCount),
    ),
    averageVeryShortCount: average(
      recent.map((summary) => summary.veryShortCount),
    ),
    latest: recent[0],
    previous: recent[1] ?? null,
  };
}

function average(values: number[]) {
  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}
