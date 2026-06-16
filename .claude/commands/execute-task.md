---
description: tasks.md 기준으로 다음 미완료 Task 1개만 구현합니다.
argument-hint: "선택사항: 특정 Task 번호 또는 이름"
---

# execute-task

요청:
$ARGUMENTS

`tasks.md`, `execution_plan.md`, `architecture.md`, `requirements.md`를 읽어라.

## 목표

다음 미완료 Task 1개만 수행한다.

사용자가 특정 Task 번호나 이름을 입력했다면 해당 Task만 수행한다.
입력하지 않았다면 `execution_plan.md` 기준으로 가장 먼저 수행해야 할 미완료 Task 1개를 선택한다.

## 수행 범위

- 코드 작성
- 필요한 테스트 작성
- 가능한 테스트 실행
- 오류 발생 시 수정 후 재테스트
- README 또는 관련 문서 업데이트

## 제한

- 다음 Task는 수행하지 않는다.
- 대규모 리팩토링은 하지 않는다.
- 기술 스택을 임의로 추가하지 않는다.
- 요구사항에 없는 기능을 추가하지 않는다.
- 불확실한 결정은 `NEEDS USER DECISION`에 기록하고 멈춘다.

## 완료 조건

- 해당 Task의 기능이 구현됨
- 테스트가 작성되었거나, 테스트가 불가능한 경우 수동 검증 방법이 작성됨
- 테스트 또는 실행 검증 결과가 보고됨
- README 또는 관련 문서가 업데이트됨

## 완료 보고 형식

```text
DONE TASK:
[Task 이름]

CHANGED FILES:
- [파일명]: [변경 내용]

TEST RESULT:
[실행한 테스트/명령어와 결과]

MANUAL CHECK:
[사용자가 직접 확인할 방법]

NEXT TASK:
[다음 Task 이름]

NEEDS USER DECISION:
[결정 필요 사항이 없으면 없음]
```

