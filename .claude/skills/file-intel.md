---
name: file-intel
description: Process a folder of documents (PDFs, Word, Excel, slides, JSON, CSV) through Gemini to generate Obsidian-ready summaries and cheat sheets. Use when the user runs /file-intel or wants to synthesize a folder of files into their vault.
---

# File Intel — Document Synthesis Pipeline

## Vault Location
```
C:\Users\pvr66\OneDrive\Documents\Obsidian Vault\
```

## Trigger Phrases
"summarise this folder", "run file intel", "process these files", "import these docs", or when a folder path is given requiring synthesis.

## Workflow

### Step 1 — Identify the folder
Ask the user which folder to process. Default options:
- `inbox/` — unprocessed files in the vault
- Custom path they provide

### Step 2 — Check for the Python script
Look for `scripts/process_files_with_gemini.py` at the vault root.

If it doesn't exist, create it (see template below).

### Step 3 — Run the script
```bash
cd "C:\Users\pvr66\OneDrive\Documents\Obsidian Vault"
python scripts/process_files_with_gemini.py <folder_path>
```

The script requires `GOOGLE_API_KEY` in the environment or a `.env` file at vault root.

### Step 4 — Show results
Open and display the output from `outputs/file_summaries/YYYY-MM-DD/MASTER_SUMMARY.md`.

Report: file count processed, output location, and any files that failed.

### Step 5 — Import to vault
Move the generated `*_summary.md` files into the appropriate vault folder:
- Research/reference material → `research/`
- Project-related → `projects/[name]/`
- C4K work → `C4K-Brain/`

---

## Python Script Template

If `scripts/process_files_with_gemini.py` doesn't exist, create it at vault root:

```python
#!/usr/bin/env python3
"""
File Intel — Batch document synthesis via Gemini API.
Converts PDFs, PPTX, XLSX, DOCX, CSV, JSON, and text files
into concise Obsidian-ready Markdown summaries.
"""

import os
import sys
import json
import datetime
from pathlib import Path

try:
    import google.generativeai as genai
except ImportError:
    print("Install google-generativeai: pip install google-generativeai")
    sys.exit(1)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

API_KEY = os.environ.get("GOOGLE_API_KEY")
if not API_KEY:
    print("Error: GOOGLE_API_KEY not set. Add it to .env or your environment.")
    sys.exit(1)

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

SUPPORTED = {".pdf", ".pptx", ".xlsx", ".docx", ".csv", ".json", ".xml",
             ".md", ".txt", ".py", ".js", ".html", ".css"}

PROMPT = """You are a knowledge synthesizer. Read the document content below and produce a concise Obsidian-ready summary.

Format:
# [Document Title]

## Key Points
- (3-7 most important points)

## Details
(2-3 paragraphs of relevant context)

## Action Items / Next Steps
- (if any)

## Tags
#[relevant-tag1] #[relevant-tag2]

---
Document content:
{content}
"""

def read_file(path: Path) -> str:
    suffix = path.suffix.lower()
    try:
        if suffix == ".pdf":
            try:
                import pypdf
                reader = pypdf.PdfReader(str(path))
                return "\n".join(page.extract_text() or "" for page in reader.pages)
            except ImportError:
                return f"[PDF reading requires pypdf: pip install pypdf]\nFile: {path.name}"
        elif suffix in {".docx"}:
            try:
                import docx
                doc = docx.Document(str(path))
                return "\n".join(p.text for p in doc.paragraphs)
            except ImportError:
                return f"[DOCX reading requires python-docx: pip install python-docx]\nFile: {path.name}"
        elif suffix in {".xlsx"}:
            try:
                import openpyxl
                wb = openpyxl.load_workbook(str(path), read_only=True)
                rows = []
                for sheet in wb.sheetnames:
                    ws = wb[sheet]
                    for row in ws.iter_rows(values_only=True):
                        rows.append("\t".join(str(c) if c is not None else "" for c in row))
                return "\n".join(rows[:500])  # cap at 500 rows
            except ImportError:
                return f"[XLSX reading requires openpyxl: pip install openpyxl]\nFile: {path.name}"
        else:
            return path.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        return f"[Could not read file: {e}]"

def summarize(content: str, filename: str) -> str:
    try:
        response = model.generate_content(PROMPT.format(content=content[:50000]))
        return response.text
    except Exception as e:
        return f"# {filename}\n\n[Summarization failed: {e}]"

def main():
    if len(sys.argv) < 2:
        print("Usage: python process_files_with_gemini.py <folder_path>")
        sys.exit(1)

    folder = Path(sys.argv[1])
    if not folder.exists():
        print(f"Folder not found: {folder}")
        sys.exit(1)

    date_str = datetime.date.today().isoformat()
    output_dir = Path("outputs/file_summaries") / date_str
    output_dir.mkdir(parents=True, exist_ok=True)

    files = [f for f in folder.iterdir() if f.is_file() and f.suffix.lower() in SUPPORTED]
    if not files:
        print(f"No supported files found in {folder}")
        sys.exit(0)

    print(f"Processing {len(files)} files...")
    summaries = []

    for f in files:
        print(f"  → {f.name}")
        content = read_file(f)
        summary = summarize(content, f.name)
        out_file = output_dir / f"{f.stem}_summary.md"
        out_file.write_text(summary, encoding="utf-8")
        summaries.append((f.name, summary))

    # Write master summary
    master = output_dir / "MASTER_SUMMARY.md"
    with master.open("w", encoding="utf-8") as mf:
        mf.write(f"# File Intel — {date_str}\n\n")
        mf.write(f"Processed {len(files)} files from `{folder}`\n\n---\n\n")
        for name, s in summaries:
            mf.write(f"## {name}\n\n{s}\n\n---\n\n")

    print(f"\nDone. Output: {output_dir}")
    print(f"Master summary: {master}")

if __name__ == "__main__":
    main()
```

## Supported File Types
PDF, PPTX, XLSX, DOCX, CSV, JSON, XML, MD, TXT, PY, JS, HTML, CSS

## Notes
- Requires `GOOGLE_API_KEY` environment variable
- Large PDFs are handled via Gemini's 1M token context window
- Output goes to `outputs/file_summaries/YYYY-MM-DD/`
- Each file gets its own `*_summary.md` plus a `MASTER_SUMMARY.md` digest
