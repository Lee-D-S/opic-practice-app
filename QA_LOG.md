# QA Log

이 문서는 실제 QA 실행 결과를 기록한다. 검수 기준은 `QA_CHECKLIST.md`에 유지하고, 이 파일에는 날짜별 실행 범위, 결과, 발견한 이슈, 후속 조치를 남긴다.

## 작성 규칙

- 새 QA를 할 때마다 날짜별 섹션을 추가한다.
- 통과/실패 여부와 재현 경로를 구체적으로 적는다.
- 발견한 문제는 수정 전까지 `Open`, 수정 후에는 `Fixed`로 표시한다.
- 단순 빌드/린트 검증은 명령과 결과만 짧게 기록한다.

## 2026-05-23

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
