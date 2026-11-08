import * as taskService from '../services/taskService.js';

// La validación del id y del body la hace el middleware validate() en la ruta.

/** PATCH /api/tasks/:id → 200 { task } */
export async function updateStatus(req, res) {
  const task = await taskService.updateTaskStatus(req.userId, req.params.id, req.body.status);
  res.json({ task });
}

/** DELETE /api/tasks/:id → 204 sin contenido */
export async function remove(req, res) {
  await taskService.deleteTask(req.userId, req.params.id);
  res.status(204).end();
}
