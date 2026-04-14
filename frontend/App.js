import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';

import DashboardScreen from './screens/DashboardScreen';
import BookingsScreen from './screens/BookingsScreen';
import LostFoundScreen from './screens/LostFoundScreen';
import EventsScreen from './screens/EventsScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import LiveMapScreen from './screens/LiveMapScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SmartScheduleScreen from './screens/SmartScheduleScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import AdminScreen from './screens/AdminScreen';
import AdminLoginScreen from './screens/AdminLoginScreen';
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import { AuthProvider, useAuth } from './AuthContext';
import { ThemeProvider, useTheme } from './ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- STUDENT AUTH NAVIGATOR ---
function StudentAuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// --- STUDENT MAIN TABS ---
function StudentMainTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Bookings') iconName = focused ? 'business' : 'business-outline';
          else if (route.name === 'Live Map') iconName = focused ? 'map' : 'map-outline';
          else if (route.name === 'Events') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'AI Chat') iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          return (
            <View style={focused ? {
              backgroundColor: theme.accent + '15',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
            } : {}}>
              <Ionicons name={iconName} size={focused ? 22 : 20} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        headerStyle: {
          backgroundColor: theme.header,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopWidth: 0.5,
          borderTopColor: theme.border,
          elevation: 0,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 84 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Live Map" component={LiveMapScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="AI Chat" component={ChatbotScreen} options={{ title: 'CampusAI' }} />
    </Tab.Navigator>
  );
}

// --- STUDENT STACK (wraps tabs + sub-screens) ---
function StudentStackNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.header,
        },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="StudentTabs" component={StudentMainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Lost & Found" component={LostFoundScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Smart Schedule" component={SmartScheduleScreen} />
    </Stack.Navigator>
  );
}

// --- ADMIN TABS ---
function AdminTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Console') iconName = focused ? 'shield' : 'shield-outline';
          else if (route.name === 'Events') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Analytics') iconName = focused ? 'analytics' : 'analytics-outline';
          else if (route.name === 'AI Chat') iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          return (
            <View style={focused ? {
              backgroundColor: '#fbbf24' + '15',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
            } : {}}>
              <Ionicons name={iconName} size={focused ? 22 : 20} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: '#fbbf24',
        tabBarInactiveTintColor: theme.textMuted,
        headerStyle: {
          backgroundColor: theme.header,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopWidth: 0.5,
          borderTopColor: theme.border,
          elevation: 0,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 84 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen name="Console" component={AdminScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Events" component={EventsScreen} options={{ title: 'Manage Events' }} />
      <Tab.Screen name="Analytics" component={SmartScheduleScreen} options={{ title: 'AI Analytics' }} />
      <Tab.Screen name="AI Chat" component={ChatbotScreen} options={{ title: 'CampusAI' }} />
    </Tab.Navigator>
  );
}

// --- MAIN ROUTER ---
function MainApp() {
  const { user, portal } = useAuth();

  // 1. No portal selected — show role selection
  if (!portal) {
    return <RoleSelectionScreen />;
  }

  // 2. Admin portal
  if (portal === 'admin') {
    if (!user) return <AdminLoginScreen />;
    return (
      <NavigationContainer>
        <AdminTabs />
      </NavigationContainer>
    );
  }

  // 3. Student portal
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
        <StudentStackNavigator />
      </NavigationContainer>
    );
  }

  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
