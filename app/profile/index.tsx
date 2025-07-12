// app/profile/index.tsx
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import UserProfileScreen from '@/components/UserProfileScreen';

export default function ProfileHome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Settings</Text>
      <UserProfileScreen/>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/profile/edit-avatar')}
      >
        <Text style={styles.buttonText}>Edit Avatar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fffef6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6c5ce7',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});