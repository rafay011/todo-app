import { useState } from "react";
import Icon from "./Icon";
import { NEXT_PRIORITY, describeDue } from "../utils";

export default function TodoItem({ todo, onPatch, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.title);

  const due = describeDue(todo.due_date, todo.completed);

  function startEdit() {
    setText(todo.title);
    setEditing(true);
  }

  function saveEdit() {
    const value = text.trim();
    setEditing(false);
    if (value && value !== todo.title) onPatch(todo.id, { title: value });
  }

  return (
    <li className={`todo ${todo.completed ? "is-done" : ""}`}>
      <button
        className="check"
        role="checkbox"
        aria-checked={todo.completed}
        aria-label={`${todo.completed ? "Mark as to do" : "Mark as done"}: ${todo.title}`}
        onClick={() => onPatch(todo.id, { completed: !todo.completed })}
      >
        {todo.completed && <Icon name="check" size={14} />}
      </button>

      <div className="todo-body">
        {editing ? (
          <input
            className="edit"
            autoFocus
            value={text}
            maxLength={200}
            aria-label="Edit todo title"
            onChange={(e) => setText(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") setEditing(false);
            }}
          />
        ) : (
          <span className="todo-title" onDoubleClick={startEdit}>
            {todo.title}
          </span>
        )}

        {(todo.category || due) && (
          <div className="meta">
            {todo.category && <span className="tag">{todo.category}</span>}
            {due && (
              <span className={`due ${due.tone}`}>
                <Icon name="calendar" size={13} />
                {due.label}
              </span>
            )}
          </div>
        )}
      </div>

      <button
        className={`priority p-${todo.priority}`}
        onClick={() => onPatch(todo.id, { priority: NEXT_PRIORITY[todo.priority] })}
        title="Click to change priority"
        aria-label={`Priority ${todo.priority}. Click to change.`}
      >
        <span className="dot" />
        {todo.priority}
      </button>

      <div className="row-actions">
        <button className="icon-btn" onClick={startEdit} aria-label={`Edit: ${todo.title}`} title="Edit">
          <Icon name="pencil" size={16} />
        </button>
        <button
          className="icon-btn danger"
          onClick={() => onDelete(todo.id)}
          aria-label={`Delete: ${todo.title}`}
          title="Delete"
        >
          <Icon name="trash" size={16} />
        </button>
      </div>
    </li>
  );
}
