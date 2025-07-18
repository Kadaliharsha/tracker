// App.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
// This path is now corrected to include the 'app' folder
import AppNavigator from './app/navigation/AppNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}