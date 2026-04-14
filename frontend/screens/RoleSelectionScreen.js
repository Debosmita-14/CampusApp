import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';

const { width } = Dimensions.get('window');

export default function RoleSelectionScreen() {
  const { switchPortal } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const studentAnim = useRef(new Animated.Value(0)).current;
  const adminAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
      ]),
      Animated.stagger(150, [
        Animated.parallel([
          Animated.timing(studentAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
        Animated.timing(adminAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={theme.heroGradient} style={styles.container}>
      {/* Theme Toggle */}
      <TouchableOpacity onPress={toggleTheme} style={[styles.themeToggle, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
        <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={isDark ? '#fbbf24' : '#4338ca'} />
      </TouchableOpacity>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo */}
        <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }] }]}>
          <View style={[styles.logoCircle, { backgroundColor: theme.accent + '20' }]}>
            <View style={[styles.logoInner, { backgroundColor: theme.accent + '30' }]}>
              <Ionicons name="grid" size={32} color={theme.accent} />
            </View>
          </View>
        </Animated.View>

        <Text style={[styles.title, { color: isDark ? '#fff' : '#1e1b4b' }]}>CampusOS</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#a5b4fc' : '#6366f1' }]}>Campus Operating System</Text>
        <Text style={[styles.desc, { color: isDark ? '#c7d2fe' : '#4338ca' }]}>
          AI-powered resource management, real-time intelligence, and smart automation
        </Text>

        {/* Portal Cards */}
        <Animated.View style={[styles.cardsWrap, { opacity: studentAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.portalCard, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.06)', borderColor: theme.accent + '30' }]}
            onPress={() => switchPortal('student')}
          >
            <View style={styles.portalCardInner}>
              <View style={[styles.portalIcon, { backgroundColor: theme.accent + '18' }]}>
                <Ionicons name="school" size={28} color={theme.accent} />
              </View>
              <View style={styles.portalInfo}>
                <Text style={[styles.portalTitle, { color: isDark ? '#fff' : '#1e1b4b' }]}>Student Portal</Text>
                <Text style={[styles.portalDesc, { color: isDark ? '#a5b4fc' : '#6366f1' }]}>
                  Dashboard • Bookings • Events • AI Chat
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.accent} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ opacity: adminAnim }}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.portalCard, { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.06)' : 'rgba(251, 191, 36, 0.05)', borderColor: '#fbbf24' + '30' }]}
            onPress={() => switchPortal('admin')}
          >
            <View style={styles.portalCardInner}>
              <View style={[styles.portalIcon, { backgroundColor: '#fbbf24' + '18' }]}>
                <Ionicons name="shield-checkmark" size={28} color="#fbbf24" />
              </View>
              <View style={styles.portalInfo}>
                <Text style={[styles.portalTitle, { color: isDark ? '#fff' : '#1e1b4b' }]}>Admin Portal</Text>
                <Text style={[styles.portalDesc, { color: isDark ? '#fcd34d' : '#d97706' }]}>
                  Analytics • Users • Automation • Control
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#fbbf24" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[styles.footer, { opacity: adminAnim }]}>
          <View style={[styles.versionBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
            <Ionicons name="hardware-chip" size={12} color={theme.accent} />
            <Text style={[styles.versionText, { color: isDark ? '#a5b4fc' : '#6366f1' }]}>Powered by CampusAI v2.1</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  themeToggle: { position: 'absolute', top: 50, right: 20, width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  content: { alignItems: 'center' },

  logoWrap: { marginBottom: 20 },
  logoCircle: { width: 88, height: 88, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  logoInner: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  title: { fontSize: 38, fontWeight: '900', letterSpacing: -1 },
  subtitle: { fontSize: 15, fontWeight: '600', marginTop: 4, letterSpacing: 2, textTransform: 'uppercase' },
  desc: { fontSize: 14, textAlign: 'center', marginTop: 12, lineHeight: 20, paddingHorizontal: 20, fontWeight: '500' },

  cardsWrap: { width: '100%', marginTop: 36 },
  portalCard: { width: '100%', borderRadius: 18, borderWidth: 1, padding: 20, marginBottom: 14 },
  portalCardInner: { flexDirection: 'row', alignItems: 'center' },
  portalIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  portalInfo: { flex: 1 },
  portalTitle: { fontSize: 18, fontWeight: '800' },
  portalDesc: { fontSize: 12, marginTop: 3, fontWeight: '500' },

  footer: { marginTop: 32 },
  versionBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, gap: 6 },
  versionText: { fontSize: 12, fontWeight: '600' },
});
