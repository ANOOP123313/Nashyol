import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { authAPI, setToken, getToken } from "../services/api";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@naashyol.com");
  const [password, setPassword] = useState("admin123password");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    if (getToken()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.login(email.trim(), password);

      if (res?.token) {
        setToken(res.token);
        if (res.user) {
          localStorage.setItem("adminUser", JSON.stringify(res.user));
        }
        toast.success("Welcome back! Signed in successfully.");
        navigate("/dashboard", { replace: true });
      } else {
        throw new Error(res?.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#0F172A] p-4 relative overflow-hidden">
      {/* Subtle background ambient gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#F7931A]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-10 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#F7931A] rounded-2xl mb-4 shadow-lg shadow-[#F7931A]/30">
            <span className="font-black text-2xl text-white">N4</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">NAASHYOL Admin</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to access your administrative dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-4 pointer-events-none" />
              <Input
                type="email"
                required
                placeholder="admin@naashyol.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-4 pointer-events-none" />
              <Input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white rounded-xl text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#F7931A] hover:bg-[#E8850F] active:bg-[#D9790E] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#F7931A]/20 transition-colors border-0"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn size={16} />
                Sign In to Admin
              </span>
            )}
          </Button>
        </form>

        {/* Demo Credentials Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400 justify-center">
          <ShieldCheck size={14} className="text-[#F7931A]" />
          <span>Default: admin@naashyol.com / admin123password</span>
        </div>
      </div>
    </div>
  );
}
