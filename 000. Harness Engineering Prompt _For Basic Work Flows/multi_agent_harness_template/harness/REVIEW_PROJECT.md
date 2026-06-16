# review-project

요청:
{{REVIEW_FOCUS}}

현재 프로젝트 전체를 리뷰하라.

## 중요 규칙

- 코드는 수정하지 말 것.
- 파일 삭제/이동/리팩토링 금지.
- 리뷰 리포트만 작성할 것.
- 결과는 `review_report.md`에 저장할 것.

## 검토 관점

1. 보안
2. 유지보수성
3. 성능
4. 사용자 경험
5. 데이터 무결성
6. 테스트 커버리지
7. 비개발자 유지보수 가능성
8. 과도한 복잡성 여부

## 리뷰 방식

각 항목을 다음 형식으로 작성한다.

```text
[심각도] 문제 제목

- 위치:
- 문제:
- 영향:
- 권장 수정:
- 우선순위:
```

심각도는 다음 중 하나를 사용한다.

- Critical
- High
- Medium
- Low
- Suggestion

## 최종 산출물

- `review_report.md`

## 완료 보고 형식

```text
REVIEW COMPLETED:
review_report.md 생성 완료

TOP 5 RISKS:
1.
2.
3.
4.
5.

RECOMMENDED NEXT ACTION:
[다음에 수행할 작업]
```
