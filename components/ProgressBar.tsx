// components/ProgressBar.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  value: number;
  max: number;
  label?: string;
  icon?: string;
}

export default function ProgressBar({ value, max, label, icon }: Props) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{icon ? `${icon} ` : ''}{label}</Text>}
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  barBg: {
    height: 12,
    backgroundColor: '#dfe6e9',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: 12,
    backgroundColor: '#6c5ce7',
  },
});