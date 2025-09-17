import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { avatarList } from '../../utils/avatars';
import { UserContext } from '../../context/UserContext';
import { useRouter } from 'expo-router';

export default function EditAvatarScreen() {
const { user, setUser } = useContext(UserContext);
  const router = useRouter();

const handleSelect = async (avatarIndex: number) => {
  try {
    await fetch('http://localhost:3000/api/profile/avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, avatarIndex }),
    });

    setUser(prev => ({
      ...prev,
      avatarIndex,
    }));

    router.back();
  } catch (err) {
    console.error('❌ Failed to update avatar:', err);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose your avatar</Text>
      <View style={styles.avatarGrid}>
      {avatarList.map((img, index) => (
          <TouchableOpacity key={index} onPress={() => handleSelect(index)}>
            <Image source={img} style={styles.avatar} />
          </TouchableOpacity>
        ))}
      </View>
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
    fontWeight: '600',
    marginBottom: 24,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    margin: 8,
  },
});