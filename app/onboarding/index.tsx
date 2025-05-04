import React from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function OnboardingIntro(): JSX.Element {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to QuestBook 🧠</Text>
      <Text style={styles.text}>
        This app was designed to help you stay focused, consistent, and kind to yourself.
        Whether it’s planning your day or remembering medication, we’re here to support you.
      </Text>
      <Text style={styles.quote}>“Small steps every day lead to big change.”</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/onboarding/notifications')}
      >
        <Text style={styles.buttonText}>Let’s get started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fffaf3',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#444',
  },
  quote: {
    fontStyle: 'italic',
    color: '#777',
    fontSize: 14,
    marginBottom: 36,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});