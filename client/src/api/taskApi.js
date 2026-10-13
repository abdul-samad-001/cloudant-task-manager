/**
 * REST API client for Cloud-Powered Task Manager
 * Communicates with the Express backend via relative /api paths.
 */

export async function fetchHealth() {
  const res = await fetch('/api/health');
  if (!res.ok) {
    throw new Error('Health check failed');
  }
  const data = await res.json();
  if (data.status !== 'ok') {
    throw new Error(data.error || 'Health check failed');
  }
  return data;
}

export async function fetchTasks() {
  const res = await fetch('/api/tasks');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load tasks');
  }
  return res.json();
}

export async function createTaskApi({ title, priority }) {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, priority }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Could not add the task.');
  }
  return res.json();
}

export async function updateTaskApi(id, updates) {
  const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Could not update task');
  }
  return res.json();
}

export async function deleteTaskApi(id) {
  const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Could not delete the task.');
  }
}

export async function seedTasksApi() {
  const res = await fetch('/api/tasks/seed', {
    method: 'POST',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Could not seed sample data.');
  }
  return res.json();
}

export async function clearAllTasksApi() {
  const res = await fetch('/api/tasks', {
    method: 'DELETE',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Could not clear tasks.');
  }
  return res.json();
}
