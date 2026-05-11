"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Flame, ArrowRight, Eye, EyeOff, ExternalLink, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/battle");
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-grid opacity-5" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl fire-gradient mb-4 shadow-lg shadow-fire/25">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            Sign In with <span className="fire-text">ADOFAI.NET</span>
          </h1>
          <p className="text-muted mt-2">
            Use your existing ADOFAI.NET account to compete in tournaments
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-fire/5 border border-fire/20">
            <div className="w-9 h-9 rounded-lg fire-gradient flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-black text-white">A</span>
            </div>
            <div>
              <p className="text-xs font-semibold">ADOFAI.NET Account Required</p>
              <p className="text-[10px] text-muted mt-0.5">
                Don&apos;t have one?{" "}
                <a
                  href="https://adofai.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fire hover:underline inline-flex items-center gap-0.5"
                >
                  Register at adofai.net <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </p>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-fire/50 focus:border-fire transition-all"
                placeholder="Your ADOFAI.NET email"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 rounded-xl bg-surface border border-border text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-fire/50 focus:border-fire transition-all"
                placeholder="Your ADOFAI.NET password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl fire-gradient text-white font-bold text-sm tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-fire/25"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In with ADOFAI.NET
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center space-y-2 pt-2">
            <p className="text-[10px] text-muted">
              Your credentials are sent directly to adofai.net for authentication.
              <br />We never store your password.
            </p>
            <a
              href="https://adofai.net"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-fire hover:underline"
            >
              Forgot password? Reset on ADOFAI.NET <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
