// admin-panel.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import globalStyles from './globalstyles';

const AdminPanel = () => {
  // Initial fare rates (as strings)
  const initialRates = {
    PWD: '10',
    Senior: '12',
    Student: '8',
    Regular: '15',
  };

  // State for fare rates, passenger types, and routes
  const [fareRates, setFareRates] = useState(initialRates);
  const [passengerTypes, setPassengerTypes] = useState(['PWD', 'Senior', 'Student', 'Regular']);
  const [routes, setRoutes] = useState([]);

  // For editing passenger type (both name and fare rate)
  const [editingPassengerType, setEditingPassengerType] = useState(null);
  const [tempPassengerType, setTempPassengerType] = useState('');
  const [tempFareRate, setTempFareRate] = useState('');

  // For editing route
  const [editingRoute, setEditingRoute] = useState(null);
  const [tempRoute, setTempRoute] = useState('');

  // For adding new passenger type
  const [newPassengerModalVisible, setNewPassengerModalVisible] = useState(false);
  const [newPassengerType, setNewPassengerType] = useState('');
  const [newPassengerFare, setNewPassengerFare] = useState('');

  // For adding new route
  const [newRouteModalVisible, setNewRouteModalVisible] = useState(false);
  const [newRoute, setNewRoute] = useState('');

  // --- Passenger Type Editing ---
  const openPassengerEditModal = (type) => {
    setEditingPassengerType(type);
    setTempPassengerType(type);
    setTempFareRate(fareRates[type]);
  };

  const savePassengerEdit = () => {
    // If the passenger type name has changed, update the array and fareRates keys.
    if (tempPassengerType !== editingPassengerType) {
      setPassengerTypes(passengerTypes.map(pt => pt === editingPassengerType ? tempPassengerType : pt));
      const updatedRates = { ...fareRates };
      updatedRates[tempPassengerType] = tempFareRate;
      delete updatedRates[editingPassengerType];
      setFareRates(updatedRates);
    } else {
      setFareRates({ ...fareRates, [editingPassengerType]: tempFareRate });
    }
    setEditingPassengerType(null);
    setTempPassengerType('');
    setTempFareRate('');
  };

  const cancelPassengerEdit = () => {
    setEditingPassengerType(null);
    setTempPassengerType('');
    setTempFareRate('');
  };

  const deletePassengerType = () => {
    if (!editingPassengerType) return;
    setPassengerTypes(passengerTypes.filter(pt => pt !== editingPassengerType));
    const updatedRates = { ...fareRates };
    delete updatedRates[editingPassengerType];
    setFareRates(updatedRates);
    setEditingPassengerType(null);
    setTempPassengerType('');
    setTempFareRate('');
  };

  // --- Route Editing ---
  const openRouteEditModal = (route) => {
    setEditingRoute(route);
    setTempRoute(route);
  };

  const saveRouteEdit = () => {
    setRoutes(routes.map(r => r === editingRoute ? tempRoute : r));
    setEditingRoute(null);
    setTempRoute('');
  };

  const cancelRouteEdit = () => {
    setEditingRoute(null);
    setTempRoute('');
  };

  const deleteRouteEdit = () => {
    setRoutes(routes.filter(r => r !== editingRoute));
    setEditingRoute(null);
    setTempRoute('');
  };

  // --- New Passenger Type ---
  const openNewPassengerModal = () => {
    setNewPassengerModalVisible(true);
    setNewPassengerType('');
    setNewPassengerFare('');
  };

  const saveNewPassengerType = () => {
    if (newPassengerType.trim() === '') return;
    setPassengerTypes([...passengerTypes, newPassengerType]);
    setFareRates({ ...fareRates, [newPassengerType]: newPassengerFare || '0' });
    setNewPassengerModalVisible(false);
    setNewPassengerType('');
    setNewPassengerFare('');
  };

  const cancelNewPassengerModal = () => {
    setNewPassengerModalVisible(false);
    setNewPassengerType('');
    setNewPassengerFare('');
  };

  // --- New Route ---
  const openNewRouteModal = () => {
    setNewRouteModalVisible(true);
    setNewRoute('');
  };

  const saveNewRoute = () => {
    if (newRoute.trim() === '') return;
    setRoutes([...routes, newRoute]);
    setNewRouteModalVisible(false);
    setNewRoute('');
  };

  const cancelNewRouteModal = () => {
    setNewRouteModalVisible(false);
    setNewRoute('');
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
      {passengerTypes.map(type => (
        <View key={type} style={globalStyles.listItem}>
          <View style={styles.leftContainer}>
            <View style={styles.rateContainer}>
              <Text style={styles.rateText}>
                PHP {parseFloat(fareRates[type] || '0').toFixed(2)}
              </Text>
            </View>
            <Text style={[globalStyles.listItemPrimary, { marginLeft: 10 }]}>{type}</Text>
          </View>
          <TouchableOpacity style={globalStyles.blueListButton} onPress={() => openPassengerEditModal(type)}>
            <Text style={globalStyles.listButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Modal for editing Passenger Type */}
      <Modal visible={editingPassengerType !== null} animationType="none" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContainer}>
              <Text style={globalStyles.modalTitle}>Edit Passenger Type</Text>
            <TextInput
              style={styles.modalInput}
              value={tempPassengerType}
              onChangeText={setTempPassengerType}
              placeholder="Passenger Type"
            />
            <TextInput
              style={styles.modalInput}
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
              <Text style={styles.deleteTextLink}>Delete</Text>
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
        <View key={index} style={globalStyles.listItem}>
          <Text style={globalStyles.listItemPrimary}>{route}</Text>
          <TouchableOpacity style={globalStyles.blueListButton} onPress={() => openRouteEditModal(route)}>
            <Text style={globalStyles.listButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Modal for editing Route */}
      <Modal visible={editingRoute !== null} animationType="none" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContainer}>
            <Text style={globalStyles.modalTitle}>Edit Route</Text>
            <TextInput
              style={styles.modalInput}
              value={tempRoute}
              onChangeText={setTempRoute}
              placeholder="Route"
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
              <Text style={styles.deleteTextLink}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for adding a new passenger type */}
      <Modal visible={newPassengerModalVisible} animationType="none" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContainer}>
            <Text style={globalStyles.modalTitle}>Add Passenger Type</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Passenger Type"
              value={newPassengerType}
              onChangeText={setNewPassengerType}
            />
            <TextInput
              style={styles.modalInput}
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

      {/* Modal for adding a new route */}
      <Modal visible={newRouteModalVisible} animationType="none" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContainer}>
            <Text style={globalStyles.modalTitle}>Add Route</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Route"
              value={newRoute}
              onChangeText={setNewRoute}
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

const styles = StyleSheet.create({
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateContainer: {
    backgroundColor: '#D3D3D3',
    borderRadius: 5,
    padding: 10,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 10,
  },
  deleteTextLink: {
    color: '#3578E5',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
});

export default AdminPanel;
