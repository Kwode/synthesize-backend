import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { ResearchItem } from "../types";
import { 
  ArrowLeft, 
  Trash2, 
  Calendar, 
  Cpu, 
  Sparkles, 
  Layers, 
  Search, 
  Activity,
  AlertTriangle,
  FileText
} from "lucide-react";
import Markdown from "react-markdown";

export const ResearchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { apiMode } = useAuth();
  const navigate = useNavigate();

  // Detail log states
  const [item, setItem] = useState<ResearchItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Deletion interaction states
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchDetails = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.get(`/history/${id}`);
      setItem(res.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to retrieve the requested research details log from the server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id, apiMode]);

  const handleDelete = async () => {
    if (!item) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/history/${item.id}`);
      setShowConfirmDelete(false);
      navigate("/history");
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setDeleteError(err.response.data.error);
      } else {
        setDeleteError("Failed to successfully wipe this log item.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 font-sans relative">
      
      {/* Back button and title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate("/history")}
          id="detail-back-btn"
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 text-xs font-bold font-mono tracking-wider uppercase transition cursor-pointer shrink-0 w-fit"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-500" />
          <span>Back to Logs Feed</span>
        </button>

        {item && (
          <button
            onClick={() => setShowConfirmDelete(true)}
            id="detail-delete-initiator"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-805 bg-zinc-900 hover:bg-rose-950/25 text-zinc-400 hover:text-rose-455 text-xs font-bold font-mono tracking-wider uppercase rounded-xl transition cursor-pointer w-fit self-end shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe Log</span>
          </button>
        )}
      </div>

      {errorMsg ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto stroke-1" />
          <h4 className="text-rose-200 font-bold mt-4">Record Retrieval Interrupted</h4>
          <p className="text-xs text-rose-400 mt-2 max-w-sm mx-auto leading-relaxed font-sans">
            {errorMsg} Check that the active server context is properly targeted in the sidebar.
          </p>
          <button
            onClick={fetchDetails}
            id="detail-retry-btn"
            className="mt-4 px-4 py-2 border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-semibold rounded-lg hover:bg-zinc-805 transition cursor-pointer"
          >
            Retry Fetch
          </button>
        </div>
      ) : isLoading ? (
        // Details loading skeleton state representation
        <div className="space-y-6">
          <div className="bg-[#121214] border border-zinc-800 p-6 rounded-2xl animate-pulse space-y-4">
            <div className="h-6 bg-zinc-800 rounded w-2/3" />
            <div className="h-3 bg-zinc-850 rounded w-1/3" />
          </div>
          <div className="bg-[#121214] border border-zinc-800 p-6 rounded-2xl animate-pulse space-y-3">
            <div className="h-4 bg-zinc-800 rounded w-full" />
            <div className="h-4 bg-zinc-800 rounded w-5/6" />
            <div className="h-4 bg-zinc-800 rounded w-4/5" />
          </div>
        </div>
      ) : !item ? (
        <div className="text-center py-16 bg-[#121214] border border-zinc-800 rounded-2xl flex flex-col items-center justify-center">
          <Layers className="w-12 h-12 text-zinc-650 stroke-1 mb-4" />
          <h3 className="text-sm font-bold text-zinc-300">Detail Record Not Located</h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-2 leading-relaxed font-sans">
            This individual log tracking key does not map to any archives. Returning to active listings is advised.
          </p>
          <Link
            to="/history"
            id="detail-fallback-back-link"
            className="mt-5 px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold font-mono tracking-wider uppercase hover:bg-indigo-505 transition shadow-lg shadow-indigo-950/20"
          >
            Review Logs List
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Main Question Heading Box */}
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-xs font-sans space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
                Audited Inquiry In Focus
              </span>
            </div>
            
            <h2 className="text-lg md:text-xl font-extrabold text-zinc-100 leading-snug">
              {item.question}
            </h2>

            {/* Sub-annotations meta layout grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-800/80 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block">
                  Date of Synthesis
                </span>
                <span className="text-zinc-200 font-bold block">
                  {formatDate(item.created_at).split(" at ")[0]}
                </span>
                <span className="text-zinc-500 text-[10px] block">
                  at {formatDate(item.created_at).split(" at ")[1] || "UTC standard"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block">
                  Autonomous Search Query
                </span>
                <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-indigo-400 font-semibold border border-zinc-805 block w-fit truncate max-w-full">
                  {item.search_query || "N/A"}
                </code>
                <span className="text-zinc-500 text-[10px] block">
                  Auto-compiled index query
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block">
                  Auditing Try Steps
                </span>
                <div className="flex items-center gap-1.5 font-bold text-zinc-200">
                  <div className="w-5 h-5 rounded bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center text-xs text-indigo-400 font-extrabold">
                    {item.attempts}
                  </div>
                  <span>{item.attempts === 1 ? "Inquiry Pass" : "Iterative Passes"}</span>
                </div>
                <span className="text-zinc-500 text-[10px] block font-mono">
                  Cycles taken to gather thesis
                </span>
              </div>
            </div>
          </div>

          {/* Main Answer Thesis Panel */}
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-2 border-b border-zinc-805 pb-4 mb-6">
              <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 animate-pulse" />
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest font-mono">
                Synthesized Report Analysis (Markdown)
              </h3>
            </div>

            {/* Render formatted Markdown natively as rules specify */}
            <div className="markdown-body prose max-w-none text-zinc-300 text-sm leading-relaxed space-y-4">
              <Markdown>{item.final_answer}</Markdown>
            </div>
          </div>

        </div>
      )}

      {/* Confirmation Modal overlay for direct Deactivation/Deletion */}
      {showConfirmDelete && item && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setShowConfirmDelete(false)}
          />

          <div className="bg-[#121214] border border-zinc-800 max-w-md w-full rounded-2xl p-6 shadow-2xl relative z-101 transform scale-100 transition-all duration-300 font-sans space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-805 pb-3 text-rose-400">
              <div className="bg-rose-950/30 border border-rose-900/40 p-2 rounded-lg text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold">Confirm Log Cleansing</h3>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed">
              Are you sure you want to permanently erase the research synthesis for <strong className="text-zinc-200">"{item.question}"</strong>? This operation cannot be undone.
            </p>

            {deleteError && (
              <div className="p-3 bg-rose-950/40 border border-rose-900/40 text-rose-300 text-xs rounded-lg font-mono">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-805">
              <button
                onClick={() => setShowConfirmDelete(false)}
                disabled={isDeleting}
                id="detail-delete-cancel"
                className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 text-xs font-semibold font-mono uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
              >
                Abstain
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                id="detail-delete-confirm"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold font-mono uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-sm shadow-rose-955 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Wiping...</span>
                  </>
                ) : (
                  <span>Destroy Record</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
