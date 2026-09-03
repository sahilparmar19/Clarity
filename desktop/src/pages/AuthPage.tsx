import { useState } from "react";
import { useAuth } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, User, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login({ username, password });
      } else {
        await register({ username, email, password });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="morning-bg min-h-screen flex items-center justify-center p-6 overflow-hidden">
      {/* Warm ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-[#D98A7E]/20 via-[#C87467]/10 to-[#E8B4AC]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-[#6B8065]/10 to-[#DFD3C6]/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="relative overflow-hidden rounded-3xl morning-card-elevated border border-black/[0.08]">
          {/* Header */}
          <div className="relative px-8 pt-8 pb-7 text-center overflow-hidden">
            {/* Logo icon */}
            <div className="relative w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#F2EFE9] border border-black/[0.08] flex items-center justify-center shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D98A7E] to-[#C87467] flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
            </div>
            <h1 className="relative text-2xl font-bold tracking-tight text-[#24211E] font-serif">Clarity</h1>
            <p className="relative text-[#827A72] text-xs mt-0.5 font-medium">
              {isLogin ? "Welcome back to your personal workspace" : "Create your offline-first account"}
            </p>
          </div>

          {/* Divider accent */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#C87467]/25 to-transparent" />

          <div className="p-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-3 text-[#C87467] bg-[#C87467]/10 rounded-xl text-xs font-semibold border border-[#C87467]/20"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-[#524B45] uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#827A72]" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. sahil"
                    required
                    autoFocus
                    className="morning-input pl-10 font-medium"
                  />
                </div>
              </div>

              {/* Email — register only */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="block text-xs font-bold text-[#524B45] uppercase tracking-wider mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#827A72]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="morning-input pl-10 font-medium"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-[#524B45] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#827A72]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="morning-input pl-10 tracking-widest font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full morning-btn-accent justify-center py-2.5 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? "Sign In" : "Create Account"}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-5 mt-5 border-t border-black/[0.06]">
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(""); }}
                className="text-xs font-semibold text-[#827A72] hover:text-[#C87467] transition cursor-pointer"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
