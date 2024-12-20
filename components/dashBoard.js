import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';

import {
  startBLEManager,
  handleAndroidPermissions,
  retrieveServicesOfDevice,
  startNofitcationForServices,
  addListenerForNotifications,
  addListenerForConnection,
  addListenerForDisconnection,
} from './BLEManager';

import {
  CHARACTERISTIC_UUID_CURR_AMPS,
  CHARACTERISTIC_UUID_USED_AMP_HOUR,
} from './constants';

function getCurrentTime() {
  const now = new Date();
  let hours = now.getHours().toString().padStart(2, '0');
  let minutes = now.getMinutes().toString().padStart(2, '0');
  let seconds = now.getSeconds().toString().padStart(2, '0');
  return hours + minutes + seconds;
}

const DashBoardComponent = () => {
  const [boatUsedAmpHourData, setBoatUsedAmpHourData] = useState([]);
  const [boatAmpDrawnData, setBoatAmpDrawnData] = useState([]);
  const [currAmps, setCurrAmps] = useState(0);
  const [isconnected, setIsConnected] = useState(false);
  const [chartParentWidth, setChartParentWidth] = useState(0);
  let devicesSetNotifcations = [];

  const handleNotification = ({value, peripheral, characteristic, service}) => {
    let dataView = new DataView(new Uint8Array(value).buffer);
    let reconstructedValue = dataView.getFloat64(0, true); // true indicates little-endian format
    // console.log(
    //   `Received ${reconstructedValue} for characteristic ${characteristic}`,
    // );
    if (characteristic == CHARACTERISTIC_UUID_CURR_AMPS) {
      setBoatAmpDrawnData(oldAmpData => {
        if (oldAmpData.length > 30) {
          oldAmpData = oldAmpData.slice(-30);
        }
        return [...oldAmpData, [getCurrentTime(), reconstructedValue]];
      });
    } else if (characteristic == CHARACTERISTIC_UUID_USED_AMP_HOUR) {
      setBoatUsedAmpHourData(boatdata => {
        if (boatdata.length > 30) {
          boatdata = boatdata.slice(-30);
        }
        return [...boatdata, [getCurrentTime(), reconstructedValue]];
      });
    } else {
      console.error('Characteristic feeded to listener is unknown');
    }
  };

  const onConnect = async connectionInfo => {
    // console.log('Dashboard is handeling connection');
    await retrieveServicesOfDevice(connectionInfo.peripheral);
    startNofitcationForServices(connectionInfo.peripheral);
    if (!devicesSetNotifcations.includes(connectionInfo.peripheral)) {
      addListenerForNotifications(handleNotification);
      devicesSetNotifcations = [
        ...devicesSetNotifcations,
        connectionInfo.peripheral,
      ];
    } else {
    //   console.log(
    //     `Connection has been established with device ${connectionInfo.peripheral} before and no event listeners have been added in onConnect in dashBoard.js`,
    //   );
    }
    setIsConnected(true);
  };

  const onDisconnect = () => {
    setIsConnected(false);
  };

  useEffect(() => {
    const setupCode = async () => {
      if (handleAndroidPermissions() == true) {
        await startBLEManager();
        await addListenerForConnection(onConnect);
        await addListenerForDisconnection(onDisconnect);
        // console.log('setup compelete');
      }
    };
    setupCode();
  }, []);
  return (
    <View style={styles.base}>
      <View style={styles.marginContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.smallTitle}>
            {isconnected ? 'Connected' : ' Not Connected'}
          </Text>
          <Text style={styles.largeTitle}>Dashboard</Text>
        </View>
        {boatUsedAmpHourData.length >= 1 && boatAmpDrawnData.length >= 1 ? (
          <View
            style={styles.dashBoardContainer}
            onLayout={({nativeEvent}) =>
              setChartParentWidth(nativeEvent.layout.width)
            }>
            <View style={styles.infoCirclesContainer}>
              <View style={styles.infoCircle}>
                <LinearGradient
                  colors={['#FA0053', '#FE2C20']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.gradientInCircle}>
                  <Text style={styles.infoCircleText}>
                    {boatAmpDrawnData[boatAmpDrawnData.length - 1][1].toFixed(
                      2,
                    )}
                  </Text>
                  <Text style={styles.infoCircleSubText}>Amps</Text>
                </LinearGradient>
              </View>
              <View style={styles.infoCircle}>
                <LinearGradient
                  colors={['#9F51FF', '#DD27FE']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.gradientInCircle}>
                  <Text style={styles.infoCircleText}>
                    {boatUsedAmpHourData[
                      boatUsedAmpHourData.length - 1
                    ][1].toFixed(2)}
                  </Text>
                  <Text style={styles.infoCircleSubText}>Ah</Text>
                </LinearGradient>
              </View>
            </View>
            <LineChart
              data={{
                // labels: boatdata.map(([time, value]) => time),
                datasets: [
                  {
                    data: boatUsedAmpHourData.map(([time, value]) => value),
                  },
                ],
              }}
              width={chartParentWidth}
              height={220}
              // yAxisLabel="$"
              yAxisSuffix=" Ah"
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundColor: '#e26a00',
                backgroundGradientFrom: '#8E69FE',
                backgroundGradientTo: '#286AFE',
                decimalPlaces: 2, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 32,
                },
                propsForDots: {
                  r: '1',
                  strokeWidth: '0',
                  stroke: '#ffa726',
                },
              }}
              // bezier
              style={{
                marginVertical: 0,
                marginHorizontal: 0,
                borderRadius: 16,
              }}
            />
            <LineChart
              data={{
                // labels: boatdata.map(([time, value]) => time),
                datasets: [
                  {
                    data: boatAmpDrawnData.map(([time, value]) => value),
                  },
                ],
              }}
              width={chartParentWidth}
              height={220}
              // yAxisLabel="$"
              yAxisSuffix=" A"
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                // backgroundColor: '#e26a00',
                backgroundGradientFrom: '#FE0069',
                backgroundGradientTo: '#FE2C20',
                decimalPlaces: 2, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 32,
                },
                propsForDots: {
                  r: '1',
                  strokeWidth: '0',
                  stroke: '#ffa726',
                },
              }}
              // bezier
              style={{
                marginVertical: 0,
                marginHorizontal: 0,
                borderRadius: 16,
              }}
            />
          </View>
        ) : (
          <Text>Not connected or no data yet</Text>
        )}
      </View>
    </View>
  );
};

export default DashBoardComponent;

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
  text_center: {
    textAlign: 'center',
    fontSize: 20,
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
  largeTitle: {
    fontWeight: 'medium',
    color: 'white',
    fontSize: 40,
  },
  infoCircleText: {
    fontWeight: 'light',
    color: 'white',
    fontSize: 25,
  },
  infoCircleSubText: {
    fontWeight: 'light',
    fontSize: 15,
  },
  dashBoardContainer: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'space-around',
  },
  infoCircle: {
    backgroundColor: 'red',
    height: 120,
    width: 120,
    borderRadius: 75,
    overflow: 'hidden',
  },
  infoCirclesContainer: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  gradientInCircle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
