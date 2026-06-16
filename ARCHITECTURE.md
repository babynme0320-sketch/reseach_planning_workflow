# Architecture: Bio-R&D Proposal Dashboard

본 문서는 바이오 연구기획 대시보드의 전체 시스템 아키텍처 및 데이터 흐름을 정의합니다.

## 1. 아키텍처 다이어그램 (Architecture Diagram)

```mermaid
graph LR
    subgraph Client [프론트엔드 - 웹 브라우저]
        UI[index.html & CSS/JS]
        Marked[Marked.js - 마크다운 렌더러]
        Mermaid[Mermaid.js - 다이어그램 렌더러]
        MathJax[MathJax - 수식 렌더러]
        State[로컬 상태 관리 - 예산/진단/TRL]
    end

    subgraph Server [백엔드 - 로컬 API 서버]
        PyServer[server.py - Python HTTP Server]
        FileReader[로컬 파일 리더 - /api/read]
    end

    subgraph Data [데이터 스토리지]
        MarkdownFiles[마크다운 문서군 - docs/plans/ designs/ 등]
    end

    UI -->|1. 파일 읽기 요청 GET /api/read?file=...| PyServer
    PyServer -->|2. 파일 로딩| FileReader
    FileReader -->|3. 내용 반환| MarkdownFiles
    FileReader -->|4. 파일 내용 전달 (Text)| PyServer
    PyServer -->|5. HTTP Response (utf-8)| UI
    UI -->|6. 마크다운 변환| Marked
    UI -->|7. 수식/다이어그램 렌더링| MathJax & Mermaid
```

---

## 2. 레이어 정의 (Layer Definition)

### 2.1 프론트엔드 레이어 (Client Layer)
- **HTML/CSS**: 시각적 프리미엄 화려함을 제공하는 마크업 및 스타일링. 글래스모피즘(Glassmorphism)과 산학연병 고대비 주체별 컬러 시스템 적용.
- **JavaScript (Vanilla ES6)**: 사이드바 라우팅 제어, 툴박스(예산, TRL, 자가진단) 로직 제어. 외부 라이브러리(marked.js, mermaid.js, MathJax) 동적 연동 및 예산/자가진단 상태 계산.

### 2.2 백엔드 레이어 (Server Layer)
- **Python server.py**: `http.server.SimpleHTTPRequestHandler`를 상속하여 구현된 초경량 로컬 개발 서버.
- **`/api/read` 엔드포인트**: 클라이언트가 요청한 로컬 마크다운 파일 경로를 읽어 텍스트 파일 내용을 UTF-8 인코딩으로 전달. 디렉토리 트래버설 공격 방어 로직 내장.

### 2.3 데이터 스토리지 레이어 (Data Layer)
- 데이터베이스 없이, `docs/` 및 `claims-matrix/`, `drafts/` 하위의 파일 시스템(File System) 자체를 데이터 스토리지로 활용하여 비개발자가 텍스트 에디터로 문서를 직접 수정·유지보수할 수 있도록 함.
