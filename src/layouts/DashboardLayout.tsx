import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  History, 
  LogOut, 
  Menu, 
  X, 
  FlaskConical, 
  Settings, 
  Activity,
  Sparkles,
  Link2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  onClose?: () => void;
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { userEmail, logout, apiMode, setApiMode } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent: React.FC<SidebarProps> = ({ onClose }) => {
    const location = useLocation();
    
    const menuItems = [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Research History", path: "/history", icon: History },
    ];

    return (
      <div className="flex flex-col h-full bg-[#0d0d0f] border-r border-zinc-800 text-zinc-100 font-sans">
        {/* Brand Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <Link to="/dashboard" onClick={onClose} className="flex items-center gap-3">
            <div className="bg-indigo-600/30 p-2.5 rounded-lg border border-indigo-500/50 text-indigo-400">
              <FlaskConical className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Synthesize
              </span>
              <span className="text-xs block text-zinc-500 font-mono tracking-widest mt-0.5">RESEARCH ENGINE</span>
            </div>
          </Link>
          
          {onClose && (
            <button 
              onClick={onClose} 
              id="sidebar-close-btn"
              className="md:hidden text-zinc-400 hover:text-zinc-100 p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-2 font-mono">
            Navigation
          </div>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                id={`sidebar-link-${item.name.toLowerCase().replace(" ", "-")}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                  isActive 
                    ? "bg-zinc-800/50 text-indigo-400 border border-zinc-700/50 shadow-inner" 
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator" 
                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-400"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}

          <div className="pt-6">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-3 font-mono">
              Server Target Connect
            </div>
            
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl space-y-2">
              <button
                onClick={() => setApiMode("sandbox")}
                id="mode-sandbox-btn"
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition text-left ${
                  apiMode === "sandbox"
                    ? "bg-indigo-600/25 border border-indigo-500/50 text-indigo-300"
                    : "bg-transparent border border-transparent text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                  AI Sandbox Mode
                </span>
                {apiMode === "sandbox" && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 ring-4 ring-indigo-500/20" />
                )}
              </button>

              <button
                onClick={() => setApiMode("live")}
                id="mode-live-btn"
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition text-left ${
                  apiMode === "live"
                    ? "bg-emerald-600/25 border border-emerald-500/50 text-emerald-300"
                    : "bg-transparent border border-transparent text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  Local FastAPI:8000
                </span>
                {apiMode === "live" && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
                )}
              </button>
            </div>
            <p className="px-2 mt-2 text-[10px] text-zinc-500 leading-relaxed">
              {apiMode === "sandbox" 
                ? "Powered by Cloud containers with server-side Gemini 3.5 content synthesis models." 
                : "Point-to-point CORS fetch direct to your local FastAPI backend server."}
            </p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 flex flex-col gap-3 font-sans">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm text-indigo-100 shrink-0 shadow-lg border border-indigo-500/30 font-sans">
              {userEmail ? userEmail.substring(0, 2).toUpperCase() : "US"}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm font-semibold text-zinc-100 block truncate font-sans">
                {userEmail || "obruchekwode@gmail.com"}
              </span>
              <span className="text-[10px] text-zinc-500 block font-mono truncate">
                RESEARCH ACCOUNT
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            id="sidebar-logout-btn"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 text-zinc-400 text-xs font-medium cursor-pointer hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex">
      {/* Off-canvas mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-xs"
            />
            {/* Sidebar drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-72 max-w-xs h-full shadow-2xl z-55"
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
        <SidebarContent />
      </aside>

      {/* Main app body */}
      <div className="flex-1 flex flex-col md:pl-64">
        {/* Top bar header */}
        <header className="h-16 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md flex items-center justify-between px-6 z-30 font-sans">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              id="mobile-menu-hamburger"
              className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
                AI Platform Active Context
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-sans">
            {/* Server connection indicator for Desktop summary state */}
            {apiMode === "sandbox" ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/40 border border-indigo-500/35 text-indigo-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
                <span>AI Sandbox Connected</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/35 text-emerald-300 text-xs font-medium">
                <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>FastAPI Direct Link</span>
              </div>
            )}

            <div className="text-xs text-zinc-600 font-mono hidden md:block">
              SDK v2.4.0
            </div>
          </div>
        </header>

        {/* Content canvas */}
        <main className="flex-1 p-6 md:p-8 bg-[#09090b] max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
