import { describe, expect, it, vi } from "vitest";
import { questions } from "@/lib/questions";

vi.mock("@/lib/gemini", () => ({
  generateGeminiFeedback: vi.fn(async () => {
    throw new Error("Gemini unavailable");
  }),
}));

describe("feedback route fallback", () => {
  it("returns local provider when Gemini feedback fails", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          question: questions[0],
          transcript: "I usually watch comedy movies because they help me relax on weekends.",
          targetLevel: "IM2",
          answerSeconds: 90,
        }),
      }),
    );
    const body = await response.json();

    expect(body.provider).toBe("local");
    expect(body.feedback.summaryKo).toBeTruthy();
    expect(body.feedback.rubric.functionKo).toBeTruthy();
  });
});
