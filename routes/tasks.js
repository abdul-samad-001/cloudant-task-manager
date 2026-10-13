const express = require('express');
const router = express.Router();
const taskService = require('../services/taskService');

const PRIORITIES = taskService.PRIORITIES;

// Health check endpoint
router.get('/health', async (req, res, next) => {
  try {
    const health = await taskService.getHealth();
    res.json(health);
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// List all tasks
router.get(['/tasks', '/'], async (req, res, next) => {
  try {
    const tasks = await taskService.getAllTasks();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// Create a task
router.post(['/tasks', '/'], async (req, res, next) => {
  const { title, priority } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  try {
    const task = await taskService.createTask({ title, priority });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// Seed sample tasks (idempotent)
router.post(['/tasks/seed', '/seed'], async (req, res, next) => {
  try {
    const result = await taskService.seedTasks();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// Clear all tasks
router.delete(['/tasks', '/'], async (req, res, next) => {
  try {
    const result = await taskService.clearAllTasks();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Update a task
router.put(['/tasks/:id', '/:id'], async (req, res, next) => {
  const { id } = req.params;
  const { title, done, priority } = req.body;

  if (
    title !== undefined &&
    (typeof title !== 'string' || !title.trim())
  ) {
    return res.status(400).json({
      error: 'Title must be a non-empty string',
    });
  }

  if (title !== undefined && title.trim().length > 200) {
    return res.status(400).json({
      error: 'Title must be 200 characters or fewer',
    });
  }

  if (done !== undefined && typeof done !== 'boolean') {
    return res.status(400).json({
      error: 'Done must be a boolean',
    });
  }

  if (
    priority !== undefined &&
    !PRIORITIES.includes(priority)
  ) {
    return res.status(400).json({
      error: 'Priority must be low, medium, or high',
    });
  }

  try {
    const updated = await taskService.updateTask(id, { title, done, priority });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete a single task
router.delete(['/tasks/:id', '/:id'], async (req, res, next) => {
  const { id } = req.params;
  try {
    await taskService.deleteTask(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
