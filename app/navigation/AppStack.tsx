import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabNavigator from './MainTabNavigator';
import AllTransactionsScreen from '../screens/AllTransactionsScreen';
import { StackNavigationProp } from '@react-navigation/stack';

const Stack = createStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator id={undefined}>
      <Stack.Screen 
        name="Main" 
        component={MainTabNavigator} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="AllTransactions" 
        component={AllTransactionsScreen}
        options={{ 
          headerTitle: 'All Transactions',
          headerStyle: {
            backgroundColor: '#F8F9FA',
          },
          headerTintColor: '#1A1A1A',
        }} 
      />
    </Stack.Navigator>
  );
};

export default AppStack; 