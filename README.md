# 바이오 국가과제 수주 연구기획 워크스페이스

정부 부처 국가 R&D 과제(바이오·의료) 수주를 위한 **연구기획 워크스페이스**입니다.
RFP 분석·논문/특허 조사·국가연구개발과제계획서 작성을 돕는 웹 대시보드와,
국가과제 전주기(기획→공고→수주→수행→종료) 흐름도를 제공합니다.

여러 코딩 에이전트(Claude Code, Codex CLI, Google Antigravity)가 공통 하네스로 협업하도록 설계되어 있습니다.

---

## 🎯 핵심 산출물 (Deliverables)

| 파일 | 내용 | 비고 |
|---|---|---|
| **`index.html`** | 산학연병 통합 연구기획 대시보드 (SPA) — 예산 시뮬레이터, 자가진단 체크리스트, TRL 로드맵, 마크다운 가이드 뷰어 | 동적 기능은 `server.py` 필요 |
| **`lifecycle.html`** | 국가과제 **전주기 흐름도** (기획→수주→수행→종료·사후) — 17단계 인터랙티브, 정부/수주자 2관점, 심사·평가 관점, 리스크 대응표, 공식 출처 | 단독 실행 가능(서버 불필요) |
| **`research.md`** | 국가 R&D 전주기 조사 자료 (NTIS·IRIS·혁신법 출처 포함) — `lifecycle.html`의 근거 | — |

---

## ▶️ 실행 방법

### 1) 로컬 서버 (권장 — 대시보드 전체 기능)
```bash
python3 server.py
# → http://localhost:8899 자동 오픈
```
- `index.html`의 마크다운 뷰어(`/api/read`)와 도안(iframe) 로딩에 서버가 필요합니다.

### 2) 정적 열기 (흐름도만 빠르게 확인)
- `lifecycle.html`은 파일을 더블클릭해도 바로 동작합니다(외부 의존성: 웹폰트 CDN뿐).

---

## 🗂️ 문서 구조 (Document Map)

```text
├─ index.html / lifecycle.html / server.py   # 산출물 + 로컬 서버
├─ research.md                               # 전주기 조사 근거
│
├─ 📋 프로젝트 기획 문서 (index.html 대시보드 기준)
│  ├─ requirements.md / goal.md / user_story.md / success_criteria.md
│  ├─ ARCHITECTURE.md / execution_plan.md / tasks.md
│  └─ AGENT_STATUS.md                        # 멀티 에이전트 조정 원장(현재 상태)
│
├─ 🤖 하네스 프레임워크 (에이전트 운영 규약)
│  ├─ START_HERE.md                          # 모든 작업의 진입점
│  ├─ AGENTS.md / ANTIGRAVITY_AGENTS.md / CLAUDE.md
│  └─ harness/  (COMMON_AGENT_HARNESS / PROJECT_START / EXECUTE_TASK / REVIEW_PROJECT)
│
├─ 📚 docs/                                   # 가이드·핸드북·템플릿 (대시보드가 로드)
│  ├─ PLANS / CODE-REVIEW / QUALITY-SCORE / SECURITY
│  └─ plans/designs/handbook/  (제1~10장 실무 챕터)
│
└─ 작업 폴더
   ├─ claims-matrix/   # RFP 부합성 매트릭스
   ├─ drafts/          # 모달리티별 제안 초안 + 시각화 도안
   ├─ parsed-papers/   # 논문/특허 메타데이터(.knows.yaml)
   └─ source-papers/   # 원문 PDF 보관
```

> 작업 시작 시 항상 **`START_HERE.md`** 를 먼저 읽습니다. (이해 → 계획 → 확인 → 구현 → 테스트 → 검토)

---

## 🤖 멀티 에이전트 운영

같은 하네스를 도구별 어댑터로 사용합니다. 현재 진행 상황은 `AGENT_STATUS.md`에서 관리합니다.

| 도구 | 시작 명령 |
|---|---|
| **Claude Code** | `/project-start <프로젝트명>` → `/execute-task` → `/review-project` |
| **Codex CLI** | `AGENTS.md`와 `harness/PROJECT_START.md`를 읽고 project-start 절차로 시작 |
| **Antigravity** | `AGENTS.md` + `ANTIGRAVITY_AGENTS.md` + `harness/*`를 읽고 워크플로우 시작 |

**운영 원칙**
- 구현은 `tasks.md`의 다음 미완료 Task 1개씩만 수행한다.
- 한 번에 전체 시스템을 만들지 않는다. 코드 수정 후 가능한 테스트를 실행한다.
- 파일 소유권/진행 상태는 `AGENT_STATUS.md`로 조정해 충돌을 방지한다.
- 선호 스택: Python · Streamlit · SQLite (비개발자 유지보수성 우선).

---

## ✅ 현재 상태 (2026-06-17)

- `index.html` 대시보드: UI 개편 + 예산/자가진단/TRL 인터랙션 **완료** (Antigravity 마크업 → Claude JS 복원·검증)
- `lifecycle.html` 전주기 흐름도: **완료** (research.md 근거 반영)
- 남은 권장: Chrome/Safari 육안 렌더링 확인, git 커밋

세부 이력·소유권·미해결 항목은 [`AGENT_STATUS.md`](AGENT_STATUS.md) 참조.
</content>
