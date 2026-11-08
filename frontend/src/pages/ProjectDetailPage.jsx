import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { NotFoundState } from '../components/layout/NotFoundState.jsx';
import { ProjectProgress } from '../components/projects/ProjectProgress.jsx';
import { ProjectStatusBadge } from '../components/projects/ProjectStatusBadge.jsx';
import { TaskList } from '../components/tasks/TaskList.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { ErrorState } from '../components/ui/ErrorState.jsx';
import { LoadingState } from '../components/ui/LoadingState.jsx';
import { SelectField } from '../components/ui/SelectField.jsx';
import { TextLink } from '../components/ui/TextLink.jsx';
import { useProjectDetail } from '../hooks/useProjectDetail.js';
import t from '../i18n/es.js';

const PROJECT_STATUS_OPTIONS = Object.entries(t.projectStatus).map(([value, label]) => ({ value, label }));

/** Detalle de un proyecto: datos, progreso y tareas. */
export function ProjectDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const detail = useProjectDetail(id);
  // Aviso "Proyecto creado" (viene de NewProjectPage). Se copia a estado local y se borra
  // del historial para que no reaparezca al recargar la página.
  const [createdTasks] = useState(() => location.state?.createdTasks ?? null);
  useEffect(() => {
    if (location.state?.createdTasks != null) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);
  const { project, tasks, error, loading } = detail;

  if (loading) {
    return (
      <AppLayout>
        <LoadingState label={t.project.loading} />
      </AppLayout>
    );
  }

  // 404 (no existe o es ajeno) y 400 (id mal formado) se muestran igual
  if (error?.status === 404 || error?.status === 400) {
    return (
      <AppLayout>
        <NotFoundState title={t.project.notFound.title} description={t.project.notFound.description} />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <ErrorState title={t.project.loadError} description={error.message} onRetry={detail.reload} />
      </AppLayout>
    );
  }

  const completed = tasks.filter((task) => task.status === 'completed').length;

  return (
    <AppLayout>
      <TextLink to="/">{t.nav.backToProjects}</TextLink>

      {createdTasks != null && (
        <div className="mt-4">
          <Alert tone="info">{t.project.created(createdTasks)}</Alert>
        </div>
      )}

      <section className="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900">{project.title}</h1>
              <ProjectStatusBadge status={project.status} />
            </div>
            {project.description && <p className="mt-2 whitespace-pre-line text-slate-600">{project.description}</p>}
          </div>
          <SelectField
            id="project-status"
            label={t.project.statusLabel}
            options={PROJECT_STATUS_OPTIONS}
            value={project.status}
            onChange={(event) => detail.changeProjectStatus(event.target.value)}
            className="sm:w-44 sm:shrink-0"
          />
        </div>
        {detail.projectError && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {detail.projectError}
          </p>
        )}
        <div className="mt-6">
          <ProjectProgress completed={completed} total={tasks.length} />
        </div>
      </section>

      <TaskList
        tasks={tasks}
        savingTaskIds={detail.savingTaskIds}
        taskErrors={detail.taskErrors}
        onStatusChange={detail.changeTaskStatus}
        onDelete={detail.removeTask}
      />
    </AppLayout>
  );
}
