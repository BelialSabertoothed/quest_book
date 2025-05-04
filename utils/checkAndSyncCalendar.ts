import * as Calendar from 'expo-calendar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, TaskType } from '../types/TaskType';

export const checkAndSyncCalendar = async (
  setTasks: (updater: (prev: Task[]) => Task[]) => void
) => {
  try {
    const lastSync = await AsyncStorage.getItem('lastCalendarSync');
    const now = new Date();

    const shouldSync =
      !lastSync || now.getTime() - new Date(lastSync).getTime() > 1000 * 60 * 1;

    if (!shouldSync) return;

    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') return;

    const calendars = await Calendar.getCalendarsAsync();

    const filteredCalendars = calendars.filter(
      c =>
        c.entityType === Calendar.EntityTypes.EVENT &&
        !/holiday|svátek|feiertag|birthday/i.test(c.title ?? '') &&
        c.source?.name?.toLowerCase() !== 'holidays'
    );

    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setMonth(end.getMonth() + 2);
    end.setHours(23, 59, 59, 999);

    let allEvents: Calendar.Event[] = [];

    for (const cal of filteredCalendars) {
      try {
        const events = await Calendar.getEventsAsync([cal.id], start, end);
        console.log(`✅ Fetched ${events.length} events from calendar '${cal.title}'`);
        allEvents.push(...events);
      } catch (err) {
        console.warn(`❌ Failed to fetch events from '${cal.title}' (ID: ${cal.id}):`, err);
      }
    }

    const seen = new Set<string>();

    const newTasks: Task[] = allEvents
      .filter(e => e.title && e.startDate)
      .filter(e => {
        const title = e.title!.toLowerCase();
        return !/svátek|holiday|feiertag|birthday/i.test(title);
      })
      .map(event => {
        const isAllDay = event.allDay === true;
        const rawDate = new Date(event.startDate!);
        let date: Date | undefined;
        let time: Date | undefined;

        if (isAllDay) {
          // Přidej 1 den, aby odpovídalo správnému dni
          const corrected = new Date(rawDate);
          corrected.setDate(corrected.getDate() + 1);
          date = corrected;
        } else {
          time = rawDate;
        }

        return {
          id: `calendar-${event.id}`,
          title: event.title!,
          completed: false,
          time,
          date,
          repeatDays: [],
          type: TaskType.Calendar,
          isAllDay,
        };
      })
      .filter(task => {
        const key = `${task.title.toLowerCase()}-${(task.date ?? task.time)?.toISOString().split('T')[0]}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    console.log('📥 Calendar events converted to tasks:', newTasks);

    setTasks(prev => {
      const filtered = prev.filter(t => t.type !== TaskType.Calendar);
      return [...filtered, ...newTasks];
    });

    await AsyncStorage.setItem('lastCalendarSync', now.toISOString());
  } catch (err) {
    console.warn('Calendar sync failed:', err);
  }
};