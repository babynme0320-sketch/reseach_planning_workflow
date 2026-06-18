"""1회 실행용 빌드 타임 스크립트.

"법령, 매뉴얼/" 폴더의 PDF를 페이지 단위로 텍스트 추출해
data/legal_index.json 으로 저장한다. 런타임에는 사용하지 않는다.

실행: python scripts/extract_legal_pdfs.py
"""
import json
import re
from pathlib import Path

import pdfplumber

ROOT = Path(__file__).resolve().parent.parent
PDF_DIR = ROOT / "법령, 매뉴얼"
OUTPUT_PATH = ROOT / "data" / "legal_index.json"

TYPE_RULES = [
    ("시행령", "시행령"),
    ("신구대비표", "신구대비표"),
    ("법률", "법률"),
]


def classify_type(filename: str) -> str:
    for keyword, doc_type in TYPE_RULES:
        if keyword in filename:
            return doc_type
    return "매뉴얼"


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def extract_pdf(pdf_path: Path) -> list[dict]:
    doc_name = pdf_path.stem
    doc_type = classify_type(pdf_path.name)
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ""
            pages.append(
                {
                    "doc": doc_name,
                    "type": doc_type,
                    "page": page_number,
                    "text": text,
                    "text_normalized": normalize(text),
                }
            )
    return pages


def main() -> None:
    if not PDF_DIR.is_dir():
        raise SystemExit(f"PDF 폴더를 찾을 수 없습니다: {PDF_DIR}")

    pdf_files = sorted(PDF_DIR.glob("*.pdf"))
    if not pdf_files:
        raise SystemExit(f"PDF 파일이 없습니다: {PDF_DIR}")

    all_pages: list[dict] = []
    for pdf_path in pdf_files:
        print(f"추출 중: {pdf_path.name}")
        all_pages.extend(extract_pdf(pdf_path))

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(all_pages, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"완료: {len(pdf_files)}개 PDF, {len(all_pages)}페이지 -> {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
