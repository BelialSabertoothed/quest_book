import * as Calendar from 'expo-calendar';
import { Task, TaskType } from '../types/TaskType';

export const syncCalendarTasks = async (): Promise<Task[]> => {
  console.log('🔁 Starting calendar sync...');
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  console.log('📋 Calendar permission status:', status);

  if (status !== 'granted') {
    console.warn('🚫 Calendar permission not granted');
    return [];
  }

  const calendars = await Calendar.getCalendarsAsync();

  // ❗ Filtrování – vyloučí svátky, narozeniny apod.
  const filteredCalendars = calendars.filter(
    cal =>
      cal.entityType === Calendar.EntityTypes.EVENT &&
      !/holiday|svátek|feiertag|birthday/i.test(cal.title ?? '') &&
      (cal.source?.name?.toLowerCase() ?? '') !== 'holidays'
  );

  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  now.setHours(0, 0, 0, 0);

  const future = new Date();
  future.setMonth(future.getMonth() + 2);
  future.setHours(23, 59, 59, 999);

  let allEvents: Calendar.Event[] = [];

  for (const cal of filteredCalendars) {
    try {
      const events = await Calendar.getEventsAsync([cal.id], now, future);
      console.log(`✅ Fetched ${events.length} events from calendar '${cal.title}'`);
      allEvents.push(...events);
    } catch (err) {
      console.warn(`❌ Failed to fetch from '${cal.title}':`, err);
    }
  }

  const newTasks: Task[] = allEvents
    .filter(event => event.title && event.startDate) // allDay události klidně zachováme
    .map(event => ({
      id: `calendar-${event.id}`,
      title: event.title ?? 'Untitled',
      completed: false,
      time: new Date(event.startDate),
      repeatDays: [],
      type: TaskType.Calendar
    }));

  return newTasks;
};