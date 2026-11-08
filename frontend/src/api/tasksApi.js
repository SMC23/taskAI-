import { apiRequest } from './client.js';

// Contrato: backend/src/routes/tasks.js y controllers/taskController.js

/** PATCH /tasks/:id → { task } */
export function updateTaskStatus(id, status) {
  return apiRequest(`/tasks/${encodeURIComponent(id)}`, { method: 'PATCH', body: { status } });
}

/** DELETE /tasks/:id → 204 sin contenido */
export function deleteTask(id) {
  return apiRequest(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
