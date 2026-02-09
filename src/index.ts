// Main entry point for @nauth/react-auth package

// Styles - Import first
import './styles/index.css';

// Authentication Components
export { LoginForm } from './components/LoginForm';
export { RegisterForm } from './components/RegisterForm';
export { ForgotPasswordForm } from './components/ForgotPasswordForm';
export { ResetPasswordForm } from './components/ResetPasswordForm';
export { ChangePasswordForm } from './components/ChangePasswordForm';
export { SearchForm } from './components/SearchForm';

// Role Management Components
export { RoleList } from './components/RoleList';
export { RoleForm } from './components/RoleForm';

// User Management Components
export { UserEditForm } from './components/UserEditForm';

// Context Providers & Hooks
export { NAuthProvider, useNAuth } from './contexts/NAuthContext';
export type { NAuthConfig, NAuthContextValue, NAuthProviderProps } from './contexts/NAuthContext';

// Custom Hooks
export { useAuth } from './hooks/useAuth';
export { useUser } from './hooks/useUser';
export { useProtectedRoute } from './hooks/useProtectedRoute';
export type { UseProtectedRouteOptions } from './hooks/useProtectedRoute';

// API Client
export { NAuthAPI, createNAuthClient } from './services/nauth-api';

// UI Components
export { Button } from './components/ui/button';
export { Input } from './components/ui/input';
export { Label } from './components/ui/label';
export { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar';

// TypeScript Types
export type {
  UserInfo,
  AuthSession,
  UserAddress,
  UserPhone,
  UserRole,
  RoleInfo,
  RoleFormData,
  LoginCredentials,
  RegisterData,
  ChangePasswordData,
  ResetPasswordData,
  ApiResponse,
  ApiError,
  Theme,
  ThemeContextValue,
  LoginFormProps,
  RegisterFormProps,
  ForgotPasswordFormProps,
  ResetPasswordFormProps,
  ChangePasswordFormProps,
  SearchFormProps,
  RoleListProps,
  RoleFormProps,
  UserEditFormProps,
  PagedResult,
  UserSearchParams,
} from './types';

export { UserStatus } from './types';

// Utility Functions
export {
  validateCPF,
  validateCNPJ,
  validateEmail,
  validatePhone,
  formatPhone,
  formatDocument,
  formatZipCode,
  validatePasswordStrength,
  debounce,
  throttle,
} from './utils/validators';

export type { PasswordStrength } from './utils/validators';

export { cn } from './utils/cn';

// Constants
export { API_ENDPOINTS, VERSION } from './types';
