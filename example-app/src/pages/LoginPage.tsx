import { LoginForm } from 'nauth-react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from 'nauth-react';
import { toast } from 'sonner';
import { ROUTES } from '../lib/constants';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

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
    toast.success('Login successful! Welcome back.');
    
    // Check if there's a stored redirect destination
    const redirectTo = sessionStorage.getItem('redirectAfterLogin');
    if (redirectTo) {
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirectTo);
    } else {
      navigate(ROUTES.DASHBOARD);
    }
  };

  const handleError = (error: Error) => {
    toast.error(error.message || 'Login failed. Please try again.');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="p-8 bg-white dark:bg-gray-800">
          <CardHeader className="mb-8">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <LoginForm
              onSuccess={handleSuccess}
              onError={handleError}
              showRememberMe={true}
              className="space-y-4"
            />
          </CardContent>

          <CardFooter className="flex-col space-y-3">
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Forgot your password?
            </Link>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to={ROUTES.REGISTER}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
