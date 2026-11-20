import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Library, LogOut, Settings } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function AccountMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking elsewhere or pressing Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const fullName = (user.user_metadata?.full_name as string | undefined)?.trim();
  const name = fullName || user.email?.split("@")[0] || "Reader";
  const initial = name.charAt(0).toUpperCase();

  async function handleSignOut() {
    setOpen(false);
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
      return;
    }
    navigate("/");
  }

  return (
    <div className="account-menu" ref={ref}>
      <button
        className="avatar-button"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        title={name}
      >
        {initial}
      </button>

      {open && (
        <div className="account-dropdown" role="menu">
          <div className="account-who">
            <strong>{name}</strong>
            <span>{user.email}</span>
          </div>
          <Link role="menuitem" to="/library" onClick={() => setOpen(false)}>
            <Library size={15} /> My library
          </Link>
          <Link role="menuitem" to="/account" onClick={() => setOpen(false)}>
            <Settings size={15} /> Account settings
          </Link>
          <button role="menuitem" type="button" onClick={() => void handleSignOut()}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}