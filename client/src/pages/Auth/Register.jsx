// client/src/pages/Auth/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const passwordsMatch = form.password && form.password === form.confirm;
  const disabled = loading || !form.email || !form.password || !passwordsMatch;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) return;
    const { ok } = await register({ email: form.email, password: form.password });
    if (ok) navigate('/diary');
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-sm rounded-2xl p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Start tracking your calories in minutes.</p>

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
                autoComplete="new-password"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:border-gray-400"
                placeholder="Minimum 6 characters"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm password</label>
              <input
                name="confirm"
                type={showPass ? 'text' : 'password'}
                value={form.confirm}
                onChange={onChange}
                autoComplete="new-password"
                className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:border-gray-400 ${
                  form.confirm && !passwordsMatch ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                }`}
                placeholder="Re-enter password"
                required
              />
              {form.confirm && !passwordsMatch && (
                <p className="mt-1 text-xs text-red-600">Passwords don’t match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={disabled}
              className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-white disabled:opacity-50"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-gray-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">© {new Date().getFullYear()} Calorie Tracker</p>
      </div>
    </div>
  );
}
