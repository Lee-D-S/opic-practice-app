import { describe, expect, it } from "vitest";
import {
  analyzeWeaknessInsights,
  getTopRepeatedWeakness,
} from "./weaknessInsights";
import type { MockExamResult, PracticeAttempt } from "./types";

describe("analyzeWeaknessInsights", () => {
  it("counts repeated weaknesses across attempts and mock reports", () => {
    const insights = analyzeWeaknessInsights({
      attempts: [
        attempt(["구체적인 예시가 더 필요합니다."], 55),
        attempt(["경험을 더 구체적으로 말해 주세요."], 80),
      ],
      mockResults: [
        mockResult({
          weaknessesKo: ["역할극에서 요청 표현이 약합니다."],
          recommendedPracticeKo: ["구체 예시를 하나 더 붙이세요."],
          timingKo: ["권장 답변 시간을 넘긴 문항은 2개입니다."],
        }),
      ],
    });

    expect(insights[0]).toMatchObject({
      category: "specific_examples",
      count: 3,
    });
    expect(insights.some((insight) => insight.category === "short_answer")).toBe(true);
    expect(insights.some((insight) => insight.category === "roleplay")).toBe(true);
    expect(insights.some((insight) => insight.category === "time_over")).toBe(true);
  });

  it("returns only repeated weakness as top priority", () => {
    const repeated = getTopRepeatedWeakness([
      {
        category: "roleplay",
        count: 1,
        labelKo: "역할극",
        reasonKo: "역할극 약점",
      },
      {
        category: "structure",
        count: 2,
        labelKo: "구조",
        reasonKo: "구조 약점",
      },
    ]);

    expect(repeated?.category).toBe("structure");
  });
});

function attempt(improvementsKo: string[], wordCount: number): PracticeAttempt {
  return {
    id: crypto.randomUUID(),
    questionId: "q1",
    createdAt: new Date().toISOString(),
    firstTranscript: "answer",
    firstMetrics: {
      wordCount,
      answerSeconds: 90,
      fillerEstimate: 0,
    },
    feedback: {
      summaryKo: "summary",
      strengthsKo: [],
      improvementsKo,
      nextAttemptPlanKo: [],
      usefulExpressions: [],
      estimatedLevel: "IM2",
    },
  };
}

function mockResult({
  weaknessesKo,
  recommendedPracticeKo,
  timingKo,
}: {
  weaknessesKo: string[];
  recommendedPracticeKo: string[];
  timingKo: string[];
}): MockExamResult {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    targetLevel: "IM2",
    surveyTags: ["travel"],
    durationSeconds: 100,
    answers: [],
    report: {
      summaryKo: "summary",
      strengthsKo: [],
      weaknessesKo,
      recommendedPracticeKo,
      timingKo,
      estimatedLevel: "IM2",
    },
  };
}
