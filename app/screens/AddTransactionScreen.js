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

const AddTransactionScreen = () => {
  const navigation = useNavigation();
  const [transactionType, setTransactionType] = useState('expense'); // 'income' or 'expense'
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const handleSaveTransaction = () => {
    if (!amount || !description) {
      Alert.alert('Error', 'Please fill in amount and description.');
      return;
    }

    const transaction = {
      id: Date.now().toString(),
      type: transactionType,
      amount: parseFloat(amount),
      description: description,
      category: category || 'Other',
      date: new Date().toISOString(),
    };

    // For now, we'll just show an alert. Later we'll save to Firebase
    Alert.alert(
      'Success', 
      `Transaction saved: ${transactionType} of $${amount}`,
      [
        { 
          text: 'OK', 
          onPress: () => {
            // Clear form
            setAmount('');
            setDescription('');
            setCategory('');
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Transaction</Text>
            <Text style={styles.subtitle}>Track your money flow</Text>
          </View>
          
          {/* Transaction Type Selector */}
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

          {/* Description Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="What was this for?"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="#90A4AE"
            />
          </View>

          {/* Category Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Food, Transport, Shopping"
              value={category}
              onChangeText={setCategory}
              placeholderTextColor="#90A4AE"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveTransaction}>
            <Text style={styles.saveButtonText}>Save Transaction</Text>
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