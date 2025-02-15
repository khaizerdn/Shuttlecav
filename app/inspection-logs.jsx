import React, { useState } from 'react';
import { View, TextInput, FlatList, Text } from 'react-native';
import globalStyles from './globalstyles';

const InspectionLogs = () => {
  const [searchText, setSearchText] = useState('');

  const inspectionLogs = [
    { id: '1', date: 'January 20, 2025', insPlateNumber: 'ABC-1234', insTotalAmount: '100.00' },
    { id: '2', date: 'January 19, 2025', insPlateNumber: 'DEF-5678', insTotalAmount: '150.00' },
    { id: '3', date: 'January 18, 2025', insPlateNumber: 'GHI-9012', insTotalAmount: '120.00' },
    { id: '4', date: 'January 17, 2025', insPlateNumber: 'JKL-3456', insTotalAmount: '130.00' },
    { id: '5', date: 'January 16, 2025', insPlateNumber: 'MNO-7890', insTotalAmount: '140.00' },
    { id: '6', date: 'January 15, 2025', insPlateNumber: 'PQR-2345', insTotalAmount: '110.00' },
    { id: '7', date: 'January 14, 2025', insPlateNumber: 'STU-6789', insTotalAmount: '160.00' },
    { id: '8', date: 'January 13, 2025', insPlateNumber: 'VWX-0123', insTotalAmount: '115.00' },
    { id: '9', date: 'January 12, 2025', insPlateNumber: 'YZA-4567', insTotalAmount: '125.00' },
    { id: '10', date: 'January 11, 2025', insPlateNumber: 'BCD-8910', insTotalAmount: '135.00' },
  ];

  // Filter inspection logs based on search text
  const filteredLogs = inspectionLogs.filter((item) => {
    const lowerSearch = searchText.toLowerCase();
    return (
      item.date.toLowerCase().includes(lowerSearch) ||
      item.insPlateNumber.toLowerCase().includes(lowerSearch) ||
      item.insTotalAmount.toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <View style={globalStyles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Inspection Logs List */}
      <View style={styles.historyContainer}>
        <FlatList
          data={filteredLogs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <View style={styles.leftColumn}>
                <Text style={styles.historyDate}>{item.date}</Text>
                <Text style={styles.historyRoute}>{item.insPlateNumber}</Text>
              </View>
              <View style={styles.rightColumn}>
                <Text style={styles.historyAmount}>{item.insTotalAmount}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = {
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
  historyContainer: {
    flex: 1,
    width: '100%',
  },
  historyItem: {
    width: '100%',
    backgroundColor: '#EAEAEA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  historyDate: {
    fontSize: 14,
    color: '#777',
  },
  // This now displays the insPlateNumber.
  historyRoute: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // This displays the insTotalAmount.
  historyAmount: {
    fontSize: 16,
    color: '#e74c3c',
  },
};

export default InspectionLogs;
