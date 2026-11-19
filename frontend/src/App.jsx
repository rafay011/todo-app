import { useEffect, useMemo, useState } from "react";
import Icon from "./components/Icon";
import ProfileModal from "./components/ProfileModal";
import Sidebar from "./components/Sidebar";
import TodoForm from "./components/TodoForm";
import TodoItem from "./components/TodoItem";
import { useProfile } from "./hooks/useProfile";
import { useTodos } from "./hooks/useTodos";
import { resolveTheme } from "./theme";
import { PRIORITY_RANK, greeting } from "./utils";

const SORTS = [
  { id: "newest", label: "Newest first" },
  { id: "due", label: "Due date" },
  { id: "priority", label: "Priority" },
];

function compare(sort) {
  return (a, b) => {
    // Finished todos always go to the bottom
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (sort === "due") {
      if (a.due_date !== b.due_date) {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date < b.due_date ? -1 : 1;
      }
    }
    if (sort === "priority") {
      const diff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (diff !== 0) return diff;
    }
    return b.id - a.id;
  };
}

export default function App() {
  const { profile, save } = useProfile();
  const { todos, loading, error, add, patch, remove, clearDone } = useTodos();

  const [view, setView] = useState("all");
  const [category, setCategory] = useState(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [profileOpen, setProfileOpen] = useState(false);

  const counts = useMemo(() => {
    const done = todos.filter((t) => t.completed).length;
    return { all: todos.length, active: todos.length - done, done };
  }, [todos]);

  const categories = useMemo(() => {
    const map = new Map();
    todos.forEach((t) => t.category && map.set(t.category, (map.get(t.category) || 0) + 1));
    return [...map].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
  }, [todos]);

  // If the selected category has no todos left, go back to showing everything
  useEffect(() => {
    if (category && !categories.some((c) => c.name === category)) setCategory(null);
  }, [categories, category]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return todos
      .filter((t) => (view === "active" ? !t.completed : view === "done" ? t.completed : true))
      .filter((t) => !category || t.category === category)
      .filter((t) => !q || t.title.toLowerCase().includes(q) || (t.category || "").toLowerCase().includes(q))
      .sort(compare(sort));
  }, [todos, view, category, query, sort]);

  const isDark = resolveTheme(profile.theme) === "dark";
  const firstName = profile.name.trim().split(/\s+/)[0];
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const filtering = view !== "all" || category || query.trim();

  return (
    <div className="shell">
      <Sidebar
        profile={profile}
        counts={counts}
        view={view}
        onView={setView}
        categories={categories}
        category={category}
        onCategory={setCategory}
        onEditProfile={() => setProfileOpen(true)}
      />

      <main className="main">
        <header className="page-head">
          <div>
            <h1>
              {greeting()}, {firstName}
            </h1>
            <p>
              {today}
              {counts.all > 0 && (counts.active === 0 ? " · Everything is done" : ` · ${counts.active} to do`)}
            </p>
          </div>
          <button
            className="icon-btn round"
            onClick={() => save({ theme: isDark ? "light" : "dark" }).catch(() => {})}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
          >
            <Icon name={isDark ? "sun" : "moon"} />
          </button>
        </header>

        <TodoForm categories={categories} onAdd={add} />

        {error && (
          <div className="banner-error" role="alert">
            {error}
          </div>
        )}

        <div className="toolbar">
          <label className="search">
            <Icon name="search" size={16} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search todos"
              aria-label="Search todos"
            />
          </label>
          <select className="field-sm" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort todos">
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="empty">Loading…</p>
        ) : visible.length === 0 ? (
          <div className="empty">
            <strong>{filtering ? "No todos match" : "No todos yet"}</strong>
            <p>{filtering ? "Try a different view, category or search." : "Add your first todo above."}</p>
          </div>
        ) : (
          <ul className="list">
            {visible.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onPatch={patch} onDelete={remove} />
            ))}
          </ul>
        )}

        <div className="list-foot">
          <span>Double-click a title to edit it</span>
          {counts.done > 0 && (
            <button className="link-btn" onClick={clearDone}>
              Clear {counts.done} done
            </button>
          )}
        </div>
      </main>

      {profileOpen && (
        <ProfileModal profile={profile} onSave={save} onClose={() => setProfileOpen(false)} />
      )}
    </div>
  );
}
