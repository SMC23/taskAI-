import { useNavigate } from 'react-router';
import * as projectsApi from '../api/projectsApi.js';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { TextAreaField } from '../components/ui/TextAreaField.jsx';
import { TextField } from '../components/ui/TextField.jsx';
import { TextLink } from '../components/ui/TextLink.jsx';
import { useForm } from '../hooks/useForm.js';
import t from '../i18n/es.js';
import { PROJECT_LIMITS, validateProject } from '../utils/validation.js';

/** Mensajes específicos de la creación con IA; el resto usa el mensaje general del error. */
function projectErrorMessage(err) {
  if (err.status === 429) return t.newProject.errors.rateLimited(err.retryAfter ? Math.ceil(err.retryAfter / 60) : null);
  if (err.status === 502) return t.newProject.errors.invalidResponse;
  if (err.status === 503) return t.newProject.errors.unavailable;
  return undefined;
}

/** Crear proyecto: la IA genera las tareas a partir de la descripción. */
export function NewProjectPage() {
  const navigate = useNavigate();
  const { values, fieldErrors, formError, submitting, handleChange, handleSubmit } = useForm({
    initialValues: { title: '', description: '' },
    validate: validateProject,
    getErrorMessage: projectErrorMessage,
    onSubmit: async ({ title, description }) => {
      const { project, tasks } = await projectsApi.createProject({ title: title.trim(), description: description.trim() });
      navigate(`/projects/${project.id}`, { state: { createdTasks: tasks.length } });
    },
  });

  return (
    <AppLayout>
      <TextLink to="/">{t.nav.backToProjects}</TextLink>
      <div className="mt-4 max-w-2xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <h1 className="text-xl font-semibold text-slate-900">{t.newProject.title}</h1>
        <p className="mt-1 text-sm text-slate-600">{t.newProject.subtitle}</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          {formError && <Alert>{formError}</Alert>}

          {/* fieldset disabled bloquea todos los campos mientras la IA trabaja */}
          <fieldset disabled={submitting} className="space-y-5">
            <TextField
              id="project-title"
              name="title"
              label={t.newProject.titleLabel}
              placeholder={t.newProject.titlePlaceholder}
              required
              value={values.title}
              onChange={handleChange}
              error={fieldErrors.title}
            />
            <TextAreaField
              id="project-description"
              name="description"
              label={t.newProject.descriptionLabel}
              placeholder={t.newProject.descriptionPlaceholder}
              hint={t.newProject.descriptionHint}
              required
              rows={7}
              maxLength={PROJECT_LIMITS.descriptionMax}
              counterText={t.newProject.counter(values.description.trim().length, PROJECT_LIMITS.descriptionMax)}
              value={values.description}
              onChange={handleChange}
              error={fieldErrors.description}
            />
          </fieldset>

          {submitting && (
            <div role="status" className="flex items-start gap-3 rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-800 ring-1 ring-indigo-200">
              <Spinner className="mt-0.5 size-4 shrink-0" />
              <span>{t.newProject.generating}</span>
            </div>
          )}

          <Button type="submit" className="w-full sm:w-auto" loading={submitting} loadingText={t.newProject.submitting}>
            {t.newProject.submit}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
