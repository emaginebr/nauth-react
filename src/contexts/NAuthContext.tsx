import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { createNAuthClient } from '../services/nauth-api';
import type {
  UserInfo,
  NAuthConfig,
  NAuthContextValue,
  LoginCredentials,
  RegisterData,
  ChangePasswordData,
  ResetPasswordData,
} from '../types';

const NAuthContext = createContext<NAuthContextValue | undefined>(undefined);

export interface NAuthProviderProps {
  config: NAuthConfig;
  children: React.ReactNode;
}

export const NAuthProvider: React.FC<NAuthProviderProps> = ({ config, children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const api = useMemo(() => createNAuthClient(config), [config]);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = api.getCurrentToken();
        
        if (storedToken) {
          setToken(storedToken);
          const userData = await api.getMe();
          setUser(userData);
          
          if (config.onAuthChange) {
            config.onAuthChange(userData);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        api.clearAuth();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [api, config]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<UserInfo> => {
      setIsLoading(true);
      try {
        const session = await api.login(credentials);
        setToken(session.token);
        setUser(session.user);
        
        if (config.onAuthChange) {
          config.onAuthChange(session.user);
        }
        
        return session.user;
      } finally {
        setIsLoading(false);
      }
    },
    [api, config]
  );

  const logout = useCallback(() => {
    api.logout();
    setToken(null);
    setUser(null);
    
    if (config.onAuthChange) {
      config.onAuthChange(null);
    }
  }, [api, config]);

  const register = useCallback(
    async (data: RegisterData): Promise<UserInfo> => {
      setIsLoading(true);
      try {
        const newUser = await api.register(data);
        return newUser;
      } finally {
        setIsLoading(false);
      }
    },
    [api]
  );

  const updateUser = useCallback(
    async (data: Partial<UserInfo>): Promise<UserInfo> => {
      setIsLoading(true);
      try {
        const updatedUser = await api.updateUser(data);
        setUser(updatedUser);
        
        if (config.onAuthChange) {
          config.onAuthChange(updatedUser);
        }
        
        return updatedUser;
      } finally {
        setIsLoading(false);
      }
    },
    [api, config]
  );

  const createUser = useCallback(
    async (data: Partial<UserInfo>): Promise<UserInfo> => {
      setIsLoading(true);
      try {
        const newUser = await api.createUser(data);
        return newUser;
      } finally {
        setIsLoading(false);
      }
    },
    [api]
  );

  const getUserById = useCallback(
    async (userId: number): Promise<UserInfo> => {
      return await api.getUserById(userId);
    },
    [api]
  );

  const changePassword = useCallback(
    async (data: ChangePasswordData): Promise<void> => {
      await api.changePassword(data);
    },
    [api]
  );

  const resetPassword = useCallback(
    async (data: ResetPasswordData): Promise<void> => {
      await api.resetPassword(data);
    },
    [api]
  );

  const sendRecoveryEmail = useCallback(
    async (email: string): Promise<void> => {
      await api.sendRecoveryEmail(email);
    },
    [api]
  );

  const hasPassword = useCallback(async (): Promise<boolean> => {
    return await api.hasPassword();
  }, [api]);

  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      const imageUrl = await api.uploadImage(file);
      
      if (user) {
        const updatedUser = { ...user, imageUrl };
        setUser(updatedUser);
        
        if (config.onAuthChange) {
          config.onAuthChange(updatedUser);
        }
      }
      
      return imageUrl;
    },
    [api, user, config]
  );

  const refreshUser = useCallback(async (): Promise<UserInfo> => {
    const userData = await api.getMe();
    setUser(userData);
    
    if (config.onAuthChange) {
      config.onAuthChange(userData);
    }
    
    return userData;
  }, [api, config]);

  const searchUsers = useCallback(
    async (params: { searchTerm: string; page: number; pageSize: number }) => {
      return await api.searchUsers(params);
    },
    [api]
  );

  const fetchRoles = useCallback(async () => {
    return await api.fetchRoles();
  }, [api]);

  const getRoleById = useCallback(
    async (roleId: number) => {
      return await api.getRoleById(roleId);
    },
    [api]
  );

  const createRole = useCallback(
    async (data: { roleId: number; name: string; slug: string }) => {
      return await api.createRole(data);
    },
    [api]
  );

  const updateRole = useCallback(
    async (data: { roleId: number; name: string; slug: string }) => {
      return await api.updateRole(data);
    },
    [api]
  );

  const deleteRole = useCallback(
    async (roleId: number) => {
      return await api.deleteRole(roleId);
    },
    [api]
  );

  const value: NAuthContextValue = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
    register,
    updateUser,
    createUser,
    getUserById,
    changePassword,
    resetPassword,
    sendRecoveryEmail,
    hasPassword,
    uploadImage,
    refreshUser,
    searchUsers,
    fetchRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
  };

  return <NAuthContext.Provider value={value}>{children}</NAuthContext.Provider>;
};

export const useNAuth = (): NAuthContextValue => {
  const context = useContext(NAuthContext);
  
  if (context === undefined) {
    throw new Error('useNAuth must be used within a NAuthProvider');
  }
  
  return context;
};

export type { NAuthConfig, NAuthContextValue };
