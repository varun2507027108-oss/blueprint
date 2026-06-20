import os
import logging
import html
import re
from typing import Dict, Any

logger = logging.getLogger(__name__)

from xhtml2pdf import pisa

def clean_and_wrap(text: str, max_len: int = 40, is_pre: bool = False) -> str:
    """
    Escapes text for HTML safety and wraps any word longer than max_len.
    Uses \n for line breaks if is_pre is True, otherwise <br/>.
    """
    if not text:
        return ""
    
    # First escape for HTML safety
    escaped_text = html.escape(str(text))
    
    words = []
    # Split by whitespace while keeping whitespace transitions
    parts = re.split(r"(\s+)", escaped_text)
    for part in parts:
        if not part or part.isspace():
            words.append(part)
        else:
            if len(part) > max_len:
                # Insert break character every max_len characters inside the word
                break_char = "\n" if is_pre else "<br/>"
                subparts = [part[i:i+max_len] for i in range(0, len(part), max_len)]
                words.append(break_char.join(subparts))
            else:
                words.append(part)
    return "".join(words)

def generate_report_html(startup_name: str, session_id: str, artifacts: Dict[str, Any]) -> str:
    """
    Compile all session artifacts into a beautifully styled, corporate HTML template.
    """
    advisor = artifacts.get("startup_advisor", {})
    market = artifacts.get("market_research", {})
    prd = artifacts.get("product_manager", {})
    arch = artifacts.get("architect", {})
    em = artifacts.get("engineering_manager", {})
    mkt = artifacts.get("marketing", {})
    
    # Advisor Risk CSS styling
    risk_score = advisor.get("risk_score", 0.0)
    risk_class = "risk-low" if risk_score <= 0.4 else ("risk-high" if risk_score > 0.6 else "callout")
    
    # Wrap base metadata
    startup_name_wrapped = clean_and_wrap(startup_name, 40)
    session_id_wrapped = clean_and_wrap(session_id, 40)
    
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{startup_name_wrapped} - Blueprint</title>
    <style>
        @page {{ size: letter; margin: 2cm; }}
        body {{
            font-family: Helvetica, Arial, sans-serif;
            color: #1a202c;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            font-size: 11pt;
        }}
        h1 {{
            font-size: 24pt;
            font-weight: 700;
            color: #0f172a;
            border-bottom: 3px solid #1e293b;
            padding-bottom: 10px;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        .meta-subtitle {{
            font-size: 10pt;
            color: #64748b;
            margin-bottom: 30px;
            font-family: 'Courier New', Courier, monospace;
        }}
        h2 {{
            font-size: 16pt;
            font-weight: 700;
            color: #ffffff;
            background-color: #1e293b;
            padding: 8px 12px;
            margin-top: 30px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        h3 {{
            font-size: 12pt;
            font-weight: 600;
            color: #334155;
            margin-top: 20px;
            margin-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
            text-transform: uppercase;
        }}
        p {{
            margin: 0 0 12px 0;
            font-size: 11pt;
        }}
        .callout {{
            background-color: #f8fafc;
            border-left: 4px solid #3b82f6;
            padding: 12px;
            margin-bottom: 15px;
            border-radius: 0 4px 4px 0;
            font-size: 11pt;
        }}
        .risk-high {{
            border-left: 4px solid #ef4444;
            background-color: #fef2f2;
        }}
        .risk-low {{
            border-left: 4px solid #10b981;
            background-color: #ecfdf5;
        }}
        ul {{
            margin: 0 0 15px 20px;
            padding: 0;
            font-size: 11pt;
        }}
        li {{
            margin-bottom: 6px;
        }}
        code, pre {{
            font-family: 'Courier New', Courier, monospace;
            background-color: #f1f5f9;
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 10pt;
            color: #d6336c;
        }}
        pre {{
            display: block;
            padding: 12px;
            margin-bottom: 15px;
            border: 1px solid #e2e8f0;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            color: #1a202c;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 10pt;
        }}
        th, td {{
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            text-align: left;
            vertical-align: top;
        }}
        th {{
            background-color: #f8fafc;
            font-weight: 700;
            color: #334155;
            text-transform: uppercase;
            font-size: 9pt;
            letter-spacing: 0.5px;
        }}
        tr:nth-child(even) {{
            background-color: #fcfcfd;
        }}
        .footer {{
            margin-top: 40px;
            text-align: center;
            font-size: 9pt;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
        }}
        .page-break {{
            page-break-before: always;
        }}
        .badge {{
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 9pt;
            font-weight: 700;
            text-transform: uppercase;
        }}
        .badge-must {{
            background-color: #fee2e2;
            color: #b91c1c;
        }}
        .badge-should {{
            background-color: #fef3c7;
            color: #b45309;
        }}
        .badge-high {{
            background-color: #fee2e2;
            color: #b91c1c;
        }}
        .badge-med {{
            background-color: #fef3c7;
            color: #b45309;
        }}
        .badge-low {{
            background-color: #d1fae5;
            color: #047857;
        }}
    </style>
</head>
<body>
    <h1>{startup_name_wrapped}</h1>
    <div class="meta-subtitle">AI Founder OS Blueprint | Session: {session_id_wrapped}</div>

    <!-- 1. Startup Advisor -->
    <h2>1. Executive Validation</h2>
    <div class="callout {risk_class}">
        <strong>Verdict:</strong> {clean_and_wrap(advisor.get("verdict", "N/A"), 40)}<br/>
        <strong>Risk Score:</strong> {risk_score}/1.0
    </div>
    <p><strong>Reasoning:</strong> {clean_and_wrap(advisor.get("reasoning", "N/A"), 80)}</p>
    """
    
    if advisor.get("red_flags"):
        html_content += "<h3>Critical Risks</h3><ul>"
        for rf in advisor.get("red_flags", []):
            html_content += f"<li>{clean_and_wrap(rf, 60)}</li>"
        html_content += "</ul>"

    # 2. Market Research
    html_content += f"""
    <div class="page-break"></div>
    <h2>2. Market Intelligence</h2>
    <p><strong>TAM Estimate:</strong> {clean_and_wrap(market.get("tam_estimate", "N/A"), 40)}</p>
    """
    
    if market.get("competitors"):
        html_content += "<h3>Competitor Landscape</h3><table><tr><th>Name</th><th>Description</th><th>URL</th></tr>"
        for comp in market.get("competitors", []):
            comp_name = clean_and_wrap(comp.get('name', ''), 40)
            comp_desc = clean_and_wrap(comp.get('description', ''), 60)
            comp_url_raw = comp.get('url', '')
            comp_url_escaped = html.escape(comp_url_raw) if comp_url_raw else "#"
            comp_url_wrapped = clean_and_wrap(comp_url_raw, 30)
            html_content += f"<tr><td><strong>{comp_name}</strong></td><td>{comp_desc}</td><td><a href='{comp_url_escaped}'>{comp_url_wrapped}</a></td></tr>"
        html_content += "</table>"
        
    if market.get("trends"):
        html_content += "<h3>Macro Trends</h3><ul>"
        for trend in market.get("trends", []):
            html_content += f"<li>{clean_and_wrap(trend, 80)}</li>"
        html_content += "</ul>"

    if market.get("sources"):
        html_content += "<h3>Sources Cited</h3><ul>"
        for src in market.get("sources", []):
            src_escaped = html.escape(src)
            src_wrapped = clean_and_wrap(src, 40)
            html_content += f"<li><a href='{src_escaped}'>{src_wrapped}</a></li>"
        html_content += "</ul>"

    # 3. Product Manager
    html_content += f"""
    <div class="page-break"></div>
    <h2>3. Product Requirements (PRD)</h2>
    <h3>Problem Statement</h3>
    <p>{clean_and_wrap(prd.get("problem_statement", "N/A"), 80)}</p>
    """
    
    if prd.get("user_stories"):
        html_content += "<h3>Core User Stories</h3><ul>"
        for story in prd.get("user_stories", []):
            html_content += f"<li>{clean_and_wrap(story, 80)}</li>"
        html_content += "</ul>"
        
    if prd.get("features"):
        html_content += "<h3>MVP Feature Scope</h3><table><tr><th>Priority</th><th>Feature</th><th>Description</th></tr>"
        for feat in prd.get("features", []):
            feat_priority = clean_and_wrap(feat.get('priority', 'Medium'), 10)
            feat_name = clean_and_wrap(feat.get('name', ''), 30)
            feat_desc = clean_and_wrap(feat.get('description', ''), 60)
            
            # Simple badge mapping
            p_lower = feat.get('priority', 'Medium').lower()
            badge_cls = "badge-must" if 'must' in p_lower else ("badge-should" if 'should' in p_lower else ("badge-high" if 'high' in p_lower else ("badge-low" if 'low' in p_lower else "badge-med")))
            
            html_content += f"<tr><td><span class='badge {badge_cls}'>{feat_priority}</span></td><td><strong>{feat_name}</strong></td><td>{feat_desc}</td></tr>"
        html_content += "</table>"

    if prd.get("roadmap_phases"):
        html_content += "<h3>Roadmap Phases</h3><table><tr><th>Phase</th><th>Key Deliverables</th></tr>"
        for phase in prd.get("roadmap_phases", []):
            phase_name = clean_and_wrap(phase.get('name', ''), 30)
            items_str = ", ".join(phase.get("items", []))
            items_wrapped = clean_and_wrap(items_str, 60)
            html_content += f"<tr><td><strong>{phase_name}</strong></td><td>{items_wrapped}</td></tr>"
        html_content += "</table>"

    # 4. Architect
    html_content += f"""
    <div class="page-break"></div>
    <h2>4. System Architecture</h2>
    <h3>System Design Notes</h3>
    <p>{clean_and_wrap(arch.get("system_design_notes", "N/A"), 80)}</p>
    """
    
    if arch.get("db_schema_sql"):
        html_content += f"<h3>Database Schema (SQL)</h3><pre><code>{clean_and_wrap(arch.get('db_schema_sql', ''), 60, is_pre=True)}</code></pre>"
        
    if arch.get("api_endpoints"):
        html_content += "<h3>API Endpoints Contract</h3><table><tr><th>Method</th><th>Path</th><th>Description</th></tr>"
        for ep in arch.get("api_endpoints", []):
            ep_method = clean_and_wrap(ep.get('method', 'GET'), 10)
            ep_path = clean_and_wrap(ep.get('path', ''), 40)
            ep_desc = clean_and_wrap(ep.get('description', ''), 60)
            html_content += f"<tr><td><code>{ep_method}</code></td><td><strong>{ep_path}</strong></td><td>{ep_desc}</td></tr>"
        html_content += "</table>"

    # 5. Engineering Manager
    html_content += f"""
    <div class="page-break"></div>
    <h2>5. Delivery Plan</h2>
    """
    
    if em.get("sprints"):
        html_content += "<h3>Sprint Allocation</h3><table><tr><th>Sprint</th><th>Issues</th></tr>"
        for sp in em.get("sprints", []):
            sp_name = clean_and_wrap(sp.get('name', ''), 30)
            issues_str = ", ".join(sp.get("issue_titles", []))
            issues_wrapped = clean_and_wrap(issues_str, 60)
            html_content += f"<tr><td><strong>{sp_name}</strong></td><td>{issues_wrapped}</td></tr>"
        html_content += "</table>"
        
    if em.get("issues"):
        html_content += "<h3>GitHub Issues Backlog</h3>"
        for issue in em.get("issues", []):
            issue_title = clean_and_wrap(issue.get('title', ''), 60)
            labels_str = ", ".join(issue.get("labels", []))
            labels_wrapped = clean_and_wrap(labels_str, 40)
            issue_body = clean_and_wrap(issue.get('body', ''), 80)
            html_content += f"<p><strong>{issue_title}</strong><br/><code>Labels: {labels_wrapped}</code><br/>{issue_body}</p>"

    # 6. Marketing
    html_content += f"""
    <div class="page-break"></div>
    <h2>6. Go-To-Market Strategy</h2>
    <h3>Landing Page Copy</h3>
    <div class="callout" style="border-left-color: #10b981; background-color: #f0fdf4;">
        <p style="white-space: pre-wrap; margin:0;">{clean_and_wrap(mkt.get("landing_copy", "N/A"), 80, is_pre=True)}</p>
    </div>
    
    <h3>LinkedIn Launch Post</h3>
    <p style="white-space: pre-wrap;">{clean_and_wrap(mkt.get("linkedin_post", "N/A"), 80, is_pre=True)}</p>
    
    <h3>Email Campaign Copy</h3>
    <p style="white-space: pre-wrap;">{clean_and_wrap(mkt.get("email_campaign", "N/A"), 80, is_pre=True)}</p>
    """

    html_content += """
    <div class="footer">
        Generated by AI Founder Orchestration System. All Rights Reserved.
    </div>
</body>
</html>
"""
    return html_content

def export_to_pdf(startup_name: str, session_id: str, artifacts: Dict[str, Any], output_dir: str = "exports") -> str:
    """
    Compiles all stage artifacts for a session and renders them to a PDF file using xhtml2pdf.
    Returns the absolute path to the generated file.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    html_content = generate_report_html(startup_name, session_id, artifacts)
    pdf_path = os.path.join(output_dir, f"{session_id}_report.pdf")
    
    with open(pdf_path, "w+b") as pdf_file:
        pisa_status = pisa.CreatePDF(html_content, dest=pdf_file)
        
    if pisa_status.err:
        if os.path.exists(pdf_path):
            try:
                os.remove(pdf_path)
            except Exception:
                pass
        raise RuntimeError(f"xhtml2pdf rendering failed with status code {pisa_status.err}")
        
    logger.info(f"Generated PDF report successfully using xhtml2pdf: {pdf_path}")
    return os.path.abspath(pdf_path)