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
  const [showCountsModal, setShowCountsModal] = useState(false);

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

  // Function to delete a log item directly
  const handleDeleteLog = (id) => {
    setScannedLogs((prevLogs) => prevLogs.filter((log) => log.id !== id));
  };

  const renderLogItem = ({ item }) => (
    <View style={globalStyles.listItem}>
      <View style={globalStyles.listItemLeft}>
        <Text style={globalStyles.listItemDate}>{item.timestamp}</Text>
        <Text style={globalStyles.listItemPrimary}>
          {item.passengerType}{' '}
          <Text style={globalStyles.listItemSecondary}>
            {item.tagId ? `${item.tagId}` : ''}
          </Text>
        </Text>
      </View>
      <View style={globalStyles.listItemRight}>
        <TouchableOpacity
          style={globalStyles.redListButton}
          onPress={() => handleDeleteLog(item.id)}
        >
          <Text style={globalStyles.listButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Compute total money collected (assuming $10 per passenger)
  const totalMoney = scannedLogs.length * 10;

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

      {/* Separator */}
      <View style={globalStyles.separator} />

      {/* Recent Logs Title */}
      <View style={globalStyles.sectionTitleContainer}>
        <Text style={globalStyles.sectionTitle}>Recent logs:</Text>
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
      </View>
      <View style={globalStyles.separator} />

      {/* Summary Container: Total Passengers (clickable), Plus Button, Total Money */}
      <View style={styles.summaryContainer}>
        <TouchableOpacity
          style={styles.summaryItem}
          onPress={() => setShowCountsModal(true)}
        >
          <Text style={styles.summaryLabel}>Total Passengers</Text>
          <Text style={styles.summaryValue}>{scannedLogs.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.plusButtonSummary, !scanning && { backgroundColor: 'grey' }]}
          onPress={handleManualAdd}
          disabled={!scanning}
        >
          <Text style={styles.plusButtonText}>+</Text>
        </TouchableOpacity>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Money</Text>
          <Text style={styles.summaryValue}>${totalMoney}</Text>
        </View>
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
            {passengerTypes.map((type) => (
              <TouchableOpacity key={type} style={globalStyles.button} onPress={() => handlePassengerSelect(type)}>
                <Text style={globalStyles.buttonText}>{type}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={globalStyles.cancelButton} onPress={handleCancel}>
              <Text style={globalStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Passenger Counts Modal */}
      <Modal visible={showCountsModal} animationType="slide" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContainer}>
            <Text style={globalStyles.modalTitle}>Number of Passengers</Text>
            {passengerTypes.map((type) => (
              <View key={type} style={globalStyles.listItem}>
                <View style={styles.leftContainer}>
                  <View style={styles.countContainer}>
                    <Text style={styles.countText}>{passengerCounts[type] || 0}</Text>
                  </View>
                  <Text style={[globalStyles.listItemPrimary, { marginLeft: 10 }]}>{type}</Text>
                </View>
              </View>
            ))}
            <View style={globalStyles.modalButtons}>
              <TouchableOpacity style={globalStyles.button} onPress={() => setShowCountsModal(false)}>
                <Text style={globalStyles.buttonText}>Go back</Text>
              </TouchableOpacity>
            </View>
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
  logsContainer: {
    flex: 1,
    width: '100%',
  },
  logsPlaceholder: {
    color: '#777',
    fontSize: 16,
    alignSelf: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#EAEAEA',
    height: 60,
    borderRadius: 10,
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#333',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  plusButtonSummary: {
    backgroundColor: '#3578E5',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  plusButtonText: {
    color: '#FFF',
    fontSize: 24,
    lineHeight: 24,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countContainer: {
    backgroundColor: '#D3D3D3',
    borderRadius: 5,
    padding: 10,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
  },
});
