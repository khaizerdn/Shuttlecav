import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import globalStyles from './globalstyles';

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

  const addShuttle = () => {
    if (
      newFirstName.trim() &&
      newLastName.trim() &&
      newPlate.trim() &&
      newRouteFrom.trim() &&
      newRouteTo.trim()
    ) {
      // Create the new shuttle object.
      const newShuttleObj = {
        shuttleDriver: `${newFirstName.trim()} ${newLastName.trim()}`,
        shuttlePlatNumber: newPlate.trim(),
        route: `${newRouteFrom.trim()} to ${newRouteTo.trim()}`,
      };

      // Attach the new shuttle to the search parameters and navigate back.
      router.setParams({ newShuttle: JSON.stringify(newShuttleObj) });
      router.back();
    }
  };

  return (
    <View style={styles.fullScreen}>
      <Text style={styles.sectionTitle}>Driver and Shuttle Information</Text>
      {/* Driver Inputs */}
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
      {/* Divider */}
      <View style={styles.divider} />
      {/* Route Section */}
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
      {/* Add Button attached to the bottom */}
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
    backgroundColor: '#EAEAEA',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  swapButtonText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 'auto', // Pushes the Add button to the very bottom
  },
};

export default AddShuttle;
