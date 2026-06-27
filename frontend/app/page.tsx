"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Layers,
  GitBranch,
  Users,
  Database,
  ShieldCheck,
  FolderOpen,
  Folder,
  FileText,
  ChevronDown,
  Dna,
  Cpu,
  Play,
  Terminal,
  AlertOctagon,
  MousePointerClick,
  Info,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw,
  HelpCircle
} from "lucide-react";
import { CustomThemeToggler } from "@/components/theme-toggler";
import { InteractiveGridBackground } from "@/components/interactive-grid-background";

// Preset data matching the prototype
interface Competitor {
  name: string;
  weakness: string;
}

interface Feature {
  name: string;
  priority: string;
}

interface Endpoint {
  method: string;
  path: string;
  desc: string;
}

interface Sprint {
  name: string;
  issues: string[];
}

interface AdvisorData {
  verdict: string;
  risk_score: number;
  reasoning: string;
  red_flags: string[];
}

interface ResearcherData {
  tam: string;
  competitors: Competitor[];
}

interface PmData {
  problem: string;
  goals: string[];
  features: Feature[];
}

interface ArchitectData {
  mermaid: string;
  endpoints: Endpoint[];
}

interface EmData {
  sprints: Sprint[];
}

interface MarketingData {
  copy: string;
}

interface Preset {
  idea: string;
  risk: number;
  advisor: AdvisorData;
  researcher?: ResearcherData;
  pm?: PmData;
  architect?: ArchitectData;
  em?: EmData;
  marketing?: MarketingData;
}

const presets: Record<string, Preset> = {
  logiflow: {
    idea: "AI-Powered Micro-Logistics Optimizer for last-mile delivery drivers.",
    risk: 0.35,
    advisor: {
      verdict: "Approved",
      risk_score: 0.35,
      reasoning: "Excellent market timing. Aggressive growth in e-commerce requires last-mile optimizations. Margin feasibility is high due to routing API cost structures.",
      red_flags: []
    },
    researcher: {
      tam: "$12.4 Billion",
      competitors: [
        { name: "Route4Me", weakness: "Lacks real-time traffic machine learning models." },
        { name: "OptimoRoute", weakness: "Expensive pricing tiers for independent drivers." }
      ]
    },
    pm: {
      problem: "Last-mile delivery drivers lose 20% of their earnings to fuel inefficiency and poor route scheduling.",
      goals: ["Reduce routing times by 18%", "Increase driver daily deliveries by 2"],
      features: [
        { name: "Dynamic Route Optimizer", priority: "Must-Have" },
        { name: "Real-time Traffic Rerouting", priority: "Should-Have" }
      ]
    },
    architect: {
      mermaid: "classDiagram\n  class Driver {\n    id UUID PK\n    name VARCHAR\n  }\n  class Route {\n    id UUID PK\n    driver_id UUID FK\n    optimized_path JSON\n  }",
      endpoints: [
        { method: "POST", path: "/routes/optimize", desc: "Generates optimal path coordinate lists" }
      ]
    },
    em: {
      sprints: [
        { name: "Sprint 1: Core Database & Auth", issues: ["DB Schema Setup (3 SP)", "Driver API integration (5 SP)"] }
      ]
    },
    marketing: {
      copy: "PROBLEM: Stop losing fuel money. AGITATE: Traffic jams eat your margins. SOLVE: LogiFlow optimizes your routing path in real-time."
    }
  },
  solargrid: {
    idea: "Decentralized energy trading network using local smart grids.",
    risk: 0.58,
    advisor: {
      verdict: "Approved with Cautions",
      risk_score: 0.58,
      reasoning: "Strong thesis, but heavily dependent on municipal grids and regulatory compliance. High capital expenses are expected.",
      red_flags: ["Regulatory grid access limitations", "High initial hardware sensor costs"]
    },
    researcher: {
      tam: "$8.2 Billion",
      competitors: [
        { name: "PowerLedger", weakness: "Enterprise-heavy, ignores domestic micro-grids." }
      ]
    },
    pm: {
      problem: "Local residential solar setups waste 35% of excess generated energy due to lacking peer-to-peer sales channels.",
      goals: ["Deploy domestic smart grid nodes", "Enable P2P trading transactions"],
      features: [
        { name: "Local Energy Marketplace", priority: "Must-Have" }
      ]
    },
    architect: {
      mermaid: "classDiagram\n  class Household {\n    id UUID PK\n    generation_rate FLOAT\n  }\n  class Transaction {\n    id UUID PK\n    seller_id UUID FK\n    kwh_amount FLOAT\n  }",
      endpoints: [
        { method: "POST", path: "/trade/execute", desc: "Executes P2P energy ledger sales" }
      ]
    },
    em: {
      sprints: [
        { name: "Sprint 1: Smart Grid Ledger Setup", issues: ["Blockchain Node connection (8 SP)"] }
      ]
    },
    marketing: {
      copy: "PROBLEM: Solar energy goes waste. AGITATE: Utility companies buy your power for pennies. SOLVE: Trade energy directly with neighbors."
    }
  },
  dropshipper: {
    idea: "Generic drop-shipping store with zero marketing budget.",
    risk: 0.88,
    advisor: {
      verdict: "Needs Revision",
      risk_score: 0.88,
      reasoning: "Extremely low moat. Generic drop-shipping has near-zero margins. Highly vulnerable to single points of death (advertising platform shutdowns).",
      red_flags: ["Zero competitive moat", "Negative unit economics under ad bidding wars", "No organic marketing strategy"]
    },
    researcher: {
      tam: "$1.5 Billion",
      competitors: [
        { name: "Shopify Storefronts", weakness: "High customer acquisition costs." }
      ]
    },
    pm: {
      problem: "Dropshipping is highly competitive with low margins and high churn rate.",
      goals: ["Achieve profitability", "Increase retention rate"],
      features: [
        { name: "SEO optimization tool", priority: "Must-Have" }
      ]
    },
    architect: {
      mermaid: "classDiagram\n  class Store {\n    id UUID PK\n    name VARCHAR\n  }\n  class Product {\n    id UUID PK\n    store_id UUID FK\n    price DECIMAL\n  }",
      endpoints: [
        { method: "POST", path: "/store/setup", desc: "Sets up dropshipping storefront instance" }
      ]
    },
    em: {
      sprints: [
        { name: "Sprint 1: Store Setup", issues: ["Theme installation (1 SP)", "Payment gateway integration (5 SP)"] }
      ]
    },
    marketing: {
      copy: "PROBLEM: Low margins in dropshipping. AGITATE: Paid ads are too expensive. SOLVE: Automate dropshipping setup with zero upfront cost."
    }
  }
};

// Codebase explorer files data
interface CodeFile {
  name: string;
  path: string;
  desc: string;
  exports: string;
}

const files: Record<string, CodeFile> = {
  'b-main': {
    name: 'main.py',
    path: 'backend/main.py',
    desc: 'FastAPI server implementing REST endpoints. Manages CORS, mounts static export downloads, and implements background async tasks using asyncio.create_task to run the LangGraph pipeline without blocking response loops. Implements OAuth exchanges for GitHub and Notion.',
    exports: 'POST /sessions - Initiates thread\nGET /sessions/{id} - Fetches current state & artifacts\nPOST /sessions/{id}/gate-decision - Resumes from Risk Gate\nPOST /sessions/{id}/export - Triggers PDF/Notion compiling\nGET /auth/github & GET /auth/notion - Exchanges OAuth codes'
  },
  'b-graph': {
    name: 'graph.py',
    path: 'backend/graph.py',
    desc: 'Constructs the LangGraph StateGraph. Defines the nodes representing the 6 agents, active edges, conditional routing (route_after_advisor), and SqliteSaver checkpointing. Implements Groq, Google, and NVIDIA API query wrappers.',
    exports: 'create_graph() -> CompiledGraph\ninit_saver() -> SqliteSaver checkpointer context\nquery_groq(prompt, schema) -> Validated Pydantic output\nstartup_advisor_node(state) -> Dict[str, Any]\nproduct_manager_node(state) -> Dict[str, Any]'
  },
  'b-models': {
    name: 'models.py',
    path: 'backend/models.py',
    desc: 'Specifies data validation schemas. Declares Pydantic submodels (Competitor, Feature, RoadmapPhase, SWOTAnalysis, PricingTier, EmailStep) and the central GraphState schema containing parallel stage dictionaries governed by state merge reducers.',
    exports: 'class GraphState(BaseModel) - Central state schema\nclass ValidationResult(BaseModel) - Advisor schema\nclass MarketResearchReport(BaseModel) - Researcher schema\nclass PRD(BaseModel) - Product Manager schema\nclass ArchitectureSpec(BaseModel) - Architect schema'
  },
  'b-db': {
    name: 'db.py',
    path: 'backend/db.py',
    desc: 'Handles persistent database logging. Connects to Supabase to store sessions, versions of generated artifacts, and decision logs. Installs a local SQLite database (founder_os.db) as a robust automatic fallback when connection errors occur.',
    exports: 'save_session(session_id, name, idea)\nupdate_session_status(session_id, status)\nsave_artifact(session_id, stage_name, payload) -> version\nget_latest_artifact(session_id, stage_name) -> payload dict\nSQLite Fallback Table Initialization'
  },
  'b-config': {
    name: 'config.py',
    path: 'backend/config.py',
    desc: 'Configuration parser. Uses pydantic-settings BaseSettings to load and validate environment keys (.env), establishing default models (llama-3.3-70b-versatile, gemini-2.5-flash) and origin URLs.',
    exports: 'class Settings(BaseSettings)\nsettings = Settings() - Exported settings instance'
  },
  't-tavily': {
    name: 'tavily.py',
    path: 'backend/tools/tavily.py',
    desc: 'Integration helper for Tavily Search API. Assembles search parameters, calls the endpoint, extracts organic search result snippets, and returns details to the Market Researcher agent.',
    exports: 'search_tavily(query: str, max_results: int) -> list[dict]'
  },
  't-github': {
    name: 'github.py',
    path: 'backend/tools/github.py',
    desc: 'GitHub REST wrapper. Exchanges tokens, parses the EM sprint issues, and initiates background bulk POST calls to create issues with labels, story points, and task checklists on the user\'s repository.',
    exports: 'create_github_issue(repo, title, body, labels, token)\ncreate_github_issues_bulk(repo, issues_list, token)'
  },
  't-notion': {
    name: 'notion.py',
    path: 'backend/tools/notion.py',
    desc: 'Notion database compiler. Creates pages and translates JSON states into distinct Notion blocks (headings, callouts, lists). Includes automatic array chunking to bypass Notion\'s 100-block payload limit.',
    exports: 'create_notion_page(name, id, token, db_id) -> page_id\nappend_notion_blocks(page_id, blocks, token) -> success_bool\ntranslate_artifact_to_notion_blocks(stage, data) -> list[block_dict]'
  },
  't-pdf': {
    name: 'pdf_export.py',
    path: 'backend/tools/pdf_export.py',
    desc: 'Assembles a monolithic HTML report with customized CSS styles, sanitizes text strings, and calls xhtml2pdf (pisa) to export reports to the exports/ directory.',
    exports: 'export_to_pdf(startup_name, session_id, artifacts_dict) -> file_path\ngenerate_report_html(startup_name, session_id, artifacts)\nclean(text) -> HTML-escaped & word-wrapped string'
  },
  'f-css': {
    name: 'globals.css',
    path: 'frontend/globals.css',
    desc: 'Root CSS stylesheet configuration. Imports Tailwind CSS v4 directives, sets up theme colors (cream base, charcoal panel, amber accent), and overrides default dark-theme variables.',
    exports: '@import "tailwindcss";\n@theme declarations'
  },
  'f-layout': {
    name: 'layout.tsx',
    path: 'frontend/app/layout.tsx',
    desc: 'Next.js App Router root layout. Loads the JetBrains Mono font, initializes theme headers, and mounts the ThemeProvider wrapper around child pages.',
    exports: 'export default function RootLayout({ children })'
  },
  'f-page': {
    name: 'page.tsx',
    path: 'frontend/app/page.tsx',
    desc: 'Next.js home page introducing the Blueprint system, mapping out agent roles, and routing users to the intake form.',
    exports: 'export default function LandingPage()'
  }
};

export default function LandingPage() {
  const [activePreset, setActivePreset] = useState<string>("logiflow");
  const [simStatus, setSimStatus] = useState<"idle" | "running" | "paused" | "completed">("idle");
  const [activeNode, setActiveNode] = useState<string>("idle");
  const [logs, setLogs] = useState<Array<{ text: string; type: string; time: string }>>([
    { text: "[SYSTEM] Thread ready. Select a preset and click \"Run Pipeline\".", type: "default", time: "" }
  ]);
  const [outputBox, setOutputBox] = useState<{ title: string; schema: string; content: any }>({
    title: "OUTPUT ARTIFACT",
    schema: "None",
    content: "No active node outputs. Run the simulation to see structured JSON validation."
  });
  const [showInterrupt, setShowInterrupt] = useState(false);
  const [activeSection, setActiveSection] = useState("sec-stack");
  
  // File explorer tree state
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    root: true,
    backend: true,
    tools: true,
    frontend: true
  });
  const [activeFileKey, setActiveFileKey] = useState<string | null>(null);

  // Q&A state
  const [activeQa, setActiveQa] = useState<string | null>(null);

  // References for handling simulated execution timeout loops
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const consoleEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Clean timeouts on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const addLog = (text: string, type = "default") => {
    const time = new Date().toLocaleTimeString().split(" ")[0];
    setLogs((prev) => [...prev, { text, type, time }]);
  };

  const resetSim = (presetKey = activePreset) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSimStatus("idle");
    setActiveNode("idle");
    setShowInterrupt(false);
    setLogs([
      { text: `[SYSTEM] Environment reset. Preset "${presetKey.toUpperCase()}" loaded.`, type: "default", time: "" }
    ]);
    setOutputBox({
      title: "OUTPUT ARTIFACT",
      schema: "None",
      content: "No active node outputs. Run the simulation to see structured JSON validation."
    });
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextVal = e.target.value;
    setActivePreset(nextVal);
    resetSim(nextVal);
  };

  const startSim = () => {
    resetSim(activePreset);
    setSimStatus("running");
    
    // Step 0: Start
    setActiveNode("start");
    addLog("Initializing LangGraph StateGraph thread session...", "info");

    timerRef.current = setTimeout(() => {
      runAdvisor();
    }, 1000);
  };

  const runAdvisor = () => {
    setActiveNode("advisor");
    addLog("Entering node 'startup_advisor'...", "info");
    addLog("Querying Groq (model: llama-3.3-70b-versatile, temp: 0.1)...");

    timerRef.current = setTimeout(() => {
      const data = presets[activePreset].advisor;
      const isFailed = data.risk_score > 0.6;
      
      addLog(`Advisor finished. Verdict: ${data.verdict} | Risk: ${data.risk_score}`, isFailed ? "warn" : "success");
      setOutputBox({
        title: "Advisor output: ValidationResult",
        schema: "class ValidationResult(BaseModel)",
        content: data
      });

      if (isFailed) {
        setActiveNode("gate");
        setSimStatus("paused");
        addLog("RISK GATE EXCEEDED: Interrupting execution thread. Awaiting gate decision...", "warn");
        setShowInterrupt(true);
      } else {
        setActiveNode("gate");
        timerRef.current = setTimeout(() => {
          runResearcher();
        }, 1000);
      }
    }, 2000);
  };

  const resumeSim = (decision: "continue" | "revise") => {
    setShowInterrupt(false);
    
    if (decision === "continue") {
      setSimStatus("running");
      addLog("User command received: 'continue'. Resuming thread checkpoint...", "info");
      setActiveNode("researcher");
      runResearcher();
    } else {
      addLog("User command received: 'revise'. Resetting state to advisor entry point...", "warn");
      // Loop back to advisor with logiflow
      setActivePreset("logiflow");
      resetSim("logiflow");
      timerRef.current = setTimeout(() => {
        // Automatically start simulation on fallback
        setSimStatus("running");
        setActiveNode("start");
        addLog("Initializing LangGraph StateGraph thread session...", "info");
        timerRef.current = setTimeout(() => {
          runAdvisor();
        }, 1000);
      }, 1000);
    }
  };

  const runResearcher = () => {
    setActiveNode("researcher");
    addLog("Entering node 'market_researcher'...", "info");
    addLog("Querying Tavily search endpoints for competitive intelligence...");

    timerRef.current = setTimeout(() => {
      const data = presets[activePreset].researcher;
      addLog("Research analyst reports successfully compiled.", "success");
      setOutputBox({
        title: "Researcher output: MarketResearchReport",
        schema: "class MarketResearchReport(BaseModel)",
        content: data
      });

      timerRef.current = setTimeout(() => {
        runPm();
      }, 1500);
    }, 2000);
  };

  const runPm = () => {
    setActiveNode("pm");
    addLog("Entering node 'product_manager'...", "info");
    addLog("Querying Google Gemini (model: gemini-2.5-flash, temp: 0.2)...");

    timerRef.current = setTimeout(() => {
      const data = presets[activePreset].pm;
      addLog("Product requirements document generated.", "success");
      setOutputBox({
        title: "PM output: PRD",
        schema: "class PRD(BaseModel)",
        content: data
      });

      timerRef.current = setTimeout(() => {
        runParallel();
      }, 1500);
    }, 2000);
  };

  const runParallel = () => {
    setActiveNode("architect-marketing"); // parallel state
    addLog("Splitting thread into parallel execution streams: Engineering vs Growth...", "info");

    timerRef.current = setTimeout(() => {
      const dataArch = presets[activePreset].architect;
      addLog("System Architect completed database ERD designs.", "success");
      setOutputBox({
        title: "Architect output: ArchitectureSpec",
        schema: "class ArchitectureSpec(BaseModel)",
        content: dataArch
      });

      // Move architect stream to EM
      setActiveNode("em-marketing");
      addLog("Entering node 'engineering_manager'...", "info");

      timerRef.current = setTimeout(() => {
        const dataEm = presets[activePreset].em;
        addLog("EM compiled sprint backlog tasks. Initiating background issue creator sync...", "success");

        // CMO finishes next
        timerRef.current = setTimeout(() => {
          const dataMkt = presets[activePreset].marketing;
          addLog("CMO growth materials compiled successfully.", "success");
          setOutputBox({
            title: "CMO output: MarketingAssets",
            schema: "class MarketingAssets(BaseModel)",
            content: dataMkt
          });

          runJoin();
        }, 1000);
      }, 1500);
    }, 1500);
  };

  const runJoin = () => {
    setActiveNode("join");
    addLog("Synchronizing parallel streams at node 'join'...", "info");

    timerRef.current = setTimeout(() => {
      setActiveNode("end");
      setSimStatus("completed");
      addLog("Fan-in synchronization complete. Writing data states to Supabase...", "success");
      addLog("Compiling PDF exports. Process complete!", "success");

      setOutputBox({
        title: "Full Project compiled",
        schema: "All Stages Completed",
        content: "The pipeline run has successfully ended. Checkpoints are archived, artifacts are persistent in Supabase. You can download the VC report PDF or view the Notion Workspace board."
      });
    }, 1500);
  };

  const toggleFolder = (node: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [node]: !prev[node]
    }));
  };

  return (
    <div className="min-h-screen bg-base text-text-main font-mono selection:bg-accent selection:text-base antialiased pb-20 relative">
      {/* Styles for SVG Connections and Keyframes */}
      <style>{`
        :root {
          --complete: #2DA44E;
          --complete-muted: rgba(45, 164, 78, 0.08);
          --failed: #CF222E;
          --failed-muted: rgba(207, 34, 46, 0.08);
          --blue: #1e62d4;
          --blue-muted: rgba(30, 98, 212, 0.08);
        }
        .dark {
          --complete: #3FB950;
          --complete-muted: rgba(63, 185, 80, 0.08);
          --failed: #E5484D;
          --failed-muted: rgba(229, 72, 77, 0.08);
          --blue: #3b82f6;
          --blue-muted: rgba(59, 130, 246, 0.08);
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -18;
          }
        }
        .link-active-dash {
          stroke: #E8A33D !important;
          stroke-width: 2.5px !important;
          stroke-dasharray: 6 3;
          animation: dash 1s linear infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border-subtle bg-base/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="font-bold text-[13px] tracking-widest uppercase flex items-center gap-2 hover:text-accent transition-colors">
            <Dna className="w-5 h-5 text-accent" />
            BLUEPRINT <span className="font-light text-text-muted">ENGINE</span>
          </a>
          <div className="flex items-center gap-6 text-[10px] md:text-[11px] uppercase tracking-widest font-bold">
            <button onClick={() => scrollTo("simulator")} className="hover:text-accent transition-colors hidden sm:block">Simulator</button>
            <button onClick={() => scrollTo("whitepaper")} className="hover:text-accent transition-colors hidden sm:block">Whitepaper</button>
            <button onClick={() => scrollTo("explorer")} className="hover:text-accent transition-colors hidden sm:block">Codebase</button>
            <button onClick={() => scrollTo("qa")} className="hover:text-accent transition-colors hidden sm:block">Q&A</button>
            <Link href="/start" className="text-accent hover:underline underline-offset-4 decoration-2">Start Pipeline</Link>
            <CustomThemeToggler />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="min-h-screen flex items-center pt-24 px-6 relative overflow-hidden">
        <InteractiveGridBackground />
        
        {/* Subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 border border-border-subtle bg-panel/50 px-3 py-1.5 rounded text-[10px] uppercase tracking-widest font-bold text-accent mb-6">
              <Cpu className="w-4 h-4 animate-pulse" /> State-of-the-Art Multi-Agent Orchestrator
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight leading-[1.05] mb-6">
              🧬 Blueprint.ai<br />
              <span className="text-accent">Whitepaper & Sim</span>
            </h1>
            
            <p className="max-w-xl text-text-muted text-[13px] md:text-sm leading-relaxed mb-8 tracking-wide font-sans">
              An enterprise-grade, stateful multi-agent system built on Next.js 15, FastAPI, and LangGraph. Submit a startup thesis and coordinate six specialized AI agents to generate structured PRDs, database schemas, sprint backlogs, and landing copy in under 30 seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a
                href="#simulator"
                className="w-full sm:w-auto bg-accent text-base px-8 py-4 text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-accent/90 transition-all text-center border border-accent cursor-pointer flex items-center justify-center gap-2"
              >
                Launch Live Simulator <Play className="w-3.5 h-3.5 fill-current" />
              </a>
              <a
                href="#whitepaper"
                className="w-full sm:w-auto bg-panel border border-border-subtle text-text-main px-8 py-4 text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-border-subtle transition-all text-center cursor-pointer"
              >
                Read Whitepaper
              </a>
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:col-span-5 hidden lg:block border border-border-subtle bg-panel/30 p-6 rounded-lg backdrop-blur-sm relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-4">
              <span className="text-[10px] text-accent uppercase tracking-widest font-bold">Pipeline Specs</span>
              <span className="w-2.5 h-2.5 rounded-full bg-complete animate-ping"></span>
            </div>
            <div className="space-y-4 text-[11px] text-text-muted">
              <div>
                <strong className="text-text-main">LANGGRAPH THREADS:</strong> Managed state machines with SqliteSaver checkpoints supporting HITL pauses.
              </div>
              <div>
                <strong className="text-text-main">PULL MECHANICS:</strong> Client-side dynamic state polling optimized at 1.5s intervals.
              </div>
              <div>
                <strong className="text-text-main">SPLIT DATABASES:</strong> Local SQLite checkpointer for execution speeds + Supabase PG for persistent archives.
              </div>
              <div>
                <strong className="text-text-main">OAUTH EXCHANGE:</strong> Secure client-side tokens avoiding plaintext server storage.
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Simulator Section */}
      <section id="simulator" className="border-t border-border-subtle py-20 px-6 bg-panel/30">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-[10px] text-text-muted uppercase tracking-[0.2em]">Dynamic Playgrounds</span>
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-text-main mt-1">Interactive Pipeline Simulator</h2>
          </div>

          <div className="border border-border-subtle bg-panel rounded-lg overflow-hidden">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-border-subtle gap-4 bg-base/40">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-accent" />
                <span className="text-[11px] font-bold uppercase tracking-wider">StateGraph Run Environment</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                <label className="text-[10px] text-text-muted">Preset Startup Thesis:</label>
                <select
                  className="bg-base border border-border-subtle text-[11px] px-2 py-1.5 rounded focus:border-accent outline-none text-text-main"
                  value={activePreset}
                  onChange={handlePresetChange}
                  disabled={simStatus === "running"}
                >
                  <option value="logiflow">LogiFlow (AI Micro-Logistics) - Safe Path</option>
                  <option value="solargrid">SolarGrid (Decentralized Energy) - Medium Risk</option>
                  <option value="dropshipper">DropShipper (Low-Moat e-Commerce) - High Risk / Interrupt</option>
                </select>
                <button
                  onClick={startSim}
                  disabled={simStatus === "running" || simStatus === "paused"}
                  className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    simStatus === "running" || simStatus === "paused"
                      ? "bg-border-subtle text-text-muted cursor-not-allowed"
                      : "bg-accent text-base hover:bg-accent/90"
                  }`}
                >
                  Run Pipeline
                </button>
                <button
                  onClick={() => resetSim(activePreset)}
                  className="border border-border-subtle text-text-main px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-border-subtle transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left Column: Visual Graph Diagram */}
              <div className="border-r border-border-subtle p-6 flex flex-col justify-between min-h-[480px] bg-base/10 relative">
                <div className="flex justify-between items-center text-[10px] text-text-muted pb-4 border-b border-border-subtle/50 mb-4">
                  <span>LANGGRAPH WORKFLOW DIAGRAM</span>
                  <span className="uppercase font-bold text-accent">
                    {simStatus === "idle" && "Status: Idle"}
                    {simStatus === "running" && "Status: Running..."}
                    {simStatus === "paused" && "Status: Paused at Gate"}
                    {simStatus === "completed" && "Status: Completed"}
                  </span>
                </div>

                <div className="flex-grow flex items-center justify-center">
                  <svg className="w-full max-w-[500px] h-auto aspect-[4/3] select-none" viewBox="0 0 600 450">
                    <defs>
                      <marker id="sim-arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" className="fill-border-subtle" />
                      </marker>
                      <marker id="sim-arrow-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" className="fill-accent" />
                      </marker>
                      <marker id="sim-arrow-complete" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" className="fill-complete" />
                      </marker>
                    </defs>

                    {/* SVG Links */}
                    <path
                      id="s-link-start-advisor"
                      d="M 60 220 L 130 220"
                      className={`fill-none stroke-border-subtle stroke-[1.5px] transition-all duration-300 ${
                        activeNode === "start" ? "link-active-dash" : ""
                      } ${
                        ["advisor", "gate", "researcher", "pm", "architect-marketing", "em-marketing", "join", "end"].includes(activeNode) ? "stroke-complete" : ""
                      }`}
                      markerEnd={
                        activeNode === "start"
                          ? "url(#sim-arrow-active)"
                          : ["advisor", "gate", "researcher", "pm", "architect-marketing", "em-marketing", "join", "end"].includes(activeNode)
                          ? "url(#sim-arrow-complete)"
                          : "url(#sim-arrow)"
                      }
                    />
                    <path
                      id="s-link-advisor-gate"
                      d="M 130 220 L 210 220"
                      className={`fill-none stroke-border-subtle stroke-[1.5px] transition-all duration-300 ${
                        activeNode === "advisor" ? "link-active-dash" : ""
                      } ${
                        ["gate", "researcher", "pm", "architect-marketing", "em-marketing", "join", "end"].includes(activeNode) ? "stroke-complete" : ""
                      }`}
                      markerEnd={
                        activeNode === "advisor"
                          ? "url(#sim-arrow-active)"
                          : ["gate", "researcher", "pm", "architect-marketing", "em-marketing", "join", "end"].includes(activeNode)
                          ? "url(#sim-arrow-complete)"
                          : "url(#sim-arrow)"
                      }
                    />
                    <path
                      id="s-link-gate-researcher"
                      d="M 210 220 L 290 220"
                      className={`fill-none stroke-border-subtle stroke-[1.5px] transition-all duration-300 ${
                        activeNode === "gate" && simStatus === "running" ? "link-active-dash" : ""
                      } ${
                        ["researcher", "pm", "architect-marketing", "em-marketing", "join", "end"].includes(activeNode) ? "stroke-complete" : ""
                      }`}
                      markerEnd={
                        activeNode === "gate" && simStatus === "running"
                          ? "url(#sim-arrow-active)"
                          : ["researcher", "pm", "architect-marketing", "em-marketing", "join", "end"].includes(activeNode)
                          ? "url(#sim-arrow-complete)"
                          : "url(#sim-arrow)"
                      }
                    />
                    <path
                      id="s-link-researcher-pm"
                      d="M 290 220 L 370 220"
                      className={`fill-none stroke-border-subtle stroke-[1.5px] transition-all duration-300 ${
                        activeNode === "researcher" ? "link-active-dash" : ""
                      } ${
                        ["pm", "architect-marketing", "em-marketing", "join", "end"].includes(activeNode) ? "stroke-complete" : ""
                      }`}
                      markerEnd={
                        activeNode === "researcher"
                          ? "url(#sim-arrow-active)"
                          : ["pm", "architect-marketing", "em-marketing", "join", "end"].includes(activeNode)
                          ? "url(#sim-arrow-complete)"
                          : "url(#sim-arrow)"
                      }
                    />

                    {/* Splits */}
                    <path
                      id="s-link-pm-architect"
                      d="M 370 220 C 390 170, 410 120, 450 120"
                      className={`fill-none stroke-border-subtle stroke-[1.5px] transition-all duration-300 ${
                        activeNode === "pm" ? "link-active-dash" : ""
                      } ${
                        ["architect-marketing", "em-marketing", "join", "end"].includes(activeNode) ? "stroke-complete" : ""
                      }`}
                      markerEnd={
                        activeNode === "pm"
                          ? "url(#sim-arrow-active)"
                          : ["architect-marketing", "em-marketing", "join", "end"].includes(activeNode)
                          ? "url(#sim-arrow-complete)"
                          : "url(#sim-arrow)"
                      }
                    />
                    <path
                      id="s-link-pm-marketing"
                      d="M 370 220 C 390 270, 410 320, 450 320"
                      className={`fill-none stroke-border-subtle stroke-[1.5px] transition-all duration-300 ${
                        activeNode === "pm" ? "link-active-dash" : ""
                      } ${
                        ["architect-marketing", "em-marketing", "join", "end"].includes(activeNode) ? "stroke-complete" : ""
                      }`}
                      markerEnd={
                        activeNode === "pm"
                          ? "url(#sim-arrow-active)"
                          : ["architect-marketing", "em-marketing", "join", "end"].includes(activeNode)
                          ? "url(#sim-arrow-complete)"
                          : "url(#sim-arrow)"
                      }
                    />

                    {/* Architect to EM */}
                    <path
                      id="s-link-architect-em"
                      d="M 450 120 L 510 120"
                      className={`fill-none stroke-border-subtle stroke-[1.5px] transition-all duration-300 ${
                        activeNode === "architect-marketing" ? "link-active-dash" : ""
                      } ${
                        ["em-marketing", "join", "end"].includes(activeNode) ? "stroke-complete" : ""
                      }`}
                      markerEnd={
                        activeNode === "architect-marketing"
                          ? "url(#sim-arrow-active)"
                          : ["em-marketing", "join", "end"].includes(activeNode)
                          ? "url(#sim-arrow-complete)"
                          : "url(#sim-arrow)"
                      }
                    />

                    {/* Join paths */}
                    <path
                      id="s-link-em-join"
                      d="M 510 120 C 530 140, 530 200, 535 220"
                      className={`fill-none stroke-border-subtle stroke-[1.5px] transition-all duration-300 ${
                        activeNode === "em-marketing" ? "link-active-dash" : ""
                      } ${
                        ["join", "end"].includes(activeNode) ? "stroke-complete" : ""
                      }`}
                      markerEnd={
                        activeNode === "em-marketing"
                          ? "url(#sim-arrow-active)"
                          : ["join", "end"].includes(activeNode)
                          ? "url(#sim-arrow-complete)"
                          : "url(#sim-arrow)"
                      }
                    />
                    <path
                      id="s-link-marketing-join"
                      d="M 450 320 C 510 320, 530 280, 535 220"
                      className={`fill-none stroke-border-subtle stroke-[1.5px] transition-all duration-300 ${
                        ["architect-marketing", "em-marketing"].includes(activeNode) ? "link-active-dash" : ""
                      } ${
                        ["join", "end"].includes(activeNode) ? "stroke-complete" : ""
                      }`}
                      markerEnd={
                        ["architect-marketing", "em-marketing"].includes(activeNode)
                          ? "url(#sim-arrow-active)"
                          : ["join", "end"].includes(activeNode)
                          ? "url(#sim-arrow-complete)"
                          : "url(#sim-arrow)"
                      }
                    />

                    {/* Join to End */}
                    <path
                      id="s-link-join-end"
                      d="M 535 220 L 580 220"
                      className={`fill-none stroke-border-subtle stroke-[1.5px] transition-all duration-300 ${
                        activeNode === "join" ? "link-active-dash" : ""
                      } ${
                        ["end"].includes(activeNode) ? "stroke-complete" : ""
                      }`}
                      markerEnd={
                        activeNode === "join"
                          ? "url(#sim-arrow-active)"
                          : ["end"].includes(activeNode)
                          ? "url(#sim-arrow-complete)"
                          : "url(#sim-arrow)"
                      }
                    />

                    {/* Nodes Elements */}
                    <g
                      className={`cursor-pointer group transition-all duration-300 ${
                        activeNode === "start" ? "active" : ""
                      } ${
                        ["advisor", "gate", "researcher", "pm", "architect-marketing", "em-marketing", "join", "end"].includes(activeNode)
                          ? "complete"
                          : ""
                      }`}
                      transform="translate(60, 220)"
                    >
                      <circle r="16" className="fill-panel stroke-border-subtle stroke-2 transition-all duration-300 group-[.active]:stroke-accent group-[.active]:fill-accent/10 group-[.active]:stroke-[3px] group-[.complete]:stroke-complete group-[.complete]:fill-complete/10" />
                      <text y="3" className="text-[9px] font-bold fill-text-muted group-[.active]:fill-accent group-[.complete]:fill-complete font-mono text-center select-none pointer-events-none">START</text>
                    </g>

                    <g
                      className={`cursor-pointer group transition-all duration-300 ${
                        activeNode === "advisor" ? "active" : ""
                      } ${
                        ["gate", "researcher", "pm", "architect-marketing", "em-marketing", "join", "end"].includes(activeNode)
                          ? "complete"
                          : activePreset === "dropshipper" && activeNode !== "start" && activeNode !== "idle"
                          ? "failed"
                          : ""
                      }`}
                      transform="translate(130, 220)"
                    >
                      <circle r="20" className="fill-panel stroke-border-subtle stroke-2 transition-all duration-300 group-[.active]:stroke-accent group-[.active]:fill-accent/10 group-[.active]:stroke-[3px] group-[.complete]:stroke-complete group-[.complete]:fill-complete/10 group-[.failed]:stroke-failed group-[.failed]:fill-failed/10 group-[.failed]:stroke-[3px]" />
                      <text y="3" className="text-[9px] font-bold fill-text-muted group-[.active]:fill-accent group-[.complete]:fill-complete group-[.failed]:fill-failed font-mono text-center select-none pointer-events-none">ADV</text>
                    </g>

                    {/* Gate Node */}
                    <g
                      className={`cursor-pointer group transition-all duration-300 ${
                        activeNode === "gate" && simStatus === "running" ? "active" : ""
                      } ${
                        activeNode === "gate" && simStatus === "paused" ? "failed" : ""
                      } ${
                        ["researcher", "pm", "architect-marketing", "em-marketing", "join", "end"].includes(activeNode)
                          ? "complete"
                          : ""
                      }`}
                      transform="translate(210, 220)"
                    >
                      <circle r="20" className="fill-panel stroke-border-subtle stroke-2 transition-all duration-300 group-[.active]:stroke-accent group-[.active]:fill-accent/10 group-[.active]:stroke-[3px] group-[.complete]:stroke-complete group-[.complete]:fill-complete/10 group-[.failed]:stroke-failed group-[.failed]:fill-failed/10 group-[.failed]:stroke-[3px]" />
                      <text y="3" className="text-[9px] font-bold fill-text-muted group-[.active]:fill-accent group-[.complete]:fill-complete group-[.failed]:fill-failed font-mono text-center select-none pointer-events-none">GATE</text>
                    </g>

                    <g
                      className={`cursor-pointer group transition-all duration-300 ${
                        activeNode === "researcher" ? "active" : ""
                      } ${
                        ["pm", "architect-marketing", "em-marketing", "join", "end"].includes(activeNode) ? "complete" : ""
                      }`}
                      transform="translate(290, 220)"
                    >
                      <circle r="20" className="fill-panel stroke-border-subtle stroke-2 transition-all duration-300 group-[.active]:stroke-accent group-[.active]:fill-accent/10 group-[.active]:stroke-[3px] group-[.complete]:stroke-complete group-[.complete]:fill-complete/10" />
                      <text y="3" className="text-[9px] font-bold fill-text-muted group-[.active]:fill-accent group-[.complete]:fill-complete font-mono text-center select-none pointer-events-none">RES</text>
                    </g>

                    <g
                      className={`cursor-pointer group transition-all duration-300 ${
                        activeNode === "pm" ? "active" : ""
                      } ${
                        ["architect-marketing", "em-marketing", "join", "end"].includes(activeNode) ? "complete" : ""
                      }`}
                      transform="translate(370, 220)"
                    >
                      <circle r="20" className="fill-panel stroke-border-subtle stroke-2 transition-all duration-300 group-[.active]:stroke-accent group-[.active]:fill-accent/10 group-[.active]:stroke-[3px] group-[.complete]:stroke-complete group-[.complete]:fill-complete/10" />
                      <text y="3" className="text-[9px] font-bold fill-text-muted group-[.active]:fill-accent group-[.complete]:fill-complete font-mono text-center select-none pointer-events-none">PM</text>
                    </g>

                    {/* Architect Node (ARCH) */}
                    <g
                      className={`cursor-pointer group transition-all duration-300 ${
                        activeNode === "architect-marketing" ? "active" : ""
                      } ${
                        ["em-marketing", "join", "end"].includes(activeNode) ? "complete" : ""
                      }`}
                      transform="translate(450, 120)"
                    >
                      <circle r="20" className="fill-panel stroke-border-subtle stroke-2 transition-all duration-300 group-[.active]:stroke-accent group-[.active]:fill-accent/10 group-[.active]:stroke-[3px] group-[.complete]:stroke-complete group-[.complete]:fill-complete/10" />
                      <text y="3" className="text-[9px] font-bold fill-text-muted group-[.active]:fill-accent group-[.complete]:fill-complete font-mono text-center select-none pointer-events-none">ARCH</text>
                    </g>

                    {/* Engineering Manager Node (EM) */}
                    <g
                      className={`cursor-pointer group transition-all duration-300 ${
                        activeNode === "em-marketing" ? "active" : ""
                      } ${
                        ["join", "end"].includes(activeNode) ? "complete" : ""
                      }`}
                      transform="translate(510, 120)"
                    >
                      <circle r="20" className="fill-panel stroke-border-subtle stroke-2 transition-all duration-300 group-[.active]:stroke-accent group-[.active]:fill-accent/10 group-[.active]:stroke-[3px] group-[.complete]:stroke-complete group-[.complete]:fill-complete/10" />
                      <text y="3" className="text-[9px] font-bold fill-text-muted group-[.active]:fill-accent group-[.complete]:fill-complete font-mono text-center select-none pointer-events-none">EM</text>
                    </g>

                    {/* Marketing Node (MKT) */}
                    <g
                      className={`cursor-pointer group transition-all duration-300 ${
                        ["architect-marketing", "em-marketing"].includes(activeNode) ? "active" : ""
                      } ${
                        ["join", "end"].includes(activeNode) ? "complete" : ""
                      }`}
                      transform="translate(450, 320)"
                    >
                      <circle r="20" className="fill-panel stroke-border-subtle stroke-2 transition-all duration-300 group-[.active]:stroke-accent group-[.active]:fill-accent/10 group-[.active]:stroke-[3px] group-[.complete]:stroke-complete group-[.complete]:fill-complete/10" />
                      <text y="3" className="text-[9px] font-bold fill-text-muted group-[.active]:fill-accent group-[.complete]:fill-complete font-mono text-center select-none pointer-events-none">MKT</text>
                    </g>

                    {/* Join Node (JOIN) */}
                    <g
                      className={`cursor-pointer group transition-all duration-300 ${
                        activeNode === "join" ? "active" : ""
                      } ${
                        activeNode === "end" ? "complete" : ""
                      }`}
                      transform="translate(535, 220)"
                    >
                      <circle r="16" className="fill-panel stroke-border-subtle stroke-2 transition-all duration-300 group-[.active]:stroke-accent group-[.active]:fill-accent/10 group-[.active]:stroke-[3px] group-[.complete]:stroke-complete group-[.complete]:fill-complete/10" />
                      <text y="3" className="text-[9px] font-bold fill-text-muted group-[.active]:fill-accent group-[.complete]:fill-complete font-mono text-center select-none pointer-events-none">JOIN</text>
                    </g>

                    {/* End Node */}
                    <g
                      className={`cursor-pointer group transition-all duration-300 ${
                        activeNode === "end" ? "complete" : ""
                      }`}
                      transform="translate(580, 220)"
                    >
                      <circle r="10" className="fill-panel stroke-border-subtle stroke-2 transition-all duration-300 group-[.complete]:stroke-complete group-[.complete]:fill-complete/10" />
                    </g>
                  </svg>
                </div>
              </div>

              {/* Right Column: Execution Console & Dynamic Output */}
              <div className="p-6 flex flex-col justify-between min-h-[480px] bg-panel/30 relative">
                {/* Console Logs Wrapper */}
                <div className="flex-grow flex flex-col justify-between mb-4">
                  <div className="flex justify-between items-center text-[10px] text-text-muted pb-3 border-b border-border-subtle/50 mb-3">
                    <span>EXECUTION LOGS</span>
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                  </div>
                  
                  {/* Log Ticker */}
                  <div className="h-[150px] overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2 border border-border-subtle bg-base/50 p-3 rounded">
                    {logs.map((log, i) => (
                      <div key={i} className={`
                        ${log.type === "info" ? "text-blue-500 dark:text-blue-400" : ""}
                        ${log.type === "success" ? "text-complete" : ""}
                        ${log.type === "warn" ? "text-failed font-bold" : "text-text-muted"}
                      `}>
                        {log.time && <span className="text-text-muted/50 mr-1.5">[{log.time}]</span>}
                        {log.text}
                      </div>
                    ))}
                    <div ref={consoleEndRef} />
                  </div>
                </div>

                {/* Output Panel */}
                <div className="flex-grow flex flex-col">
                  <div className="flex justify-between items-center text-[10px] text-text-muted pb-3 border-b border-border-subtle/50 mb-3">
                    <span>{outputBox.title}</span>
                    <span className="text-accent font-mono text-[9px]">{outputBox.schema}</span>
                  </div>

                  <div className="flex-grow border border-border-subtle bg-base/50 p-4 rounded min-h-[160px] max-h-[220px] overflow-y-auto text-[11px] text-text-muted select-text">
                    {typeof outputBox.content === "object" ? (
                      <pre className="text-complete whitespace-pre-wrap font-mono leading-relaxed">
                        {JSON.stringify(outputBox.content, null, 2)}
                      </pre>
                    ) : (
                      <div className="whitespace-pre-wrap leading-relaxed">{outputBox.content}</div>
                    )}
                  </div>
                </div>

                {/* Interrupt Overlay Card */}
                <AnimatePresence>
                  {showInterrupt && (
                    <motion.div
                      className="absolute inset-x-6 bottom-6 border border-failed bg-panel/95 rounded p-5 backdrop-blur-md z-20 flex flex-col justify-between shadow-2xl"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <div className="flex items-center gap-2 text-failed font-bold text-[12px] uppercase tracking-wide mb-2">
                        <AlertOctagon className="w-5 h-5 text-failed" />
                        RISK GATE INTERRUPT TRIGGERED
                      </div>
                      <p className="text-[11px] text-text-muted leading-relaxed mb-4">
                        The Startup Advisor flagged a high risk_score ({presets[activePreset].advisor.risk_score}). The execution thread has paused at the gate. Select an action to resume the thread.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => resumeSim("continue")}
                          className="bg-failed text-white hover:bg-failed/95 text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded transition-colors"
                        >
                          Force Approve (Continue)
                        </button>
                        <button
                          onClick={() => resumeSim("revise")}
                          className="bg-base border border-border-subtle text-text-main hover:bg-border-subtle text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded transition-colors"
                        >
                          Revise Idea (Reset to Advisor)
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Whitepaper deep dive Section */}
      <section id="whitepaper" className="border-t border-border-subtle py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-[10px] text-text-muted uppercase tracking-[0.2em]">Deep Dive Documentation</span>
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-text-main mt-1">Technical Whitepaper</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-4 border border-border-subtle bg-panel rounded-lg p-5 h-fit lg:sticky lg:top-24">
              <h3 className="text-[11px] text-accent uppercase tracking-widest font-bold pb-3 border-b border-border-subtle mb-4">Whitepaper Index</h3>
              <ul className="space-y-2 text-[12px]">
                {[
                  { id: "sec-stack", name: "Architecture Stack", icon: Layers },
                  { id: "sec-mechanics", name: "State Mechanics", icon: GitBranch },
                  { id: "sec-agents", name: "The 6 Agents", icon: Users },
                  { id: "sec-database", name: "Split Databases", icon: Database },
                  { id: "sec-oauth", name: "Security & OAuth", icon: ShieldCheck }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left uppercase tracking-wider text-[10px] font-bold ${
                          activeSection === item.id
                            ? "bg-accent/10 text-accent border border-accent/20"
                            : "text-text-muted hover:text-text-main hover:bg-border-subtle/30 border border-transparent"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Content Display Panel */}
            <div className="lg:col-span-8 border border-border-subtle bg-panel rounded-lg p-6 md:p-8 min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeSection === "sec-stack" && (
                  <motion.div
                    key="sec-stack"
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3 className="text-[14px] font-bold uppercase tracking-widest text-text-main border-b border-border-subtle pb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-accent" /> 1. System Architecture & Tech Stack Rationale
                    </h3>
                    <p className="text-[12px] text-text-muted leading-relaxed">
                      Blueprint is structured as a decoupled web application with separated responsibilities:
                    </p>
                    
                    <div>
                      <span className="inline-block bg-accent/10 border border-accent/20 text-accent text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2">Frontend</span>
                      <strong className="block text-[12px] text-text-main mb-1">Next.js 15 (App Router), Tailwind CSS, Framer Motion, React Flow</strong>
                      <p className="text-[11px] text-text-muted leading-relaxed font-sans">
                        Next.js handles Server-Side Rendering (SSR) and client routes out of the box. Framer Motion provides premium animations (auto-advancing tabs, hover reveals). React Flow renders an interactive, pan-and-zoomable database ERD diagram from raw AI text by parsing the Mermaid schema.
                      </p>
                    </div>

                    <div>
                      <span className="inline-block bg-accent/10 border border-accent/20 text-accent text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2">Backend</span>
                      <strong className="block text-[12px] text-text-main mb-1">FastAPI, Pydantic V2, Uvicorn</strong>
                      <p className="text-[11px] text-text-muted leading-relaxed font-sans">
                        FastAPI is asynchronous by default, allowing it to handle hundreds of concurrent status-polling requests without blocking the event loop. Pydantic V2 enforces strict type checks, ensuring the AI outputs always align with the expected JSON structure.
                      </p>
                    </div>

                    <div>
                      <span className="inline-block bg-accent/10 border border-accent/20 text-accent text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2">Orchestration</span>
                      <strong className="block text-[12px] text-text-main mb-1">LangGraph</strong>
                      <p className="text-[11px] text-text-muted leading-relaxed font-sans">
                        Instead of simple linear prompt chains, LangGraph models the workflow as a state machine. This enables parallel branching (Architect and Marketing run simultaneously) and Human-in-the-Loop (HITL) interrupts (pausing execution for user approval).
                      </p>
                    </div>

                    <div>
                      <span className="inline-block bg-accent/10 border border-accent/20 text-accent text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2">LLM Hardware</span>
                      <strong className="block text-[12px] text-text-main mb-1">Groq Llama 3.3 70B (LPU Inference)</strong>
                      <p className="text-[11px] text-text-muted leading-relaxed font-sans">
                        Groq leverages specialized LPU (Language Processing Unit) hardware, yielding near-zero latency. It executes the entire 6-agent pipeline in under 30 seconds for free, whereas standard providers would take minutes and incur high transaction costs.
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeSection === "sec-mechanics" && (
                  <motion.div
                    key="sec-mechanics"
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3 className="text-[14px] font-bold uppercase tracking-widest text-text-main border-b border-border-subtle pb-3 flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-accent" /> 2. Deep Dive: LangGraph & State Mechanics
                    </h3>
                    <p className="text-[12px] text-text-muted leading-relaxed font-sans">
                      LangGraph coordinates state using a centralized state dictionary (<code>GraphState</code>). Unlike standard sequential wrappers, it uses strict merge operators and checkpointers to manage threads.
                    </p>

                    <div>
                      <h4 className="text-[12px] font-bold text-text-main mb-2">A. GraphState Reducers</h4>
                      <p className="text-[11px] text-text-muted leading-relaxed mb-3 font-sans">
                        When the graph branches into parallel paths (Growth Stream and Engineering Stream), multiple nodes try to update the state at the same time. We use Pydantic annotations with reducer functions:
                      </p>
                      <pre className="bg-base border border-border-subtle p-3 rounded text-[10px] leading-relaxed text-text-main overflow-x-auto">
{`def reduce_dict(left: Optional[Dict[str, Any]], right: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    merged = dict(left or {})
    merged.update(right or {})
    return merged

class GraphState(BaseModel):
    stages: Annotated[Dict[str, Any], reduce_dict] = Field(default_factory=dict)`}
                      </pre>
                      <p className="text-[11px] text-text-muted leading-relaxed mt-2 font-sans">
                        This tells LangGraph that instead of overwriting the <code>stages</code> variable when parallel threads update it, it must pass the old dict (left) and the new dict (right) to <code>reduce_dict</code> to merge them safely.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[12px] font-bold text-text-main mb-2">B. The Human-in-the-Loop Interrupt Flow</h4>
                      <p className="text-[11px] text-text-muted leading-relaxed mb-3 font-sans">
                        If the Startup Advisor flags a risky idea (risk_score &gt; 0.85), it calls LangGraph&apos;s <code>interrupt()</code> function.
                      </p>
                      <ol className="list-decimal pl-5 space-y-2 text-[11px] text-text-muted font-sans">
                        <li>The call raises a <code>GraphInterrupt</code> exception.</li>
                        <li>LangGraph halts the thread and writes the current variables and program counter to <code>checkpoints.db</code>.</li>
                        <li>The FastAPI thread terminates, returning <code>awaiting_gate</code> status.</li>
                        <li>The user clicks &quot;Force Approve&quot;. The frontend calls <code>POST /sessions/{"{id}"}/gate-decision</code>.</li>
                        <li>The backend loads the state from SQLite, issues <code>Command(resume={"{"}decision: continue{"}"})</code>, and LangGraph resumes execution from the exact line where it paused.</li>
                      </ol>
                    </div>
                  </motion.div>
                )}

                {activeSection === "sec-agents" && (
                  <motion.div
                    key="sec-agents"
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3 className="text-[14px] font-bold uppercase tracking-widest text-text-main border-b border-border-subtle pb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent" /> 3. The 6 Agents & Output Contracts
                    </h3>
                    <p className="text-[12px] text-text-muted leading-relaxed font-sans">
                      Each agent is guided by a McKinsey/VC-caliber system prompt, and outputs are strictly validated by Pydantic contracts.
                    </p>

                    <div className="space-y-4">
                      {[
                        { index: 1, name: "Startup Advisor", model: "Llama 3.3 70B @ Groq", desc: "Founder-Market Fit, Market Timing, Unit Economics, Competitive Moat, Single Point of Death.", contract: "ValidationResult (verdict: str, risk_score: float, reasoning: str, red_flags: list)" },
                        { index: 2, name: "Market Researcher", model: "Llama 3.3 70B @ Groq + Tavily API", desc: "Queries Tavily for competitor details and McKinsey TAM/SAM/SOM statistics.", contract: "MarketResearchReport (tam_estimate: str, competitors: list[Competitor], trends: list[str], SWOT, gaps)" },
                        { index: 3, name: "Product Manager", model: "Gemini 2.5 Flash @ Google", desc: "Synthesizes concept logs. Uses MoSCoW prioritization and writes Jobs-to-be-Done (JTBD) user stories.", contract: "PRD (problem_statement: str, goals: list, features: list[Feature], user_stories: list, roadmap: list)" },
                        { index: 4, name: "System Architect", model: "Llama 3.1 Nemotron 70B @ NVIDIA NIM", desc: "Generates PostgreSQL syntax and valid Mermaid.js diagrams, declaring scale ceilings.", contract: "ArchitectureSpec (db_schema_sql: str, db_schema_mermaid: str, api_endpoints: list, design_notes: str)" },
                        { index: 5, name: "Engineering Manager", model: "Llama 3.3 70B @ Groq + GitHub API", desc: "Creates 4 dependency-ordered sprints using Fibonacci story points, and auto-syncs issues to GitHub in background threads.", contract: "IssuesAndSprintPlan (issues: list[GitHubIssue], sprints: list, definition_of_done: list, risks: list)" },
                        { index: 6, name: "Marketing Specialist", model: "Llama 3.3 70B @ Groq", desc: "Applies the PAS (Problem-Agitate-Solve) copy framework, outlines a 5-step email drip campaign, and sets up tier packages.", contract: "MarketingAssets (landing_copy: str, linkedin_post: str, pricing_tiers: list, email_sequence: list)" }
                      ].map((agent) => (
                        <div key={agent.index} className="border border-border-subtle/50 p-4 rounded bg-base/20 hover:border-accent/20 transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                            <span className="text-[11px] font-bold text-text-main">{agent.index}. {agent.name}</span>
                            <span className="text-[9px] bg-accent/10 border border-accent/20 text-accent font-bold px-1.5 py-0.5 rounded w-fit">{agent.model}</span>
                          </div>
                          <p className="text-[11px] text-text-muted mb-2 font-sans">{agent.desc}</p>
                          <div className="bg-base/60 p-2 rounded text-[10px] font-mono border border-border-subtle/30 text-complete">
                            <strong className="text-text-muted/80">Schema:</strong> {agent.contract}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeSection === "sec-database" && (
                  <motion.div
                    key="sec-database"
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3 className="text-[14px] font-bold uppercase tracking-widest text-text-main border-b border-border-subtle pb-3 flex items-center gap-2">
                      <Database className="w-4 h-4 text-accent" /> 4. Split-Database Architecture
                    </h3>
                    <p className="text-[12px] text-text-muted leading-relaxed font-sans">
                      To balance high-frequency execution checkpoints with permanent data resilience, Blueprint operates a split-database architecture.
                    </p>

                    <div className="grid grid-cols-1 gap-4 mt-4">
                      <div className="border border-failed/30 p-4 rounded bg-failed/5">
                        <h4 className="text-failed font-bold text-[12px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Database className="w-4 h-4" /> SHORT-TERM: SQLite (LangGraph Checkpointer)
                        </h4>
                        <p className="text-[11px] text-text-muted leading-relaxed font-sans">
                          LangGraph needs to log the step-by-step state of execution threads (to support pauses/resumes). This is written to <code>checkpoints.db</code>. Since this database is file-based and local, if the hosting server restarts, it is wiped.
                        </p>
                      </div>

                      <div className="border border-complete/30 p-4 rounded bg-complete/5">
                        <h4 className="text-complete font-bold text-[12px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> LONG-TERM: Supabase PostgreSQL (Permanent Artifacts)
                        </h4>
                        <p className="text-[11px] text-text-muted leading-relaxed font-sans mb-2 font-sans">
                          To ensure that final results and history survive server restarts, all validated artifacts and logging statements are pushed permanently to Supabase.
                        </p>
                        <p className="text-[11px] text-text-muted leading-relaxed font-sans">
                          <strong>SQLite Fallback:</strong> If Supabase credentials are missing or the connection fails, the system automatically falls back to local tables in <code>founder_os.db</code>, guaranteeing service uptime.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === "sec-oauth" && (
                  <motion.div
                    key="sec-oauth"
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3 className="text-[14px] font-bold uppercase tracking-widest text-text-main border-b border-border-subtle pb-3 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-accent" /> 5. Secure OAuth Exchange & Integrations
                    </h3>
                    <p className="text-[12px] text-text-muted leading-relaxed font-sans">
                      Blueprint does not save user API keys on the server. Instead, it utilizes secure OAuth 2.0 flows to interact directly with the user&apos;s accounts.
                    </p>

                    <div className="space-y-6 font-sans">
                      <div className="border-l-2 border-accent pl-4">
                        <h4 className="text-[12px] font-bold text-text-main mb-1.5">The GitHub Exchange Sequence</h4>
                        <ol className="list-decimal pl-4 space-y-1 text-[11px] text-text-muted">
                          <li>The user clicks &quot;Connect GitHub&quot;. The frontend redirects to GitHub&apos;s authorization page.</li>
                          <li>GitHub redirects back with a temporary <code>?code=...</code> value.</li>
                          <li>Next.js forwards this code to FastAPI, which exchanges it with <code>GITHUB_CLIENT_SECRET</code> for a secure <code>access_token</code>.</li>
                          <li>The token is stored locally in the browser&apos;s <code>localStorage</code>. It is sent as a payload header in execution requests and is never saved in the database.</li>
                        </ol>
                      </div>

                      <div className="border-l-2 border-accent pl-4">
                        <h4 className="text-[12px] font-bold text-text-main mb-1.5">Notion Block Parsing Complexity</h4>
                        <p className="text-[11px] text-text-muted leading-relaxed">
                          Notion&apos;s API does not support standard HTML or Markdown streams. In <code>notion.py</code>, we parse agent artifacts into structured Notion blocks (e.g. <code>bulleted_list_item</code>, <code>quote</code>). 
                          Because Notion limits append operations to 100 blocks per request, our backend automatically splits compiled blocks into batches of 80 before making sequential PATCH requests, avoiding API rate limits.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Codebase File tree explorer section */}
      <section id="explorer" className="border-t border-border-subtle py-20 px-6 bg-panel/30">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-[10px] text-text-muted uppercase tracking-[0.2em]">File System</span>
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-text-main mt-1">Project Directory Structure</h2>
          </div>

          <div className="border border-border-subtle bg-panel rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[450px]">
            {/* Tree View (Left Column) */}
            <div className="lg:col-span-5 border-r border-border-subtle p-5 bg-base/10 max-h-[500px] overflow-y-auto">
              <div className="text-[10px] text-text-muted uppercase tracking-widest pb-3 border-b border-border-subtle/50 mb-4 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-accent" /> File Explorer
              </div>

              <div className="space-y-1 text-[12px] select-none">
                {/* root/ */}
                <div>
                  <button
                    onClick={() => toggleFolder("root")}
                    className="flex items-center gap-2 hover:text-accent font-bold py-1 w-full text-left"
                  >
                    {expandedNodes.root ? <FolderOpen className="w-4 h-4 text-accent" /> : <Folder className="w-4 h-4 text-accent" />}
                    root/
                  </button>

                  {expandedNodes.root && (
                    <div className="pl-4 border-l border-border-subtle/50 ml-2 space-y-1">
                      {/* backend/ */}
                      <div>
                        <button
                          onClick={() => toggleFolder("backend")}
                          className="flex items-center gap-2 hover:text-accent font-bold py-1 w-full text-left"
                        >
                          {expandedNodes.backend ? <FolderOpen className="w-4 h-4 text-accent" /> : <Folder className="w-4 h-4 text-accent" />}
                          backend/
                        </button>

                        {expandedNodes.backend && (
                          <div className="pl-4 border-l border-border-subtle/50 ml-2 space-y-1">
                            {[
                              { key: "b-main", name: "main.py" },
                              { key: "b-graph", name: "graph.py" },
                              { key: "b-models", name: "models.py" },
                              { key: "b-db", name: "db.py" },
                              { key: "b-config", name: "config.py" }
                            ].map((f) => (
                              <button
                                key={f.key}
                                onClick={() => setActiveFileKey(f.key)}
                                className={`flex items-center gap-2 w-full text-left py-1 px-2 rounded ${
                                  activeFileKey === f.key ? "bg-accent/10 text-accent font-bold" : "text-text-muted hover:text-text-main"
                                }`}
                              >
                                <FileText className="w-3.5 h-3.5" />
                                {f.name}
                              </button>
                            ))}

                            {/* tools/ */}
                            <div>
                              <button
                                onClick={() => toggleFolder("tools")}
                                className="flex items-center gap-2 hover:text-accent font-bold py-1 w-full text-left"
                              >
                                {expandedNodes.tools ? <FolderOpen className="w-4 h-4 text-accent" /> : <Folder className="w-4 h-4 text-accent" />}
                                tools/
                              </button>

                              {expandedNodes.tools && (
                                <div className="pl-4 border-l border-border-subtle/50 ml-2 space-y-1">
                                  {[
                                    { key: "t-tavily", name: "tavily.py" },
                                    { key: "t-github", name: "github.py" },
                                    { key: "t-notion", name: "notion.py" },
                                    { key: "t-pdf", name: "pdf_export.py" }
                                  ].map((f) => (
                                    <button
                                      key={f.key}
                                      onClick={() => setActiveFileKey(f.key)}
                                      className={`flex items-center gap-2 w-full text-left py-1 px-2 rounded ${
                                        activeFileKey === f.key ? "bg-accent/10 text-accent font-bold" : "text-text-muted hover:text-text-main"
                                      }`}
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      {f.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* frontend/ */}
                      <div>
                        <button
                          onClick={() => toggleFolder("frontend")}
                          className="flex items-center gap-2 hover:text-accent font-bold py-1 w-full text-left"
                        >
                          {expandedNodes.frontend ? <FolderOpen className="w-4 h-4 text-accent" /> : <Folder className="w-4 h-4 text-accent" />}
                          frontend/
                        </button>

                        {expandedNodes.frontend && (
                          <div className="pl-4 border-l border-border-subtle/50 ml-2 space-y-1">
                            {[
                              { key: "f-css", name: "globals.css" },
                              { key: "f-layout", name: "layout.tsx" },
                              { key: "f-page", name: "page.tsx" }
                            ].map((f) => (
                              <button
                                key={f.key}
                                onClick={() => setActiveFileKey(f.key)}
                                className={`flex items-center gap-2 w-full text-left py-1 px-2 rounded ${
                                  activeFileKey === f.key ? "bg-accent/10 text-accent font-bold" : "text-text-muted hover:text-text-main"
                                }`}
                              >
                                <FileText className="w-3.5 h-3.5" />
                                {f.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* File Details (Right Column) */}
            <div className="lg:col-span-7 p-6 bg-panel min-h-[300px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {activeFileKey && files[activeFileKey] ? (
                  <motion.div
                    key={activeFileKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    <div>
                      <h3 className="text-[13px] font-bold text-text-main tracking-widest uppercase">{files[activeFileKey].name}</h3>
                      <span className="text-[10px] text-accent/80 font-mono">{files[activeFileKey].path}</span>
                    </div>

                    <div className="space-y-1.5 font-sans">
                      <h4 className="text-[10px] text-text-muted uppercase tracking-wider font-bold flex items-center gap-1">
                        <Info className="w-3 h-3 text-accent" /> Responsibility
                      </h4>
                      <p className="text-[12px] text-text-muted leading-relaxed font-sans">{files[activeFileKey].desc}</p>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-[10px] text-text-muted uppercase tracking-wider font-bold flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-accent" /> Exports & Hooks
                      </h4>
                      <pre className="bg-[#0B0F14] border border-border-subtle p-3 rounded text-[10px] leading-relaxed text-[#E2E8F0] overflow-x-auto max-h-[160px] font-mono">
                        {files[activeFileKey].exports}
                      </pre>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center space-y-2">
                    <MousePointerClick className="w-8 h-8 text-text-muted/50 mx-auto animate-bounce" />
                    <h3 className="text-[11px] font-bold uppercase text-text-main tracking-wider">Select a file</h3>
                    <p className="text-[10px] text-text-muted max-w-xs mx-auto font-sans leading-relaxed">
                      Click any file on the left side tree-view to display its purpose, exports, and implementation details.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Q&A Accordion Section */}
      <section id="qa" className="border-t border-border-subtle py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 text-center">
            <span className="text-[10px] text-text-muted uppercase tracking-[0.2em]">Interview Prep</span>
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-text-main mt-1">Hard Engineering Q&A Checklist</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                id: "q1",
                question: "How do you handle LLM hallucinations in JSON structures?",
                answer: (
                  <>
                    We enforce structure at multiple layers:
                    <ul className="list-disc pl-5 mt-2 space-y-1.5 font-sans text-text-muted">
                      <li>First, we configure Groq/API parameters with <code>response_format={"{"}type: json_object{"}"}</code>.</li>
                      <li>Second, we pass the exact Pydantic schema in the system prompt instructions.</li>
                      <li>Third, the backend validates the raw string using <code>schema(**parsed)</code>. If keys are missing, Pydantic raises a <code>ValidationError</code>. We catch this in our <code>call_with_retry</code> loop, which automatically retries the LLM request up to 3 times with the validation error appended to the prompt history before failing the stage gracefully.</li>
                    </ul>
                  </>
                )
              },
              {
                id: "q2",
                question: "Why didn't you use Server-Sent Events (SSE) for streaming instead of polling?",
                answer: "Polling at 1.5-second intervals was a deliberate design choice. Server-Sent Events (SSE) require keeping open connections active on the server. On standard cloud serverless tiers, idle connections are aggressively terminated, leading to connection loss. Since our multi-agent pipeline completes in under 30 seconds, polling results in about 20 requests total. This puts minimal load on Supabase while significantly simplifying the backend state management."
              },
              {
                id: "q3",
                question: "What happens if the backend server restarts in the middle of a pipeline run?",
                answer: "Since LangGraph checkpointers are stored in a local SQLite file (checkpoints.db) on the server, a restart will terminate the active execution thread. However, any agent stages that completed before the restart are already permanently saved in Supabase. When the user refreshes, the frontend client queries the status. The backend detects that the LangGraph state is missing, queries Supabase to reconstruct the completed artifacts, and loads the session dashboard seamlessly."
              },
              {
                id: "q4",
                question: "Why did you use SQLite for LangGraph checkpoints but Supabase for artifacts?",
                answer: "LangGraph requires synchronous, low-latency checkpoint logging to save thread state at every single node transition. Saving checkpoints to a remote database like Supabase would add significant network latency to every step. By using local SQLite for the short-term checkpointer, the graph transitions instantly. Once the entire pipeline finishes, the final compiled artifacts are saved to Supabase to guarantee permanent storage."
              }
            ].map((item) => (
              <div key={item.id} className="border border-border-subtle bg-panel rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveQa(activeQa === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between p-5 text-left text-text-main font-bold hover:text-accent transition-colors"
                >
                  <span className="text-[12px] flex items-start gap-3">
                    <HelpCircle className="w-4.5 h-4.5 text-accent shrink-0 mt-0.5" />
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-text-muted transition-transform shrink-0 ${
                      activeQa === item.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {activeQa === item.id && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 border-t border-border-subtle bg-base/20 text-[11px] text-text-muted leading-relaxed font-sans">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8 text-center text-[10px] text-text-muted font-mono bg-panel/30 absolute bottom-0 left-0 right-0">
        <div className="max-w-6xl mx-auto px-6">
          <p>Blueprint Engine Technical Whitepaper & Simulator. Developed for technical validation.</p>
          <p className="mt-2 text-[9px]">
            Github Repository:{" "}
            <a
              href="https://github.com/varun2507027108-oss/blueprint"
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              blueprint
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}