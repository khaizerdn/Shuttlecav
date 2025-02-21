import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import globalStyles from './globalstyles';
import { useRouter, useLocalSearchParams } from 'expo-router';

const Inspect = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Initial shuttle data
  const [shuttleList, setShuttleList] = useState([
    { id: '1', shuttleDriver: 'Juan Masipag', shuttlePlatNumber: 'ABC123', route: 'Carmona Estates to Waltermart' },
    { id: '2', shuttleDriver: 'Juan Tamad', shuttlePlatNumber: 'ABC123', route: 'Waltermart to Carmona Estates' },
    { id: '3', shuttleDriver: 'Juan Saktolang', shuttlePlatNumber: 'ABC123', route: 'Carmona Estates to Waltermart' },
  ]);

  // If a new shuttle is passed via route parameters, add it to the list.
  useEffect(() => {
    if (params.newShuttle) {
      let newShuttleObj = params.newShuttle;
      // Since we passed the shuttle as a JSON string, parse it.
      try {
        newShuttleObj = JSON.parse(newShuttleObj);
      } catch (error) {
        console.error("Failed to parse newShuttle param:", error);
        return;
      }
      if (newShuttleObj && newShuttleObj.shuttleDriver) {
        // Create a unique ID for the new shuttle.
        newShuttleObj.id = Date.now().toString();
        setShuttleList((prevList) => [...prevList, newShuttleObj]);
        // Clear the parameter so it is not added again.
        router.setParams({ newShuttle: undefined });
      }
    }
  }, [params.newShuttle]);

  const handleDelete = (id) => {
    setShuttleList(shuttleList.filter((item) => item.id !== id));
  };

  return (
    <View style={[globalStyles.container, styles.fullScreen]}>
      {/* "Select Shuttle" header row */}
      <View style={styles.selectShuttleContainer}>
        <Text style={styles.selectShuttleText}>Select shuttle</Text>
        <TouchableOpacity onPress={() => router.push('/add-shuttle')}>
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
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/start-inspection',
                  params: {
                    driver: item.shuttleDriver,
                    plate: item.shuttlePlatNumber,
                    route: item.route,
                  },
                })
              }
            >
              <View style={globalStyles.listItem}>
                <View style={globalStyles.listItemLeft}>
                  <Text style={globalStyles.listItemDate}>{item.route}</Text>
                  <Text style={globalStyles.listItemPrimary}>
                    {item.shuttleDriver} - {item.shuttlePlatNumber}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};

const styles = {
  fullScreen: {
    flex: 1,
    backgroundColor: '#FFF',
  },
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
};

export default Inspect;
