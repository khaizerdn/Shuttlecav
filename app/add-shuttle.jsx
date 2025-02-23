// AddShuttle.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import globalStyles from './globalstyles';
import { config } from './config';

const AddShuttle = () => {
  const router = useRouter();

  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newRouteFrom, setNewRouteFrom] = useState('Carmona Estates');
  const [newRouteTo, setNewRouteTo] = useState('Waltermart');

  const swapRoute = () => {
    setNewRouteFrom(newRouteTo);
    setNewRouteTo(newRouteFrom);
  };

  const addShuttle = async () => {
    if (
      newFirstName.trim() &&
      newLastName.trim() &&
      newPlate.trim() &&
      newRouteFrom.trim() &&
      newRouteTo.trim()
    ) {
      const newShuttleObj = {
        shuttleDriver: `${newFirstName.trim()} ${newLastName.trim()}`,
        shuttlePlatNumber: newPlate.trim(),
        route: `${newRouteFrom.trim()} to ${newRouteTo.trim()}`,
      };

      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${config.API_URL}/shuttles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newShuttleObj),
        });

        if (response.ok) {
          Alert.alert('Success', 'Shuttle added successfully');
          router.back();
        } else {
          const errorData = await response.json();
          Alert.alert('Error', errorData.message || 'Failed to add shuttle');
        }
      } catch (error) {
        console.error('Error adding shuttle:', error);
        Alert.alert('Error', 'An unexpected error occurred');
      }
    } else {
      Alert.alert('Validation', 'Please fill out all fields');
    }
  };

  return (
    <View style={styles.fullScreen}>
      <Text style={styles.sectionTitle}>Driver and Shuttle Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Driver's First Name"
        value={newFirstName}
        onChangeText={setNewFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Driver's Last Name"
        value={newLastName}
        onChangeText={setNewLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Shuttle's Plate Number"
        value={newPlate}
        onChangeText={setNewPlate}
      />
      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Route</Text>
      <View style={styles.routeContainer}>
        <View style={styles.routeInputContainer}>
          <Text style={styles.routeLabel}>From</Text>
          <TextInput
            style={[styles.input, styles.routeInput]}
            placeholder="From"
            value={newRouteFrom}
            onChangeText={setNewRouteFrom}
          />
        </View>
        <TouchableOpacity onPress={swapRoute} style={styles.swapButton}>
          <Text style={styles.swapButtonText}>⇄</Text>
        </TouchableOpacity>
        <View style={styles.routeInputContainer}>
          <Text style={styles.routeLabel}>To</Text>
          <TextInput
            style={[styles.input, styles.routeInput]}
            placeholder="To"
            value={newRouteTo}
            onChangeText={setNewRouteTo}
          />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={globalStyles.button} onPress={addShuttle}>
          <Text style={globalStyles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = {
  fullScreen: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  input: {
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    width: '100%',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  routeContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  routeInputContainer: {
    width: '100%',
    marginBottom: 10,
  },
  routeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  routeInput: {
    width: '100%',
  },
  swapButton: {
    backgroundColor: '#3578E5',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  swapButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  buttonContainer: {
    marginTop: 'auto',
  },
};

export default AddShuttle;
