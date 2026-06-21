"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { BACKEND_URL } from "@/lib/config";


interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [notionToken, setNotionToken] = useState("");
  const [notionDbId, setNotionDbId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar_open");
      if (saved !== null) {
        setIsOpen(JSON.parse(saved));
      } else {
        const isDesktop = window.innerWidth >= 768;
        setIsOpen(isDesktop);
      }
    }
  }, [setIsOpen]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar_open", JSON.stringify(isOpen));
    }
  }, [isOpen]);


  useEffect(() => {
    // Load Notion credentials
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("notion_token") || "";
      const dbId = localStorage.getItem("notion_database_id") || "";
      setNotionToken(token);
      setNotionDbId(dbId);
      setIsConnected(!!(token && dbId));
    }
  }, []);

  useEffect(() => {
    // Load Recent Sessions
    if (typeof window !== "undefined") {
      try {
        const mySessions = JSON.parse(localStorage.getItem("my_sessions") || "[]");
        if (mySessions.length > 0) {
          fetch(`${BACKEND_URL}/sessions/history`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_ids: mySessions }),
          })
            .then((res) => {
              if (!res.ok) {
                throw new Error("Failed to fetch history");
              }
              return res.json();
            })
            .then((data) => {
              if (Array.isArray(data)) {
                setRecentSessions(data);
              }
            })
            .catch((err) => loggerError("history fetch error", err));
        } else {
          setRecentSessions([]);
        }
      } catch (e) {
        loggerError("loading history error", e);
      }
    }
  }, [pathname]);

  const loggerError = (msg: string, ...args: any[]) => {
    console.error(msg, ...args);
  };

  const handleSaveNotion = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notion_token", notionToken.trim());
      localStorage.setItem("notion_database_id", notionDbId.trim());
      setIsConnected(!!(notionToken.trim() && notionDbId.trim()));
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-1.5 hover:bg-neutral-800/50 rounded-md transition-colors cursor-pointer flex items-center justify-center"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? (
          <div className="relative w-6 h-6 flex items-center justify-center group/toggle">
            {/* Logo */}
            <div className="transition-all duration-300 group-hover/toggle:scale-90 group-hover/toggle:opacity-0 flex items-center justify-center">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={24} 
                height={24} 
                className="w-6 h-6 object-contain"
              />
            </div>
            {/* Close Icon */}
            <PanelLeftClose 
              className="absolute w-5 h-5 text-[#8A8F99] hover:text-[#ECEAE3] opacity-0 scale-90 group-hover/toggle:opacity-100 group-hover/toggle:scale-100 transition-all duration-300"
            />
          </div>
        ) : (
          <PanelLeftOpen className="w-5 h-5 text-[#8A8F99] hover:text-[#ECEAE3] transition-transform duration-200 hover:scale-105" />
        )}
      </button>


      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 bottom-0 w-72 bg-[#090C10] border-r border-border-subtle z-40 flex flex-col p-4 pt-16 overflow-y-auto hide-scrollbar text-white"
          >
            <Link 
              href="/start" 
              className="block w-full bg-accent text-[#090C10] text-center py-2 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity mb-8 rounded-sm"
            >
              New Session
            </Link>

            <div className="mb-8">
              <h3 className="text-[10px] uppercase tracking-widest text-[#8A8F99] font-bold mb-3">Integrations</h3>
              <div className="space-y-2 bg-[#11161C] border border-border-subtle p-3 rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-[#ECEAE3] font-bold">Notion</span>
                  {isConnected && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-complete opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-status-complete"></span>
                    </span>
                  )}
                </div>
                <input 
                  type="password" 
                  placeholder="Integration Token" 
                  value={notionToken}
                  onChange={(e) => setNotionToken(e.target.value)}
                  className="w-full bg-[#05070A] border border-border-subtle px-2 py-1 text-[#ECEAE3] text-[10px] focus:outline-none focus:border-accent rounded-sm"
                />
                <input 
                  type="text" 
                  placeholder="Database ID" 
                  value={notionDbId}
                  onChange={(e) => setNotionDbId(e.target.value)}
                  className="w-full bg-[#05070A] border border-border-subtle px-2 py-1 text-[#ECEAE3] text-[10px] focus:outline-none focus:border-accent rounded-sm"
                />
                <button 
                  onClick={handleSaveNotion}
                  className="w-full bg-accent text-[#090C10] py-1 text-[9px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity rounded-sm mt-1 cursor-pointer"
                >
                  {isConnected ? "Update" : "Save"}
                </button>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-[10px] uppercase tracking-widest text-[#8A8F99] font-bold mb-3">Recent Sessions</h3>
              <div className="space-y-2">
                {recentSessions.length === 0 ? (
                  <p className="text-[#8A8F99] text-[10px] italic">No history yet.</p>
                ) : (
                  recentSessions.map((s: any) => (
                    <Link 
                      href={`/session/${s.session_id}`} 
                      key={s.session_id} 
                      className={`block bg-[#11161C] border border-border-subtle p-2 hover:border-accent transition-colors rounded-sm ${pathname === `/session/${s.session_id}` ? "border-accent" : ""}`}
                    >
                      <div className="text-[#ECEAE3] text-[11px] font-bold truncate">{s.startup_name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div 
                          className={`w-1.5 h-1.5 rounded-full ${
                            s.status === 'complete' 
                              ? 'bg-status-complete' 
                              : s.status === 'failed' 
                                ? 'bg-status-failed' 
                                : 'bg-accent animate-pulse'
                          }`}
                        ></div>
                        <span className="text-[#8A8F99] text-[9px] uppercase tracking-widest">{s.status}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
