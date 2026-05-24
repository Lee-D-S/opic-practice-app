import { describe, expect, it } from "vitest";
import {
  buildMockTimingTrend,
  summarizeMockTiming,
} from "./mockTiming";
import type { MockExamAnswer, MockExamResult } from "./types";

describe("summarizeMockTiming", () => {
  it("excludes warm-up answers and counts pacing patterns", () => {
    const summary = summarizeMockTiming([
      makeAnswer("warmup", 30, 90, true),
      makeAnswer("rated-1", 120, 90),
      makeAnswer("rated-2", 15, 90),
      makeAnswer("rated-3", undefined, 90),
    ]);

    expect(summary.ratedAnswerCount).toBe(3);
    expect(summary.timedAnswerCount).toBe(2);
    expect(summary.averageElapsedSeconds).toBe(68);
    expect(summary.overRecommendedCount).toBe(1);
    expect(summary.veryShortCount).toBe(1);
  });
});

describe("buildMockTimingTrend", () => {
  it("summarizes the latest three timed mock results", () => {
    const trend = buildMockTimingTrend([
      makeResult("latest", [makeAnswer("q1", 100, 90)]),
      makeResult("previous", [makeAnswer("q1", 80, 90)]),
      makeResult("older", [makeAnswer("q1", 60, 90)]),
      makeResult("ignored", [makeAnswer("q1", 30, 90)]),
    ]);

    expect(trend.latest?.averageElapsedSeconds).toBe(100);
    expect(trend.previous?.averageElapsedSeconds).toBe(80);
    expect(trend.averageElapsedSeconds).toBe(80);
    expect(trend.averageOverRecommendedCount).toBe(0);
  });

  it("builds chronological chart points from the latest timed mock results", () => {
    const trend = buildMockTimingTrend([
      makeResult("latest", [makeAnswer("q1", 100, 90)]),
      makeResult("previous", [makeAnswer("q1", 80, 90)]),
      makeResult("older", [makeAnswer("q1", 60, 90)]),
      makeResult("oldest", [makeAnswer("q1", 40, 90)]),
    ]);

    expect(trend.chartPoints.map((point) => point.resultId)).toEqual([
      "oldest",
      "older",
      "previous",
      "latest",
    ]);
    expect(trend.chartPoints.map((point) => point.averageElapsedSeconds)).toEqual([
      40,
      60,
      80,
      100,
    ]);
  });
});

function makeResult(id: string, answers: MockExamAnswer[]): MockExamResult {
  return {
    id,
    createdAt: new Date().toISOString(),
    targetLevel: "IM2",
    surveyTags: ["travel"],
    durationSeconds: 100,
    answers,
    report: {
      summaryKo: "summary",
      strengthsKo: [],
      weaknessesKo: [],
      recommendedPracticeKo: [],
      estimatedLevel: "IM2",
    },
  };
}

function makeAnswer(
  questionId: string,
  elapsedSeconds: number | undefined,
  answerSeconds: number,
  isWarmup = false,
): MockExamAnswer {
  return {
    questionId,
    prompt: "Prompt",
    transcript: "I answered this question with enough detail.",
    isWarmup,
    elapsedSeconds,
    metrics: {
      wordCount: 8,
      answerSeconds,
      fillerEstimate: 0,
    },
  };
}
