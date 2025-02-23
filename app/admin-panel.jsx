// admin-panel.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import globalStyles from './globalstyles';

const AdminPanel = () => {
  // Initial fare rates (as strings)
  const initialRates = {
    PWD: '10',
    Senior: '12',
    Student: '8',
    Regular: '15',
  };

  const [fareRates, setFareRates] = useState(initialRates);
  // State for which role is being edited (null means no modal open)
  const [editingRole, setEditingRole] = useState(null);
  // Temporary state for the rate being edited
  const [tempRate, setTempRate] = useState('');

  const roles = ['PWD', 'Senior', 'Student', 'Regular'];

  // Open modal for a specific role
  const openModalForRole = (role) => {
    setEditingRole(role);
    setTempRate(fareRates[role]);
  };

  // Save changes from the modal for the specific role
  const saveModalRate = () => {
    setFareRates({ ...fareRates, [editingRole]: tempRate });
    setEditingRole(null);
    setTempRate('');
  };

  const cancelModal = () => {
    setEditingRole(null);
    setTempRate('');
  };

  return (
    <View style={[globalStyles.container, { padding: 20, backgroundColor: '#FFF', alignItems: 'stretch', justifyContent: 'flex-start' }]}>
      <Text style={globalStyles.listTitle}>Fare rates:</Text>
      {roles.map(role => (
        <View key={role} style={globalStyles.listItem}>
          <View style={styles.leftContainer}>
            {/* Fare rate container on the very left */}
            <View style={styles.rateContainer}>
              <Text style={styles.rateText}>{fareRates[role]}</Text>
            </View>
            {/* Role name next to the rate */}
            <Text style={[globalStyles.listItemPrimary, { marginLeft: 10 }]}>{role}</Text>
          </View>
          <TouchableOpacity style={globalStyles.blueListButton} onPress={() => openModalForRole(role)}>
            <Text style={globalStyles.listButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Modal for editing a specific fare rate */}
      <Modal visible={editingRole !== null} animationType="fade" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContainer}>
            <Text style={globalStyles.modalTitle}>{editingRole} Fare Rate</Text>
            <TextInput
              style={styles.modalRateInput}
              value={tempRate}
              onChangeText={setTempRate}
              keyboardType="numeric"
            />
            <View style={globalStyles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.actionButton, { marginTop: 0, backgroundColor: '#e74c3c' }]}
                onPress={cancelModal}
              >
                <Text style={globalStyles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.actionButton, { marginTop: 0, backgroundColor: '#3578E5' }]}
                onPress={saveModalRate}
              >
                <Text style={globalStyles.actionButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateContainer: {
    // Container for the fare rate
    backgroundColor: '#D3D3D3',
    borderRadius: 5,
    padding: 10,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
  },
  modalRateInput: {
    width: '100%',
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 10,
  },
});

export default AdminPanel;
