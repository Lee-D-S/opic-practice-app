// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ""} />;
  },
}));

class TestSpeechSynthesisUtterance {
  lang = "";
  rate = 1;
  onend: (() => void) | null = null;

  constructor(public text: string) {}
}

describe("DS Interviewer prompt UI", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();

    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      value: TestSpeechSynthesisUtterance,
    });
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        cancel: vi.fn(),
        speak: vi.fn((utterance: TestSpeechSynthesisUtterance) => {
          utterance.onend?.();
        }),
      },
    });
  });

  it("keeps practice prompt text hidden until the learner reveals it", async () => {
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: "개별 연습" }));

    expect(await screen.findByText("질문 텍스트가 숨겨져 있습니다.")).toBeTruthy();
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "질문 듣기" }).disabled).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "질문 듣기" }));

    expect(vi.mocked(window.speechSynthesis.speak)).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "질문 텍스트 보기" }));

    expect(
      screen.getByText(/Tell me about how you usually spend time at parks/i),
    ).toBeTruthy();
  });

  it("limits mock prompt playback to one listen", async () => {
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: "모의고사" }));
    fireEvent.click(await screen.findByRole("button", { name: "오리엔테이션으로 이동" }));
    fireEvent.click(screen.getByRole("button", { name: "40분 모의고사 시작" }));

    const playButton = await screen.findByRole("button", { name: "질문 듣기" });

    fireEvent.click(playButton);

    await waitFor(() => {
      expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1);
      expect(screen.getByText("남은 듣기 0회")).toBeTruthy();
    });

    expect(screen.getByRole<HTMLButtonElement>("button", { name: "다시 듣기" }).disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "질문 텍스트 보기" }));

    expect(screen.getByText(/Warm-up: Tell me something about yourself/i)).toBeTruthy();
  });
});
