import * as taskModel from '../models/taskModel.js';
import { AppError } from '../utils/errors.js';

// 404 tanto si la tarea no existe como si es de otro usuario: no se revela qué ids existen
const taskNotFound = () => new AppError('Task not found', 404, 'TASK_NOT_FOUND');

/** Cambia el estado de una tarea del usuario (la propiedad se comprueba vía su proyecto). */
export async function updateTaskStatus(userId, taskId, status) {
  const task = await taskModel.updateStatus(taskId, userId, status);
  if (!task) throw taskNotFound();
  return task;
}

/** Borra una tarea del usuario. */
export async function deleteTask(userId, taskId) {
  const deleted = await taskModel.delete(taskId, userId);
  if (!deleted) throw taskNotFound();
}
