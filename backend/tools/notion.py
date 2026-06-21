# Notion Tool Integration
import httpx
import logging
from typing import Dict, Any, List, Optional
from config import settings

logger = logging.getLogger(__name__)
NOTION_VERSION = "2022-06-28"
NOTION_CLIENT = httpx.AsyncClient(timeout=30.0)

def get_headers(token: Optional[str] = None) -> Dict[str, str]:
    actual_token = token or settings.NOTION_TOKEN
    return {
        "Authorization": f"Bearer {actual_token}",
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION
    }

def _chunk_string(s: str, max_len: int = 1900) -> List[str]:
    if not s: return [""]
    return [s[i:i+max_len] for i in range(0, len(s), max_len)]

async def create_notion_page(startup_name: str, session_id: str, token: Optional[str] = None, db_id: Optional[str] = None) -> Optional[str]:
    actual_token = token or settings.NOTION_TOKEN
    actual_db_id = db_id or settings.NOTION_DATABASE_ID
    if not actual_token or not actual_db_id:
        logger.warning("Notion token or database ID not set.")
        return None

    url = "https://api.notion.com/v1/pages"
    payload = {
        "parent": {"database_id": actual_db_id},
        "properties": {
            "Name": {
                "title": [
                    {"text": {"content": f"{startup_name} - Blueprint ({session_id.split('-')[0]})"}}
                ]
            }
        }
    }

    try:
        response = await NOTION_CLIENT.post(url, headers=get_headers(actual_token), json=payload)
        if response.status_code == 200:
            return response.json().get("id")
        logger.error(f"Notion page creation failed: {response.text}")
        return None
    except Exception as e:
        logger.exception(f"Error creating Notion page: {e}")
        return None

async def append_notion_blocks(page_id: str, blocks: List[Dict[str, Any]], token: Optional[str] = None, db_id: Optional[str] = None) -> bool:
    actual_token = token or settings.NOTION_TOKEN
    if not actual_token: return False

    url = f"https://api.notion.com/v1/blocks/{page_id}/children"
    chunk_size = 80
    for i in range(0, len(blocks), chunk_size):
        chunk = blocks[i:i + chunk_size]
        try:
            response = await NOTION_CLIENT.patch(url, headers=get_headers(actual_token), json={"children": chunk})
            if response.status_code != 200:
                logger.error(f"Notion append failed: {response.text}")
                return False
        except Exception as e:
            logger.exception(f"Error appending Notion blocks: {e}")
            return False
    return True

# --- Professional Block Builders ---

def create_heading_block(text: str, level: int = 1) -> Dict[str, Any]:
    key = f"heading_{level}"
    return {
        "object": "block",
        "type": key,
        key: {"rich_text": [{"type": "text", "text": {"content": text[:1900]}, "annotations": {"bold": True}}]}
    }

def create_divider_block() -> Dict[str, Any]:
    return {"object": "block", "type": "divider", "divider": {}}

def create_quote_block(text: str) -> List[Dict[str, Any]]:
    blocks = []
    for chunk in _chunk_string(text):
        blocks.append({
            "object": "block",
            "type": "quote",
            "quote": {"rich_text": [{"type": "text", "text": {"content": chunk}}]}
        })
    return blocks

def create_paragraph_block(text: str) -> List[Dict[str, Any]]:
    blocks = []
    for chunk in _chunk_string(text):
        blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {"rich_text": [{"type": "text", "text": {"content": chunk}}]}
        })
    return blocks

def create_bullet_block(text: str) -> List[Dict[str, Any]]:
    blocks = []
    for chunk in _chunk_string(text):
        blocks.append({
            "object": "block",
            "type": "bulleted_list_item",
            "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": chunk}}]}
        })
    return blocks

def create_toggle_code_block(code: str, language: str, title: str) -> List[Dict[str, Any]]:
    """Creates a toggle block to hide long code snippets, keeping the page clean."""
    blocks = []
    for chunk in _chunk_string(code):
        blocks.append({
            "object": "block",
            "type": "toggle",
            "toggle": {
                "rich_text": [{"type": "text", "text": {"content": title}, "annotations": {"bold": True}}],
                "children": [{
                    "object": "block",
                    "type": "code",
                    "code": {"rich_text": [{"type": "text", "text": {"content": chunk}}], "language": language}
                }]
            }
        })
    return blocks

def translate_artifact_to_notion_blocks(stage_name: str, payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    blocks = []
    
    if stage_name == "startup_advisor":
        blocks.append(create_heading_block("1. Executive Validation", 1))
        blocks.append(create_divider_block())
        blocks.extend(create_quote_block(f"Verdict: {payload.get('verdict', '')}  |  Risk Score: {payload.get('risk_score', 0.0)}/1.0"))
        blocks.extend(create_paragraph_block(payload.get("reasoning", "")))
        if payload.get("red_flags"):
            blocks.append(create_heading_block("Critical Risks", 3))
            for rf in payload.get("red_flags", []):
                blocks.extend(create_bullet_block(rf))
                
    elif stage_name == "market_research":
        blocks.append(create_heading_block("2. Market Intelligence", 1))
        blocks.append(create_divider_block())
        blocks.extend(create_paragraph_block(f"TAM Estimate: {payload.get('tam_estimate', '')}"))
        
        if payload.get("competitors"):
            blocks.append(create_heading_block("Competitor Landscape", 3))
            for comp in payload.get("competitors", []):
                blocks.extend(create_bullet_block(f"{comp.get('name', '')}: {comp.get('description', '')}"))
        if payload.get("trends"):
            blocks.append(create_heading_block("Macro Trends", 3))
            for trend in payload.get("trends", []):
                blocks.extend(create_bullet_block(trend))

    elif stage_name == "product_manager":
        blocks.append(create_heading_block("3. Product Requirements (PRD)", 1))
        blocks.append(create_divider_block())
        blocks.extend(create_paragraph_block(payload.get("problem_statement", "")))
        
        if payload.get("features"):
            blocks.append(create_heading_block("MVP Feature Scope", 3))
            for feat in payload.get("features", []):
                blocks.extend(create_bullet_block(f"[{feat.get('priority', 'Med')}] {feat.get('name', '')}: {feat.get('description', '')}"))

    elif stage_name == "architect":
        blocks.append(create_heading_block("4. System Architecture", 1))
        blocks.append(create_divider_block())
        blocks.extend(create_paragraph_block(payload.get("system_design_notes", "")))
        
        if payload.get("db_schema_sql"):
            blocks.extend(create_toggle_code_block(payload.get("db_schema_sql", ""), "sql", "View Database Schema (SQL)"))
            
        if payload.get("api_endpoints"):
            blocks.append(create_heading_block("API Endpoints", 3))
            for ep in payload.get("api_endpoints", []):
                blocks.extend(create_bullet_block(f"{ep.get('method', 'GET')} {ep.get('path', '')} - {ep.get('description', '')}"))

    elif stage_name == "engineering_manager":
        blocks.append(create_heading_block("5. Delivery Plan", 1))
        blocks.append(create_divider_block())
        
        if payload.get("sprints"):
            blocks.append(create_heading_block("Sprint Allocation", 3))
            for sp in payload.get("sprints", []):
                blocks.extend(create_bullet_block(f"{sp.get('name', '')}: {', '.join(sp.get('issue_titles', []))}"))

    elif stage_name == "marketing":
        blocks.append(create_heading_block("6. Go-To-Market Strategy", 1))
        blocks.append(create_divider_block())
        blocks.append(create_heading_block("Landing Page", 3))
        blocks.extend(create_paragraph_block(payload.get("landing_copy", "")))
        blocks.append(create_heading_block("LinkedIn Launch", 3))
        blocks.extend(create_paragraph_block(payload.get("linkedin_post", "")))
            
    return blocks