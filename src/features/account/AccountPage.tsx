import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase/client";
import { useAuth } from "../auth/AuthContext";
import { STATUSES, STATUS_LABELS, type Status } from "../library/books";
import "../auth/auth.css";

export default function AccountPage({
  statuses,
}: {
  statuses: Record<string, Status>;
}) {
  const { user } = useAuth();
  const [name, setName] = useState(
    ((user?.user_metadata?.full_name as string | undefined) ?? "").trim(),
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function saveName(event: FormEvent) {
    event.preventDefault();
    const clean = name.trim();
    if (!clean) {
      setError("Please enter a name.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");

    const { error: updateError } = await supabase.auth.updateUser({
      data: { full_name: clean },
    });
    setBusy(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setMessage("Your name has been updated.");
  }

  const counts = STATUSES.map((status) => ({
    status,
    total: Object.values(statuses).filter((value) => value === status).length,
  }));
  const totalBooks = Object.keys(statuses).length;

  return (
    <main className="page-gutter account-page">
      <p className="eyebrow">YOUR ACCOUNT</p>
      <h1>Account <em>settings.</em></h1>

      <section className="account-card">
        <h2>Profile</h2>
        <form className="auth-form" onSubmit={saveName}>
          <label>
            Display name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              autoComplete="name"
              required
            />
          </label>
          <label>
            Email
            <input value={user?.email ?? ""} readOnly aria-readonly="true" />
            <small>Your email is used to sign in and can't be changed here.</small>
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-message" role="status">{message}</p>}
          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>

      <section className="account-card">
        <h2>Your reading</h2>
        {totalBooks ? (
          <div className="account-stats">
            {counts.map(({ status, total }) => (
              <div key={status} className="account-stat">
                <strong>{total}</strong>
                <span>{STATUS_LABELS[status]}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="account-note">
            No books on your shelf yet. <Link to="/discover">Find your first book.</Link>
          </p>
        )}
      </section>

      <section className="account-card">
        <h2>Security</h2>
        <p className="account-note">
          Choose a new password for your account.
        </p>
        <Link className="button-secondary" to="/auth/update-password">
          Change password
        </Link>
      </section>
    </main>
  );
}