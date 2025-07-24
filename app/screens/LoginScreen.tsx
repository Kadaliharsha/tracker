import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Toast from 'react-native-toast-message';
import SuccessModal from '../components/SuccessModal';

interface LoginScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then(userCredentials => {
        console.log('Logged in with:', userCredentials.user.email);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          // navigation.replace('Dashboard'); // Uncomment if you want to navigate
        }, 1200);
      })
      .catch(error => Alert.alert('Login Error', error.message));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
          <Image source={require('../assets/logo-growth.png')} style={styles.logo} />
          <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue tracking your finances</Text>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter your email" 
                placeholderTextColor="#90A4AE" 
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address" 
                autoCapitalize="none" 
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter your password" 
                placeholderTextColor="#90A4AE" 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
              />
            </View>
            
          <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin}>
              <Text style={styles.buttonTextPrimary}>Sign In</Text>
          </TouchableOpacity>
          </View>
          
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.footerText}>Don't have an account? <Text style={styles.footerLink}>Sign Up</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <SuccessModal visible={showSuccess} message="Signed in!" />
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 30 
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: { 
    width: 100, 
    height: 100, 
    resizeMode: 'contain', 
    alignSelf: 'center', 
    marginBottom: 24 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#1A1A1A', 
    textAlign: 'center', 
    marginBottom: 8 
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: { 
    backgroundColor: '#FFFFFF',
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    borderRadius: 12,
    fontSize: 16, 
    paddingVertical: 16,
    paddingHorizontal: 16,
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
  buttonPrimary: { 
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
  buttonTextPrimary: { color: '#fff', fontSize: 18, fontWeight: '600' },
  footerText: { textAlign: 'center', color: '#666', fontSize: 15 },
  footerLink: { color: '#00BFA5', fontWeight: 'bold' }
});

export default LoginScreen;