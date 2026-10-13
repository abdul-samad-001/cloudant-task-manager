import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  fetchHealth,
  fetchTasks,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
  seedTasksApi,
  clearAllTasksApi,
} from './api/taskApi';
import SyncStrip from './components/SyncStrip';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import Toolbar from './components/Toolbar';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import EditModal from './components/EditModal';
import DocExplorerModal from './components/DocExplorerModal';
import Toast from './components/Toast';

const PRIORITY_ORDER = { high: 1, medium: 2, low: 3 };

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [exploringTask, setExploringTask] = useState(null);
  const [errorBanner, setErrorBanner] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const data = await fetchHealth();
      setHealth(data);
      setHealthError(false);
    } catch {
      setHealth(null);
      setHealthError(true);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
      setErrorBanner(null);
    } catch {
      setErrorBanner('Could not load tasks from the server. Check that it is running and try again.');
    }
  }, []);

  const refreshAll = useCallback(
    async ({ refreshStorage = false } = {}) => {
      await loadTasks();
      if (refreshStorage) {
        await checkHealth();
      }
    },
    [loadTasks, checkHealth]
  );

  useEffect(() => {
    checkHealth();
    loadTasks();
  }, [checkHealth, loadTasks]);

  // Derived statistics (handles both done and completed boolean fields)
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => Boolean(t.done ?? t.completed)).length;
    const active = total - completed;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, active, completed, progress };
  }, [tasks]);

  // Filter, search, and sort (incomplete first, then by priority High -> Medium -> Low)
  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter((task) => {
      const isDone = Boolean(task.done ?? task.completed);
      if (filter === 'active' && isDone) return false;
      if (filter === 'done' && !isDone) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = (task.title || '').toLowerCase().includes(query);
        const matchesId = (task._id || '').toLowerCase().includes(query);
        const matchesPriority = (task.priority || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesId && !matchesPriority) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      const aDone = Boolean(a.done ?? a.completed);
      const bDone = Boolean(b.done ?? b.completed);
      if (aDone !== bDone) {
        return aDone ? 1 : -1;
      }

      const aPri = PRIORITY_ORDER[a.priority?.toLowerCase()] || 2;
      const bPri = PRIORITY_ORDER[b.priority?.toLowerCase()] || 2;
      if (aPri !== bPri) {
        return aPri - bPri;
      }

      return 0;
    });
  }, [tasks, filter, search]);

  // Handlers
  const handleAddTask = async (title, priority) => {
    try {
      await createTaskApi({ title, priority });
      setErrorBanner(null);
      showToast('Task added');
      await refreshAll({ refreshStorage: true });
    } catch {
      setErrorBanner('Could not add the task. Try again.');
    }
  };

  const handleToggleTask = async (id, done) => {
    try {
      await updateTaskApi(id, { done });
      await refreshAll({ refreshStorage: false });
    } catch {
      setErrorBanner('Could not update the task.');
    }
  };

  const handleDeleteTask = async (id, title) => {
    try {
      await deleteTaskApi(id);
      showToast(`Deleted "${title}"`);
      await refreshAll({ refreshStorage: true });
    } catch {
      setErrorBanner('Could not delete the task.');
    }
  };

  const handleSaveEdit = async (updatedTask) => {
    const original = tasks.find((t) => t._id === updatedTask._id);
    if (!original) return;

    if (
      updatedTask.title === original.title &&
      updatedTask.priority === original.priority
    ) {
      return;
    }

    const updates = {};
    if (updatedTask.title !== original.title) updates.title = updatedTask.title;
    if (updatedTask.priority !== original.priority) updates.priority = updatedTask.priority;

    try {
      await updateTaskApi(updatedTask._id, updates);
      showToast('Task updated successfully');
      await refreshAll({ refreshStorage: true });
    } catch (err) {
      setErrorBanner(err.message || 'Could not update the task.');
      throw err;
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const data = await seedTasksApi();
      showToast(
        data.alreadySeeded
          ? 'Sample data already present — nothing changed'
          : 'Sample data seeded (5 tasks)'
      );
      await refreshAll({ refreshStorage: true });
    } catch {
      setErrorBanner('Could not seed sample data.');
    } finally {
      setSeeding(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete every task? This cannot be undone.')) return;
    setClearing(true);
    try {
      const data = await clearAllTasksApi();
      showToast(`Cleared ${data.deleted} task(s)`);
      await refreshAll({ refreshStorage: true });
    } catch {
      setErrorBanner('Could not clear tasks.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper font-sans text-ink flex flex-col items-center py-6 sm:py-9 px-3 sm:px-6">
      <div className="w-full max-w-[640px]">
        {/* Live Storage Connection Strip */}
        <SyncStrip health={health} isError={healthError} />

        {/* Main Application Card */}
        <main className="bg-card rounded-b-xl border-x border-b border-line p-4.5 sm:p-6 shadow-[0_1px_3px_rgba(24,36,32,0.04),0_6px_16px_rgba(24,36,32,0.04)]">
          <Header
            onSeed={handleSeed}
            onClearAll={handleClearAll}
            isSeeding={seeding}
            isClearing={clearing}
          />

          {errorBanner && (
            <div
              className="text-[13px] font-medium bg-danger-tint text-danger border border-[#F0C7BA] rounded-lg px-3.5 py-2.5 mb-4 leading-normal"
              role="alert"
            >
              {errorBanner}
            </div>
          )}

          <StatsBar
            total={stats.total}
            active={stats.active}
            completed={stats.completed}
            progress={stats.progress}
          />

          <Toolbar
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            filteredCount={filteredTasks.length}
            totalCount={tasks.length}
          />

          <TaskList
            tasks={filteredTasks}
            totalTasksCount={tasks.length}
            searchQuery={search}
            onToggle={handleToggleTask}
            onDelete={handleDeleteTask}
            onEdit={setEditingTask}
            onExplore={setExploringTask}
          />

          <TaskForm onAddTask={handleAddTask} />
        </main>

        <p className="text-center font-mono text-[10.5px] text-[#8B958F] mt-4 leading-relaxed">
          Backend: Node.js/Express &nbsp;·&nbsp; Database: IBM Cloudant (NoSQL) &nbsp;·&nbsp; Container-ready via Docker
        </p>
      </div>

      <EditModal
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEdit}
      />

      <DocExplorerModal
        task={exploringTask}
        isOpen={Boolean(exploringTask)}
        onClose={() => setExploringTask(null)}
        dbName={health?.db || 'tasks'}
        storageMode={health?.storage || 'ibm-cloudant'}
      />

      <Toast toasts={toasts} />
    </div>
  );
}
