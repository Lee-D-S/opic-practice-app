# QA Log

이 문서는 실제 QA 실행 결과를 기록한다. 검수 기준은 `QA_CHECKLIST.md`에 유지하고, 이 파일에는 날짜별 실행 범위, 결과, 발견한 이슈, 후속 조치를 남긴다.

## 작성 규칙

- 새 QA를 할 때마다 날짜별 섹션을 추가한다.
- 통과/실패 여부와 재현 경로를 구체적으로 적는다.
- 발견한 문제는 수정 전까지 `Open`, 수정 후에는 `Fixed`로 표시한다.
- 단순 빌드/린트 검증은 명령과 결과만 짧게 기록한다.

## 2026-05-25

### 기록 화면 장기 시간 추이 차트 정적 검증

#### 범위

- 최근 최대 6회 모의고사 시간 기록을 시간순 chart point로 생성
- Q1 warm-up 제외 유지
- 기록 화면에 평균 답변 시간, 권장 시간 초과 문항, 짧은 답변 막대 표시
- 시간 기록이 없는 모의고사는 차트에서 제외

#### 결과

- `rtk npm test`: Pass, 10 files / 27 tests
- `rtk npm run build`: Pass
- `rtk npm run lint`: Pass with warning

#### 발견 이슈

- Open: `src/app/page.tsx`의 기존 모의고사 타이머 `useEffect`에 `react-hooks/exhaustive-deps` warning 1건이 남아 있다.
- Not covered: 실제 브라우저에서 여러 모의고사 기록이 있는 상태의 차트 폭과 모바일 표시를 수동 확인해야 한다.

### 질문은행 세부 서베이 항목 확장 정적 검증

#### 범위

- 세부 Background Survey 항목 ID를 문항 데이터에 연결
- 선택한 세부 항목 문항을 broad tag 문항보다 우선 추천
- 공원, 캠핑, 요리, 걷기, staycation, 콘서트, 주거 개선, 국내/해외 여행, 반려동물 전용 문항 존재
- 개별 연습 질문 텍스트 숨김/공개 테스트 기대값 갱신

#### 결과

- `rtk npm test`: Pass, 10 files / 26 tests
- `rtk npm run build`: Pass
- `rtk npm run lint`: Pass with warning

#### 발견 이슈

- Open: `src/app/page.tsx`의 기존 모의고사 타이머 `useEffect`에 `react-hooks/exhaustive-deps` warning 1건이 남아 있다.
- Open: 실제 브라우저에서 서베이 항목 변경 후 추천 질문이 즉시 세부 항목 중심으로 바뀌는지 수동 확인이 필요하다.

### 반복 약점 집계 정적 검증

#### 범위

- 개별 연습 개선점 기반 약점 집계
- 모의고사 약점, 추천 복습, 시간 피드백 기반 약점 집계
- 반복 약점이 있으면 학습 경로 추천에서 우선 반영
- 기록 화면 반복 약점 카테고리와 반복 횟수 표시

#### 결과

- `rtk npm test`: Pass, 9 files / 23 tests
- `rtk npm run build`: Pass
- `rtk npm run lint`: Pass with warning

#### 발견 이슈

- Open: `src/app/page.tsx`의 기존 모의고사 타이머 `useEffect`에 `react-hooks/exhaustive-deps` warning 1건이 남아 있다.
- Not covered: 실제 브라우저에서 다양한 한국어 피드백 문구가 의도한 약점 카테고리로 잘 묶이는지 수동 확인이 필요하다.

### 기록 화면 시간 추이 정적 검증

#### 범위

- Q1 warm-up 제외 시간 요약
- 최근 3회 모의고사 평균 답변 시간 계산
- 권장 시간 초과 문항 수 계산
- 매우 짧은 답변 수 계산
- 기록 화면 모의고사별 시간 요약 표시

#### 결과

- `rtk npm test`: Pass, 8 files / 20 tests
- `rtk npm run build`: Pass
- `rtk npm run lint`: Pass with warning

#### 발견 이슈

- Open: `src/app/page.tsx`의 기존 모의고사 타이머 `useEffect`에 `react-hooks/exhaustive-deps` warning 1건이 남아 있다.
- Not covered: 실제 브라우저에서 오래된 저장 데이터와 신규 저장 데이터가 섞인 기록 화면을 수동 확인해야 한다.

### DS Interviewer UI 상호작용 자동화 검증

#### 범위

- 개별 연습 질문 텍스트 기본 숨김
- 개별 연습 질문 듣기 음성 합성 호출
- 개별 연습 질문 텍스트 보기 후 프롬프트 공개
- 모의고사 질문 듣기 1회 제한
- 모의고사 질문 텍스트 보기 후 warm-up 프롬프트 공개

#### 결과

- `rtk npm test`: Pass, 7 files / 18 tests

#### 발견 이슈

- Not covered: 실제 브라우저의 오디오 출력, 마이크 권한, 모바일 터치 동작은 수동 확인이 필요하다.

## 2026-05-24

### Background Survey 정적 검증

#### 범위

- Background Survey 4파트 구조
- Part 4 총 12개 이상 선택 안내
- Self Assessment 6단계 선택과 앱 목표 등급 매핑
- 문제 다시 듣기 1회 제한
- 기존 `surveyTags` 저장값과 새 `backgroundSurvey` 저장값 호환
- 추천 질문/모의고사 입력값 유지

#### 결과

- `rtk npm test`: Pass, 6 files / 16 tests
- `rtk npm run build`: Pass
- `rtk npm run lint`: Pass with warning

#### 발견 이슈

- Open: `src/app/page.tsx`의 기존 모의고사 타이머 `useEffect`에 `react-hooks/exhaustive-deps` warning 1건이 남아 있다.
- Not covered: 실제 브라우저에서 Background Survey 선택 UI와 저장 상태를 수동 확인해야 한다.

### 학습 기록 기반 추천 정적 검증

#### 범위

- 답변 재료 저장 여부 기반 추천
- 최근 답변 길이 기반 추천
- 역할극 약점 기반 추천
- 모의고사 기록 유무 기반 추천
- 시간 사용 피드백 기반 추천
- 학습 경로 UI 추천 이유 표시

#### 결과

- `rtk npm test`: Pass, 6 files / 16 tests
- `rtk npm run build`: Pass
- `rtk npm run lint`: Pass with warning

#### 발견 이슈

- Open: `src/app/page.tsx`의 기존 모의고사 타이머 `useEffect`에 `react-hooks/exhaustive-deps` warning 1건이 남아 있다.
- Not covered: 브라우저에서 실제 학습 경로 화면의 추천 이유 표시와 버튼 이동을 수동 확인해야 한다.

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
- 모의고사 문항당 질문 다시 듣기 1회 제한
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
