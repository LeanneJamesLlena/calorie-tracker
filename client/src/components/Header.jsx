// client/src/components/Header.jsx
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const onLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/diary" className="text-lg font-semibold tracking-tight">
          Calorie Tracker
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <div
              title={user.email}
              className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 text-sm font-medium text-gray-700"
            >
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <button
              onClick={onLogout}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
