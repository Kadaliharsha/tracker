import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { getAuth, signOut, updateProfile } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Avatar } from 'react-native-paper';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface ProfileScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const displayName = user?.displayName || 'Your Name'; // Fallback if not set
  const photoURL = user?.photoURL; // Fallback if not set

  // State management for the edit profile modal
  const [editModalVisible, setEditModalVisible] = React.useState(false); // Controls modal visibility
  const [newName, setNewName] = React.useState(displayName); // Stores the new name being edited
  const [updating, setUpdating] = React.useState(false); // Loading state during update

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error("Logout failed:", error);
    }
  };

  // Handle opening the edit profile modal
  const handleEditProfile = () => {
    Haptics.selectionAsync(); // Provide haptic feedback
    setNewName(displayName); // Pre-fill with current name
    setEditModalVisible(true); // Show the modal
  };

  // Handle saving the new name to both Firebase Auth and Firestore
  const handleSaveName = async () => {
    // Validate user is logged in and name is not empty
    if (!user || !newName.trim()) return;
    
    setUpdating(true); // Show loading state
    try {
      // Update displayName in Firebase Auth (for immediate UI updates)
      await updateProfile(user, { displayName: newName.trim() });
      
      // Update fullName in Firestore (for data persistence and additional user info)
      await setDoc(doc(db, 'users', user.uid), {
        fullName: newName.trim(),
        email: user.email,
        // Note: We don't overwrite createdAt to preserve the original sign-up date
      }, { merge: true }); // merge: true keeps existing fields like createdAt
      
      // Provide success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Profile updated successfully!');
      setEditModalVisible(false); // Close the modal
    } catch (error) {
      // Handle errors gracefully
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
    setUpdating(false); // Hide loading state
  };

  return (
    <SafeAreaView style={styles.container} edges={['top'] as Edge[]}>
      <View style={styles.header}>
        {/* Display user avatar - use photoURL if available, otherwise show default icon */}
        {photoURL ? (
          <Avatar.Image size={80} source={{ uri: photoURL }} style={styles.avatar} />
        ) : (
          <Avatar.Icon size={80} icon="account" style={styles.avatar} />
        )}
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{user ? user.email : 'No user logged in'}</Text>
        {/* Edit Profile button - opens modal for name editing */}
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => Haptics.selectionAsync()}>
          <Ionicons name="settings-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Account Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => Haptics.selectionAsync()}>
          <Ionicons name="help-circle-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Help & Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => {
          Haptics.selectionAsync();
          handleLogout();
        }}>
          <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
          <Text style={[styles.menuText, { color: '#FF6B6B' }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Cross-platform Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)} // Handle back button on Android
      >
        {/* Modal backdrop - semi-transparent overlay */}
        <View style={{
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: 'rgba(0,0,0,0.3)' // Semi-transparent background
        }}>
          {/* Modal content container */}
          <View style={{
            backgroundColor: '#fff', 
            borderRadius: 12, 
            padding: 24, 
            width: '80%', 
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Edit Name</Text>
            
            {/* Text input for the new name */}
            <TextInput
              value={newName}
              onChangeText={setNewName}
              style={{
                borderWidth: 1, 
                borderColor: '#E0E0E0', 
                borderRadius: 8, 
                padding: 10, 
                width: '100%', 
                marginBottom: 16
              }}
              placeholder="Enter your name"
              autoFocus // Automatically focus the input when modal opens
            />
            
            {/* Action buttons container */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              {/* Cancel button */}
              <TouchableOpacity
                style={{ 
                  padding: 10, 
                  borderRadius: 8, 
                  backgroundColor: '#E0E0E0', 
                  marginRight: 8, 
                  flex: 1, 
                  alignItems: 'center' 
                }}
                onPress={() => setEditModalVisible(false)}
                disabled={updating} // Disable during update
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              
              {/* Save button */}
              <TouchableOpacity
                style={{ 
                  padding: 10, 
                  borderRadius: 8, 
                  backgroundColor: '#00BFA5', 
                  flex: 1, 
                  alignItems: 'center' 
                }}
                onPress={handleSaveName}
                disabled={updating} // Disable during update
              >
                {updating ? (
                  <ActivityIndicator color="#fff" /> // Show loading spinner
                ) : (
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 100, // Add padding to push content down from the notch
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  menu: {
    marginHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 20,
    color: '#333',
  },
  avatar: { backgroundColor: '#00BFA5', marginBottom: 10 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  editButton: { 
    paddingHorizontal: 16, 
    paddingVertical: 6, 
    borderRadius: 20, 
    backgroundColor: '#E0F7FA', 
    marginTop: 8 
  },
  editButtonText: { 
    color: '#00BFA5', 
    fontWeight: 'bold' 
  },
});

export default ProfileScreen; 