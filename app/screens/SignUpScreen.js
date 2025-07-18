import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const SignUpScreen = () => { 
  const navigation = useNavigation();
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
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
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'center', padding: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1A2E35', marginBottom: 40 },
  input: { borderBottomWidth: 1, borderColor: '#CFD8DC', fontSize: 18, paddingVertical: 15, marginBottom: 25, color: '#1A2E35' },
  buttonPrimary: { backgroundColor: '#00BFA5', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginTop: 20, marginBottom: 30 },
  buttonTextPrimary: { color: '#fff', fontSize: 18, fontWeight: '600' },
  footerText: { textAlign: 'center', color: '#546E7A', fontSize: 15 },
  footerLink: { color: '#00BFA5', fontWeight: 'bold' }
});

export default SignUpScreen;