import React, { useState } from 'react';
import { Calendar } from 'react-native-calendars';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import TypeSelector from '../components/TypeSelector';
import { saveTransaction, updateTransaction } from '../utils/storage';
import { Picker } from '@react-native-picker/picker';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import SuccessModal from '../components/SuccessModal';

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

// Utility to format numbers with commas (Indian style: 1,00,000)
function formatAmountWithCommas(value: string): string {
  // Remove all non-digit and non-decimal characters
  let [intPart, decPart] = value.replace(/[^\d.]/g, '').split('.');
  if (!intPart) return '';
  // Indian number system formatting
  let lastThree = intPart.slice(-3);
  let otherNumbers = intPart.slice(0, -3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  let formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  if (decPart !== undefined) {
    formatted += '.' + decPart;
  }
  return formatted;
}

const AddTransactionScreen = ({ route }: AddTransactionScreenProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const editMode = route?.params?.editMode || false;
  const transactionToEdit: Transaction | null = (route?.params?.transaction as Transaction) || null;

  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(transactionToEdit ? transactionToEdit.type : 'expense');
  const [amount, setAmount] = useState<string>(transactionToEdit ? String(transactionToEdit.amount) : '');
  const [rawAmount, setRawAmount] = useState<string>(transactionToEdit ? String(transactionToEdit.amount) : '');
  const [description, setDescription] = useState<string>(transactionToEdit ? transactionToEdit.description || '' : '');
  const [category, setCategory] = useState<string>(
    transactionToEdit ? transactionToEdit.category : EXPENSE_CATEGORIES[0]
  );
  const [customCategory, setCustomCategory] = useState<string>('');
  const [date, setDate] = useState<Date>(transactionToEdit ? new Date(transactionToEdit.date) : new Date());
  // const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState(false);

  React.useEffect(() => {
    if (!transactionToEdit) {
      setCategory(
        transactionType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
      );
      setCustomCategory('');
    }
  }, [transactionType]);

  const handleSaveTransaction = async () => {
    // --- Enhanced validation ---
    // 1. Amount : not empty, valid number, not negative
    if (!rawAmount || isNaN(Number(rawAmount)) || Number(rawAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid, positive amount.');
      return;
    }

    // 2. Category: must be selected
    if (!category) {
      Alert.alert('Error', 'Please select a category.');
      return;
    }

    // 3. If category is 'Other', custom category must be provided
    if (category === 'Other' && !customCategory.trim()) {
      Alert.alert('Error', 'Please enter a custom category.');
      return;
    }

    const finalCategory = category === 'Other' ? (customCategory || 'Other') : category;
    const transaction: Transaction = {
      type: transactionType,
      amount: parseFloat(rawAmount),
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
      setShowSuccess(true);
      setAmount('');
      setDescription('');
      setCategory(transactionType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
      setCustomCategory('');
      setDate(new Date());
      setTimeout(() => {
        setShowSuccess(false);
        navigation.goBack();
      }, 1200);
    } else {
      Alert.alert('Error', editMode ? 'Failed to update transaction. Please try again.' : 'Failed to save transaction. Please try again.');
    }
  };

  const categoryList = transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
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
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={amount}
              onChangeText={text => {
                // Remove commas and format
                const raw = text.replace(/,/g, '');
                // Only allow valid number input (digits and at most one decimal point)
                if (/^\d*\.?\d*$/.test(raw)) {
                  setRawAmount(raw);
                  setAmount(formatAmountWithCommas(raw));
                }
              }}
              keyboardType="numeric"
              placeholderTextColor="#90A4AE"
              maxLength={15}
            />
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
          {/* Date Picker
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
        </View> */}
          <Text style={styles.label}>Date</Text>
          <Calendar
            current={date.toISOString().split('T')[0]}
            onDayPress={day => setDate(new Date(day.dateString))}
            markedDates={{
              [date.toISOString().split('T')[0]]: { selected: true, selectedColor: '#00BFA5' }
            }}
            maxDate={new Date().toISOString().split('T')[0]}
            theme={{
              selectedDayBackgroundColor: '#00BFA5',
              todayTextColor: '#00BFA5',
              arrowColor: '#00BFA5',
            }}
            style={styles.compactCalendar}
          />
          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveTransaction}>
            <Text style={styles.saveButtonText}>{editMode ? 'Update Transaction' : 'Save Transaction'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <SuccessModal visible={showSuccess} message="Transaction saved!" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 12,
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
    marginBottom: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  amountContainer: {
    // removed for uniform input styling
  },
  currencySymbol: {
    // removed for uniform input styling
  },
  amountInput: {
    // removed for uniform input styling
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
    marginTop: 0,
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
  compactCalendar: {
    marginBottom: 24,
  },
});

export default AddTransactionScreen; 