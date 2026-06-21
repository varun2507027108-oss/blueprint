import os
import logging
import html
import re
from typing import Dict, Any

logger = logging.getLogger(__name__)

from xhtml2pdf import pisa

def clean_and_wrap(text: str, max_len: int = 40, is_pre: bool = False) -> str:
    if not text:
        return ""
    escaped_text = html.escape(str(text))
    words = []
    parts = re.split(r"(\s+)", escaped_text)
    for part in parts:
        if not part or part.isspace():
            words.append(part)
        else:
            if len(part) > max_len:
                break_char = "\n" if is_pre else "<br/>"
                subparts = [part[i:i+max_len] for i in range(0, len(part), max_len)]
                words.append(break_char.join(subparts))
            else:
                words.append(part)
    return "".join(words)

def generate_report_html(startup_name: str, session_id: str, artifacts: Dict[str, Any]) -> str:
    advisor = artifacts.get("startup_advisor", {})
    market = artifacts.get("market_research", {})
    prd = artifacts.get("product_manager", {})
    arch = artifacts.get("architect", {})
    em = artifacts.get("engineering_manager", {})
    mkt = artifacts.get("marketing", {})
    
    risk_score = advisor.get("risk_score", 0.0)
    risk_class = "risk-low" if risk_score <= 0.4 else ("risk-high" if risk_score > 0.6 else "callout")
    
    startup_name_wrapped = clean_and_wrap(startup_name, 40)
    session_id_wrapped = clean_and_wrap(session_id, 40)
    
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{startup_name_wrapped} - Blueprint</title>
    <style>
        @page {{ size: letter; margin: 2cm; }}
        body {{ font-family: Helvetica, Arial, sans-serif; color: #1a202c; line-height: 1.5; margin: 0; padding: 0; font-size: 11pt; }}
        h1 {{ font-size: 24pt; font-weight: 700; color: #0f172a; border-bottom: 3px solid #1e293b; padding-bottom: 10px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }}
        .meta-subtitle {{ font-size: 10pt; color: #64748b; margin-bottom: 30px; font-family: 'Courier New', Courier, monospace; }}
        h2 {{ font-size: 16pt; font-weight: 700; color: #ffffff; background-color: #1e293b; padding: 8px 12px; margin-top: 30px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }}
        h3 {{ font-size: 12pt; font-weight: 600; color: #334155; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; text-transform: uppercase; }}
        p {{ margin: 0 0 12px 0; font-size: 11pt; }}
        .callout {{ background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px; margin-bottom: 15px; border-radius: 0 4px 4px 0; font-size: 11pt; }}
        .risk-high {{ border-left: 4px solid #ef4444; background-color: #fef2f2; }}
        .risk-low {{ border-left: 4px solid #10b981; background-color: #ecfdf5; }}
        ul {{ margin: 0 0 15px 20px; padding: 0; font-size: 11pt; }}
        li {{ margin-bottom: 6px; }}
        code, pre {{ font-family: 'Courier New', Courier, monospace; background-color: #f1f5f9; padding: 2px 5px; border-radius: 3px; font-size: 10pt; color: #d6336c; }}
        pre {{ display: block; padding: 12px; margin-bottom: 15px; border: 1px solid #e2e8f0; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; color: #1a202c; }}
        table {{ width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10pt; }}
        th, td {{ border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; vertical-align: top; }}
        th {{ background-color: #f8fafc; font-weight: 700; color: #334155; text-transform: uppercase; font-size: 9pt; letter-spacing: 0.5px; }}
        tr:nth-child(even) {{ background-color: #fcfcfd; }}
        .footer {{ margin-top: 40px; text-align: center; font-size: 9pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }}
        .page-break {{ page-break-before: always; }}
        
        /* Premium Grids */
        .grid-2 {{ display: flex; gap: 15px; margin-bottom: 15px; }}
        .col {{ flex: 1; border: 1px solid #e2e8f0; padding: 12px; background-color: #fcfcfd; }}
        .col h4 {{ font-size: 10pt; color: #1e293b; margin-top: 0; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }}
        
        /* Email Timeline */
        .email-step {{ border-left: 2px solid #3b82f6; padding-left: 15px; margin-bottom: 15px; }}
        .email-step h4 {{ margin: 0 0 5px 0; color: #1e293b; font-size: 11pt; }}
        .email-step .meta {{ font-size: 9pt; color: #64748b; margin-bottom: 5px; }}
    </style>
</head>
<body>
    <h1>{startup_name_wrapped}</h1>
    <div class="meta-subtitle">AI Founder OS Blueprint | Session: {session_id_wrapped}</div>

    <!-- 1. Startup Advisor -->
    <h2>1. Executive Summary</h2>
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
    
    if market.get("swot"):
        html_content += "<h3>SWOT Analysis</h3><div class='grid-2'>"
        html_content += f"<div class='col'><h4>Strengths</h4><ul>{''.join(f'<li>{clean_and_wrap(s, 60)}</li>' for s in market.get('swot', {}).get('strengths', []))}</ul></div>"
        html_content += f"<div class='col'><h4>Weaknesses</h4><ul>{''.join(f'<li>{clean_and_wrap(w, 60)}</li>' for w in market.get('swot', {}).get('weaknesses', []))}</ul></div>"
        html_content += "</div><div class='grid-2'>"
        html_content += f"<div class='col'><h4>Opportunities</h4><ul>{''.join(f'<li>{clean_and_wrap(o, 60)}</li>' for o in market.get('swot', {}).get('opportunities', []))}</ul></div>"
        html_content += f"<div class='col'><h4>Threats</h4><ul>{''.join(f'<li>{clean_and_wrap(t, 60)}</li>' for t in market.get('swot', {}).get('threats', []))}</ul></div>"
        html_content += "</div>"

    if market.get("competitors"):
        html_content += "<h3>Competitor Landscape</h3><table><tr><th>Name</th><th>Description</th><th>URL</th></tr>"
        for comp in market.get("competitors", []):
            html_content += f"<tr><td><strong>{clean_and_wrap(comp.get('name', ''), 40)}</strong></td><td>{clean_and_wrap(comp.get('description', ''), 60)}</td><td><a href='{html.escape(comp.get('url', '#'))}'>{clean_and_wrap(comp.get('url', ''), 30)}</a></td></tr>"
        html_content += "</table>"
        
    if market.get("gaps"):
        html_content += "<h3>Market Gaps</h3><ul>"
        for g in market.get("gaps", []):
            html_content += f"<li>{clean_and_wrap(g, 80)}</li>"
        html_content += "</ul>"

    # 3. Product Manager
    html_content += f"""
    <div class="page-break"></div>
    <h2>3. Product Requirements (PRD)</h2>
    """
    
    if prd.get("goals"):
        html_content += "<h3>Goals</h3><ul>"
        for g in prd.get("goals", []):
            html_content += f"<li>{clean_and_wrap(g, 80)}</li>"
        html_content += "</ul>"

    if prd.get("success_metrics"):
        html_content += "<h3>Success Metrics</h3><ul>"
        for sm in prd.get("success_metrics", []):
            html_content += f"<li>{clean_and_wrap(sm, 80)}</li>"
        html_content += "</ul>"

    html_content += f"""
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
            html_content += f"<tr><td>{clean_and_wrap(feat.get('priority', 'Medium'), 10)}</td><td><strong>{clean_and_wrap(feat.get('name', ''), 30)}</strong></td><td>{clean_and_wrap(feat.get('description', ''), 60)}</td></tr>"
        html_content += "</table>"

    if prd.get("roadmap_phases"):
        html_content += "<h3>Roadmap Phases</h3><table><tr><th>Phase</th><th>Key Deliverables</th></tr>"
        for phase in prd.get("roadmap_phases", []):
            html_content += f"<tr><td><strong>{clean_and_wrap(phase.get('name', ''), 30)}</strong></td><td>{clean_and_wrap(', '.join(phase.get('items', [])), 60)}</td></tr>"
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
            html_content += f"<tr><td><code>{clean_and_wrap(ep.get('method', 'GET'), 10)}</code></td><td><strong>{clean_and_wrap(ep.get('path', ''), 40)}</strong></td><td>{clean_and_wrap(ep.get('description', ''), 60)}</td></tr>"
        html_content += "</table>"

    # 5. Engineering Manager
    html_content += f"""
    <div class="page-break"></div>
    <h2>5. Delivery Plan</h2>
    """
    
    if em.get("sprints"):
        for sp in em.get("sprints", []):
            html_content += f"<h3>{clean_and_wrap(sp.get('name', 'Sprint'), 60)}</h3><ul>"
            for title in sp.get("issue_titles", []):
                issue_obj = next((iss for iss in em.get("issues", []) if iss.get("title") == title), None)
                sp_str = f" [{issue_obj.get('story_points', 3)} PT]" if issue_obj else ""
                html_content += f"<li><strong>{clean_and_wrap(title, 60)}</strong>{sp_str}</li>"
            html_content += "</ul>"
            
        html_content += "<h3>Issue Details</h3>"
        for issue in em.get("issues", []):
            sp = issue.get("story_points", 3)
            labels = ", ".join(issue.get("labels", []))
            html_content += f"<p><strong>{clean_and_wrap(issue.get('title', ''), 60)}</strong> <code>[{sp} SP]</code><br/><code>Labels: {clean_and_wrap(labels, 40)}</code><br/>{clean_and_wrap(issue.get('body', ''), 80)}</p>"

    if em.get("definition_of_done"):
        html_content += "<h3>Definition of Done</h3><ul>"
        for d in em.get("definition_of_done", []): html_content += f"<li>{clean_and_wrap(d, 80)}</li>"
        html_content += "</ul>"

    if em.get("tech_debt_risks"):
        html_content += "<h3>Tech Debt Risks</h3><ul>"
        for r in em.get("tech_debt_risks", []): html_content += f"<li>{clean_and_wrap(r, 80)}</li>"
        html_content += "</ul>"

    if em.get("team_size_recommended"):
        html_content += f"<p><strong>Recommended Team Size:</strong> {clean_and_wrap(em.get('team_size_recommended', 'N/A'), 40)}</p>"

    # 6. Marketing (Upgraded)
    html_content += f"""
    <div class="page-break"></div>
    <h2>6. Go-To-Market Strategy</h2>
    <h3>Landing Page Copy</h3>
    <div class="callout" style="border-left-color: #10b981; background-color: #f0fdf4;">
        <p style="white-space: pre-wrap; margin:0;">{clean_and_wrap(mkt.get("landing_copy", "N/A"), 80, is_pre=True)}</p>
    </div>
    
    <h3>LinkedIn Launch Post</h3>
    <p style="white-space: pre-wrap;">{clean_and_wrap(mkt.get("linkedin_post", "N/A"), 80, is_pre=True)}</p>
    """
    
    if mkt.get("pricing_tiers"):
        html_content += "<h3>Pricing Strategy</h3><div class='grid-2'>"
        for tier in mkt.get("pricing_tiers", []):
            features_html = "".join(f"<li>{clean_and_wrap(f, 40)}</li>" for f in tier.get("features", []))
            html_content += f"""
            <div class='col'>
                <h4>{clean_and_wrap(tier.get('model', 'Tier'), 20)} - {clean_and_wrap(tier.get('price', 'N/A'), 20)}</h4>
                <ul>{features_html}</ul>
            </div>
            """
        html_content += "</div>"

    if mkt.get("email_sequence"):
        html_content += "<h3>Email Drip Campaign</h3>"
        for step in mkt.get("email_sequence", []):
            html_content += f"""
            <div class="email-step">
                <h4>{clean_and_wrap(step.get('subject', 'No Subject'), 60)}</h4>
                <div class="meta">Send: {clean_and_wrap(step.get('send_day', 'N/A'), 20)} | Goal: {clean_and_wrap(step.get('goal', 'N/A'), 40)}</div>
                <p style="white-space: pre-wrap;">{clean_and_wrap(step.get('body', 'N/A'), 80, is_pre=True)}</p>
            </div>
            """

    if mkt.get("ninety_day_plan"):
        html_content += "<h3>90-Day Launch Plan</h3><ul>"
        for p in mkt.get("ninety_day_plan", []): html_content += f"<li>{clean_and_wrap(p, 80)}</li>"
        html_content += "</ul>"

    if mkt.get("launch_channels"):
        html_content += "<h3>Launch Channels</h3><table><tr><th>Channel</th><th>Tactic</th><th>Expected Reach</th></tr>"
        for ch in mkt.get("launch_channels", []):
            html_content += f"<tr><td><strong>{clean_and_wrap(ch.get('channel', ''), 20)}</strong></td><td>{clean_and_wrap(ch.get('tactic', ''), 60)}</td><td>{clean_and_wrap(ch.get('expected_reach', ''), 20)}</td></tr>"
        html_content += "</table>"

    html_content += """
    <div class="footer">
        Generated by AI Founder Orchestration System. All Rights Reserved.
    </div>
</body>
</html>
"""
    return html_content

def export_to_pdf(startup_name: str, session_id: str, artifacts: Dict[str, Any], output_dir: str = "exports") -> str:
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