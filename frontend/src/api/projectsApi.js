import { apiRequest } from './client.js';

// Contrato: backend/src/routes/projects.js y controllers/projectController.js

/** GET /projects → { projects: [{ ...project, total_tasks, completed_tasks, progress }] } */
export function listProjects({ signal } = {}) {
  return apiRequest('/projects', { signal });
}

/** GET /projects/:id → { project, tasks } (404 si no existe o es de otro usuario) */
export function getProject(id, { signal } = {}) {
  return apiRequest(`/projects/${encodeURIComponent(id)}`, { signal });
}

/** POST /projects → 201 { project, tasks }. La IA genera las tareas (puede tardar varios segundos). */
export function createProject({ title, description }) {
  return apiRequest('/projects', { method: 'POST', body: { title, description } });
}

/** PATCH /projects/:id → { project } */
export function updateProjectStatus(id, status) {
  return apiRequest(`/projects/${encodeURIComponent(id)}`, { method: 'PATCH', body: { status } });
}
