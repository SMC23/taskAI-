import { useCallback, useState } from 'react';
import * as projectsApi from '../api/projectsApi.js';
import * as tasksApi from '../api/tasksApi.js';
import t from '../i18n/es.js';
import { useResource } from './useResource.js';

const loadProject = (id, signal) => projectsApi.getProject(id, { signal });

const withoutKey = (map, key) => {
  if (!(key in map)) return map;
  const next = { ...map };
  delete next[key];
  return next;
};

/**
 * Proyecto + tareas, con las acciones del detalle:
 * - cambio de estado (tarea y proyecto) OPTIMISTA: la interfaz cambia al instante y,
 *   si el backend falla, vuelve al valor anterior y guarda un mensaje de error.
 * - borrado de tarea tras confirmar, eliminándola de la lista solo cuando el backend responde.
 */
export function useProjectDetail(id) {
  const { data, error, loading, reload, setData } = useResource(loadProject, id);
  const [taskErrors, setTaskErrors] = useState({}); // { [taskId]: mensaje }
  const [savingTaskIds, setSavingTaskIds] = useState(() => new Set());
  const [projectError, setProjectError] = useState('');

  const patchTask = useCallback(
    (taskId, changes) =>
      setData((prev) => ({ ...prev, tasks: prev.tasks.map((task) => (task.id === taskId ? { ...task, ...changes } : task)) })),
    [setData],
  );

  const setSaving = useCallback((taskId, saving) => {
    setSavingTaskIds((prev) => {
      const next = new Set(prev);
      if (saving) next.add(taskId);
      else next.delete(taskId);
      return next;
    });
  }, []);

  const changeTaskStatus = useCallback(
    async (task, status) => {
      const previous = task.status;
      setTaskErrors((prev) => withoutKey(prev, task.id));
      setSaving(task.id, true);
      patchTask(task.id, { status }); // optimista
      try {
        await tasksApi.updateTaskStatus(task.id, status);
      } catch (err) {
        patchTask(task.id, { status: previous }); // rollback
        setTaskErrors((prev) => ({ ...prev, [task.id]: `${t.tasks.statusError} ${err.message}` }));
      } finally {
        setSaving(task.id, false);
      }
    },
    [patchTask, setSaving],
  );

  /** Devuelve true si se borró. */
  const removeTask = useCallback(
    async (task) => {
      setTaskErrors((prev) => withoutKey(prev, task.id));
      try {
        await tasksApi.deleteTask(task.id);
        setData((prev) => ({ ...prev, tasks: prev.tasks.filter((item) => item.id !== task.id) }));
        return true;
      } catch (err) {
        setTaskErrors((prev) => ({ ...prev, [task.id]: `${t.tasks.deleteError} ${err.message}` }));
        return false;
      }
    },
    [setData],
  );

  const changeProjectStatus = useCallback(
    async (status) => {
      const previous = data.project.status;
      setProjectError('');
      setData((prev) => ({ ...prev, project: { ...prev.project, status } })); // optimista
      try {
        await projectsApi.updateProjectStatus(data.project.id, status);
      } catch (err) {
        setData((prev) => ({ ...prev, project: { ...prev.project, status: previous } })); // rollback
        setProjectError(`${t.project.statusError} ${err.message}`);
      }
    },
    [data, setData],
  );

  return {
    project: data?.project ?? null,
    tasks: data?.tasks ?? [],
    error,
    loading,
    reload,
    taskErrors,
    savingTaskIds,
    projectError,
    changeTaskStatus,
    removeTask,
    changeProjectStatus,
  };
}
