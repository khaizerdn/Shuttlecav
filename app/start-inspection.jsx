import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from './globalstyles';
import useNFC from './UseNFC';
import NfcDisabledModal from './NfcDisabledModal';
import { config } from './config';

// Helper to format dates as MySQL datetime strings: YYYY-MM-DD HH:MM:SS
const getMySQLDatetime = (date = new Date()) =>
  date.toISOString().slice(0, 19).replace('T', ' ');

export default function StartInspection() {
  // Extract parameters from URL (including driver's name now provided as "driver")
  const { driver, plate, origin, destination, added_rate } = useLocalSearchParams();
  const { scanning, tagData, startScanning, endScanning, checkNfcEnabled, enableNFC } = useNFC();

  // States for start time, logs, modals, and passenger types
  const [startTime, setStartTime] = useState(null);
  const [scannedLogs, setScannedLogs] = useState([]);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [showNfcDisabledModal, setShowNfcDisabledModal] = useState(false);
  const [showCountsModal, setShowCountsModal] = useState(false);
  const [dbPassengerTypes, setDbPassengerTypes] = useState([]);

  useEffect(() => {
    fetchPassengerTypes();
  }, []);

  // Fetch passenger types from the backend
  const fetchPassengerTypes = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${config.API_URL}/passenger-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDbPassengerTypes(data);
      } else {
        const error = await response.json();
        console.error('Error fetching passenger types:', error.message);
      }
    } catch (error) {
      console.error('Error fetching passenger types:', error);
    }
  };

  // Open passenger modal when NFC tag data is detected.
  useEffect(() => {
    if (tagData && tagData.id && !showPassengerModal) {
      setShowPassengerModal(true);
    }
  }, [tagData, showPassengerModal]);

  // When a passenger is selected, create a log with a correctly formatted timestamp.
  const handlePassengerSelect = (passengerType) => {
    const newLog = {
      id: Date.now().toString(),
      // Format the current date as MySQL datetime string
      timestamp: getMySQLDatetime(),
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

  // When starting the inspection, record a properly formatted start time and start NFC scanning.
  const handleStartInspection = async () => {
    const isNfcEnabled = await checkNfcEnabled();
    if (isNfcEnabled) {
      startScanning();
      const currentStartTime = getMySQLDatetime();
      setStartTime(currentStartTime);
      await AsyncStorage.setItem('inspectionStartTime', currentStartTime);
    } else {
      setShowNfcDisabledModal(true);
    }
  };

  // When ending the inspection, record end time, assemble the inspection data, and post it to the backend.
  const handleEndInspection = async () => {
    endScanning();
    const endTime = getMySQLDatetime();
    const storedStartTime = startTime || await AsyncStorage.getItem('inspectionStartTime');

    const inspectionData = {
      driver: driver || '',
      route: {
        origin: origin || '',
        destination: destination || '',
        added_rate: routeAddedRate,
      },
      start_datetime: storedStartTime,
      end_datetime: endTime,
      total_passengers: scannedLogs.length,
      total_claimed_money: totalMoney,
      logs: scannedLogs.map(log => {
        const typeInfo = dbPassengerTypes.find(item => item.passenger_type === log.passengerType);
        const passengerRate = typeInfo ? parseFloat(typeInfo.passenger_rate) : 0;
        const fare = passengerRate + routeAddedRate;
        return {
          id: log.id,
          passenger_type: log.passengerType,
          tag_id: log.tagId,
          scanned_datetime: log.timestamp,
          fare: fare
        };
      })
    };

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${config.API_URL}/inspections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(inspectionData),
      });
      if (response.ok) {
        await AsyncStorage.removeItem('inspectionStartTime');
        // Optionally reset state or navigate away after a successful record.
        setStartTime(null);
        setScannedLogs([]);
        console.log('Inspection recorded successfully');
      } else {
        const errorData = await response.json();
        console.error('Error recording inspection:', errorData.message);
      }
    } catch (error) {
      console.error('Error in handleEndInspection:', error);
    }
  };

  // Compute values for the UI based on scanned logs and added route rate.
  const routeAddedRate = added_rate ? parseFloat(added_rate) : 0;
  const totalMoney = scannedLogs.reduce((acc, log) => {
    const typeInfo = dbPassengerTypes.find(item => item.passenger_type === log.passengerType);
    const passengerRate = typeInfo ? parseFloat(typeInfo.passenger_rate) : 0;
    return acc + (passengerRate + routeAddedRate);
  }, 0);

  const passengerCounts = scannedLogs.reduce((acc, log) => {
    const type = log.passengerType;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const scannedPassengerTypes = dbPassengerTypes.filter(
    (item) => (passengerCounts[item.passenger_type] || 0) > 0
  );

  const handleDeleteLog = (id) => {
    setScannedLogs((prevLogs) => prevLogs.filter((log) => log.id !== id));
  };

  const renderLogItem = ({ item }) => {
    const typeInfo = dbPassengerTypes.find(it => it.passenger_type === item.passengerType);
    const passengerRate = typeInfo ? parseFloat(typeInfo.passenger_rate) : 0;
    const fare = passengerRate + routeAddedRate;

    return (
      <View style={globalStyles.listItem}>
        <View style={[globalStyles.listLeftBox, { marginRight: 10 }]}>
          <Text style={globalStyles.listLeftBoxSecondaryText}>PHP</Text>
          <Text style={globalStyles.listLeftBoxPrimaryText}>
            {fare.toFixed(2)}
          </Text>
        </View>
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
  };

  return (
    <View style={[globalStyles.container, { padding: 20, backgroundColor: '#FFF' }]}>
      {/* Shuttle Info Header */}
      <View style={globalStyles.listItem}>
        <View style={[globalStyles.listItemLeftRow, { flex: 1, flexDirection: 'row', alignItems: 'center' }]}>
          <View style={globalStyles.listLeftBox}>
            <Text style={globalStyles.listLeftBoxSecondaryText}>PHP</Text>
            <Text style={globalStyles.listLeftBoxPrimaryText}>
              {added_rate ? parseFloat(added_rate).toFixed(2) : '0.00'}
            </Text>
          </View>
          <View style={[globalStyles.listlocationContainer, { flex: 1, marginLeft: 10 }]}>
            <Text style={globalStyles.listItemDate}>
              {origin && destination ? `${origin} to ${destination}` : 'N/A'}
            </Text>
            <Text style={globalStyles.listItemPrimary}>
              {driver || 'N/A'}
            </Text>
            <Text style={globalStyles.listItemPrimary}>
              {plate || 'N/A'}
            </Text>
          </View>
        </View>
      </View>

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

      {/* Summary Container: Total Passengers, Plus Button, Total Money */}
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
          <Text style={styles.summaryValue}>PHP {totalMoney.toFixed(2)}</Text>
        </View>
      </View>

      {/* Start/End Button */}
      {scanning ? (
        <TouchableOpacity
          style={[globalStyles.button, { backgroundColor: '#e74c3c' }]}
          onPress={handleEndInspection}
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
            {dbPassengerTypes.length > 0 ? (
              dbPassengerTypes.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={globalStyles.button}
                  onPress={() => handlePassengerSelect(item.passenger_type)}
                >
                  <Text style={globalStyles.buttonText}>{item.passenger_type}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.logsPlaceholder}>No passenger types available.</Text>
            )}
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
            {scannedPassengerTypes.length > 0 ? (
              scannedPassengerTypes.map((item) => (
                <View key={item.id} style={globalStyles.listItem}>
                  <View style={styles.leftContainer}>
                    <View style={styles.countContainer}>
                      <Text style={styles.countText}>
                        {passengerCounts[item.passenger_type]}
                      </Text>
                    </View>
                    <Text style={[globalStyles.listItemPrimary, { marginLeft: 10 }]}>
                      {item.passenger_type}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.logsPlaceholder}>No passengers scanned.</Text>
            )}
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
        onEnable={async () => {
          await enableNFC();
          setShowNfcDisabledModal(false);
          const isNfcEnabled = await checkNfcEnabled();
          if (isNfcEnabled) startScanning();
        }}
        onCancel={() => setShowNfcDisabledModal(false)}
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
