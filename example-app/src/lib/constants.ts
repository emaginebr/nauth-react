export const APP_NAME = 'NAuth Demo';
export const APP_DESCRIPTION = 'Complete authentication and user management demo using nauth-react';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  CHANGE_PASSWORD: '/change-password',
  SEARCH_USERS: '/search-users',
  ROLES: '/roles',
  USER_EDIT: '/user-edit',
} as const;

export const EXTERNAL_LINKS = {
  TERMS: '/terms',
  PRIVACY: '/privacy',
  DOCS: 'https://github.com/your-repo/nauth-react',
} as const;
