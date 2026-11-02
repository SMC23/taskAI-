import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { TextField } from '../components/ui/TextField.jsx';
import { TextLink } from '../components/ui/TextLink.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useForm } from '../hooks/useForm.js';
import t from '../i18n/es.js';
import { validateLogin } from '../utils/validation.js';

export function LoginPage() {
  const { login, sessionExpired } = useAuth();
  const { values, fieldErrors, formError, submitting, handleChange, handleSubmit } = useForm({
    initialValues: { email: '', password: '' },
    validate: validateLogin,
    // Tras el login, PublicOnlyRoute redirige automáticamente
    onSubmit: ({ email, password }) => login(email.trim(), password),
  });

  return (
    <AuthLayout
      title={t.auth.login.title}
      subtitle={t.auth.login.subtitle}
      footer={
        <>
          {t.auth.login.noAccount} <TextLink to="/register">{t.auth.login.toRegister}</TextLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {sessionExpired && !formError && <Alert tone="info">{t.auth.sessionExpired}</Alert>}
        {formError && <Alert>{formError}</Alert>}

        <TextField
          id="login-email"
          name="email"
          type="email"
          label={t.fields.email}
          autoComplete="email"
          required
          value={values.email}
          onChange={handleChange}
          error={fieldErrors.email}
        />
        <TextField
          id="login-password"
          name="password"
          type="password"
          label={t.fields.password}
          autoComplete="current-password"
          required
          value={values.password}
          onChange={handleChange}
          error={fieldErrors.password}
        />

        <Button type="submit" className="w-full" loading={submitting} loadingText={t.auth.login.submitting}>
          {t.auth.login.submit}
        </Button>
      </form>
    </AuthLayout>
  );
}
