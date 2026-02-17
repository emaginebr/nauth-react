import { ChangePasswordForm } from 'nauth-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'nauth-react';
import { ROUTES } from '../lib/constants';
import { KeyRound, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export function ChangePasswordPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [changeSuccess, setChangeSuccess] = useState(false);

    const handleSuccess = async () => {
        setChangeSuccess(true);
        // Wait 2 seconds before logging out
        setTimeout(async () => {
            await logout();
            navigate(ROUTES.LOGIN);
        }, 2000);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                {!changeSuccess ? (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <KeyRound className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold dark:text-white">Change Password</h1>
                                <p className="text-gray-600 dark:text-gray-400">Update your password to keep your account secure</p>
                            </div>
                        </div>

                        {/*<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                <strong>Note:</strong> After changing your password, you will be automatically logged out
                and will need to log in again with your new password.
              </p>
            </div>*/}

                        <ChangePasswordForm onSuccess={handleSuccess} className="space-y-4 p-4" />

                        <h2 className="text-lg font-semibold mb-4 dark:text-white">Password Security Tips</h2>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 dark:text-green-400">✓</span>
                                Use at least 8 characters
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 dark:text-green-400">✓</span>
                                Include uppercase and lowercase letters
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 dark:text-green-400">✓</span>
                                Add numbers and special characters
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 dark:text-green-400">✓</span>
                                Avoid common words and patterns
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 dark:text-green-400">✓</span>
                                Don't reuse passwords from other accounts
                            </li>
                        </ul>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2 dark:text-white">Password Changed Successfully</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Your password has been updated. You will be logged out shortly...
                        </p>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
