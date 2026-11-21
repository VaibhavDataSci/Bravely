"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NeonButton } from '@/components/shared';
import { useAuth } from '@/contexts/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(mode, { name, email, password, confirm }) {
  const errors = {};
  if (mode === 'signup' && !name.trim()) errors.name = 'Enter your name';
  if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address';
  if (mode === 'signup') {
    if (password.length < 8) errors.password = 'Password must be at least 8 characters';
    else if (password !== confirm) errors.confirm = 'Passwords do not match';
  } else if (!password) {
    errors.password = 'Enter your password';
  }
  return errors;
}

function Field({ id, label, error, ...inputProps }) {
  return (
    <div className="bv-field">
      <label className="bv-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="bv-input"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
      />
      {error && <span className="bv-field-error" id={`${id}-error`}>{error}</span>}
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const { login, signup, status, notice } = useAuth();

  const [mode, setMode] = useState('login');
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [status, router]);

  const setValue = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setFieldErrors((errs) => ({ ...errs, [key]: undefined }));
    setFormError('');
  };

  const switchMode = (next) => {
    setMode(next);
    setFieldErrors({});
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(mode, values);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const email = values.email.trim();
      if (mode === 'login') await login({ email, password: values.password });
      else await signup({ name: values.name.trim(), email, password: values.password });
      router.replace('/dashboard');
    } catch (err) {
      setFieldErrors(err.fields || {});
      // Field errors already explain validation failures; show the banner for everything else.
      if (!err.fields || !Object.keys(err.fields).length) setFormError(err.message);
      setSubmitting(false);
    }
  };

  const signingUp = mode === 'signup';

  return (
    <div className="bv-auth">
      <aside className="bv-auth-aside">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="bv-logo" src="/brand/bravely-mark.png" alt="" />
        <h1>Practice the interview before it counts.</h1>
        <ul>
          <li>Role-specific mock interviews</li>
          <li>Structured feedback on every answer</li>
          <li>Progress tracked across sessions</li>
        </ul>
      </aside>

      <main className="bv-auth-main">
        <form className="bv-auth-form" onSubmit={handleSubmit} noValidate>
          <h2>{signingUp ? 'Create your account' : 'Sign in to Bravely'}</h2>

          {notice && <div className="bv-alert bv-alert--info" role="status">{notice}</div>}
          {formError && <div className="bv-alert bv-alert--error" role="alert">{formError}</div>}

          {signingUp && (
            <Field id="name" label="Full name" autoComplete="name" value={values.name} onChange={setValue('name')} error={fieldErrors.name} />
          )}
          <Field id="email" label="Email" type="email" autoComplete="email" inputMode="email" value={values.email} onChange={setValue('email')} error={fieldErrors.email} />
          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete={signingUp ? 'new-password' : 'current-password'}
            value={values.password}
            onChange={setValue('password')}
            error={fieldErrors.password}
          />
          {signingUp && (
            <Field id="confirm" label="Confirm password" type="password" autoComplete="new-password" value={values.confirm} onChange={setValue('confirm')} error={fieldErrors.confirm} />
          )}

          <NeonButton type="submit" size="lg" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? (signingUp ? 'Creating account…' : 'Signing in…') : (signingUp ? 'Create account' : 'Sign in')}
          </NeonButton>

          <p className="bv-auth-switch">
            {signingUp ? 'Already have an account?' : 'New to Bravely?'}{' '}
            <button type="button" onClick={() => switchMode(signingUp ? 'login' : 'signup')}>
              {signingUp ? 'Sign in' : 'Create an account'}
            </button>
          </p>
        </form>
      </main>

      <style>{`
        .bv-auth { display: flex; min-height: 100dvh; width: 100%; overflow: auto; background: var(--bv-s0); }
        .bv-auth-aside { display: none; flex: 0 0 42%; flex-direction: column; justify-content: center; gap: 24px; padding: 48px; background: var(--bv-s1); border-right: 1px solid var(--bv-border-subtle); }
        .bv-auth-aside h1 { max-width: 420px; font-size: 28px; font-weight: 600; line-height: 1.25; letter-spacing: -0.01em; }
        .bv-auth-aside ul { list-style: none; display: flex; flex-direction: column; gap: 10px; color: var(--bv-t2); font-size: 15px; }
        .bv-auth-main { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; padding: 24px 16px; }
        .bv-auth-form { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 16px; }
        .bv-auth-form h2 { font-size: 22px; font-weight: 600; margin-bottom: 4px; }
        .bv-auth-switch { font-size: 14px; color: var(--bv-t2); text-align: center; }
        .bv-auth-switch button { background: none; border: 0; padding: 0; font: inherit; font-weight: 600; color: var(--bv-brand); cursor: pointer; }
        .bv-auth-switch button:hover { color: var(--bv-brand-hover); }
        @media (min-width: 900px) { .bv-auth-aside { display: flex; } }
      `}</style>
    </div>
  );
}
