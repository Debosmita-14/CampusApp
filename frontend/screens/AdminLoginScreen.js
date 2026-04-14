import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { getApiUrl } from '../api';
import { Ionicons } from '@expo/vector-icons';

export default function AdminLoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, switchPortal } = useAuth();
  const { theme, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

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
    <LinearGradient colors={isDark ? ['#1a1207', '#292211', '#1e1b4b'] : ['#fef3c7', '#fde68a', '#e0e7ff']} style={styles.container}>
      <TouchableOpacity style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.1)' }]} onPress={() => switchPortal(null)}>
        <Ionicons name="arrow-back" size={20} color={isDark ? '#fff' : '#92400e'} />
      </TouchableOpacity>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={[styles.logoWrap, { backgroundColor: '#fbbf24' + '20' }]}>
          <Ionicons name="shield-checkmark" size={30} color="#fbbf24" />
        </View>

        <Text style={[styles.title, { color: isDark ? '#fff' : '#1e1b4b' }]}>Admin Access</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#fcd34d' : '#d97706' }]}>Secure administrator login</Text>

        <View style={[styles.card, {
          backgroundColor: isDark ? 'rgba(17, 24, 39, 0.7)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: '#fbbf24' + '25',
        }]}>
          <View style={[styles.securityBadge, { backgroundColor: '#fbbf24' + '10' }]}>
            <Ionicons name="finger-print" size={14} color="#fbbf24" />
            <Text style={[styles.securityText, { color: '#fbbf24' }]}>Secured Connection</Text>
          </View>

          <View style={[styles.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <Ionicons name="person-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Admin Username"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View style={[styles.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Admin Password"
              placeholderTextColor={theme.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#fbbf24' }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <View style={styles.btnContent}>
                <Ionicons name="shield" size={18} color="#fff" />
                <Text style={styles.buttonText}>Secure Login</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  backButton: { position: 'absolute', top: 50, left: 20, width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  content: { alignItems: 'center' },

  logoWrap: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, fontWeight: '600', marginTop: 4 },

  card: { width: '100%', padding: 24, borderRadius: 20, borderWidth: 1, marginTop: 28 },
  securityBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 10, marginBottom: 18, gap: 6 },
  securityText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, marginBottom: 14, paddingHorizontal: 4 },
  inputIcon: { paddingLeft: 12 },
  input: { flex: 1, paddingVertical: 14, paddingHorizontal: 10, fontSize: 15 },
  eyeBtn: { padding: 12 },

  button: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 6 },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
