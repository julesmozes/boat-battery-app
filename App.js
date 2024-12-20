import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import DashBoardComponent from './components/dashBoard';
import BleScanner from './components/Connect';
import {StatusBar} from 'react-native';


const Tab = createBottomTabNavigator();

const CustomTabBarIcon = ({focused, title}) => (
  <View
    style={{
      alignItems: 'center',
    }}>
    <Text
      style={{
        color: focused ? 'red' : 'white',
        fontWeight: 'light',
        fontSize: 20,
        marginBottom: 5,
        borderTopWidth: focused ? 1 : 0,
        borderTopColor: 'red',
      }}>
      {title}
    </Text>
  </View>
);

const CustomTabBar = ({state, descriptors, navigation}) => (
  <View style={styles.tabContainer}>
    {state.routes.map((route, index) => {
      const {options} = descriptors[route.key];
      const label =
        options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

      return (
        <TouchableOpacity
          key={index}
          style={styles.tabItem}
          onPress={() => navigation.navigate(route.name)}>
          <CustomTabBarIcon focused={state.index === index} title={label} />
        </TouchableOpacity>
      );
    })}
  </View>
);

const CustomTabNavigator = () => {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#012047" barStyle="light-content" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
        tabBar={props => <CustomTabBar {...props} />}>
        <Tab.Screen name="Dashboard" component={DashBoardComponent} />
        <Tab.Screen name="Connect" component={BleScanner} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    height: 60,
    paddingBottom: 10,
    backgroundColor: '#012047',
    // elevation: 3,
    border: 0,
    // borderTopWidth: 1,
    // borderTopColor: '#e0e0e0',
    paddingLeft: 10,
  },
  tabItem: {
    justifyContent: 'center',
    marginLeft: 20,
  },
});

export default CustomTabNavigator;
