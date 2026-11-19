import { useCallback, useEffect, useState } from "react";
import { createTodo, deleteTodo, getTodos, updateTodo } from "../api";

export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Run an API action. If it fails, show one clear message.
  const run = useCallback(async (action) => {
    setError("");
    try {
      return await action();
    } catch {
      setError("Can't reach the server. Check that the backend is running.");
      return undefined;
    }
  }, []);

  useEffect(() => {
    run(async () => setTodos(await getTodos())).finally(() => setLoading(false));
  }, [run]);

  const add = (data) =>
    run(async () => {
      const created = await createTodo(data);
      setTodos((prev) => [...prev, created]);
      return true;
    });

  const patch = (id, changes) =>
    run(async () => {
      const updated = await updateTodo(id, changes);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    });

  const remove = (id) =>
    run(async () => {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    });

  const clearDone = () =>
    run(async () => {
      const done = todos.filter((t) => t.completed);
      await Promise.all(done.map((t) => deleteTodo(t.id)));
      setTodos((prev) => prev.filter((t) => !t.completed));
    });

  return { todos, loading, error, add, patch, remove, clearDone };
}
