import { useEffect, useState } from "react";
import Icon from "./Icon";
import { ACCENTS, THEMES, applyAppearance } from "../theme";
import { initials } from "../utils";

export default function ProfileModal({ profile, onSave, onClose }) {
  const [draft, setDraft] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Theme and accent change the page right away, so you can see them before saving
  function change(changes) {
    const next = { ...draft, ...changes };
    setDraft(next);
    if ("theme" in changes || "accent" in changes) applyAppearance(next);
  }

  // Cancel: go back to the saved look
  function cancel() {
    applyAppearance(profile);
    onClose();
  }

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && cancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function submit(e) {
    e.preventDefault();
    if (!draft.name.trim()) {
      setError("Enter your name.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: draft.name.trim(),
        email: draft.email.trim(),
        theme: draft.theme,
        accent: draft.accent,
      });
      onClose();
    } catch {
      setError("Can't save right now. Check that the backend is running.");
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && cancel()}>
      <form className="modal" role="dialog" aria-modal="true" aria-labelledby="profile-title" onSubmit={submit}>
        <div className="modal-head">
          <span className="avatar large">{initials(draft.name)}</span>
          <h2 id="profile-title">Your profile</h2>
          <button type="button" className="icon-btn" onClick={cancel} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>

        <label className="field">
          <span>Name</span>
          <input
            className="input"
            autoFocus
            value={draft.name}
            maxLength={80}
            onChange={(e) => change({ name: e.target.value })}
          />
        </label>

        <label className="field">
          <span>Email</span>
          <input
            className="input"
            type="email"
            value={draft.email}
            maxLength={120}
            placeholder="you@example.com"
            onChange={(e) => change({ email: e.target.value })}
          />
        </label>

        <div className="field">
          <span>Theme</span>
          <div className="segmented wide" role="radiogroup" aria-label="Theme">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={draft.theme === t.id}
                className={draft.theme === t.id ? "is-on" : ""}
                onClick={() => change({ theme: t.id })}
              >
                <Icon name={t.icon} size={15} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span>Accent color</span>
          <div className="swatches" role="radiogroup" aria-label="Accent color">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={draft.accent === a.id}
                aria-label={a.label}
                title={a.label}
                className={`swatch ${draft.accent === a.id ? "is-on" : ""}`}
                style={{ "--swatch": a.color }}
                onClick={() => change({ accent: a.id })}
              />
            ))}
          </div>
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={cancel}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
