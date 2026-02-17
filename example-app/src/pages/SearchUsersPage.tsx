import { useNavigate } from 'react-router-dom';
import { SearchForm } from 'nauth-react';
import type { PagedResult, UserInfo } from 'nauth-react';
import { ROUTES } from '../lib/constants';

export default function SearchUsersPage() {
  const navigate = useNavigate();

  const handleSuccess = (result: PagedResult<UserInfo>) => {
    console.log('Search successful:', result);
  };

  const handleError = (error: Error) => {
    console.error('Search error:', error);
  };

  const handleUserClick = (user: UserInfo) => {
    console.log('User clicked:', user);
    navigate(`${ROUTES.USER_EDIT}?userId=${user.userId}`);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Search Users
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Search and browse all users in the system
          </p>
        </div>
        <button
          onClick={() => navigate(ROUTES.USER_EDIT)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create User
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <SearchForm
          onSuccess={handleSuccess}
          onError={handleError}
          onUserClick={handleUserClick}
          initialPageSize={25}
          pageSizeOptions={[10, 25, 50, 100]}
          showUserAvatar={true}
        />
      </div>
    </div>
  );
}
