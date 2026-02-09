import { useNAuth } from '../contexts/NAuthContext';

export const useAuth = () => {
  const context = useNAuth();
  
  return {
    user: context.user,
    token: context.token,
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    login: context.login,
    logout: context.logout,
    register: context.register,
  };
};
