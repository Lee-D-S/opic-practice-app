import type {
  CoachingFeedback,
  MockExamAnswer,
  MockExamReport,
  OPIcLevel,
  Question,
} from "./types";

const geminiApiBase = "https://generativelanguage.googleapis.com/v1beta";
const defaultModel = "gemini-2.5-flash";

type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: GeminiPart[];
    };
  }[];
};

type FeedbackRequest = {
  question: Question;
  transcript: string;
  targetLevel: OPIcLevel;
  answerSeconds: number;
};

export async function generateGeminiFeedback(
  input: FeedbackRequest,
): Promise<CoachingFeedback> {
  const parsed = await callGeminiJson<CoachingFeedback>(buildFeedbackPrompt(input));

  return {
    summaryKo: parsed.summaryKo,
    strengthsKo: arrayOrEmpty(parsed.strengthsKo),
    improvementsKo: arrayOrEmpty(parsed.improvementsKo),
    nextAttemptPlanKo: arrayOrEmpty(parsed.nextAttemptPlanKo),
    usefulExpressions: arrayOrEmpty(parsed.usefulExpressions),
    estimatedLevel: normalizeLevel(parsed.estimatedLevel, input.targetLevel),
    rubric: {
      functionKo: stringOrFallback(
        parsed.rubric?.functionKo,
        "질문이 요구한 말하기 과제를 얼마나 수행했는지 기준으로 다시 점검하세요.",
      ),
      accuracyKo: stringOrFallback(
        parsed.rubric?.accuracyKo,
        "문법뿐 아니라 어휘, 유창성, 자연스러움이 이해 가능성을 뒷받침해야 합니다.",
      ),
      contentContextKo: stringOrFallback(
        parsed.rubric?.contentContextKo,
        "답변이 주제와 상황에 맞고 충분한 구체 정보를 담는지 점검하세요.",
      ),
      textTypeKo: stringOrFallback(
        parsed.rubric?.textTypeKo,
        "발화량과 조직화 수준이 목표 연습 등급에 충분한지 점검하세요.",
      ),
    },
  };
}

export async function compareGeminiAttempts(
  firstTranscript: string,
  secondTranscript: string,
): Promise<string[]> {
  const parsed = await callGeminiJson<{ comparisonKo: string[] }>(
    buildComparisonPrompt(firstTranscript, secondTranscript),
  );

  return arrayOrEmpty(parsed.comparisonKo).slice(0, 5);
}

export async function generateGeminiMockReport(input: {
  answers: MockExamAnswer[];
  targetLevel: OPIcLevel;
  durationSeconds: number;
}): Promise<MockExamReport> {
  const parsed = await callGeminiJson<MockExamReport>(buildMockReportPrompt(input));

  return {
    summaryKo: parsed.summaryKo,
    strengthsKo: arrayOrEmpty(parsed.strengthsKo),
    weaknessesKo: arrayOrEmpty(parsed.weaknessesKo),
    recommendedPracticeKo: arrayOrEmpty(parsed.recommendedPracticeKo),
    estimatedLevel: normalizeLevel(parsed.estimatedLevel, input.targetLevel),
  };
}

async function callGeminiJson<T>(prompt: string): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL ?? defaultModel;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const response = await fetch(
    `${geminiApiBase}/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.35,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorBody}`);
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return JSON.parse(stripJsonFence(text)) as T;
}

function buildFeedbackPrompt({
  question,
  transcript,
  targetLevel,
  answerSeconds,
}: FeedbackRequest) {
  return `
You are an OPIc speaking coach for Korean learners.
Evaluate the answer for the target level ${targetLevel}.

Return only valid JSON with this exact shape:
{
  "summaryKo": "Korean coaching summary",
  "rubric": {
    "functionKo": "Korean feedback on Function / task fulfillment",
    "accuracyKo": "Korean feedback on Accuracy / comprehensibility",
    "contentContextKo": "Korean feedback on Content and Context",
    "textTypeKo": "Korean feedback on Text Type"
  },
  "strengthsKo": ["Korean strength 1", "Korean strength 2"],
  "improvementsKo": ["Korean improvement 1", "Korean improvement 2", "Korean improvement 3"],
  "nextAttemptPlanKo": ["Korean action 1", "Korean action 2", "Korean action 3"],
  "usefulExpressions": ["English expression 1", "English expression 2", "English expression 3"],
  "estimatedLevel": "IM1 | IM2 | IH | AL"
}

Rules:
- Coaching must be practical and specific.
- Use official-aligned ACTFL/OPIc coaching dimensions: Function, Accuracy, Content/Context, and Text Type.
- Treat estimatedLevel as an advisory training estimate only, not an official OPIc score.
- OPIc assessment is holistic; do not present isolated point scores.
- Do not overfocus on grammar.
- Do not show a full sample answer.
- Keep Korean concise.
- usefulExpressions must be English phrases the user can reuse in the second attempt.
- estimatedLevel must be one of IM1, IM2, IH, AL.

Question:
${question.prompt}

Question type: ${question.type}
Topic: ${question.topic}
Evaluation focus: ${question.evaluationFocus.join(", ")}
Recommended answer time: ${answerSeconds} seconds

User transcript:
${transcript || "(empty answer)"}
`.trim();
}

function buildComparisonPrompt(firstTranscript: string, secondTranscript: string) {
  return `
You are an OPIc speaking coach for Korean learners.
Compare the first and second attempt.

Return only valid JSON with this exact shape:
{
  "comparisonKo": ["Korean comparison point 1", "Korean comparison point 2", "Korean comparison point 3"]
}

Focus on:
- Function: whether the second answer fulfills the task better
- Accuracy: whether it is easier to understand
- Content/Context: whether it is more relevant and specific
- Text Type: whether length and organization improved
- one concrete next action

First attempt:
${firstTranscript || "(empty answer)"}

Second attempt:
${secondTranscript || "(empty answer)"}
`.trim();
}

function buildMockReportPrompt({
  answers,
  targetLevel,
  durationSeconds,
}: {
  answers: MockExamAnswer[];
  targetLevel: OPIcLevel;
  durationSeconds: number;
}) {
  const answerBlock = answers
    .filter((answer) => !answer.isWarmup)
    .map(
      (answer, index) => `
Rated Q${index + 2}. ${answer.prompt}
Answer: ${answer.transcript || "(empty answer)"}
Words: ${answer.metrics.wordCount}
`.trim(),
    )
    .join("\n\n");

  return `
You are an OPIc speaking coach for Korean learners.
Review this OPIc-style mock exam for target level ${targetLevel}.
Question 1 is a warm-up/self-introduction response and must not be rated.
Review only the rated answers after the warm-up.

Return only valid JSON with this exact shape:
{
  "summaryKo": "Korean overall exam summary",
  "strengthsKo": ["Korean strength 1", "Korean strength 2", "Korean strength 3"],
  "weaknessesKo": ["Korean weakness 1", "Korean weakness 2", "Korean weakness 3"],
  "recommendedPracticeKo": ["Korean practice recommendation 1", "Korean practice recommendation 2", "Korean practice recommendation 3"],
  "estimatedLevel": "IM1 | IM2 | IH | AL"
}

Rules:
- Focus on OPIc speaking performance, not only grammar.
- Use official-aligned criteria: Function, Accuracy, Content/Context, and Text Type.
- Treat estimatedLevel as an advisory training estimate only, not an official OPIc score.
- OPIc assessment is holistic; do not present isolated point scores.
- Do not use the warm-up response to lower or raise the advisory estimated level.
- Be direct but practical.
- Keep Korean concise.
- estimatedLevel must be one of IM1, IM2, IH, AL.

Total exam duration: ${durationSeconds} seconds

Answers:
${answerBlock}
`.trim();
}

function stripJsonFence(text: string) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function arrayOrEmpty(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function stringOrFallback(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function normalizeLevel(value: unknown, fallback: OPIcLevel): OPIcLevel {
  return value === "IM1" || value === "IM2" || value === "IH" || value === "AL"
    ? value
    : fallback;
}
