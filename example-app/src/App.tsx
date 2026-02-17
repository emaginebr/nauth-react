import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NAuthProvider } from 'nauth-react';
import { Toaster } from 'sonner';
//import 'nauth-react/styles';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import SearchUsersPage from './pages/SearchUsersPage';
import RolesPage from './pages/RolesPage';
import UserEditPage from './pages/UserEditPage';
import { ROUTES } from './lib/constants';

function App() {
  return (
    <BrowserRouter>
      <NAuthProvider
        config={{
          apiUrl: import.meta.env.VITE_API_URL,
          enableFingerprinting: true,
          redirectOnUnauthorized: ROUTES.LOGIN,
          onAuthChange: (user) => {
            console.log('Auth state changed:', user);
          },
        }}
      >
        <Toaster position="bottom-right" richColors />
        <Routes>
          <Route element={<Layout />}>
            {/* Public Routes */}
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={`${ROUTES.RESET_PASSWORD}/:hash`} element={<ResetPasswordPage />} />

            {/* Protected Routes */}
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.PROFILE}
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.CHANGE_PASSWORD}
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.SEARCH_USERS}
              element={
                <ProtectedRoute>
                  <SearchUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ROLES}
              element={
                <ProtectedRoute>
                  <RolesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.USER_EDIT}
              element={
                <ProtectedRoute>
                  <UserEditPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Route>
        </Routes>
      </NAuthProvider>
    </BrowserRouter>
  );
}

export default App;
