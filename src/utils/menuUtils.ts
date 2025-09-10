import { IMenuItems } from '../models/mainMenu';
import { UserRole } from '../features/trainers/models/trainer';

export const getFilteredMenuItems = (menuItems: IMenuItems[], userRole?: string): IMenuItems[] => {
  return menuItems.filter(item => {
    if (item.ownerOnly) {
      return userRole === UserRole.OWNER;
    }
    return true;
  });
};
