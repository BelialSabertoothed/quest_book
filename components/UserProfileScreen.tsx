// screens/UserProfileScreen.tsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { UserContext } from '../context/UserContext';
import ProgressBar from '../components/ProgressBar';
import { avatarList } from '../utils/avatars';


export default function UserProfileScreen() {
  const { user, xp, level, hydrationProgress, medicationProgress, achievements, cards } = useContext(UserContext);
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Avatar + Level */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/profile/edit-avatar')}>
            <Image source={avatarList[user.avatarIndex]} style={styles.avatar} /> 
        </TouchableOpacity>
        <Text style={styles.name}>{user.name || 'Guest'}</Text>
        <Text style={styles.level}>Level {level}</Text>
        <ProgressBar value={xp} max={100} label={`${xp}/100 XP`} />
      </View>

      {/* Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Progress</Text>
        <ProgressBar icon="💧" value={hydrationProgress} max={100} label="Hydration" />
        <ProgressBar icon="💊" value={medicationProgress} max={100} label="Medication" />
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.grid}>
          {achievements.map((a, index) => (
            <View key={index} style={[styles.achievement, a.unlocked ? styles.unlocked : styles.locked]}>
              <Text>{a.icon}</Text>
              <Text style={styles.achievementLabel}>{a.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Collectible Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Collectible Cards</Text>
        <ScrollView horizontal>
          {cards.map((card, index) => (
            <View key={index} style={styles.card}>
              <Image source={{ uri: card.image }} style={styles.cardImage} />
              <Text style={styles.cardLabel}>{card.name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fffef6',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  level: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievement: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 4,
  },
  unlocked: {
    backgroundColor: '#a29bfe',
  },
  locked: {
    backgroundColor: '#dfe6e9',
  },
  achievementLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cardLabel: {
    marginTop: 6,
    fontSize: 12,
    textAlign: 'center',
  },
});
