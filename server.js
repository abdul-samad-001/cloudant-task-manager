/**
 * Cloud-Powered Task Manager
 * CRUD web app backed by IBM Cloudant NoSQL Database.
 *
 * Falls back to an in-memory store automatically when Cloudant
 * credentials are not present, so the app runs locally out of the box,
 * then switches to real cloud storage once CLOUDANT_URL / CLOUDANT_APIKEY
 * are set in .env.
 */

require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_NAME = 'tasks';
const PRIORITIES = ['low', 'medium', 'high'];
const rawUrl = process.env.CLOUDANT_URL || '';
const rawKey = process.env.CLOUDANT_APIKEY || '';
const looksLikePlaceholder = rawUrl.includes('<your-instance-id>') || rawKey.includes('<your-api-key>');
const useCloudant = Boolean(rawUrl && rawKey) && !looksLikePlaceholder;

if (Boolean(rawUrl && rawKey) && looksLikePlaceholder) {
  console.warn('CLOUDANT_URL/CLOUDANT_APIKEY still look like placeholder values — falling back to in-memory storage until real Cloudant credentials are set.');
}


// Fixed IDs for sample data — makes seeding idempotent. Re-running seed
// resets these 5 documents to their default state instead of creating
// duplicates, no matter how many times the button is clicked.
const SEED_IDS = ['seed-1', 'seed-2', 'seed-3', 'seed-4', 'seed-5'];
const SEED_DATA = [
  { title: 'Register for InfyTQ certification', priority: 'high' },
  { title: 'Solve 3 DSA problems (arrays + recursion)', priority: 'high' },
  { title: 'Review DBMS normalization notes', priority: 'medium' },
  { title: 'Update resume with OCI certification', priority: 'medium' },
  { title: 'Push this project to GitHub', priority: 'low' },
];

let client;
if (useCloudant) {
  const { CloudantV1 } = require('@ibm-cloud/cloudant');
  client = CloudantV1.newInstance({});
}

// ---- In-memory fallback store (used only when Cloudant is not configured) ----
let memStore = [];
let memId = 1;
let memRev = {}; // simulate _rev bumps so the UI's revision tag behaves the same in both modes

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function normalizePriority(p) {
  return PRIORITIES.includes(p) ? p : 'medium';
}

function bumpRev(id) {
  memRev[id] = (memRev[id] || 0) + 1;
  return `${memRev[id]}-mem`;
}

async function ensureDatabaseExists() {
  if (!useCloudant) return;
  try {
    await client.getDatabaseInformation({ db: DB_NAME });
  } catch (err) {
    if (err.status === 404) {
      await client.putDatabase({ db: DB_NAME });
      console.log(`Created Cloudant database "${DB_NAME}"`);
    } else {
      throw err;
    }
  }
}

async function docCount() {
  if (!useCloudant) return memStore.length;
  const info = await client.getDatabaseInformation({ db: DB_NAME });
  return info.result.docCount;
}

// ---------------- Routes ----------------

app.get('/api/health', async (req, res) => {
  try {
    const count = await docCount();
    res.json({ status: 'ok', storage: useCloudant ? 'ibm-cloudant' : 'in-memory', db: DB_NAME, taskCount: count });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    if (useCloudant) {
      const result = await client.postAllDocs({ db: DB_NAME, includeDocs: true });
      return res.json(result.result.rows.map((row) => row.doc));
    }
    res.json(memStore);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { title, priority } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'title is required' });
  try {
    const doc = {
      title: title.trim(),
      done: false,
      priority: normalizePriority(priority),
      createdAt: new Date().toISOString(),
    };
    if (useCloudant) {
      const result = await client.postDocument({ db: DB_NAME, document: doc });
      return res.status(201).json({ _id: result.result.id, _rev: result.result.rev, ...doc });
    }
    const id = String(memId++);
    const task = { _id: id, _rev: bumpRev(id), ...doc };
    memStore.push(task);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed 5 fixed sample tasks in one request — safe to click repeatedly.
// Uses fixed document IDs and looks up current revisions first, so this
// always performs a single upsert-style bulk write (Cloudant's postBulkDocs)
// rather than creating new duplicate documents on every click.
app.post('/api/tasks/seed', async (req, res) => {
  try {
    if (useCloudant) {
      const existing = await client.postAllDocs({ db: DB_NAME, keys: SEED_IDS });
      const revMap = {};
      existing.result.rows.forEach((row) => {
        if (row.value && row.value.rev) revMap[row.id] = row.value.rev;
      });

      const docs = SEED_IDS.map((id, i) => {
        const doc = {
          _id: id,
          title: SEED_DATA[i].title,
          priority: SEED_DATA[i].priority,
          done: false,
          createdAt: new Date().toISOString(),
        };
        if (revMap[id]) doc._rev = revMap[id];
        return doc;
      });

      const result = await client.postBulkDocs({ db: DB_NAME, bulkDocs: { docs } });
      const created = docs.map((doc, i) => ({ ...doc, _rev: result.result[i].rev }));
      return res.status(200).json(created);
    }

    // In-memory: same upsert semantics — reset if present, insert if not.
    const created = SEED_IDS.map((id, i) => {
      let task = memStore.find((t) => t._id === id);
      const base = { title: SEED_DATA[i].title, priority: SEED_DATA[i].priority, done: false };
      if (task) {
        Object.assign(task, base);
        task._rev = bumpRev(id);
      } else {
        task = { _id: id, _rev: bumpRev(id), ...base, createdAt: new Date().toISOString() };
        memStore.push(task);
      }
      return task;
    });
    res.status(200).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear every task — useful for wiping out test/demo clutter.
app.delete('/api/tasks', async (req, res) => {
  try {
    if (useCloudant) {
      const all = await client.postAllDocs({ db: DB_NAME });
      const deleteDocs = all.result.rows.map((row) => ({ _id: row.id, _rev: row.value.rev, _deleted: true }));
      if (deleteDocs.length) {
        await client.postBulkDocs({ db: DB_NAME, bulkDocs: { docs: deleteDocs } });
      }
      return res.json({ deleted: deleteDocs.length });
    }
    const count = memStore.length;
    memStore = [];
    memRev = {};
    res.json({ deleted: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, done, priority } = req.body;
  try {
    if (useCloudant) {
      const existing = await client.getDocument({ db: DB_NAME, docId: id });
      const updatedDoc = {
        ...existing.result,
        title: title !== undefined ? title : existing.result.title,
        done: done !== undefined ? done : existing.result.done,
        priority: priority !== undefined ? normalizePriority(priority) : existing.result.priority,
      };
      const result = await client.putDocument({ db: DB_NAME, docId: id, document: updatedDoc });
      return res.json({ ...updatedDoc, _rev: result.result.rev });
    }
    const task = memStore.find((t) => t._id === id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (title !== undefined) task.title = title;
    if (done !== undefined) task.done = done;
    if (priority !== undefined) task.priority = normalizePriority(priority);
    task._rev = bumpRev(id);
    res.json(task);
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: 'Task not found' });
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (useCloudant) {
      const existing = await client.getDocument({ db: DB_NAME, docId: id });
      await client.deleteDocument({ db: DB_NAME, docId: id, rev: existing.result._rev });
      return res.status(204).send();
    }
    const before = memStore.length;
    memStore = memStore.filter((t) => t._id !== id);
    if (memStore.length === before) return res.status(404).json({ error: 'Task not found' });
    res.status(204).send();
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: 'Task not found' });
    res.status(500).json({ error: err.message });
  }
});

ensureDatabaseExists()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Task Manager running at http://localhost:${PORT}`);
      console.log(`Storage backend: ${useCloudant ? 'IBM Cloudant' : 'In-memory (set CLOUDANT_URL & CLOUDANT_APIKEY in .env to switch)'}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err.message);
    process.exit(1);
  });
