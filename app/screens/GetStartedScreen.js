import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GetStartedScreen = ({ navigation }) => {
  const handleProceed = async (screen) => {
    await AsyncStorage.setItem('hasLaunched', 'true');
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/loginlogo.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome to Salary Expense Tracker</Text>
      <Text style={styles.description}>
        Track your income and expenses effortlessly. Get insights, manage your budget, and achieve your financial goals!
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => handleProceed('Login')}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.signupButton]} onPress={() => handleProceed('SignUp')}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 16,
    width: 200,
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GetStartedScreen; 