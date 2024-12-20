import AsyncStorage from '@react-native-async-storage/async-storage';

const storeBoatMac = async () => {
  try {
    await AsyncStorage.setItem('@boatMac', 'YOUR_BOAT_MAC_ADDRESS');
    setBoatMac('YOUR_BOAT_MAC_ADDRESS');
  } catch (error) {
    console.error('Error storing boatMac:', error);
  }
};

const retrieveBoatMac = async () => {
  try {
    const value = await AsyncStorage.getItem('@boatMac');
    if (value !== null) {
      setBoatMac(value);
    }
  } catch (error) {
    console.error('Error retrieving boatMac:', error);
  }
};
