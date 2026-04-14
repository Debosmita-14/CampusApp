import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { getApiUrl } from '../api';

const { width } = Dimensions.get('window');

function AnimatedCounter({ target, duration = 1200, style }) {
  const [display, setDisplay] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    let start = 0;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      setDisplay(current);
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [target]);

  return <Text style={style}>{display.toLocaleString()}</Text>;
}

function StatCard({ icon, label, value, color, bgColor, suffix, theme }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={[styles.statIconWrap, { backgroundColor: bgColor }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <AnimatedCounter target={typeof value === 'number' ? value : 0} style={[styles.statValue, { color: theme.text }]} />
        {suffix && <Text style={[styles.statSuffix, { color }]}>{suffix}</Text>}
        <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
      </View>
    </Animated.View>
  );
}

function QuickAction({ icon, label, color, onPress, theme }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.93, friction: 5, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.quickAction, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.8}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: color + '18' }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <Text style={[styles.quickActionLabel, { color: theme.text }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function OccupancyBar({ zone, theme }) {
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barAnim, { toValue: zone.occupancy_percent / 100, duration: 1000, useNativeDriver: false }).start();
  }, [zone.occupancy_percent]);

  const barColor = zone.density === 'low' ? theme.densityLow : zone.density === 'medium' ? theme.densityMedium : theme.densityHigh;

  const animatedWidth = barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.occupancyRow, { borderBottomColor: theme.border }]}>
      <View style={styles.occupancyInfo}>
        <Text style={[styles.occupancyName, { color: theme.text }]}>{zone.name}</Text>
        <Text style={[styles.occupancyCount, { color: theme.textMuted }]}>
          {zone.current_occupancy}/{zone.capacity}
        </Text>
      </View>
      <View style={styles.occupancyBarWrap}>
        <View style={[styles.occupancyBarBg, { backgroundColor: theme.bgTertiary }]}>
          <Animated.View style={[styles.occupancyBarFill, { width: animatedWidth, backgroundColor: barColor }]} />
        </View>
        <Text style={[styles.occupancyPercent, { color: barColor }]}>{zone.occupancy_percent}%</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [stats, setStats] = useState(null);
  const [occupancy, setOccupancy] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, occRes, notifRes] = await Promise.all([
        fetch(getApiUrl('/analytics/dashboard-stats')),
        fetch(getApiUrl('/analytics/live-occupancy')),
        fetch(getApiUrl('/analytics/notifications')),
      ]);
      const statsData = await statsRes.json();
      const occData = await occRes.json();
      const notifData = await notifRes.json();
      setStats(statsData);
      setOccupancy(occData.zones || []);
      setNotifications(notifData.notifications || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const priorityColors = { critical: theme.danger, high: theme.warning, medium: theme.info, low: theme.textMuted };
  const priorityIcons = { critical: 'warning', high: 'alert-circle', medium: 'information-circle', low: 'chatbubble' };

  if (loading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Initializing CampusOS...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
    >
      {/* Hero Header */}
      <Animated.View style={{ opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}>
        <LinearGradient colors={theme.heroGradient} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.heroGreeting, { color: isDark ? '#e0e7ff' : '#4338ca' }]}>
                {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}
              </Text>
              <Text style={[styles.heroName, { color: isDark ? '#fff' : '#1e1b4b' }]}>
                {user?.username || 'Student'} 👋
              </Text>
            </View>
            <View style={styles.heroActions}>
              <TouchableOpacity onPress={toggleTheme} style={[styles.iconBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={isDark ? '#fbbf24' : '#4338ca'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={[styles.iconBtn, { backgroundColor: 'rgba(255,255,255,0.15)', marginLeft: 8 }]}>
                <Ionicons name="notifications" size={18} color={isDark ? '#fff' : '#4338ca'} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{notifications.filter(n => !n.read).length}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={logout} style={[styles.iconBtn, { backgroundColor: 'rgba(239,68,68,0.2)', marginLeft: 8 }]}>
                <Ionicons name="log-out-outline" size={18} color="#f87171" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.heroStatus}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={[styles.liveText, { color: isDark ? '#a5b4fc' : '#6366f1' }]}>Campus Live</Text>
            </View>
            <Text style={[styles.heroSub, { color: isDark ? '#c7d2fe' : '#4338ca' }]}>
              {stats?.active_now?.toLocaleString()} active now • {stats?.rooms_available} rooms free
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard icon="people" label="Active Students" value={stats?.active_now || 0} color={theme.accent} bgColor={theme.accentLight} theme={theme} />
        <StatCard icon="business" label="Rooms Free" value={stats?.rooms_available || 0} color={theme.success} bgColor={theme.successBg} theme={theme} />
        <StatCard icon="calendar" label="Events Today" value={stats?.events_today || 0} color={theme.info} bgColor={theme.infoBg} theme={theme} />
        <StatCard icon="construct" label="Open Tickets" value={stats?.pending_complaints || 0} color={theme.warning} bgColor={theme.warningBg} theme={theme} />
      </View>

      {/* AI Insights Banner */}
      <View style={[styles.aiBanner, { backgroundColor: theme.accentLight, borderColor: theme.accent + '30' }]}>
        <View style={styles.aiBannerLeft}>
          <Ionicons name="sparkles" size={20} color={theme.accent} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[styles.aiBannerTitle, { color: theme.text }]}>AI Insight</Text>
            <Text style={[styles.aiBannerDesc, { color: theme.textSecondary }]}>
              {stats?.ai_automations_today || 0} automations ran today • {stats?.energy_saved_percent}% energy optimized
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.accent} />
      </View>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll} contentContainerStyle={styles.quickActionsContent}>
        <QuickAction icon="search" label="Book Room" color="#818cf8" onPress={() => navigation.navigate('Bookings')} theme={theme} />
        <QuickAction icon="map" label="Live Map" color="#34d399" onPress={() => navigation.navigate('Live Map')} theme={theme} />
        <QuickAction icon="chatbubble-ellipses" label="AI Chat" color="#60a5fa" onPress={() => navigation.navigate('AI Chat')} theme={theme} />
        <QuickAction icon="calendar" label="Events" color="#f472b6" onPress={() => navigation.navigate('Events')} theme={theme} />
        <QuickAction icon="alert-circle" label="Report" color="#fbbf24" onPress={() => navigation.navigate('Lost & Found')} theme={theme} />
        <QuickAction icon="git-branch" label="Smart Schedule" color="#a78bfa" onPress={() => navigation.navigate('Smart Schedule')} theme={theme} />
      </ScrollView>

      {/* Live Occupancy */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Live Occupancy</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Live Map')}>
          <Text style={[styles.seeAll, { color: theme.accent }]}>See Map →</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.occupancyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        {occupancy.slice(0, 5).map((zone) => (
          <OccupancyBar key={zone.id} zone={zone} theme={theme} />
        ))}
      </View>

      {/* Recent Alerts */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Alerts</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Text style={[styles.seeAll, { color: theme.accent }]}>View All →</Text>
        </TouchableOpacity>
      </View>
      {notifications.slice(0, 3).map((notif) => (
        <View key={notif.id} style={[styles.alertCard, { backgroundColor: theme.card, borderColor: theme.cardBorder, borderLeftColor: priorityColors[notif.priority] }]}>
          <View style={[styles.alertIconWrap, { backgroundColor: (priorityColors[notif.priority] || theme.accent) + '18' }]}>
            <Ionicons name={priorityIcons[notif.priority] || 'information-circle'} size={18} color={priorityColors[notif.priority]} />
          </View>
          <View style={styles.alertContent}>
            <Text style={[styles.alertTitle, { color: theme.text }]} numberOfLines={1}>{notif.title}</Text>
            <Text style={[styles.alertDesc, { color: theme.textMuted }]} numberOfLines={1}>{notif.message}</Text>
          </View>
          {!notif.read && <View style={[styles.unreadDot, { backgroundColor: theme.accent }]} />}
        </View>
      ))}

      {/* Safety Score */}
      <View style={[styles.safetyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.safetyIcon, { backgroundColor: theme.successBg }]}>
            <Ionicons name="shield-checkmark" size={24} color={theme.success} />
          </View>
          <View style={{ marginLeft: 14 }}>
            <Text style={[styles.safetyLabel, { color: theme.textSecondary }]}>Campus Safety Score</Text>
            <Text style={[styles.safetyValue, { color: theme.success }]}>{stats?.campus_safety_score}%</Text>
          </View>
        </View>
        <Text style={[styles.safetyStatus, { color: theme.success }]}>● All Systems Normal</Text>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, fontWeight: '500' },

  // Hero
  hero: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroGreeting: { fontSize: 14, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase' },
  heroName: { fontSize: 28, fontWeight: '800', marginTop: 4 },
  heroActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  notifBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  notifBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  heroStatus: { marginTop: 18 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#34d399', marginRight: 6 },
  liveText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  heroSub: { fontSize: 14, fontWeight: '500' },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginTop: 16, gap: 8 },
  statCard: { width: (width - 40) / 2, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  statIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 26, fontWeight: '800' },
  statSuffix: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  statLabel: { fontSize: 12, fontWeight: '500', marginTop: 4 },

  // AI Banner
  aiBanner: { marginHorizontal: 16, marginTop: 16, padding: 14, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  aiBannerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  aiBannerTitle: { fontSize: 14, fontWeight: '700' },
  aiBannerDesc: { fontSize: 12, marginTop: 2 },

  // Quick Actions
  quickActionsScroll: { marginTop: 4 },
  quickActionsContent: { paddingHorizontal: 16, gap: 10, paddingVertical: 4 },
  quickAction: { width: 88, paddingVertical: 14, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  quickActionIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickActionLabel: { fontSize: 11, fontWeight: '600' },

  // Sections
  sectionTitle: { fontSize: 18, fontWeight: '700', marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
  seeAll: { fontSize: 13, fontWeight: '600' },

  // Occupancy
  occupancyCard: { marginHorizontal: 16, borderRadius: 16, padding: 14, borderWidth: 1 },
  occupancyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5 },
  occupancyInfo: { flex: 1, marginRight: 12 },
  occupancyName: { fontSize: 14, fontWeight: '600' },
  occupancyCount: { fontSize: 11, marginTop: 2 },
  occupancyBarWrap: { flexDirection: 'row', alignItems: 'center', width: 150 },
  occupancyBarBg: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden', marginRight: 8 },
  occupancyBarFill: { height: '100%', borderRadius: 3 },
  occupancyPercent: { fontSize: 12, fontWeight: '700', width: 38, textAlign: 'right' },

  // Alerts
  alertCard: { marginHorizontal: 16, marginBottom: 8, padding: 14, borderRadius: 14, borderWidth: 1, borderLeftWidth: 3, flexDirection: 'row', alignItems: 'center' },
  alertIconWrap: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  alertContent: { flex: 1, marginLeft: 12 },
  alertTitle: { fontSize: 14, fontWeight: '600' },
  alertDesc: { fontSize: 12, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },

  // Safety
  safetyCard: { marginHorizontal: 16, marginTop: 16, padding: 18, borderRadius: 16, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  safetyIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  safetyLabel: { fontSize: 12, fontWeight: '500' },
  safetyValue: { fontSize: 24, fontWeight: '800' },
  safetyStatus: { fontSize: 12, fontWeight: '600' },
});
