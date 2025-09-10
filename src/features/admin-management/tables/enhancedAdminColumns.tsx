import { GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Edit, Block, CheckCircle } from '@mui/icons-material';
import { IAdminResponse } from '../models/admin';
import { PhoneCell } from '../../../components/UnifiedDataGrid/cells/PhoneCell';
import { EmailCell } from '../../../components/UnifiedDataGrid/cells/EmailCell';
import { StatusCell } from '../../../components/UnifiedDataGrid/cells/StatusCell';

interface AdminColumnsProps {
  onEdit: (admin: IAdminResponse) => void;
  onToggleStatus: (admin: IAdminResponse) => void;
}

export const createEnhancedAdminColumns = ({ 
  onEdit,
  onToggleStatus 
}: AdminColumnsProps): GridColDef[] => [
  { 
    field: 'id', 
    headerName: 'ID', 
    width: 70,
    align: 'center',
    headerAlign: 'center',
  },
  { 
    field: 'first_name', 
    headerName: 'Имя', 
    width: 130,
    flex: 0.8,
    minWidth: 120,
  },
  { 
    field: 'last_name', 
    headerName: 'Фамилия', 
    width: 130,
    flex: 0.8,
    minWidth: 120,
  },
  { 
    field: 'email', 
    headerName: 'Email', 
    width: 200,
    flex: 1,
    minWidth: 180,
    renderCell: (params) => (
      <EmailCell params={params} value={params.value} />
    ),
  },
  { 
    field: 'phone', 
    headerName: 'Телефон', 
    width: 150,
    flex: 0.9,
    minWidth: 140,
    valueGetter: (_, row) => `${row.phone_country_code}${row.phone_number}`,
    renderCell: (params) => (
      <PhoneCell params={params} value={params.value} />
    ),
  },
  {
    field: 'is_active',
    headerName: 'Статус',
    width: 120,
    flex: 0.6,
    minWidth: 100,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <StatusCell params={params} />
    ),
  },
  {
    field: 'actions',
    type: 'actions',
    headerName: 'Действия',
    width: 150,
    flex: 0.7,
    minWidth: 130,
    align: 'center',
    headerAlign: 'center',
    getActions: (params) => [
      <GridActionsCellItem
        key="edit"
        icon={<Edit />}
        label="Редактировать"
        onClick={() => onEdit(params.row as IAdminResponse)}
        sx={{
          '&:hover': {
            backgroundColor: 'action.hover',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      />,
      <GridActionsCellItem
        key="toggle-status"
        icon={params.row.is_active ? <Block /> : <CheckCircle />}
        label={params.row.is_active ? 'Отключить' : 'Активировать'}
        onClick={() => onToggleStatus(params.row as IAdminResponse)}
        sx={{
          '&:hover': {
            backgroundColor: 'action.hover',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.2s ease-in-out',
          color: params.row.is_active ? 'warning.main' : 'success.main',
        }}
      />,
    ],
  },
];
