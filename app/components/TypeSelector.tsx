import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface TypeSelectorProps {
  transactionType: 'income' | 'expense';
  setTransactionType: (type: 'income' | 'expense') => void;
}

const TypeSelector: React.FC<TypeSelectorProps> = ({ transactionType, setTransactionType }) => {
  return (
    <View style={styles.typeSelector}>
      <TouchableOpacity 
        style={[
          styles.typeButton, 
          transactionType === 'expense' ? styles.activeTypeButton : styles.inactiveTypeButton
        ]}
        onPress={() => {
          Haptics.selectionAsync();
          setTransactionType('expense');
        }}
      >
        <Text style={[
          styles.typeButtonText,
          transactionType === 'expense' ? styles.activeTypeButtonText : styles.inactiveTypeButtonText
        ]}>
          Expense
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.typeButton, 
          transactionType === 'income' ? styles.activeTypeButton : styles.inactiveTypeButton
        ]}
        onPress={() => {
          Haptics.selectionAsync();
          setTransactionType('income');
        }}
      >
        <Text style={[
          styles.typeButtonText,
          transactionType === 'income' ? styles.activeTypeButtonText : styles.inactiveTypeButtonText
        ]}>
          Income
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#E8E8E8',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  activeTypeButton: {
    backgroundColor: '#FFFFFF',
  },
  inactiveTypeButton: {
    backgroundColor: 'transparent',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTypeButtonText: {
    color: '#00BFA5',
  },
  inactiveTypeButtonText: {
    color: '#666',
  },
});

export default TypeSelector; 