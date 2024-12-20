import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Button,
  TouchableOpacity,
} from 'react-native';
import {
  startBLEManager,
  startScan,
  addDiscoverListener,
  startConnection,
  stopScan,
  getConnectedPeripherals,
  disconnectDevice,
  addListenerForDisconnection,
  requestReset,
} from './BLEManager';
import Icon from 'react-native-vector-icons/Ionicons';

import LinearGradient from 'react-native-linear-gradient';

const BleScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const setupCodeConnect = async () => {
      // console.log('running setup code');
      await startBLEManager();
      addDiscoverListener(handleDiscoverPeripheral);
      addListenerForDisconnection(onDisconnectedDevice);
      await startScan();
    };
    setupCodeConnect();
  }, []);

  const onDisconnectedDevice = () => {
    updateConnections();
    setIsConnected(false);
    setDevices([]);
    startScan();
  };

  const updateConnections = async () => {
    getConnectedPeripherals().then(array => setConnections(array));
  };

  const tryConnection = async deviceID => {
    setConnectionLoading(true);
    await startConnection(deviceID)
      .then(() => {
        // console.log('handeling connection in Connect.js');
        setIsConnected(true);
        stopScan();
        updateConnections();
        setConnectionLoading(false);
      })
      .catch(e => {
        // console.log(e);
        setConnectionLoading(false);
      });
  };

  const refreshScan = async () => {
    await stopScan().then(setDevices([]));
    await startScan();
  };

  const handleDiscoverPeripheral = device => {
    // if (device.name == 'BDV001') {
    setDevices(prevDevices => {
      const deviceIndex = prevDevices.findIndex(d => d.id === device.id);
      if (deviceIndex === -1) {
        // Create a new array with the new device added to the list
        return [...prevDevices, device];
      } else {
        // Update the existing device in the list with the most recent version
        const updatedDevices = [...prevDevices];
        updatedDevices[deviceIndex] = device;
        return updatedDevices;
      }
    });
    // }
  };

  const handleDisconnect = async deviceID => {
    await disconnectDevice(deviceID);
    updateConnections();
    setIsConnected(false);
    setDevices([]);
    startScan();
  };

  const renderItem = ({item}) => (
    <LinearGradient
      colors={['#286AFE', '#8E69FE']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={styles.gradientCard}>
      <Text style={styles.cardTitle}>{item.name ? item.name : 'No name'}</Text>
      <View style={styles.cardText}>
        <Text>{item.id}</Text>
        <Button
          title="Connect →"
          onPress={() => tryConnection(item.id)}></Button>
      </View>
    </LinearGradient>
  );

  const renderConnection = ({item}) => (
    <LinearGradient
      colors={['#286AFE', '#8E69FE']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={styles.gradientCard}>
      <Text style={styles.cardTitle}>{item.name ? item.name : 'No name'}</Text>
      <View style={styles.cardText}>
        <Text>{item.id}</Text>
        {/* <Button
          title="Disconnect →"
          onPress={() => handleDisconnect(item.id)}></Button> */}
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.base}>
      <View style={styles.marginContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.smallTitle}>Status&</Text>
          <Text style={styles.largeTitle}>Connect</Text>
        </View>
        <View style={styles.containerMenuItem}>
          <Text style={styles.smallTitle}>Available BLE Devices</Text>
          {!isConnected && !connectionLoading && (
            <TouchableOpacity onPress={() => refreshScan()}>
              <Icon name="refresh" size={30} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
        <View style={{alignItems: 'stretch', flex: 1}}>
          {isConnected ? (
            <View>
              <Text>Connected!</Text>
              <FlatList
                data={connections}
                keyExtractor={item => item.id}
                renderItem={renderConnection}
              />
              <Button title="reset device" onPress={() => requestReset(connections[0].id)}></Button>
            </View>
          ) : connectionLoading ? (
            <Text>Loading</Text>
          ) : (
            <Text>Searching</Text>
          )}
          {devices.length >= 1 && !isConnected && !connectionLoading && (
            <FlatList
              data={devices}
              keyExtractor={item => item.id}
              renderItem={renderItem}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#012047',
  },
  marginContainer: {
    marginTop: 20,
    marginLeft: 30,
    marginRight: 30,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    flex: 1,
  },
  titleContainer: {
    justifyContent: 'flex-start',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  smallTitle: {
    fontWeight: 'light',
    color: 'white',
    fontSize: 20,
    marginBottom: 5,
  },
  gradientCard: {
    alignSelf: 'stretch',
    borderRadius: 16,
    padding: 8,
    paddingLeft: 15,
    marginTop: 10,
  },
  largeTitle: {
    fontWeight: 'medium',
    color: 'white',
    fontSize: 40,
  },
  cardTitle: {
    marginBottom: 5,
    fontWeight: 'medium',
    color: 'white',
    fontSize: 30,
  },
  cardText: {
    justifyContent: 'space-between',
    alignItems: 'stretch',
    flexDirection: 'row',
    fontWeight: 'light',
    color: 'white',
    fontSize: 20,
  },
  containerMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default BleScanner;
