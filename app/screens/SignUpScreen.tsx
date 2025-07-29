import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Toast from 'react-native-toast-message';
import SuccessModal from '../components/SuccessModal';
import * as Haptics from 'expo-haptics';

interface SignUpScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const SignUpScreen = ({ navigation }: SignUpScreenProps) => { 
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSignUp = () => {
    if (!fullName || !email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredentials) => {
        // 1. Set displayName in Auth
        await updateProfile(userCredentials.user, { displayName: fullName });
        // 2. Create Firestore user document
        await setDoc(doc(db, 'users', userCredentials.user.uid), {
          fullName,
          email,
          createdAt: new Date(),
        });
        // 3. Show success and let user stay signed in
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          // User stays signed in and will be redirected to Dashboard by your navigation logic
        }, 1200);
      })
      .catch(error => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Sign Up Error', error.message);
      });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Create an Account</Text>
          <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#90A4AE" value={fullName} onChangeText={setFullName} />
          <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#90A4AE" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Password (min. 6 characters)" placeholderTextColor="#90A4AE" value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity style={styles.buttonPrimary} onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleSignUp();
          }}>
            <Text style={styles.buttonTextPrimary}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            Haptics.selectionAsync();
            navigation.navigate('Login');
          }}>
            <Text style={styles.footerText}>Already have an account? <Text style={styles.footerLink}>Log In</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <Toast />
      <SuccessModal visible={showSuccess} message="Account created!" />
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