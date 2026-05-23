import type { CoachingFeedback, OPIcLevel, Question } from "./types";

type FeedbackInput = {
  question: Question;
  transcript: string;
  targetLevel: OPIcLevel;
  answerSeconds: number;
};

export interface AIProvider {
  generateFeedback(input: FeedbackInput): Promise<CoachingFeedback>;
  compareAttempts(firstTranscript: string, secondTranscript: string): Promise<string[]>;
}

export function measureTranscript(transcript: string, answerSeconds: number) {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const fillerEstimate = (transcript.match(/\b(um|uh|like|you know)\b/gi) ?? []).length;

  return {
    wordCount: words.length,
    answerSeconds,
    fillerEstimate,
  };
}

export const localCoachProvider: AIProvider = {
  async generateFeedback({ question, transcript, targetLevel, answerSeconds }) {
    const metrics = measureTranscript(transcript, answerSeconds);
    const isShort = metrics.wordCount < minimumWordsForLevel(targetLevel);
    const hasDetail = /\b(last|when|because|for example|first|then|finally|recently)\b/i.test(transcript);

    return {
      summaryKo: isShort
        ? "답변이 아직 목표 등급에 비해 짧습니다. 다음 답변에서는 구체적인 상황 하나를 정해서 더 길게 전개하세요."
        : "질문에 대한 기본 답변은 형성되었습니다. 다음 단계는 더 구체적인 예시와 자연스러운 연결입니다.",
      strengthsKo: [
        transcript.trim()
          ? "질문에 대해 즉시 말하기를 시도했습니다."
          : "아직 답변 텍스트가 없습니다. 먼저 짧게라도 말하는 것이 우선입니다.",
        hasDetail ? "경험이나 이유를 붙이려는 흐름이 보입니다." : "핵심 주제는 유지하고 있습니다.",
      ],
      improvementsKo: [
        isShort ? "답변 길이를 늘려 목표 등급의 발화량에 맞추세요." : "답변 중간에 구체적인 사건을 하나 더 넣으세요.",
        "시작-상황-구체 예시-마무리 순서가 들리도록 구조를 분명히 하세요.",
        question.evaluationFocus[0] ? `${question.evaluationFocus[0]} 항목이 더 명확히 드러나야 합니다.` : "질문 유형에 맞는 핵심 정보를 먼저 말하세요.",
      ],
      rubric: {
        functionKo: question.evaluationFocus[0]
          ? `질문의 핵심 과제인 ${question.evaluationFocus[0]} 수행을 더 분명히 보여줘야 합니다.`
          : "질문이 요구한 말하기 과제를 직접 수행하는 답변이 필요합니다.",
        accuracyKo: "문법만이 아니라 어휘, 연결, 유창성이 전체 이해 가능성을 뒷받침해야 합니다.",
        contentContextKo: hasDetail
          ? "주제와 관련된 이유나 경험을 붙이려는 시도가 있습니다."
          : "상황, 장소, 사람, 감정 같은 구체 정보가 부족합니다.",
        textTypeKo: isShort
          ? "현재 발화량은 목표 등급 연습용 답변으로는 짧습니다."
          : "기본 발화량은 형성되었고, 문장 간 연결을 더 강화하면 좋습니다.",
      },
      nextAttemptPlanKo: [
        "첫 문장은 질문을 직접 받아서 답하세요.",
        "중간에는 시간, 장소, 사람, 감정 중 최소 두 가지를 넣으세요.",
        "마지막 문장은 왜 그 경험이 중요했는지 정리하세요.",
      ],
      usefulExpressions: question.usefulExpressions,
      estimatedLevel: isShort ? lowerLevel(targetLevel) : targetLevel,
    };
  },

  async compareAttempts(firstTranscript, secondTranscript) {
    const firstWords = firstTranscript.trim().split(/\s+/).filter(Boolean).length;
    const secondWords = secondTranscript.trim().split(/\s+/).filter(Boolean).length;
    const delta = secondWords - firstWords;

    return [
      delta > 8
        ? `두 번째 답변이 ${delta}단어 더 길어져 발화량이 개선되었습니다.`
        : "두 번째 답변의 발화량 개선은 아직 크지 않습니다.",
      /\b(because|for example|when|then|in the end)\b/i.test(secondTranscript)
        ? "두 번째 답변에는 이유나 흐름을 연결하는 표현이 더 잘 보입니다."
        : "다음 재답변에서는 because, for example, in the end 같은 연결 표현을 넣으세요.",
      "다음 연습에서는 같은 구조를 유지하되 디테일을 하나 더 추가하세요.",
    ];
  },
};

function minimumWordsForLevel(level: OPIcLevel) {
  return {
    IM1: 55,
    IM2: 85,
    IH: 120,
    AL: 140,
  }[level];
}

function lowerLevel(level: OPIcLevel): OPIcLevel {
  return {
    IM1: "IM1",
    IM2: "IM1",
    IH: "IM2",
    AL: "IH",
  }[level] as OPIcLevel;
}
