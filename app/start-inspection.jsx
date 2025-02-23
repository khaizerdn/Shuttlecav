// StartInspection.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import globalStyles from './globalstyles';
import useNFC from './UseNFC';
import NfcDisabledModal from './NfcDisabledModal';

export default function StartInspection() {
  const { driver, plate, route } = useLocalSearchParams();
  const { scanning, tagData, startScanning, endScanning, checkNfcEnabled, enableNFC } = useNFC();

  const [scannedLogs, setScannedLogs] = useState([]);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [showNfcDisabledModal, setShowNfcDisabledModal] = useState(false);

  // Always show these passenger types
  const passengerTypes = ['PWD', 'Senior', 'Student', 'Regular'];

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

  const handleStartInspection = async () => {
    const isNfcEnabled = await checkNfcEnabled();
    if (isNfcEnabled) {
      startScanning();
    } else {
      setShowNfcDisabledModal(true);
    }
  };

  const handleEnableNFC = async () => {
    await enableNFC();
    setShowNfcDisabledModal(false);
    const isNfcEnabled = await checkNfcEnabled();
    if (isNfcEnabled) {
      startScanning();
    }
  };

  const handleCancelEnableNFC = () => {
    setShowNfcDisabledModal(false);
  };

  // Compute counts for each passenger type from scannedLogs
  const passengerCounts = scannedLogs.reduce((acc, log) => {
    const type = log.passengerType;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

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
    <View style={[globalStyles.container, { padding: 20, backgroundColor: '#FFF' }]}>
      {/* Shuttle Info Header */}
      <View style={globalStyles.listItem}>
        <View style={globalStyles.listItemLeft}>
          <Text style={globalStyles.listItemDate}>{route || 'N/A'}</Text>
          <Text style={globalStyles.listItemPrimary}>
            {driver ? driver : 'N/A'} - {plate ? plate : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Separator as a dedicated line */}
      <View style={globalStyles.separator} />

      {/* Recent Logs Title */}
      <View style={globalStyles.sectionTitleContainer}>
        <Text style={globalStyles.sectionTitle}>Recent logs:</Text>
      </View>

      {/* Passenger Counts Row */}
      <View style={styles.passengerCountsRow}>
        {passengerTypes.map((type) => (
          <View key={type} style={styles.passengerCountContainer}>
            <Text style={styles.passengerCountType}>{type}</Text>
            <Text style={styles.passengerCountValue}>{passengerCounts[type] || 0}</Text>
          </View>
        ))}
        <View style={[styles.passengerCountContainer, styles.totalContainer]}>
          <Text style={[styles.passengerCountType, styles.totalText]}>Total</Text>
          <Text style={[styles.passengerCountValue, styles.totalText]}>{scannedLogs.length}</Text>
        </View>
      </View>

      {/* Logs */}
      <View style={styles.logsContainer}>
        {scannedLogs.length === 0 ? (
          <Text style={styles.logsPlaceholder}>Scanned NFC logs will appear here.</Text>
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
        <TouchableOpacity style={globalStyles.button} onPress={handleStartInspection}>
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

      {/* NFC Disabled Modal */}
      <NfcDisabledModal 
        visible={showNfcDisabledModal} 
        onEnable={handleEnableNFC} 
        onCancel={handleCancelEnableNFC} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  passengerCountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  passengerCountContainer: {
    flex: 1,
    backgroundColor: '#EAEAEA',
    paddingVertical: 5,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 5,
  },
  passengerCountType: {
    fontSize: 12,
    color: '#333',
  },
  passengerCountValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  totalContainer: {
    // Additional styling for the Total container if needed.
  },
  totalText: {
    color: '#3578E5',
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
