// All calls to the REST API live here.
// We use relative URLs, so it works in dev (Vite proxy) and in Docker (nginx proxy).
const TODOS = "/api/todos";
const PROFILE = "/api/profile";

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  // DELETE returns 204 No Content, so there is no JSON to read
  return res.status === 204 ? null : res.json();
}

const send = (method, body) => ({ method, body: JSON.stringify(body) });

// Todos
export const getTodos = () => request(TODOS);
export const createTodo = (data) => request(TODOS, send("POST", data));
export const updateTodo = (id, changes) => request(`${TODOS}/${id}`, send("PUT", changes));
export const deleteTodo = (id) => request(`${TODOS}/${id}`, { method: "DELETE" });

// Profile
export const getProfile = () => request(PROFILE);
export const updateProfile = (changes) => request(PROFILE, send("PUT", changes));
