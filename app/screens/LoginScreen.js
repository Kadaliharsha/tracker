import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar, Alert, SafeAreaView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then(userCredentials => {
        console.log('Logged in with:', userCredentials.user.email);
        // On success, replace the auth flow with the dashboard
        navigation.replace('Dashboard');
      })
      .catch(error => Alert.alert('Login Error', error.message));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Image source={require('../assets/logo-growth.png')} style={styles.logo} />
        <Text style={styles.title}>Welcome Back</Text>
        <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#90A4AE" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#90A4AE" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin}>
          <Text style={styles.buttonTextPrimary}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.footerText}>Don't have an account? <Text style={styles.footerLink}>Sign Up</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'center', padding: 30 },
  logo: { width: 120, height: 120, resizeMode: 'contain', alignSelf: 'center', marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1A2E35', textAlign: 'center', marginBottom: 40 },
  input: { borderBottomWidth: 1, borderColor: '#CFD8DC', fontSize: 18, paddingVertical: 15, marginBottom: 25, color: '#1A2E35' },
  buttonPrimary: { backgroundColor: '#00BFA5', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginTop: 20, marginBottom: 30 },
  buttonTextPrimary: { color: '#fff', fontSize: 18, fontWeight: '600' },
  footerText: { textAlign: 'center', color: '#546E7A', fontSize: 15 },
  footerLink: { color: '#00BFA5', fontWeight: 'bold' }
});

export default LoginScreen;