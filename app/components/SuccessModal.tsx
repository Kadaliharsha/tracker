import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';

export default function SuccessModal({ visible, message = "Transaction saved!" }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconCircle}>
            <FontAwesome name="check" size={48} color="#00BFA5" />
          </View>
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 40,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  iconCircle: {
    backgroundColor: '#E6F9ED',
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  text: {
    fontSize: 20,
    color: '#007E5A',
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 