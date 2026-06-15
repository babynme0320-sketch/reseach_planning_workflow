---
name: research-planning
description: 바이오 국가 R&D 과제 수주를 위한 계획서 기획, 논문/특허 조사, RFP 부합성 검증, 개조식 집필 및 심사위원 사전 사전검증 프로세스
disable-model-invocation: true
---

# 바이오 국가과제 수주 기획 워크플로우 (Bio-R&D Proposal Workflow)

이 워크플로우는 바이오 분야 정부 연구비 수주를 달성하기 위한 다중 에이전트 조율을 정의합니다.

---

## Step 0: 기획 준비 및 RFP 적재

1. 정부 공고 RFP 파일 또는 공고 요약 텍스트를 `source-papers/` 또는 프로젝트 루트에 확보합니다.
2. TRL 달성 목표, 지원 마감일, 총 예산 한도를 명확히 파악합니다.

---

## Step 1: RFP 요건 분석 및 부합성 매핑

- **에이전트**: `market` / `pm`
- **태스크**: 정부 RFP의 평가 가이드라인, 가점 기준, 지원 연구 분야를 파싱하여 필수 요건 목록을 도출하고 매핑 템플릿을 생성합니다.
- **산출물**: `claims-matrix/rfp-alignment-matrix.md`

---

## Step 2: 생명과학 문헌 및 선행 특허 조사

- **에이전트**: `scholar`
- **태스크**: 표적 마커, 동물 모델, 선행 효능 평가 데이터를 규명하기 위해 관련 PubMed 논문 및 USPTO 특허를 검색하여 메타데이터를 수집합니다.
- **산출물**: `parsed-papers/{paper-id}.knows.yaml`

---

## Step 3: 기술적 독창성 및 TRL 마일스톤 설계

- **에이전트**: `pm`
- **태스크**: 문헌 근거를 기반으로 연차별 개발 계획 및 연구 로드맵을 작성하고, 각 연구 단계의 TRL 상승 증빙 시나리오를 설정합니다.
- **산출물**: `docs/plans/designs/{NNN}-proposal-outline.md`

---

## Step 4: 개조식 계획서 집필

- **에이전트**: `academic-writer`
- **태스크**: 제안 설계 구조 및 양식에 맞추어 개조식 문체와 명사형 종결어미를 사용해 과제계획서 초안을 집필합니다.
- **산출물**: `drafts/01-proposal-introduction.md`

---

## Step 5: 평가위원 시뮬레이션 및 Compliance 감사

- **에이전트**: `qa`
- **태스크**: `docs/CODE-REVIEW.md` 체크리스트(RFP 부합, 윤리 규정 승인 일정, 과용 수식어 배제 등)를 적용하여 심사하고 평점을 도출합니다.
- **산출물**: `docs/plans/work/001-proposal-audit.md` (자체 등급 B 미만 시 Step 4 환류 재집필)
