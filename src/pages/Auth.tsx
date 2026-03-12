import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "login" | "signup";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) {
      toast({ title: "Missing fields", description: "Email and password are required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Welcome back", description: "You are signed in." });
        navigate("/community");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, organization, role: "community_user" },
        },
      });
      if (error) {
        toast({ title: "Sign-up failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Check your inbox", description: "Confirm the link to finish signing up." });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <main className="pt-32 pb-16 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="bg-background border border-border rounded-3xl p-8 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Community Auth</p>
              <h1 className="font-display text-4xl font-bold">{mode === "login" ? "Login" : "Sign Up"}</h1>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  mode === "login" ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  mode === "signup" ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="px-4 py-3 border border-border bg-background rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
                <input
                  type="text"
                  placeholder="Organization"
                  value={organization}
                  onChange={(event) => setOrganization(event.target.value)}
                  className="px-4 py-3 border border-border bg-background rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-4 py-3 border border-border bg-background rounded-xl focus:outline-none focus:border-primary transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-3 border border-border bg-background rounded-xl focus:outline-none focus:border-primary transition-colors"
            />
            <button type="submit" className="w-full btn-squared-primary py-3" disabled={loading}>
              {loading ? "Working..." : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
          <p className="text-xs text-muted-foreground">
            Your profile and calculator history stay tied to your GreenLens account. Return to the navigation to continue once signed in.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthPage;
