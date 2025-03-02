import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from './globalstyles';
import useNFC from './UseNFC';
import NfcDisabledModal from './NfcDisabledModal';
import { config } from './config';

// Helper to format dates as MySQL datetime strings in UTC+8: "YYYY-MM-DD HH:MM:SS"
const getMySQLDatetime = (date = new Date()) => {
  const utc8Date = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return utc8Date.toISOString().slice(0, 19).replace('T', ' ');
};

const formatDatetime = (datetimeStr) => {
  if (!datetimeStr) return 'N/A';
  const date = new Date(datetimeStr.replace(' ', 'T'));
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  const datePart = new Intl.DateTimeFormat('en-US', options).format(date);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minutesFormatted = minutes < 10 ? '0' + minutes : minutes;
  return `${datePart} at ${hours}:${minutesFormatted}${ampm}`;
};

export default function StartInspection() {
  // Extract parameters from URL (driver, plate, origin, destination, added_rate)
  const { driver, plate, origin, destination, added_rate } = useLocalSearchParams();
  const { scanning, tagData, startScanning, endScanning, checkNfcEnabled, enableNFC } = useNFC();

  // Generate unique keys for this shuttle's inspection state
  const inspectionKey = plate ? `inspectionStartTime_${plate}` : 'inspectionStartTime';
  const logsKey = plate ? `scannedLogs_${plate}` : 'scannedLogs';

  // State variables for inspection, logs, modals, and manual add flag
  const [startTime, setStartTime] = useState(null);
  const [scannedLogs, setScannedLogs] = useState([]);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [showNfcDisabledModal, setShowNfcDisabledModal] = useState(false);
  const [showCountsModal, setShowCountsModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [dbPassengerTypes, setDbPassengerTypes] = useState([]);
  const [manualAdd, setManualAdd] = useState(false);

  // New states for inspector info and inspection overview receipt modal
  const [inspectorName, setInspectorName] = useState('N/A');
  const [inspectionOverview, setInspectionOverview] = useState(null);
  const [showInspectionOverviewModal, setShowInspectionOverviewModal] = useState(false);

  // Fetch logged in user info (inspector) from the /user endpoint using the JWT token.
  useEffect(() => {
    async function fetchUser() {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${config.API_URL}/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          const fullName = `${data.firstname} ${data.surname}`;
          setInspectorName(fullName);
        } else {
          console.error('Error fetching user info');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    }
    fetchUser();
  }, []);

  // Restore inspection state for this shuttle when the component mounts.
  useEffect(() => {
    async function restoreInspection() {
      const storedStartTime = await AsyncStorage.getItem(inspectionKey);
      const storedLogs = await AsyncStorage.getItem(logsKey);
      if (storedStartTime) {
        setStartTime(storedStartTime);
        if (storedLogs) {
          setScannedLogs(JSON.parse(storedLogs));
        }
        // Resume NFC scanning if an inspection is in progress.
        startScanning();
      }
    }
    restoreInspection();
  }, [inspectionKey, logsKey]);

  // Persist scannedLogs to AsyncStorage when they change.
  useEffect(() => {
    if (startTime) {
      AsyncStorage.setItem(logsKey, JSON.stringify(scannedLogs));
    }
  }, [scannedLogs, startTime, logsKey]);

  // Fetch passenger types from the backend.
  useEffect(() => {
    fetchPassengerTypes();
  }, []);

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
    if (tagData && tagData.id && !showPassengerModal && !manualAdd) {
      setShowPassengerModal(true);
    }
  }, [tagData, showPassengerModal, manualAdd]);

  // Handle selection of a passenger type.
  const handlePassengerSelect = async (passengerType) => {
    const typeInfo = dbPassengerTypes.find(item => item.passenger_type === passengerType);
    const passengerRate = typeInfo ? parseFloat(typeInfo.passenger_rate) : 0;
    const routeAddedRate = added_rate ? parseFloat(added_rate) : 0;
    const currentFare = passengerRate + routeAddedRate;

    if (manualAdd) {
      const newLog = {
        id: Date.now().toString(),
        timestamp: getMySQLDatetime(),
        passengerType,
        tagId: null,
      };
      setScannedLogs(prevLogs => [newLog, ...prevLogs]);
      setShowPassengerModal(false);
      setManualAdd(false);
      return;
    }

    const accumulatedFare = scannedLogs
      .filter(log => log.tagId === tagData.id)
      .reduce((acc, log) => {
        const logTypeInfo = dbPassengerTypes.find(item => item.passenger_type === log.passengerType);
        const logPassengerRate = logTypeInfo ? parseFloat(logTypeInfo.passenger_rate) : 0;
        return acc + (logPassengerRate + routeAddedRate);
      }, 0);

    const totalFareForThisCard = currentFare + accumulatedFare;

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${config.API_URL}/check-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tagId: tagData.id, fare: totalFareForThisCard }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Balance Issue', errorData.message || 'Insufficient balance on this card');
        return;
      }
    } catch (error) {
      console.error('Error checking balance:', error);
      Alert.alert('Error', 'Error checking balance.');
      return;
    }

    const newLog = {
      id: Date.now().toString(),
      timestamp: getMySQLDatetime(),
      passengerType,
      tagId: tagData && tagData.id ? tagData.id : null,
    };
    setScannedLogs(prevLogs => [newLog, ...prevLogs]);
    setShowPassengerModal(false);
    if (tagData && tagData.id) {
      startScanning();
    }
  };

  const handleManualAdd = () => {
    setManualAdd(true);
    setShowPassengerModal(true);
  };

  const handleCancelPassengerModal = () => {
    setShowPassengerModal(false);
    setManualAdd(false);
    if (tagData && tagData.id) {
      startScanning();
    }
  };

  // Start inspection: record the start time and begin NFC scanning.
  const handleStartInspection = async () => {
    const isNfcEnabled = await checkNfcEnabled();
    if (isNfcEnabled) {
      startScanning();
      const currentStartTime = getMySQLDatetime();
      setStartTime(currentStartTime);
      await AsyncStorage.setItem(inspectionKey, currentStartTime);
    } else {
      setShowNfcDisabledModal(true);
    }
  };

  // End inspection: stop scanning, post inspection data, and show the receipt-style overview modal.
  const handleEndInspection = async () => {
    endScanning();
    const endTime = getMySQLDatetime();
    const storedStartTime = startTime || (await AsyncStorage.getItem(inspectionKey));

    // Compute totals and passenger counts.
    const routeAddedRate = added_rate ? parseFloat(added_rate) : 0;
    const passengerCounts = scannedLogs.reduce((acc, log) => {
      acc[log.passengerType] = (acc[log.passengerType] || 0) + 1;
      return acc;
    }, {});

    // Build inspection data payload.
    const inspectionData = {
      driver: driver || '',
      plate: plate || '', // Log the plate number here in inspections table.
      route: {
        origin: origin || '',
        destination: destination || '',
        added_rate: routeAddedRate,
      },
      start_datetime: storedStartTime,
      end_datetime: endTime,
      total_passengers: scannedLogs.length,
      total_claimed_money: scannedLogs.reduce((acc, log) => {
        const typeInfo = dbPassengerTypes.find(item => item.passenger_type === log.passengerType);
        const passengerRate = typeInfo ? parseFloat(typeInfo.passenger_rate) : 0;
        return acc + (passengerRate + routeAddedRate);
      }, 0),
      logs: scannedLogs.map(log => {
        const typeInfo = dbPassengerTypes.find(item => item.passenger_type === log.passengerType);
        const passengerRate = typeInfo ? parseFloat(typeInfo.passenger_rate) : 0;
        const fare = passengerRate + routeAddedRate;
        return {
          id: log.id,
          passenger_type: log.passengerType,
          tag_id: log.tagId,
          scanned_datetime: log.timestamp,
          fare: fare,
          plate: plate || '', // Log the plate number in each inspection_log.
        };
      }),
      passengerCounts: passengerCounts,
    };

    // Add extra overview data with the receipt theme.
    const currentFareRates = dbPassengerTypes.map(item => ({
      passenger_type: item.passenger_type,
      current_fare_rate: parseFloat(item.passenger_rate) + routeAddedRate,
    }));
    // The inspector name comes from the /user endpoint.
    inspectionData.inspector = inspectorName;
    inspectionData.currentFareRates = currentFareRates;

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
        const resData = await response.json();
        // Expect the backend to return the generated inspectionId.
        inspectionData.inspectionId = resData.inspectionId;
        setInspectionOverview(inspectionData);
        setShowInspectionOverviewModal(true);
        // Clear stored state.
        await AsyncStorage.removeItem(inspectionKey);
        await AsyncStorage.removeItem(logsKey);
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

  // Cancel inspection: stop scanning and clear stored state.
  const handleCancelInspection = async () => {
    endScanning();
    setStartTime(null);
    setScannedLogs([]);
    await AsyncStorage.removeItem(inspectionKey);
    await AsyncStorage.removeItem(logsKey);
    console.log('Inspection canceled');
  };

  // Compute totals for display.
  const routeAddedRate = added_rate ? parseFloat(added_rate) : 0;
  const totalMoney = scannedLogs.reduce((acc, log) => {
    const typeInfo = dbPassengerTypes.find(item => item.passenger_type === log.passengerType);
    const passengerRate = typeInfo ? parseFloat(typeInfo.passenger_rate) : 0;
    return acc + (passengerRate + routeAddedRate);
  }, 0);

  const passengerCounts = scannedLogs.reduce((acc, log) => {
    acc[log.passengerType] = (acc[log.passengerType] || 0) + 1;
    return acc;
  }, {});

  const scannedPassengerTypes = dbPassengerTypes.filter(
    item => (passengerCounts[item.passenger_type] || 0) > 0
  );

  const handleDeleteLog = id => {
    setScannedLogs(prevLogs => prevLogs.filter(log => log.id !== id));
  };

  const renderLogItem = ({ item }) => {
    const typeInfo = dbPassengerTypes.find(it => it.passenger_type === item.passengerType);
    const passengerRate = typeInfo ? parseFloat(typeInfo.passenger_rate) : 0;
    const fare = passengerRate + routeAddedRate;
    return (
      <View style={globalStyles.listItem}>
        <View style={[globalStyles.listLeftBox, { marginRight: 10 }]}>
          <Text style={[globalStyles.listLeftBoxSecondaryText, { color: '#3578E5' }]}>PHP</Text>
          <Text style={[globalStyles.listLeftBoxPrimaryText, { color: '#3578E5' }]}>
            +{fare.toFixed(2)}
          </Text>
        </View>
        <View style={globalStyles.listItemLeft}>
          <Text style={globalStyles.listItemDate}>{formatDatetime(item.timestamp)}</Text>
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
            keyExtractor={item => item.id}
            renderItem={renderLogItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <View style={globalStyles.separator} />

      {/* Summary Container */}
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

      {/* Start/End/Cancel Buttons */}
      {scanning ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity
            style={[globalStyles.button, { backgroundColor: '#e74c3c', flex: 1, marginRight: 5 }]}
            onPress={() => setShowCancelModal(true)}
          >
            <Text style={globalStyles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.button, { backgroundColor: '#3578E5', flex: 1, marginLeft: 5 }]}
            onPress={() => setShowEndModal(true)}
          >
            <Text style={globalStyles.buttonText}>End</Text>
          </TouchableOpacity>
        </View>
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
              dbPassengerTypes.map(item => (
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
            <TouchableOpacity style={globalStyles.cancelButton} onPress={handleCancelPassengerModal}>
              <Text style={globalStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Passenger Counts Modal */}
      <Modal visible={showCountsModal} animationType="none" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContainer}>
            <Text style={globalStyles.modalTitle}>Number of Passengers</Text>
            {scannedPassengerTypes.length > 0 ? (
              scannedPassengerTypes.map(item => (
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

      {/* End Confirmation Modal */}
      <Modal visible={showEndModal} animationType="none" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContainer}>
            <Text style={globalStyles.modalTitle}>Confirm End Inspection</Text>
            <Text style={globalStyles.modalText}>
              Are you sure you want to end the inspection?
            </Text>
            <View style={globalStyles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.actionButton, { backgroundColor: '#e74c3c' }]}
                onPress={() => setShowEndModal(false)}
              >
                <Text style={globalStyles.actionButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.actionButton, { backgroundColor: '#3578E5' }]}
                onPress={() => {
                  setShowEndModal(false);
                  handleEndInspection();
                }}
              >
                <Text style={globalStyles.actionButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal visible={showCancelModal} animationType="none" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContainer}>
            <Text style={globalStyles.modalTitle}>Confirm Cancel Inspection</Text>
            <Text style={globalStyles.modalText}>
              Are you sure you want to cancel the inspection?
            </Text>
            <View style={globalStyles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.actionButton, { backgroundColor: '#e74c3c' }]}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={globalStyles.actionButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.actionButton, { backgroundColor: '#3578E5' }]}
                onPress={() => {
                  setShowCancelModal(false);
                  handleCancelInspection();
                }}
              >
                <Text style={globalStyles.actionButtonText}>Yes</Text>
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

      {/* Inspection Overview (Receipt) Modal */}
      <Modal visible={showInspectionOverviewModal} animationType="slide" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={styles.receiptWrapper}>
            <View style={[globalStyles.modalContainer, styles.receiptContainer]}>
              <Text style={styles.receiptTitle}>Inspection Receipt</Text>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Inspection ID:</Text>
                <Text style={styles.receiptValue}>{inspectionOverview?.inspectionId || 'N/A'}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Inspector:</Text>
                <Text style={styles.receiptValue}>{inspectionOverview?.inspector}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Driver:</Text>
                <Text style={styles.receiptValue}>{driver || 'N/A'}</Text>
              </View>
              {/* New row to display the plate number */}
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Plate Number:</Text>
                <Text style={styles.receiptValue}>{inspectionOverview?.plate || 'N/A'}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Route:</Text>
                <Text style={styles.receiptValue}>
                  {inspectionOverview?.route.origin} to {inspectionOverview?.route.destination}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Added Rate:</Text>
                <Text style={styles.receiptValue}>PHP {inspectionOverview?.route.added_rate.toFixed(2)}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Total Passengers:</Text>
                <Text style={styles.receiptValue}>{inspectionOverview?.total_passengers}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Total Money:</Text>
                <Text style={styles.receiptValue}>PHP {inspectionOverview?.total_claimed_money.toFixed(2)}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>End Date:</Text>
                <Text style={styles.receiptValue}>{formatDatetime(inspectionOverview?.end_datetime)}</Text>
              </View>
              <View style={styles.receiptDivider} />
              <Text style={styles.receiptSubtitle}>Passenger Breakdown</Text>
              {inspectionOverview?.passengerCounts &&
                Object.keys(inspectionOverview.passengerCounts).map((type, index) => (
                  <View style={styles.receiptRow} key={index}>
                    <Text style={styles.receiptLabel}>{type}:</Text>
                    <Text style={styles.receiptValue}>{inspectionOverview.passengerCounts[type]}</Text>
                  </View>
                ))}
              <View style={styles.receiptDivider} />
              <Text style={styles.receiptSubtitle}>Fare Rates</Text>
              {inspectionOverview?.currentFareRates.map((fareInfo, index) => (
                <View style={styles.receiptRow} key={index}>
                  <Text style={styles.receiptLabel}>{fareInfo.passenger_type}:</Text>
                  <Text style={styles.receiptValue}>PHP {fareInfo.current_fare_rate.toFixed(2)}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={[globalStyles.button, styles.outsideButton]} onPress={() => setShowInspectionOverviewModal(false)}>
              <Text style={globalStyles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#F2F2F2',
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
  // Wrapper to contain the receipt container and the outside button.
  receiptWrapper: {
    width: '90%',
    alignSelf: 'center',
    alignItems: 'stretch',
  },
  // Receipt container with border and padding.
  receiptContainer: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '100%',
  },
  // Button placed outside the bordered container.
  outsideButton: {
    marginTop: 10,
    alignSelf: 'center',
    width: '100%',
  },
  // Receipt title centered at the top.
  receiptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  // Each row is a two-column layout.
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  // Fixed width for labels to ensure vertical alignment.
  receiptLabel: {
    fontSize: 16,
    color: '#555',
    textAlign: 'left',
    width: 130,
  },
  // The value occupies the remaining space and is right aligned.
  receiptValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
    flex: 1,
  },
  receiptDivider: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  receiptSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  searchContainer: {
    width: '100%',
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
});