import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDashboardTasks } from '../context/useDashboardTasks';
import { useRouter } from 'expo-router';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeeklyOverviewScreen() {
  const { tasks } = useDashboardTasks();
  const router = useRouter();
  const [weekOffset, setWeekOffset] = useState(0);

  const getWeekday = (date: Date): string => {
    return WEEKDAYS[date.getDay() === 0 ? 6 : date.getDay() - 1];
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getDateKey = (date: Date): string => date.toISOString().split('T')[0];

  const currentWeek = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + weekOffset * 7);
    const day = getWeekday(date);
    const dateStr = date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const dayKey = getDateKey(date);

    const dayTasks = tasks
      .filter(task => {
        const matchesRepeat = task.repeatDays?.includes(day);
        const matchesCalendarDate =
          task.type === 'calendar' &&
          ((task.time && getDateKey(task.time) === dayKey) ||
           (task.date && getDateKey(task.date) === dayKey));
        const isCustom = task.type === 'custom' || !task.type;

        return matchesRepeat || matchesCalendarDate || isCustom;
      })
      .sort((a, b) => {
        if (a.time && b.time) return a.time.getTime() - b.time.getTime();
        if (a.time) return -1;
        if (b.time) return 1;
        return 0;
      });

    return { day, date, dateStr, dayKey, dayTasks };
  });

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.replace('/dashboard')} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back to Dashboard</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Weekly Overview</Text>

      <View style={styles.weekSwitch}>
        <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)}>
          <Text style={styles.linkText}>← Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setWeekOffset(weekOffset + 1)}>
          <Text style={styles.linkText}>Next →</Text>
        </TouchableOpacity>
      </View>

      {currentWeek.map(({ day, dateStr, date, dayTasks, dayKey }) => (
        <View key={day + dateStr} style={styles.dayBlock}>
          <Text style={styles.dayTitle}>{dateStr}</Text>
          {dayTasks.length > 0 ? (
            dayTasks.map(task => {
              const isCompleted = task.lastCompletedAt === getDateKey(date);
              return (
                <TouchableOpacity
                  key={task.id + dayKey}
                  style={[
                    styles.taskBox,
                    isCompleted && styles.taskBoxCompleted,
                    task.type === 'medication' && styles.taskMedication,
                    task.type === 'hydration' && styles.taskHydration,
                  ]}
                  onLongPress={() => router.replace(`/dashboard?edit=${task.id}`)}
                >
                  <Text style={styles.taskText}>• {task.title}</Text>
                  {task.time && <Text style={styles.timeText}>⏰ {formatTime(task.time)}</Text>}
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.noTask}>No tasks</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: '#fffaf3',
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: '#6c5ce7',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  weekSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayBlock: {
    backgroundColor: '#f3f0ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#5e4bff',
  },
  taskBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#6c5ce7',
  },
  taskBoxCompleted: {
    opacity: 0.5,
    borderLeftColor: '#aaa',
  },
  taskText: {
    fontSize: 15,
  },
  timeText: {
    fontSize: 13,
    color: '#888',
  },
  noTask: {
    fontSize: 14,
    color: '#aaa',
    fontStyle: 'italic',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c5ce7',
  },
  taskMedication: {
    borderLeftColor: '#fdcb6e',
  },
  taskHydration: {
    borderLeftColor: '#74b9ff',
  },
});
