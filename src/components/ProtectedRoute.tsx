import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { EyeOff } from "lucide-react";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100 font-sans">
        <div className="relative w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
        <span className="mt-4 text-xs font-mono text-slate-400 uppercase tracking-widest">
          Authenticating Session...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
