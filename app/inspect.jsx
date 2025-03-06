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
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [plates, setPlates] = useState([]);
  const [selectedPlate, setSelectedPlate] = useState(null);
  const [showPlateModal, setShowPlateModal] = useState(false);

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
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to fetch routes');
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  // Fetch drivers for the selection list
  const fetchDrivers = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${config.API_URL}/drivers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDrivers(data);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to fetch drivers');
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  // Fetch plate numbers for the selection list
  const fetchPlates = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${config.API_URL}/shuttles-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPlates(data);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to fetch plate numbers');
      }
    } catch (error) {
      console.error('Error fetching plate numbers:', error);
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
    fetchDrivers();
    fetchPlates();
  }, []);

  // Reset selections whenever the Add Shuttle modal opens
  useEffect(() => {
    if (addShuttleModalVisible) {
      setSelectedDriver(null);
      setSelectedPlate(null);
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

  // Helper functions to get selected objects
  const getSelectedRouteObj = () => {
    return routes.find((r) => r.id === selectedRoute);
  };

  const getSelectedDriverObj = () => {
    return drivers.find((d) => d.id === selectedDriver);
  };

  const getSelectedPlateObj = () => {
    return plates.find((p) => p.id === selectedPlate);
  };

  // Add Shuttle API call
  const addShuttle = async () => {
    if (selectedDriver && selectedPlate && selectedRoute) {
      const driver = getSelectedDriverObj();
      const plate = getSelectedPlateObj();
      const newShuttleObj = {
        shuttleDriver: `${driver.firstname} ${driver.surname}`,
        shuttlePlatNumber: plate.plate_number,
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
          setSelectedDriver(null);
          setSelectedPlate(null);
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
      Alert.alert('Validation', 'Please select a driver, shuttle, and route');
    }
  };

  return (
    <View style={globalStyles.container}>
      {/* Header Row */}
      <View style={globalStyles.sectionTitleContainer}>
        <Text style={globalStyles.sectionTitle}>Select shuttle</Text>
        <TouchableOpacity
          onPress={() => {
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
                    added_rate: item.added_rate,
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
                    <Text style={globalStyles.listLeftBoxSecondaryText}>PHP</Text>
                    <Text style={globalStyles.listLeftBoxPrimaryText}>
                      {parseFloat(item.added_rate).toFixed(2)}
                    </Text>
                  </View>
                  <View
                    style={[
                      globalStyles.listlocationContainer,
                      { flex: 1, marginLeft: 10 },
                    ]}
                  >
                    <Text style={globalStyles.listItemPrimary}>
                      {item.origin} to {item.destination}
                    </Text>
                    <Text style={globalStyles.listItemDate}>
                      Driver: {item.shuttleDriver}
                    </Text>
                    <Text style={globalStyles.listItemDate}>
                      Plate: {item.shuttlePlatNumber}
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
              <Text style={globalStyles.modalText}>Please select a driver, shuttle, and route.</Text>
              {/* Driver Selection */}
              {selectedDriver && getSelectedDriverObj() ? (
                <View
                  style={[
                    globalStyles.listItem,
                    { flexDirection: 'row', alignItems: 'center' },
                  ]}
                >
                  <View style={globalStyles.listItemLeft}>
                    <Text style={globalStyles.listItemPrimary}>
                      {`${getSelectedDriverObj().surname}, ${getSelectedDriverObj().firstname} ${getSelectedDriverObj().middleinitial || ''}`}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={globalStyles.blueListButton}
                    onPress={() => setShowDriverModal(true)}
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
                  onPress={() => setShowDriverModal(true)}
                >
                  <Text style={globalStyles.buttonText}>Select Driver</Text>
                </TouchableOpacity>
              )}
              {/* Plate Number Selection */}
              {selectedPlate && getSelectedPlateObj() ? (
                <View
                  style={[
                    globalStyles.listItem,
                    { flexDirection: 'row', alignItems: 'center' },
                  ]}
                >
                  <View style={globalStyles.listItemLeft}>
                    <Text style={globalStyles.listItemPrimary}>
                      {getSelectedPlateObj().plate_number}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={globalStyles.blueListButton}
                    onPress={() => setShowPlateModal(true)}
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
                  onPress={() => setShowPlateModal(true)}
                >
                  <Text style={globalStyles.buttonText}>Select Shuttle</Text>
                </TouchableOpacity>
              )}

              {/* Route Selection */}
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

      {/* Driver Selection Modal */}
      <Modal visible={showDriverModal} animationType="none" transparent={false}>
        <ScrollView>
          <View style={globalStyles.modalOverlay}>
            <View style={globalStyles.modalContainer}>
              <Text style={globalStyles.modalTitle}>Select Driver</Text>
              {drivers.map((driver) => (
                <TouchableOpacity
                  key={driver.id}
                  style={[
                    globalStyles.listItem,
                    { flexDirection: 'row', alignItems: 'center' },
                  ]}
                  onPress={() => {
                    setSelectedDriver(driver.id);
                    setShowDriverModal(false);
                  }}
                >
                  <View style={globalStyles.listItemLeft}>
                    <Text style={globalStyles.listItemPrimary}>
                      {`${driver.surname}, ${driver.firstname} ${driver.middleinitial || ''}`}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  globalStyles.actionButton,
                  { backgroundColor: '#e74c3c', marginTop: 10, alignSelf: 'center' },
                ]}
                onPress={() => setShowDriverModal(false)}
              >
                <Text style={globalStyles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>

      {/* Plate Number Selection Modal */}
      <Modal visible={showPlateModal} animationType="none" transparent={false}>
        <ScrollView>
          <View style={globalStyles.modalOverlay}>
            <View style={globalStyles.modalContainer}>
              <Text style={globalStyles.modalTitle}>Select Plate Number</Text>
              {plates.map((plate) => (
                <TouchableOpacity
                  key={plate.id}
                  style={[
                    globalStyles.listItem,
                    { flexDirection: 'row', alignItems: 'center' },
                  ]}
                  onPress={() => {
                    setSelectedPlate(plate.id);
                    setShowPlateModal(false);
                  }}
                >
                  <View style={globalStyles.listItemLeft}>
                    <Text style={globalStyles.listItemPrimary}>
                      {plate.plate_number}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  globalStyles.actionButton,
                  { backgroundColor: '#e74c3c', marginTop: 10, alignSelf: 'center' },
                ]}
                onPress={() => setShowPlateModal(false)}
              >
                <Text style={globalStyles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>

      {/* Route Selection Modal */}
      <Modal visible={showRouteModal} animationType="none" transparent={false}>
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
              <TouchableOpacity
                style={[
                  globalStyles.actionButton,
                  { backgroundColor: '#e74c3c', marginTop: 10, alignSelf: 'center' },
                ]}
                onPress={() => setShowRouteModal(false)}
              >
                <Text style={globalStyles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
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