import React, { useEffect } from 'react';
import { Popover, Box, Typography, List, ListItem, Button, IconButton, useTheme } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { Dayjs } from 'dayjs';
import { CalendarEvent } from './CalendarShell';
import TrainingCard from './TrainingCard';
import { CalendarViewMode } from './CalendarV2Page';
import TrainingDetailModal from './TrainingDetailModal';

interface TrainingsStackPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  events: CalendarEvent[];
  selectedDate: Dayjs | null; // Может быть null, если popover не привязан к конкретной дате/времени (хотя в нашем случае всегда будет)
  selectedTime: string | null;
  viewMode: CalendarViewMode;
  onAddTrainingClick?: (date: Dayjs, time: string) => void; // Для открытия формы создания
}

const TrainingsStackPopover: React.FC<TrainingsStackPopoverProps> = ({
  anchorEl,
  open,
  onClose,
  events,
  selectedDate,
  selectedTime,
  viewMode,
  onAddTrainingClick,
}) => {
  const theme = useTheme();

  // Состояния для TrainingDetailModal
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [selectedEventForModal, setSelectedEventForModal] = React.useState<CalendarEvent | null>(null);

  // useEffect для обновления selectedEventForModal, если соответствующий event в props.events изменился
  useEffect(() => {
    if (selectedEventForModal && events && events.length > 0) {
      const updatedEventInList = events.find(e => e.id === selectedEventForModal.id);

      if (updatedEventInList) {
        const oldEventString = JSON.stringify(selectedEventForModal);
        const newEventString = JSON.stringify(updatedEventInList);

        if (oldEventString !== newEventString) {
          console.log('[TrainingsStackPopover] Event for modal has changed in the parent list. Updating selectedEventForModal.', updatedEventInList);
          setSelectedEventForModal(updatedEventInList);
        }
      } else {
        console.warn('[TrainingsStackPopover] Selected event for modal no longer found in events list. Closing modal.');
        // Закрываем модальное окно, если событие исчезло, чтобы избежать ошибок или показа неактуальных данных
        setIsDetailModalOpen(false);
        setSelectedEventForModal(null);
      }
    }
  }, [events, selectedEventForModal]); // Зависимости useEffect

  const handleAddClick = () => {
    if (selectedDate && selectedTime && onAddTrainingClick) {
      onAddTrainingClick(selectedDate, selectedTime);
    }
    onClose(); // Закрываем поповер после клика
  };

  const handleExpandCard = (eventData: CalendarEvent) => {
    console.log('Expand event:', eventData);
    setSelectedEventForModal(eventData);
    setIsDetailModalOpen(true);
    onClose(); // Закрываем поповер при открытии модального окна
  };

  // Модифицируем onClose, чтобы сбрасывать и состояние модального окна, если оно было открыто из поповера
  const handlePopoverClose = () => {
    // setSelectedEventForModal(null); // Не обязательно, т.к. модалка сама закроется или уже закрыта
    // setIsDetailModalOpen(false); // Не нужно, если модалка открывается независимо
    onClose(); // Вызываем оригинальный onClose из пропсов
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedEventForModal(null);
  };

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose} // Используем новый обработчик закрытия поповера
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            p: 1.5,
            minWidth: 280,
            maxWidth: 340,
            boxShadow: theme.shadows[5],
            borderRadius: 1,
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
            Тренировки в слоте
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <List dense sx={{ maxHeight: 300, overflowY: 'auto', px: 0.5 /* небольшой отступ для скроллбара */ }}>
          {events.map(event => (
            <ListItem key={event.id} sx={{ p: 0, mb: 1}}>
              <TrainingCard 
                event={event} 
                variant="full" 
                showExpandButton={true}
                onExpandClick={handleExpandCard}
                isInPopover={true}
              /> 
            </ListItem>
          ))}
        </List>

        {viewMode === 'scheduleTemplate' && onAddTrainingClick && selectedDate && selectedTime && (
          <Button
            variant="outlined"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleAddClick}
            fullWidth
            sx={{ mt: 1.5 }}
          >
            Добавить шаблон
          </Button>
        )}
      </Popover>
      <TrainingDetailModal 
        open={isDetailModalOpen}
        onClose={handleDetailModalClose}
        event={selectedEventForModal}
      />
    </>
  );
};

export default TrainingsStackPopover; 