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
        recommendedStepId: "roleplay_focus",
        reasonKo: "역할극 약점",
      },
      {
        category: "structure",
        count: 2,
        labelKo: "구조",
        recommendedStepId: "core_practice",
        reasonKo: "구조 약점",
      },
    ]);

    expect(repeated?.category).toBe("structure");
  });

  it("classifies language, comparison, and fluency weaknesses separately", () => {
    const insights = analyzeWeaknessInsights({
      attempts: [
        attempt(["문법 정확도와 전치사 사용을 보완하세요."], 90),
        attempt(["과거 경험에서 시제가 흔들립니다."], 90),
        attempt(["어휘 다양성이 부족하고 같은 표현이 반복됩니다."], 90),
        attempt(["과거와 현재를 비교하는 대조 표현이 부족합니다."], 90),
        attempt(["채움말이 많고 말의 흐름이 자주 끊깁니다."], 90),
      ],
      mockResults: [],
    });

    expect(insights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "grammar_accuracy",
          recommendedStepId: "feedback_loop",
        }),
        expect.objectContaining({
          category: "tense",
          recommendedStepId: "feedback_loop",
        }),
        expect.objectContaining({
          category: "vocabulary",
          recommendedStepId: "answer_materials",
        }),
        expect.objectContaining({
          category: "comparison",
          recommendedStepId: "core_practice",
        }),
        expect.objectContaining({
          category: "fluency",
          recommendedStepId: "feedback_loop",
        }),
      ]),
    );
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
