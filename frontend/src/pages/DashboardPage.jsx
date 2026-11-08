import * as projectsApi from '../api/projectsApi.js';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { EmptyProjects } from '../components/projects/EmptyProjects.jsx';
import { ProjectCard } from '../components/projects/ProjectCard.jsx';
import { ButtonLink } from '../components/ui/ButtonLink.jsx';
import { ErrorState } from '../components/ui/ErrorState.jsx';
import { LoadingState } from '../components/ui/LoadingState.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useResource } from '../hooks/useResource.js';
import t from '../i18n/es.js';

const loadProjects = (_key, signal) => projectsApi.listProjects({ signal }).then((data) => data.projects);

/** Dashboard: proyectos del usuario con su estado y progreso. */
export function DashboardPage() {
  const { user } = useAuth();
  const { data: projects, error, loading, reload } = useResource(loadProjects, 'projects');

  let content;
  if (loading) content = <LoadingState label={t.dashboard.loading} />;
  else if (error) content = <ErrorState title={t.dashboard.loadError} description={error.message} onRetry={reload} />;
  else if (projects.length === 0) content = <EmptyProjects />;
  else
    content = (
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </ul>
    );

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t.dashboard.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{t.dashboard.subtitle(user.name)}</p>
        </div>
        {projects?.length > 0 && <ButtonLink to="/projects/new">{t.dashboard.newProject}</ButtonLink>}
      </div>
      {content}
    </AppLayout>
  );
}
