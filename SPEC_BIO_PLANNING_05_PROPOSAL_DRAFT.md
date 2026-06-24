# SPEC 05 — 연구계획서 초안 생성기

작성/구현/검증: Claude
상태: 승인됨 — 사용자가 "연구계획서 초안 생성기 진행해"로 직접 지시(2026-06-24)

근거: `PROGRESS_BIO_PLANNING.md` 2-2 — "연구계획서 초안 생성기 (가이드 10장) — Specific Aims, 목차, 통계계획 초안"

---

## 0. 범위

### 다루는 것
- 캔버스(SPEC 01)·문헌조사 보드(SPEC 02) 입력을 재사용해 7섹션 연구계획서 초안(Specific Aims, 목차, 연구배경, 연구방법, 통계분석계획, 연구일정, 리스크/Go-No-Go)을 자동 생성.
- 초안 전용 추가 입력 2개(연구기간, 통계분석 방법)만 신규로 받는다.

### 다루지 않는 것
- 실제 통계 검정력(power) 계산 — 자리만 마련(통계 담당자 검토 안내).
- PDF/Word 변환 — 기존 컨셉노트와 동일하게 `.txt`/`.md` 텍스트 다운로드만 제공.

### 설계 원칙
- 캔버스 입력값(`canvasState`)과 문헌조사 보드(`litBoardState`)를 **재사용**, 신규 입력 최소화(`PROGRESS_BIO_PLANNING.md` 2-3 연동 메모 준수).
- 기존 컨셉노트(`buildConceptNote`) 패턴 재사용: 읽기전용 textarea + 복사/`.txt`/`.md` 다운로드.
- 신규 라이브러리 도입 금지.

## 1. 진입점
- 새 글로벌 탭: `data-tab="proposal"`, 아이콘 `📝`, 라벨 `연구계획서 초안 생성기`. `🧬 IRB/규제 체크 허브` 다음 위치.

## 2. 신규 입력 (2개만)
| 필드 ID | 라벨 | 형태 | 필수 |
|---|---|---|---|
| `proposalDuration` | 연구 기간 | text(1줄) | 선택 |
| `proposalStatMethod` | 통계분석 방법 | textarea | 선택 |

`localStorage` 키: `rd_proposal_state` — `{ proposalDuration, proposalStatMethod, updatedAt }`.

## 3. 초안 템플릿 (7섹션)

```text
# 연구계획서 초안 — {projectName}

## 1. Specific Aims
{researchQuestion} 에 대한 가설({hypothesis})을 {subjectModel}에서 {comparator} 대비 검증한다.
1차 결과변수: {primaryOutcome}. 성공 기준: {successCriteria}.

## 2. 목차
1. 서론 및 배경
2. 연구 목적 및 가설
3. 연구 방법 ({studyType 라벨})
4. 통계분석 계획
5. 예상 결과 및 의의
6. 연구 일정
7. 참고문헌

## 3. 연구 배경 (문헌조사 보드 연계)
지식공백: {litBoardState.gapSummary 또는 "(문헌조사 보드 미작성 — 문헌조사 보드 탭에서 먼저 정리 권장)"}

## 4. 연구 방법 개요
대상/모델: {subjectModel} · 비교군: {comparator}
유형: {studyType 라벨} — 핵심 질문: {coreQuestion}

## 5. 통계분석 계획 (초안)
1차 결과변수({primaryOutcome})를 비교군({comparator})과 비교하여 성공 기준({successCriteria}) 충족 여부를 검정한다.
통계 방법: {proposalStatMethod 또는 "(미작성 — 통계 담당자와 상의 필요)"}

## 6. 연구 일정
{proposalDuration 또는 "(미작성)"}

## 7. 주요 리스크 및 Go/No-Go
주요 리스크: {mainRisk}
다음 단계 Go/No-Go 기준: {goNoGo}

(이 초안은 자동 생성본입니다. 통계·IRB·규제 담당자 검토 전 최종본이 아닙니다.)
```

- 캔버스 필수 항목이 비어 있으면 상단에 "⚠️ 미완성 초안" 배너 + 빈 항목 목록(기존 컨셉노트 패턴과 동일).
- `studyType` 미선택 시 "목차"의 3번 항목과 "연구 방법 개요"는 "(연구 유형 미선택)"으로 대체.

## 4. UI 구성
- 캔버스 데이터 요약 카드(읽기 전용, 재입력 없음 — "캔버스에서 가져온 값" 안내).
- 신규 입력 2개(연구 기간, 통계분석 방법) 입력 폼.
- `연구계획서 초안 생성하기` 버튼 → 읽기전용 textarea(`#proposalOutput`) 출력.
- `복사` / `.txt 다운로드` / `.md 다운로드` 버튼 (기존 컨셉노트 버튼 재사용 스타일).

## 5. 수용 기준
- AC-1: 캔버스에 값을 채운 뒤 초안 생성 시 7개 섹션이 모두 채워져 출력된다.
- AC-2: 캔버스 필수 항목이 비어 있으면 "미완성 초안" 배너가 뜬다.
- AC-3: 문헌조사 보드의 `gapSummary`가 "연구 배경" 섹션에 반영된다(없으면 안내 문구).
- AC-4: 신규 입력 2개(연구기간/통계분석방법) 입력값이 새로고침 후 유지된다.
- AC-5: 복사 / `.txt` / `.md` 다운로드가 동작한다.
- AC-6: 기존 10개 글로벌 탭 회귀 없음.

## 6. 구현 노트
- 함수: `initProposal()`, `saveProposalState()`, `buildProposalDraft(format)`, `copyProposalDraft()`, `downloadProposalDraft(ext)`.
- 공용 헬퍼 `downloadTextFile(content, filename, ext)`를 신설해 `downloadConceptNote`/`downloadProposalDraft`가 함께 사용(중복 제거).
- `buildProposalDraft`는 `canvasState`/`litBoardState`/`STUDY_TYPES`를 읽기만 하고 수정하지 않는다(읽기 전용 연동, SPEC 03의 A-06과 동일 원칙).
