import * as projectService from '../services/projectService.js';

// La validación del body la hace el middleware validate() en la ruta.

/** POST /api/projects → 201 { project, tasks } */
export async function create(req, res) {
  const { project, tasks } = await projectService.createProject(req.userId, req.body);
  res.status(201).json({ project, tasks });
}

/** GET /api/projects → 200 { projects } */
export async function getAll(req, res) {
  const projects = await projectService.getUserProjects(req.userId);
  res.json({ projects });
}

/** GET /api/projects/:id → 200 { project, tasks } */
export async function getOne(req, res) {
  const { project, tasks } = await projectService.getProjectById(req.userId, req.params.id);
  res.json({ project, tasks });
}
