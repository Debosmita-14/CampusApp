import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import BookingsScreen from './screens/BookingsScreen';
import LostFoundScreen from './screens/LostFoundScreen';
import EventsScreen from './screens/EventsScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import AdminScreen from './screens/AdminScreen';
import AdminLoginScreen from './screens/AdminLoginScreen';
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import { AuthProvider, useAuth } from './AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- AUTH NAVIGATOR FOR STUDENTS ---
function StudentAuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// --- STUDENT PANEL TABS ---
function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Bookings') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Lost & Found') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Events') iconName = focused ? 'megaphone' : 'megaphone-outline';
          else if (route.name === 'Chatbot') iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
        headerStyle: { backgroundColor: '#0f172a', elevation: 0, shadowOpacity: 0 },
        headerTintColor: '#fff',
        tabBarStyle: { backgroundColor: '#0f172a', borderTopWidth: 0, elevation: 10, paddingBottom: 5, paddingTop: 5 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Lost & Found" component={LostFoundScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} />
    </Tab.Navigator>
  );
}

// --- ADMIN PANEL TABS ---
function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'shield' : 'shield-outline';
          else if (route.name === 'Manage Events') iconName = focused ? 'calendar' : 'calendar-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#f59e0b', // Different active color for admin
        tabBarInactiveTintColor: '#94a3b8',
        headerStyle: { backgroundColor: '#0f172a', elevation: 0, shadowOpacity: 0 },
        headerTintColor: '#fff',
        tabBarStyle: { backgroundColor: '#0f172a', borderTopWidth: 0, elevation: 10, paddingBottom: 5, paddingTop: 5 },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminScreen} />
      <Tab.Screen name="Manage Events" component={EventsScreen} />
    </Tab.Navigator>
  );
}

// --- MAIN ROUTER ---
function MainApp() {
  const { user, portal } = useAuth();

  // 1. If portal is not selected, show role selection screen
  if (!portal) {
    return <RoleSelectionScreen />;
  }

  // 2. If 'admin' portal selected
  if (portal === 'admin') {
    if (!user) return <AdminLoginScreen />;
    return (
      <NavigationContainer>
        <AdminTabs />
      </NavigationContainer>
    );
  }

  // 3. If 'student' portal selected
  if (portal === 'student') {
    if (!user) {
      return (
        <NavigationContainer>
          <StudentAuthNavigator />
        </NavigationContainer>
      );
    }
    return (
      <NavigationContainer>
        <StudentTabs />
      </NavigationContainer>
    );
  }

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
