import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BalanceCard = ({ balance, income, expenses }) => {
  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceLabel}>Total Balance</Text>
      <Text style={styles.balanceAmount}>{balance}</Text>
      <View style={styles.balanceStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={styles.statAmount}>{income}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Expenses</Text>
          <Text style={styles.statAmount}>{expenses}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: '#00BFA5',
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    marginBottom: 30,
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  statAmount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
    marginHorizontal: 20,
  },
});

export default BalanceCard; 