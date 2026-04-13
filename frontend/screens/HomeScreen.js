import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../AuthContext';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  
  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.headerCard}>
        <Text style={styles.welcomeText}>Welcome back, {user?.username || 'Student'}!</Text>
        <Text style={styles.subText}>{user?.role === 'admin' ? 'Admin Dashboard' : 'What do you need today?'}</Text>
      </LinearGradient>
      
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Bookings')}>
          <Text style={styles.actionText}>📚 Book a Room</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Lost & Found')}>
          <Text style={styles.actionText}>🔍 Lost & Found</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Events')}>
          <Text style={styles.actionText}>📅 Campus Events</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Chatbot')}>
          <Text style={styles.actionText}>🤖 AI Assistant</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', /* Dark slate background */
  },
  headerCard: {
    padding: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  subText: {
    fontSize: 16,
    color: '#e0e7ff',
    marginTop: 8,
  },
  quickActions: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#1e293b',
    width: '48%',
    padding: 30,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
});
