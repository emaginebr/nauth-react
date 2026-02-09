// User & Authentication Types
export enum UserStatus {
  Active = 1,
  Inactive = 2,
  Suspended = 3,
  Blocked = 4,
}

export interface UserRole {
  roleId: number;
  slug: string;
  name: string;
}

export type RoleInfo = UserRole;

export interface RoleFormData {
  roleId: number;
  name: string;
  slug: string;
}

export interface UserPhone {
  phone: string;
}

export interface UserAddress {
  zipCode: string;
  address: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface UserInfo {
  userId: number;
  slug: string;
  imageUrl: string;
  name: string;
  email: string;
  hash: string;
  isAdmin: boolean;
  birthDate: string;
  idDocument: string;
  pixKey?: string;
  password?: string | null;
  status?: number;
  roles: UserRole[];
  phones: UserPhone[];
  addresses: UserAddress[];
  createAt: string;
  updateAt: string;
}

export interface AuthSession {
  token: string;
  user: UserInfo;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  birthDate?: string;
  idDocument?: string;
  pixKey?: string;
  phones?: UserPhone[];
  addresses?: UserAddress[];
  roles?: { roleId: number }[];
}

export interface ChangePasswordData {
  oldPassword?: string;
  newPassword: string;
}

export interface ResetPasswordData {
  recoveryHash: string;
  newPassword: string;
}

// Pagination Types
export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface UserSearchParams {
  searchTerm: string;
  page: number;
  pageSize: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Component Props Types
export interface NAuthConfig {
  apiUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
  storageKey?: string;
  storageType?: 'localStorage' | 'sessionStorage';
  redirectOnUnauthorized?: string;
  autoRefreshToken?: boolean;
  tokenRefreshInterval?: number;
  enableFingerprinting?: boolean;
  defaultTheme?: 'light' | 'dark' | 'system';
  themeStorageKey?: string;
  onAuthChange?: (user: UserInfo | null) => void;
  onLogin?: (user: UserInfo) => void;
  onLogout?: () => void;
  onError?: (error: Error) => void;
  passwordMinLength?: number;
  requireSpecialChar?: boolean;
  requireNumber?: boolean;
}

export interface NAuthContextValue {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<UserInfo>;
  logout: () => void;
  register: (data: RegisterData) => Promise<UserInfo>;
  updateUser: (data: Partial<UserInfo>) => Promise<UserInfo>;
  createUser: (data: Partial<UserInfo>) => Promise<UserInfo>;
  getUserById: (userId: number) => Promise<UserInfo>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  sendRecoveryEmail: (email: string) => Promise<void>;
  hasPassword: () => Promise<boolean>;
  uploadImage: (file: File) => Promise<string>;
  refreshUser: () => Promise<UserInfo>;
  searchUsers: (params: UserSearchParams) => Promise<PagedResult<UserInfo>>;
  fetchRoles: () => Promise<RoleInfo[]>;
  getRoleById: (roleId: number) => Promise<RoleInfo>;
  createRole: (data: RoleFormData) => Promise<RoleInfo>;
  updateRole: (data: RoleFormData) => Promise<RoleInfo>;
  deleteRole: (roleId: number) => Promise<string>;
}

export type Theme = 'dark' | 'light' | 'system';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Form Props
export interface LoginFormProps {
  onSuccess?: (user: UserInfo) => void;
  onError?: (error: Error) => void;
  showRememberMe?: boolean;
  customSubmitText?: string;
  className?: string;
  styles?: {
    container?: string;
    input?: string;
    button?: string;
  };
}

export interface RegisterFormProps {
  onSuccess?: (user: UserInfo) => void;
  onError?: (error: Error) => void;
  steps?: Array<'basic' | 'personal' | 'address'>;
  showProgressBar?: boolean;
  showTermsCheckbox?: boolean;
  termsUrl?: string;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  className?: string;
}

export interface ProfileFormProps {
  user?: UserInfo;
  onSuccess?: (user: UserInfo) => void;
  onError?: (error: Error) => void;
  showImageUpload?: boolean;
  enablePhoneEdit?: boolean;
  enableAddressEdit?: boolean;
  enableRoleEdit?: boolean;
  className?: string;
}

export interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export interface ResetPasswordFormProps {
  recoveryHash?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export interface ChangePasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export interface SearchFormProps {
  onSuccess?: (result: PagedResult<UserInfo>) => void;
  onError?: (error: Error) => void;
  onUserClick?: (user: UserInfo) => void;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  showUserAvatar?: boolean;
  className?: string;
  styles?: {
    container?: string;
    searchBar?: string;
    table?: string;
    pagination?: string;
  };
}

export interface UserTableProps {
  users?: UserInfo[];
  pageSize?: number;
  currentPage?: number;
  totalPages?: number;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  columns?: Array<'name' | 'email' | 'roles' | 'phone' | 'createdAt' | 'actions'>;
  onUserClick?: (user: UserInfo) => void;
  onEdit?: (user: UserInfo) => void;
  onDelete?: (user: UserInfo) => void;
  onPageChange?: (page: number) => void;
  className?: string;
}

export interface UserAvatarProps {
  user?: UserInfo;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
}

export interface UserDashboardProps {
  className?: string;
}

export interface UserDetailsCardProps {
  user: UserInfo;
  className?: string;
}

export interface RoleManagerProps {
  userId?: number;
  className?: string;
}

export interface RoleListProps {
  onRoleClick?: (role: RoleInfo) => void;
  onEdit?: (role: RoleInfo) => void;
  onDelete?: (role: RoleInfo) => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showCreateButton?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  className?: string;
  styles?: {
    container?: string;
    searchBar?: string;
    table?: string;
    pagination?: string;
  };
}

export interface RoleFormProps {
  roleId?: number;
  onSuccess?: (role: RoleInfo) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  className?: string;
}

export interface UserEditFormProps {
  userId?: number;
  onSuccess?: (user: UserInfo) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  className?: string;
}

// Constants
export const API_ENDPOINTS = {
  LOGIN: '/User/loginWithEmail',
  GET_ME: '/User/getMe',
  GET_BY_ID: '/User/getById',
  GET_BY_EMAIL: '/User/getByEmail',
  GET_BY_SLUG: '/User/getBySlug',
  REGISTER: '/User/insert',
  UPDATE_USER: '/User/update',
  UPLOAD_IMAGE: '/User/uploadImageUser',
  HAS_PASSWORD: '/User/hasPassword',
  CHANGE_PASSWORD: '/User/changePassword',
  SEND_RECOVERY_EMAIL: '/User/sendRecoveryMail',
  RESET_PASSWORD: '/User/changePasswordUsingHash',
  LIST_USERS: '/User/list',
  SEARCH_USERS: '/User/search',
  LIST_ROLES: '/Role/list',
  GET_ROLE_BY_ID: '/Role/getById',
  GET_ROLE_BY_SLUG: '/Role/getBySlug',
  INSERT_ROLE: '/Role/insert',
  UPDATE_ROLE: '/Role/update',
  DELETE_ROLE: '/Role/delete',
} as const;

export const VERSION = '1.0.0';
