import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function PlannerPrompt() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Want to stay on track with your health? 💊💧</Text>
      <Text style={styles.subtitle}>
        We can remind you to take medication or drink water regularly.
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#6c5ce7' }]}
        onPress={() => router.push('/onboarding/reminder-setup')}
      >
        <Text style={styles.buttonText}>Yes, set reminders</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#b2bec3', marginTop: 12 }]}
        onPress={() => router.replace('/onboarding/planner')}
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
    padding: 24,
    backgroundColor: '#fffef6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 32,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});