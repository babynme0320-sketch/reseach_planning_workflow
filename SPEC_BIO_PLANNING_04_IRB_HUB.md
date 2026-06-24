# SPEC 04 — IRB/규제 체크 허브

작성/구현/검증: Claude
상태: 승인됨 — 사용자가 "IRB/규제 체크 허브 진행해"로 직접 지시(2026-06-24)

근거: `PROGRESS_BIO_PLANNING.md` 2-2 — "IRB/규제 체크 허브 (가이드 7장) — 질문형 체크 흐름, 법령 모달 연계"

---

## 0. 범위

### 다루는 것
- 질문형(Yes/No) 흐름으로 연구가 사람/동물/데이터만 대상인지 판별하고, 분기별 IRB·규제 체크리스트와 법령 근거를 제공.
- 기존 `showLawModal()`/`LAW_DATABASE` 패턴에 IRB 관련 법령 조항 추가 및 연계.

### 다루지 않는 것
- 실제 IRB 심의 신청서 작성/제출 기능 (안내·체크리스트 용도).
- 기관별 세부 규정 차이 반영 (교육·기획용 일반화 자료, 기존 disclaimer 패턴 유지).

### 설계 원칙
- 기존 SPA 패턴 재사용: `data-tab`, `table-card`, `canvas-btn`, `caution-card`, `localStorage`, `showLawModal()`.
- 신규 라이브러리 도입 금지.

## 1. 진입점
- 새 글로벌 탭: `data-tab="irbhub"`, 아이콘 `🧬`, 라벨 `IRB/규제 체크 허브`. `🛡️ 제안서 선제 대응표` 다음 위치.

## 2. 질문 흐름 (이진 트리)

```
Q1: 연구 대상이 사람인가요?
 ├─ 예 → Q2: 연구자가 직접 개입(시술/투여/검사/설문/인터뷰)하나요?
 │        ├─ 예 → LEAF: humanIntervention
 │        └─ 아니오 → LEAF: humanDataOnly (기존 데이터/인체유래물만 활용)
 └─ 아니오 → Q3: 동물을 대상으로 하나요?
          ├─ 예 → LEAF: animal
          └─ 아니오 → LEAF: none (사람/동물 직접 대상 아님)
```

## 3. 분기별 결과(LEAF) 콘텐츠

| LEAF | 핵심 안내 | 체크리스트(요약) | 법령 근거(LAW_DATABASE 키) |
|---|---|---|---|
| `humanIntervention` | IRB 심의 필수, 동의서 필요 | IRB 심의 신청, 동의서/설명문 작성, 임상시험이면 IND·식약처 별도 검토, 개인정보 수집 시 안전성 확보조치 | `생명윤리법 제15조`, `생명윤리법 제16조`, `개인정보보호법 제15조` |
| `humanDataOnly` | IRB 심의(면제 심사 포함) 필요 | IRB에 면제 심사 신청, 동의 면제 요건 검토, 인체유래물은행 이용 시 별도 동의 확인, 비식별화 조치 | `생명윤리법 제15조`, `개인정보보호법 제15조` |
| `animal` | 동물실험윤리위원회(IACUC) 승인 필요 | IACUC 승인, 3R 원칙(Replacement·Reduction·Refinement) 검토, 사육시설 기준 준수 | `동물보호법 제47조` |
| `none` | 별도 IRB/IACUC 불필요 가능성 높음 | 기관 정책 재확인, 공개 데이터 활용 시 출처·라이선스 확인, 연구윤리 자가점검 | (법령 근거 없음, info 안내만) |

## 4. 데이터 모델

`localStorage` 키: `rd_irb_state`

```json
{
  "answers": { "q1": "yes", "q2": "no" },
  "leaf": "humanDataOnly",
  "checklist": { "humanDataOnly": [false, false, false, false] },
  "updatedAt": "ISO8601"
}
```

- `answers`: 질문 ID → "yes"/"no"
- `leaf`: 도달한 결과 키 (없으면 null)
- `checklist`: LEAF별 체크 상태 배열(다른 LEAF로 이동해도 보존)

## 5. UI 구성
- 질문 카드: 현재 질문 텍스트 + `예`/`아니오` 버튼, 답변 경로 breadcrumb, `처음부터 다시` 버튼.
- 결과 카드(LEAF 도달 시): 핵심 안내 배너(`caution-card`), 체크리스트(체크박스, 즉시 저장), 법령 근거 칩(클릭 시 `showLawModal()`로 기존 모달 오픈).
- 새로고침 후 마지막 답변/체크 상태 복원.

## 6. 수용 기준
- AC-1: Q1~Q3 분기를 따라가면 4개 LEAF 각각에 올바르게 도달한다.
- AC-2: 체크리스트 체크 시 즉시 저장되고 새로고침 후 유지된다.
- AC-3: 법령 근거 칩 클릭 시 기존 법령 모달(`lawModalOverlay`)이 열리고 해당 조항 내용이 표시된다.
- AC-4: `처음부터 다시` 클릭 시 답변과 현재 LEAF가 초기화되지만 다른 LEAF의 체크리스트 상태는 보존된다.
- AC-5: 기존 9개 글로벌 탭(대시보드/캔버스/문헌조사 보드/리스크/소스/용어사전/조직도/타임라인/준비도) 회귀 없음.

## 7. 구현 노트
- 함수: `initIrbHub()`, `renderIrbHub()`, `answerIrbQuestion(qId, answer)`, `resetIrbFlow()`, `toggleIrbCheck(leaf, idx)`, `saveIrbState()`.
- `IRB_FLOW`(질문 트리) + `IRB_LEAVES`(분기별 콘텐츠) 단일 데이터 소스로 정의.
- `LAW_DATABASE`에 `생명윤리법 제15조`, `생명윤리법 제16조`, `개인정보보호법 제15조`, `동물보호법 제47조` 4개 키 추가(기존 패턴과 동일 형식, 교육용 일반화 요약).
- 법령 칩은 기존 `lawBasis.onclick = () => showLawModal(s.law)` 패턴 재사용.
