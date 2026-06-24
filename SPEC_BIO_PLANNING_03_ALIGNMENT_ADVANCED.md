# SPEC 03 — 가설-목표-방법 정렬 검사기 고급 규칙

작성/구현/검증: Claude (Ralph 워크플로우)
상태: 승인됨 — 사용자가 `/ralph`로 SPEC 03 진행을 지시(2026-06-24)

근거: `PROGRESS_BIO_PLANNING.md` 2-2 — "가설-목표-방법 정렬 검사기 고급 규칙 — 캔버스 기본경고를 넘는 심화 정렬 검사"

---

## 0. 범위

### 다루는 것
- `SPEC_BIO_PLANNING_01`의 기본 정합성 경고(C-01~C-07)를 넘어서는 **심화 정렬 규칙 A-01~A-06**.
- 문헌조사 보드(SPEC 02)의 지식공백 데이터를 캔버스 경고에 단방향으로 연동(A-06).

### 다루지 않는 것
- C-01~C-07 규칙 자체의 수정 (기존 SPEC 01 범위 유지).
- 문헌조사 보드 쪽 UI 변경 (캔버스에서 읽기만 함).

### 설계 원칙
- 기존 `evaluateCanvas()` / `#canvasWarnings` 렌더링 파이프라인에 결합. 별도 UI 신설 없음.
- 신규 라이브러리 도입 금지. 순수 함수로 분리해 단위 테스트 가능하게 유지.

## 1. 규칙 정의 — A-01 ~ A-06

| 규칙 ID | 조건 | 심각도 | 메시지 | 근거 |
|---|---|---|---|---|
| A-01 | `successCriteria`에 임계값 표현은 있으나, `primaryOutcome`의 측정 단위 계열과 다른 계열의 임계값을 쓴 경우(예: 결과변수는 "시간/생존"인데 성공기준은 "%"만 있고 시간 단위 언급이 없음) | info | "성공 기준의 단위가 1차 결과변수의 측정 단위와 다르게 보입니다. 결과변수와 같은 단위로 합격선을 표현하세요." | 가이드 4·10장(정렬) |
| A-02 | `studyType`이 선택되어 있고 `researchQuestion`에 해당 유형의 `coreQuestion` 핵심 키워드가 전혀 없음 | info | "연구 질문이 선택한 유형({label})의 핵심 질문과 거리가 있어 보입니다. 유형에 맞는 핵심 질문을 참고해 보세요." | 가이드 2·4장 |
| A-03 | `studyType`이 `clinical` 또는 `nonclinical`인데 `mainRisk`가 비어 있음 | warn | "임상/비임상 연구는 주요 리스크 식별이 필수적입니다. 가장 큰 실패 가능성을 적어주세요." | 가이드 4·9장 |
| A-04 | `studyType`이 `nonclinical`인데 `goNoGo`가 비어 있음 | warn | "비임상 연구는 다음 단계(임상/추가 검증) 진입 여부를 가를 Go/No-Go 기준이 필요합니다." | 가이드 4·10장 |
| A-05 | `secondaryOutcomes`에 `primaryOutcome`과 동일하거나 매우 유사한 항목이 포함됨(정규화 후 완전 일치 비교) | info | "2차 결과변수가 1차 결과변수와 동일합니다. 서로 다른 지표를 보완적으로 선택하세요." | 가이드 4장 |
| A-06 | 문헌조사 보드의 `gap` 컬럼이 비어 있고 `gapSummary`도 비어 있음(캔버스가 아닌 문헌조사 보드 상태 참조) | info | "문헌조사 보드에 아직 지식공백이 정리되지 않았습니다. 문헌조사 보드에서 미충족질문을 먼저 정리하면 연구 질문을 더 다듬을 수 있습니다." | 가이드 3·4장, SPEC 02 연동 |

비고:
- A-01~A-05는 `canvasState`만 입력으로 받는 순수 함수 `evaluateAdvancedAlignment(state)`로 구현.
- A-06은 문헌조사 보드 상태(`litBoardState`)도 함께 읽어야 하므로 `evaluateAdvancedAlignment(state, litBoardState)`로 시그니처를 확장.
- 모든 규칙은 advisory(안내)이며 입력을 막지 않는다. 기존 C-규칙과 동일한 `{id, severity, message}` 형태로 반환해 `renderCanvasWarnings()`가 하나의 리스트로 합쳐 렌더링한다.

## 2. 연동 지점
- `renderCanvasWarnings()`: `evaluateCanvas(canvasState)` 결과 + `evaluateAdvancedAlignment(canvasState, litBoardState)` 결과를 합쳐 ID 순으로 정렬 후 렌더.
- 캔버스 탭은 문헌조사 보드 상태를 **읽기만** 한다(단방향 의존, `litBoardState`를 캔버스에서 수정하지 않음).

## 3. 수용 기준
- AC-1: A-01~A-05 각각 트리거 조건과 비트리거 조건에서 올바르게 동작한다(단위 테스트로 검증).
- AC-2: 문헌조사 보드 gap 컬럼과 gapSummary가 모두 빈 상태에서 A-06 경고가 보인다.
- AC-3: gap 컬럼에 카드 1개 추가 또는 gapSummary 입력 시 A-06 경고가 사라진다.
- AC-4: 기존 C-01~C-07 경고 동작에 회귀가 없다.
- AC-5: 기존 8+1개(litboard 포함 9개) 글로벌 탭 회귀 없음.

## 4. 구현 노트
- 함수: `evaluateAdvancedAlignment(state, litBoardState)` — `lifecycle.html`, `evaluateCanvas()` 인근에 정의.
- `renderCanvasWarnings()`가 `litBoardState`를 참조하도록 수정(전역 변수, SPEC 02에서 이미 정의됨).
- DOM 렌더링은 기존과 동일하게 `escapeHtml()`을 통해 사용자 입력을 안전하게 삽입.
