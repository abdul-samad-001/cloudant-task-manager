const { client, useCloudant, DB_NAME } = require('../config/cloudant');

const PRIORITIES = ['low', 'medium', 'high'];

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

// ---- In-memory fallback store (used only when Cloudant is not configured) ----
let memStore = [];
let memId = 1;
let memRev = {}; // simulate _rev bumps so the UI's revision tag behaves the same in both modes

function normalizePriority(p) {
  return PRIORITIES.includes(p) ? p : 'medium';
}

function bumpRev(id) {
  memRev[id] = (memRev[id] || 0) + 1;
  return `${memRev[id]}-mem`;
}

async function docCount() {
  if (!useCloudant) return memStore.length;
  const info = await client.getDatabaseInformation({ db: DB_NAME });
  return info.result.docCount;
}

async function getHealth() {
  const count = await docCount();
  return {
    status: 'ok',
    storage: useCloudant ? 'ibm-cloudant' : 'in-memory',
    db: DB_NAME,
    taskCount: count,
  };
}

async function getAllTasks() {
  if (useCloudant) {
    const result = await client.postAllDocs({ db: DB_NAME, includeDocs: true });
    return result.result.rows.map((row) => row.doc);
  }
  return memStore;
}

async function createTask({ title, priority }) {
  const doc = {
    title: title.trim(),
    done: false,
    priority: normalizePriority(priority),
    createdAt: new Date().toISOString(),
  };

  if (useCloudant) {
    const result = await client.postDocument({ db: DB_NAME, document: doc });
    return { _id: result.result.id, _rev: result.result.rev, ...doc };
  }

  const id = String(memId++);
  const task = { _id: id, _rev: bumpRev(id), ...doc };
  memStore.push(task);
  return task;
}

async function seedTasks() {
  if (useCloudant) {
    const existing = await client.postAllDocs({ db: DB_NAME, keys: SEED_IDS, includeDocs: true });
    const revMap = {};
    const docMap = {};
    existing.result.rows.forEach((row) => {
      if (row.value && !row.value.deleted && row.value.rev) {
        revMap[row.id] = row.value.rev;
        docMap[row.id] = row.doc;
      }
    });

    if (SEED_IDS.every((id) => revMap[id])) {
      return { alreadySeeded: true, tasks: SEED_IDS.map((id) => docMap[id]) };
    }

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

    // If any doc hit a conflict (usually a leftover deleted-doc tombstone),
    // fall back to letting Cloudant assign it a fresh ID instead of failing silently.
    const finalTasks = [];
    for (let i = 0; i < result.result.length; i++) {
      const r = result.result[i];
      if (r.ok || r.rev) {
        finalTasks.push({ ...docs[i], _rev: r.rev });
      } else {
        const fallbackDoc = { ...docs[i] };
        delete fallbackDoc._id;
        delete fallbackDoc._rev;
        const created = await client.postDocument({ db: DB_NAME, document: fallbackDoc });
        finalTasks.push({ ...fallbackDoc, _id: created.result.id, _rev: created.result.rev });
      }
    }

    return { alreadySeeded: false, tasks: finalTasks };
  }

  // in-memory branch stays exactly as it was
  const alreadyPresent = SEED_IDS.every((id) => memStore.some((t) => t._id === id));
  if (alreadyPresent) {
    return { alreadySeeded: true, tasks: memStore.filter((t) => SEED_IDS.includes(t._id)) };
  }
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
  return { alreadySeeded: false, tasks: created };
}

async function clearAllTasks() {
  if (useCloudant) {
    const all = await client.postAllDocs({ db: DB_NAME });
    const deleteDocs = all.result.rows.map((row) => ({ _id: row.id, _rev: row.value.rev, _deleted: true }));
    if (deleteDocs.length) {
      await client.postBulkDocs({ db: DB_NAME, bulkDocs: { docs: deleteDocs } });
    }
    return { deleted: deleteDocs.length };
  }
  const count = memStore.length;
  memStore = [];
  memRev = {};
  return { deleted: count };
}

async function updateTask(id, { title, done, priority }) {
  if (useCloudant) {
    const existing = await client.getDocument({ db: DB_NAME, docId: id });
    const updatedDoc = {
      ...existing.result,
      title: title !== undefined ? title : existing.result.title,
      done: done !== undefined ? done : existing.result.done,
      priority: priority !== undefined ? normalizePriority(priority) : existing.result.priority,
    };
    const result = await client.putDocument({ db: DB_NAME, docId: id, document: updatedDoc });
    return { ...updatedDoc, _rev: result.result.rev };
  }

  const task = memStore.find((t) => t._id === id);
  if (!task) {
    const err = new Error('Task not found');
    err.status = 404;
    throw err;
  }
  if (title !== undefined) task.title = title;
  if (done !== undefined) task.done = done;
  if (priority !== undefined) task.priority = normalizePriority(priority);
  task._rev = bumpRev(id);
  return task;
}

async function deleteTask(id) {
  if (useCloudant) {
    const existing = await client.getDocument({ db: DB_NAME, docId: id });
    await client.deleteDocument({ db: DB_NAME, docId: id, rev: existing.result._rev });
    return;
  }

  const before = memStore.length;
  memStore = memStore.filter((t) => t._id !== id);
  if (memStore.length === before) {
    const err = new Error('Task not found');
    err.status = 404;
    throw err;
  }
}

module.exports = {
  PRIORITIES,
  SEED_IDS,
  normalizePriority,
  docCount,
  getHealth,
  getAllTasks,
  createTask,
  seedTasks,
  clearAllTasks,
  updateTask,
  deleteTask,
};
