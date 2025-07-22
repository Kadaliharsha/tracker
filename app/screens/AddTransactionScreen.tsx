import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import TypeSelector from '../components/TypeSelector';
import { saveTransaction, updateTransaction } from '../utils/storage';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Transaction {
  id?: string;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  category: string;
  date: string;
}

interface AddTransactionScreenProps {
  route: { params?: { editMode?: boolean; transaction?: Transaction } };
}

const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Rent',
  'Utilities',
  'Shopping',
  'Entertainment',
  'Health',
  'Other'
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Gift',
  'Interest',
  'Refund',
  'Other'
];

const AddTransactionScreen = ({ route }: AddTransactionScreenProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const editMode = route?.params?.editMode || false;
  const transactionToEdit: Transaction | null = (route?.params?.transaction as Transaction) || null;

  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(transactionToEdit ? transactionToEdit.type : 'expense');
  const [amount, setAmount] = useState<string>(transactionToEdit ? String(transactionToEdit.amount) : '');
  const [description, setDescription] = useState<string>(transactionToEdit ? transactionToEdit.description || '' : '');
  const [category, setCategory] = useState<string>(
    transactionToEdit ? transactionToEdit.category : EXPENSE_CATEGORIES[0]
  );
  const [customCategory, setCustomCategory] = useState<string>('');
  const [date, setDate] = useState<Date>(transactionToEdit ? new Date(transactionToEdit.date) : new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);

  React.useEffect(() => {
    if (!transactionToEdit) {
      setCategory(
        transactionType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
      );
      setCustomCategory('');
    }
  }, [transactionType]);

  const handleSaveTransaction = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount.');
      return;
    }
    const finalCategory = category === 'Other' ? (customCategory || 'Other') : category;
    const transaction: Transaction = {
      type: transactionType,
      amount: parseFloat(amount),
      description: description,
      category: finalCategory,
      date: date.toISOString(),
    };
    let success = false;
    if (editMode && transactionToEdit?.id) {
      success = await updateTransaction(transactionToEdit.id, transaction);
    } else {
      success = await saveTransaction(transaction);
    }
    if (success) {
      Alert.alert(
        'Success',
        editMode ? 'Transaction updated.' : `Transaction saved: ${transactionType} of $${amount}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setAmount('');
              setDescription('');
              setCategory(transactionType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
              setCustomCategory('');
              setDate(new Date());
              navigation.goBack();
            }
          }
        ]
      );
    } else {
      Alert.alert('Error', editMode ? 'Failed to update transaction. Please try again.' : 'Failed to save transaction. Please try again.');
    }
  };

  const categoryList = transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{editMode ? 'Edit Transaction' : 'Add Transaction'}</Text>
          <Text style={styles.subtitle}>Track your money flow</Text>
        </View>
        {/* Transaction Type Selector */}
        <TypeSelector transactionType={transactionType} setTransactionType={setTransactionType as (type: 'income' | 'expense') => void} />
        {/* Amount Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholderTextColor="#90A4AE"
            />
          </View>
        </View>
        {/* Description Input (optional) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder={transactionType === 'income' ? "e.g., July Salary, Upwork payment" : "e.g., Lunch at Subway, Uber ride"}
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#90A4AE"
          />
        </View>
        {/* Category Picker */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={styles.picker}
            >
              {categoryList.map(cat => (
                <Picker.Item label={cat} value={cat} key={cat} />
              ))}
            </Picker>
          </View>
          {category === 'Other' && (
            <TextInput
              style={styles.input}
              placeholder="Enter custom category"
              value={customCategory}
              onChangeText={setCustomCategory}
              placeholderTextColor="#90A4AE"
            />
          )}
        </View>
        {/* Date Picker */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setDatePickerVisibility(true)}
          >
            <Text style={styles.dateButtonText}>
              {date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            date={date}
            onConfirm={selectedDate => {
              setDate(selectedDate);
              setDatePickerVisibility(false);
            }}
            onCancel={() => setDatePickerVisibility(false)}
            maximumDate={new Date()} // Prevent future dates if you want
          />
        </View>
        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveTransaction}>
          <Text style={styles.saveButtonText}>{editMode ? 'Update Transaction' : 'Save Transaction'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 0,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 0,
  },
  dateButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#00BFA5',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddTransactionScreen; 