import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, ActionSheetIOS, Alert, Platform } from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import TransactionItem from '../components/TransactionItem';
import { deleteTransaction } from '../utils/storage';
import { useNavigation } from '@react-navigation/native';

const AllTransactionsScreen = () => {
  console.log('[DEBUG] AllTransactionsScreen mounted');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    console.log('[DEBUG] useEffect triggered in AllTransactionsScreen');
    const user = getAuth().currentUser;
    if (!user) {
      console.log('[DEBUG] No user found, skipping transaction fetch');
      setLoading(false);
      return;
    }

    console.log('[DEBUG] Fetching transactions for user:', user.uid);
    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('[DEBUG] Transactions fetched:', txns);
      setTransactions(txns);
      setLoading(false);
    }, (error) => {
      console.error('[DEBUG] Failed to fetch transactions:', error);
      setLoading(false);
    });

    return () => {
      console.log('[DEBUG] Unsubscribing from transactions listener');
      unsubscribe();
    };
  }, []);

  if (loading) {
    console.log('[DEBUG] Loading transactions...');
    return <ActivityIndicator size="large" color="#00BFA5" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  // Handler for transaction actions
  const handleTransactionAction = (item) => {
    const showActionSheet = () => {
      const options = ['Edit', 'Delete', 'Cancel'];
      const destructiveButtonIndex = 1;
      const cancelButtonIndex = 2;
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options,
            cancelButtonIndex,
            destructiveButtonIndex,
            title: 'Choose an action',
            message: 'What would you like to do with this transaction?',
          },
          (buttonIndex) => {
            if (buttonIndex === 0) {
              navigation.navigate('Main', { screen: 'Add Transaction', params: { editMode: true, transaction: item } });
            } else if (buttonIndex === 1) {
              confirmDelete(item);
            }
          }
        );
      } else {
        // Android fallback: simple Alert
        Alert.alert(
          'Choose an action',
          'What would you like to do with this transaction?',
          [
            {
              text: 'Edit',
              onPress: () => navigation.navigate('Main', { screen: 'Add Transaction', params: { editMode: true, transaction: item } }),
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => confirmDelete(item),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      }
    };

    const confirmDelete = (item) => {
      Alert.alert(
        'Delete Transaction',
        'Are you sure you want to delete this transaction?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              console.log('[DEBUG] Deleting transaction:', item.id);
              await deleteTransaction(item.id);
            },
          },
        ]
      );
    };

    showActionSheet();
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => {
          console.log('[DEBUG] keyExtractor for transaction:', item.id);
          return item.id;
        }}
        renderItem={({ item }) => {
          console.log('[DEBUG] Rendering transaction item:', item);
          return (
            <TransactionItem
              icon={item.type === 'income' ? '💰' : '💸'}
              title={item.description}
              category={item.category}
              amount={`${item.type === 'income' ? '+' : '-'}₹${Number(item.amount).toFixed(2)}`}
              type={item.type}
              date={new Date(item.date).toLocaleDateString()}
              onLongPress={() => handleTransactionAction(item)}
            />
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 32 }}>
            <Text style={{ fontSize: 16, color: '#666' }}>No transactions found.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10, // Add a little space from the top header
  },
  // ...existing code...
});

export default AllTransactionsScreen; 