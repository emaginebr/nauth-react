import { ForgotPasswordForm } from 'nauth-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from 'nauth-react';
import { ROUTES } from '../lib/constants';
import { ArrowLeft, Mail } from 'lucide-react';
import { useState } from 'react';

export function ForgotPasswordPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

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

  const handleSuccess = () => {
    setEmailSent(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          {!emailSent ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2 dark:text-white">Forgot Password?</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter your email and we'll send you a link to reset your password
                </p>
              </div>

              <ForgotPasswordForm onSuccess={handleSuccess} className="space-y-4" />

              <div className="mt-6">
                <Link
                  to={ROUTES.LOGIN}
                  className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2 dark:text-white">Check Your Email</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  We've sent a password reset link to your email address. Please check your inbox
                  and follow the instructions.
                </p>
                <Link
                  to={ROUTES.LOGIN}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
