"use client";

import type {
  CoachingFeedback,
  MockExamAnswer,
  MockExamReport,
  OPIcLevel,
  Question,
} from "./types";

type FeedbackResponse = {
  feedback: CoachingFeedback;
  provider: "gemini" | "local";
};

type CompareResponse = {
  comparison: string[];
  provider: "gemini" | "local";
};

type MockReportResponse = {
  report: MockExamReport;
  provider: "gemini" | "local";
};

export async function requestFeedback(input: {
  question: Question;
  transcript: string;
  targetLevel: OPIcLevel;
  answerSeconds: number;
}): Promise<FeedbackResponse> {
  const response = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to request feedback.");
  }

  return response.json() as Promise<FeedbackResponse>;
}

export async function requestComparison(input: {
  firstTranscript: string;
  secondTranscript: string;
}): Promise<CompareResponse> {
  const response = await fetch("/api/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to request comparison.");
  }

  return response.json() as Promise<CompareResponse>;
}

export async function requestMockReport(input: {
  answers: MockExamAnswer[];
  targetLevel: OPIcLevel;
  durationSeconds: number;
}): Promise<MockReportResponse> {
  const response = await fetch("/api/mock-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to request mock report.");
  }

  return response.json() as Promise<MockReportResponse>;
}
