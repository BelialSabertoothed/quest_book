import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { checkAndSyncCalendar } from '../utils/checkAndSyncCalendar';
import { useDashboardTasks } from '../context/useDashboardTasks';

export default function WelcomeScreen() {
  const router = useRouter();

  const { setTasks } = useDashboardTasks();

  const handleStart = async () => {
    // vždy načti kalendář
    await checkAndSyncCalendar(setTasks);

    const seen = await AsyncStorage.getItem('hasSeenOnboarding');
    if (seen === 'true') {
      router.replace('/dashboard');
    } else {
      router.replace('/onboarding');
    }
  };
  
  const resetOnboarding = async () => {
    await AsyncStorage.clear();
    router.replace('/onboarding'); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to QuestBook</Text>
      <Text style={styles.subtitle}>
        A gentle productivity app designed to support your focus and celebrate your progress.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={resetOnboarding} style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 12, color: '#aaa', textAlign: 'center' }}>
          (long press to reset onboarding)
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fffef6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#444',
  },
  button: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});