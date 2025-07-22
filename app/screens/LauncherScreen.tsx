import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface LauncherScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const LauncherScreen = ({ navigation }: LauncherScreenProps) => {
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (hasLaunched === 'true') {
          // navigation.replace('Login'); // Removed as per edit hint
        } else {
          // navigation.replace('GetStarted'); // Removed as per edit hint
        }
      } catch (e) {
        // navigation.replace('GetStarted'); // fallback // Removed as per edit hint
      }
    };
    checkFirstLaunch();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4CAF50" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default LauncherScreen; 