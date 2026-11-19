export const PRIORITIES = ["low", "medium", "high"];
export const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
export const NEXT_PRIORITY = { low: "medium", medium: "high", high: "low" };

export function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function greeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// Today as YYYY-MM-DD in the user's own time zone
export function todayISO() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export function describeDue(iso, completed) {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00`);
  const today = new Date(`${todayISO()}T00:00:00`);
  const diff = Math.round((date - today) / 86400000);

  let label;
  if (diff === 0) label = "Today";
  else if (diff === 1) label = "Tomorrow";
  else if (diff === -1) label = "Yesterday";
  else label = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  let tone = "";
  if (!completed) {
    if (diff < 0) tone = "overdue";
    else if (diff === 0) tone = "today";
  }
  return { label, tone };
}
