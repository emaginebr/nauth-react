import axios, { AxiosInstance, AxiosError } from 'axios';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import type {
  UserInfo,
  AuthSession,
  LoginCredentials,
  RegisterData,
  ChangePasswordData,
  ResetPasswordData,
  UserRole,
  RoleInfo,
  RoleFormData,
  ApiError,
  NAuthConfig,
  PagedResult,
  UserSearchParams,
} from '../types';
import { API_ENDPOINTS } from '../types';

export class NAuthAPI {
  private client: AxiosInstance;
  private config: NAuthConfig;
  private fingerprint: string | null = null;
  private isDevelopment: boolean;

  constructor(config: NAuthConfig) {
    /*
    this.isDevelopment = typeof import.meta !== 'undefined' && 
                         import.meta.env && 
                         (import.meta.env.DEV === true || import.meta.env.MODE === 'development');
    */
   this.isDevelopment = true;
    this.config = {
      timeout: 30000,
      storageKey: 'nauth_token',
      storageType: 'localStorage',
      enableFingerprinting: true,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.apiUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
      },
    });

    this.setupInterceptors();
    
    if (this.config.enableFingerprinting) {
      this.initFingerprint();
    }
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add device fingerprint
        if (this.fingerprint) {
          config.headers['X-Device-Fingerprint'] = this.fingerprint;
        }

        // Add user agent
        //config.headers['User-Agent'] = navigator.userAgent;

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: error.message,
          status: error.response?.status || 500,
          errors: error.response?.data as Record<string, string[]>,
        };

        // Handle unauthorized
        if (error.response?.status === 401) {
          this.clearToken();
          if (this.config.redirectOnUnauthorized) {
            window.location.href = this.config.redirectOnUnauthorized;
          }
        }

        if (this.config.onError) {
          this.config.onError(new Error(apiError.message));
        }

        return Promise.reject(apiError);
      }
    );
  }

  private async initFingerprint(): Promise<void> {
    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      this.fingerprint = result.visitorId;
    } catch (error) {
      console.warn('Failed to initialize fingerprint:', error);
    }
  }

  private getStorage(): Storage {
    return this.config.storageType === 'sessionStorage'
      ? sessionStorage
      : localStorage;
  }

  private getToken(): string | null {
    return this.getStorage().getItem(this.config.storageKey || 'nauth_token');
  }

  private setToken(token: string): void {
    this.getStorage().setItem(this.config.storageKey || 'nauth_token', token);
  }

  private clearToken(): void {
    this.getStorage().removeItem(this.config.storageKey || 'nauth_token');
  }

  private log(method: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`[NAuthAPI.${method}]`, ...args);
    }
  }

  // Authentication Methods

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    this.log('login', { email: credentials.email });
    const response = await this.client.post<AuthSession>(
      API_ENDPOINTS.LOGIN,
      credentials
    );
    
    const session = response.data;
    this.setToken(session.token);
    
    if (this.config.onLogin) {
      this.config.onLogin(session.user);
    }
    
    return session;
  }

  async register(data: RegisterData): Promise<UserInfo> {
    this.log('register', { email: data.email, name: data.name });
    const response = await this.client.post<UserInfo>(
      API_ENDPOINTS.REGISTER,
      data
    );
    return response.data;
  }

  logout(): void {
    this.log('logout');
    this.clearToken();
    
    if (this.config.onLogout) {
      this.config.onLogout();
    }
  }

  // User Methods

  async getMe(): Promise<UserInfo> {
    this.log('getMe');
    const response = await this.client.get<UserInfo>(API_ENDPOINTS.GET_ME);
    return response.data;
  }

  async getUserById(userId: number): Promise<UserInfo> {
    this.log('getUserById', { userId });
    const response = await this.client.get<UserInfo>(
      `${API_ENDPOINTS.GET_BY_ID}/${userId}`
    );
    return response.data;
  }

  async getUserByEmail(email: string): Promise<UserInfo> {
    this.log('getUserByEmail', { email });
    const response = await this.client.get<UserInfo>(
      `${API_ENDPOINTS.GET_BY_EMAIL}/${email}`
    );
    return response.data;
  }

  async getUserBySlug(slug: string): Promise<UserInfo> {
    this.log('getUserBySlug', { slug });
    const response = await this.client.get<UserInfo>(
      `${API_ENDPOINTS.GET_BY_SLUG}/${slug}`
    );
    return response.data;
  }

  async updateUser(data: Partial<UserInfo>): Promise<UserInfo> {
    this.log('updateUser', data);
    const response = await this.client.post<UserInfo>(
      API_ENDPOINTS.UPDATE_USER,
      data
    );
    return response.data;
  }

  async createUser(data: Partial<UserInfo>): Promise<UserInfo> {
    this.log('createUser', { email: data.email, name: data.name });
    const response = await this.client.post<UserInfo>(
      API_ENDPOINTS.REGISTER,
      data
    );
    return response.data;
  }

  async uploadImage(file: File): Promise<string> {
    this.log('uploadImage', { fileName: file.name, fileSize: file.size });
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<string>(
      API_ENDPOINTS.UPLOAD_IMAGE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async hasPassword(): Promise<boolean> {
    this.log('hasPassword');
    const response = await this.client.get<boolean>(API_ENDPOINTS.HAS_PASSWORD);
    return response.data;
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    this.log('changePassword');
    await this.client.post(API_ENDPOINTS.CHANGE_PASSWORD, data);
  }

  async sendRecoveryEmail(email: string): Promise<void> {
    this.log('sendRecoveryEmail', { email });
    await this.client.get(`${API_ENDPOINTS.SEND_RECOVERY_EMAIL}/${email}`);
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    this.log('resetPassword');
    await this.client.post(API_ENDPOINTS.RESET_PASSWORD, data);
  }

  async listUsers(take: number = 50): Promise<UserInfo[]> {
    this.log('listUsers', { take });
    const response = await this.client.get<UserInfo[]>(
      `${API_ENDPOINTS.LIST_USERS}/${take}`
    );
    return response.data;
  }

  async searchUsers(params: UserSearchParams): Promise<PagedResult<UserInfo>> {
    this.log('searchUsers', { params });
    const response = await this.client.post<PagedResult<UserInfo>>(
      API_ENDPOINTS.SEARCH_USERS,
      params
    );
    return response.data;
  }

  // Role Methods

  async listRoles(take: number = 50): Promise<UserRole[]> {
    this.log('listRoles', { take });
    const response = await this.client.get<UserRole[]>(
      `${API_ENDPOINTS.LIST_ROLES}/${take}`
    );
    return response.data;
  }

  async fetchRoles(): Promise<RoleInfo[]> {
    this.log('fetchRoles');
    const response = await this.client.get<RoleInfo[]>(
      API_ENDPOINTS.LIST_ROLES
    );
    this.log('fetchRoles - response', response.data);
    return response.data;
  }

  async getRoleById(roleId: number): Promise<UserRole> {
    this.log('getRoleById', { roleId });
    const response = await this.client.get<UserRole>(
      `${API_ENDPOINTS.GET_ROLE_BY_ID}/${roleId}`
    );
    return response.data;
  }

  async getRoleBySlug(slug: string): Promise<UserRole> {
    this.log('getRoleBySlug', { slug });
    const response = await this.client.get<UserRole>(
      `${API_ENDPOINTS.GET_ROLE_BY_SLUG}/${slug}`
    );
    return response.data;
  }

  async createRole(data: RoleFormData): Promise<RoleInfo> {
    this.log('createRole', { name: data.name, slug: data.slug });
    const payload = {
      roleId: 0,
      name: data.name,
      slug: data.slug || '',
    };

    const response = await this.client.post<RoleInfo>(
      API_ENDPOINTS.INSERT_ROLE,
      payload
    );
    return response.data;
  }

  async updateRole(data: RoleFormData): Promise<RoleInfo> {
    this.log('updateRole', { roleId: data.roleId, name: data.name });
    const payload = {
      roleId: data.roleId,
      name: data.name,
      slug: data.slug || '',
    };

    const response = await this.client.post<RoleInfo>(
      API_ENDPOINTS.UPDATE_ROLE,
      payload
    );
    return response.data;
  }

  async deleteRole(roleId: number): Promise<string> {
    this.log('deleteRole', { roleId });
    const response = await this.client.delete<string>(
      `${API_ENDPOINTS.DELETE_ROLE}/${roleId}`
    );
    this.log('deleteRole - response', response.data);
    return response.data;
  }

  // Utility Methods

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentToken(): string | null {
    return this.getToken();
  }

  setAuthToken(token: string): void {
    this.setToken(token);
  }

  clearAuth(): void {
    this.clearToken();
  }
}

// Factory function to create API client
export function createNAuthClient(config: NAuthConfig): NAuthAPI {
  return new NAuthAPI(config);
}
