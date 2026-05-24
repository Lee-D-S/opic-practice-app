import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/gemini", () => ({
  generateGeminiMockReport: vi.fn(async () => {
    throw new Error("Gemini unavailable");
  }),
}));

describe("mock report route fallback", () => {
  it("returns local provider and excludes warm-up answers when Gemini fails", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/mock-report", {
        method: "POST",
        body: JSON.stringify({
          targetLevel: "IH",
          durationSeconds: 300,
          answers: [
            makeAnswer("warmup", "This warm up should not count", 6, true),
            makeAnswer("rated-1", "I went to Busan with my friends", 7),
            makeAnswer("rated-2", "", 0),
          ],
        }),
      }),
    );
    const body = await response.json();

    expect(body.provider).toBe("local");
    expect(body.report.summaryKo).toContain("평가 연습 문항 2개 중 1문항");
    expect(body.report.summaryKo).toContain("약 7단어");
    expect(body.report.estimatedLevel).toBe("IH");
  });
});

function makeAnswer(
  questionId: string,
  transcript: string,
  wordCount: number,
  isWarmup = false,
) {
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
  };
}
