import * as Notifications from 'expo-notifications';

const WEEKDAY_TO_NUMBER: Record<string, number> = {
  Sun: 1,
  Mon: 2,
  Tue: 3,
  Wed: 4,
  Thu: 5,
  Fri: 6,
  Sat: 7,
};

export const scheduleNotification = async (
  title: string,
  time: Date,
  repeatDays: string[] = []
) => {
  if (repeatDays.length > 0) {
    for (const day of repeatDays) {
      const weekdayNumber = WEEKDAY_TO_NUMBER[day];
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Reminder',
          body: title,
        },
        trigger: {
          type: 'weekly',
          weekday: weekdayNumber,
          hour: time.getHours(),
          minute: time.getMinutes(),
          repeats: true,
        },
      });
    }
  } else {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Reminder',
        body: title,
      },
      trigger: {
        type: 'date',
        date: time,
      },
    });
  }
};