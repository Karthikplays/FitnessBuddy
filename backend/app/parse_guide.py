import os
import logging
from docling.document_converter import DocumentConverter

logger = logging.getLogger("fitness-buddy")

def parse_fitness_guide(pdf_path: str, output_md_path: str) -> str:
    """
    Parses a PDF fitness/nutrition guide using Docling, exports it to Markdown,
    and caches it locally. Returns the parsed markdown string.
    """
    if not os.path.exists(pdf_path):
        logger.warning(f"PDF source document not found at: {pdf_path}")
        return ""
        
    try:
        logger.info(f"Docling is parsing: {pdf_path}... (This might download tree-sitter or parser models on first run)")
        converter = DocumentConverter()
        result = converter.convert(pdf_path)
        
        # Extract structured content as Markdown
        markdown_content = result.document.export_to_markdown()
        
        # Save output MD for cache/reference
        os.makedirs(os.path.dirname(output_md_path), exist_ok=True)
        with open(output_md_path, "w", encoding="utf-8") as f:
            f.write(markdown_content)
            
        logger.info(f"Successfully parsed PDF and cached markdown at: {output_md_path}")
        return markdown_content
    except Exception as e:
        logger.error(f"Docling failed to parse PDF: {e}")
        return ""

def load_cached_or_parse(pdf_path: str, md_path: str) -> str:
    """
    Checks if a cached markdown file exists. If so, loads it.
    Otherwise, parses the PDF.
    """
    if os.path.exists(md_path):
        logger.info(f"Loading cached RAG content from markdown: {md_path}")
        try:
            with open(md_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            logger.error(f"Failed to read cached markdown: {e}")
            
    # Try parsing
    if os.path.exists(pdf_path):
        return parse_fitness_guide(pdf_path, md_path)
        
    return ""

if __name__ == "__main__":
    # Test script execution
    logging.basicConfig(level=logging.INFO)
    docs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "docs"))
    pdf = os.path.join(docs_dir, "fitness_guide.pdf")
    md = os.path.join(docs_dir, "fitness_guide.md")
    
    print(f"Checking for PDF at: {pdf}")
    if os.path.exists(pdf):
        content = parse_fitness_guide(pdf, md)
        print("\n--- Parsed Preview (first 300 chars) ---")
        print(content[:300])
    else:
        print("Please place a 'fitness_guide.pdf' in the root 'docs/' folder to test.")
