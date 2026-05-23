// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
  loadAnswerMaterials,
  loadAttempts,
  loadLearningPathProgress,
  loadMockResults,
  loadSettings,
  saveAnswerMaterials,
  saveAttempt,
  saveLearningPathProgress,
  saveMockResult,
  saveSettings,
} from "./storage";
import type {
  AnswerMaterial,
  AppSettings,
  MockExamResult,
  PracticeAttempt,
} from "./types";

beforeEach(() => {
  window.localStorage.clear();
});

describe("settings storage", () => {
  it("returns defaults when settings are missing or malformed", () => {
    expect(loadSettings().targetLevel).toBe("IM2");

    window.localStorage.setItem("opic.settings.v1", "{bad json");

    expect(loadSettings().surveyTags).toEqual(["movie", "travel", "food"]);
  });

  it("saves and loads settings", () => {
    const settings: AppSettings = {
      targetLevel: "IH",
      surveyTags: ["work", "technology"],
    };

    saveSettings(settings);

    expect(loadSettings()).toEqual(settings);
  });
});

describe("practice attempt storage", () => {
  it("prepends attempts and caps saved history at 50", () => {
    for (let index = 0; index < 55; index += 1) {
      saveAttempt(makeAttempt(`${index}`));
    }

    const attempts = loadAttempts();

    expect(attempts).toHaveLength(50);
    expect(attempts[0].id).toBe("54");
    expect(attempts[49].id).toBe("5");
  });
});

describe("mock result storage", () => {
  it("prepends mock results and caps saved history at 20", () => {
    for (let index = 0; index < 25; index += 1) {
      saveMockResult(makeMockResult(`${index}`));
    }

    const results = loadMockResults();

    expect(results).toHaveLength(20);
    expect(results[0].id).toBe("24");
    expect(results[19].id).toBe("5");
  });
});

describe("learning path storage", () => {
  it("saves learning path progress", () => {
    saveLearningPathProgress({
      completedStepIds: ["orientation", "answer_materials"],
      updatedAt: "2026-05-24T00:00:00.000Z",
    });

    expect(loadLearningPathProgress().completedStepIds).toEqual([
      "orientation",
      "answer_materials",
    ]);
  });

  it("saves answer materials", () => {
    const materials: AnswerMaterial[] = [
      {
        tag: "travel",
        storyKo: "부산 여행",
        reasonKo: "예상 밖의 경험",
        exampleKo: "작은 식당 발견",
        updatedAt: "2026-05-24T00:00:00.000Z",
      },
    ];

    saveAnswerMaterials(materials);

    expect(loadAnswerMaterials()).toEqual(materials);
  });
});

function makeAttempt(id: string): PracticeAttempt {
  return {
    id,
    questionId: "q1",
    createdAt: "2026-05-24T00:00:00.000Z",
    firstTranscript: "I went to Busan with my friends.",
    firstMetrics: {
      wordCount: 7,
      answerSeconds: 90,
      fillerEstimate: 0,
    },
    feedback: {
      summaryKo: "요약",
      strengthsKo: [],
      improvementsKo: [],
      nextAttemptPlanKo: [],
      usefulExpressions: [],
      estimatedLevel: "IM2",
    },
  };
}

function makeMockResult(id: string): MockExamResult {
  return {
    id,
    createdAt: "2026-05-24T00:00:00.000Z",
    targetLevel: "IM2",
    surveyTags: ["travel"],
    durationSeconds: 120,
    answers: [],
    report: {
      summaryKo: "요약",
      strengthsKo: [],
      weaknessesKo: [],
      recommendedPracticeKo: [],
      estimatedLevel: "IM2",
    },
  };
}
