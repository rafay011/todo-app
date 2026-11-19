# Todo App

A simple full-stack todo app.

| Part     | Tech                    | How it runs                       |
| -------- | ----------------------- | --------------------------------- |
| Backend  | FastAPI (Python)        | Built from `backend/Dockerfile`   |
| Frontend | React (Vite) + nginx    | Built from `frontend/Dockerfile`  |
| Database | PostgreSQL 16           | Runs from the `postgres` image    |

The frontend talks to the backend with a **REST API**.

## Features

- **Todos** with a priority (low, medium, high), a category and a due date
- **Organize**: filter by view (all, to do, done) or category, search, and sort (newest, due date, priority)
- **Overdue and due-today** dates are highlighted
- **Profile**: name, email and an avatar, saved in the database
- **Themes**: light, dark or system, plus 5 accent colors. A quick sun/moon button switches light and dark.
- Works on phones and respects the device's light/dark setting

## Run everything

You need Docker and Docker Compose installed.

```bash
cp .env.example .env      # optional: change the database password
docker compose up --build
```

Then open:

- App: <http://localhost:3000>
- API docs (Swagger): <http://localhost:8000/docs>

Stop with `Ctrl+C`, or `docker compose down`.
To also delete the database data: `docker compose down -v`.

## REST API

| Method | URL               | What it does                               | Success code |
| ------ | ----------------- | ------------------------------------------ | ------------ |
| GET    | `/api/health`     | Check the server is up                     | 200          |
| GET    | `/api/todos`      | List all todos                             | 200          |
| POST   | `/api/todos`      | Create a todo                              | 201          |
| GET    | `/api/todos/{id}` | Get one todo                               | 200          |
| PUT    | `/api/todos/{id}` | Update any field (send only what changed)  | 200          |
| DELETE | `/api/todos/{id}` | Delete a todo                              | 204          |
| GET    | `/api/profile`    | Get the profile (name, email, theme, accent) | 200        |
| PUT    | `/api/profile`    | Update the profile                         | 200          |

A todo has: `title`, `completed`, `priority` (`low`, `medium`, `high`), `category` (text or null) and `due_date` (`YYYY-MM-DD` or null).
A profile has: `name`, `email`, `theme` (`light`, `dark`, `system`) and `accent` (`indigo`, `emerald`, `rose`, `amber`, `sky`).

Missing todo → `404`. Bad input (for example an empty title or a wrong priority) → `422`.

**Upgrading from the first version:** the backend adds the new todo columns to an existing table by itself when it starts, so your old todos are kept.

Try it with curl:

```bash
# create
curl -X POST localhost:8000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy milk", "priority": "high", "category": "Home", "due_date": "2026-12-01"}'

# list
curl localhost:8000/api/todos

# mark as done
curl -X PUT localhost:8000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# delete
curl -X DELETE localhost:8000/api/todos/1
```

## Project structure

```
todo-app/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py       # routes (the REST API)
│       ├── models.py     # database tables (todos, profiles)
│       ├── schemas.py    # request/response shapes and checks
│       └── database.py   # database connection + small migration
└── frontend/
    ├── Dockerfile        # build with node, serve with nginx
    ├── nginx.conf        # sends /api/* to the backend
    └── src/
        ├── App.jsx       # page: puts the parts together
        ├── api.js        # all fetch calls
        ├── theme.js      # light/dark/system + accent colors
        ├── utils.js      # dates, initials, greeting
        ├── hooks/        # useTodos, useProfile (data + logic)
        ├── components/   # Sidebar, TodoForm, TodoItem, ProfileModal, Icon
        └── styles/       # theme.css (colors), layout.css, components.css
```

## Run without Docker (for development)

```bash
# 1. database only
docker run -d --name todo-db -p 5432:5432 \
  -e POSTGRES_USER=todo -e POSTGRES_PASSWORD=todo -e POSTGRES_DB=tododb \
  postgres:16-alpine

# 2. backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# 3. frontend (new terminal)
cd frontend
npm install
npm run dev          # http://localhost:5173
```

## How the pieces connect

- The browser only talks to **nginx** (port 3000).
- nginx serves the React files, and forwards `/api/*` to the **backend**.
- The backend reads and writes the **database** using `DATABASE_URL`.
- Inside Docker, containers reach each other by service name (`db`, `backend`).
