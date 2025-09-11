import { IMenuItems } from '../models/mainMenu';
import { UserRole } from '../features/trainers/models/trainer';

export const getFilteredMenuItems = (menuItems: IMenuItems[], userRole?: string): IMenuItems[] => {
  return menuItems.filter(item => {
    if (item.ownerOnly) {
      if (userRole !== UserRole.OWNER) return false;
    }

    return true;
  });
};

// Extended filter which can hide mobile-only items for desktop sidebars
export const getFilteredMenuItemsForContext = (menuItems: IMenuItems[], userRole?: string, forMobile = false): IMenuItems[] => {
  return menuItems.filter(item => {
    if (item.ownerOnly) {
      if (userRole !== UserRole.OWNER) return false;
    }

    if (!forMobile && item.mobileOnly) return false;

    return true;
  });
};
