import { useRef } from 'react';
import t from '../../i18n/es.js';
import { TaskItem } from './TaskItem.jsx';

/** Lista de tareas en su orden (order_index, ya ordenadas por el backend). */
export function TaskList({ tasks, savingTaskIds, taskErrors, onStatusChange, onDelete }) {
  const headingRef = useRef(null);

  async function handleDelete(task) {
    const deleted = await onDelete(task);
    // El botón borrado desaparece: se lleva el foco al título de la lista para no perderlo
    if (deleted) headingRef.current?.focus();
    return deleted;
  }

  const ordered = [...tasks].sort((a, b) => a.order_index - b.order_index);

  return (
    <section aria-labelledby="tasks-heading" className="mt-8">
      <h2 id="tasks-heading" ref={headingRef} tabIndex={-1} className="text-lg font-semibold text-slate-900 focus:outline-none">
        {t.tasks.title(tasks.length)}
      </h2>
      {ordered.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">{t.tasks.empty}</p>
      ) : (
        <ol className="mt-3 space-y-3">
          {ordered.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              position={index + 1}
              saving={savingTaskIds.has(task.id)}
              error={taskErrors[task.id]}
              onStatusChange={onStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
