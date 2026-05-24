import type {
  LearningPathStepId,
  MockExamResult,
  PracticeAttempt,
} from "./types";

export type WeaknessCategory =
  | "short_answer"
  | "specific_examples"
  | "roleplay"
  | "time_over"
  | "time_short"
  | "structure"
  | "grammar_accuracy"
  | "vocabulary"
  | "tense"
  | "comparison"
  | "fluency";

export type WeaknessInsight = {
  category: WeaknessCategory;
  count: number;
  labelKo: string;
  recommendedStepId: LearningPathStepId;
  reasonKo: string;
};

type WeaknessDefinition = {
  category: WeaknessCategory;
  labelKo: string;
  recommendedStepId: LearningPathStepId;
  reasonKo: string;
  patterns: RegExp[];
};

const definitions: WeaknessDefinition[] = [
  {
    category: "roleplay",
    labelKo: "역할극 요청/문제 해결",
    recommendedStepId: "roleplay_focus",
    reasonKo: "역할극에서 요청, 문제 설명, 대안 제시가 반복 약점으로 나타납니다.",
    patterns: [/role[- ]?play/i, /역할극|요청|대안|문제 설명|문제 해결/],
  },
  {
    category: "time_over",
    labelKo: "답변 시간 초과",
    recommendedStepId: "weakness_review",
    reasonKo: "권장 답변 시간을 넘기는 패턴이 반복됩니다.",
    patterns: [/초과|넘긴|시간.*길|over/i],
  },
  {
    category: "time_short",
    labelKo: "너무 짧은 답변",
    recommendedStepId: "weakness_review",
    reasonKo: "답변이 짧게 끝나는 패턴이 반복됩니다.",
    patterns: [/매우 짧|지나치게 짧|짧은 답변|답변.*짧|short answer/i],
  },
  {
    category: "specific_examples",
    labelKo: "구체 예시 부족",
    recommendedStepId: "core_practice",
    reasonKo: "구체적인 경험, 예시, 세부 정보가 부족하다는 피드백이 반복됩니다.",
    patterns: [/구체|예시|경험|세부|detail|specific/i],
  },
  {
    category: "structure",
    labelKo: "답변 구조 부족",
    recommendedStepId: "core_practice",
    reasonKo: "시간 순서, 이유, 결론 같은 답변 구조 보완이 반복적으로 필요합니다.",
    patterns: [/구조|순서|정리|이유|결론|흐름|연결|조직|structure/i],
  },
  {
    category: "short_answer",
    labelKo: "발화량 부족",
    recommendedStepId: "core_practice",
    reasonKo: "개별 연습에서 충분한 발화량을 만들지 못한 기록이 반복됩니다.",
    patterns: [/발화|단어 수|충분히 말|word count/i],
  },
  {
    category: "grammar_accuracy",
    labelKo: "문법/정확도",
    recommendedStepId: "feedback_loop",
    reasonKo: "문법, 어순, 관사, 전치사 같은 정확도 피드백이 반복됩니다.",
    patterns: [/문법|정확|관사|전치사|어순|accuracy|grammar/i],
  },
  {
    category: "vocabulary",
    labelKo: "어휘 다양성",
    recommendedStepId: "answer_materials",
    reasonKo: "어휘와 표현이 반복되거나 다양성이 부족하다는 피드백이 반복됩니다.",
    patterns: [/어휘|표현 다양|단어 반복|표현이 반복|vocabulary|expression/i],
  },
  {
    category: "tense",
    labelKo: "시제 사용",
    recommendedStepId: "feedback_loop",
    reasonKo: "과거 경험, 현재 습관, 미래 계획을 말할 때 시제 사용 보완이 필요합니다.",
    patterns: [/시제|과거형|현재완료|미래형|tense/i],
  },
  {
    category: "comparison",
    labelKo: "비교/대조 부족",
    recommendedStepId: "core_practice",
    reasonKo: "과거와 현재, 두 선택지의 차이를 비교하는 답변이 약점으로 나타납니다.",
    patterns: [/비교|대조|차이|과거와 현재|compare|comparison/i],
  },
  {
    category: "fluency",
    labelKo: "유창성/끊김",
    recommendedStepId: "feedback_loop",
    reasonKo: "끊김, 채움말, 말의 흐름 같은 유창성 문제가 반복됩니다.",
    patterns: [/유창|끊김|채움말|filler|pause|fluency/i],
  },
];

export function analyzeWeaknessInsights({
  attempts,
  mockResults,
  limit = 8,
}: {
  attempts: PracticeAttempt[];
  mockResults: MockExamResult[];
  limit?: number;
}): WeaknessInsight[] {
  const counts = new Map<WeaknessCategory, number>();
  const recentAttempts = attempts.slice(0, limit);
  const recentMocks = mockResults.slice(0, Math.max(1, Math.ceil(limit / 2)));

  for (const attempt of recentAttempts) {
    const text = attempt.feedback.improvementsKo.join(" ");
    addTextMatches(counts, text);

    if (attempt.firstMetrics.wordCount < 70) {
      increment(counts, "short_answer");
    }
  }

  for (const mockResult of recentMocks) {
    addTextMatches(
      counts,
      [
        ...mockResult.report.weaknessesKo,
        ...mockResult.report.recommendedPracticeKo,
        ...(mockResult.report.timingKo ?? []),
      ].join(" "),
    );
  }

  return definitions
    .map((definition) => ({
      category: definition.category,
      count: counts.get(definition.category) ?? 0,
      labelKo: definition.labelKo,
      recommendedStepId: definition.recommendedStepId,
      reasonKo: definition.reasonKo,
    }))
    .filter((insight) => insight.count > 0)
    .sort((left, right) => right.count - left.count);
}

export function getTopRepeatedWeakness(
  insights: WeaknessInsight[],
): WeaknessInsight | null {
  return insights.find((insight) => insight.count >= 2) ?? null;
}

function addTextMatches(
  counts: Map<WeaknessCategory, number>,
  text: string,
) {
  for (const definition of definitions) {
    if (definition.patterns.some((pattern) => pattern.test(text))) {
      increment(counts, definition.category);
    }
  }
}

function increment(
  counts: Map<WeaknessCategory, number>,
  category: WeaknessCategory,
) {
  counts.set(category, (counts.get(category) ?? 0) + 1);
}
