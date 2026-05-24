"use client";

import {
  AnswerMaterial,
  AppSettings,
  defaultLearningPathProgress,
  LearningPathProgress,
  MockExamResult,
  defaultSettings,
  PracticeAttempt,
} from "./types";

const settingsKey = "opic.settings.v1";
const attemptsKey = "opic.practiceAttempts.v1";
const mockResultsKey = "opic.mockResults.v1";
const learningPathKey = "opic.learningPath.v1";
const answerMaterialsKey = "opic.answerMaterials.v1";

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  const raw = window.localStorage.getItem(settingsKey);
  if (!raw) {
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const selectedTags = parsed.backgroundSurvey?.selectedTags ?? parsed.surveyTags;

    return {
      ...defaultSettings,
      ...parsed,
      surveyTags: parsed.surveyTags ?? selectedTags ?? defaultSettings.surveyTags,
      backgroundSurvey: {
        ...defaultSettings.backgroundSurvey,
        ...parsed.backgroundSurvey,
        selectedTags:
          selectedTags ?? defaultSettings.backgroundSurvey.selectedTags,
      },
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings) {
  window.localStorage.setItem(settingsKey, JSON.stringify(settings));
}

export function loadAttempts(): PracticeAttempt[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(attemptsKey);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as PracticeAttempt[];
  } catch {
    return [];
  }
}

export function saveAttempt(attempt: PracticeAttempt) {
  const attempts = loadAttempts();
  window.localStorage.setItem(attemptsKey, JSON.stringify([attempt, ...attempts].slice(0, 50)));
}

export function loadMockResults(): MockExamResult[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(mockResultsKey);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as MockExamResult[];
  } catch {
    return [];
  }
}

export function saveMockResult(result: MockExamResult) {
  const results = loadMockResults();
  window.localStorage.setItem(mockResultsKey, JSON.stringify([result, ...results].slice(0, 20)));
}

export function loadLearningPathProgress(): LearningPathProgress {
  if (typeof window === "undefined") {
    return defaultLearningPathProgress;
  }

  const raw = window.localStorage.getItem(learningPathKey);
  if (!raw) {
    return defaultLearningPathProgress;
  }

  try {
    return {
      ...defaultLearningPathProgress,
      ...JSON.parse(raw),
    };
  } catch {
    return defaultLearningPathProgress;
  }
}

export function saveLearningPathProgress(progress: LearningPathProgress) {
  window.localStorage.setItem(learningPathKey, JSON.stringify(progress));
}

export function loadAnswerMaterials(): AnswerMaterial[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(answerMaterialsKey);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as AnswerMaterial[];
  } catch {
    return [];
  }
}

export function saveAnswerMaterials(materials: AnswerMaterial[]) {
  window.localStorage.setItem(answerMaterialsKey, JSON.stringify(materials));
}
