import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import BookingsScreen from './screens/BookingsScreen';
import LostFoundScreen from './screens/LostFoundScreen';
import EventsScreen from './screens/EventsScreen';
import ChatbotScreen from './screens/ChatbotScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Bookings') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Lost & Found') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'Events') {
              iconName = focused ? 'megaphone' : 'megaphone-outline';
            } else if (route.name === 'Chatbot') {
              iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: '#94a3b8',
          headerStyle: {
            backgroundColor: '#0f172a',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#fff',
          tabBarStyle: {
            backgroundColor: '#0f172a',
            borderTopWidth: 0,
            elevation: 10,
            paddingBottom: 5,
            paddingTop: 5,
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Bookings" component={BookingsScreen} />
        <Tab.Screen name="Lost & Found" component={LostFoundScreen} />
        <Tab.Screen name="Events" component={EventsScreen} />
        <Tab.Screen name="Chatbot" component={ChatbotScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
