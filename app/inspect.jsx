// Inspect.jsx
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from './globalstyles';
import { useRouter, useFocusEffect } from 'expo-router';
import { config } from './config';

const Inspect = () => {
  const router = useRouter();
  const [shuttleList, setShuttleList] = useState([]);

  const fetchShuttles = async () => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await fetch(`${config.API_URL}/shuttles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setShuttleList(data);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to fetch shuttles');
      }
    } catch (error) {
      console.error('Error fetching shuttles:', error);
    }
  };

  // Re-fetch shuttles every time this screen is focused.
  useFocusEffect(
    useCallback(() => {
      fetchShuttles();
    }, [])
  );

  // Delete a shuttle record (calls the DELETE endpoint)
  const handleDelete = async (id) => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await fetch(`${config.API_URL}/shuttles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setShuttleList(shuttleList.filter((item) => item.id !== id));
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to delete shuttle');
      }
    } catch (error) {
      console.error('Error deleting shuttle:', error);
    }
  };

  return (
    <View style={[globalStyles.container, styles.fullScreen]}>
      {/* Header Row */}
      <View style={globalStyles.sectionTitleContainer}>
        <Text style={globalStyles.sectionTitle}>Select shuttle</Text>
        <TouchableOpacity onPress={() => router.push('/add-shuttle')}>
          <Text style={globalStyles.sectionAddIcon}>+</Text>
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
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={globalStyles.redListButton}>
                  <Text style={globalStyles.listButtonText}>Delete</Text>
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
};

export default Inspect;
``
