# Cloud-Powered Task Manager

A CRUD web application for managing tasks, backed by **IBM Cloudant** (a managed NoSQL document database on IBM Cloud). Built with Node.js/Express on the backend and a lightweight vanilla JS frontend.

> PBEL — IBM Cloud Computing Project

## Architecture

```
Browser (HTML/CSS/JS)
        │  fetch() calls to /api/tasks
        ▼
Express server (server.js)
        │  @ibm-cloud/cloudant SDK
        ▼
IBM Cloudant NoSQL Database (cloud-hosted)
```

The server automatically falls back to an in-memory store when Cloudant credentials aren't set, so it runs locally with zero cloud setup — then switches to real cloud storage the moment you add credentials to `.env`.

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** IBM Cloudant (NoSQL, document store)
- **Frontend:** HTML, CSS, vanilla JavaScript
- **Containerization:** Docker

## Features

- Full CRUD — create, read, update (title, priority, complete), and delete tasks
- **Live sync strip** — a terminal-style status bar showing real-time connection state, active database, and document count, pulled from `/api/health`
- **Priority levels** (low/medium/high) with color-coded task borders and tags
- **Search + filter tabs** (All / Active / Completed) with live counts
- **Bulk seed endpoint** (`POST /api/tasks/seed`) — inserts 5 sample tasks in a single request using Cloudant's `postBulkDocs` API, demonstrating bulk writes rather than N separate inserts
- Each task displays a shortened document ID and revision number, directly surfacing Cloudant's document model (`_id` / `_rev`) in the UI
- Toast notifications and an inline error banner instead of silent failures
- Keyboard-accessible controls with visible focus states, responsive down to mobile
- Dockerized for consistent deployment
- Zero-config local development (fallback in-memory mode)

## Design

The interface is themed around the fact that this is a **document store**, not a spreadsheet: each task is rendered as a document with a visible id/revision, and the header status bar reads like a connection log rather than a decorative banner. Typography uses IBM Plex Sans and IBM Plex Mono — IBM's own typeface family — deliberately, since this is an IBM Cloud project.

## Setup — Run Locally (no cloud account needed)

```bash
npm install
npm start
```

Visit `http://localhost:3000`. The app runs in in-memory mode until Cloudant credentials are provided.

## Setup — Connect to IBM Cloudant

1. Go to [IBM Cloud](https://cloud.ibm.com/) and log in (free account is enough — Cloudant has a Lite plan).
2. Catalog → search **Cloudant** → create a resource (Lite plan, any region).
3. Once provisioned, open the Cloudant resource → **Service credentials** → **New credential** → create it.
4. Copy the `url` and `apikey` fields from the generated credentials.
5. Copy `.env.example` to `.env` and fill in:
   ```
   CLOUDANT_URL=https://<your-instance-id>-bluemix.cloudantnosqldb.appdomain.cloud
   CLOUDANT_APIKEY=<your-api-key>
   CLOUDANT_AUTH_TYPE=iam
   ```
6. Restart the server (`npm start`). The console will print `Storage backend: IBM Cloudant`, and the app will create a `tasks` database automatically on first run.

## Setup — Run with Docker

```bash
# Build and run (reads CLOUDANT_URL / CLOUDANT_APIKEY from .env)
docker compose up --build
```

or manually:

```bash
docker build -t cloud-task-manager .
docker run -p 3000:3000 --env-file .env cloud-task-manager
```

## API Endpoints

| Method | Route               | Description                          |
|--------|---------------------|---------------------------------------|
| GET    | `/api/health`       | Storage backend, active database, and document count |
| GET    | `/api/tasks`        | List all tasks                       |
| POST   | `/api/tasks`        | Create a task — body: `{ "title", "priority"? }` |
| POST   | `/api/tasks/seed`   | Bulk-insert 5 sample tasks (uses Cloudant's `postBulkDocs`) |
| PUT    | `/api/tasks/:id`    | Update a task — body: `{ "title"?, "done"?, "priority"? }` |
| DELETE | `/api/tasks/:id`    | Delete a task                        |

## Project Structure

```
cloud-task-manager/
├── server.js            # Express app + Cloudant integration
├── public/               # Frontend (HTML/CSS/JS)
│   ├── index.html
│   ├── style.css
│   └── app.js
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

## Notes for Submission

- Never commit your real `.env` file — `.gitignore` already excludes it. Submit `.env.example` only.
- If you'd like to include a screenshot of the working app (with the "Connected to IBM Cloudant" badge visible) in this README, add it under a `docs/` folder for extra credit.
