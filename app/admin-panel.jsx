import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from './globalstyles';
import { config } from './config';

const AdminPanel = () => {
  // State for passenger types
  const [passengerTypes, setPassengerTypes] = useState([]);
  const [editingPassenger, setEditingPassenger] = useState(null);
  const [tempPassengerType, setTempPassengerType] = useState('');
  const [tempFareRate, setTempFareRate] = useState('');
  const [newPassengerModalVisible, setNewPassengerModalVisible] = useState(false);
  const [newPassengerType, setNewPassengerType] = useState('');
  const [newPassengerFare, setNewPassengerFare] = useState('');

  // State for routes
  const [routes, setRoutes] = useState([]);
  const [editingRouteIndex, setEditingRouteIndex] = useState(null);
  const [tempRouteFrom, setTempRouteFrom] = useState('');
  const [tempRouteTo, setTempRouteTo] = useState('');
  const [tempRouteRate, setTempRouteRate] = useState('');
  const [newRouteModalVisible, setNewRouteModalVisible] = useState(false);
  const [newRouteFrom, setNewRouteFrom] = useState('');
  const [newRouteTo, setNewRouteTo] = useState('');
  const [newRouteRate, setNewRouteRate] = useState('');

  // State for inspectors
  const [inspectors, setInspectors] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [inspectorToDelete, setInspectorToDelete] = useState(null);
  const [addInspectorModalVisible, setAddInspectorModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);

  // Fetch passenger types from the server
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

  // Fetch routes from the server
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

  // Fetch inspectors from the server
  const fetchInspectors = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${config.API_URL}/inspectors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setInspectors(data);
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to fetch inspectors');
      }
    } catch (error) {
      console.error('Error fetching inspectors:', error);
      Alert.alert('Error', 'An error occurred while fetching inspectors');
    }
  };

  // Load data when the component mounts
  useEffect(() => {
    fetchPassengerTypes();
    fetchRoutes();
    fetchInspectors();
  }, []);

  // ### Passenger Type Functions ###
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

  // ### Route Functions ###
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

  // ### New Passenger Type Functions ###
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

  // ### New Route Functions ###
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

  // ### Inspector Functions ###
  const confirmDelete = (inspector) => {
    setInspectorToDelete(inspector);
    setDeleteModalVisible(true);
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setInspectorToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!inspectorToDelete) return;
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${config.API_URL}/users/${inspectorToDelete.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: null }), // Sets role to NULL
      });
      if (response.ok) {
        fetchInspectors(); // Refresh the list
        cancelDelete(); // Close the modal
        Alert.alert('Success', 'Inspector role removed successfully');
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to remove inspector role');
      }
    } catch (error) {
      console.error('Error removing inspector role:', error);
      Alert.alert('Error', 'An error occurred while removing the inspector');
    }
  };

  const openAddInspectorModal = async () => {
    setAddInspectorModalVisible(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${config.API_URL}/fetchusers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched users for modal:', data); // Debug log
        setUsers(data);
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'An error occurred while fetching users');
    }
  };

  const closeAddInspectorModal = () => {
    setAddInspectorModalVisible(false);
    setSearchQuery('');
    setUsers([]);
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setConfirmationModalVisible(true);
  };

  const confirmAssignInspector = async () => {
    if (!selectedUser) return;
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${config.API_URL}/fetchusers/${selectedUser.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: 'inspector' }),
      });
      if (response.ok) {
        fetchInspectors(); // Refresh the inspectors list
        setConfirmationModalVisible(false);
        setAddInspectorModalVisible(false);
        Alert.alert('Success', 'Inspector role assigned successfully');
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to assign inspector role');
      }
    } catch (error) {
      console.error('Error assigning inspector role:', error);
      Alert.alert('Error', 'An error occurred while assigning inspector role');
    }
  };

  const cancelAssignInspector = () => {
    setConfirmationModalVisible(false);
    setSelectedUser(null);
  };

  // Filter users based on search query (no additional role or ID filtering needed here)
  const filteredUsers = users.filter(user => {
    const fullName = `${user.surname || ''}, ${user.firstname || ''} ${user.middleinitial || ''}`.trim();
    return fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.username || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

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
              <Text style={globalStyles.listLeftBoxSecondaryText}>PHP</Text>
              <Text style={globalStyles.listLeftBoxPrimaryText}>
                {parseFloat(passenger.passenger_rate).toFixed(2)}
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

      {/* Modal for Editing Passenger Type */}
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

      {/* Modal for Adding New Passenger Type */}
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
              <Text style={globalStyles.listLeftBoxSecondaryText}>PHP</Text>
              <Text style={globalStyles.listLeftBoxPrimaryText}>
                {parseFloat(route.added_rate).toFixed(2)}
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

      {/* Modal for Editing Route */}
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

      {/* Modal for Adding New Route */}
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

      {/* Inspectors Section */}
      <View style={globalStyles.sectionTitleContainer}>
        <Text style={globalStyles.sectionTitle}>Inspectors:</Text>
        <TouchableOpacity onPress={openAddInspectorModal}>
          <Text style={globalStyles.sectionAddIcon}>+</Text>
        </TouchableOpacity>
      </View>
      {inspectors.map(inspector => (
        <View key={inspector.id} style={globalStyles.listItem}>
          <View style={globalStyles.listItemLeft}>
            <Text style={globalStyles.listItemDate}>{inspector.id}</Text>
            <Text style={globalStyles.listItemPrimary}>
              {`${inspector.surname}, ${inspector.firstname} ${inspector.middleinitial}.`}
            </Text>
          </View>
          <TouchableOpacity
            style={globalStyles.redListButton}
            onPress={() => confirmDelete(inspector)}
          >
            <Text style={globalStyles.listButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Modal for Confirming Inspector Deletion */}
      <Modal visible={deleteModalVisible} animationType="none" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContainer}>
            <Text style={globalStyles.modalTitle}>Confirm Deletion</Text>
            {inspectorToDelete && (
              <>
                <Text style={globalStyles.modalText}>
                  Are you sure you want to remove the following user as inspector?
                </Text>
                <View style={globalStyles.listItem}>
                  <View style={globalStyles.listItemLeft}>
                    <Text style={globalStyles.listItemDate}>{inspectorToDelete.id}</Text>
                    <Text style={globalStyles.listItemPrimary}>
                      {`${inspectorToDelete.surname}, ${inspectorToDelete.firstname} ${inspectorToDelete.middleinitial}.`}
                    </Text>
                  </View>
                </View>
              </>
            )}
            <View style={globalStyles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.actionButton, { backgroundColor: '#e74c3c' }]}
                onPress={cancelDelete}
              >
                <Text style={globalStyles.actionButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.actionButton, { backgroundColor: '#3578E5' }]}
                onPress={handleConfirmDelete}
              >
                <Text style={globalStyles.actionButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for Adding Inspector */}
      <Modal visible={addInspectorModalVisible} animationType="none" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={[globalStyles.modalContainer, { flex: 1, }]}>
            <Text style={globalStyles.modalTitle}>Add Inspector</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Search"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <View style={globalStyles.listContainer}>
              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => selectUser(item)}>
                    <View style={globalStyles.listItem}>
                      <View style={globalStyles.listItemLeft}>
                        <Text style={globalStyles.listItemDate}>{item.id}</Text>
                        <Text style={globalStyles.listItemPrimary}>
                          {`${item.surname || ''}, ${item.firstname || ''} ${item.middleinitial || ''}`.trim() || item.username || 'Unnamed User'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
              />
            </View>
            <TouchableOpacity
              style={[globalStyles.actionButton, { backgroundColor: '#e74c3c', justifyContent: 'center' }]}
              onPress={closeAddInspectorModal}
            >
              <Text style={globalStyles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal for Adding Inspector */}
      <Modal visible={confirmationModalVisible} animationType="none" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContainer}>
            <Text style={globalStyles.modalTitle}>Confirm</Text>
            {selectedUser && (
              <>
                <Text style={globalStyles.modalText}>
                  Are you sure you want to assign the inspector role to the following user?
                </Text>
                  <View style={globalStyles.listItem}>
                    <View style={globalStyles.listItemLeft}>
                      <Text style={globalStyles.listItemDate}>{selectedUser.id}</Text>
                      <Text style={globalStyles.listItemPrimary}>
                        {`${selectedUser.surname || ''}, ${selectedUser.firstname || ''} ${selectedUser.middleinitial || ''}`.trim()}
                      </Text>
                    </View>
                  </View>
              </>
            )}
            <View style={globalStyles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.actionButton, { backgroundColor: '#e74c3c' }]}
                onPress={cancelAssignInspector}
              >
                <Text style={globalStyles.actionButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.actionButton, { backgroundColor: '#3578E5' }]}
                onPress={confirmAssignInspector}
              >
                <Text style={globalStyles.actionButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default AdminPanel;