import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../AuthContext';

export default function RoleSelectionScreen() {
  const { switchPortal } = useAuth();

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>CampusApp</Text>
        <Text style={styles.subtitle}>Please select your portal</Text>

        <TouchableOpacity style={[styles.button, styles.userButton]} onPress={() => switchPortal('student')}>
          <Text style={styles.buttonText}>👩‍🎓 Student Portal</Text>
          <Text style={styles.buttonDesc}>Access services, book rooms, report items</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.adminButton]} onPress={() => switchPortal('admin')}>
          <Text style={styles.buttonText}>🛡️ Admin Portal</Text>
          <Text style={styles.buttonDesc}>Manage events, users and campus data</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
  },
  userButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: '#6366f1',
  },
  adminButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: '#f59e0b',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buttonDesc: {
    color: '#94a3b8',
    fontSize: 14,
  },
});
