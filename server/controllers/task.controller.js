const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  const task = await Task.create({
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  res.status(201).json(task);
};

exports.getTasksByUser = async (req, res) => {
  const tasks = await Task.findAll({ where: { userId: req.params.userId } });
  res.json(tasks);
};

exports.updateTask = async (req, res) => {
  const task = await Task.findByPk(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

  await task.update({
    ...req.body,
    updatedAt: new Date(),
  });

  res.json(task);
};

exports.deleteTask = async (req, res) => {
  const task = await Task.findByPk(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  await task.destroy();
  res.json({ message: 'Tarea eliminada' });
};