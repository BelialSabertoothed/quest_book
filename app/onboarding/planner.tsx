import React from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Calendar from 'expo-calendar';
import { useDashboardTasks } from '../../context/useDashboardTasks';
import { TaskType } from '../../types/TaskType';

export default function PlannerChoice() {
  const router = useRouter();
  const { setTasks } = useDashboardTasks();

  const getPermissionAndSync = async () => {
    try {
      console.log('🔁 getPermissionAndSync called');
  
      // Žádáme o přístup ke kalendáři i připomínkám
      const calendarPerm = await Calendar.requestCalendarPermissionsAsync();
      const reminderPerm = await Calendar.requestRemindersPermissionsAsync();
  
      console.log('📋 Calendar permission:', calendarPerm.status);
      console.log('📝 Reminders permission:', reminderPerm.status);
  
      if (calendarPerm.status !== 'granted' || reminderPerm.status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to Calendar and Reminders.');
        return;
      }
  
      const calendars = await Calendar.getCalendarsAsync();
      console.log('📅 Available calendars:', calendars.map(cal => cal.title));
      const userCalendars = calendars.filter(cal =>
        cal.allowsModifications &&             // pouze kalendáře, do kterých můžeš zapisovat
        cal.source?.name !== 'Holidays' &&     // ignoruj státní svátky
        cal.title.toLowerCase() !== 'birthdays'  // igno
      );
  
      const calendarIds = userCalendars.map(cal => cal.id);
  
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);
      nextWeek.setHours(23, 59, 59, 999);
  
      console.log('🕒 Fetching events between:', now.toISOString(), nextWeek.toISOString());
  
      const events = await Calendar.getEventsAsync(calendarIds, now, nextWeek);
      console.log('📌 Events found:', events.length, events);
  
      const newTasks = events
        .filter(event => event.title && event.startDate)
        .map(event => ({
          id: `calendar-${event.id}`,
          title: event.title ?? 'Untitled',
          completed: false,
          time: new Date(event.startDate),
          repeatDays: [],
          type: TaskType.Calendar,
        }));
  
      if (newTasks.length > 0) {
        setTasks(prev => [...prev, ...newTasks]);
      }
  
      router.replace('/onboarding/done');
    } catch (error) {
      console.error('❌ Error during calendar sync:', error);
      Alert.alert('Error', 'Something went wrong while syncing calendar.');
    }
  };
 
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Almost done!</Text>
      <Text style={styles.text}>Would you like to connect you calendar to your quests?</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={getPermissionAndSync}
      >
        <Text style={styles.buttonText}>Sync with Calendar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#b2bec3', marginTop: 12 }]}
        onPress={() => router.replace('/onboarding/done')}
      >
        <Text style={styles.buttonText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});