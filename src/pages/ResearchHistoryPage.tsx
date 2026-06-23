import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { ResearchItem } from "../types";
import { 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Eye, 
  Calendar, 
  Cpu, 
  Activity, 
  AlertOctagon, 
  Info,
  Layers,
  Sparkles
} from "lucide-react";

export const ResearchHistoryPage: React.FC = () => {
  const { apiMode } = useAuth();
  const navigate = useNavigate();

  // Pagination and listings states
  const [historyList, setHistoryList] = useState<ResearchItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Deletion interaction states
  const [itemToDelete, setItemToDelete] = useState<ResearchItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  const fetchHistory = async (page: number) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.get(`/history?page=${page}&size=${PAGE_SIZE}`);
      
      // Handle standard and sandbox response variations
      setHistoryList(res.data.history || []);
      
      // Sandbox returns a total field. If absent, size lists tell if next page exists
      setTotalItems(res.data.total ?? (res.data.history?.length === PAGE_SIZE ? (page + 1) * PAGE_SIZE : page * PAGE_SIZE));
      
      setCurrentPage(page);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to retrieve research logs from the selected server link.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(currentPage);

    // Sync state if server target updates
    const handleModeUpdate = () => {
      fetchHistory(1);
    };
    window.addEventListener("api_mode_updated", handleModeUpdate);
    return () => {
      window.removeEventListener("api_mode_updated", handleModeUpdate);
    };
  }, [currentPage, apiMode]);

  // Pagination triggers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    // If we have totalItems or if our history length matches the standard PAGE_SIZE (indicating potentially more exists)
    if (historyList.length === PAGE_SIZE) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Delete Action workflow
  const openDeleteConfirmation = (item: ResearchItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering route details click
    setItemToDelete(item);
    setDeleteError(null);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await api.delete(`/history/${itemToDelete.id}`);
      
      // Successfully deleted. Close confirmation dialog and refresh page list
      setItemToDelete(null);
      
      // If we deleted the last item on the current page, go back a page if reasonable
      const isLastItemOnPage = historyList.length === 1;
      const targetPage = isLastItemOnPage && currentPage > 1 ? currentPage - 1 : currentPage;
      
      fetchHistory(targetPage);
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
    <div className="space-y-8 font-sans relative">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 md:text-3xl">
          Research Log History
        </h1>
        <p className="text-zinc-400 mt-1 text-sm md:text-base">
          Browse, review, and delete structural syntheses compiled on this portal thread.
        </p>
      </div>

      {/* Primary listings */}
      {errorMsg ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center">
          <AlertOctagon className="w-10 h-10 text-rose-500 mx-auto stroke-1" />
          <h4 className="text-rose-200 font-bold mt-4">Failed to Fetch Logs</h4>
          <p className="text-xs text-rose-400 mt-2 max-w-sm mx-auto leading-relaxed font-sans">
            {errorMsg} Check that the active server is running properly and allows local client requests.
          </p>
          <button
            onClick={() => fetchHistory(currentPage)}
            id="history-retry-btn"
            className="mt-4 px-4 py-2 border border-zinc-805 bg-zinc-90 w bg-zinc-900 text-zinc-300 text-xs font-semibold rounded-lg hover:bg-zinc-800 transition cursor-pointer"
          >
            Retry Connection Fetch
          </button>
        </div>
      ) : isLoading ? (
        // List loading skeleton state representation
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="bg-[#121214] border border-zinc-800 p-5 rounded-2xl space-y-3 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-1/2" />
              <div className="h-3 bg-zinc-850 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : historyList.length === 0 ? (
        <div className="text-center py-16 bg-[#121214] border border-zinc-800 rounded-2xl flex flex-col items-center justify-center">
          <Layers className="w-12 h-12 text-zinc-600 stroke-1 mb-4" />
          <h3 className="text-sm font-bold text-zinc-300">No Research Logs Recorded</h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-2 leading-relaxed font-sans">
            There are no history traces archived under this server channel. Go back to the dashboard to begin automated analyses.
          </p>
          <Link
            to="/dashboard"
            id="history-to-dashboard-btn"
            className="mt-5 px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold font-mono tracking-wider uppercase hover:bg-indigo-500 transition shadow-lg shadow-indigo-950/20"
          >
            Open Synthesis Portal
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* List items rendering */}
          {historyList.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/history/${item.id}`)}
              className="bg-[#121214] border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 hover:bg-zinc-900/40 cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-5 group"
            >
              <div className="space-y-3 min-w-0 flex-1">
                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0 group-hover:bg-indigo-455 transition-colors" />
                  <h3 className="text-sm font-bold text-zinc-200 line-clamp-2 md:line-clamp-1 leading-relaxed group-hover:text-indigo-400 transition-colors font-sans">
                    {item.question}
                  </h3>
                </div>

                {/* Sub annotations info */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-zinc-500 font-mono">
                  <span className="flex items-center gap-1.5 shrink-0 bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{formatDate(item.created_at)}</span>
                  </span>

                  <span className="flex items-center gap-1.5 shrink-0 bg-indigo-950/40 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/30">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Attempts: {item.attempts}</span>
                  </span>

                  <span className="hidden sm:inline truncate max-w-md text-zinc-500">
                    Search string: <code className="bg-zinc-950 px-1 py-0.5 rounded font-mono text-zinc-400 border border-zinc-800/80">{item.search_query || "N/A"}</code>
                  </span>
                </div>
              </div>

              {/* Action buttons on the right side */}
              <div className="flex items-center justify-end gap-2.5 shrink-0">
                <Link
                  to={`/history/${item.id}`}
                  id={`history-item-view-btn-${item.id}`}
                  className="p-2 border border-zinc-800 rounded-xl text-zinc-400 hover:text-indigo-400 hover:bg-zinc-900 transition cursor-pointer"
                  onClick={(e) => e.stopPropagation()} // Stop bubbling up
                >
                  <Eye className="w-4 h-4" />
                </Link>

                <button
                  onClick={(e) => openDeleteConfirmation(item, e)}
                  id={`history-item-delete-btn-${item.id}`}
                  className="p-2 border border-zinc-800 rounded-xl text-zinc-400 hover:text-rose-455 hover:border-rose-950 hover:bg-rose-950/20 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Simple Pagination Controls Footer */}
          <div className="pt-6 border-t border-zinc-800 flex items-center justify-between font-mono text-xs text-zinc-500">
            <span className="font-semibold">
              Page {currentPage} Log Entries
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1 || isLoading}
                id="history-pagination-prev"
                className="px-3 py-1.5 border border-zinc-800 rounded-xl text-zinc-300 bg-zinc-900 hover:bg-zinc-850 cursor-pointer disabled:pointer-events-none disabled:opacity-40 transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev Page</span>
              </button>

              <button
                onClick={handleNextPage}
                disabled={historyList.length < PAGE_SIZE || isLoading}
                id="history-pagination-next"
                className="px-3 py-1.5 border border-zinc-800 rounded-xl text-zinc-300 bg-zinc-900 hover:bg-zinc-850 cursor-pointer disabled:pointer-events-none disabled:opacity-40 transition flex items-center gap-1.5"
              >
                <span>Next Page</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Safe Deletion Confirmation Modal Dialog */}
      {itemToDelete && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Overlay mask */}
          <div 
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-xs transition-opacity duration-300" 
            onClick={() => setItemToDelete(null)}
          />

          {/* Modal dialogue box */}
          <div className="bg-[#121214] border border-zinc-800 max-w-md w-full rounded-2xl p-6 shadow-2xl relative z-101 transform scale-100 transition-all duration-300 font-sans space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3 text-rose-400">
              <div className="bg-rose-950/30 border border-rose-900/40 p-2 rounded-lg text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold">Confirm Log Cleansing</h3>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed">
              Are you sure you want to permanently erase the research synthesis for: <strong className="text-zinc-200">"{itemToDelete.question}"</strong>? This operation cannot be undone.
            </p>

            {deleteError && (
              <div className="p-3 bg-rose-950/40 border border-rose-900/40 text-rose-300 text-xs rounded-lg font-mono">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                id="delete-modal-cancel"
                className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 text-xs font-semibold font-mono uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
              >
                Abstain
              </button>
              <button
                onClick={executeDelete}
                disabled={isDeleting}
                id="delete-modal-confirm"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold font-mono uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-sm shadow-rose-950 disabled:opacity-50"
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
