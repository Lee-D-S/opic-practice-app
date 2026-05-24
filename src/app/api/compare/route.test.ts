import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/gemini", () => ({
  compareGeminiAttempts: vi.fn(async () => {
    throw new Error("Gemini unavailable");
  }),
}));

describe("compare route fallback", () => {
  it("returns local provider when Gemini comparison fails", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/compare", {
        method: "POST",
        body: JSON.stringify({
          firstTranscript: "I like movies.",
          secondTranscript: "I like movies because they help me relax after work.",
        }),
      }),
    );
    const body = await response.json();

    expect(body.provider).toBe("local");
    expect(body.comparison).toHaveLength(3);
  });
});
