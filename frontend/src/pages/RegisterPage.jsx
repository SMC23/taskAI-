import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { TextField } from '../components/ui/TextField.jsx';
import { TextLink } from '../components/ui/TextLink.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useForm } from '../hooks/useForm.js';
import t from '../i18n/es.js';
import { validateRegister } from '../utils/validation.js';

export function RegisterPage() {
  const { register } = useAuth();
  const { values, fieldErrors, formError, submitting, handleChange, handleSubmit } = useForm({
    initialValues: { name: '', email: '', password: '' },
    validate: validateRegister,
    // Tras el registro hay sesión y PublicOnlyRoute redirige automáticamente
    onSubmit: ({ name, email, password }) => register(name.trim(), email.trim(), password),
  });

  return (
    <AuthLayout
      title={t.auth.register.title}
      subtitle={t.auth.register.subtitle}
      footer={
        <>
          {t.auth.register.hasAccount} <TextLink to="/login">{t.auth.register.toLogin}</TextLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError && <Alert>{formError}</Alert>}

        <TextField
          id="register-name"
          name="name"
          label={t.fields.name}
          autoComplete="name"
          required
          value={values.name}
          onChange={handleChange}
          error={fieldErrors.name}
        />
        <TextField
          id="register-email"
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
          id="register-password"
          name="password"
          type="password"
          label={t.fields.password}
          autoComplete="new-password"
          required
          hint={t.auth.register.passwordHint}
          value={values.password}
          onChange={handleChange}
          error={fieldErrors.password}
        />

        <Button type="submit" className="w-full" loading={submitting} loadingText={t.auth.register.submitting}>
          {t.auth.register.submit}
        </Button>
      </form>
    </AuthLayout>
  );
}
