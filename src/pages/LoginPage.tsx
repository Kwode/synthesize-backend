import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { FlaskConical, AlertCircle, CheckCircle, ArrowRight, Eye, EyeOff, Sparkles, Link2 } from "lucide-react";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, apiMode, setApiMode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Please fill out all fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // In sandbox mode or live mode, the axios interceptor configures the baseURL automatically!
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { access_token } = res.data;
      login(email, access_token);
      
      setSuccessMsg("Welcome! Authenticated successfully.");
      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setErrorMsg(err.response.data.error);
      } else if (err.response && err.response.data && err.response.data.detail) {
        // Handle FastAPI detail message format automatically
        setErrorMsg(typeof err.response.data.detail === 'string' ? err.response.data.detail : "Invalid credentials.");
      } else {
        setErrorMsg(`Failed to authenticate with the ${apiMode === "sandbox" ? "Sandbox" : "FastAPI"} server. Make sure the server is online.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to pre-populate mock credentials
  const fillDemo = () => {
    setEmail("user@example.com");
    setPassword("password123");
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background ambient lighting blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-505/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-505/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <div className="bg-indigo-950/40 p-4 rounded-2xl border border-indigo-500/30 text-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.15)]">
            <FlaskConical className="w-10 h-10" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-100 tracking-tight">
          Welcome to Synthesize
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Advanced Autonomous Research Assistant Framework
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-[#121214] border border-zinc-800 p-8 rounded-2xl shadow-2xl">
          {/* Top Server Switcher */}
          <div className="mb-6">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 text-center font-mono">
              Target Connection Server
            </label>
            <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setApiMode("sandbox")}
                className={`py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5 ${
                  apiMode === "sandbox" 
                    ? "bg-indigo-950/40 border border-indigo-900/40 text-indigo-400"
                    : "text-zinc-500 hover:text-zinc-300 bg-transparent border border-transparent"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Sandbox</span>
              </button>
              <button
                type="button"
                onClick={() => setApiMode("live")}
                className={`py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5 ${
                  apiMode === "live" 
                    ? "bg-indigo-950/45 border border-indigo-900/40 text-indigo-400"
                    : "text-zinc-500 hover:text-zinc-300 bg-transparent border border-transparent"
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>FastAPI Link</span>
              </button>
            </div>
            {apiMode === "sandbox" && (
              <div className="mt-2 text-center">
                <button 
                  type="button"
                  onClick={fillDemo}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono transition-colors cursor-pointer"
                >
                  ⚡ Autofill sandbox credentials
                </button>
              </div>
            )}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/35 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs font-sans">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/35 rounded-xl flex items-start gap-2.5 text-emerald-300 text-xs font-sans">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span className="leading-relaxed">{successMsg}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider font-mono">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm placeholder-zinc-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition duration-155"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider font-mono">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-10 py-2.5 text-zinc-100 text-sm placeholder-zinc-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition duration-155"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  id="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="login-submit-btn"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-xs font-bold font-mono tracking-wider uppercase text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer transition-all duration-150 shadow-lg shadow-indigo-950/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Generate Token & Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 flex justify-center">
            <span className="text-xs text-zinc-500">
              Don't have an account?{" "}
              <Link to="/register" id="login-to-register-link" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors font-mono">
                Create Account
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
