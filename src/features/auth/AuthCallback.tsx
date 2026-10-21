import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase/client";
import { popPostAuthRedirect, consumePasswordRecovery } from "./redirect";
import "./auth.css";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function finishAuth() {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const hashError = hash.get("error_description");
      if (hashError) {
        if (!cancelled) setError(hashError);
        return;
      }
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const next = url.searchParams.get("next");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          // StrictMode runs effects twice in dev; if a session exists, carry on.
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            if (!cancelled) setError(error.message);
            return;
          }
        }
      }

      if (cancelled) return;

      const isRecovery = consumePasswordRecovery();
      if (isRecovery || next === "/auth/update-password") {
        navigate("/auth/update-password", { replace: true });
      } else {
        navigate(popPostAuthRedirect(), { replace: true });
      }

      if (next === "/auth/update-password") {
        navigate(next, { replace: true });
      } else {
        navigate(popPostAuthRedirect(), { replace: true });
      }
    }

    void finishAuth();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <h1>{error ? "Link could not be verified" : "Verifying your link…"}</h1>
        {error && <p className="auth-error">{error}</p>}
        {error && <Link to="/auth">Return to LIBRIS sign in</Link>}
      </section>
    </main>
  );
}