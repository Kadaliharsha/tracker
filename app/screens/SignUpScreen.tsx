import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

interface SignUpScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const SignUpScreen = ({ navigation }: SignUpScreenProps) => { 
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredentials => {
        Alert.alert(
          'Account Created', 
          'Please proceed to login.', 
          [
            { text: 'OK', onPress: () => navigation.replace('Login') } 
          ]
        );
      })
      .catch(error => Alert.alert('Sign Up Error', error.message));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={styles.content}>
        <Text style={styles.title}>Create an Account</Text>
        <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#90A4AE" value={fullName} onChangeText={setFullName} />
        <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#90A4AE" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password (min. 6 characters)" placeholderTextColor="#90A4AE" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleSignUp}>
          <Text style={styles.buttonTextPrimary}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerText}>Already have an account? <Text style={styles.footerLink}>Log In</Text></Text>
        </TouchableOpacity>
      </View>
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
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#1A1A1A', 
    marginBottom: 40,
    textAlign: 'center'
  },
  input: { 
    backgroundColor: '#FFFFFF',
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    borderRadius: 12,
    fontSize: 16, 
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
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
    marginBottom: 30,
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

export default SignUpScreen;