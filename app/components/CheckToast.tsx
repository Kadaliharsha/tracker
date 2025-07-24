import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CheckToast({ text1 }: { text1?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✔️</Text>
      <Text style={styles.text}>{text1}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E6F9ED',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    fontSize: 28,
    color: '#00BFA5',
    marginRight: 12,
  },
  text: {
    fontSize: 18,
    color: '#007E5A',
    fontWeight: 'bold',
  },
}); 