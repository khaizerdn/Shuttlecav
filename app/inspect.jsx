import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
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

  // Routes state for selection
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showRouteModal, setShowRouteModal] = useState(false);

  // Fetch routes for the selection list
  const fetchRoutes = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${config.API_URL}/routes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRoutes(data);
        // Removed default route selection to force manual selection
        // if (data.length > 0 && !selectedRoute) {
        //   setSelectedRoute(data[0].id);
        // }
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to fetch routes');
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  // Fetch shuttles
  const fetchShuttles = async () => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await fetch(`${config.API_URL}/shuttles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        // Sort shuttles in descending order by id (assuming numeric timestamp)
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

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Reset selected route whenever the Add Shuttle modal opens
  useEffect(() => {
    if (addShuttleModalVisible) {
      setSelectedRoute(null);
    }
  }, [addShuttleModalVisible]);

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

  // Helper: Get route object by id
  const getSelectedRouteObj = () => {
    return routes.find((r) => r.id === selectedRoute);
  };

  // Add Shuttle API call (via modal)
  // Now, instead of sending the full route details,
  // we only send route_id.
  const addShuttle = async () => {
    if (
      newFirstName.trim() &&
      newLastName.trim() &&
      newPlate.trim() &&
      selectedRoute
    ) {
      const newShuttleObj = {
        shuttleDriver: `${newFirstName.trim()} ${newLastName.trim()}`,
        shuttlePlatNumber: newPlate.trim(),
        route_id: selectedRoute,
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
          setSelectedRoute(null);
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
        <TouchableOpacity
          onPress={() => {
            // Reset fields and selected route every time the modal is opened
            setNewFirstName('');
            setNewLastName('');
            setNewPlate('');
            setSelectedRoute(null);
            setAddShuttleModalVisible(true);
          }}
        >
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
                    origin: item.origin,
                    destination: item.destination,
                  },
                })
              }
            >
              <View style={globalStyles.listItem}>
                <View
                  style={[
                    globalStyles.listItemLeftRow,
                    { flex: 1, flexDirection: 'row', alignItems: 'center' },
                  ]}
                >
                  <View style={globalStyles.listLeftBox}>
                    <Text style={globalStyles.listLeftBoxText}>
                      + PHP {parseFloat(item.added_rate).toFixed(2)}
                    </Text>
                  </View>
                  <View
                    style={[
                      globalStyles.listlocationContainer,
                      { flex: 1, marginLeft: 10 },
                    ]}
                  >
                    <Text style={globalStyles.listItemDate}>
                      {item.origin} to {item.destination}
                    </Text>
                    <Text style={globalStyles.listItemPrimary}>
                      {item.shuttleDriver}
                    </Text>
                    <Text style={globalStyles.listItemPrimary}>
                      {item.shuttlePlatNumber}
                    </Text>
                  </View>
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

      {/* Delete Confirmation Modal */}
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
                    <Text style={globalStyles.listItemDate}>
                      From: {shuttleToDelete.origin} | To: {shuttleToDelete.destination}
                    </Text>
                    <Text style={globalStyles.listItemPrimary}>
                      {shuttleToDelete.shuttleDriver} - {shuttleToDelete.shuttlePlatNumber}
                    </Text>
                  </View>
                </View>
              </>
            )}
            <View style={globalStyles.modalButtons}>
              <TouchableOpacity
                style={[
                  globalStyles.actionButton,
                  { backgroundColor: '#e74c3c' },
                ]}
                onPress={cancelDelete}
              >
                <Text style={globalStyles.actionButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  globalStyles.actionButton,
                  { backgroundColor: '#3578E5' },
                ]}
                onPress={handleConfirmDelete}
              >
                <Text style={globalStyles.actionButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Shuttle Modal */}
      <Modal visible={addShuttleModalVisible} animationType="none" transparent={true}>
        <ScrollView>
          <View style={globalStyles.modalOverlay}>
            <View style={globalStyles.modalContainer}>
              <Text style={globalStyles.modalTitle}>Add Shuttle</Text>
              <Text style={globalStyles.modalText}>
                Driver and Shuttle Information
              </Text>
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
              {/* Display Selected Route or a button to select one */}
              {selectedRoute && getSelectedRouteObj() ? (
                <View
                  style={[
                    globalStyles.listItem,
                    { flexDirection: 'row', alignItems: 'center' },
                  ]}
                >
                  <View
                    style={[
                      globalStyles.listItemLeftRow,
                      { flex: 1, flexDirection: 'row', alignItems: 'center' },
                    ]}
                  >
                    <View style={globalStyles.listLeftBox}>
                      <Text style={globalStyles.listLeftBoxText}>
                        + PHP {parseFloat(getSelectedRouteObj().added_rate).toFixed(2)}
                      </Text>
                    </View>
                    <View
                      style={[
                        globalStyles.listlocationContainer,
                        { flex: 1, marginLeft: 10 },
                      ]}
                    >
                      <Text
                        style={globalStyles.listItemPrimary}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        From: {getSelectedRouteObj().origin}
                      </Text>
                      <Text
                        style={globalStyles.listItemPrimary}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        To: {getSelectedRouteObj().destination}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={globalStyles.blueListButton}
                    onPress={() => setShowRouteModal(true)}
                  >
                    <Text style={globalStyles.listButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    globalStyles.button,
                    { alignSelf: 'center', marginVertical: 10 },
                  ]}
                  onPress={() => setShowRouteModal(true)}
                >
                  <Text style={globalStyles.buttonText}>Select Route</Text>
                </TouchableOpacity>
              )}
              <View style={globalStyles.modalButtons}>
                <TouchableOpacity
                  style={[
                    globalStyles.actionButton,
                    { backgroundColor: '#e74c3c' },
                  ]}
                  onPress={() => setAddShuttleModalVisible(false)}
                >
                  <Text style={globalStyles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    globalStyles.actionButton,
                    { backgroundColor: '#3578E5' },
                  ]}
                  onPress={addShuttle}
                >
                  <Text style={globalStyles.actionButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>

      {/* Route Selection Modal */}
      <Modal visible={showRouteModal} animationType="fade" transparent={false}>
        <ScrollView>
          <View style={globalStyles.modalOverlay}>
            <View style={globalStyles.modalContainer}>
              <Text style={globalStyles.modalTitle}>Select Route</Text>
              {routes.map((route) => (
                <TouchableOpacity
                  key={route.id}
                  style={[
                    globalStyles.listItem,
                    { flexDirection: 'row', alignItems: 'center' },
                  ]}
                  onPress={() => {
                    setSelectedRoute(route.id);
                    setShowRouteModal(false);
                  }}
                >
                  <View
                    style={[
                      globalStyles.listItemLeftRow,
                      { flex: 1, flexDirection: 'row', alignItems: 'center' },
                    ]}
                  >
                    <View style={globalStyles.listLeftBox}>
                      <Text style={globalStyles.listLeftBoxText}>
                        + PHP {parseFloat(route.added_rate).toFixed(2)}
                      </Text>
                    </View>
                    <View
                      style={[
                        globalStyles.listlocationContainer,
                        { flex: 1, marginLeft: 10 },
                      ]}
                    >
                      <Text
                        style={globalStyles.listItemPrimary}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        From: {route.origin}
                      </Text>
                      <Text
                        style={globalStyles.listItemPrimary}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        To: {route.destination}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#777',
    marginVertical: 10,
    textAlign: 'center',
  },
});

export default Inspect;
