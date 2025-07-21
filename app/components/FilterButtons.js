import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const FILTERS = ['This Month', 'This Year', 'All Time'];

const FilterButtons = ({ activeFilter, onChange }) => {
  return (
    <View style={styles.container}>
      {FILTERS.map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.button,
            activeFilter === filter ? styles.activeButton : styles.inactiveButton,
          ]}
          onPress={() => onChange(filter)}
        >
          <Text
            style={[
              styles.buttonText,
              activeFilter === filter ? styles.activeButtonText : styles.inactiveButtonText,
            ]}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#E8E8E8',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  inactiveButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeButtonText: {
    color: '#00BFA5',
  },
  inactiveButtonText: {
    color: '#666',
  },
});

export default FilterButtons; 