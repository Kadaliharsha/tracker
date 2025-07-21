// app/navigation/AuthNavigator.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GetStartedScreen from '../screens/GetStartedScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = ({ isFirstLaunch }) => {
  return (
    <Stack.Navigator initialRouteName={isFirstLaunch ? 'GetStarted' : 'Login'}>
      <Stack.Screen name="GetStarted" component={GetStartedScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;