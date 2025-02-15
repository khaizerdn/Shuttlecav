import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput } from 'react-native';
import globalStyles from './globalstyles';
import { useRouter } from 'expo-router'; // Make sure to install and configure expo-router

const Inspect = () => {
  const router = useRouter();

  // Sample shuttle data in state
  const [shuttleList, setShuttleList] = useState([
    { id: '1', shuttleDriver: 'Juan Masipag', shuttlePlatNumber: 'ABC123' },
    { id: '2', shuttleDriver: 'Juan Tamad', shuttlePlatNumber: 'ABC123' },
    { id: '3', shuttleDriver: 'Juan Saktolang', shuttlePlatNumber: 'ABC123' },
  ]);

  // Modal state and inputs
  const [modalVisible, setModalVisible] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPlate, setNewPlate] = useState('');

  // Add new shuttle
  const addShuttle = () => {
    if (newFirstName.trim() && newLastName.trim() && newPlate.trim()) {
      const newId = Date.now().toString();
      const fullName = `${newFirstName.trim()} ${newLastName.trim()}`;
      const newShuttle = {
        id: newId,
        shuttleDriver: fullName,
        shuttlePlatNumber: newPlate.trim(),
      };
      setShuttleList([...shuttleList, newShuttle]);
      // Reset and close modal
      setNewFirstName('');
      setNewLastName('');
      setNewPlate('');
      setModalVisible(false);
    }
  };

  // Delete a shuttle
  const handleDelete = (id) => {
    setShuttleList(shuttleList.filter((item) => item.id !== id));
  };

  return (
    <View style={globalStyles.container}>
      {/* "Select Shuttle" header row */}
      <View style={styles.selectShuttleContainer}>
        <Text style={styles.selectShuttleText}>Select shuttle</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.addIcon}>+</Text>
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
            // When a user taps on a list item, navigate to the Confirm screen
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/start-inspection',
                  params: {
                    driver: item.shuttleDriver,
                    plate: item.shuttlePlatNumber,
                  },
                })
              }
            >
              <View style={globalStyles.listItem}>
                <View style={globalStyles.listItemLeft}>
                  <Text style={globalStyles.listItemDate}>{item.shuttleDriver}</Text>
                  <Text style={globalStyles.listItemPrimary}>{item.shuttlePlatNumber}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Modal Popup for Adding a Shuttle */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Shuttle</Text>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={newFirstName}
              onChangeText={setNewFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={newLastName}
              onChangeText={setNewLastName}
            />
            <TextInput
              style={styles.input}
              placeholder="Plate Number"
              value={newPlate}
              onChangeText={setNewPlate}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addShuttle} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = {
  /* Header row styles */
  selectShuttleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  selectShuttleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addIcon: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  /* Delete button styles */
  deleteButton: {
    padding: 10,
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#3578E5',
  },
};

export default Inspect;
