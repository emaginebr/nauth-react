# nauth-react

Modern React authentication component library for NAuth API integration. Built with TypeScript, Tailwind CSS, and designed as a distributable NPM package.

[![npm version](https://img.shields.io/npm/v/nauth-react.svg)](https://www.npmjs.com/package/nauth-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

✨ **Complete Auth Suite** - Login, Register, Password Recovery, Change Password  
🎨 **Theme Support** - Light/Dark mode with system detection  
📦 **Tree-shakeable** - Import only what you need  
🔒 **Type-Safe** - Full TypeScript support  
🎯 **Security** - Device fingerprinting with FingerprintJS  
♿ **Accessible** - WCAG compliant  
📱 **Responsive** - Mobile-first design  

## Installation

```bash
npm install nauth-react react-router-dom

# If you don't have Tailwind CSS
npm install -D tailwindcss postcss autoprefixer tailwindcss-animate
npx tailwindcss init -p
```

### Configure Tailwind

```javascript
// tailwind.config.js
export default {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/nauth-react/dist/**/*.{js,ts,jsx,tsx}',
  ],
  plugins: [require('tailwindcss-animate')],
};
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Quick Start

### 1. Setup Providers

```tsx
import { BrowserRouter } from 'react-router-dom';
import { NAuthProvider, ThemeProvider } from 'nauth-react';
import 'nauth-react/styles';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system">
        <NAuthProvider
          config={{
            apiUrl: import.meta.env.VITE_API_URL,
            enableFingerprinting: true,
          }}
        >
          <YourApp />
        </NAuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
```

```env
# .env
VITE_API_URL=https://your-nauth-api.com
```

### 2. Use Components

```tsx
import {
  LoginForm,
  RegisterForm,
  UserEditForm,
  RoleList,
  SearchForm,
  useAuth,
  useProtectedRoute,
} from 'nauth-react';
import { useNavigate } from 'react-router-dom';

// Login Page
function LoginPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm
        onSuccess={() => navigate('/dashboard')}
        showRememberMe
        showForgotPassword
      />
    </div>
  );
}

// Protected Dashboard
function Dashboard() {
  const { user, logout } = useAuth();
  useProtectedRoute({ redirectTo: '/login' });

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// User Management
function CreateUserPage() {
  const navigate = useNavigate();
  return (
    <UserEditForm
      onSuccess={(user) => {
        console.log('User created:', user);
        navigate('/users');
      }}
      onCancel={() => navigate('/users')}
    />
  );
}

// Edit User
function EditUserPage({ userId }: { userId: number }) {
  const navigate = useNavigate();
  return (
    <UserEditForm
      userId={userId}
      onSuccess={(user) => {
        console.log('User updated:', user);
        navigate('/users');
      }}
      onCancel={() => navigate('/users')}
    />
  );
}

// Search Users
function UsersPage() {
  return (
    <SearchForm
      onUserClick={(user) => console.log('Clicked:', user)}
      showUserAvatar
      initialPageSize={25}
    />
  );
}

// Role Management
function RolesPage() {
  return (
    <RoleList
      onEdit={(role) => console.log('Edit:', role)}
      onDelete={(role) => console.log('Delete:', role)}
      showCreateButton
    />
  );
}
```

## Components

**Authentication Forms:**
- `LoginForm` - Email/password login with validation
- `RegisterForm` - Multi-step registration with password strength
- `ForgotPasswordForm` - Password recovery request
- `ResetPasswordForm` - Password reset with token
- `ChangePasswordForm` - Change password for authenticated users

**User Management:**
- `UserEditForm` - Create and edit users with full profile management (dual mode)
- `SearchForm` - Search and browse users with pagination

**Role Management:**
- `RoleList` - List and manage roles with CRUD operations
- `RoleForm` - Create and edit roles

**UI Components:** `Button`, `Input`, `Label`, `Card`, `Avatar`, `DropdownMenu`, `Toaster`

## Hooks

```tsx
// Authentication state
const { user, isAuthenticated, login, logout, isLoading } = useAuth();

// User management
const {
  user,
  updateUser,
  createUser,
  getUserById,
  changePassword,
  uploadImage,
  searchUsers,
} = useUser();

// Role management
const { fetchRoles, getRoleById, createRole, updateRole, deleteRole } = useNAuth();

// Route protection
useProtectedRoute({ redirectTo: '/login', requireAdmin: false });

// Theme management
const { theme, setTheme } = useTheme();
```

## Configuration

```tsx
<NAuthProvider
  config={{
    apiUrl: 'https://your-api.com',           // Required
    timeout: 30000,                            // Optional
    enableFingerprinting: true,                // Optional
    storageType: 'localStorage',               // Optional
    redirectOnUnauthorized: '/login',          // Optional
    onAuthChange: (user) => {},                // Optional
    onLogin: (user) => {},                     // Optional
    onLogout: () => {},                        // Optional
  }}
>
  <App />
</NAuthProvider>
```

## API Client

```tsx
import { createNAuthClient } from 'nauth-react';

const api = createNAuthClient({ apiUrl: 'https://your-api.com' });

await api.login({ email, password });
await api.getMe();
await api.updateUser({ name: 'New Name' });
await api.uploadImage(file);
```

## Customization

```tsx
<LoginForm
  className="shadow-2xl"
  styles={{
    container: 'bg-white',
    button: 'bg-purple-600',
  }}
/>
```

## Utilities

```tsx
import {
  validateCPF,
  validateCNPJ,
  validateEmail,
  formatPhone,
  validatePasswordStrength,
} from 'nauth-react';
```

## TypeScript

```tsx
import type {
  UserInfo,
  LoginCredentials,
  NAuthConfig,
  Theme,
} from 'nauth-react';
```

## Project Structure

```
src/
├── components/       # Auth forms + UI components
├── contexts/         # NAuthContext, ThemeContext
├── hooks/            # useAuth, useUser, useProtectedRoute, useTheme
├── services/         # NAuth API client
├── types/            # TypeScript definitions
├── utils/            # Validators, formatters
└── styles/           # Tailwind CSS
```

## Development

```bash
npm install        # Install dependencies
npm run dev        # Development mode
npm run build      # Build library
npm test           # Run tests
npm run storybook  # Component documentation
```

## Publishing

```bash
npm run build
npm publish --access public
```

## License

MIT © [Rodrigo Landim](https://github.com/landim32)

## Links

- [GitHub](https://github.com/landim32/NAuth.React)
- [NPM](https://www.npmjs.com/package/nauth-react)
