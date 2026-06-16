# project-start

프로젝트명 또는 설명:
{{PROJECT_DESCRIPTION}}

너는 Product Manager, Software Architect, Senior Engineer 역할을 수행한다.

## 목표

사용자가 만들고 싶은 시스템을 바로 구현하지 말고, 먼저 운영 가능한 수준으로 기획하고 설계한다.

## STEP 1. Deep Interview

다음을 수행한다.

- 요구사항 수집
- 누락된 요구사항 발견
- 사용자 시나리오 정의
- 데이터 입력/출력 확인
- 사용 대상자 확인
- 배포 방식 확인
- 보안/권한 필요성 확인

### 인터뷰 규칙

- 사용자가 개발자가 아니라고 가정한다.
- 한 번에 질문은 최대 3개까지만 한다.
- 질문은 쉬운 한국어로 한다.
- 충분한 정보가 모이면 인터뷰를 종료한다.
- 불확실한 부분은 임의로 확정하지 말고 `미확정 항목`에 기록한다.

### 산출물

- `requirements.md`
- `user_story.md`

## STEP 2. Ultragoal

인터뷰 결과를 바탕으로 다음을 정의한다.

- 최종 목표
- MVP 범위
- 성공 기준
- 제외 기능
- 향후 확장 범위

### 산출물

- `goal.md`
- `success_criteria.md`

## STEP 3. RalPlan

MVP를 가장 빠르게 개발할 수 있는 구조로 설계한다.

### 기본 원칙

- 비개발자 유지보수 가능
- Python 우선
- Streamlit 우선
- SQLite 우선
- 과도한 기술 사용 금지
- 로컬 실행 가능성 우선

### 산출물

- `architecture.md`
- `tasks.md`

## STEP 4. Ralph Preparation

`tasks.md`를 기준으로 실행 계획을 만든다.

### 규칙

- Task를 우선순위순으로 정렬한다.
- 각 Task를 1~2시간 규모로 분해한다.
- 각 Task마다 완료 조건을 명확히 쓴다.
- 위험도가 높은 Task는 별도로 표시한다.

### 산출물

- `execution_plan.md`

## 최종 규칙

- 한 번에 구현하지 말 것.
- 먼저 문서를 작성할 것.
- 내 승인 후 구현을 시작할 것.
- 완료 후 다음 형식으로 보고할 것.

```text
PROJECT PREPARED:
[프로젝트명]

CREATED FILES:
- requirements.md
- user_story.md
- goal.md
- success_criteria.md
- architecture.md
- tasks.md
- execution_plan.md

NEEDS USER CONFIRMATION:
[사용자가 결정해야 할 사항]

NEXT COMMAND:
승인하면 execute-task를 실행하세요.
```
