import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

interface UndoSnackbarProps {
  visible: boolean;
  message: string;
  onUndo: () => void;
  onHide: () => void;
  duration?: number;
}

const UndoSnackbar: React.FC<UndoSnackbarProps> = ({ visible, message, onUndo, onHide, duration = 3000 }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  if (!visible) return null;

  return (
    <View style={styles.snackbar}>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={onUndo} style={styles.undoButton}>
        <Text style={styles.undoText}>Undo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  snackbar: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
    backgroundColor: '#E6F9ED', // Light green
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 1000,
  },
  message: {
    color: '#007E5A', // Dark green text
    fontSize: 16,
    flex: 1,
  },
  undoButton: {
    marginLeft: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#00BFA5',
  },
  undoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UndoSnackbar; 