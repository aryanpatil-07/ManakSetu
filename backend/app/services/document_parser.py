import io
from typing import Optional, Dict, Any

class DocumentParser:
    """
    Extracts text and tender specifications from PDF documents
    using PyMuPDF (fitz) or fallback parsers.
    """
    def __init__(self):
        self._has_fitz = False
        try:
            import fitz  # PyMuPDF
            self._has_fitz = True
        except ImportError:
            self._has_fitz = False

    def parse_pdf_bytes(self, pdf_bytes: bytes) -> Dict[str, Any]:
        """Extract text, page count, and metadata from raw PDF bytes."""
        if self._has_fitz:
            import fitz
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            total_pages = len(doc)
            full_text = []
            for page_num in range(total_pages):
                page = doc.load_page(page_num)
                full_text.append(page.get_text())
            doc.close()
            return {
                "text": "\n".join(full_text),
                "total_pages": total_pages,
                "engine": "PyMuPDF"
            }
        else:
            # Fallback byte scanner for text tokens
            try:
                text_content = pdf_bytes.decode("utf-8", errors="ignore")
                return {
                    "text": text_content,
                    "total_pages": 1,
                    "engine": "TextDecoderFallback"
                }
            except Exception as e:
                return {
                    "text": "",
                    "total_pages": 0,
                    "error": str(e),
                    "engine": "Error"
                }

    def parse_pdf_file(self, file_path: str) -> Dict[str, Any]:
        with open(file_path, "rb") as f:
            return self.parse_pdf_bytes(f.read())
