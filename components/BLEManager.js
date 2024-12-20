import BleManager from 'react-native-ble-manager';
import {PermissionsAndroid, Platform} from 'react-native';

import {Buffer} from 'buffer';

let BLEStarted = false;
let connected = false;

import {
  CHARACTERISTIC_UUID_CURR_AMPS,
  CHARACTERISTIC_UUID_RESET,
  CHARACTERISTIC_UUID_USED_AMP_HOUR,
  SERVICE_UUID,
} from './constants';

export const handleAndroidPermissions = () => {
  if (Platform.OS === 'android' && Platform.Version >= 31) {
    PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]).then(result => {
      if (!result) {
        return false;
      }
    });
  } else if (Platform.OS === 'android' && Platform.Version >= 23) {
    PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ).then(checkResult => {
      if (checkResult) {
        return true;
      } else {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ).then(requestResult => {
          if (!requestResult) {
            return false;
          }
        });
      }
    });
  }
  return true;
};

export const startBLEManager = () => {
  if (!BLEStarted) {
    return BleManager.start({showAlert: false}).then(() => {
      //   console.log('Module initialized');
      BLEStarted = true;
    });
  }
};

export const disconnectDevice = async deviceID => {
  return BleManager.disconnect(deviceID);
};

export const getConnectedPeripherals = async () => {
  return BleManager.getConnectedPeripherals([]);
};

export const startScan = async () => {
  await BleManager.scan([], 10, true)
    .then(() => {
      //   console.log('Scanning started');
    })
    .catch(error => {
      //   console.log('Scan error:', error);
    });
};

export const stopScan = async () => {
  await BleManager.stopScan();
};

export const isBLErunning = () => {
  return BLErunning;
};

export const startConnection = macAddress => {
  return BleManager.connect(macAddress).then(() => {
    connected = true;
  });
};

export const isConnected = () => {
  return connected;
};

export const retrieveServicesOfDevice = deviceID => {
  return BleManager.retrieveServices(deviceID);
};

export const startNofitcationForServices = connectionID => {
  BleManager.startNotification(
    connectionID,
    SERVICE_UUID,
    CHARACTERISTIC_UUID_USED_AMP_HOUR,
  );

  BleManager.startNotification(
    connectionID,
    SERVICE_UUID,
    CHARACTERISTIC_UUID_CURR_AMPS,
  );
};
export const addListenerForNotifications = functionIn => {
  BleManager.addListener(
    'BleManagerDidUpdateValueForCharacteristic',
    functionIn,
  );
};

export const addListenerForConnection = functionIn => {
  BleManager.addListener('BleManagerConnectPeripheral', functionIn);
};

export const addListenerForDisconnection = functionIn => {
  BleManager.addListener('BleManagerDisconnectPeripheral', functionIn);
};

export const addDiscoverListener = functionIn => {
  BleManager.addListener('BleManagerDiscoverPeripheral', functionIn);
};

export const requestReset = DeviceID => {
  const buffer = Buffer.from([1]);
  return BleManager.writeWithoutResponse(
    DeviceID,
    SERVICE_UUID,
    CHARACTERISTIC_UUID_RESET,
    buffer.toJSON().data,
  )
    .then(console.log('reset requested'))
    .catch(e => console.log(e));
};
