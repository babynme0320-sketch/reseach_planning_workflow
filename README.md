# Multi-Agent Harness Template

Claude Code, Codex CLI, Google Antigravity를 같은 프로젝트 운영 방식으로 쓰기 위한 템플릿입니다.

## lifecycle.html 실행 방법

`lifecycle.html`은 검색 기능에서 JSON 인덱스를 `fetch()`로 불러옵니다. 브라우저 보안 정책상
파일을 더블클릭해서 `file://`로 직접 열면 `fetch()`가 차단되어 검색이 동작하지 않습니다.

대신 `run_server.bat`을 더블클릭하세요.

1. `reseach_planning_workflow/run_server.bat` 파일을 더블클릭합니다.
2. 로컬 서버(127.0.0.1:8765)가 콘솔 창에서 실행되고, 기본 브라우저로 `lifecycle.html`이 자동으로 열립니다.
3. 사용이 끝나면 콘솔 창을 닫아서 서버를 종료합니다.

## 검증 메모

재현 가능한 캔버스 로직 검증은 아래 명령으로 수행합니다.

```bash
node reseach_planning_workflow/scripts/verify_lifecycle_canvas.js
```

- 이 스크립트는 `lifecycle.html`의 인라인 스크립트 구문, `STUDY_TYPES` 6유형 정의, `evaluateCanvas()`, `buildConceptNote()` 핵심 동작을 검사합니다.
- `file://`로 직접 연 경우에도 캔버스 입력/경고/컨셉 노트 생성/일부 회귀 스모크 테스트는 가능합니다.
- 법령 검색(`fetch()`), PDF 뷰어, 원문 검색 연동 검증은 로컬 HTTP 서버 환경이 필요합니다.

## 핵심 구조

```text
프로젝트폴더/
├─ CLAUDE.md
├─ AGENTS.md
├─ ANTIGRAVITY_AGENTS.md
├─ harness/
│  ├─ COMMON_AGENT_HARNESS.md
│  ├─ PROJECT_START.md
│  ├─ EXECUTE_TASK.md
│  └─ REVIEW_PROJECT.md
├─ .claude/
│  └─ commands/
│     ├─ project-start.md
│     ├─ execute-task.md
│     └─ review-project.md
├─ .codex/
│  └─ skills/
│     └─ project-harness/
│        └─ SKILL.md
└─ .antigravity/
   └─ skills/
      └─ project-harness/
         └─ SKILL.md
```

## Claude Code에서 시작

```bash
claude
```

```text
/project-start 연구노트 계약 관리 시스템
```

구현:

```text
/execute-task
```

검토:

```text
/review-project
```

## Codex CLI에서 시작

```text
AGENTS.md와 harness/PROJECT_START.md를 읽고, project-start 절차로 시작해줘.
프로젝트명: 연구노트 계약 관리 시스템
```

구현:

```text
AGENTS.md와 harness/EXECUTE_TASK.md를 읽고, 다음 미완료 Task 1개만 수행해줘.
```

검토:

```text
AGENTS.md와 harness/REVIEW_PROJECT.md를 읽고, 코드는 수정하지 말고 review_report.md만 작성해줘.
```

## Antigravity에서 시작

```text
AGENTS.md와 ANTIGRAVITY_AGENTS.md와 harness/PROJECT_START.md를 읽고, project-start 워크플로우로 시작해줘.
프로젝트명: 연구노트 계약 관리 시스템
```

구현:

```text
AGENTS.md와 ANTIGRAVITY_AGENTS.md와 harness/EXECUTE_TASK.md를 읽고, 다음 미완료 Task 1개만 수행해줘.
작업 과정과 검증 결과를 Artifact로 남겨줘.
```

검토:

```text
AGENTS.md와 ANTIGRAVITY_AGENTS.md와 harness/REVIEW_PROJECT.md를 읽고, 코드는 수정하지 말고 review_report.md만 작성해줘.
검증 근거를 Artifact로 남겨줘.
```

## 전역 적용

### Claude

공통 원칙은 아래에 둘 수 있습니다.

```text
~/.claude/CLAUDE.md
```

다만 프로젝트별 명령어는 프로젝트의 `.claude/commands/`에 두는 것을 권장합니다.

### Codex

공통 원칙은 아래에 둘 수 있습니다.

```text
~/.codex/AGENTS.md
```

프로젝트별 상세 지침은 프로젝트 루트의 `AGENTS.md`에 둡니다.

### Antigravity

Antigravity는 `AGENTS.md`와 Skills를 같이 두고 Agent에게 명시적으로 읽게 하는 방식을 권장합니다.

## 추천 원칙

- 공통 원칙은 전역 파일에 둔다.
- 실제 프로젝트별 산출물과 명령은 프로젝트 폴더에 둔다.
- 에이전트마다 같은 Harness를 쓰되, 각 도구의 읽는 방식에 맞춰 어댑터 파일만 다르게 둔다.
