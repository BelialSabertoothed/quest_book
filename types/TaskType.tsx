export enum TaskType {
  Custom = 'custom',
  Medication = 'medication',
  Hydration = 'hydration',
  Calendar = 'calendar',
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  time?: Date; // použije se pro úkoly s konkrétním časem
  date?: Date; // použije se pro celodenní události bez času
  repeatDays?: string[];
  lastCompletedAt?: string;
  type?: TaskType;
  isAllDay?: boolean; // jen pro informaci, např. na odlišení ve zobrazení
}