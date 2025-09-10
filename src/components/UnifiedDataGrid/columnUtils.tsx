import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { 
  PhoneCell, 
  EmailCell, 
  StatusCell, 
  ClickableCell, 
  CurrencyCell, 
  DateCell 
} from './cells';
import { StatusData } from './types';

export interface EnhancedColumnOptions {
  enableAccessibility?: boolean;
  currency?: string;
  colorizeByValue?: boolean;
  dateFormat?: string;
  includeTime?: boolean;
  navigateUrl?: string | ((row: any) => string);
  onClick?: (row: any) => void;
  variant?: 'link' | 'button' | 'text';
}

// Helper functions to create enhanced column definitions
export const createPhoneColumn = (
  field: string,
  headerName: string,
  options: EnhancedColumnOptions = {},
  colDefOverrides: Partial<GridColDef> = {}
): GridColDef => ({
  field,
  headerName,
  width: 150,
  sortable: false,
  renderCell: (params: GridRenderCellParams) => (
    <PhoneCell 
      params={params}
      value={params.value}
      enableAccessibility={options.enableAccessibility}
    />
  ),
  ...colDefOverrides,
});

export const createEmailColumn = (
  field: string,
  headerName: string = 'Email',
  options: EnhancedColumnOptions = {},
  colDefOverrides: Partial<GridColDef> = {}
): GridColDef => ({
  field,
  headerName,
  width: 200,
  sortable: true,
  renderCell: (params: GridRenderCellParams) => (
    <EmailCell 
      params={params}
      value={params.value}
      enableAccessibility={options.enableAccessibility}
    />
  ),
  ...colDefOverrides,
});

export const createStatusColumn = (
  field: string,
  headerName: string = 'Статус',
  colDefOverrides: Partial<GridColDef> = {}
): GridColDef => ({
  field,
  headerName,
  width: 120,
  sortable: true,
  renderCell: (params: GridRenderCellParams) => (
    <StatusCell 
      params={params}
      value={params.value as boolean | StatusData}
    />
  ),
  ...colDefOverrides,
});

export const createClickableColumn = (
  field: string,
  headerName: string,
  options: EnhancedColumnOptions = {},
  colDefOverrides: Partial<GridColDef> = {}
): GridColDef => ({
  field,
  headerName,
  width: 100,
  sortable: false,
  renderCell: (params: GridRenderCellParams) => {
    const navigateUrl = typeof options.navigateUrl === 'function'
      ? options.navigateUrl(params.row)
      : options.navigateUrl;
    
    return (
      <ClickableCell 
        params={params}
        value={params.value}
        navigateUrl={navigateUrl}
        onClick={options.onClick ? () => options.onClick!(params.row) : undefined}
        variant={options.variant}
      />
    );
  },
  ...colDefOverrides,
});

export const createCurrencyColumn = (
  field: string,
  headerName: string,
  options: EnhancedColumnOptions = {},
  colDefOverrides: Partial<GridColDef> = {}
): GridColDef => ({
  field,
  headerName,
  width: 120,
  sortable: true,
  type: 'number',
  renderCell: (params: GridRenderCellParams) => (
    <CurrencyCell 
      params={params}
      value={params.value}
      currency={options.currency}
      colorizeByValue={options.colorizeByValue}
    />
  ),
  ...colDefOverrides,
});

export const createDateColumn = (
  field: string,
  headerName: string,
  options: EnhancedColumnOptions = {},
  colDefOverrides: Partial<GridColDef> = {}
): GridColDef => ({
  field,
  headerName,
  width: 130,
  sortable: true,
  type: 'date',
  valueGetter: (value: any) => {
    // Convert string dates to Date objects for MUI DataGrid
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  },
  renderCell: (params: GridRenderCellParams) => (
    <DateCell 
      params={params}
      value={params.value}
      format={options.dateFormat}
      includeTime={options.includeTime}
    />
  ),
  ...colDefOverrides,
});

// Utility function to enhance existing columns with accessibility
export const enhanceColumnsWithAccessibility = (
  columns: GridColDef[],
  fieldOptions: Record<string, EnhancedColumnOptions> = {}
): GridColDef[] => {
  return columns.map((column) => {
    const field = column.field;
    const options = fieldOptions[field] || {};

    // Auto-detect common field patterns and enhance them
    if (field.toLowerCase().includes('email')) {
      return createEmailColumn(field, column.headerName || 'Email', options, column);
    }
    
    if (field.toLowerCase().includes('phone') || field.toLowerCase().includes('телефон')) {
      return createPhoneColumn(field, column.headerName || 'Телефон', options, column);
    }
    
    if (field.toLowerCase().includes('status') || field.toLowerCase().includes('active')) {
      return createStatusColumn(field, column.headerName || 'Статус', column);
    }
    
    if (field.toLowerCase().includes('date') || field.toLowerCase().includes('дата')) {
      return createDateColumn(field, column.headerName || 'Дата', options, column);
    }
    
    if (field.toLowerCase().includes('balance') || field.toLowerCase().includes('amount') || 
        field.toLowerCase().includes('price') || field.toLowerCase().includes('salary')) {
      return createCurrencyColumn(field, column.headerName || 'Сумма', options, column);
    }

    return column;
  });
};
