import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const TypeSelector = ({ transactionType, setTransactionType }) => {
  return (
    <View style={styles.typeSelector}>
      <TouchableOpacity 
        style={[
          styles.typeButton, 
          transactionType === 'expense' && styles.activeTypeButton
        ]}
        onPress={() => setTransactionType('expense')}
      >
        <View style={styles.typeButtonContent}>
          <Text style={styles.typeButtonIcon}>💸</Text>
          <Text style={[
            styles.typeButtonText,
            transactionType === 'expense' && styles.activeTypeButtonText
          ]}>
            Expense
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.typeButton, 
          transactionType === 'income' && styles.activeTypeButton
        ]}
        onPress={() => setTransactionType('income')}
      >
        <View style={styles.typeButtonContent}>
          <Text style={styles.typeButtonIcon}>💰</Text>
          <Text style={[
            styles.typeButtonText,
            transactionType === 'income' && styles.activeTypeButtonText
          ]}>
            Income
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 30,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeButtonContent: {
    alignItems: 'center',
  },
  typeButtonIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeTypeButton: {
    backgroundColor: '#00BFA5',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTypeButtonText: {
    color: '#fff',
  },
});

export default TypeSelector; 