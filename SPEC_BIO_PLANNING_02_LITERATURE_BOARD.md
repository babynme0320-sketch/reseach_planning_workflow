# SPEC 02 — 문헌조사 보드

작성/구현/검증: Claude
상태: 승인됨 — 사용자가 기존 멀티에이전트 하네스(START_HERE.md)로 SPEC 02 진행을 직접 지시(2026-06-24)

근거: `PROGRESS_BIO_PLANNING.md` 2-2 "다음 기능" 1순위 — "문헌조사 보드 — 5컬럼(표준지식/핵심근거/모순지점/미충족질문/기획함의), 지식공백 요약, 경쟁연구·실패사례 분리"

---

## 0. 범위

### 이 스펙이 다루는 것
- 문헌/선행연구를 5개 컬럼으로 구조화해 기록하는 보드
- 경쟁연구·실패사례를 별도 섹션으로 분리해 기록
- 지식공백(아직 답이 없는 부분) 요약 메모

### 다루지 않는 것
- 외부 문헌 DB 연동/자동 검색 (수동 입력 전제, 오프라인 SPA 원칙 유지)
- 가설-목표-방법 정렬 고급 검사기(SPEC 03)

### 설계 원칙
- 기존 SPA 패턴 재사용: `data-tab` 글로벌 탭, `table-card`, `canvas-field`/`canvas-input`/`canvas-btn` 클래스, `localStorage` 영속화.
- 신규 라이브러리 도입 금지.
- 모든 입력은 로컬 저장만(서버 없음).

## 1. 진입점
- 새 글로벌 탭: `data-tab="litboard"`, 아이콘 `📑`, 라벨 `문헌조사 보드`. `🧭 연구 질문 캔버스` 바로 다음 위치.

## 2. 데이터 모델

`localStorage` 키: `rd_lit_board_state`

```json
{
  "columns": {
    "standard": [],
    "evidence": [],
    "contradiction": [],
    "gap": [],
    "implication": []
  },
  "competitors": [],
  "failures": [],
  "gapSummary": "",
  "updatedAt": "ISO8601"
}
```

- 5개 컬럼 카드 항목: `{ id, title, source, note }`
  - `standard`(표준지식), `evidence`(핵심근거), `contradiction`(모순지점), `gap`(미충족질문), `implication`(기획함의)
- `competitors`(경쟁연구), `failures`(실패사례) 항목: `{ id, title, note }` (출처 칸 없이 더 단순)
- `gapSummary`: 자유 textarea, 수동 입력

## 3. UI 구성

1. **5컬럼 보드** (`#litColumnsGrid`, 데스크탑 5열 grid → 모바일 1열)
   - 컬럼별: 헤더(라벨), 추가 폼(제목/출처/메모 입력 + `추가` 버튼), 카드 리스트(각 카드에 삭제 버튼)
2. **경쟁연구 · 실패사례** (2열, 모바일 1열): 컬럼과 동일한 카드 패턴(출처 칸 제외)
3. **지식공백 요약**: `textarea#litGapSummary`, 자동 디바운스 저장

## 4. 동작
- 카드 추가: 제목 필수, 출처/메모 선택. 추가 시 즉시 `localStorage` 저장 + 폼 초기화.
- 카드 삭제: 즉시 저장.
- 빈 컬럼: "아직 입력된 항목이 없습니다" 안내 표시.
- 탭 진입 시 저장된 상태로 복원.

## 5. 수용 기준
- AC-1: 5개 컬럼 각각에 카드를 추가하면 새로고침 후에도 유지된다.
- AC-2: 카드 삭제가 즉시 반영되고 새로고침 후에도 삭제 상태가 유지된다.
- AC-3: 경쟁연구·실패사례가 5컬럼과 시각적으로 분리된 별도 섹션으로 보인다.
- AC-4: 지식공백 요약 textarea 입력값이 새로고침 후 유지된다.
- AC-5: 제목 없이 추가를 시도하면 추가되지 않는다(빈 카드 방지).
- AC-6: 기존 8개 탭 네비게이션에 회귀가 없다.

## 6. 구현 노트
- 함수: `initLitBoard()`, `renderLitBoard()`, `addLitCard(group, key)`, `deleteLitCard(group, key, id)`, `saveLitBoardState()`
- `group`은 `'column'` 또는 `'side'`(경쟁연구/실패사례), `key`는 `standard|evidence|contradiction|gap|implication|competitors|failures`
- DOM 주입 시 사용자 입력은 `textContent`로 삽입(XSS 방지, 기존 캔버스 패턴과 동일 원칙).
