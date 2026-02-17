import { useAuth } from 'nauth-react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, KeyRound } from 'lucide-react';
import { ROUTES } from '../lib/constants';

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  if (!user) return null;

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
          {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium hidden md:block dark:text-white">
          {user.name || user.email}
        </span>
      </button>

      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="px-4 pt-5 pb-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold dark:text-white">{user.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
        </div>

        <div className="py-2">
          <Link
            to={ROUTES.PROFILE}
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          <Link
            to={ROUTES.CHANGE_PASSWORD}
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors"
          >
            <KeyRound className="w-4 h-4" />
            Change Password
          </Link>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
