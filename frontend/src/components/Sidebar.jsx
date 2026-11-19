import Icon from "./Icon";
import { initials } from "../utils";

const VIEWS = [
  { id: "all", label: "All todos", icon: "list" },
  { id: "active", label: "To do", icon: "circle" },
  { id: "done", label: "Done", icon: "check-circle" },
];

export default function Sidebar({
  profile,
  counts,
  view,
  onView,
  categories,
  category,
  onCategory,
  onEditProfile,
}) {
  const percent = counts.all ? Math.round((counts.done / counts.all) * 100) : 0;

  return (
    <aside className="sidebar">
      <button className="profile" onClick={onEditProfile} aria-label="Edit profile">
        <span className="avatar">{initials(profile.name)}</span>
        <span className="profile-text">
          <strong>{profile.name}</strong>
          <small>{profile.email || "Add your email"}</small>
        </span>
        <Icon name="pencil" size={15} />
      </button>

      <nav className="nav" aria-label="Views">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            className={`nav-item ${view === v.id ? "is-active" : ""}`}
            onClick={() => onView(v.id)}
            aria-current={view === v.id ? "page" : undefined}
          >
            <Icon name={v.icon} />
            <span>{v.label}</span>
            <em>{counts[v.id]}</em>
          </button>
        ))}
      </nav>

      {categories.length > 0 && (
        <nav className="nav" aria-label="Categories">
          <p className="side-title">Categories</p>
          {categories.map((c) => (
            <button
              key={c.name}
              className={`nav-item ${category === c.name ? "is-active" : ""}`}
              onClick={() => onCategory(category === c.name ? null : c.name)}
              aria-pressed={category === c.name}
            >
              <Icon name="tag" />
              <span>{c.name}</span>
              <em>{c.count}</em>
            </button>
          ))}
        </nav>
      )}

      <div className="progress">
        <div className="progress-head">
          <span>Progress</span>
          <strong>{percent}%</strong>
        </div>
        <div className="bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${percent}%` }} />
        </div>
        <small>
          {counts.done} of {counts.all} done
        </small>
      </div>
    </aside>
  );
}
