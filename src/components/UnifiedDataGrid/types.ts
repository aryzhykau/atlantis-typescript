import { GridColDef, GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { ReactNode } from 'react';

export interface UnifiedDataGridProps<T extends GridValidRowModel = GridValidRowModel> {
  // Core data
  rows: T[];
  columns: GridColDef<T>[];
  loading?: boolean;
  
  // Navigation and actions
  entityType?: EntityType;
  onRowClick?: (row: T) => void;
  getRowNavigationUrl?: (row: T) => string;
  
  // Pagination
  pageSizeOptions?: number[];
  initialPageSize?: number;
  
  // Server-side pagination (optional)
  serverSide?: boolean;
  rowCount?: number;
  paginationModel?: { page: number; pageSize: number };
  onPaginationModelChange?: (model: { page: number; pageSize: number }) => void;
  
  // Styling
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  hideHeader?: boolean;
  variant?: 'default' | 'compact' | 'elevated';
  height?: number | string;
  
  // Accessibility
  ariaLabel?: string;
  
  // Custom styling
  sx?: object;
}

export type EntityType = 
  | 'clients' 
  | 'trainers' 
  | 'students' 
  | 'admins' 
  | 'invoices' 
  | 'payments' 
  | 'subscriptions' 
  | 'training-types'
  | 'client-contacts';

export interface CellComponentProps<T extends GridValidRowModel = GridValidRowModel> {
  params: GridRenderCellParams<T>;
  value?: any;
}

export interface PhoneData {
  countryCode: string;
  number: string;
}

export interface StatusData {
  isActive: boolean;
  label?: string;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default';
}

export interface NavigationConfig {
  hasDetailPage: boolean;
  baseUrl: string;
  idField?: string;
}

export const ENTITY_NAVIGATION_CONFIG: Record<EntityType, NavigationConfig> = {
  clients: { hasDetailPage: true, baseUrl: '/home/clients', idField: 'id' },
  trainers: { hasDetailPage: true, baseUrl: '/home/trainers', idField: 'id' },
  students: { hasDetailPage: true, baseUrl: '/home/students', idField: 'id' },
  admins: { hasDetailPage: false, baseUrl: '/home/admin-management' },
  invoices: { hasDetailPage: false, baseUrl: '/home/invoices-payments' },
  payments: { hasDetailPage: false, baseUrl: '/home/invoices-payments' },
  subscriptions: { hasDetailPage: false, baseUrl: '/home/subscriptions' },
  'training-types': { hasDetailPage: false, baseUrl: '/home/training-types' },
  'client-contacts': { hasDetailPage: false, baseUrl: '/home/client-contacts' },
};
