import { db } from '../config/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';

// Firestore subcollection path: /users/{userId}/transactions/{transactionId}
const getUserId = () => {
  const user = getAuth().currentUser;
  return user ? user.uid : null;
};

// One-time migration key
const MIGRATION_KEY = 'transactions_migrated';

// One-time migration from AsyncStorage to Firestore
export const migrateAsyncStorageToFirestore = async () => {
  const migrated = await AsyncStorage.getItem(MIGRATION_KEY);
  if (migrated) return; // Already migrated

  const userId = getUserId();
  if (!userId) return;

  const local = await AsyncStorage.getItem('transactions');
  if (local) {
    const transactions = JSON.parse(local);
    for (const txn of transactions) {
      // Use setDoc with txn.id to preserve IDs
      await setDoc(doc(db, 'users', userId, 'transactions', txn.id), txn);
    }
    await AsyncStorage.removeItem('transactions');
  }
  await AsyncStorage.setItem(MIGRATION_KEY, 'true');
};

// Get all transactions, newest first
export const getTransactions = async () => {
  const userId = getUserId();
  if (!userId) return [];
  const q = query(
    collection(db, 'users', userId, 'transactions'),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Save a new transaction
export const saveTransaction = async (transaction) => {
  const userId = getUserId();
  if (!userId) return false;
  try {
    await addDoc(collection(db, 'users', userId, 'transactions'), transaction);
    return true;
  } catch (e) {
    console.error('Failed to save transaction:', e);
    return false;
  }
};

// Delete a transaction
export const deleteTransaction = async (id) => {
  const userId = getUserId();
  if (!userId) return false;
  try {
    await deleteDoc(doc(db, 'users', userId, 'transactions', id));
    return true;
  } catch (e) {
    console.error('Failed to delete transaction:', e);
    return false;
  }
};

// Update a transaction
export const updateTransaction = async (id, updatedData) => {
  const userId = getUserId();
  if (!userId) return false;
  try {
    await setDoc(doc(db, 'users', userId, 'transactions', id), updatedData, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to update transaction:', e);
    return false;
  }
};