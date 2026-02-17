import { RegisterForm } from 'nauth-react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from 'nauth-react';
import { ROUTES, EXTERNAL_LINKS } from '../lib/constants';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';

export function RegisterPage() {
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
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-2 dark:text-white">Create Account</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Get started with your free account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <RegisterForm
              onSuccess={handleSuccess}
              showTermsCheckbox={true}
              termsUrl={EXTERNAL_LINKS.TERMS}
              className="space-y-4"
            />
          </CardContent>

          <CardFooter className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 justify-center">
            Already have an account?{' '}
            <Link
              to={ROUTES.LOGIN}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium ml-1"
            >
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
