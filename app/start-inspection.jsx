// StartInspection.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import globalStyles from './globalstyles';
import useNFC from './UseNFC';

export default function StartInspection() {
  const { driver, plate } = useLocalSearchParams();
  const { scanning, tagData, startScanning, endScanning } = useNFC();

  // Local state for log entries and for showing the passenger modal.
  const [scannedLogs, setScannedLogs] = useState([]);
  const [showPassengerModal, setShowPassengerModal] = useState(false);

  // When a new NFC tag is scanned (with a valid id) and the modal is not already open, open the modal.
  useEffect(() => {
    if (tagData && tagData.id && !showPassengerModal) {
      setShowPassengerModal(true);
    }
  }, [tagData, showPassengerModal]);

  // Handle passenger type selection.
  const handlePassengerSelect = (passengerType) => {
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      passengerType,
      tagId: tagData && tagData.id ? tagData.id : null,
    };
    // Prepend the new log so the newest entry appears at the top.
    setScannedLogs((prevLogs) => [newLog, ...prevLogs]);
    setShowPassengerModal(false);
    // If this log came from a scanned tag, immediately resume scanning.
    if (tagData && tagData.id) {
      startScanning();
    }
  };

  // Manual addition via the plus button (no tag data).
  const handleManualAdd = () => {
    setShowPassengerModal(true);
  };

  // Cancel handler for the modal.
  const handleCancel = () => {
    setShowPassengerModal(false);
    // If the modal was triggered by a scanned tag, resume scanning.
    if (tagData && tagData.id) {
      startScanning();
    }
  };

  // Render function for each log entry.
  const renderLogItem = ({ item }) => (
    <View style={globalStyles.listItem}>
      <View style={globalStyles.listItemLeft}>
        <Text style={globalStyles.listItemDate}>{item.timestamp}</Text>
        <Text style={globalStyles.listItemPrimary}>{item.passengerType}</Text>
      </View>
      <View style={globalStyles.listItemRight}>
        <Text style={globalStyles.listItemSecondary}>
          {item.tagId ? `(Tag: ${item.tagId})` : ''}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[globalStyles.container, { padding: 20 }]}>
      {/* Header: Driver (left) and Plate (right) */}
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>{driver || 'N/A'}</Text>
        <Text style={styles.headerText}>{plate || 'N/A'}</Text>
      </View>

      {/* Logs container */}
      <View style={styles.logsContainer}>
        {scannedLogs.length === 0 ? (
          <Text style={styles.logsPlaceholder}>
            Scanned NFC logs will appear here.
          </Text>
        ) : (
          <FlatList
            data={scannedLogs}
            keyExtractor={(item) => item.id}
            renderItem={renderLogItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
        {/* Plus button for manual addition */}
        <TouchableOpacity style={styles.plusButton} onPress={handleManualAdd}>
          <Text style={styles.plusButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Action Button for starting/ending scanning */}
      {scanning ? (
        <TouchableOpacity
          style={[globalStyles.button, { backgroundColor: 'red' }]}
          onPress={endScanning}
        >
          <Text style={globalStyles.buttonText}>End</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={globalStyles.button} onPress={startScanning}>
          <Text style={globalStyles.buttonText}>Start</Text>
        </TouchableOpacity>
      )}

      {/* Passenger Type Selection Modal */}
      <Modal visible={showPassengerModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.passengerModal}>
            <Text style={styles.modalTitle}>Select Passenger Type</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handlePassengerSelect('PWD')}
            >
              <Text style={styles.modalOptionText}>PWD</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handlePassengerSelect('Senior')}
            >
              <Text style={styles.modalOptionText}>Senior</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handlePassengerSelect('Student')}
            >
              <Text style={styles.modalOptionText}>Student</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handlePassengerSelect('Regular')}
            >
              <Text style={styles.modalOptionText}>Regular</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: '#ccc' }]}
              onPress={handleCancel}
            >
              <Text style={styles.modalOptionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logsContainer: {
    flex: 1,
    width: '100%',
    marginBottom: 20,
    position: 'relative',
  },
  logsPlaceholder: {
    color: '#777',
    fontSize: 16,
    textAlign: 'center',
  },
  plusButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#3578E5',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButtonText: {
    color: '#FFF',
    fontSize: 24,
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerModal: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalOption: {
    backgroundColor: '#3578E5',
    width: '100%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  modalOptionText: {
    color: '#FFF',
    fontSize: 16,
  },
});