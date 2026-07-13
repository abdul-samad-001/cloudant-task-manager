const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const syncDot = document.getElementById('sync-dot');
const syncText = document.getElementById('sync-text');
const searchInput = document.getElementById('search-input');
const tabs = document.querySelectorAll('.tab');
const countsEl = document.getElementById('counts');
const errorBanner = document.getElementById('error-banner');
const seedBtn = document.getElementById('seed-btn');
const clearBtn = document.getElementById('clear-btn');
const priorityPills = document.querySelectorAll('.priority-pill');
const toastContainer = document.getElementById('toast-container');

let allTasks = [];
let currentFilter = 'all';
let currentSearch = '';
let selectedPriority = 'medium';

const trashIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>`;

function showToast(message, isError = false) {
  const el = document.createElement('div');
  el.className = 'toast' + (isError ? ' error' : '');
  el.textContent = message;
  toastContainer.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function showError(message) {
  errorBanner.textContent = message;
  errorBanner.hidden = false;
}
function clearError() {
  errorBanner.hidden = true;
}

async function checkStorage() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    if (data.status !== 'ok') throw new Error();
    if (data.storage === 'ibm-cloudant') {
      syncDot.className = 'dot live';
      syncText.textContent = `cloudant:connected · db=${data.db} · docs=${data.taskCount}`;
    } else {
      syncDot.className = 'dot offline';
      syncText.textContent = `local:in-memory · docs=${data.taskCount} · add CLOUDANT_URL/APIKEY to go live`;
    }
  } catch {
    syncDot.className = 'dot error';
    syncText.textContent = 'connection:unreachable';
  }
}

async function loadTasks() {
  try {
    const res = await fetch('/api/tasks');
    if (!res.ok) throw new Error('Request failed');
    allTasks = await res.json();
    clearError();
    render();
  } catch {
    showError('Could not load tasks from the server. Check that it is running and try again.');
  }
}

function shortId(id) {
  return '#' + String(id).slice(-6);
}

function render() {
  const search = currentSearch.trim().toLowerCase();

  const filtered = allTasks.filter((t) => {
    if (currentFilter === 'active' && t.done) return false;
    if (currentFilter === 'done' && !t.done) return false;
    if (search && !t.title.toLowerCase().includes(search)) return false;
    return true;
  });

  list.innerHTML = '';
  emptyState.hidden = filtered.length > 0;
  if (filtered.length === 0) {
    if (allTasks.length === 0) {
      emptyState.querySelector('p:first-child').innerHTML = '<strong>No tasks logged yet.</strong>';
      emptyState.querySelector('p:last-child').textContent = "Add one below — it's written straight to Cloudant as a JSON document.";
    } 
    else {
      emptyState.querySelector('p:first-child').innerHTML = '<strong>Nothing matches this filter.</strong>';
      emptyState.querySelector('p:last-child').textContent = 'Try a different tab, or clear your search.';
    }
  }

  const activeCount = allTasks.filter((t) => !t.done).length;
  countsEl.textContent = allTasks.length
    ? `${allTasks.length} total · ${activeCount} active · ${allTasks.length - activeCount} completed`
    : '';

  filtered
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach((task) => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.done ? ' done' : '');
      li.dataset.priority = task.priority || 'medium';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = !!task.done;
      checkbox.setAttribute('aria-label', `Mark "${task.title}" as ${task.done ? 'active' : 'complete'}`);
      checkbox.addEventListener('change', () => toggleTask(task._id, checkbox.checked));

      const main = document.createElement('div');
      main.className = 'task-main';

      const title = document.createElement('span');
      title.className = 'task-title';
      title.textContent = task.title;

      const meta = document.createElement('div');
      meta.className = 'task-meta';
      meta.innerHTML = `<span>${shortId(task._id)}</span><span>${task._rev ? 'rev ' + task._rev.split('-')[0] : ''}</span>`;

      main.append(title, meta);

      const tag = document.createElement('span');
      tag.className = 'priority-tag';
      tag.textContent = task.priority || 'medium';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerHTML = trashIcon;
      deleteBtn.setAttribute('aria-label', `Delete "${task.title}"`);
      deleteBtn.addEventListener('click', () => deleteTask(task._id, task.title));

      li.append(checkbox, main, tag, deleteBtn);
      list.appendChild(li);
    });
}

async function addTask(title, priority) {
  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, priority }),
    });
    if (!res.ok) throw new Error();
    clearError();
    showToast('Task added');
    await loadTasks();
    await checkStorage();
  } catch {
    showError('Could not add the task. Try again.');
  }
}

async function toggleTask(id, done) {
  try {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done }),
    });
    if (!res.ok) throw new Error();
    await loadTasks();
  } catch {
    showError('Could not update the task.');
  }
}

async function deleteTask(id, title) {
  try {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    showToast(`Deleted "${title}"`);
    await loadTasks();
    await checkStorage();
  } catch {
    showError('Could not delete the task.');
  }
}

async function seedTasks() {
  seedBtn.disabled = true;
  seedBtn.textContent = 'Seeding…';
  try {
    const res = await fetch('/api/tasks/seed', { method: 'POST' });
    if (!res.ok) throw new Error();
    showToast('Sample data seeded (5 tasks) — safe to click again, it won\'t duplicate');
    await loadTasks();
    await checkStorage();
  } catch {
    showError('Could not seed sample data.');
  } finally {
    seedBtn.disabled = false;
    seedBtn.textContent = '+ Seed sample data';
  }
}

async function clearAllTasks() {
  if (!confirm('Delete every task? This cannot be undone.')) return;
  clearBtn.disabled = true;
  try {
    const res = await fetch('/api/tasks', { method: 'DELETE' });
    if (!res.ok) throw new Error();
    const data = await res.json();
    showToast(`Cleared ${data.deleted} task(s)`);
    await loadTasks();
    await checkStorage();
  } catch {
    showError('Could not clear tasks.');
  } finally {
    clearBtn.disabled = false;
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  addTask(title, selectedPriority);
  input.value = '';
});

priorityPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    priorityPills.forEach((p) => { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
    pill.classList.add('active');
    pill.setAttribute('aria-pressed', 'true');
    selectedPriority = pill.dataset.priority;
  });
});

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    currentFilter = tab.dataset.filter;
    render();
  });
});

searchInput.addEventListener('input', (e) => {
  currentSearch = e.target.value;
  render();
});

seedBtn.addEventListener('click', seedTasks);
clearBtn.addEventListener('click', clearAllTasks);

checkStorage();
loadTasks();
