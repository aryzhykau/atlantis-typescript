import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Функция для удаления неиспользуемых импортов
function cleanImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Удаляем неиспользуемые импорты из MUI
  const muiImports = [
    'AppBar', 'Drawer', 'ListItemText', 'AdapterDayjs', 'LocalizationProvider',
    'useEffect', 'useMemo', 'useState', 'dayjs', 'WarningIcon', 'RealTrainingUpdate',
    'RealTrainingCreate', 'List', 'ListItem', 'Divider', 'Chip', 'MenuItem',
    'Select', 'FormControl', 'InputLabel', 'EventNoteIcon', 'ExpandLess'
  ];
  
  muiImports.forEach(importName => {
    // Удаляем импорт из строки импорта
    const importRegex = new RegExp(`\\b${importName}\\b\\s*,?\\s*`, 'g');
    content = content.replace(importRegex, '');
    
    // Удаляем пустые импорты
    content = content.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"];?\s*/g, '');
    content = content.replace(/import\s*{\s*,+\s*}\s*from\s*['"][^'"]+['"];?\s*/g, '');
  });
  
  // Удаляем неиспользуемые параметры в функциях
  content = content.replace(/\([^)]*event[^)]*\)/g, '()');
  content = content.replace(/\([^)]*getTagProps[^)]*\)/g, '()');
  content = content.replace(/\([^)]*index[^)]*\)/g, '()');
  
  fs.writeFileSync(filePath, content);
  console.log(`Cleaned: ${filePath}`);
}

// Очищаем основные файлы
const filesToClean = [
  'src/components/sideBar/SideBar.tsx',
  'src/features/calendar-v2/components/CalendarSearchBar.tsx',
  'src/features/calendar-v2/components/CalendarV2Page.tsx',
  'src/features/calendar-v2/components/DraggableTrainingChip.tsx',
  'src/features/calendar-v2/components/DroppableSlot.tsx',
  'src/features/calendar-v2/components/MobileCalendarV2Page.tsx',
  'src/features/calendar-v2/components/RealTrainingModal.tsx',
  'src/features/calendar-v2/components/TrainingCard.tsx',
  'src/features/calendar-v2/components/TrainingTemplateForm.tsx',
  'src/features/calendar-v2/components/TrainingTemplateModal.tsx'
];

filesToClean.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    cleanImports(filePath);
  }
});

console.log('Import cleaning completed!'); 