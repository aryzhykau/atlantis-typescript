import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Typography, Button, Chip } from "@mui/material";
import { 
  createClickableColumn, 
  createDateColumn
} from "../../../components/UnifiedDataGrid";
import { Phone, PersonAdd, Refresh } from '@mui/icons-material';
import { ClientContactTask, ClientContactReason } from "../../../store/apis/clientContactsApi";
import { useUpdateClientContactMutation } from "../../../store/apis/clientContactsApi";

interface EnhancedClientContactColumnsProps {
  clientMap: Map<number, { id: number; first_name: string; last_name: string; phone_country_code: string; phone_number: string; }>;
  onUpdate: () => void;
}

export const createEnhancedClientContactColumns = ({ 
  clientMap, 
  onUpdate 
}: EnhancedClientContactColumnsProps): GridColDef[] => {
  return [
    createClickableColumn("id", "ID", {
      variant: 'text'
    }, {
      width: 90,
      sortable: false,
    }),

    {
      field: "client_name",
      headerName: "Клиент",
      width: 200,
      flex: 1,
      minWidth: 150,
      sortable: true,
      valueGetter: (_value, row: ClientContactTask) => {
        const client = clientMap.get(row.client_id);
        return client ? `${client.first_name} ${client.last_name}` : `ID: ${row.client_id}`;
      },
      renderCell: (params: GridRenderCellParams<ClientContactTask>) => {
        const client = clientMap.get(params.row.client_id);
        return (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: client ? 600 : 400,
              color: client ? 'text.primary' : 'text.secondary'
            }}
          >
            {params.value}
          </Typography>
        );
      },
    },

    {
      field: "phone",
      headerName: "Телефон",
      width: 160,
      sortable: true,
      valueGetter: (_value, row: ClientContactTask) => {
        const client = clientMap.get(row.client_id);
        return client ? `${client.phone_country_code} ${client.phone_number}` : '';
      },
      renderCell: (params: GridRenderCellParams<ClientContactTask>) => {
        const client = clientMap.get(params.row.client_id);
        if (!client || !params.value) {
          return (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          );
        }
        
        return (
          <Button
            size="small"
            startIcon={<Phone sx={{ fontSize: 16 }} />}
            href={`tel:${params.value}`}
            onClick={(e) => e.stopPropagation()}
            sx={{
              textTransform: 'none',
              minWidth: 'auto',
              p: 0.5,
              fontSize: '0.75rem',
              color: 'primary.main',
              '&:hover': {
                background: 'primary.50',
              }
            }}
          >
            {params.value}
          </Button>
        );
      },
    },

    {
      field: "reason",
      headerName: "Причина",
      width: 140,
      sortable: true,
      renderCell: (params: GridRenderCellParams<ClientContactTask>) => {
        const reason = params.row.reason as ClientContactReason;
        let label = '';
        let color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' = 'primary';
        let icon = null;

        switch (reason) {
          case 'NEW_CLIENT':
            label = 'Новый клиент';
            color = 'success';
            icon = <PersonAdd sx={{ fontSize: 16 }} />;
            break;
          case 'RETURNED':
            label = 'Вернувшийся';
            color = 'info';
            icon = <Refresh sx={{ fontSize: 16 }} />;
            break;
          default:
            label = reason || '';
        }

        return (
          <Chip
            icon={icon || undefined}
            label={label}
            size="small"
            color={color}
            variant="outlined"
            sx={{
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
        );
      },
    },

    createDateColumn("created_at", "Дата создания", {}, {
      width: 150,
      sortable: true,
    }),

    createDateColumn("last_activity_at", "Последняя активность", {}, {
      width: 180,
      sortable: true,
    }),

    {
      field: "actions",
      headerName: "Действия",
      width: 160,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams<ClientContactTask>) => {
        const ContactActionButton = () => {
          const [update] = useUpdateClientContactMutation();

          const handleCall = async () => {
            try {
              await update({ 
                task_id: Number(params.row.id), 
                data: { status: 'DONE' } 
              });
              onUpdate();
            } catch (error) {
              console.error('Error updating contact status:', error);
            }
          };

          return (
            <Button
              variant="contained"
              size="small"
              startIcon={<Phone sx={{ fontSize: 16 }} />}
              onClick={handleCall}
              sx={{
                textTransform: 'none',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: 1,
                '&:hover': {
                  boxShadow: 2,
                }
              }}
            >
              Позвонил
            </Button>
          );
        };

        return <ContactActionButton />;
      },
    },
  ];
};
