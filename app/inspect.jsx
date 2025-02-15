import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import globalStyles from './globalstyles';

const Inspect = () => {
  // Sample shuttle data
  const shuttleList = [
    { id: '1', shuttlePlatNumber: 'ABC123' },
    { id: '2', shuttlePlatNumber: 'ABC123' },
    { id: '3', shuttlePlatNumber: 'ABC123' },
    { id: '4', shuttlePlatNumber: 'ABC123' },
    { id: '5', shuttlePlatNumber: 'ABC123' },
    { id: '6', shuttlePlatNumber: 'ABC123' },
    { id: '7', shuttlePlatNumber: 'ABC123' },
    { id: '8', shuttlePlatNumber: 'ABC123' },
  ];

  return (
    <View style={globalStyles.container}>
      {/* "Select Shuttle" row with text at left and plus icon at right */}
      <View style={styles.selectShuttleContainer}>
        <Text style={styles.selectShuttleText}>Select shuttle</Text>
        <TouchableOpacity>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Shuttle List */}
      <View style={styles.historyContainer}>
        <FlatList
          data={shuttleList}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <Text style={styles.shuttlePlate}>{item.shuttlePlatNumber}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = {
  /* "Select Shuttle" row with items on opposite ends */
  selectShuttleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // space items out: left & right
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

  /* Reusing from travel-history: container for the list & each item */
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
  },
  shuttlePlate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
};

export default Inspect;
