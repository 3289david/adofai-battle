"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { Flame, ArrowRight, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

function safeDecode(raw: string) {
  try {
    return decodeURIComponent(raw.replace(/\+/g, " "));
  } catch {
    return raw;
  }
}

function Inner() {
  const { login } = useAuth();
  const sp = useSearchParams();
  const oauthErrRaw = sp.get("oauth_err");
  const oauthErr = oauthErrRaw ? safeDecode(oauthErrRaw) : "";

  const idpRegister = `${process.env.NEXT_PUBLIC_AUTH_ISSUER ?? "https://auth.adofai.net"}/register`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-grid opacity-5" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl fire-gradient mb-4 shadow-lg shadow-fire/25">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            Sign in via <span className="fire-text">auth.adofai.net</span>
          </h1>
          <p className="text-muted mt-2">
            OAuth sign-in — your email address, Turnstile, and verification flow match ADOFAI.NET security.
          </p>
        </div>

        <div className="glass rounded-2xl p-8 space-y-5">
          {oauthErr ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
              {oauthErr}
            </div>
          ) : null}

          <div className="flex items-center gap-3 p-4 rounded-xl bg-fire/5 border border-fire/20">
            <div className="w-9 h-9 rounded-lg fire-gradient flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-black text-white">◇</span>
            </div>
            <div>
              <p className="text-xs font-semibold">Separate IdP subdomain</p>
              <p className="text-[10px] text-muted mt-0.5">
                Opens <strong className="text-foreground">{process.env.NEXT_PUBLIC_AUTH_ISSUER ?? "https://auth.adofai.net"}</strong>
                {' '}— confirm access, never share your password with this tournament site directly.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              void login();
            }}
            className="w-full py-3.5 rounded-xl fire-gradient text-white font-bold text-sm tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-fire/25"
          >
            Continue with OAuth
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center space-y-2 pt-2 text-[10px] text-muted leading-relaxed">
            <p>
              Need an account?{" "}
              <Link href={idpRegister} className="text-fire hover:underline inline-flex items-center gap-0.5">
                Register on the IdP <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </p>
            <a
              href="https://adofai.net"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground"
            >
              ADOFAI.NET main site <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-muted">Loading…</div>}>
      <Inner />
    </Suspense>
  );
}
