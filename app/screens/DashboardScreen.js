import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, StatusBar, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';
import { migrateAsyncStorageToFirestore } from '../utils/storage';

import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import TransactionItem from '../components/TransactionItem';
import BalanceCard from '../components/BalanceCard';
import ActionButton from '../components/ActionButton';
import { getTransactions, deleteTransaction } from '../utils/storage';
import FilterButtons from '../components/FilterButtons';


const DashboardScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const tabBarHeight = useBottomTabBarHeight();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('This Month'); // Default filter
  const unsubscribeRef = useRef(null); // Ref to hold the unsubscribe function

  useEffect(() => {
    const setup = async () => {
      // 1. Run one-time migration (safe to call every time, only runs once)
      await migrateAsyncStorageToFirestore();

      // 2. Get current user
      const user = getAuth().currentUser;
      if (!user) return;

      // 3. Set up Firestore real-time listener
      const q = query(
        collection(db, 'users', user.uid, 'transactions'),
        orderBy('date', 'desc')
      );
      // Store the unsubscribe function in the ref
      unsubscribeRef.current = onSnapshot(q, (snapshot) => {
        setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        console.error('Firestore onSnapshot error:', error);
      });
    };

    setup();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Memoized filtering logic
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(txn => {
      const txnDate = new Date(txn.date);
      if (activeFilter === 'This Month') {
        return txnDate.getMonth() === now.getMonth() && txnDate.getFullYear() === now.getFullYear();
      }
      if (activeFilter === 'This Year') {
        return txnDate.getFullYear() === now.getFullYear();
      }
      return true; // 'All Time'
    });
  }, [transactions, activeFilter]);

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => actuallyDelete(id)
        }
      ]
    );
  };

  const actuallyDelete = async (id) => {
    console.log('Attempting to delete Firestore doc ID:', id);
    setTransactions(prev => prev.filter(txn => txn.id !== id));
    const result = await deleteTransaction(id);
    console.log('Delete result:', result);
  };

  const totalIncome = filteredTransactions
    .filter(txn => txn.type === 'income')
    .reduce((sum, txn) => sum + Number(txn.amount), 0);

  const totalExpenses = filteredTransactions
  .filter(txn => txn.type === 'expense')
  .reduce((sum, txn) => sum + Number(txn.amount), 0);

  const totalBalance = totalIncome - totalExpenses;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* --- Static Content --- */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello! 👋</Text>
          <Text style={styles.subtitle}>Track your money smartly</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={async () => {
          // First, unsubscribe from the listener
          if (unsubscribeRef.current) {
            console.log('DEBUG: Unsubscribing from Firestore listener...');
            unsubscribeRef.current();
          }
          // Then, sign out
          try {
            console.log('DEBUG: Signing out user...');
            await signOut(getAuth());
          } catch (e) {
            console.error('Logout failed:', e);
          }
        }}>
          <Text style={styles.profileButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FilterButtons activeFilter={activeFilter} onChange={setActiveFilter} />

      {/* Balance Card */}
      <BalanceCard 
        savings={`₹${totalBalance.toFixed(2)}`}
        income={`₹${totalIncome.toFixed(2)}`}
        expenses={`₹${totalExpenses.toFixed(2)}`}
      />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <ActionButton 
            icon="+"
            label="Add Transaction"
            onPress={() => navigation.navigate('Add Transaction')}
          />
          <ActionButton 
            icon="📊"
            label="Analytics"
            onPress={() => navigation.navigate('Analytics')}
          />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AllTransactions')}>
            <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {/* --- Scrollable List --- */}
      {loading ? (
        <ActivityIndicator size="large" color="#00BFA5" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={filteredTransactions.slice(0, 3)} // Use filtered data
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionItem
              icon={item.type === 'income' ? '💰' : '💸'}
              title={item.description}
              category={item.category}
              amount={`${item.type === 'income' ? '+' : '-'}₹${Number(item.amount).toFixed(2)}`}
              type={item.type}
              date={new Date(item.date).toLocaleDateString()}
              onLongPress={() => handleDelete(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: 32 }}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>🗒️</Text>
              <Text style={{ textAlign: 'center', color: '#888', fontSize: 16 }}>
                No transactions yet. Tap “Add Transaction” to get started!
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: tabBarHeight + 10 }} // Use dynamic height
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  profileButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  profileButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
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
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Align to the start
    gap: 16, // Add space between buttons
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    width: 120, // Set a fixed width
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F0F8F0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIconText: {
    fontSize: 20,
    color: '#00BFA5',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  recentSection: {
    paddingHorizontal: 20,
    // marginBottom can be removed if the list handles its own padding
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20, // Add padding here since the parent container is gone
    marginBottom: 16,
  },
  viewAllText: {
    color: '#00BFA5',
    fontSize: 14,
    fontWeight: '500',
  },
  transactionList: {
    // This container no longer needs styling, as each item will be a card.
    // We keep the view for the empty state logic.
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
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    minWidth: 80,
    textAlign: 'right',
  },
  transactionDate: {
    fontSize: 11,
    color: '#AAA',
    marginTop: 2,
  }
});

export default DashboardScreen;