# QA Log

이 문서는 실제 QA 실행 결과를 기록한다. 검수 기준은 `QA_CHECKLIST.md`에 유지하고, 이 파일에는 날짜별 실행 범위, 결과, 발견한 이슈, 후속 조치를 남긴다.

## 작성 규칙

- 새 QA를 할 때마다 날짜별 섹션을 추가한다.
- 통과/실패 여부와 재현 경로를 구체적으로 적는다.
- 발견한 문제는 수정 전까지 `Open`, 수정 후에는 `Fixed`로 표시한다.
- 단순 빌드/린트 검증은 명령과 결과만 짧게 기록한다.

## 2026-05-24

### 모의고사 리포트 시간 분석 정적 검증

#### 범위

- local mock report timing feedback
- Gemini mock report prompt timing fields
- mock report UI time usage section
- Q1 warm-up exclusion from timing analysis

#### 결과

- `rtk npm test`: Pass, 5 files / 10 tests
- `rtk npm run build`: Pass
- `rtk npm run lint`: Pass with warning

#### 발견 이슈

- Open: `src/app/page.tsx`의 기존 모의고사 타이머 `useEffect`에 `react-hooks/exhaustive-deps` warning 1건이 남아 있다.
- Not run: 브라우저에서 실제 모의고사 완료 후 시간 사용 섹션 표시를 수동 확인해야 한다.

### API route fallback 테스트 정적 검증

#### 범위

- feedback API route Gemini 실패 fallback
- compare API route Gemini 실패 fallback
- mock-report API route Gemini 실패 fallback
- Vitest alias configuration

#### 결과

- `rtk npm test`: Pass, 5 files / 10 tests
- `rtk npm run build`: Pass
- `rtk npm run lint`: Pass with warning

#### 발견 이슈

- Open: `src/app/page.tsx`의 기존 모의고사 타이머 `useEffect`에 `react-hooks/exhaustive-deps` warning 1건이 남아 있다.
- Not covered: DS Interviewer UI 버튼 동작과 브라우저 음성 합성은 아직 자동화 테스트가 없다.

### 자동화 테스트 도입 정적 검증

#### 범위

- Vitest test script
- storage persistence/fallback unit tests
- local mock report Q1 warm-up exclusion unit test
- 관련 문서 동기화

#### 결과

- `rtk npm test`: Pass, 2 files / 7 tests
- `rtk npm run build`: Pass
- `rtk npm run lint`: Pass with warning

#### 발견 이슈

- Open: `src/app/page.tsx`의 기존 모의고사 타이머 `useEffect`에 `react-hooks/exhaustive-deps` warning 1건이 남아 있다.
- Not covered: 피드백/비교/모의고사 API route fallback 테스트와 UI 상호작용 테스트는 아직 없다.

## 2026-05-23

### 답변 재료 저장 정적 검증

#### 범위

- 주제별 이야기/이유/구체 예시 메모 입력
- 답변 재료 localStorage 저장
- 최근 저장 시각 표시
- 답변 재료 정리 단계 완료 연결
- 관련 문서 동기화

#### 결과

- `rtk npm run build`: Pass
- `rtk npm run lint`: Pass with warning

#### 발견 이슈

- Open: `src/app/page.tsx`의 기존 모의고사 타이머 `useEffect`에 `react-hooks/exhaustive-deps` warning 1건이 남아 있다.
- Not run: 브라우저에서 실제 저장, 새로고침 후 유지, 단계 완료 연결을 수동 확인해야 한다.

### DS Interviewer 음성 질문 UI 정적 검증

#### 범위

- 개별 연습 질문 텍스트 기본 숨김
- 모의고사 질문 텍스트 기본 숨김
- 브라우저 음성 합성 질문 재생
- 모의고사 문항당 질문 듣기 2회 제한
- 관련 문서 동기화

#### 결과

- `rtk npm run build`: Pass
- `rtk npm run lint`: Pass with warning

#### 발견 이슈

- Fixed: `public/ds-interviewer.webp` 이미지 자산을 추가했고, 원본 PNG 대비 용량을 줄였다.
- Open: `src/app/page.tsx`의 기존 모의고사 타이머 `useEffect`에 `react-hooks/exhaustive-deps` warning 1건이 남아 있다.
- Not run: 브라우저에서 실제 질문 음성 재생, 텍스트 보기, 모의고사 듣기 제한을 수동 확인해야 한다.

### 모의고사 타이밍 UX 정적 검증

#### 범위

- 전체 남은 시간 경고 UI
- 현재 문항 경과 시간과 권장 답변 시간 표시
- 문항별 소요 시간 저장 필드
- 관련 문서 동기화

#### 결과

- `rtk npm run build`: Pass
- `rtk npm run lint`: Pass with warning

#### 발견 이슈

- Open: `src/app/page.tsx`의 기존 모의고사 타이머 `useEffect`에 `react-hooks/exhaustive-deps` warning 1건이 남아 있다.
- Not run: 브라우저에서 실제 타이머 증가, 문항 이동 후 초기화, 5분/1분 경고 표시를 수동으로 확인해야 한다.

### 학습 경로 MVP 정적 검증

#### 범위

- 학습 경로 MVP 구현 후 정적 검증
- 빌드 및 lint 명령 확인
- 로컬 개발 서버 응답 확인

#### 결과

- `rtk npm run build`: Pass
- `rtk npm run lint`: Pass with warning
- `http://127.0.0.1:3000`: HTTP 200

#### 발견 이슈

- Open: `src/app/page.tsx`의 기존 모의고사 타이머 `useEffect`에 `react-hooks/exhaustive-deps` warning 1건이 남아 있다.

#### 비고

- 이번 기록은 자동/정적 검증 중심이다. 브라우저에서 실제 클릭 플로우를 확인하는 수동 QA는 아직 별도로 수행하지 않았다.
