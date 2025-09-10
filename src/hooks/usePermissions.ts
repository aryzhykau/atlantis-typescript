import { useGetCurrentUserQuery } from '../store/apis/userApi';
import { UserRole } from '../features/trainers/models/trainer';

export const useCurrentUser = () => {
  const { data: user, isLoading, error } = useGetCurrentUserQuery();
  return { user, isLoading, error };
};

export const useIsOwner = () => {
  const { user } = useCurrentUser();
  return user?.role === UserRole.OWNER;
};

export const useIsAdmin = () => {
  const { user } = useCurrentUser();
  return user?.role === UserRole.ADMIN;
};

export const useIsAdminOrOwner = () => {
  const { user } = useCurrentUser();
  return user?.role === UserRole.ADMIN || user?.role === UserRole.OWNER;
};

export const useCanManageAdmins = () => {
  const { user } = useCurrentUser();
  return user?.role === UserRole.OWNER;
};
