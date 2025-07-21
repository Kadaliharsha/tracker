import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabNavigator from './MainTabNavigator';
import AllTransactionsScreen from '../screens/AllTransactionsScreen';

const Stack = createStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator>
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
          headerBackTitleVisible: false,
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