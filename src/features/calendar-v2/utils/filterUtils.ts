import { CalendarEvent } from '../types';
import { isTrainingTemplate, isRealTraining } from '../types/typeGuards';
import { CalendarFilters, FilterOption } from '../components/desktop/layout/CalendarSearchBar';
import { TrainingTemplate } from '../models/trainingTemplate';
import { RealTraining } from '../models/realTraining';

/**
 * Нормализует строку для поиска (убирает лишние пробелы, приводит к нижнему регистру)
 */
export const normalizeSearchText = (text: string): string => {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
};

/**
 * Проверяет, содержит ли текст поисковую строку
 */
export const containsSearchText = (text: string, searchText: string): boolean => {
  if (!searchText) return true;
  const normalizedText = normalizeSearchText(text);
  const normalizedSearch = normalizeSearchText(searchText);
  return normalizedText.includes(normalizedSearch);
};

/**
 * Получает полное имя тренера из события
 */
export const getTrainerName = (event: CalendarEvent): string => {
  if (isTrainingTemplate(event) && event.responsible_trainer) {
    return `${event.responsible_trainer.first_name || ''} ${event.responsible_trainer.last_name || ''}`.trim();
  }
  if (isRealTraining(event) && event.trainer) {
    return `${event.trainer.first_name || ''} ${event.trainer.last_name || ''}`.trim();
  }
  return '';
};

/**
 * Получает имена всех студентов из события
 */
export const getStudentNames = (event: CalendarEvent): string[] => {
  if (isTrainingTemplate(event) && event.assigned_students) {
    return event.assigned_students.map(studentTemplate => {
      const student = studentTemplate.student;
      if (student) {
        return `${student.first_name || ''} ${student.last_name || ''}`.trim();
      }
      return '';
    }).filter(name => name);
  }
  if (isRealTraining(event) && event.students) {
    return event.students.map(studentTraining => {
      const student = studentTraining.student;
      if (student) {
        return `${student.first_name || ''} ${student.last_name || ''}`.trim();
      }
      return '';
    }).filter(name => name);
  }
  return [];
};

/**
 * Получает ID всех студентов из события
 */
export const getStudentIds = (event: CalendarEvent): number[] => {
  if (isTrainingTemplate(event) && event.assigned_students) {
    return event.assigned_students.map(studentTemplate => studentTemplate.student?.id).filter(id => id !== undefined) as number[];
  }
  if (isRealTraining(event) && event.students) {
    return event.students.map(studentTraining => studentTraining.student?.id).filter(id => id !== undefined) as number[];
  }
  return [];
};

/**
 * Получает ID тренера из события
 */
export const getTrainerId = (event: CalendarEvent): number => {
  if (isTrainingTemplate(event)) {
    // Сначала пробуем responsible_trainer_id, затем responsible_trainer.id
    return event.responsible_trainer_id || event.responsible_trainer?.id || 0;
  }
  if (isRealTraining(event)) {
    // Сначала пробуем responsible_trainer_id, затем trainer.id
    return event.responsible_trainer_id || event.trainer?.id || 0;
  }
  return 0;
};

/**
 * Проверяет, соответствует ли событие поисковому тексту
 */
export const matchesSearchText = (event: CalendarEvent, searchText: string): boolean => {
  if (!searchText) return true;

  // Поиск по названию типа тренировки
  const trainingTypeName = event.training_type?.name || '';
  if (containsSearchText(trainingTypeName, searchText)) return true;

  // Поиск по имени тренера
  const trainerName = getTrainerName(event);
  if (containsSearchText(trainerName, searchText)) return true;

  // Поиск по именам студентов
  const studentNames = getStudentNames(event);
  for (const studentName of studentNames) {
    if (containsSearchText(studentName, searchText)) return true;
  }

  return false;
};

/**
 * Проверяет, соответствует ли событие фильтрам по тренерам
 */
export const matchesTrainerFilter = (event: CalendarEvent, trainerIds: number[]): boolean => {
  if (trainerIds.length === 0) return true;
  const eventTrainerId = getTrainerId(event);
  return trainerIds.includes(eventTrainerId);
};

/**
 * Проверяет, соответствует ли событие фильтрам по типам тренировок
 */
export const matchesTrainingTypeFilter = (event: CalendarEvent, trainingTypeIds: number[]): boolean => {
  if (trainingTypeIds.length === 0) return true;
  // Сначала пробуем training_type_id, затем training_type.id
  const typeId = event.training_type_id || event.training_type?.id || 0;
  return trainingTypeIds.includes(typeId);
};

/**
 * Проверяет, соответствует ли событие фильтрам по студентам
 */
export const matchesStudentFilter = (event: CalendarEvent, studentIds: number[]): boolean => {
  if (studentIds.length === 0) return true;
  const eventStudentIds = getStudentIds(event);
  return studentIds.some(id => eventStudentIds.includes(id));
};

/**
 * Основная функция фильтрации событий
 */
export const filterEvents = (events: CalendarEvent[], filters: CalendarFilters): CalendarEvent[] => {
  return events.filter(event => {
    // Проверяем поисковый текст
    if (!matchesSearchText(event, filters.searchText)) return false;

    // Проверяем фильтр по тренерам
    if (!matchesTrainerFilter(event, filters.trainerIds)) return false;

    // Проверяем фильтр по типам тренировок
    if (!matchesTrainingTypeFilter(event, filters.trainingTypeIds)) return false;

    // Проверяем фильтр по студентам
    if (!matchesStudentFilter(event, filters.studentIds)) return false;

    return true;
  });
};

/**
 * Создает опции фильтров из списка шаблонов тренировок
 */
export const createFilterOptionsFromTemplates = (
  templates: TrainingTemplate[]
): {
  trainerOptions: FilterOption[];
  trainingTypeOptions: FilterOption[];
  studentOptions: FilterOption[];
} => {
  const trainerSet = new Map<number, FilterOption>();
  const trainingTypeSet = new Map<number, FilterOption>();
  const studentSet = new Map<number, FilterOption>();

  templates.forEach(template => {
    // Добавляем тренера
    if (template.responsible_trainer) {
      const trainerName = `${template.responsible_trainer.first_name || ''} ${template.responsible_trainer.last_name || ''}`.trim();
      if (trainerName && !trainerSet.has(template.responsible_trainer.id)) {
        trainerSet.set(template.responsible_trainer.id, {
          id: template.responsible_trainer.id,
          label: trainerName,
          type: 'trainer',
        });
      }
    }

    // Добавляем тип тренировки
    if (template.training_type) {
      if (!trainingTypeSet.has(template.training_type.id)) {
        trainingTypeSet.set(template.training_type.id, {
          id: template.training_type.id,
          label: template.training_type.name,
          type: 'trainingType',
        });
      }
    }

    // Добавляем студентов
    if (template.assigned_students) {
      template.assigned_students.forEach(studentTemplate => {
        const student = studentTemplate.student;
        if (student) {
          const studentName = `${student.first_name || ''} ${student.last_name || ''}`.trim();
          if (studentName && !studentSet.has(student.id)) {
            studentSet.set(student.id, {
              id: student.id,
              label: studentName,
              type: 'student',
            });
          }
        }
      });
    }
  });

  return {
    trainerOptions: Array.from(trainerSet.values()).sort((a, b) => a.label.localeCompare(b.label)),
    trainingTypeOptions: Array.from(trainingTypeSet.values()).sort((a, b) => a.label.localeCompare(b.label)),
    studentOptions: Array.from(studentSet.values()).sort((a, b) => a.label.localeCompare(b.label)),
  };
};

/**
 * Создает опции фильтров из списка реальных тренировок
 */
export const createFilterOptionsFromRealTrainings = (
  trainings: RealTraining[]
): {
  trainerOptions: FilterOption[];
  trainingTypeOptions: FilterOption[];
  studentOptions: FilterOption[];
} => {
  const trainerSet = new Map<number, FilterOption>();
  const trainingTypeSet = new Map<number, FilterOption>();
  const studentSet = new Map<number, FilterOption>();

  trainings.forEach(training => {
    // Добавляем тренера
    if (training.trainer) {
      const trainerName = `${training.trainer.first_name || ''} ${training.trainer.last_name || ''}`.trim();
      if (trainerName && !trainerSet.has(training.trainer.id)) {
        trainerSet.set(training.trainer.id, {
          id: training.trainer.id,
          label: trainerName,
          type: 'trainer',
        });
      }
    }

    // Добавляем тип тренировки
    if (training.training_type) {
      if (!trainingTypeSet.has(training.training_type.id)) {
        trainingTypeSet.set(training.training_type.id, {
          id: training.training_type.id,
          label: training.training_type.name,
          type: 'trainingType',
        });
      }
    }

    // Добавляем студентов
    if (training.students) {
      training.students.forEach(studentTraining => {
        const student = studentTraining.student;
        if (student) {
          const studentName = `${student.first_name || ''} ${student.last_name || ''}`.trim();
          if (studentName && !studentSet.has(student.id)) {
            studentSet.set(student.id, {
              id: student.id,
              label: studentName,
              type: 'student',
            });
          }
        }
      });
    }
  });

  return {
    trainerOptions: Array.from(trainerSet.values()).sort((a, b) => a.label.localeCompare(b.label)),
    trainingTypeOptions: Array.from(trainingTypeSet.values()).sort((a, b) => a.label.localeCompare(b.label)),
    studentOptions: Array.from(studentSet.values()).sort((a, b) => a.label.localeCompare(b.label)),
  };
};

/**
 * Объединяет опции фильтров из разных источников
 */
export const mergeFilterOptions = (
  ...optionLists: Array<{
    trainerOptions: FilterOption[];
    trainingTypeOptions: FilterOption[];
    studentOptions: FilterOption[];
  }>
): {
  trainerOptions: FilterOption[];
  trainingTypeOptions: FilterOption[];
  studentOptions: FilterOption[];
} => {
  const trainerMap = new Map<number, FilterOption>();
  const trainingTypeMap = new Map<number, FilterOption>();
  const studentMap = new Map<number, FilterOption>();

  optionLists.forEach(options => {
    options.trainerOptions.forEach(option => trainerMap.set(option.id, option));
    options.trainingTypeOptions.forEach(option => trainingTypeMap.set(option.id, option));
    options.studentOptions.forEach(option => studentMap.set(option.id, option));
  });

  return {
    trainerOptions: Array.from(trainerMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
    trainingTypeOptions: Array.from(trainingTypeMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
    studentOptions: Array.from(studentMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
  };
}; 