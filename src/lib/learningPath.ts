import type {
  AnswerMaterial,
  LearningPathProgress,
  LearningPathStepId,
  MockExamResult,
  PracticeAttempt,
} from "./types";

export type LearningPathRecommendation = {
  stepId: LearningPathStepId;
  reasonKo: string;
};

export function recommendLearningPathStep({
  answerMaterials,
  attempts,
  mockResults,
  progress,
}: {
  answerMaterials: AnswerMaterial[];
  attempts: PracticeAttempt[];
  mockResults: MockExamResult[];
  progress: LearningPathProgress;
}): LearningPathRecommendation {
  if (!progress.completedStepIds.includes("orientation")) {
    return {
      stepId: "orientation",
      reasonKo: "먼저 앱의 학습 흐름과 공식/비공식 자료 구분을 확인하세요.",
    };
  }

  if (answerMaterials.length === 0) {
    return {
      stepId: "answer_materials",
      reasonKo: "선택 주제에 대해 말할 이야기, 이유, 예시가 아직 저장되지 않았습니다.",
    };
  }

  const latestAttempt = attempts[0];
  const latestMock = mockResults[0];
  const weaknessText = [
    ...(latestAttempt?.feedback.improvementsKo ?? []),
    ...(latestMock?.report.weaknessesKo ?? []),
    ...(latestMock?.report.recommendedPracticeKo ?? []),
  ].join(" ");

  if (/역할극|role[- ]?play|요청|문제 설명|대안/i.test(weaknessText)) {
    return {
      stepId: "roleplay_focus",
      reasonKo: "최근 피드백에 역할극, 요청, 문제 해결 관련 약점이 보여 역할극 집중 훈련을 추천합니다.",
    };
  }

  if (latestAttempt && latestAttempt.firstMetrics.wordCount < 70) {
    return {
      stepId: "core_practice",
      reasonKo: "최근 개별 연습 답변이 짧았습니다. 핵심 말하기 훈련에서 발화량과 예시를 늘리세요.",
    };
  }

  if (!latestMock) {
    return {
      stepId: "full_mock",
      reasonKo: "아직 저장된 전체 모의고사 결과가 없습니다. 40분 흐름을 한 번 점검하세요.",
    };
  }

  if (latestMock.report.timingKo?.some((item) => /짧게|초과|시간/i.test(item))) {
    return {
      stepId: "weakness_review",
      reasonKo: "최근 모의고사 시간 사용 피드백이 있어 약점 복습으로 답변 길이와 페이스를 조정하세요.",
    };
  }

  const firstIncomplete = firstIncompleteStep(progress);

  return {
    stepId: firstIncomplete,
    reasonKo: "최근 기록에서 뚜렷한 특정 약점은 없으므로 아직 완료하지 않은 다음 단계를 추천합니다.",
  };
}

function firstIncompleteStep(progress: LearningPathProgress): LearningPathStepId {
  const orderedSteps: LearningPathStepId[] = [
    "orientation",
    "diagnostic",
    "answer_materials",
    "core_practice",
    "feedback_loop",
    "roleplay_focus",
    "mini_mock",
    "full_mock",
    "weakness_review",
  ];

  return (
    orderedSteps.find((stepId) => !progress.completedStepIds.includes(stepId)) ??
    "weakness_review"
  );
}
