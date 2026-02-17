# nauth-react

Modern React authentication component library for [NAuth API](https://github.com/landim32/NAuth.API) integration. Built with TypeScript, Tailwind CSS, and designed as a distributable NPM package.

[![npm version](https://img.shields.io/npm/v/nauth-react.svg)](https://www.npmjs.com/package/nauth-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Part of the NAuth ecosystem** — see [NAuth.API](https://github.com/landim32/NAuth.API) for the main project and full documentation.

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

## Example App

The `example-app/` directory contains a complete demo application showcasing all `nauth-react` features. It serves as both a reference implementation and a development playground.

### Features Demonstrated

- **Authentication flows** — Login, Register, Forgot Password, Reset Password
- **Protected routes** — Automatic redirect to login for unauthenticated users
- **User management** — Profile editing, password change, user search
- **Role management** — CRUD operations on roles
- **Dark mode** — Pre-configured dark theme with Tailwind CSS
- **Toast notifications** — Feedback via [Sonner](https://sonner.emilkowal.dev/)

### Pages & Routes

| Route | Page | Access |
|-------|------|--------|
| `/` | Home (landing) | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/forgot-password` | Forgot Password | Public |
| `/reset-password/:hash` | Reset Password | Public |
| `/dashboard` | Dashboard | Protected |
| `/profile` | User Profile | Protected |
| `/change-password` | Change Password | Protected |
| `/search-users` | Search Users | Protected |
| `/roles` | Role Management | Protected |
| `/user-edit` | User Edit | Protected |

### Running the Example App

```bash
# From the repository root, build the library first
npm run build

# Navigate to the example app
cd example-app

# Install dependencies (uses local nauth-react via file:..)
npm install

# Configure environment
cp .env.example .env
# Edit .env and set VITE_API_URL to your NAuth API backend

# Start the dev server
npm run dev
```

The app starts at `http://localhost:5173` by default.

### Example App Commands

```bash
npm run dev        # Vite dev server with HMR
npm run build      # TypeScript check + production build
npm run preview    # Preview production build
npm run type-check # TypeScript check only
npm run lint       # ESLint
```

### Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** — Fast dev server and build
- **Tailwind CSS 3** — Utility-first styling
- **react-router-dom v7** — Client-side routing
- **Sonner** — Toast notifications
- **Lucide React** — Icons

### Project Structure

```
example-app/
├── src/
│   ├── main.tsx              # App entry point
│   ├── App.tsx               # Root component with routing + NAuthProvider
│   ├── index.css             # Tailwind global styles + CSS variables
│   ├── components/
│   │   ├── Layout.tsx        # Main layout with Navbar + Outlet
│   │   ├── Navbar.tsx        # Navigation header (auth-aware)
│   │   ├── ProtectedRoute.tsx # Route guard component
│   │   ├── UserMenu.tsx      # User dropdown menu
│   │   └── ui/Card.tsx       # Reusable Card component
│   ├── pages/
│   │   ├── HomePage.tsx          # Landing page
│   │   ├── LoginPage.tsx         # Login form
│   │   ├── RegisterPage.tsx      # Registration form
│   │   ├── ForgotPasswordPage.tsx # Password recovery
│   │   ├── ResetPasswordPage.tsx  # Password reset
│   │   ├── DashboardPage.tsx     # Protected dashboard
│   │   ├── ProfilePage.tsx       # User profile
│   │   ├── ChangePasswordPage.tsx # Change password
│   │   ├── SearchUsersPage.tsx   # User search
│   │   ├── RolesPage.tsx         # Role management
│   │   └── UserEditPage.tsx      # User editing
│   └── lib/
│       ├── constants.ts      # Routes and app constants
│       └── utils.ts          # Utility functions
├── .env.example              # Environment template
├── tailwind.config.js        # Tailwind configuration
├── vite.config.ts            # Vite build configuration
└── package.json              # Dependencies and scripts
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

## NAuth Ecosystem

This package is part of the **NAuth** ecosystem. The main project is [NAuth.API](https://github.com/landim32/NAuth.API).

| Project | Description |
|---------|-------------|
| **[NAuth.API](https://github.com/landim32/NAuth.API)** | Central REST API backend (main project) |
| **[NAuth.DTO](https://github.com/landim32/NAuth.DTO)** | Shared Data Transfer Objects (NuGet) |
| **[NAuth.ACL](https://github.com/landim32/NAuth.ACL)** | HTTP client library (NuGet) |
| **nauth-react** | React component library — you are here |
| **example-app/** | Demo application (included in this repo) |
| **[NAuth.App](https://github.com/landim32/NAuth.APP)** | Frontend web application |

## License

MIT © [Rodrigo Landim](https://github.com/landim32)

## Links

- [GitHub](https://github.com/landim32/NAuth.React)
- [NPM](https://www.npmjs.com/package/nauth-react)
- [NAuth.API (main project)](https://github.com/landim32/NAuth.API)
