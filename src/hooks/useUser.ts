import { useNAuth } from '../contexts/NAuthContext';

export const useUser = () => {
  const context = useNAuth();
  
  return {
    user: context.user,
    isLoading: context.isLoading,
    updateUser: context.updateUser,
    changePassword: context.changePassword,
    uploadImage: context.uploadImage,
    refreshUser: context.refreshUser,
    hasPassword: context.hasPassword,
  };
};
