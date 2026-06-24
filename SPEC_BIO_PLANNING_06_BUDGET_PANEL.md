# SPEC 06 — 예산·인력·일정·리스크 패널

작성/구현/검증: Claude
상태: 승인됨 — 사용자가 "계속 진행해"로 다음 우선순위 진행을 지시(2026-06-24)

근거: `PROGRESS_BIO_PLANNING.md` 2-2 — "예산·인력·일정·리스크 패널 (가이드 8·9장)"

---

## 0. 범위

### 다루는 것
- 4개 등록형 패널: 예산(비목별), 참여인력(R&R), 마일스톤 일정, 리스크 레지스터.
- 각 패널은 추가/삭제가 가능한 카드 리스트 + localStorage 영속화.
- 예산 패널은 비목별 합계를 자동 계산해 보여준다.

### 다루지 않는 것
- 실제 예산 한도 검증(혁신법 비목 계상기준 자동 검사) — 후속 SPEC 후보.
- 캔버스/문헌조사 보드와의 연동 — 이번 SPEC은 독립 패널(향후 연동 가능성은 2-3 메모에 추가).

### 설계 원칙
- 기존 SPA 패턴 재사용: `table-card`, `lit-card`/`lit-column-form`/`lit-column-add-btn`(SPEC 02에서 만든 카드 리스트 컴포넌트, 범용으로 재사용), `localStorage`.
- 신규 라이브러리 도입 금지.
- 기존 앱에서 이미 쓰는 비목 용어(인건비/장비비/재료비/위탁비/간접비)를 그대로 사용(신규 용어 도입 금지).

## 1. 진입점
- 새 글로벌 탭: `data-tab="budget"`, 아이콘 `💰`, 라벨 `예산·인력·일정·리스크`. `📝 연구계획서 초안 생성기` 다음 위치.

## 2. 데이터 모델

`localStorage` 키: `rd_budget_panel_state`

```json
{
  "budgetItems": [{ "id": "", "category": "인건비", "amount": 0, "note": "" }],
  "manpowerItems": [{ "id": "", "role": "", "name": "", "fte": 0, "period": "" }],
  "timelineItems": [{ "id": "", "when": "", "milestone": "", "deliverable": "" }],
  "riskItems": [{ "id": "", "risk": "", "probability": "중간", "impact": "중간", "mitigation": "" }],
  "updatedAt": "ISO8601"
}
```

- `category`: `BUDGET_CATEGORIES` 단일 소스 = `['인건비', '장비비', '재료비', '위탁비', '간접비']` (기존 앱 STAGES 텍스트와 동일 용어).
- `amount`: 숫자(만원 단위).
- `probability`/`impact`: `['낮음', '중간', '높음']`.

## 3. UI 구성
1. **예산 패널**: 비목 select + 금액(숫자) + 비고 입력 폼 → 카드 리스트. 하단에 비목별 합계 + 총합계 표시(`#budgetTotalSummary`).
2. **참여인력 패널**: 역할 + 이름 + 참여율(FTE, 0~1) + 참여기간 입력 폼 → 카드 리스트.
3. **일정 패널**: 시점(예: "1년차 3개월") + 마일스톤 + 산출물 입력 폼 → 카드 리스트.
4. **리스크 패널**: 리스크 내용 + 발생가능성(select) + 영향도(select) + 완화 계획(textarea) → 카드 리스트, 발생가능성·영향도 배지 표시.

각 패널은 SPEC 02의 `lit-column-form`/`lit-card`/`lit-card-delete` 클래스를 그대로 재사용한다(시각적 일관성, 신규 CSS 최소화).

## 4. 수용 기준
- AC-1: 4개 패널 각각에 항목을 추가하면 새로고침 후에도 유지된다.
- AC-2: 항목 삭제가 즉시 반영되고 새로고침 후에도 유지된다.
- AC-3: 예산 항목 추가/삭제 시 비목별 합계와 총합계가 올바르게 갱신된다.
- AC-4: 필수 입력(예산 비목+금액, 인력 역할, 일정 마일스톤, 리스크 내용) 없이는 추가되지 않는다.
- AC-5: 기존 11개 글로벌 탭 회귀 없음.

## 5. 구현 노트
- 함수: `initBudgetPanel()`, `renderBudgetPanel()`, `addBudgetRow(section)`, `deleteBudgetRow(section, id)`, `saveBudgetPanelState()`, `renderBudgetTotalSummary()`.
- `section`은 `'budgetItems'|'manpowerItems'|'timelineItems'|'riskItems'` 중 하나.
- `escapeHtml()` 재사용으로 XSS 방지.
