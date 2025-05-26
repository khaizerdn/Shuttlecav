import React, { useState, useRef, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

const HelpSlideshow = () => {
  const { role } = useLocalSearchParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const images = role === 'inspector' ? [
    require('../assets/images/help/inspector/I_1.png'),
    require('../assets/images/help/inspector/I_2.png'),
    require('../assets/images/help/inspector/I_3.png'),
    require('../assets/images/help/inspector/I_4.png'),
    require('../assets/images/help/inspector/I_5.png'),
    require('../assets/images/help/inspector/I_6.png'),
    require('../assets/images/help/inspector/I_7.png'),
    require('../assets/images/help/inspector/I_8.png'),
    require('../assets/images/help/inspector/I_9.png'),
    require('../assets/images/help/inspector/I_10.png'),
    require('../assets/images/help/inspector/I_11.png'),
    require('../assets/images/help/inspector/I_12.png'),
    require('../assets/images/help/inspector/I_13.png'),
    require('../assets/images/help/inspector/I_14.png'),
    require('../assets/images/help/inspector/I_15.png'),
    require('../assets/images/help/inspector/I_16.png'),
    require('../assets/images/help/inspector/I_17.png'),
    require('../assets/images/help/inspector/I_18.png'),
    require('../assets/images/help/inspector/I_19.png'),
    require('../assets/images/help/inspector/I_20.png'),
    require('../assets/images/help/inspector/I_21.png'),
  ] : role === 'admin' ? [
    require('../assets/images/help/admin/A_1.png'),
    require('../assets/images/help/admin/A_2.png'),
    require('../assets/images/help/admin/A_3.png'),
    require('../assets/images/help/admin/A_4.png'),
    require('../assets/images/help/admin/A_5.png'),
    require('../assets/images/help/admin/A_6.png'),
    require('../assets/images/help/admin/A_7.png'),
    require('../assets/images/help/admin/A_8.png'),
    require('../assets/images/help/admin/A_9.png'),
    require('../assets/images/help/admin/A_10.png'),
    require('../assets/images/help/admin/A_11.png'),
    require('../assets/images/help/admin/A_12.png'),
    require('../assets/images/help/admin/A_13.png'),
    require('../assets/images/help/admin/A_14.png'),
    require('../assets/images/help/admin/A_15.png'),
    require('../assets/images/help/admin/A_16.png'),
    require('../assets/images/help/admin/A_17.png'),
    require('../assets/images/help/admin/A_18.png'),
  ] : [
    require('../assets/images/help/user/P_1.png'),
    require('../assets/images/help/user/P_2.png'),
    require('../assets/images/help/user/P_3.png'),
    require('../assets/images/help/user/P_4.png'),
    require('../assets/images/help/user/P_5.png'),
    require('../assets/images/help/user/P_6.png'),
    require('../assets/images/help/user/P_7.png'),
    require('../assets/images/help/user/P_8.png'),
  ];

  const onMomentumScrollEnd = ({ nativeEvent }) => {
    const index = Math.round(nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }) => (
    <View style={styles.imageContainer}>
      <Image
        source={item}
        style={styles.slideImage}
        resizeMode="contain"
      />
    </View>
  );

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: 0, animated: false });
    }
  }, [role]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        snapToAlignment="center"
        decelerationRate={0.8}
        scrollEventThrottle={16}
        initialScrollIndex={0}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
      <View style={styles.pageIndicator}>
        <Text style={styles.pageText}>
          {currentIndex + 1}/{images.length}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    margin: 0,
  },
  imageContainer: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideImage: {
    width,
    height,
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  pageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
});

export default HelpSlideshow;