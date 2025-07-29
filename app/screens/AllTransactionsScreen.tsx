import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { transactionsToCSV } from '../utils/export';
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, ActionSheetIOS, Alert, Platform } from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import TransactionItem from '../components/TransactionItem';
import { deleteTransaction } from '../utils/storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import UndoSnackbar from '../components/UndoSnackbar';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  category: string;
  date: string;
}

const AllTransactionsScreen = () => {
  console.log('[DEBUG] AllTransactionsScreen mounted');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [showUndo, setShowUndo] = useState(false);
  const [deletedTxn, setDeletedTxn] = useState<Transaction | null>(null);
  const undoTimer = useRef<any>(null);

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
      const txns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      console.log('[DEBUG] Transactions fetched:', txns);
      setTransactions(txns);
      setLoading(false);
    }, (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('[DEBUG] Failed to fetch transactions:', error);
      setLoading(false);
    });

    return () => {
      console.log('[DEBUG] Unsubscribing from transactions listener');
      unsubscribe();
    };
  }, []);

  const exportCSV = async () => {
    if (!transactions.length) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('No data', 'There are no transactions to export.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const csv = transactionsToCSV(transactions);
    const path = FileSystem.documentDirectory + 'transactions.csv';
    await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(path, { mimeType: 'text/csv' });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={exportCSV} style={{ marginRight: 16 }}>
          <Feather name="download" size={24} color="#00BFA5" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, exportCSV]);

  if (loading) {
    console.log('[DEBUG] Loading transactions...');
    return <ActivityIndicator size="large" color="#00BFA5" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  // Handler for transaction actions
  const handleTransactionAction = (item: Transaction) => {
    const showActionSheet = () => {
      const options = ['Edit', 'Delete', 'Cancel'];
      const destructiveButtonIndex = 1;
      const cancelButtonIndex = 2;
      // Add haptic feedback before showing action sheet/alert
      Haptics.selectionAsync();
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

    const confirmDelete = (item: Transaction) => {
      Alert.alert(
        'Delete Transaction',
        'Are you sure you want to delete this transaction?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                // Optimistic UI: remove from UI immediately
                setTransactions(prev => prev.filter(txn => txn.id !== item.id));
                setDeletedTxn(item);
                setShowUndo(true);
                // Start timer to delete from Firestore after 3s
                if (undoTimer.current) clearTimeout(undoTimer.current);
                undoTimer.current = setTimeout(async () => {
                  await deleteTransaction(item.id);
                  setShowUndo(false);
                  setDeletedTxn(null);
                  // Haptic feedback for success
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }, 3000);
              } catch (error) {
                // Haptic feedback for error
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Error', 'Failed to delete transaction.');
              }
            },
          },
        ]
      );
    };

    showActionSheet();
  };

  // Undo handler
  const handleUndo = () => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    if (deletedTxn) {
      setTransactions(prev => [deletedTxn, ...prev]);
    }
    setShowUndo(false);
    setDeletedTxn(null);
  };
  // Hide snackbar handler
  const handleHideSnackbar = () => {
    setShowUndo(false);
    setDeletedTxn(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          console.log('[DEBUG] Rendering transaction item:', item);
          return (
            <TransactionItem
              icon={item.type === 'income' ? '💰' : '💸'}
              title={item.description || ''}
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
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🗂️</Text>
            <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
              No transactions found.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
      <UndoSnackbar
        visible={showUndo}
        message="Transaction deleted"
        onUndo={handleUndo}
        onHide={handleHideSnackbar}
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