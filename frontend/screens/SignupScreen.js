import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { getApiUrl } from '../api';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen({ navigation }) {
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

  const handleSignup = () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }
    setLoading(true);
    fetch(getApiUrl('/auth/signup'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Username may already exist');
        return res.json();
      })
      .then(data => {
        setLoading(false);
        login(data.user);
      })
      .catch(err => {
        setLoading(false);
        Alert.alert('Signup Failed', err.message);
      });
  };

  return (
    <LinearGradient colors={theme.heroGradient} style={styles.container}>
      <TouchableOpacity style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.1)' }]} onPress={() => switchPortal(null)}>
        <Ionicons name="arrow-back" size={20} color={isDark ? '#fff' : '#4338ca'} />
      </TouchableOpacity>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={[styles.logoWrap, { backgroundColor: theme.accent + '18' }]}>
          <Ionicons name="person-add" size={28} color={theme.accent} />
        </View>

        <Text style={[styles.title, { color: isDark ? '#fff' : '#1e1b4b' }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#a5b4fc' : '#6366f1' }]}>Join the CampusOS network</Text>

        <View style={[styles.card, { backgroundColor: isDark ? 'rgba(17, 24, 39, 0.6)' : 'rgba(255, 255, 255, 0.85)', borderColor: theme.cardBorder }]}>
          <View style={[styles.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <Ionicons name="person-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Choose a username"
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
              placeholder="Create a password"
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
            style={[styles.button, { backgroundColor: theme.accent }]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <View style={styles.btnContent}>
                <Text style={styles.buttonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
            <Text style={[styles.linkText, { color: theme.textSecondary }]}>
              Already have an account? <Text style={[styles.linkBold, { color: theme.accent }]}>Sign In</Text>
            </Text>
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

  logoWrap: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, fontWeight: '500', marginTop: 4 },

  card: { width: '100%', padding: 24, borderRadius: 20, borderWidth: 1, marginTop: 28 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, marginBottom: 14, paddingHorizontal: 4 },
  inputIcon: { paddingLeft: 12 },
  input: { flex: 1, paddingVertical: 14, paddingHorizontal: 10, fontSize: 15 },
  eyeBtn: { padding: 12 },

  button: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 6 },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  linkContainer: { marginTop: 18, alignItems: 'center' },
  linkText: { fontSize: 14 },
  linkBold: { fontWeight: '700' },
});
