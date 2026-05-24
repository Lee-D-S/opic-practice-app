"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  buildMockExamQuestions,
  backgroundSurveySections,
  courseExperienceOptions,
  levelDescriptions,
  questions,
  recommendQuestion,
  residenceOptions,
  schoolStatusOptions,
  selfAssessmentOptions,
  workFieldOptions,
} from "@/lib/questions";
import { recommendLearningPathStep } from "@/lib/learningPath";
import {
  loadAnswerMaterials,
  loadAttempts,
  loadLearningPathProgress,
  loadMockResults,
  loadSettings,
  saveAttempt,
  saveAnswerMaterials,
  saveLearningPathProgress,
  saveMockResult,
  saveSettings,
} from "@/lib/storage";
import {
  AnswerMaterial,
  AppSettings,
  CoachingFeedback,
  MockExamAnswer,
  MockExamReport,
  MockExamResult,
  OPIcLevel,
  PracticeAttempt,
  Question,
  SurveyTag,
  defaultSettings,
  LearningPathProgress,
  LearningPathStepId,
  defaultLearningPathProgress,
} from "@/lib/types";
import { measureTranscript } from "@/lib/coaching";
import {
  requestComparison,
  requestFeedback,
  requestMockReport,
} from "@/lib/apiClient";
import {
  buildMockTimingTrend,
  summarizeMockTiming,
} from "@/lib/mockTiming";
import { analyzeWeaknessInsights } from "@/lib/weaknessInsights";

type View = "home" | "path" | "setup" | "practice" | "mock" | "history";
type PracticeStep = "ready" | "first" | "feedback" | "second" | "comparison";
type LearningPathAction =
  | "setup"
  | "diagnostic"
  | "materials"
  | "practice"
  | "roleplay"
  | "mock"
  | "review";
type PromptMode = "practice" | "mock";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<{
    0: {
      transcript: string;
    };
  }>;
};

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

const levels: OPIcLevel[] = ["IM1", "IM2", "IH", "AL"];

const learningPathSteps: {
  id: LearningPathStepId;
  title: string;
  description: string;
  action: LearningPathAction;
}[] = [
  {
    id: "orientation",
    title: "오리엔테이션",
    description: "목표 등급과 학습용 서베이 주제를 확인하고 앱 흐름을 잡습니다.",
    action: "setup",
  },
  {
    id: "diagnostic",
    title: "진단 세트",
    description: "짧은 답변으로 현재 약점을 확인하는 첫 개별 연습입니다.",
    action: "diagnostic",
  },
  {
    id: "answer_materials",
    title: "답변 재료 정리",
    description: "선택 주제별로 이야기, 이유, 예시를 한국어 메모로 준비합니다.",
    action: "materials",
  },
  {
    id: "core_practice",
    title: "핵심 말하기 훈련",
    description: "추천 질문에 답하고 Function, Accuracy, Content, Text Type 피드백을 받습니다.",
    action: "practice",
  },
  {
    id: "feedback_loop",
    title: "피드백 루프",
    description: "1차 답변 코칭을 반영해 재답변하고 개선점을 비교합니다.",
    action: "practice",
  },
  {
    id: "roleplay_focus",
    title: "역할극 집중 훈련",
    description: "요청, 문제 설명, 대안 제시가 필요한 역할극 질문을 연습합니다.",
    action: "roleplay",
  },
  {
    id: "mini_mock",
    title: "미니 모의고사",
    description: "전체 모의고사 전에 짧은 연속 답변 흐름을 점검합니다.",
    action: "mock",
  },
  {
    id: "full_mock",
    title: "전체 모의고사",
    description: "40분, 15문항 시뮬레이션으로 전체 리포트를 생성합니다.",
    action: "mock",
  },
  {
    id: "weakness_review",
    title: "약점 복습",
    description: "기록에 남은 약점과 추천 복습 항목을 다음 훈련으로 연결합니다.",
    action: "review",
  },
];

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [mockResults, setMockResults] = useState<MockExamResult[]>([]);
  const [answerMaterials, setAnswerMaterials] = useState<AnswerMaterial[]>([]);
  const [learningPathProgress, setLearningPathProgress] =
    useState<LearningPathProgress>(defaultLearningPathProgress);
  const [question, setQuestion] = useState<Question>(questions[0]);
  const [step, setStep] = useState<PracticeStep>("ready");
  const [firstTranscript, setFirstTranscript] = useState("");
  const [secondTranscript, setSecondTranscript] = useState("");
  const [feedback, setFeedback] = useState<CoachingFeedback | null>(null);
  const [comparison, setComparison] = useState<string[]>([]);
  const [provider, setProvider] = useState<"gemini" | "local" | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    const storedSettings = loadSettings();
    const storedAttempts = loadAttempts();
    const storedMockResults = loadMockResults();
    const storedAnswerMaterials = loadAnswerMaterials();
    const storedLearningPathProgress = loadLearningPathProgress();
    // Hydrate browser-only localStorage state after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(storedSettings);
    setAttempts(storedAttempts);
    setMockResults(storedMockResults);
    setAnswerMaterials(storedAnswerMaterials);
    setLearningPathProgress(storedLearningPathProgress);
    setQuestion(
      recommendQuestion(
        storedSettings.targetLevel,
        storedSettings.surveyTags,
        storedAttempts.map((attempt) => attempt.questionId),
      ),
    );
  }, []);

  const completedQuestionIds = useMemo(
    () => attempts.map((attempt) => attempt.questionId),
    [attempts],
  );

  const recommendedQuestion = useMemo(
    () =>
      recommendQuestion(
        settings.targetLevel,
        settings.surveyTags,
        completedQuestionIds,
      ),
    [completedQuestionIds, settings],
  );

  function updateSettings(next: AppSettings) {
    setSettings(next);
    saveSettings(next);
  }

  function updateLearningPathProgress(next: LearningPathProgress) {
    const progress = {
      ...next,
      updatedAt: new Date().toISOString(),
    };
    setLearningPathProgress(progress);
    saveLearningPathProgress(progress);
  }

  function toggleLearningPathStep(stepId: LearningPathStepId) {
    const exists = learningPathProgress.completedStepIds.includes(stepId);
    updateLearningPathProgress({
      completedStepIds: exists
        ? learningPathProgress.completedStepIds.filter((id) => id !== stepId)
        : [...learningPathProgress.completedStepIds, stepId],
    });
  }

  function upsertAnswerMaterial(material: AnswerMaterial) {
    const nextMaterials = [
      material,
      ...answerMaterials.filter((item) => item.tag !== material.tag),
    ];
    setAnswerMaterials(nextMaterials);
    saveAnswerMaterials(nextMaterials);

    if (!learningPathProgress.completedStepIds.includes("answer_materials")) {
      updateLearningPathProgress({
        completedStepIds: [
          ...learningPathProgress.completedStepIds,
          "answer_materials",
        ],
      });
    }
  }

  function handleLearningPathAction(action: LearningPathAction) {
    if (action === "setup") {
      setView("setup");
      return;
    }

    if (action === "mock") {
      setView("mock");
      return;
    }

    if (action === "review") {
      setView("history");
      return;
    }

    if (action === "materials") {
      setView("path");
      return;
    }

    startPractice(selectLearningPathQuestion(action));
  }

  function selectLearningPathQuestion(action: LearningPathAction) {
    if (action === "diagnostic") {
      return recommendedQuestion;
    }

    if (action === "roleplay") {
      const roleplay = questions.find(
        (item) =>
          item.level === settings.targetLevel &&
          item.type === "roleplay" &&
          !completedQuestionIds.includes(item.id),
      );

      return roleplay ?? recommendedQuestion;
    }

    return recommendedQuestion;
  }

  function startPractice(selectedQuestion = recommendedQuestion) {
    setQuestion(selectedQuestion);
    setStep("ready");
    setFirstTranscript("");
    setSecondTranscript("");
    setFeedback(null);
    setComparison([]);
    setProvider(null);
    setInputError(null);
    setView("practice");
  }

  async function submitFirstAnswer() {
    const validation = validateAnswer(firstTranscript);
    if (validation) {
      setInputError(validation);
      return;
    }

    setInputError(null);
    setIsGenerating(true);
    try {
      const result = await requestFeedback({
        question,
        transcript: firstTranscript,
        targetLevel: settings.targetLevel,
        answerSeconds: question.answerTimeSec,
      });
      setFeedback(result.feedback);
      setProvider(result.provider);
      setStep("feedback");
    } finally {
      setIsGenerating(false);
    }
  }

  async function submitSecondAnswer() {
    if (!feedback) {
      return;
    }

    const validation = validateAnswer(secondTranscript);
    if (validation) {
      setInputError(validation);
      return;
    }

    setInputError(null);
    setIsGenerating(true);
    const result = await requestComparison({
      firstTranscript,
      secondTranscript,
    });
    const nextComparison = result.comparison;
    setProvider(result.provider);
    const attempt: PracticeAttempt = {
      id: crypto.randomUUID(),
      questionId: question.id,
      createdAt: new Date().toISOString(),
      firstTranscript,
      secondTranscript,
      firstMetrics: measureTranscript(firstTranscript, question.answerTimeSec),
      secondMetrics: measureTranscript(secondTranscript, question.answerTimeSec),
      feedback,
      comparisonKo: nextComparison,
    };

    saveAttempt(attempt);
    setAttempts([attempt, ...attempts].slice(0, 50));
    setComparison(nextComparison);
    setStep("comparison");
    setIsGenerating(false);
  }

  function listenToSpeech(target: "first" | "second") {
    const speechWindow = window as SpeechWindow;
    const SpeechRecognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");

      if (target === "first") {
        setFirstTranscript((current) => `${current} ${transcript}`.trim());
      } else {
        setSecondTranscript((current) => `${current} ${transcript}`.trim());
      }
    };
    recognition.onend = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  }

  function speakPrompt(text: string, onEnd?: () => void) {
    if (!window.speechSynthesis) {
      onEnd?.();
      return false;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utterance);

    return true;
  }

  return (
    <main className="app-shell">
      <div className="app-frame">
        <aside className="sidebar">
          <div className="brand">
            <h1>OPIc Practice Coach</h1>
            <p>말하기 먼저, 코칭은 그 다음</p>
          </div>
          <nav className="nav" aria-label="Main navigation">
            <button className={view === "home" ? "active" : ""} onClick={() => setView("home")}>
              홈
            </button>
            <button className={view === "path" ? "active" : ""} onClick={() => setView("path")}>
              학습 경로
            </button>
            <button className={view === "setup" ? "active" : ""} onClick={() => setView("setup")}>
              연습 목표/서베이
            </button>
            <button className={view === "practice" ? "active" : ""} onClick={() => startPractice()}>
              개별 연습
            </button>
            <button className={view === "mock" ? "active" : ""} onClick={() => setView("mock")}>
              모의고사
            </button>
            <button className={view === "history" ? "active" : ""} onClick={() => setView("history")}>
              기록
            </button>
          </nav>
        </aside>

        <div className="main">
          {view === "home" && (
            <HomeView
              answerMaterials={answerMaterials}
              attempts={attempts}
              learningPathProgress={learningPathProgress}
              mockResults={mockResults}
              question={recommendedQuestion}
              settings={settings}
              onPath={() => setView("path")}
              onStart={() => startPractice(recommendedQuestion)}
              onSetup={() => setView("setup")}
              onMock={() => setView("mock")}
            />
          )}

          {view === "path" && (
            <LearningPathView
              answerMaterials={answerMaterials}
              attempts={attempts}
              learningPathProgress={learningPathProgress}
              mockResults={mockResults}
              onAction={handleLearningPathAction}
              onSaveMaterial={upsertAnswerMaterial}
              onToggle={toggleLearningPathStep}
              settings={settings}
            />
          )}

          {view === "setup" && (
            <SetupView settings={settings} onChange={updateSettings} />
          )}

          {view === "practice" && (
            <PracticeView
              key={question.id}
              comparison={comparison}
              feedback={feedback}
              firstTranscript={firstTranscript}
              inputError={inputError}
              isGenerating={isGenerating}
              isListening={isListening}
              onFirstTranscript={setFirstTranscript}
              onListen={listenToSpeech}
              onNextQuestion={() => startPractice(recommendedQuestion)}
              onSecondTranscript={setSecondTranscript}
              onSubmitFirst={submitFirstAnswer}
              onSubmitSecond={submitSecondAnswer}
              onSpeakPrompt={speakPrompt}
              question={question}
              provider={provider}
              secondTranscript={secondTranscript}
              settings={settings}
              step={step}
              setStep={setStep}
            />
          )}

          {view === "mock" && (
            <MockView
              settings={settings}
              onSpeakPrompt={speakPrompt}
              onSaved={(result) => setMockResults([result, ...mockResults].slice(0, 20))}
            />
          )}

          {view === "history" && (
            <HistoryView attempts={attempts} mockResults={mockResults} />
          )}
        </div>
      </div>
    </main>
  );
}

function HomeView({
  answerMaterials,
  attempts,
  learningPathProgress,
  mockResults,
  question,
  settings,
  onPath,
  onStart,
  onSetup,
  onMock,
}: {
  answerMaterials: AnswerMaterial[];
  attempts: PracticeAttempt[];
  learningPathProgress: LearningPathProgress;
  mockResults: MockExamResult[];
  question: Question;
  settings: AppSettings;
  onPath: () => void;
  onStart: () => void;
  onSetup: () => void;
  onMock: () => void;
}) {
  const latestWeakness =
    attempts[0]?.feedback.improvementsKo[0] ?? "첫 답변에서는 구체적인 경험 하나를 말하는 데 집중하세요.";
  const pathCompletion = getLearningPathCompletion(learningPathProgress);
  const recommendation = recommendLearningPathStep({
    answerMaterials,
    attempts,
    mockResults,
    progress: learningPathProgress,
  });
  const nextPathStep = getLearningPathStep(recommendation.stepId);

  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <h2>오늘의 추천 훈련</h2>
          <p className="muted">연습 목표 등급 {settings.targetLevel} 기준으로 바로 말할 질문입니다. 공식 점수 선택이 아닙니다.</p>
        </div>
        <button className="secondary" onClick={onSetup}>설정 변경</button>
      </div>

      <div className="grid two">
        <article className="card">
          <h3>{question.topic.toUpperCase()} / {question.type}</h3>
          <p>{question.prompt}</p>
          <div className="button-row" style={{ marginTop: 14 }}>
            <button className="primary" onClick={onStart}>추천 질문 시작</button>
            <button className="secondary" onClick={onMock}>모의고사 시작</button>
          </div>
        </article>
        <article className="card">
          <h3>오늘의 코칭 포인트</h3>
          <p>{latestWeakness}</p>
        </article>
      </div>

      <article className="card path-summary">
        <div>
          <h3>학습 경로</h3>
          <p className="muted">
            다음 단계: {nextPathStep.title} · 진행률 {pathCompletion.completed}/{pathCompletion.total}
          </p>
        </div>
        <div className="path-progress" aria-label={`학습 경로 진행률 ${pathCompletion.percent}%`}>
          <span style={{ width: `${pathCompletion.percent}%` }} />
        </div>
        <button className="secondary" onClick={onPath}>학습 경로 보기</button>
      </article>

      <div className="grid three" style={{ marginTop: 14 }}>
        <div className="card metric">
          <span className="muted">완료한 연습</span>
          <strong>{attempts.length}</strong>
        </div>
        <div className="card metric">
          <span className="muted">연습 목표 등급</span>
          <strong>{settings.targetLevel}</strong>
        </div>
        <div className="card metric">
          <span className="muted">선택 주제</span>
          <strong>{settings.surveyTags.length}</strong>
        </div>
      </div>
    </section>
  );
}

function LearningPathView({
  answerMaterials,
  attempts,
  learningPathProgress,
  mockResults,
  onAction,
  onSaveMaterial,
  onToggle,
  settings,
}: {
  answerMaterials: AnswerMaterial[];
  attempts: PracticeAttempt[];
  learningPathProgress: LearningPathProgress;
  mockResults: MockExamResult[];
  onAction: (action: LearningPathAction) => void;
  onSaveMaterial: (material: AnswerMaterial) => void;
  onToggle: (stepId: LearningPathStepId) => void;
  settings: AppSettings;
}) {
  const completion = getLearningPathCompletion(learningPathProgress);
  const recommendation = recommendLearningPathStep({
    answerMaterials,
    attempts,
    mockResults,
    progress: learningPathProgress,
  });
  const nextStep = getLearningPathStep(recommendation.stepId);
  const latestWeakness =
    attempts[0]?.feedback.improvementsKo[0] ??
    mockResults[0]?.report.weaknessesKo[0] ??
    "아직 기록이 없습니다. 진단 세트로 첫 약점을 확인하세요.";

  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <h2>학습 경로</h2>
          <p className="muted">
            {settings.targetLevel} 목표 기준의 단계형 학습 흐름입니다. 공식 OPIc 과정이 아니라 앱 내부 연습 순서입니다.
          </p>
        </div>
        <div className="path-meter">
          <strong>{completion.percent}%</strong>
          <span className="muted">완료</span>
        </div>
      </div>

      <div className="grid two">
        <article className="card feedback">
          <h3>다음 추천 단계</h3>
          <p>{nextStep.title}</p>
          <p className="muted" style={{ marginTop: 8 }}>{nextStep.description}</p>
          <p className="recommendation-reason">{recommendation.reasonKo}</p>
          <div className="button-row" style={{ marginTop: 14 }}>
            <button className="primary" onClick={() => onAction(nextStep.action)}>시작</button>
            <button className="secondary" onClick={() => onToggle(nextStep.id)}>완료 표시</button>
          </div>
        </article>
        <article className="card">
          <h3>최근 약점 기반 힌트</h3>
          <p>{latestWeakness}</p>
          <p className="muted" style={{ marginTop: 8 }}>
            기록이 쌓이면 이 영역은 반복 약점 복습 진입점으로 사용합니다.
          </p>
        </article>
      </div>

      <div className="path-progress large" aria-label={`학습 경로 진행률 ${completion.percent}%`}>
        <span style={{ width: `${completion.percent}%` }} />
      </div>

      <div className="path-steps">
        {learningPathSteps.map((step, index) => {
          const isCompleted = learningPathProgress.completedStepIds.includes(step.id);

          return (
            <article className={`card path-step ${isCompleted ? "completed" : ""}`} key={step.id}>
              <div className="step-number">{index + 1}</div>
              <div>
                <h3>{step.title}</h3>
                <p className="muted">{step.description}</p>
              </div>
              <div className="button-row">
                <button className="secondary" onClick={() => onAction(step.action)}>
                  {actionLabel(step.action)}
                </button>
                <button className={isCompleted ? "ghost" : "primary"} onClick={() => onToggle(step.id)}>
                  {isCompleted ? "완료 취소" : "완료"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <AnswerMaterialsEditor
        materials={answerMaterials}
        onSave={onSaveMaterial}
        tags={settings.surveyTags}
      />
    </section>
  );
}

function AnswerMaterialsEditor({
  materials,
  onSave,
  tags,
}: {
  materials: AnswerMaterial[];
  onSave: (material: AnswerMaterial) => void;
  tags: SurveyTag[];
}) {
  const materialTags = tags.length > 0 ? tags : defaultSettings.surveyTags;

  return (
    <article className="card materials-editor">
      <h3>답변 재료 정리</h3>
      <p className="muted">
        영어 스크립트가 아니라 말할 재료를 한국어로 짧게 준비하세요. 저장하면 학습 경로의 답변 재료 단계가 완료 처리됩니다.
      </p>
      <div className="grid" style={{ marginTop: 14 }}>
        {materialTags.map((tag) => (
          <AnswerMaterialCard
            key={tag}
            material={materials.find((item) => item.tag === tag)}
            onSave={onSave}
            tag={tag}
          />
        ))}
      </div>
    </article>
  );
}

function AnswerMaterialCard({
  material,
  onSave,
  tag,
}: {
  material?: AnswerMaterial;
  onSave: (material: AnswerMaterial) => void;
  tag: SurveyTag;
}) {
  const [storyKo, setStoryKo] = useState(material?.storyKo ?? "");
  const [reasonKo, setReasonKo] = useState(material?.reasonKo ?? "");
  const [exampleKo, setExampleKo] = useState(material?.exampleKo ?? "");

  function saveMaterial() {
    onSave({
      tag,
      storyKo: storyKo.trim(),
      reasonKo: reasonKo.trim(),
      exampleKo: exampleKo.trim(),
      updatedAt: new Date().toISOString(),
    });
  }

  const hasContent = Boolean(storyKo.trim() || reasonKo.trim() || exampleKo.trim());

  return (
    <div className="material-card">
      <div className="section-head compact">
        <div>
          <h3>{tag}</h3>
          {material?.updatedAt && (
            <p className="muted">최근 저장: {new Date(material.updatedAt).toLocaleString("ko-KR")}</p>
          )}
        </div>
        <button className="primary" disabled={!hasContent} onClick={saveMaterial}>
          저장
        </button>
      </div>
      <div className="grid three">
        <label className="material-field">
          <span>이야기</span>
          <textarea
            onChange={(event) => setStoryKo(event.target.value)}
            placeholder="예: 지난달 부산 여행에서 비가 왔지만 작은 식당을 발견함"
            value={storyKo}
          />
        </label>
        <label className="material-field">
          <span>이유</span>
          <textarea
            onChange={(event) => setReasonKo(event.target.value)}
            placeholder="예: 예상 밖의 상황을 즐겁게 바꾼 경험이라 기억남"
            value={reasonKo}
          />
        </label>
        <label className="material-field">
          <span>구체 예시</span>
          <textarea
            onChange={(event) => setExampleKo(event.target.value)}
            placeholder="예: 친구들과 해산물 식당에서 오래 이야기함"
            value={exampleKo}
          />
        </label>
      </div>
    </div>
  );
}

function SetupView({
  settings,
  onChange,
}: {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
}) {
  const selectedSurveyItemCount = backgroundSurveySections.reduce(
    (total, section) => total + settings.backgroundSurvey[section.optionKey].length,
    0,
  );

  function getSurveyTags(backgroundSurvey: AppSettings["backgroundSurvey"]) {
    const tags = new Set<SurveyTag>();

    if (backgroundSurvey.workStatus === "working" || backgroundSurvey.workField !== "no_work_experience") {
      tags.add("work");
    }

    if (backgroundSurvey.schoolStatus === "student") {
      tags.add("school");
    }

    tags.add("home");

    for (const section of backgroundSurveySections) {
      const selectedIds = backgroundSurvey[section.optionKey];
      for (const option of section.options) {
        if (option.tag && selectedIds.includes(option.id)) {
          tags.add(option.tag);
        }
      }
    }

    return Array.from(tags);
  }

  function updateBackgroundSurvey(partial: Partial<AppSettings["backgroundSurvey"]>) {
    const backgroundSurvey = {
      ...settings.backgroundSurvey,
      ...partial,
    };
    const surveyTags = getSurveyTags(backgroundSurvey);

    onChange({
      ...settings,
      surveyTags,
      backgroundSurvey: {
        ...backgroundSurvey,
        selectedTags: surveyTags,
      },
    });
  }

  function toggleSurveyChoice(
    optionKey: "leisureIds" | "hobbyIds" | "sportIds" | "travelIds",
    id: string,
  ) {
    const currentIds = settings.backgroundSurvey[optionKey];
    updateBackgroundSurvey({
      [optionKey]: currentIds.includes(id)
        ? currentIds.filter((item) => item !== id)
        : [...currentIds, id],
    });
  }

  function updateSelfAssessment(level: 1 | 2 | 3 | 4 | 5 | 6) {
    const targetLevel = level <= 2 ? "IM1" : level <= 4 ? "IM2" : level === 5 ? "IH" : "AL";
    const backgroundSurvey = {
      ...settings.backgroundSurvey,
      selfAssessmentLevel: level,
    };
    const surveyTags = getSurveyTags(backgroundSurvey);

    onChange({
      ...settings,
      targetLevel,
      surveyTags,
      backgroundSurvey: {
        ...backgroundSurvey,
        selectedTags: surveyTags,
      },
    });
  }

  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <h2>Background Survey</h2>
          <p className="muted">질문을 읽고 정확히 답변해 주세요. 설문 응답을 기초로 개인별 연습 문항이 출제됩니다.</p>
        </div>
      </div>

      <div className="grid">
        <article className="card">
          <h3>Practice target level</h3>
          <div className="chips" style={{ marginTop: 12 }}>
            {levels.map((level) => (
              <button
                className={`chip ${settings.targetLevel === level ? "selected" : ""}`}
                key={level}
                onClick={() => onChange({ ...settings, targetLevel: level })}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 12 }}>
            {levelDescriptions[settings.targetLevel]}
          </p>
        </article>

        <article className="card">
          <h3>Part 1 of 4</h3>
          <p className="muted" style={{ marginTop: 8 }}>
            현재 귀하는 어느 분야에 종사하고 계십니까?
          </p>
          <div className="survey-form">
            <label>
              <span>분야</span>
              <select
                onChange={(event) =>
                  updateBackgroundSurvey({
                    workField: event.target.value as AppSettings["backgroundSurvey"]["workField"],
                  })
                }
                value={settings.backgroundSurvey.workField}
              >
                {workFieldOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </article>

        <article className="card">
          <h3>Part 2 of 4</h3>
          <div className="survey-form">
            <label>
              <span>현재 당신은 학생입니까?</span>
              <select
                onChange={(event) =>
                  updateBackgroundSurvey({
                    schoolStatus: event.target.value as AppSettings["backgroundSurvey"]["schoolStatus"],
                  })
                }
                value={settings.backgroundSurvey.schoolStatus}
              >
                {schoolStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>최근 어떤 강의를 수강했습니까?</span>
              <select
                onChange={(event) =>
                  updateBackgroundSurvey({
                    courseExperience: event.target.value as AppSettings["backgroundSurvey"]["courseExperience"],
                  })
                }
                value={settings.backgroundSurvey.courseExperience}
              >
                {courseExperienceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </article>

        <article className="card">
          <h3>Part 3 of 4</h3>
          <div className="survey-form">
            <label>
              <span>현재 귀하는 어디에 살고 계십니까?</span>
              <select
                onChange={(event) =>
                  updateBackgroundSurvey({
                    residence: event.target.value as AppSettings["backgroundSurvey"]["residence"],
                  })
                }
                value={settings.backgroundSurvey.residence}
              >
                {residenceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </article>


        <article className="card">
          <h3>Part 4 of 4</h3>
          <p className="muted" style={{ marginTop: 8 }}>
            아래의 설문에서 총 12개 이상의 항목을 선택하십시오. {selectedSurveyItemCount}개 항목을 선택했습니다.
          </p>
          <div className="survey-sections">
            {backgroundSurveySections.map((section) => (
              <div className="survey-section" key={section.id}>
                <div>
                  <strong>{section.title}</strong>
                  <p className="muted">{section.prompt}</p>
                </div>
                <div className="chips">
                  {section.options.map((option) => (
                    <button
                      className={`chip ${
                        settings.backgroundSurvey[section.optionKey].includes(option.id)
                          ? "selected"
                          : ""
                      }`}
                      key={option.id}
                      onClick={() => toggleSurveyChoice(section.optionKey, option.id)}
                      title={option.tag ? `질문 추천 태그: ${option.tag}` : "세부 설문 항목"}
                    >
                      {option.label}
                      {option.tag && <span className="chip-meta">{option.tag}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {selectedSurveyItemCount < 12 && (
            <p className="input-error">실제 흐름에 맞추려면 12개 이상 선택하는 연습을 권장합니다.</p>
          )}
        </article>

        <article className="card">
          <h3>Self Assessment</h3>
          <p className="muted">
            본 Self Assessment에 대한 응답을 기초로 개인별 문항이 출제됩니다. 본인의 English 말하기 능력과 비슷한 수준을 선택하세요.
          </p>
          <div className="survey-options">
            {selfAssessmentOptions.map((option) => (
              <button
                className={`survey-option ${
                  settings.backgroundSurvey.selfAssessmentLevel === option.value
                    ? "selected"
                    : ""
                }`}
                key={option.value}
                onClick={() => updateSelfAssessment(option.value)}
              >
                <strong>{option.value}</strong>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function PracticeView({
  comparison,
  feedback,
  firstTranscript,
  inputError,
  isGenerating,
  isListening,
  onFirstTranscript,
  onListen,
  onNextQuestion,
  onSecondTranscript,
  onSubmitFirst,
  onSubmitSecond,
  onSpeakPrompt,
  question,
  provider,
  secondTranscript,
  settings,
  step,
  setStep,
}: {
  comparison: string[];
  feedback: CoachingFeedback | null;
  firstTranscript: string;
  inputError: string | null;
  isGenerating: boolean;
  isListening: boolean;
  onFirstTranscript: (value: string) => void;
  onListen: (target: "first" | "second") => void;
  onNextQuestion: () => void;
  onSecondTranscript: (value: string) => void;
  onSubmitFirst: () => void;
  onSubmitSecond: () => void;
  onSpeakPrompt: (text: string, onEnd?: () => void) => boolean;
  question: Question;
  provider: "gemini" | "local" | null;
  secondTranscript: string;
  settings: AppSettings;
  step: PracticeStep;
  setStep: (step: PracticeStep) => void;
}) {
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [isPromptSpeaking, setIsPromptSpeaking] = useState(false);

  function playPrompt() {
    setIsPromptSpeaking(true);
    const didStart = onSpeakPrompt(question.prompt, () => setIsPromptSpeaking(false));

    if (!didStart) {
      setIsPromptSpeaking(false);
    }
  }

  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <h2>개별 연습</h2>
          <p className="muted">{settings.targetLevel} 연습 목표 / {question.topic} / 앱 내부 연습 유형: {question.type}</p>
        </div>
        <button className="secondary" onClick={onNextQuestion}>다른 추천 질문</button>
      </div>

      <div className="practice-layout">
        <div className="grid">
          <InterviewerPrompt
            isPromptVisible={isPromptVisible}
            isSpeaking={isPromptSpeaking}
            mode="practice"
            onPlay={playPrompt}
            onShowPrompt={() => setIsPromptVisible(true)}
            prompt={question.prompt}
          />

          {step === "ready" && (
            <article className="card">
              <h3>준비</h3>
              <p className="muted">30초 정도 답변 구조를 생각한 뒤 바로 말하세요. 예시 답변은 1차 답변 후 공개됩니다.</p>
              <div className="button-row" style={{ marginTop: 14 }}>
                <button className="primary" onClick={() => setStep("first")}>1차 답변 시작</button>
              </div>
            </article>
          )}

          {step === "first" && (
            <AnswerBox
              buttonLabel="1차 답변 제출"
              isListening={isListening}
              onChange={onFirstTranscript}
              onListen={() => onListen("first")}
              onSubmit={onSubmitFirst}
              isSubmitting={isGenerating}
              error={inputError}
              title="1차 답변"
              value={firstTranscript}
            />
          )}

          {step === "feedback" && feedback && (
            <>
              <FeedbackBlock feedback={feedback} provider={provider} />
              <article className="card">
                <h3>이제 공개되는 예시 답변</h3>
                <p>{question.sampleAnswer}</p>
                <div className="chips" style={{ marginTop: 12 }}>
                  {question.usefulExpressions.map((expression) => (
                    <span className="chip" key={expression}>{expression}</span>
                  ))}
                </div>
                <div className="button-row" style={{ marginTop: 14 }}>
                  <button className="primary" onClick={() => setStep("second")}>재답변 시작</button>
                </div>
              </article>
            </>
          )}

          {step === "second" && (
            <AnswerBox
              buttonLabel="재답변 제출"
              isListening={isListening}
              onChange={onSecondTranscript}
              onListen={() => onListen("second")}
              onSubmit={onSubmitSecond}
              isSubmitting={isGenerating}
              error={inputError}
              title="재답변"
              value={secondTranscript}
            />
          )}

          {step === "comparison" && (
            <article className="card">
              <h3>재답변 비교</h3>
              <p className="muted">
                Provider: {provider === "gemini" ? "Gemini" : "Local fallback"}
              </p>
              <ul className="list">
                {comparison.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="button-row" style={{ marginTop: 14 }}>
                <button className="primary" onClick={onNextQuestion}>다음 추천 질문</button>
              </div>
            </article>
          )}
        </div>

        <aside className="grid">
          <div className="timer">
            <span className="muted">준비</span>
            <strong>{question.prepTimeSec}s</strong>
          </div>
          <div className="timer">
            <span className="muted">권장 답변</span>
            <strong>{question.answerTimeSec}s</strong>
          </div>
          <article className="card">
            <h3>평가 포커스</h3>
            <ul className="list">
              {question.evaluationFocus.map((focus) => (
                <li key={focus}>{focus}</li>
              ))}
            </ul>
          </article>
        </aside>
      </div>
    </section>
  );
}

function AnswerBox({
  buttonLabel,
  isListening,
  isSubmitting,
  error,
  onChange,
  onListen,
  onSubmit,
  title,
  value,
}: {
  buttonLabel: string;
  isListening: boolean;
  isSubmitting: boolean;
  error: string | null;
  onChange: (value: string) => void;
  onListen: () => void;
  onSubmit: () => void;
  title: string;
  value: string;
}) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <p className="muted" style={{ marginBottom: 12 }}>
        브라우저 음성 인식이 지원되면 받아쓰기를 사용할 수 있습니다. 지원되지 않으면 직접 입력하세요.
      </p>
      <textarea
        className="textarea"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Speak or type your answer in English..."
        value={value}
      />
      {error && <p className="input-error">{error}</p>}
      <div className="button-row" style={{ marginTop: 12 }}>
        <button className="secondary" disabled={isListening} onClick={onListen}>
          {isListening ? "듣는 중" : "받아쓰기"}
        </button>
        <button className="primary" disabled={!value.trim()} onClick={onSubmit}>
          {isSubmitting ? "생성 중" : buttonLabel}
        </button>
      </div>
    </article>
  );
}

function InterviewerPrompt({
  isPromptVisible,
  isSpeaking,
  listenCount,
  maxListens,
  mode,
  onPlay,
  onShowPrompt,
  prompt,
}: {
  isPromptVisible: boolean;
  isSpeaking: boolean;
  listenCount?: number;
  maxListens?: number;
  mode: PromptMode;
  onPlay: () => void;
  onShowPrompt: () => void;
  prompt: string;
}) {
  const remainingListens =
    maxListens === undefined || listenCount === undefined
      ? null
      : Math.max(maxListens - listenCount, 0);

  return (
    <article className="interviewer-card">
      <div className="interviewer-portrait">
        <Image
          alt="DS Interviewer"
          height={260}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
          src="/ds-interviewer.webp"
          width={220}
        />
      </div>
      <div className="interviewer-content">
        <p className="eyebrow">DS Interviewer</p>
        <h3>질문을 듣고 답변하세요</h3>
        <p className="muted">
          {mode === "mock"
            ? "실전감을 위해 질문 텍스트는 기본적으로 숨겨집니다."
            : "음성 중심으로 먼저 연습하고, 필요할 때만 질문 텍스트를 확인하세요."}
        </p>
        <div className="button-row" style={{ marginTop: 12 }}>
          <button
            className="primary"
            disabled={isSpeaking || remainingListens === 0}
            onClick={onPlay}
          >
            {isSpeaking ? "재생 중" : listenCount ? "다시 듣기" : "질문 듣기"}
          </button>
          <button className="secondary" onClick={onShowPrompt}>
            질문 텍스트 보기
          </button>
          {remainingListens !== null && (
            <span className="listen-count">남은 듣기 {remainingListens}회</span>
          )}
        </div>
        {isPromptVisible ? (
          <div className="prompt transcript-prompt">
            <p>{prompt}</p>
          </div>
        ) : (
          <div className="hidden-prompt">
            질문 텍스트가 숨겨져 있습니다.
          </div>
        )}
      </div>
    </article>
  );
}

function validateAnswer(transcript: string) {
  const words = transcript.match(/[A-Za-z']+/g) ?? [];
  const meaningfulWords = words.filter((word) => word.length > 1);

  if (meaningfulWords.length < 8) {
    return "답변이 너무 짧습니다. 영어 단어 8개 이상으로 한두 문장을 말한 뒤 제출해 주세요.";
  }

  return null;
}

function FeedbackBlock({
  feedback,
  provider,
}: {
  feedback: CoachingFeedback;
  provider: "gemini" | "local" | null;
}) {
  return (
    <article className="card feedback">
      <h3>AI 코칭</h3>
      <p className="muted">
        Provider: {provider === "gemini" ? "Gemini" : "Local fallback"}
      </p>
      <p className="muted">공식 정렬 기준: Function / Accuracy / Content & Context / Text Type</p>
      <p>{feedback.summaryKo}</p>
      {feedback.rubric && (
        <div className="grid two" style={{ marginTop: 14 }}>
          <article className="rubric-box">
            <h3>Function</h3>
            <p>{feedback.rubric.functionKo}</p>
          </article>
          <article className="rubric-box">
            <h3>Accuracy</h3>
            <p>{feedback.rubric.accuracyKo}</p>
          </article>
          <article className="rubric-box">
            <h3>Content & Context</h3>
            <p>{feedback.rubric.contentContextKo}</p>
          </article>
          <article className="rubric-box">
            <h3>Text Type</h3>
            <p>{feedback.rubric.textTypeKo}</p>
          </article>
        </div>
      )}
      <div className="grid two" style={{ marginTop: 14 }}>
        <div>
          <h3>강점</h3>
          <ul className="list">
            {feedback.strengthsKo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>개선</h3>
          <ul className="list">
            {feedback.improvementsKo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <h3 style={{ marginTop: 14 }}>다음 답변 미션</h3>
      <ul className="list">
        {feedback.nextAttemptPlanKo.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="muted" style={{ marginTop: 12 }}>
        연습용 참고 등급(공식 점수 아님): {feedback.estimatedLevel}
      </p>
    </article>
  );
}

function MockView({
  settings,
  onSpeakPrompt,
  onSaved,
}: {
  settings: AppSettings;
  onSpeakPrompt: (text: string, onEnd?: () => void) => boolean;
  onSaved: (result: MockExamResult) => void;
}) {
  const [phase, setPhase] = useState<"setup" | "orientation" | "running" | "report">("setup");
  const [difficulty, setDifficulty] = useState("3");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [answers, setAnswers] = useState<MockExamAnswer[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(40 * 60);
  const [questionElapsedSeconds, setQuestionElapsedSeconds] = useState(0);
  const [report, setReport] = useState<MockExamReport | null>(null);
  const [provider, setProvider] = useState<"gemini" | "local" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finishReason, setFinishReason] = useState<"completed" | "ended" | "time" | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [isPromptSpeaking, setIsPromptSpeaking] = useState(false);
  const [promptListenCount, setPromptListenCount] = useState(0);
  const mockQuestions = useMemo(
    () => buildMockExamQuestions(settings.targetLevel, settings.surveyTags),
    [settings],
  );
  const currentQuestion = mockQuestions[currentIndex];
  const isOverallTimeWarning = remainingSeconds <= 5 * 60;
  const isOverallTimeCritical = remainingSeconds <= 60;
  const isQuestionOverRecommendedTime =
    currentQuestion && questionElapsedSeconds > currentQuestion.answerTimeSec;

  useEffect(() => {
    if (phase !== "running") {
      return;
    }

    const timer = window.setInterval(() => {
      setQuestionElapsedSeconds((current) => current + 1);
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          void finishExam();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [phase]);

  function startExam() {
    setAnswers([]);
    setCurrentIndex(0);
    setTranscript("");
    setRemainingSeconds(40 * 60);
    setQuestionElapsedSeconds(0);
    setIsPromptVisible(false);
    setIsPromptSpeaking(false);
    setPromptListenCount(0);
    setReport(null);
    setProvider(null);
    setError(null);
    setFinishReason(null);
    setPhase("running");
  }

  async function saveCurrentAndMoveNext() {
    const shouldValidate = transcript.trim() || currentIndex === 0;
    if (shouldValidate) {
      const validation = validateAnswer(transcript);
      if (validation) {
        setError(validation);
        return;
      }
    }

    const nextAnswers = appendCurrentAnswer(answers, transcript);
    setAnswers(nextAnswers);
    setTranscript("");
    setError(null);

    if (currentIndex === mockQuestions.length - 1) {
      await finishExam(nextAnswers, "completed");
      return;
    }

    setCurrentIndex(currentIndex + 1);
    setQuestionElapsedSeconds(0);
    setIsPromptVisible(false);
    setPromptListenCount(0);
  }

  function appendCurrentAnswer(
    currentAnswers: MockExamAnswer[],
    answerTranscript: string,
  ) {
    return [
      ...currentAnswers,
      {
        questionId: currentQuestion.id,
        prompt: currentQuestion.prompt,
        transcript: answerTranscript,
        metrics: measureTranscript(answerTranscript, currentQuestion.answerTimeSec),
        elapsedSeconds: questionElapsedSeconds,
        isWarmup: currentIndex === 0,
      },
    ];
  }

  function skipQuestion() {
    const nextAnswers = appendCurrentAnswer(answers, "");
    setAnswers(nextAnswers);
    setTranscript("");
    setError(null);

    if (currentIndex === mockQuestions.length - 1) {
      void finishExam(nextAnswers, "completed");
      return;
    }

    setCurrentIndex(currentIndex + 1);
    setQuestionElapsedSeconds(0);
    setIsPromptVisible(false);
    setPromptListenCount(0);
  }

  async function endExamNow() {
    const finalAnswers = transcript.trim()
      ? appendCurrentAnswer(answers, transcript)
      : answers;
    setAnswers(finalAnswers);
    setTranscript("");
    setError(null);
    await finishExam(finalAnswers, "ended");
  }

  async function finishExam(
    finalAnswers = answers,
    reason: "completed" | "ended" | "time" = "time",
  ) {
    if (isGenerating || phase === "report") {
      return;
    }

    if (finalAnswers.filter((answer) => !answer.isWarmup).length === 0) {
      setError("리포트를 만들 평가 연습 답변이 없습니다. Q2 이후 최소 한 문항에 답하거나 건너뛴 뒤 종료해 주세요.");
      return;
    }

    setIsGenerating(true);
    const durationSeconds = 40 * 60 - remainingSeconds;
    const result = await requestMockReport({
      answers: finalAnswers,
      targetLevel: settings.targetLevel,
      durationSeconds,
    });
    const mockResult: MockExamResult = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      targetLevel: settings.targetLevel,
      surveyTags: settings.surveyTags,
      durationSeconds,
      answers: finalAnswers,
      report: result.report,
    };

    saveMockResult(mockResult);
    onSaved(mockResult);
    setReport(result.report);
    setProvider(result.provider);
    setFinishReason(reason);
    setPhase("report");
    setIsGenerating(false);
  }

  function listenForMockAnswer() {
    const speechWindow = window as SpeechWindow;
    const SpeechRecognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("이 브라우저는 받아쓰기를 지원하지 않습니다. 답변을 직접 입력해 주세요.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      setTranscript((current) => `${current} ${text}`.trim());
    };
    recognition.onend = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  }

  function playMockPrompt() {
    if (promptListenCount >= 1) {
      setError("모의고사에서는 문제 다시 듣기를 1회만 사용할 수 있습니다.");
      return;
    }

    setError(null);
    setIsPromptSpeaking(true);
    setPromptListenCount((current) => current + 1);
    const didStart = onSpeakPrompt(currentQuestion.prompt, () => setIsPromptSpeaking(false));

    if (!didStart) {
      setIsPromptSpeaking(false);
      setError("이 브라우저는 질문 음성 재생을 지원하지 않습니다. 질문 텍스트 보기를 사용해 주세요.");
    }
  }

  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <h2>모의고사</h2>
          <p className="muted">본시험 40분, 15문항으로 진행합니다. 시험 중에는 피드백과 예시 답변을 숨깁니다.</p>
        </div>
      </div>

      {phase === "setup" && (
        <div className="grid two">
          <article className="card">
            <h3>시험 구성</h3>
            <p className="muted">
              이 구성은 한국 OPIc 대비용 학습 시뮬레이션 패턴이며, 공식 ACTFL/OPIc 고정 form이 아닙니다.
            </p>
            <ul className="list">
              <li>Q1 자기소개 warm-up: 리포트 평가에서 제외</li>
              <li>Q2-Q10: 학습용 Background Survey 기반 주제 클러스터</li>
              <li>Q11-Q13: 역할극 연습 클러스터</li>
              <li>Q14-Q15: 비교/사회 이슈 연습</li>
              <li>연습용 자기평가 난이도 선택</li>
              <li>15문항 연속 진행</li>
              <li>총 40분 타이머</li>
              <li>종료 후 전체 리포트 생성</li>
            </ul>
          </article>
          <article className="card">
            <h3>연습용 자기평가 난이도</h3>
            <p className="muted">공식 OPIc form을 생성하는 Self-Assessment가 아니라, 앱 안에서 질문 난이도를 조절하기 위한 연습 설정입니다.</p>
            <div className="chips" style={{ marginTop: 12 }}>
              {["1", "2", "3", "4", "5"].map((value) => (
                <button
                  className={`chip ${difficulty === value ? "selected" : ""}`}
                  key={value}
                  onClick={() => setDifficulty(value)}
                >
                  Practice {value}
                </button>
              ))}
            </div>
            <div className="button-row" style={{ marginTop: 14 }}>
              <button className="primary" onClick={() => setPhase("orientation")}>
                오리엔테이션으로 이동
              </button>
            </div>
          </article>
        </div>
      )}

      {phase === "orientation" && (
        <article className="card">
          <h3>짧은 오리엔테이션</h3>
          <ul className="list">
            <li>답변은 영어로 말하세요.</li>
            <li>1번 자기소개는 warm-up으로 저장되지만 전체 리포트 평가에는 반영하지 않습니다.</li>
            <li>질문마다 한 번에 충분히 답변한다고 생각하세요.</li>
            <li>모의고사 중에는 코칭, 예시 답변, 재답변 비교가 나오지 않습니다.</li>
            <li>문항 배열은 학습용 시뮬레이션 패턴이며 공식 고정 form이 아닙니다.</li>
            <li>총 시간이 끝나거나 15문항을 모두 제출하면 전체 리포트가 생성됩니다.</li>
            <li>모르는 문항은 건너뛸 수 있고, 중간 종료 시 완료한 평가 연습 문항만으로 리포트를 만듭니다.</li>
          </ul>
          <div className="button-row" style={{ marginTop: 14 }}>
            <button className="primary" onClick={startExam}>40분 모의고사 시작</button>
            <button className="secondary" onClick={() => setPhase("setup")}>뒤로</button>
          </div>
        </article>
      )}

      {phase === "running" && currentQuestion && (
        <div className="practice-layout">
          <div className="grid">
            <InterviewerPrompt
              isPromptVisible={isPromptVisible}
              isSpeaking={isPromptSpeaking}
              listenCount={promptListenCount}
              maxListens={1}
              mode="mock"
              onPlay={playMockPrompt}
              onShowPrompt={() => setIsPromptVisible(true)}
              prompt={currentQuestion.prompt}
            />
            <article className="card">
              <h3>답변 입력</h3>
              <p className="muted">
                문항 {currentIndex + 1} / 15
                {currentIndex === 0 ? " · Warm-up, 리포트 평가 제외" : " · 평가 연습 문항"}
                . 시험 연습 흐름처럼 답변 후 바로 다음 문항으로 이동합니다.
              </p>
              <textarea
                className="textarea"
                onChange={(event) => setTranscript(event.target.value)}
                placeholder="Speak or type your answer in English..."
                value={transcript}
              />
              {error && <p className="input-error">{error}</p>}
              {isQuestionOverRecommendedTime && (
                <p className="time-alert">
                  권장 답변 시간을 넘었습니다. 핵심 문장을 마무리하고 다음 문항으로 이동하세요.
                </p>
              )}
              <div className="button-row" style={{ marginTop: 12 }}>
                <button className="secondary" disabled={isListening} onClick={listenForMockAnswer}>
                  {isListening ? "듣는 중" : "받아쓰기"}
                </button>
                <button className="primary" disabled={!transcript.trim() || isGenerating} onClick={saveCurrentAndMoveNext}>
                  {currentIndex === 14 ? "제출하고 리포트 생성" : "저장하고 다음"}
                </button>
                <button className="secondary" disabled={isGenerating} onClick={skipQuestion}>
                  건너뛰기
                </button>
                <button className="ghost" disabled={isGenerating} onClick={endExamNow}>
                  지금 종료
                </button>
              </div>
            </article>
          </div>
          <aside className="grid">
            <div className={`timer ${isOverallTimeCritical ? "critical" : isOverallTimeWarning ? "warning" : ""}`}>
              <span className="muted">남은 시간</span>
              <strong>{formatSeconds(remainingSeconds)}</strong>
            </div>
            {(isOverallTimeWarning || isOverallTimeCritical) && (
              <div className={`time-alert ${isOverallTimeCritical ? "critical" : ""}`}>
                {isOverallTimeCritical
                  ? "남은 시간이 1분 이하입니다. 가능한 답변만 빠르게 마무리하세요."
                  : "남은 시간이 5분 이하입니다. 답변을 짧게 정리하며 진행하세요."}
              </div>
            )}
            <div className={`timer ${isQuestionOverRecommendedTime ? "warning" : ""}`}>
              <span className="muted">현재 문항</span>
              <strong>{formatSeconds(questionElapsedSeconds)}</strong>
            </div>
            <div className="timer">
              <span className="muted">권장 답변</span>
              <strong>{formatSeconds(currentQuestion.answerTimeSec)}</strong>
            </div>
            <div className="timer">
              <span className="muted">문항</span>
              <strong>{currentIndex + 1}/15</strong>
            </div>
            <div className="timer">
              <span className="muted">평가 연습</span>
              <strong>{answers.filter((answer) => !answer.isWarmup).length}/14</strong>
            </div>
            <article className="card">
              <h3>앱 내부 연습 유형</h3>
              <p>{currentQuestion.type}</p>
              {currentIndex === 0 && (
                <p className="muted" style={{ marginTop: 8 }}>
                  Warm-up: 공식 자료상 warm-up은 rated activity가 아니므로 앱 리포트에서도 제외합니다.
                </p>
              )}
              <ul className="list" style={{ marginTop: 10 }}>
                {currentQuestion.evaluationFocus.map((focus) => (
                  <li key={focus}>{focus}</li>
                ))}
              </ul>
            </article>
          </aside>
        </div>
      )}

      {phase === "report" && report && (
        <div className="grid">
          <article className="card feedback">
            <h3>전체 리포트</h3>
            <p className="muted">Provider: {provider === "gemini" ? "Gemini" : "Local fallback"}</p>
            <p>{report.summaryKo}</p>
            <p className="muted" style={{ marginTop: 10 }}>
              종료 방식: {finishReasonLabel(finishReason)}
            </p>
            <p className="muted" style={{ marginTop: 10 }}>
              연습용 참고 등급(공식 점수 아님): {report.estimatedLevel}
            </p>
            <p className="muted" style={{ marginTop: 10 }}>
              Q1 자기소개 warm-up은 이 리포트의 평가 대상에서 제외했습니다.
            </p>
          </article>
          <div className="grid two">
            <article className="card">
              <h3>강점</h3>
              <ul className="list">
                {report.strengthsKo.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="card">
              <h3>약점</h3>
              <ul className="list">
                {report.weaknessesKo.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
          {report.timingKo && report.timingKo.length > 0 && (
            <article className="card">
              <h3>시간 사용</h3>
              <ul className="list">
                {report.timingKo.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          )}
          <article className="card">
            <h3>추천 복습</h3>
            <ul className="list">
              {report.recommendedPracticeKo.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="button-row" style={{ marginTop: 14 }}>
              <button className="primary" onClick={() => setPhase("setup")}>새 모의고사</button>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}

function HistoryView({
  attempts,
  mockResults,
}: {
  attempts: PracticeAttempt[];
  mockResults: MockExamResult[];
}) {
  const timingTrend = buildMockTimingTrend(mockResults);
  const weaknessInsights = analyzeWeaknessInsights({ attempts, mockResults });

  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <h2>기록</h2>
          <p className="muted">브라우저 로컬 저장소에 최근 50개 연습 결과를 저장합니다.</p>
        </div>
      </div>
      <article className="card history-timing">
        <div>
          <h3>시간 사용 추이</h3>
          <p className="muted">Q1 warm-up을 제외한 최근 3회 모의고사 기준입니다.</p>
        </div>
        {timingTrend.latest ? (
          <div className="grid three">
            <div className="metric">
              <span className="muted">최근 평균 답변</span>
              <strong>{formatOptionalSeconds(timingTrend.latest.averageElapsedSeconds)}</strong>
            </div>
            <div className="metric">
              <span className="muted">최근 초과 문항</span>
              <strong>{timingTrend.latest.overRecommendedCount}</strong>
            </div>
            <div className="metric">
              <span className="muted">최근 짧은 답변</span>
              <strong>{timingTrend.latest.veryShortCount}</strong>
            </div>
          </div>
        ) : (
          <div className="empty compact">시간 기록이 있는 모의고사 결과가 아직 없습니다.</div>
        )}
        {timingTrend.latest && (
          <p className="muted timing-summary">
            최근 3회 평균 답변 시간은 {formatOptionalSeconds(timingTrend.averageElapsedSeconds)}이고,
            권장 시간을 넘긴 문항은 평균 {timingTrend.averageOverRecommendedCount}개,
            매우 짧은 답변은 평균 {timingTrend.averageVeryShortCount}개입니다.
            {timingTrend.previous
              ? ` 직전 모의고사 평균은 ${formatOptionalSeconds(timingTrend.previous.averageElapsedSeconds)}였습니다.`
              : ""}
          </p>
        )}
      </article>
      <article className="card history-timing">
        <div>
          <h3>반복 약점</h3>
          <p className="muted">최근 개별 연습과 모의고사 피드백에서 반복된 약점입니다.</p>
        </div>
        {weaknessInsights.length === 0 ? (
          <div className="empty compact">아직 반복 약점을 계산할 기록이 부족합니다.</div>
        ) : (
          <div className="weakness-list">
            {weaknessInsights.slice(0, 4).map((insight) => (
              <div className="weakness-item" key={insight.category}>
                <strong>{insight.labelKo}</strong>
                <span>{insight.count}회</span>
                <p>{insight.reasonKo}</p>
              </div>
            ))}
          </div>
        )}
      </article>
      {attempts.length === 0 ? (
        <div className="empty">아직 저장된 연습 기록이 없습니다.</div>
      ) : (
        <div className="grid">
          {attempts.map((attempt) => (
            <article className="card" key={attempt.id}>
              <h3>{new Date(attempt.createdAt).toLocaleString("ko-KR")}</h3>
              <p className="muted">질문 ID: {attempt.questionId} / 연습용 참고 등급: {attempt.feedback.estimatedLevel}</p>
              <p style={{ marginTop: 8 }}>{attempt.feedback.summaryKo}</p>
            </article>
          ))}
        </div>
      )}
      <div className="grid" style={{ marginTop: 18 }}>
        <h3>모의고사 기록</h3>
        {mockResults.length === 0 ? (
          <div className="empty">아직 저장된 모의고사 기록이 없습니다.</div>
        ) : (
          mockResults.map((result) => {
            const timing = summarizeMockTiming(result.answers);

            return (
              <article className="card" key={result.id}>
                <h3>{new Date(result.createdAt).toLocaleString("ko-KR")}</h3>
                <p className="muted">
                  {result.targetLevel} / {timing.ratedAnswerCount}개 평가 문항 / 연습용 참고 등급: {result.report.estimatedLevel}
                </p>
                <div className="history-timing-row">
                  <span>평균 답변 {formatOptionalSeconds(timing.averageElapsedSeconds)}</span>
                  <span>권장 시간 초과 {timing.overRecommendedCount}개</span>
                  <span>짧은 답변 {timing.veryShortCount}개</span>
                  <span>총 사용 {formatSeconds(result.durationSeconds)}</span>
                </div>
                <p style={{ marginTop: 8 }}>{result.report.summaryKo}</p>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${rest}`;
}

function formatOptionalSeconds(seconds: number | null) {
  return seconds === null ? "기록 없음" : formatSeconds(seconds);
}

function getLearningPathCompletion(progress: LearningPathProgress) {
  const completed = learningPathSteps.filter((step) =>
    progress.completedStepIds.includes(step.id),
  ).length;
  const total = learningPathSteps.length;

  return {
    completed,
    total,
    percent: Math.round((completed / total) * 100),
  };
}

function getLearningPathStep(stepId: LearningPathStepId) {
  return (
    learningPathSteps.find((step) => step.id === stepId) ??
    learningPathSteps[learningPathSteps.length - 1]
  );
}

function actionLabel(action: LearningPathAction) {
  if (action === "setup") {
    return "설정 열기";
  }

  if (action === "diagnostic") {
    return "진단 시작";
  }

  if (action === "materials") {
    return "재료 보기";
  }

  if (action === "practice") {
    return "연습 시작";
  }

  if (action === "roleplay") {
    return "역할극";
  }

  if (action === "mock") {
    return "모의고사";
  }

  return "기록 보기";
}

function finishReasonLabel(reason: "completed" | "ended" | "time" | null) {
  if (reason === "completed") {
    return "15문항 완료";
  }

  if (reason === "ended") {
    return "사용자 중간 종료";
  }

  if (reason === "time") {
    return "40분 시간 종료";
  }

  return "알 수 없음";
}
