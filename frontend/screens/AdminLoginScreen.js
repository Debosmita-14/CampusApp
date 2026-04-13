import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../AuthContext';
import { getApiUrl } from '../api';
import { Ionicons } from '@expo/vector-icons';

export default function AdminLoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, switchPortal } = useAuth();

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter admin credentials.');
      return;
    }

    setLoading(true);
    fetch(getApiUrl('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Invalid credentials');
        return res.json();
      })
      .then(data => {
        setLoading(false);
        if (data.user.role !== 'admin') {
          Alert.alert('Access Denied', 'This portal is for administrators only.');
          return;
        }
        login(data.user);
      })
      .catch(err => {
        setLoading(false);
        Alert.alert('Login Failed', err.message);
      });
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => switchPortal(null)}>
         <Ionicons name="arrow-back" size={24} color="#fff" />
         <Text style={styles.backText}>Change Portal</Text>
      </TouchableOpacity>
      
      <View style={styles.card}>
        <View style={styles.iconWrapper}>
           <Ionicons name="shield-checkmark" size={40} color="#f59e0b" />
        </View>
        <Text style={styles.title}>Admin Access</Text>
        <Text style={styles.subtitle}>Enter secure credentials</Text>

        <TextInput
          style={styles.input}
          placeholder="Admin Username"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Admin Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Secure Login</Text>}
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  button: {
    backgroundColor: '#f59e0b',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
