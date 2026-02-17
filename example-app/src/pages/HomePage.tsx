import { Link } from 'react-router-dom';
import { useAuth } from 'nauth-react';
import { ROUTES, APP_NAME, APP_DESCRIPTION } from '../lib/constants';
import { Shield, Lock, Users, Palette, CheckCircle } from 'lucide-react';

export function HomePage() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Complete Authentication',
      description: 'Login, register, password recovery, and password reset functionality',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'User Management',
      description: 'Profile management, password changes, and account deletion',
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: 'Dark/Light Themes',
      description: 'Beautiful themes with automatic system detection and persistence',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Protected Routes',
      description: 'Secure route protection with automatic redirects',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-20">
        <div className="flex justify-center mb-6">
          <Shield className="w-20 h-20 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {APP_NAME}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          {APP_DESCRIPTION}
        </p>
        <div className="flex gap-4 justify-center">
          {isAuthenticated ? (
            <Link
              to={ROUTES.DASHBOARD}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to={ROUTES.REGISTER}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started
              </Link>
              <Link
                to={ROUTES.LOGIN}
                className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-20">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2 dark:text-white">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Demo Features */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Experience NAuth?</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-center gap-2 justify-center">
            <CheckCircle className="w-5 h-5" />
            <span>TypeScript Support</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <CheckCircle className="w-5 h-5" />
            <span>Responsive Design</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <CheckCircle className="w-5 h-5" />
            <span>Accessible</span>
          </div>
        </div>
        {!isAuthenticated && (
          <Link
            to={ROUTES.REGISTER}
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Create Your Account
          </Link>
        )}
      </div>
    </div>
  );
}
