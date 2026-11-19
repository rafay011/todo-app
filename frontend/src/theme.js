// Theme = light / dark / system.  Accent = one of the colors below.
// Both are set as data attributes on <html>, and the CSS does the rest.
const KEY = "todo-appearance";

export const THEMES = [
  { id: "light", label: "Light", icon: "sun" },
  { id: "dark", label: "Dark", icon: "moon" },
  { id: "system", label: "System", icon: "monitor" },
];

export const ACCENTS = [
  { id: "indigo", label: "Indigo", color: "#4f46e5" },
  { id: "emerald", label: "Emerald", color: "#0f9f6e" },
  { id: "rose", label: "Rose", color: "#e11d48" },
  { id: "amber", label: "Amber", color: "#d97706" },
  { id: "sky", label: "Sky", color: "#0284c7" },
];

export function resolveTheme(theme) {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

export function applyAppearance({ theme, accent }) {
  const root = document.documentElement;
  root.dataset.theme = resolveTheme(theme);
  root.dataset.accent = accent;
}

// Saved in the browser too, so the right look shows instantly on the next visit
export function cacheAppearance(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* storage can be blocked; the app still works */
  }
}

export function readCachedAppearance() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { theme: "system", accent: "indigo", ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { theme: "system", accent: "indigo" };
}
