import { ResetPasswordForm } from 'nauth-react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useAuth } from 'nauth-react';
import { ROUTES } from '../lib/constants';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { hash } = useParams<{ hash: string }>();
  const { isAuthenticated, isLoading } = useAuth();
  const [resetSuccess, setResetSuccess] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // Redirect if no hash provided
  if (!hash) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const handleSuccess = () => {
    setResetSuccess(true);
    setTimeout(() => {
      navigate(ROUTES.LOGIN);
    }, 3000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          {!resetSuccess ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2 dark:text-white">Reset Password</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter your new password below
                </p>
              </div>

              <ResetPasswordForm onSuccess={handleSuccess} className="space-y-4" />
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2 dark:text-white">Password Reset Successfully</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your password has been reset. Redirecting to login...
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
