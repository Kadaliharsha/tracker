import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

const DashboardScreen = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Replace the dashboard with the login screen
      navigation.replace('Login'); 
    } catch (error) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1A2E35', marginBottom: 40 },
  button: { backgroundColor: '#00BFA5', paddingVertical: 16, paddingHorizontal: 50, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});

export default DashboardScreen;