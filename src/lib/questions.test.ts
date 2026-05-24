import { describe, expect, it } from "vitest";

import {
  getSelectedBackgroundSurveyItemIds,
  questions,
  recommendQuestion,
} from "./questions";
import { defaultSettings } from "./types";

describe("questions", () => {
  it("includes dedicated practice prompts for detailed survey items", () => {
    const requiredSurveyIds = [
      "parks",
      "camping",
      "cooking",
      "걷기",
      "staycation",
      "concerts",
      "home_improvement",
      "domestic_travel",
      "overseas_travel",
      "pets",
    ];

    requiredSurveyIds.forEach((surveyId) => {
      const matchedQuestions = questions.filter((question) =>
        question.sourceSurveyIds?.includes(surveyId),
      );

      expect(matchedQuestions.length, surveyId).toBeGreaterThan(0);
      matchedQuestions.forEach((question) => {
        expect(question.sampleAnswer.trim()).not.toBe("");
        expect(question.usefulExpressions.length).toBeGreaterThan(0);
      });
    });
  });

  it("prioritizes selected detailed survey item prompts before broad tag prompts", () => {
    const question = recommendQuestion(
      "IM2",
      ["travel"],
      [],
      ["camping"],
    );

    expect(question.sourceSurveyIds).toContain("camping");
  });

  it("collects selected detailed background survey item ids from settings", () => {
    expect(getSelectedBackgroundSurveyItemIds(defaultSettings.backgroundSurvey)).toEqual(
      expect.arrayContaining(["movies", "cooking", "walking", "staycation"]),
    );
  });
});
