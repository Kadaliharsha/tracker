import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSACTIONS_KEY = 'transactions';

// Fetch all transactions (returns array, or empty array if none)
export const getTransactions = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load transactions', e);
    return [];
  }
};

// Save a new transaction (appends to existing list)
export const saveTransaction = async (transaction) => {
  try {
    const transactions = await getTransactions();
    const newTransactions = [transaction, ...transactions]; // newest first
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(newTransactions));
    return true;
  } catch (e) {
    console.error('Failed to save transaction', e);
    return false;
  }
}; 

export const deleteTransaction = async (id) => {
    try {
        const transactions = await getTransactions();
        const newTransactions = transactions.filter(txn => txn.id !== id);
        await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(newTransactions));
        return true;
    } catch (e) {
        console.error('Failed to delete transaction', e);
        return false;
    }
}