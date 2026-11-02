import { randomUUID } from 'node:crypto';
import { withTransaction } from '../config/database.js';
import * as projectModel from '../models/projectModel.js';
import * as taskModel from '../models/taskModel.js';
import * as taskGenerator from './ai/taskGenerator.js';
import { AppError } from '../utils/errors.js';

const progressOf = (total, completed) => (total > 0 ? Math.round((completed / total) * 100) : 0);

/**
 * Crea un proyecto con sus tareas generadas por la IA. Todo o nada: si la IA
 * falla o devuelve tareas inválidas, el proyecto NO se guarda.
 *
 * La llamada a Claude (10-30 s) se hace ANTES de abrir la transacción, para no
 * tener una conexión del pool bloqueada mientras tanto. El id del proyecto se
 * genera aquí para que la auditoría de la IA pueda referenciarlo.
 *
 * @returns {Promise<{ project: object, tasks: object[] }>}
 */
export async function createProject(userId, { title, description }) {
  const projectId = randomUUID();

  // Si falla, lanza un AppError claro y no se ha escrito nada en projects/tasks
  const generatedTasks = await taskGenerator.generate({ title, description, userId, projectId });

  // Transacción corta: proyecto + bulk insert de tareas, o ninguno de los dos
  return withTransaction(async (client) => {
    const project = await projectModel.create({ id: projectId, userId, title, description }, client);
    const tasks = await taskModel.create(project.id, generatedTasks, client);
    return { project, tasks };
  });
}

/** Proyectos del usuario con total_tasks, completed_tasks y progress (0-100) para la barra de progreso. */
export async function getUserProjects(userId) {
  const projects = await projectModel.findByUserId(userId);
  return projects.map((project) => ({
    ...project,
    progress: progressOf(project.total_tasks, project.completed_tasks),
  }));
}

/**
 * Proyecto con todas sus tareas. Responde 404 tanto si no existe como si es de
 * otro usuario, para no revelar qué ids existen.
 */
export async function getProjectById(userId, projectId) {
  const project = await projectModel.findById(projectId, userId);
  if (!project) {
    throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
  }

  const tasks = await taskModel.findByProjectId(project.id);
  const completed = tasks.filter((task) => task.status === 'completed').length;

  return {
    project: { ...project, total_tasks: tasks.length, completed_tasks: completed, progress: progressOf(tasks.length, completed) },
    tasks,
  };
}
