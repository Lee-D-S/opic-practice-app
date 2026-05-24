import { describe, expect, it } from "vitest";
import { recommendLearningPathStep } from "./learningPath";
import type {
  AnswerMaterial,
  LearningPathProgress,
  MockExamResult,
  PracticeAttempt,
} from "./types";

describe("recommendLearningPathStep", () => {
  it("starts with orientation when it is incomplete", () => {
    const recommendation = recommendLearningPathStep({
      answerMaterials: [],
      attempts: [],
      mockResults: [],
      progress: progress([]),
    });

    expect(recommendation.stepId).toBe("orientation");
  });

  it("recommends answer materials when no topic material is saved", () => {
    const recommendation = recommendLearningPathStep({
      answerMaterials: [],
      attempts: [],
      mockResults: [],
      progress: progress(["orientation"]),
    });

    expect(recommendation.stepId).toBe("answer_materials");
  });

  it("recommends roleplay focus when recent feedback mentions roleplay weakness", () => {
    const recommendation = recommendLearningPathStep({
      answerMaterials: [material()],
      attempts: [attempt(["역할극에서 요청과 대안 제시가 더 분명해야 합니다."], 95)],
      mockResults: [],
      progress: progress(["orientation", "answer_materials"]),
    });

    expect(recommendation.stepId).toBe("roleplay_focus");
  });

  it("recommends core practice when recent answer is short", () => {
    const recommendation = recommendLearningPathStep({
      answerMaterials: [material()],
      attempts: [attempt(["구체적인 예시가 필요합니다."], 35)],
      mockResults: [],
      progress: progress(["orientation", "answer_materials"]),
    });

    expect(recommendation.stepId).toBe("core_practice");
  });

  it("recommends full mock when no mock result exists", () => {
    const recommendation = recommendLearningPathStep({
      answerMaterials: [material()],
      attempts: [attempt(["구체적인 예시가 필요합니다."], 90)],
      mockResults: [],
      progress: progress(["orientation", "answer_materials", "core_practice"]),
    });

    expect(recommendation.stepId).toBe("full_mock");
  });

  it("recommends weakness review when timing feedback exists", () => {
    const recommendation = recommendLearningPathStep({
      answerMaterials: [material()],
      attempts: [attempt(["구체적인 예시가 필요합니다."], 90)],
      mockResults: [mockResult(["권장 답변 시간을 넘긴 문항은 3개입니다."])],
      progress: progress(["orientation", "answer_materials", "core_practice"]),
    });

    expect(recommendation.stepId).toBe("weakness_review");
  });
});

function progress(completedStepIds: LearningPathProgress["completedStepIds"]) {
  return { completedStepIds };
}

function material(): AnswerMaterial {
  return {
    tag: "travel",
    storyKo: "부산 여행",
    reasonKo: "예상 밖의 경험",
    exampleKo: "작은 식당",
    updatedAt: "2026-05-24T00:00:00.000Z",
  };
}

function attempt(improvementsKo: string[], wordCount: number): PracticeAttempt {
  return {
    id: "attempt-1",
    questionId: "q1",
    createdAt: "2026-05-24T00:00:00.000Z",
    firstTranscript: "short answer",
    firstMetrics: {
      wordCount,
      answerSeconds: 90,
      fillerEstimate: 0,
    },
    feedback: {
      summaryKo: "요약",
      strengthsKo: [],
      improvementsKo,
      nextAttemptPlanKo: [],
      usefulExpressions: [],
      estimatedLevel: "IM2",
    },
  };
}

function mockResult(timingKo: string[]): MockExamResult {
  return {
    id: "mock-1",
    createdAt: "2026-05-24T00:00:00.000Z",
    targetLevel: "IM2",
    surveyTags: ["travel"],
    durationSeconds: 2400,
    answers: [],
    report: {
      summaryKo: "요약",
      strengthsKo: [],
      weaknessesKo: [],
      recommendedPracticeKo: [],
      timingKo,
      estimatedLevel: "IM2",
    },
  };
}
