import { useEffect, useState, type FormEvent } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../../services/supabase/client";
import {
  savePostAuthRedirect,
  popPostAuthRedirect,
  markPasswordRecovery,
} from "./redirect";
import "./auth.css";

type Mode = "login" | "signup" | "forgot";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>(
    params.get("mode") === "signup" ? "signup" : "login"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const redirectTo = `${window.location.origin}/auth/callback`;

  useEffect(() => {
    savePostAuthRedirect(location.state?.from);
  }, [location.state]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo,
            data: { full_name: name.trim() },
          },
        });

        if (error) throw error;

        if (data.session) {
          navigate(popPostAuthRedirect(), { replace: true });
        } else {
          setMessage(
            "Account created. Check your email for the verification link before signing in."
          );
        }
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate(popPostAuthRedirect(), { replace: true });
      } else {
        markPasswordRecovery();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
        });
        if (error) throw error;
        setMessage("Password reset link sent. Check your email.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) setError(error.message);
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link className="auth-brand" to="/">
          LIBRIS<span>.</span>
        </Link>
        <p className="auth-eyebrow">YOUR READING LIFE, REIMAGINED</p>
        <h1>
          {mode === "signup"
            ? "Make room for stories."
            : mode === "forgot"
              ? "Get back into your account."
              : "Welcome back, reader."}
        </h1>
        <p className="auth-intro">
          Discover books, build your shelves, and keep your reading journey in
          one place.
        </p>

        <button
          className="auth-google"
          type="button"
          onClick={signInWithGoogle}
          disabled={busy}
        >
          Continue with Google
        </button>

        <div className="auth-divider"><span>or use email</span></div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "signup" && (
            <label>
              Your name
              <input
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          {mode !== "forgot" && (
            <label>
              Password
              <span className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
              {mode === "signup" && <small>Use at least 8 characters.</small>}
            </label>
          )}

          {mode === "login" && (
            <button
              className="auth-text-button"
              type="button"
              onClick={() => setMode("forgot")}
            >
              Forgot password?
            </button>
          )}

          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-message" role="status">{message}</p>}

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "signup"
                ? "Create account"
                : mode === "forgot"
                  ? "Send reset link"
                  : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "forgot" ? (
            <button
              className="auth-text-button"
              type="button"
              onClick={() => setMode("login")}
            >
              Back to sign in
            </button>
          ) : mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button
                className="auth-text-button"
                type="button"
                onClick={() => setMode("login")}
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              New to LIBRIS?{" "}
              <button
                className="auth-text-button"
                type="button"
                onClick={() => setMode("signup")}
              >
                Create an account
              </button>
            </>
          )}
        </p>
      </section>
    </main>
  );
}