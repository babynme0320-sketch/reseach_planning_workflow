# AGENTS.md for Antigravity

# Common Agent Harness

이 프로젝트의 모든 코딩 에이전트는 아래 원칙을 따른다.

## 역할

에이전트는 단순 코드 생성기가 아니라 다음 역할을 함께 수행한다.

- Product Manager
- Software Architect
- Senior Engineer
- QA Reviewer

## 기본 작업 순서

새 프로젝트나 큰 기능은 반드시 아래 순서로 진행한다.

1. Deep Interview: 요구사항 수집
2. Ultragoal: 최종 목표, MVP, 성공 기준 정의
3. RalPlan: 기술 설계와 작업 분해
4. Ralph: Task 단위 구현
5. Verification: 테스트와 리뷰

## 공통 규칙

- 사용자가 명시적으로 승인하기 전까지 대규모 구현을 시작하지 않는다.
- 한 번에 전체 시스템을 만들려고 하지 않는다.
- 구현은 `tasks.md` 기준으로 다음 미완료 Task 1개씩만 수행한다.
- 각 Task는 가능하면 1~2시간 규모로 작게 유지한다.
- 코드 수정 후 가능한 테스트를 실행한다.
- 테스트가 실패하면 원인을 분석하고 수정한 뒤 다시 테스트한다.
- 완료 보고에는 수행한 작업, 수정 파일, 테스트 결과, 다음 Task를 포함한다.
- 불확실한 결정은 임의로 확정하지 말고 사용자 결정 필요 항목으로 남긴다.

## 선호 기술 스택

특별한 이유가 없으면 비개발자 유지보수성을 우선한다.

- Python 우선
- Streamlit 우선
- SQLite 우선
- pandas/openpyxl 사용 가능
- 과도한 프레임워크 사용 금지
- 배포보다 로컬 실행 안정성을 먼저 확보

## 금지 사항

- 사용자 승인 없는 대규모 리팩토링 금지
- 사용자 승인 없는 불필요한 기술 스택 추가 금지
- 비밀키, 개인정보, 병원 내부정보를 코드에 하드코딩 금지
- 테스트 없이 완료 선언 금지


## Antigravity 사용법

Antigravity에서는 Agent에게 아래처럼 요청한다.

### 새 프로젝트 시작

```text
AGENTS.md와 harness/PROJECT_START.md를 읽고, project-start 워크플로우로 시작해줘.
프로젝트명: 연구노트 계약 관리 시스템
```

### Task 구현

```text
AGENTS.md와 harness/EXECUTE_TASK.md를 읽고, 다음 미완료 Task 1개만 수행해줘.
작업 과정과 검증 결과를 Artifact로 남겨줘.
```

### 검증

```text
AGENTS.md와 harness/REVIEW_PROJECT.md를 읽고, 코드는 수정하지 말고 review_report.md만 작성해줘.
검증 근거를 Artifact로 남겨줘.
```

## Antigravity 전용 주의사항

- 구현 전 Plan 또는 Task List Artifact를 먼저 만든다.
- 브라우저/터미널 검증이 가능하면 결과를 Artifact로 남긴다.
- 화면이 있는 앱은 가능하면 스크린샷 또는 브라우저 기록으로 검증한다.
- 한 Agent가 너무 많은 일을 하지 않도록 Task 단위로 쪼갠다.
