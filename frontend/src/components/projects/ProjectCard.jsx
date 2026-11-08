import { Link } from 'react-router';
import { ProjectProgress } from './ProjectProgress.jsx';
import { ProjectStatusBadge } from './ProjectStatusBadge.jsx';

/** Tarjeta del dashboard; toda la tarjeta es un enlace al detalle. */
export function ProjectCard({ project }) {
  return (
    <li>
      <Link
        to={`/projects/${project.id}`}
        className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md hover:ring-indigo-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-semibold text-slate-900">{project.title}</h2>
          <ProjectStatusBadge status={project.status} />
        </div>
        {project.description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{project.description}</p>}
        <div className="mt-auto pt-4">
          <ProjectProgress completed={Number(project.completed_tasks)} total={Number(project.total_tasks)} />
        </div>
      </Link>
    </li>
  );
}
