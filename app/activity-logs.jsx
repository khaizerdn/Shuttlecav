import React, { useState } from 'react';
import { View, TextInput, FlatList, Text } from 'react-native';
import globalStyles from './globalstyles';

const ActivityLogs = () => {
  const [searchText, setSearchText] = useState('');

  const activityLogs = [
    { id: '1', date: 'January 20, 2025', actPlateNumber: 'ABC-1234', totalClaimed: '50.00' },
    { id: '2', date: 'January 19, 2025', actPlateNumber: 'DEF-5678', totalClaimed: '75.00' },
    { id: '3', date: 'January 18, 2025', actPlateNumber: 'GHI-9012', totalClaimed: '100.00' },
    { id: '4', date: 'January 17, 2025', actPlateNumber: 'JKL-3456', totalClaimed: '60.00' },
    { id: '5', date: 'January 16, 2025', actPlateNumber: 'MNO-7890', totalClaimed: '80.00' },
    { id: '6', date: 'January 15, 2025', actPlateNumber: 'PQR-2345', totalClaimed: '55.00' },
    { id: '7', date: 'January 14, 2025', actPlateNumber: 'STU-6789', totalClaimed: '90.00' },
    { id: '8', date: 'January 13, 2025', actPlateNumber: 'VWX-0123', totalClaimed: '70.00' },
    { id: '9', date: 'January 12, 2025', actPlateNumber: 'YZA-4567', totalClaimed: '65.00' },
    { id: '10', date: 'January 11, 2025', actPlateNumber: 'BCD-8910', totalClaimed: '85.00' },
    { id: '11', date: 'January 10, 2025', actPlateNumber: 'EFG-2345', totalClaimed: '50.00' },
    { id: '12', date: 'January 09, 2025', actPlateNumber: 'HIJ-6789', totalClaimed: '75.00' },
    { id: '13', date: 'January 08, 2025', actPlateNumber: 'KLM-0123', totalClaimed: '100.00' },
    { id: '14', date: 'January 07, 2025', actPlateNumber: 'NOP-4567', totalClaimed: '60.00' },
    { id: '15', date: 'January 06, 2025', actPlateNumber: 'QRS-8910', totalClaimed: '80.00' },
    { id: '16', date: 'January 05, 2025', actPlateNumber: 'TUV-2345', totalClaimed: '55.00' },
    { id: '17', date: 'January 04, 2025', actPlateNumber: 'WXY-6789', totalClaimed: '90.00' },
    { id: '18', date: 'January 03, 2025', actPlateNumber: 'ZAB-0123', totalClaimed: '70.00' },
    { id: '19', date: 'January 02, 2025', actPlateNumber: 'CDE-4567', totalClaimed: '65.00' },
    { id: '20', date: 'January 01, 2025', actPlateNumber: 'FGH-8910', totalClaimed: '85.00' },
  ];

  // Filter logs based on search text
  const filteredLogs = activityLogs.filter((item) => {
    const lowerSearch = searchText.toLowerCase();
    return (
      item.date.toLowerCase().includes(lowerSearch) ||
      item.actPlateNumber.toLowerCase().includes(lowerSearch) ||
      item.totalClaimed.toLowerCase().includes(lowerSearch)
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

      {/* Activity Logs List */}
      <View style={styles.historyContainer}>
        <FlatList
          data={filteredLogs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <View style={styles.leftColumn}>
                <Text style={styles.historyDate}>{item.date}</Text>
                <Text style={styles.historyRoute}>{item.actPlateNumber}</Text>
              </View>
              <View style={styles.rightColumn}>
                <Text style={styles.historyAmount}>{item.totalClaimed}</Text>
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
  // Here, historyRoute now displays the plate number.
  historyRoute: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // And historyAmount now displays the total claimed.
  historyAmount: {
    fontSize: 16,
    color: '#e74c3c',
  },
};

export default ActivityLogs;
