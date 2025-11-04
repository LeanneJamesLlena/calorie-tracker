// client/src/pages/Auth/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const { ok } = await login(form);
    if (ok) navigate('/diary');
  };

  const disabled = loading || !form.email || !form.password;

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-sm rounded-2xl p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Log in to continue tracking.</p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                autoComplete="email"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:border-gray-400"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                <span>Password</span>
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </label>
              <input
                name="password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={onChange}
                autoComplete="current-password"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:border-gray-400"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={disabled}
              className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-white disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            No account?{' '}
            <Link to="/register" className="font-medium text-gray-900 hover:underline">
              Create one
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">© {new Date().getFullYear()} Calorie Tracker</p>
      </div>
    </div>
  );
}
