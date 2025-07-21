import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const TransactionItem = ({ icon, title, category, amount, date, type, onLongPress }) => (
  <TouchableOpacity onLongPress={onLongPress} activeOpacity={0.8} style={styles.card}>
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Text style={styles.transactionIconText}>{icon}</Text>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{title}</Text>
        <Text style={styles.transactionCategory}>{category}</Text>
        <Text style={styles.transactionDate}>{date}</Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        type === 'income' ? { color: '#00BFA5' } : { color: '#FF6B6B' }
      ]}>{amount}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12, // Space between cards
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 4,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F0F8F0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 12,
    color: '#666',
  },
  transactionDate: {
    fontSize: 11,
    color: '#AAA',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'right',
  },
});

export default TransactionItem; 