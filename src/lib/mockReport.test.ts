import { describe, expect, it } from "vitest";
import { buildLocalMockReport } from "./mockReport";
import type { MockExamAnswer } from "./types";

describe("buildLocalMockReport", () => {
  it("excludes warm-up answers from rated counts and word totals", () => {
    const report = buildLocalMockReport({
      targetLevel: "IH",
      durationSeconds: 300,
      answers: [
        makeAnswer("warmup", "This warm up should not count", 6, true),
        makeAnswer("rated-1", "I went to Busan with my friends", 7, false, 120),
        makeAnswer("rated-2", "", 0, false, 10),
      ],
    });

    expect(report.summaryKo).toContain("평가 연습 문항 2개 중 1문항");
    expect(report.summaryKo).toContain("약 7단어");
    expect(report.estimatedLevel).toBe("IH");
    expect(report.timingKo).toContain("평가 문항 평균 소요 시간은 약 65초입니다.");
    expect(report.timingKo).toContain("권장 답변 시간을 넘긴 문항은 1개입니다.");
  });
});

function makeAnswer(
  questionId: string,
  transcript: string,
  wordCount: number,
  isWarmup = false,
  elapsedSeconds?: number,
): MockExamAnswer {
  return {
    questionId,
    prompt: "Prompt",
    transcript,
    isWarmup,
    metrics: {
      wordCount,
      answerSeconds: 90,
      fillerEstimate: 0,
    },
    elapsedSeconds,
  };
}
