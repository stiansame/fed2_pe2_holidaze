import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';

const inputClass = 'mt-2 min-h-12 w-full rounded-lg border border-border bg-surface px-3';

export default function AuthForm({ register = false }) {
  const { user, notice, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const from = location.state?.from;
  const destination = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')
    ? from : '/profile';

  if (user) return <Navigate to={destination} replace />;

  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    const values = new FormData(event.currentTarget);
    const credentials = { email: values.get('email').trim(), password: values.get('password') };
    setPending(true);
    setError('');
    setFieldErrors({});
    try {
      if (register) {
        await apiRequest('auth/register', {
          method: 'POST', body: {
            ...credentials, name: values.get('name').trim(),
            venueManager: values.get('venueManager') === 'on',
          },
        });
        navigate('/login', { replace: true, state: { from, registered: true } });
      } else {
        await login(credentials);
        navigate(destination, { replace: true });
      }
    } catch (error) {
      setError(error.message);
      setFieldErrors(Object.fromEntries((error.errors ?? []).filter(item => item.path?.length).map(item => [item.path[0], item.message])));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-lg border border-border bg-surface p-6 md:p-8">
      <h1 className="text-h3 font-bold">{register ? 'Create your account' : 'Welcome back'}</h1>
      <p className="mt-2 text-muted">{register ? 'Your next stay starts here.' : 'Log in to manage your stays.'}</p>
      {!register && (notice || location.state?.registered) && (
        <p role="status" className="mt-4">{location.state?.registered ? 'Account created. You can now log in.' : notice}</p>
      )}
      <form onSubmit={submit} className="mt-6 space-y-5" onInput={event => event.target.setCustomValidity?.('')} onInvalid={event => {
        const input = event.target;
        const message = input.validity.valueMissing ? 'Please fill in this field.'
          : input.name === 'email' ? 'Use a valid @stud.noroff.no email address.'
          : input.name === 'name' ? 'Use letters, numbers and underscores only.'
          : 'Use at least 8 characters.';
        input.setCustomValidity(message);
      }}>
        {register && <label className="block">Username
          <input name="name" required pattern="[a-zA-Z0-9_]+" autoComplete="username" aria-invalid={!!fieldErrors.name} aria-describedby={fieldErrors.name ? 'name-error' : undefined} title="Use letters, numbers and underscores only." className={inputClass} />
          <span className="mt-1 block text-small text-muted">Letters, numbers and underscores only.</span>
          {fieldErrors.name && <span id="name-error" className="block text-small text-danger">{fieldErrors.name}</span>}
        </label>}
        <label className="block">Email
          <input name="email" type="email" required pattern="[^@\s]+@stud\.noroff\.no" autoComplete="email" aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? 'email-error' : undefined} title="Use your @stud.noroff.no email address." className={inputClass} />
          <span className="mt-1 block text-small text-muted">Use your @stud.noroff.no email address.</span>
          {fieldErrors.email && <span id="email-error" className="block text-small text-danger">{fieldErrors.email}</span>}
        </label>
        <label className="block">Password
          <input name="password" type="password" required minLength={register ? 8 : undefined} autoComplete={register ? 'new-password' : 'current-password'} aria-invalid={!!fieldErrors.password} aria-describedby={fieldErrors.password ? 'password-error' : undefined} className={inputClass} />
          {register && <span className="mt-1 block text-small text-muted">At least 8 characters.</span>}
          {fieldErrors.password && <span id="password-error" className="block text-small text-danger">{fieldErrors.password}</span>}
        </label>
        {register && <label className="flex min-h-12 items-center gap-3">
          <input name="venueManager" type="checkbox" className="size-5 accent-primary" />
          Register as a venue manager
        </label>}
        {error && <p role="alert" className="whitespace-pre-line text-danger">{error}</p>}
        <button disabled={pending} className="min-h-12 w-full rounded-lg bg-primary px-4 font-semibold text-surface hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60">
          {pending ? 'Please wait…' : register ? 'Create account' : 'Log in'}
        </button>
      </form>
      <Link to={register ? '/login' : '/register'} state={{ from }} className="mt-5 block py-2 text-center text-primary underline">
        {register ? 'Already have an account? Log in' : 'Create an account'}
      </Link>
    </section>
  );
}
