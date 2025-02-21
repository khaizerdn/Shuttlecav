import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import globalStyles from './globalstyles';
import useNFC from './UseNFC';

export default function StartInspection() {
  const { driver, plate } = useLocalSearchParams();
  const { scanning, tagData, startScanning, endScanning } = useNFC();

  const [scannedLogs, setScannedLogs] = useState([]);
  const [showPassengerModal, setShowPassengerModal] = useState(false);

  useEffect(() => {
    if (tagData && tagData.id && !showPassengerModal) {
      setShowPassengerModal(true);
    }
  }, [tagData, showPassengerModal]);

  const handlePassengerSelect = (passengerType) => {
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      passengerType,
      tagId: tagData && tagData.id ? tagData.id : null,
    };
    setScannedLogs((prevLogs) => [newLog, ...prevLogs]);
    setShowPassengerModal(false);
    if (tagData && tagData.id) {
      startScanning();
    }
  };

  const handleManualAdd = () => {
    setShowPassengerModal(true);
  };

  const handleCancel = () => {
    setShowPassengerModal(false);
    if (tagData && tagData.id) {
      startScanning();
    }
  };

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
      {/* Header: Driver and Plate */}
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>{driver || 'N/A'}</Text>
        <Text style={styles.headerText}>{plate || 'N/A'}</Text>
      </View>

      {/* Logs */}
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
        <TouchableOpacity style={styles.plusButton} onPress={handleManualAdd}>
          <Text style={styles.plusButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Start/End Button */}
      {scanning ? (
        <TouchableOpacity
          style={[globalStyles.button, { backgroundColor: '#e74c3c' }]}
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
      <Modal visible={showPassengerModal} animationType="none" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContainer}>
            <Text style={globalStyles.modalTitle}>Select Passenger Type</Text>
            <TouchableOpacity style={globalStyles.button} onPress={() => handlePassengerSelect('PWD')}>
              <Text style={globalStyles.buttonText}>PWD</Text>
            </TouchableOpacity>
            <TouchableOpacity style={globalStyles.button} onPress={() => handlePassengerSelect('Senior')}>
              <Text style={globalStyles.buttonText}>Senior</Text>
            </TouchableOpacity>
            <TouchableOpacity style={globalStyles.button} onPress={() => handlePassengerSelect('Student')}>
              <Text style={globalStyles.buttonText}>Student</Text>
            </TouchableOpacity>
            <TouchableOpacity style={globalStyles.button} onPress={() => handlePassengerSelect('Regular')}>
              <Text style={globalStyles.buttonText}>Regular</Text>
            </TouchableOpacity>
            <TouchableOpacity style={globalStyles.cancelButton} onPress={handleCancel}>
              <Text style={globalStyles.cancelButtonText}>Cancel</Text>
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
});