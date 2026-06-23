import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { ResearchItem, AnalyticsResponse } from "../types";
import { 
  Users, 
  Search, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  FlaskConical, 
  AlertTriangle, 
  CornerDownRight, 
  Play,
  RotateCcw
} from "lucide-react";
import Markdown from "react-markdown";

export const DashboardPage: React.FC = () => {
  const { apiMode } = useAuth();
  const navigate = useNavigate();

  // Dashboard Page States
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [recentHistory, setRecentHistory] = useState<ResearchItem[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Form Synthesis state
  const [query, setQuery] = useState("");
  const [statusStage, setStatusStage] = useState<string>("");
  const [isResearching, setIsResearching] = useState(false);
  const [researchResult, setResearchResult] = useState<{ id: string; final_answer: string } | null>(null);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);

  // Load dashboard variables in sync
  const loadDashboardData = async () => {
    setDashboardError(null);
    setAnalyticsLoading(true);
    setHistoryLoading(true);

    try {
      // 1. Fetch Analytics
      const analyticsRes = await api.get("/analytics");
      setAnalytics(analyticsRes.data);
      setAnalyticsLoading(false);

      // 2. Fetch History (page 1, size 3 for recent)
      const historyRes = await api.get("/history?page=1&size=3");
      setRecentHistory(historyRes.data.history || []);
      setHistoryLoading(false);
    } catch (err: any) {
      console.error(err);
      setAnalyticsLoading(false);
      setHistoryLoading(false);
      setDashboardError(
        `Unable to fetch metrics from the ${apiMode === "sandbox" ? "Sandbox" : "FastAPI"} server.`
      );
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Listen to manual Server Target Mode updates from layout to trigger instant fetch reloading
    const handleModeUpdate = () => {
      setResearchResult(null);
      setQuery("");
      loadDashboardData();
    };
    window.addEventListener("api_mode_updated", handleModeUpdate);
    return () => {
      window.removeEventListener("api_mode_updated", handleModeUpdate);
    };
  }, [apiMode]);

  // Research Form submission handler
  const handleResearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsResearching(true);
    setSynthesisError(null);
    setResearchResult(null);

    // Multi-stage loading indicators simulator
    const stages = [
      "Initializing search agents...",
      "Querying web search grounding indexes...",
      "Evaluating research documents & models...",
      "Analyzing cross-referenced annotations...",
      "Synthesizing dynamic report answers...",
      "Formatting outputs..."
    ];

    let stageIdx = 0;
    setStatusStage(stages[0]);
    const stageTimer = setInterval(() => {
      stageIdx++;
      if (stageIdx < stages.length) {
        setStatusStage(stages[stageIdx]);
      }
    }, 1800);

    try {
      const researchRes = await api.post("/research", {
        query: query.trim()
      });

      setResearchResult(researchRes.data);
      setQuery(""); // Clear input form on success
      
      // Update analytics and recent feeds immediately in-place
      loadDashboardData();
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setSynthesisError(err.response.data.error);
      } else if (err.response && err.response.data && err.response.data.detail) {
        setSynthesisError(typeof err.response.data.detail === "string" ? err.response.data.detail : "Error performing synthesis.");
      } else {
        setSynthesisError(`Failed to authenticate query with ${apiMode === "sandbox" ? "Sandbox" : "FastAPI"} host. Verified local API server is online.`);
      }
    } finally {
      clearInterval(stageTimer);
      setIsResearching(false);
      setStatusStage("");
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Page Header Intro */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 md:text-3xl">
            Executive Synthesis Engine
          </h1>
          <p className="text-zinc-400 mt-1 text-sm md:text-base">
            Input advanced questions to prompt automated research synthesis and multi-source auditing.
          </p>
        </div>
        
        {dashboardError && (
          <button
            onClick={loadDashboardData}
            id="dashboard-reconnect-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-semibold cursor-pointer shadow-xs hover:bg-zinc-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reload Source
          </button>
        )}
      </div>

      {/* Global connection Error Callout with helpful advice */}
      {dashboardError && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col md:flex-row gap-4 items-start justify-between">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-200">Connection Interruption Warning</h4>
              <p className="text-xs text-amber-400 mt-1 leading-relaxed">
                Applet is currently looking for services under <code className="bg-amber-950/60 px-1 py-0.5 rounded font-mono text-amber-400">{apiMode === "live" ? "http://localhost:8000" : "Server Sandbox Sandbox"}</code>, but we received network rejections.
              </p>
              <ul className="list-disc pl-4 text-xs text-amber-400 mt-2 space-y-1">
                {apiMode === "live" ? (
                  <>
                    <li>Ensure your FastAPI backend server is actively running on port 8000.</li>
                    <li>Verify your FastAPI configuration allows CORS queries from your browser.</li>
                    <li>Alternatively, switch to **AI Sandbox Mode** on the sidebar to test features instantly.</li>
                  </>
                ) : (
                  <>
                    <li>Make sure standard local environment processes have completed starting.</li>
                    <li>If testing via Sandbox API mode, you may reload components.</li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <button
            onClick={() => {
              // Quick toggler trick to help them experience it
              const val = apiMode === "sandbox" ? "live" : "sandbox";
              localStorage.setItem("api_mode", val);
              window.location.reload();
            }}
            id="dashboard-switch-mode-error-callout"
            className="text-xs shrink-0 cursor-pointer font-bold px-3 py-1.5 rounded-lg bg-amber-600/15 text-amber-400 hover:bg-amber-600/25 border border-amber-600/30 transition shadow-xs whitespace-nowrap"
          >
            Switch to {apiMode === "sandbox" ? "FastAPI Local" : "Sandbox Demo Mode"}
          </button>
        </div>
      )}

      {/* 1. Analytics Cards Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Users card */}
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1 font-sans">
            <span className="text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
              Total Users
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-zinc-100 tracking-tight">
                {analyticsLoading ? (
                  <span className="inline-block w-8 h-6 bg-zinc-850 animate-pulse rounded" />
                ) : (
                  analytics?.total_users ?? 0
                )}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">active profiles</span>
            </div>
          </div>
          <div className="bg-indigo-950/40 border border-indigo-900/30 p-2.5 rounded-xl text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Total Researches Card */}
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1 font-sans">
            <span className="text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
              Total Queries
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-zinc-100 tracking-tight">
                {analyticsLoading ? (
                  <span className="inline-block w-8 h-6 bg-zinc-850 animate-pulse rounded" />
                ) : (
                  analytics?.total_researches ?? 0
                )}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">synthesized items</span>
            </div>
          </div>
          <div className="bg-indigo-950/40 border border-indigo-900/30 p-2.5 rounded-xl text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Average Attempts Card */}
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1 font-sans">
            <span className="text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
              Search Multiplicity
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-zinc-100 tracking-tight">
                {analyticsLoading ? (
                  <span className="inline-block w-8 h-6 bg-zinc-850 animate-pulse rounded" />
                ) : (
                  analytics?.average_attempts ?? "0"
                )}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">mean steps/try</span>
            </div>
          </div>
          <div className="bg-purple-950/40 border border-purple-900/30 p-2.5 rounded-xl text-purple-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Latest Research Date Card */}
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1 font-sans min-w-0 flex-1">
            <span className="text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
              Latest Action
            </span>
            <div className="text-sm font-semibold text-zinc-200 truncate">
              {analyticsLoading ? (
                <span className="inline-block w-24 h-4 bg-zinc-850 animate-pulse rounded" />
              ) : analytics?.latest_research ? (
                formatDate(analytics.latest_research).split(" at ")[0] // simple format without time for cards
              ) : (
                "None Registered"
              )}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono">
              {analytics?.latest_research ? formatDate(analytics.latest_research).split(" at ")[1] : "No historical log"}
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-zinc-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid: 2. Research Portal & 3. Recent History Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle Column (span-2) - CORE RESEARCH FORM PORTAL */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-xs font-sans relative">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-6">
              <div className="bg-indigo-950/45 p-2 rounded-lg text-indigo-400 border border-indigo-900/35">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">Query Synthesis Portal</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Define your core analysis inquiry. Supported by multi-vector research models.</p>
              </div>
            </div>

            <form onSubmit={handleResearchSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider font-mono mb-2">
                  Research Question
                </label>
                <textarea
                  rows={4}
                  required
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isResearching}
                  className="w-full font-sans bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="e.g. What is the architecture behind LangGraph? Explain how multi-agent workflow state synchronization differs from standard DAG executors."
                />
              </div>

              {synthesisError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-start gap-3">
                  <span className="font-bold">Error:</span>
                  <span>{synthesisError}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 pt-2">
                <span className="text-[10px] text-zinc-500 font-mono">
                  {isResearching ? (
                    <span className="text-indigo-400 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-505 animate-ping" />
                      {statusStage}
                    </span>
                  ) : (
                    "Press submit to trigger Deep Search reasoning pipelines."
                  )}
                </span>

                <button
                  type="submit"
                  id="dashboard-research-submit-btn"
                  disabled={isResearching || !query.trim()}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold font-mono tracking-wider uppercase cursor-pointer hover:bg-indigo-500 disabled:opacity-45 disabled:pointer-events-none transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/20"
                >
                  {isResearching ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Reasoning...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Synthesize Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Synthesis Real-time Output Panel */}
          {researchResult && (
            <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 md:p-8 text-zinc-100 shadow-xl overflow-hidden animate-fade-in animate-duration-300">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse shrink-0" />
                  <span className="text-xs font-mono font-bold uppercase text-indigo-300 tracking-wider">
                    Instant Research Synthesizer Output
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/history/${researchResult.id}`)}
                  id="dashboard-result-view-details-btn"
                  className="flex items-center gap-1 text-[11px] font-bold font-mono text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <span>Query Details Log</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Renders dynamic Markdown nicely as required in Guidelines */}
              <div className="markdown-body prose max-w-none text-zinc-300 text-sm leading-relaxed space-y-4">
                <Markdown>{researchResult.final_answer}</Markdown>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (span-1) - RECENT RESEARCH HISTORY FEED */}
        <div className="space-y-6">
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 shadow-xs font-sans">
            <div className="flex items-center justify-between border-b border-zinc-805 pb-4 mb-4">
              <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest font-mono">
                Recent Synopses
              </h4>
              <Link 
                to="/history" 
                id="dashboard-to-history-all-link"
                className="text-[11px] font-bold font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Logs Feed</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {historyLoading ? (
                // Skeleton UI representation as requested
                [1, 2, 3].map((s) => (
                  <div key={s} className="p-4 border border-zinc-850 rounded-xl space-y-2.5 animate-pulse bg-zinc-900/30">
                    <div className="h-4 bg-zinc-800 rounded w-5/6" />
                    <div className="h-3 bg-zinc-850 rounded w-1/3" />
                  </div>
                ))
              ) : recentHistory.length === 0 ? (
                <div className="text-center py-8 px-4 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
                  <FlaskConical className="w-8 h-8 text-zinc-600 mx-auto stroke-1" />
                  <p className="text-xs text-zinc-500 font-medium mt-3 leading-relaxed">
                    No research syntheses are recorded under this account mode.
                  </p>
                </div>
              ) : (
                recentHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl hover:bg-zinc-800/20 hover:border-zinc-700 transition group relative"
                  >
                    <div className="space-y-2">
                      <Link
                        to={`/history/${item.id}`}
                        id={`dashboard-recent-history-link-${item.id}`}
                        className="text-xs font-bold text-zinc-200 line-clamp-2 leading-relaxed hover:text-indigo-400 transition-colors block pr-4"
                      >
                        {item.question}
                      </Link>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                        <span className="flex items-center gap-1 font-semibold text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-1.5 py-0.5 rounded">
                          {item.attempts} {item.attempts === 1 ? "step" : "steps"}
                        </span>
                        <span>{formatDate(item.created_at).split(" at ")[0]}</span>
                      </div>
                    </div>

                    <div className="absolute top-4 right-4 text-zinc-600 group-hover:text-indigo-400 transition-colors pointer-events-none">
                      <CornerDownRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
