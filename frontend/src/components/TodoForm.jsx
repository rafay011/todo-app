import { useState } from "react";
import Icon from "./Icon";
import { PRIORITIES } from "../utils";

export default function TodoForm({ categories, onAdd }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");

  async function submit(e) {
    e.preventDefault();
    const text = title.trim();
    if (!text) return;
    const ok = await onAdd({
      title: text,
      priority,
      category: category.trim() || null,
      due_date: dueDate || null,
    });
    if (ok) {
      setTitle("");
      setPriority("medium");
      setCategory("");
      setDueDate("");
    }
  }

  return (
    <form className="composer" onSubmit={submit}>
      <div className="composer-main">
        <span className="lead-icon">
          <Icon name="plus" />
        </span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a todo"
          maxLength={200}
          aria-label="Todo title"
        />
        <button className="btn-primary" type="submit" disabled={!title.trim()}>
          Add todo
        </button>
      </div>

      <div className="composer-options">
        <div className="segmented" role="radiogroup" aria-label="Priority">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={priority === p}
              className={priority === p ? "is-on" : ""}
              onClick={() => setPriority(p)}
            >
              {p[0].toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        <input
          className="field-sm"
          type="text"
          list="category-options"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          maxLength={50}
          aria-label="Category"
        />
        <datalist id="category-options">
          {categories.map((c) => (
            <option key={c.name} value={c.name} />
          ))}
        </datalist>

        <input
          className="field-sm"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          aria-label="Due date"
        />
      </div>
    </form>
  );
}
