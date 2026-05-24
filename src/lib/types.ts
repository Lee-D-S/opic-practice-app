export type OPIcLevel = "IM1" | "IM2" | "IH" | "AL";

export type QuestionType =
  | "self_intro"
  | "description"
  | "routine"
  | "experience"
  | "comparison"
  | "problem_solving"
  | "roleplay"
  | "unexpected";

export type SurveyTag =
  | "home"
  | "work"
  | "school"
  | "movie"
  | "music"
  | "travel"
  | "exercise"
  | "food"
  | "shopping"
  | "technology"
  | "health";

export type Question = {
  id: string;
  level: OPIcLevel;
  type: QuestionType;
  topic: string;
  surveyTags: SurveyTag[];
  prompt: string;
  followUpGroupId?: string;
  difficulty: 1 | 2 | 3 | 4;
  prepTimeSec: number;
  answerTimeSec: number;
  evaluationFocus: string[];
  sampleAnswer: string;
  usefulExpressions: string[];
};

export type AppSettings = {
  targetLevel: OPIcLevel;
  surveyTags: SurveyTag[];
};

export type LearningPathStepId =
  | "orientation"
  | "diagnostic"
  | "answer_materials"
  | "core_practice"
  | "feedback_loop"
  | "roleplay_focus"
  | "mini_mock"
  | "full_mock"
  | "weakness_review";

export type LearningPathProgress = {
  completedStepIds: LearningPathStepId[];
  updatedAt?: string;
};

export type AnswerMaterial = {
  tag: SurveyTag;
  storyKo: string;
  reasonKo: string;
  exampleKo: string;
  updatedAt: string;
};

export type AttemptMetrics = {
  wordCount: number;
  answerSeconds: number;
  fillerEstimate: number;
};

export type OfficialAlignedRubric = {
  functionKo: string;
  accuracyKo: string;
  contentContextKo: string;
  textTypeKo: string;
};

export type CoachingFeedback = {
  summaryKo: string;
  strengthsKo: string[];
  improvementsKo: string[];
  nextAttemptPlanKo: string[];
  usefulExpressions: string[];
  estimatedLevel: OPIcLevel;
  rubric?: OfficialAlignedRubric;
};

export type PracticeAttempt = {
  id: string;
  questionId: string;
  createdAt: string;
  firstTranscript: string;
  secondTranscript?: string;
  firstMetrics: AttemptMetrics;
  secondMetrics?: AttemptMetrics;
  feedback: CoachingFeedback;
  comparisonKo?: string[];
};

export type MockExamAnswer = {
  questionId: string;
  prompt: string;
  transcript: string;
  metrics: AttemptMetrics;
  elapsedSeconds?: number;
  isWarmup?: boolean;
};

export type MockExamReport = {
  summaryKo: string;
  strengthsKo: string[];
  weaknessesKo: string[];
  recommendedPracticeKo: string[];
  timingKo?: string[];
  estimatedLevel: OPIcLevel;
};

export type MockExamResult = {
  id: string;
  createdAt: string;
  targetLevel: OPIcLevel;
  surveyTags: SurveyTag[];
  durationSeconds: number;
  answers: MockExamAnswer[];
  report: MockExamReport;
};

export const defaultSettings: AppSettings = {
  targetLevel: "IM2",
  surveyTags: ["movie", "travel", "food"],
};

export const defaultLearningPathProgress: LearningPathProgress = {
  completedStepIds: [],
};
