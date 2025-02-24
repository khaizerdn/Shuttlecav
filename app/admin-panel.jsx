// admin-panel.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from './globalstyles';
import { config } from './config';

const AdminPanel = () => {
  // State arrays will now be loaded from the backend.
  const [passengerTypes, setPassengerTypes] = useState([]);
  const [routes, setRoutes] = useState([]);

  // Editing states for passenger type (object-based)
  const [editingPassenger, setEditingPassenger] = useState(null);
  const [tempPassengerType, setTempPassengerType] = useState('');
  const [tempFareRate, setTempFareRate] = useState('');

  // Editing states for route (index-based, using the route object)
  const [editingRouteIndex, setEditingRouteIndex] = useState(null);
  const [tempRouteFrom, setTempRouteFrom] = useState('');
  const [tempRouteTo, setTempRouteTo] = useState('');
  const [tempRouteRate, setTempRouteRate] = useState('');

  // Modal states for adding new entries
  const [newPassengerModalVisible, setNewPassengerModalVisible] = useState(false);
  const [newPassengerType, setNewPassengerType] = useState('');
  const [newPassengerFare, setNewPassengerFare] = useState('');

  const [newRouteModalVisible, setNewRouteModalVisible] = useState(false);
  const [newRouteFrom, setNewRouteFrom] = useState('');
  const [newRouteTo, setNewRouteTo] = useState('');
  const [newRouteRate, setNewRouteRate] = useState('');

  // --- Fetching Data ---
  const fetchPassengerTypes = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${config.API_URL}/passenger-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPassengerTypes(data);
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to fetch passenger types');
      }
    } catch (error) {
      console.error('Error fetching passenger types:', error);
    }
  };

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
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to fetch routes');
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  useEffect(() => {
    fetchPassengerTypes();
    fetchRoutes();
  }, []);

  // --- Passenger Type Editing ---
  const openPassengerEditModal = (passenger) => {
    setEditingPassenger(passenger);
    setTempPassengerType(passenger.passenger_type);
    setTempFareRate(passenger.passenger_rate.toString());
  };

  const savePassengerEdit = async () => {
    if (!editingPassenger) return;
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${config.API_URL}/passenger-types/${editingPassenger.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          passenger_type: tempPassengerType,
          passenger_rate: parseFloat(tempFareRate) || 0,
        }),
      });
      if (response.ok) {
        fetchPassengerTypes();
        cancelPassengerEdit();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to update passenger type');
      }
    } catch (error) {
      console.error('Error updating passenger type:', error);
    }
  };

  const cancelPassengerEdit = () => {
    setEditingPassenger(null);
    setTempPassengerType('');
    setTempFareRate('');
  };

  const deletePassengerType = async () => {
    if (!editingPassenger) return;
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${config.API_URL}/passenger-types/${editingPassenger.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchPassengerTypes();
        cancelPassengerEdit();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to delete passenger type');
      }
    } catch (error) {
      console.error('Error deleting passenger type:', error);
    }
  };

  // --- Route Editing ---
  const openRouteEditModal = (index) => {
    const route = routes[index];
    setEditingRouteIndex(index);
    setTempRouteFrom(route.origin);
    setTempRouteTo(route.destination);
    setTempRouteRate(route.added_rate.toString());
  };

  const saveRouteEdit = async () => {
    if (editingRouteIndex === null) return;
    const routeToEdit = routes[editingRouteIndex];
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${config.API_URL}/routes/${routeToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          origin: tempRouteFrom,
          destination: tempRouteTo,
          added_rate: parseFloat(tempRouteRate) || 0,
        }),
      });
      if (response.ok) {
        fetchRoutes();
        cancelRouteEdit();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to update route');
      }
    } catch (error) {
      console.error('Error updating route:', error);
    }
  };

  const cancelRouteEdit = () => {
    setEditingRouteIndex(null);
    setTempRouteFrom('');
    setTempRouteTo('');
    setTempRouteRate('');
  };

  const deleteRouteEdit = async () => {
    if (editingRouteIndex === null) return;
    const routeToDelete = routes[editingRouteIndex];
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${config.API_URL}/routes/${routeToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchRoutes();
        cancelRouteEdit();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to delete route');
      }
    } catch (error) {
      console.error('Error deleting route:', error);
    }
  };

  // --- New Passenger Type ---
  const openNewPassengerModal = () => {
    setNewPassengerModalVisible(true);
    setNewPassengerType('');
    setNewPassengerFare('');
  };

  const saveNewPassengerType = async () => {
    if (newPassengerType.trim() === '') return;
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${config.API_URL}/passenger-types`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          passenger_type: newPassengerType,
          passenger_rate: parseFloat(newPassengerFare) || 0,
        }),
      });
      if (response.ok) {
        fetchPassengerTypes();
        cancelNewPassengerModal();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to add passenger type');
      }
    } catch (error) {
      console.error('Error adding new passenger type:', error);
    }
  };

  const cancelNewPassengerModal = () => {
    setNewPassengerModalVisible(false);
    setNewPassengerType('');
    setNewPassengerFare('');
  };

  // --- New Route ---
  const openNewRouteModal = () => {
    setNewRouteModalVisible(true);
    setNewRouteFrom('');
    setNewRouteTo('');
    setNewRouteRate('');
  };

  const saveNewRoute = async () => {
    if (newRouteFrom.trim() === '' || newRouteTo.trim() === '') return;
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${config.API_URL}/routes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          origin: newRouteFrom,
          destination: newRouteTo,
          added_rate: parseFloat(newRouteRate) || 0,
        }),
      });
      if (response.ok) {
        fetchRoutes();
        cancelNewRouteModal();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to add route');
      }
    } catch (error) {
      console.error('Error adding new route:', error);
    }
  };

  const cancelNewRouteModal = () => {
    setNewRouteModalVisible(false);
    setNewRouteFrom('');
    setNewRouteTo('');
    setNewRouteRate('');
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, backgroundColor: '#FFF' }}>
      {/* Passenger Types Section */}
      <View style={globalStyles.sectionTitleContainer}>
        <Text style={globalStyles.sectionTitle}>Passenger Types:</Text>
        <TouchableOpacity onPress={openNewPassengerModal}>
          <Text style={globalStyles.sectionAddIcon}>+</Text>
        </TouchableOpacity>
      </View>
      {passengerTypes.map(passenger => (
        <View key={passenger.id} style={globalStyles.listItem}>
          <View style={globalStyles.listItemLeftRow}>
            <View style={globalStyles.listLeftBox}>
              <Text style={globalStyles.listLeftBoxText}>
                PHP {parseFloat(passenger.passenger_rate).toFixed(2)}
              </Text>
            </View>
            <Text
              style={[globalStyles.listItemPrimary, { marginLeft: 10, flexShrink: 1 }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {passenger.passenger_type}
            </Text>
          </View>
          <TouchableOpacity style={globalStyles.blueListButton} onPress={() => openPassengerEditModal(passenger)}>
            <Text style={globalStyles.listButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Modal for editing Passenger Type */}
      <Modal visible={editingPassenger !== null} animationType="none" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContainer}>
            <Text style={globalStyles.modalTitle}>Edit Passenger Type</Text>
            <TextInput
              style={globalStyles.input}
              value={tempPassengerType}
              onChangeText={setTempPassengerType}
              placeholder="Passenger Type"
            />
            <TextInput
              style={globalStyles.input}
              value={tempFareRate}
              onChangeText={setTempFareRate}
              placeholder="Fare Rate"
              keyboardType="numeric"
            />
            <View style={globalStyles.modalButtons}>
              <TouchableOpacity style={[globalStyles.actionButton, { backgroundColor: '#e74c3c' }]} onPress={cancelPassengerEdit}>
                <Text style={globalStyles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.actionButton, { backgroundColor: '#3578E5' }]} onPress={savePassengerEdit}>
                <Text style={globalStyles.actionButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={deletePassengerType}>
              <Text style={globalStyles.modalDeleteTextLink}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={globalStyles.separator} />

      {/* Routes Section */}
      <View style={globalStyles.sectionTitleContainer}>
        <Text style={globalStyles.sectionTitle}>Routes:</Text>
        <TouchableOpacity onPress={openNewRouteModal}>
          <Text style={globalStyles.sectionAddIcon}>+</Text>
        </TouchableOpacity>
      </View>
      {routes.map((route, index) => (
        <View
          key={route.id}
          style={[globalStyles.listItem, { flexDirection: 'row', alignItems: 'center' }]}
        >
          <View style={[globalStyles.listItemLeftRow, { flex: 1, flexDirection: 'row', alignItems: 'center' }]}>
            <View style={globalStyles.listLeftBox}>
              <Text style={globalStyles.listLeftBoxText}>
                + PHP {parseFloat(route.added_rate).toFixed(2)}
              </Text>
            </View>
            <View style={[globalStyles.listlocationContainer, { flex: 1, marginLeft: 10 }]}>
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
          <TouchableOpacity style={globalStyles.blueListButton} onPress={() => openRouteEditModal(index)}>
            <Text style={globalStyles.listButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Modal for editing Route */}
      <Modal visible={editingRouteIndex !== null} animationType="none" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContainer}>
            <Text style={globalStyles.modalTitle}>Edit Route</Text>
            <TextInput
              style={globalStyles.input}
              value={tempRouteFrom}
              onChangeText={setTempRouteFrom}
              placeholder="Origin"
            />
            <TextInput
              style={globalStyles.input}
              value={tempRouteTo}
              onChangeText={setTempRouteTo}
              placeholder="Destination"
            />
            <TextInput
              style={globalStyles.input}
              value={tempRouteRate}
              onChangeText={setTempRouteRate}
              placeholder="Added Rate"
              keyboardType="numeric"
            />
            <View style={globalStyles.modalButtons}>
              <TouchableOpacity style={[globalStyles.actionButton, { backgroundColor: '#e74c3c' }]} onPress={cancelRouteEdit}>
                <Text style={globalStyles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.actionButton, { backgroundColor: '#3578E5' }]} onPress={saveRouteEdit}>
                <Text style={globalStyles.actionButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={deleteRouteEdit}>
              <Text style={globalStyles.modalDeleteTextLink}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for adding a new Passenger Type */}
      <Modal visible={newPassengerModalVisible} animationType="none" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContainer}>
            <Text style={globalStyles.modalTitle}>Add Passenger Type</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Passenger Type"
              value={newPassengerType}
              onChangeText={setNewPassengerType}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Fare Rate"
              value={newPassengerFare}
              onChangeText={setNewPassengerFare}
              keyboardType="numeric"
            />
            <View style={globalStyles.modalButtons}>
              <TouchableOpacity style={[globalStyles.actionButton, { backgroundColor: '#e74c3c' }]} onPress={cancelNewPassengerModal}>
                <Text style={globalStyles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.actionButton, { backgroundColor: '#3578E5' }]} onPress={saveNewPassengerType}>
                <Text style={globalStyles.actionButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for adding a new Route */}
      <Modal visible={newRouteModalVisible} animationType="none" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContainer}>
            <Text style={globalStyles.modalTitle}>Add Route</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Origin"
              value={newRouteFrom}
              onChangeText={setNewRouteFrom}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Destination"
              value={newRouteTo}
              onChangeText={setNewRouteTo}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Added Rate"
              value={newRouteRate}
              onChangeText={setNewRouteRate}
              keyboardType="numeric"
            />
            <View style={globalStyles.modalButtons}>
              <TouchableOpacity style={[globalStyles.actionButton, { backgroundColor: '#e74c3c' }]} onPress={cancelNewRouteModal}>
                <Text style={globalStyles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.actionButton, { backgroundColor: '#3578E5' }]} onPress={saveNewRoute}>
                <Text style={globalStyles.actionButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default AdminPanel;
