import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

export default function NotificationPermission() {
  const router = useRouter();

  const askNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Notifications disabled', 'You can enable them later in settings.');
    }
    router.push('/onboarding/reminders');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stay on track 📣</Text>
      <Text style={styles.text}>
        Would you like us to send you gentle reminders to complete your daily quests?
      </Text>
      <TouchableOpacity style={styles.button} onPress={askNotificationPermission}>
        <Text style={styles.buttonText}>Allow Notifications</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('/onboarding/reminders')}
        style={[styles.button, { backgroundColor: '#ccc', marginTop: 12 }]}
      >
        <Text style={styles.buttonText}>Maybe later</Text>
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
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
