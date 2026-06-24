# 진행 상황 정리 — 바이오 연구기획 기능화

최종 업데이트: 2026-06-24 (Claude + Codex)

이 문서는 `바이오 연구기획` 기능을 `lifecycle.html`에 추가하는 작업의 진행/잔여 작업을 한눈에 정리한 핸드오프 문서다.

---

## 1. 지금까지 한 것 (DONE)

### 1-1. 설계/명세
- **SPEC 01 작성** — `SPEC_BIO_PLANNING_01_CANVAS_WIZARD.md`
  - 연구 질문 캔버스 12개 입력 필드 스키마(필수 6개)
  - 정합성 경고 규칙 C-01~C-07, 유형 분기 규칙 W-01~W-05
  - 1페이지 컨셉 노트 출력 템플릿(가이드 10-1 기반)
  - 수용 기준 AC-1~AC-7
  - 사용자 결정 4건 확정 반영(아래)

### 1-2. 확정된 사용자 결정 (2026-06-17)
- D-1: 유형 마법사 = **캔버스 탭 내 통합** (별도 탭 없음)
- D-2: 컨셉 노트 = **인라인 textarea**
- D-3: 유형 = **6개 전체** (산업화 R&D 포함)
- D-4: 다운로드 = **.txt + .md 둘 다**

### 1-3. 구현 (FEAT-01 + FEAT-02) — `lifecycle.html`
신규 글로벌 탭 `🧭 연구 질문 캔버스` 추가. 통합 탭이라 캔버스(FEAT-01)와 유형 마법사(FEAT-02)를 함께 구현.

- **입력/영속화**: 12개 필드, `localStorage` 키 `rd_canvas_state`. 새로고침 후 값 유지.
- **경고 엔진**: 순수 함수 `evaluateCanvas(state)` → C-01~C-07. 실시간 갱신, `aria-live`.
- **유형 마법사**: `STUDY_TYPES` 단일 데이터 소스(6유형). 유형 선택 시 핵심질문·산출물·체크리스트·리스크 표시. 유형별 체크 상태는 `rd_studytype_checklist`에 보존(W-02). W-03~W-05 주의 배너.
- **컨셉 노트**: `buildConceptNote()` → 인라인 textarea 출력, 복사 / `.txt` / `.md` 다운로드. 필수 빈칸 시 "미완성 초안" 표시.
- **통합 지점**: `switchView`, `handleRouting`, `DOMContentLoaded`(`initCanvas()`)에 연결. 기존 디자인 토큰(`--accent`, `--danger`, `--ok`) 재사용.

### 1-4. 검증한 것
- `node reseach_planning_workflow/scripts/verify_lifecycle_canvas.js` 통과
  - `lifecycle.html` 인라인 스크립트 구문 검사(`new Function(scriptBody)`)
  - `STUDY_TYPES` 6유형 정의 존재, 각 유형의 핵심질문/산출물/리스크/체크리스트 구조 검증
  - `evaluateCanvas` 단위 검증: 빈상태(C-01+C-07) / 양호(0건) / C-06 정렬오류 감지
  - `buildConceptNote()` 완성본 text/md 출력과 미완성 초안 마커 확인
- `file://` 브라우저 수동 확인
  - AC-1: 입력값 새로고침 후 유지 확인
  - AC-2: 필수 빈칸 시 C-01 경고 노출 확인
  - AC-3: 가설=효능 / 주요평가지표=안전성 입력 시 C-06 경고 확인
  - AC-4: 컨셉 노트 생성, 복사, `.txt`, `.md` 다운로드 동작 확인
  - AC-5: 6개 유형의 핵심질문/산출물/체크리스트/리스크 패널 전수 확인
  - AC-6: 유형 전환 후 복귀 시 체크 상태 보존 확인
  - AC-7: 대시보드, `실무 용어 사전`, `참고 자료 및 법령` 문서함 렌더 스모크 확인
  - VERIFY-02 일부: 문서함 카드 `전체보기` 기준 모달 열기/닫기, 포커스 복귀 확인
  - VERIFY-02 일부: 검색 결과 렌더 함수 기준 특정 페이지(`#page=N`) 점프, ESC/오버레이 닫기, `새 탭에서 열기 ↗` 링크 회귀 확인
  - 모바일 기본 스모크: 캔버스 뷰에서 horizontal overflow 없음
- 한계(2026-06-24 Claude가 서버 기반 자동화로 해소 — 1-6 참고)
  - `file://` 환경에서는 `fetch()`가 차단되어 법령 검색의 실제 인덱스 로드·원문 검색 연동을 완전 검증할 수 없음
  - 모바일 반응형 전수, 서버 환경에서의 실제 PDF 로드 완료 확인은 추가 수동 검증 필요

### 1-5. 구현(신규) — 법령·매뉴얼 문서함(전체 문서 인앱 뷰어) — `lifecycle.html`
사용자 요청으로 TODO 최우선 순위로 승격되어 구현. 기존 원문 검색은 새 탭으로 PDF를 여는 것만 가능했는데, 프로그램 화면 안에서 문서 전체를 펼쳐 볼 수 있도록 확장.

- **문서함 목록**: `LEGAL_DOCS` 상수(11종, `data/legal_index.json`과 동일 문서명/타입)로 `#legalDocList` 카드 그리드 렌더(`renderLegalDocList()`).
- **인앱 PDF 뷰어 모달**: `#docViewerOverlay`(`doc-viewer-card`, 92vw×90vh) + `<iframe id="docViewerFrame">`. 브라우저 내장 PDF 렌더러 사용, 신규 라이브러리 미도입.
- **열기 경로 2가지**: (1) 문서함 카드의 `전체보기` 버튼 → 1페이지부터, (2) 원문 검색 결과의 `📖 여기서 전체보기` 버튼 → 검색된 페이지(`#page=N`)로 바로 이동. 기존 `새 탭에서 열기 ↗` 링크는 유지(회귀 없음).
- **접근성/모달 패턴**: 기존 `lawModalOverlay`와 동일한 열기/닫기/ESC/오버레이클릭 패턴 재사용(`openDocViewer`/`closeDocViewer`/`setupDocViewerEvents`).
- **검증한 것**: `LEGAL_DOCS` 11개 항목명이 실제 PDF 파일명·인덱스 `doc` 필드와 1:1 일치 확인, 로컬 서버(8765)에서 `lifecycle.html`/`data/legal_index.json`/PDF 경로 모두 HTTP 200 확인.
- **남은 것**: ~~브라우저에서 모달 열림/페이지 이동/닫기 수동 확인 필요~~ → 1-6에서 서버 기반 자동화로 완료.

### 1-6. 검증(신규) — 로컬 HTTP 서버 + 헤드리스 브라우저 자동화 (2026-06-24, Claude)
Codex가 `file://` 제약으로 미완료 표시했던 항목(`fetch()` 기반 검색, PDF 로드, AC-7 전수 회귀, 모바일 반응형 전수)을 로컬 서버(8765)를 띄운 채 Playwright(임시 설치, 프로젝트에는 미포함)로 실제 클릭/네비게이션하며 검증.

- **검증 범위(28건 전부 PASS)**:
  - 문서함 카드 11개 렌더, `전체보기` 클릭 → 모달 오픈 → iframe `src`에 `#page=1` 세팅
  - `fetch('data/legal_index.json')` 기반 실검색 동작("기술료" 검색 → 30건), 검색 결과 → `📖 여기서 전체보기` → 같은 모달에서 해당 페이지로 이동
  - 모달 닫기 3가지 경로(ESC / 오버레이 배경 클릭 / `×`) 모두 정상
  - `새 탭에서 열기 ↗` 링크 회귀 없음
  - AC-7: 8개 글로벌 탭(대시보드/캔버스/리스크/소스/용어사전/조직도/타임라인/준비도) 전수 정상 표시, 콘솔 에러 0건
  - 모바일(390px 뷰포트): 8개 탭 전수 가로 overflow 없음(0px), 문서 뷰어 모달도 화면 안에 정상 표시
  - PDF 응답 직접 확인: 서버가 `200 OK` + `Content-Type: application/pdf`로 정상 응답(네트워크 레벨 확인)
- **알아둘 한계**: 헤드리스 Chromium에는 구글 크롬 전용 PDF 뷰어 플러그인이 없어 iframe 안에 PDF가 "시각적으로 그려지는지"는 자동화로 확인 불가(다운로드 이벤트로 처리됨). 서버 응답 자체는 정상이므로 기능은 동작하나, **정식 Chrome/Edge/Safari에서 1회 눈으로 보는 최종 확인은 여전히 권장**(차단 항목 아님, 선택적 확인).
- Playwright는 검증 1회성 도구로 임시 디렉터리에만 설치했고 프로젝트(`package.json`/`node_modules`)에는 추가하지 않음(스택 추가 금지 원칙 준수).

### 1-7. 구현(신규) — SPEC 02 문헌조사 보드 (2026-06-24, Claude)
사용자가 `/ralph`로 OMC 풀스택 워크플로우를 요청했으나 `.agents/`·`oma` CLI·Serena MCP가 이 프로젝트에 없어, 사용자 선택에 따라 기존 멀티에이전트 하네스(START_HERE.md)로 SPEC 02부터 직접 진행. 명세는 `SPEC_BIO_PLANNING_02_LITERATURE_BOARD.md`.

- **신규 글로벌 탭**: `📑 문헌조사 보드`(`data-tab="litboard"`), `🧭 연구 질문 캔버스` 바로 다음.
- **5컬럼 보드**(`#litColumnsGrid`): 표준지식/핵심근거/모순지점/미충족질문/기획함의. 각 컬럼은 제목(필수)·출처·메모 입력 폼 + 추가/삭제 가능한 카드 리스트.
- **경쟁연구·실패사례**(`#litSideGrid`): 5컬럼과 시각적으로 분리된 2열 섹션, 동일 카드 패턴(출처 칸 제외).
- **지식공백 요약**(`#litGapSummary`): 자유 textarea, input 즉시 저장.
- **영속화**: `localStorage` 키 `rd_lit_board_state` (컬럼 5개 + competitors/failures + gapSummary). 캔버스의 `rd_canvas_state` 패턴과 동일한 디바운스 없는 즉시 저장 방식.
- **함수**: `initLitBoard()`, `renderLitBoard()`, `addLitCard(group, key)`, `deleteLitCard(group, key, id)`, `saveLitBoardState()`. `escapeHtml()` 기존 헬퍼 재사용으로 XSS 방지.
- **검증한 것**: `node --check` 구문 통과, 기존 `scripts/verify_lifecycle_canvas.js` 회귀 없음(5건 PASS). 신규 `scripts/verify_litboard_playwright.js`(선택적, playwright 별도 설치 필요)로 AC-1~AC-6 전부 자동 검증(21건 PASS): 카드 추가/삭제/새로고침 후 유지, 빈 제목 추가 차단, 경쟁연구·실패사례 분리 렌더, 지식공백 요약 유지, 9개 글로벌 탭 전수 회귀(콘솔 에러 0건), 모바일(390px) overflow 0px. 기존 문서함/검색 28건 검증도 재실행해 회귀 없음 확인.
- **남은 것**: 없음. SPEC 02 수용기준 AC-1~AC-6 전부 충족.

### 1-8. 구현(신규) — SPEC 03 가설-목표-방법 정렬 검사기 고급 규칙 (2026-06-24, Claude, Ralph 워크플로우)
사용자가 `랄프로 진행해`로 OMC `/oh-my-claudecode:ralph`를 지시. 이 프로젝트엔 `.agents/`·`oma` CLI·Serena MCP가 없어 ralph는 PRD(`prd.json`, 세션 스코프) + 네이티브 Claude Code 에이전트 기반으로 동작. 명세는 `SPEC_BIO_PLANNING_03_ALIGNMENT_ADVANCED.md`.

- **심화 정렬 규칙 A-01~A-06**: 기존 캔버스 기본경고(C-01~C-07)에 추가되는 advisory 규칙.
  - A-01: 성공기준 단위가 1차 결과변수 단위 계열과 다름(%, 시간 계열 비교)
  - A-02: 연구 질문이 선택한 연구유형의 핵심 키워드와 거리가 있음
  - A-03: 임상/비임상 유형인데 주요 리스크 미기입
  - A-04: 비임상 유형인데 Go/No-Go 기준 미기입
  - A-05: 1차/2차 결과변수 중복
  - A-06: 문헌조사 보드(SPEC 02)의 지식공백(`gap` 컬럼 + `gapSummary`)이 모두 비어 있음 — 캔버스가 문헌조사 보드 상태를 읽기 전용으로 단방향 참조
- **구현**: `evaluateAdvancedAlignment(state, litBoardState)` 순수 함수, `renderCanvasWarnings()`가 기존 `evaluateCanvas()` 결과와 합쳐 `#canvasWarnings`에 함께 렌더.
- **검증한 것**: `node --check` 통과, 기존 `verify_lifecycle_canvas.js` 5건 회귀 없음. 신규 `scripts/verify_alignment_advanced.js`(VM 기반 단위 테스트, 6개 규칙 × 트리거/비트리거)로 A-01~A-06 전부 PASS. 신규 `scripts/verify_alignment_ui_playwright.js`(선택적)로 실제 브라우저에서 A-03/A-04/A-06 배너 표시·소멸과 문헌조사 보드→캔버스 연동까지 6건 PASS. 기존 문서함/검색 28건, 문헌조사 보드 21건 재실행도 회귀 없음 확인.
- **남은 것**: 없음. SPEC 03 수용기준 AC-1~AC-5 전부 충족.

### 1-9. 구현(신규) — SPEC 04 IRB/규제 체크 허브 (2026-06-24, Claude)
사용자가 "IRB/규제 체크 허브 진행해"로 직접 지시. 명세는 `SPEC_BIO_PLANNING_04_IRB_HUB.md`.

- **신규 글로벌 탭**: `🧬 IRB/규제 체크 허브`(`data-tab="irbhub"`), `🛡️ 제안서 선제 대응표` 다음.
- **질문형 흐름(이진 트리)**: Q1(사람 대상?) → Q2(직접 개입?) 또는 Q3(동물 대상?) → 4개 리프(`humanIntervention`/`humanDataOnly`/`animal`/`none`).
- **리프별 결과**: 안내 배너(`caution-card`) + 체크리스트(체크박스, 즉시 저장) + 법령 근거 칩. 칩 클릭 시 기존 `showLawModal()`/`lawModalOverlay` 패턴 재사용.
- **법령 DB 확장**: `LAW_DATABASE`에 `생명윤리법 제15조`, `생명윤리법 제16조`, `개인정보보호법 제15조`, `동물보호법 제47조` 4개 추가(기존 형식과 동일, 교육용 일반화 요약).
- **영속화**: `localStorage` 키 `rd_irb_state`(answers, leaf, 리프별 checklist). 리프 전환·초기화해도 다른 리프의 체크 상태는 보존.
- **검증한 것**: `node --check` 통과, 기존 `verify_lifecycle_canvas.js`(5건)/`verify_alignment_advanced.js`(6건) 회귀 없음. 신규 `scripts/verify_irbhub_playwright.js`(선택적)로 AC-1~AC-5 23건 전부 PASS: 4개 리프 전수 도달, 법령 모달 연계, 체크리스트 새로고침 후 유지, 초기화 후에도 다른 리프 체크 보존, 10개 글로벌 탭 전수 회귀(콘솔 에러 0건). 기존 문서함/검색 28건 + 문헌조사 보드 21건 + 정렬검사기 UI 6건 재실행도 회귀 없음(총 78건 PASS).
- **남은 것**: 없음. SPEC 04 수용기준 AC-1~AC-5 전부 충족.

### 1-10. 구현(신규) — SPEC 05 연구계획서 초안 생성기 (2026-06-24, Claude)
사용자가 "연구계획서 초안 생성기 진행해"로 직접 지시. 명세는 `SPEC_BIO_PLANNING_05_PROPOSAL_DRAFT.md`.

- **신규 글로벌 탭**: `📝 연구계획서 초안 생성기`(`data-tab="proposal"`), `🧬 IRB/규제 체크 허브` 다음.
- **재사용 우선**: 신규 입력은 `연구 기간`/`통계분석 방법` 2개뿐. 나머지는 캔버스(`canvasState`)·문헌조사 보드(`litBoardState.gapSummary`)·`STUDY_TYPES`를 읽기 전용으로 가져와 7섹션(Specific Aims/목차/연구배경/연구방법/통계분석계획/연구일정/리스크·Go-No-Go) 초안 생성.
- **함수**: `buildProposalDraft(format)`, `copyProposalDraft()`, `downloadProposalDraft(ext)`. 공용 `downloadTextFile(content, filename, ext)` 헬퍼를 신설해 기존 `downloadConceptNote`도 함께 재사용하도록 리팩터(중복 제거).
- **영속화**: `localStorage` 키 `rd_proposal_state`(연구기간/통계분석방법만 저장 — 나머지는 출처 데이터를 그대로 참조하므로 별도 저장 불필요).
- **검증한 것**: `node --check` 통과, 기존 `verify_lifecycle_canvas.js`(5건)/`verify_alignment_advanced.js`(6건) 회귀 없음. 신규 `scripts/verify_proposal_playwright.js`(선택적)로 AC-1~AC-6 22건 전부 PASS: 7섹션 전수 생성, 미완성 배너 표시·소멸, 문헌조사 보드 연계, 신규 입력 새로고침 후 유지, 복사/.txt 다운로드 동작, 11개 글로벌 탭 전수 회귀(콘솔 에러 0건). 기존 문서함/검색 28건+문헌조사 보드 21건+정렬검사기 UI 6건+IRB 허브 23건 재실행도 회귀 없음(총 100건 PASS).
- **남은 것**: 없음. SPEC 05 수용기준 AC-1~AC-6 전부 충족.

---

## 2. 앞으로 해야 하는 것 (TODO)

### 2-1. 브라우저 실측 검증 (VERIFY-01·VERIFY-02) — 완료
CLI 로직 검증(Codex, `file://`) → 서버 기반 자동화 검증(Claude, 1-6)까지 완료. SPEC 수용기준 기준:
- [x] AC-1: 입력값이 새로고침 후 유지되는가
- [x] AC-2: 필수 빈칸 시 C-01 경고 노출
- [x] AC-3: 가설=효능 / 변수=안전성 입력 시 C-06 경고
- [x] AC-4: 컨셉 노트 생성 + 복사 + .txt/.md 다운로드 동작
- [x] AC-5: 6개 유형 각각 고유 체크리스트/산출물/리스크 표시
- [x] AC-6: 유형 전환 후 복귀 시 각 유형 체크 상태 보존
- [x] AC-7: 기존 단계 네비/용어사전/계산기 회귀 없음 (8개 글로벌 탭 전수 + 콘솔 에러 0건, 1-6 참고)
- [x] 모바일/반응형 레이아웃 확인 (390px 뷰포트, 8개 탭 전수 가로 overflow 0px)
- [x] VERIFY-02: `참고 자료 및 법령` 탭 → 문서함 카드 `전체보기` 클릭 시 모달이 열리고 PDF 요청이 200+application/pdf로 응답하는가 (시각적 렌더는 정식 브라우저 1회 권장 확인 — 차단 아님)
- [x] VERIFY-02: 원문 검색 후 결과의 `📖 여기서 전체보기` 클릭 시 같은 모달에서 검색된 페이지로 이동하는가 (실제 fetch 검색 결과로 확인, "기술료" 검색 30건)
- [x] VERIFY-02: 모달 `×`/오버레이 클릭/ESC로 닫히고, 닫은 뒤 포커스가 복귀하는가
- [x] VERIFY-02: `새 탭에서 열기 ↗` 링크가 기존처럼 그대로 동작하는가(회귀 없음)

### 2-2. 다음 기능 (우선순위 순, 브리프 기준)
- [x] **SPEC 02 + 구현: 문헌조사 보드** — 5컬럼(표준지식/핵심근거/모순지점/미충족질문/기획함의), 지식공백 요약, 경쟁연구·실패사례 분리. 완료 내역은 1-7 참고.
- [x] **SPEC 03 + 구현: 가설-목표-방법 정렬 검사기 고급 규칙** — A-01~A-06, 캔버스 기본경고에 통합 + 문헌조사 보드 연동. 완료 내역은 1-8 참고.
- [x] **SPEC 04 + 구현: IRB/규제 체크 허브** — 질문형 체크 흐름(4개 리프), 법령 모달 연계. 완료 내역은 1-9 참고.
- [x] **SPEC 05 + 구현: 연구계획서 초안 생성기** — Specific Aims, 목차, 통계계획 초안. 완료 내역은 1-10 참고.
- [/] **SPEC 06 + 구현: 예산·인력·일정·리스크 패널** — 구현 완료(FEAT-08), 플레이라이트 자동 검증 진행 중 토큰 한도로 중단(VERIFY-07).

### 2-3. 연동 메모(후속 기능이 캔버스를 입력으로 사용)
- 컨셉 노트의 입력값(`canvasState`)이 문헌조사 보드·정렬검사기·초안생성기의 중심 입력이 된다.
- `STUDY_TYPES`는 단일 소스이므로 후속 기능도 같은 상수를 재사용할 것.

---

## 3. 파일 안내
- 구현 본체: `lifecycle.html` (신규 캔버스 탭)
- 명세: `SPEC_BIO_PLANNING_01_CANVAS_WIZARD.md`
- 공유 브리프(상위 폴더): `../SHARED_AGENT_BRIEF_BIO_PLANNING.md`
- 기준 가이드(상위 폴더): `../BIO_RESEARCH_PLANNING_GUIDE.md`
- 협업 상태판: `AGENT_STATUS.md`

## 4. 재개 시 첫 행동 제안
VERIFY-01/02(1-6), SPEC 02 문헌조사 보드(1-7), SPEC 03 정렬 검사기 고급 규칙(1-8), SPEC 04 IRB/규제 체크 허브(1-9), SPEC 05 연구계획서 초안 생성기(1-10), SPEC 06 예산/인력/일정/리스크 패널(구현 완료)까지 진행되었습니다. 다음 작업자는:
1. (선택) 정식 Chrome/Edge/Safari에서 문서함 `전체보기` 1회 육안 확인 — PDF가 실제로 화면에 그려지는지(서버 응답은 이미 정상 확인됨, 차단 항목 아님).
2. 예산·인력·일정·리스크 패널의 플레이라이트 자동화 검증 스크립트(`scripts/verify_budget_playwright.js`)를 완성하여 실행(VERIFY-07 완료).
3. 이슈가 있으면 `AGENT_STATUS.md` Blockers에 기록 후 수정.
