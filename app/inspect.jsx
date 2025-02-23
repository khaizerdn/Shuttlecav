// Inspect.jsx
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, Modal, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from './globalstyles';
import { useRouter, useFocusEffect } from 'expo-router';
import { config } from './config';

const Inspect = () => {
  const router = useRouter();
  const [shuttleList, setShuttleList] = useState([]);

  // Delete confirmation state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [shuttleToDelete, setShuttleToDelete] = useState(null);

  // Add Shuttle modal state and fields
  const [addShuttleModalVisible, setAddShuttleModalVisible] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newRouteFrom, setNewRouteFrom] = useState('Carmona Estates');
  const [newRouteTo, setNewRouteTo] = useState('Waltermart');

  const fetchShuttles = async () => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await fetch(`${config.API_URL}/shuttles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        // Sort the shuttles in descending order by id (assuming numeric timestamp)
        const sortedData = data.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        setShuttleList(sortedData);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to fetch shuttles');
      }
    } catch (error) {
      console.error('Error fetching shuttles:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchShuttles();
    }, [])
  );

  // Delete shuttle API call
  const handleDelete = async (id) => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await fetch(`${config.API_URL}/shuttles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setShuttleList(shuttleList.filter((item) => item.id !== id));
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to delete shuttle');
      }
    } catch (error) {
      console.error('Error deleting shuttle:', error);
    }
  };

  // Open confirmation modal for deletion
  const confirmDelete = (shuttle) => {
    setShuttleToDelete(shuttle);
    setDeleteModalVisible(true);
  };

  // Handle deletion confirmation
  const handleConfirmDelete = () => {
    if (shuttleToDelete) {
      handleDelete(shuttleToDelete.id);
      setShuttleToDelete(null);
      setDeleteModalVisible(false);
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setShuttleToDelete(null);
    setDeleteModalVisible(false);
  };

  // Swap route values
  const swapRoute = () => {
    setNewRouteFrom(newRouteTo);
    setNewRouteTo(newRouteFrom);
  };

  // Add Shuttle API call (via modal)
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
          setAddShuttleModalVisible(false);
          // Clear fields
          setNewFirstName('');
          setNewLastName('');
          setNewPlate('');
          setNewRouteFrom('Carmona Estates');
          setNewRouteTo('Waltermart');
          // Refresh shuttle list (new shuttle will appear at top due to sorting)
          fetchShuttles();
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
    <View style={globalStyles.container}>
      {/* Header Row */}
      <View style={globalStyles.sectionTitleContainer}>
        <Text style={globalStyles.sectionTitle}>Select shuttle</Text>
        <TouchableOpacity onPress={() => setAddShuttleModalVisible(true)}>
          <Text style={globalStyles.sectionAddIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Shuttle List */}
      <View style={globalStyles.listContainer}>
        <FlatList
          data={shuttleList}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/start-inspection',
                  params: {
                    driver: item.shuttleDriver,
                    plate: item.shuttlePlatNumber,
                    route: item.route,
                  },
                })
              }
            >
              <View style={globalStyles.listItem}>
                <View style={globalStyles.listItemLeft}>
                  <Text style={globalStyles.listItemDate}>{item.route}</Text>
                  <Text style={globalStyles.listItemPrimary}>
                    {item.shuttleDriver} - {item.shuttlePlatNumber}
                  </Text>
                </View>
                <TouchableOpacity
                  style={globalStyles.redListButton}
                  onPress={() => confirmDelete(item)}
                >
                  <Text style={globalStyles.listButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Delete Confirmation Modal (Scrollable) */}
      <Modal visible={deleteModalVisible} animationType="none" transparent={true}>
          <View style={globalStyles.modalOverlay}>
            <View style={globalStyles.modalContainer}>
              <Text style={globalStyles.modalTitle}>Confirm Deletion</Text>
              {shuttleToDelete && (
                <>
                  <Text style={globalStyles.modalText}>
                    Are you sure you want to delete the shuttle?
                  </Text>
                  <View style={globalStyles.listItem}>
                    <View style={globalStyles.listItemLeft}>
                      <Text style={globalStyles.listItemDate}>{shuttleToDelete.route}</Text>
                      <Text style={globalStyles.listItemPrimary}>
                        {shuttleToDelete.shuttleDriver} - {shuttleToDelete.shuttlePlatNumber}
                      </Text>
                    </View>
                  </View>
                </>
              )}
              <View style={globalStyles.modalButtons}>
                <TouchableOpacity
                  style={[globalStyles.actionButton, styles.modalButton, { backgroundColor: '#e74c3c' }]}
                  onPress={cancelDelete}
                >
                  <Text style={globalStyles.actionButtonText}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[globalStyles.actionButton, styles.modalButton, { backgroundColor: '#3578E5' }]}
                  onPress={handleConfirmDelete}
                >
                  <Text style={globalStyles.actionButtonText}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
      </Modal>

      {/* Add Shuttle Modal (Scrollable) */}
      <Modal visible={addShuttleModalVisible} animationType="none" transparent={true}>
        <ScrollView>
          <View style={globalStyles.modalOverlay}>
            <View style={globalStyles.modalContainer}>
              <Text style={globalStyles.modalTitle}>Add Shuttle</Text>
              <Text style={globalStyles.modalText}>Driver and Shuttle Information</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="Driver's First Name"
                value={newFirstName}
                onChangeText={setNewFirstName}
              />
              <TextInput
                style={globalStyles.input}
                placeholder="Driver's Last Name"
                value={newLastName}
                onChangeText={setNewLastName}
              />
              <TextInput
                style={globalStyles.input}
                placeholder="Shuttle's Plate Number"
                value={newPlate}
                onChangeText={setNewPlate}
              />
              <View style={globalStyles.separator} />
              <Text style={globalStyles.modalText}>Route</Text>
              <View style={styles.routeContainer}>
                <View style={styles.routeInputContainer}>
                  <Text style={styles.routeLabel}>From</Text>
                  <TextInput
                    style={[globalStyles.input]}
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
                    style={[globalStyles.input]}
                    placeholder="To"
                    value={newRouteTo}
                    onChangeText={setNewRouteTo}
                  />
                </View>
              </View>
              <View style={globalStyles.modalButtons}>
                <TouchableOpacity
                  style={[globalStyles.actionButton, styles.modalButton, { backgroundColor: '#e74c3c' }]}
                  onPress={() => setAddShuttleModalVisible(false)}
                >
                  <Text style={globalStyles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[globalStyles.actionButton, styles.modalButton, { backgroundColor: '#3578E5' }]}
                  onPress={addShuttle}
                >
                  <Text style={globalStyles.actionButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  routeContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
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
  swapButton: {
    backgroundColor: '#3578E5',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    width: 60,
    alignItems: 'center',
  },
  swapButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    height: 50,
  },
});

export default Inspect;
