import { FormEvent, useState } from 'react';
import Header from '../components/Header';
import CityBackground from '../components/CityBackground';
import { login } from '../utils/api';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try {
      await login(String(form.get('email') ?? ''), String(form.get('password') ?? ''));
      window.location.hash = '#/dashboard';
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <>
      <Header />
      <CityBackground />
      <main className="auth-page">
        <section className="auth-card" aria-labelledby="login-title">
          <p className="eyebrow">
            <span></span> ĐĂNG NHẬP
          </p>
          <h2 id="login-title">
            Chào mừng <em>quay lại.</em>
          </h2>
          <p className="intro">Đăng nhập để vào không gian quản lý của bạn trên Trọ Ơi.</p>

          <form onSubmit={onSubmit} noValidate={import.meta.env.DEV}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                aria-invalid={error ? true : undefined}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Mật khẩu</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                maxLength={200}
                required
                aria-invalid={error ? true : undefined}
              />
            </div>

            <p className="form-error" role="alert" hidden={!error}>
              {error}
            </p>

            <button className="pill" type="submit" disabled={busy}>
              {busy ? 'Đang đăng nhập…' : 'Đăng nhập'} <span aria-hidden="true">↗</span>
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
