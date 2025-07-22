// App.js

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppStack from './app/navigation/AppStack';
import AuthNavigator from './app/navigation/AuthNavigator';
import { onAuthStateChanged, getAuth } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null; // Or a loading spinner

  return (
    <SafeAreaProvider>
    <NavigationContainer>
        {user ? <AppStack /> : <AuthNavigator isFirstLaunch={false} />}
    </NavigationContainer>
    </SafeAreaProvider>
  );
}