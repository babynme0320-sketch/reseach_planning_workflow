# 바이오 R&D 제안 설계: 메타데이터 및 RFP 매핑 스키마 (001)

- **ID**: `001-bio-proposal-design`
- **목적**: 바이오 논문/특허 데이터셋 구조화 및 정부 RFP 요건 매핑 표준 정의
- **상태**: `Approved`

---

## 1. 바이오 전용 메타데이터 스키마 (`.knows.yaml`) 규격

생명과학 논문 및 특허 분석 시, 연구 에이전트들은 다음 스키마 규격에 맞춰 메타데이터를 추출하고 로컬 파일로 저장합니다. 이 정보들은 효능 평가, 동물 모델 전임상 설계, TRL 성숙도 판단에 직접 연동됩니다.

```yaml
# 스키마 버전: 1.1
id: "[주요저자명]-[연도]-[키워드]" # 예: "smith-2026-crispr"
title: "[논문 또는 특허의 전체 제목]"
authors:
  - "[저자명 1]"
  - "[저자명 2]"
year: [발행연도]
doi: "[DOI 번호 또는 특허 등록/출원 번호]"
venue: "[게재 학술지명 또는 특허 등록처]"

# 바이오 전용 속성 필드
bio_parameters:
  target_marker: "[표적 유전자/단백질/마커명]"
  modality: "[치료/진단 기술 모달리티 구분 (예: mAb, Small Molecule, CAR-T)]"
  animal_model: "[동물 시험 모델명 및 품종 (예: C57BL/6 mouse)]"
  dosage: "[투여 농도, 주기, 투여 경로 (예: 5 mg/kg, Biweekly, IV)]"
  current_trl: [현재 입증 완료된 TRL 단계 수치 (예: 3)]
  biocompatibility: "[생체 적합성 및 전신 안전성/독성 요약 (예: 체중 감소 없음, 간독성 무)]"

key_contributions:
  - "[핵심 기여 및 성과 요약 1]"
  - "[핵심 기여 및 성과 요약 2]"

claims:
  - claim_id: "C1"
    assertion: "[계획서 본문에서 인용하여 기술적 실현 가능성을 입증할 핵심 주장]"
    evidence_type: "[실험 구분 (예: In vitro, In vivo (Animal), FTO Analysis)]"
    strength: "[증거력 수준 (strong | moderate | weak)]"
    limitations: "[실험 모델의 한계점 또는 향후 보완 영역]"
```

---

## 2. RFP-기술성 부합성 매트릭스 포맷 (`rfp-alignment-matrix.md`)

정부 공고문(RFP) 요구사항과 제안할 연구개발 내용의 정합성을 사전 검증하는 매트릭스 작성 표준 규격입니다.

```markdown
# RFP-기술성 부합성 매트릭스

## 부처 공고명: [공고문 상의 공식 사업명 및 과제 분야 입력]

### [RFP 요건 1] [RFP 공고문 상의 핵심 요구 역량/최종 성과 지표 입력]
- **정부 요구사항**: [정부가 명시한 정량적 성능 지표, TRL 레벨, 연구 범위 요약]
- **제안 기술의 부합성**:
  - [선행논문ID](file:///parsed-papers/{논문ID}.knows.yaml#C1): [어떤 선행 데이터와 통계적 수치 정보가 이 요건을 충족하는지 서술]
- **연구비 연계**: [요구사항 구현을 위해 할당한 세부 예산 및 CRO 위탁 예산 계획]
- **부합 여부**: `[충족 (Compliant) | 검토 요망 (Under Review)]`

### [RFP 요건 2] [바이오 규제 및 윤리성 승인 요구 요건 입력]
- **정부 요구사항**: [동물실험 승인(IACUC), 인간유래물 승인(IRB), 또는 생물안전(LMO) 규제 요건]
- **제안 기술의 부합성**:
  - [주관 연구기관 또는 참여기관의 IRB/IACUC 신청서 제출일 및 승인 목표 타임라인 기술]
- **부합 여부**: `[충족 (Compliant) | 미흡 (Non-Compliant)]`
```
