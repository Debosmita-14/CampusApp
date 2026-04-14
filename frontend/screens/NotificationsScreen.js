import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { getApiUrl } from '../api';

function NotifCard({ notif, theme, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const priorityConfig = {
    critical: { color: theme.danger, icon: 'warning', bg: theme.dangerBg },
    high: { color: theme.warning, icon: 'alert-circle', bg: theme.warningBg },
    medium: { color: theme.info, icon: 'information-circle', bg: theme.infoBg },
    low: { color: theme.textMuted, icon: 'chatbubble', bg: theme.accentLight },
  };

  const typeConfig = {
    emergency: { icon: 'flash', label: 'EMERGENCY' },
    system: { icon: 'settings', label: 'SYSTEM' },
    event: { icon: 'calendar', label: 'EVENT' },
    info: { icon: 'information', label: 'INFO' },
    alert: { icon: 'alert', label: 'ALERT' },
  };

  const pConfig = priorityConfig[notif.priority] || priorityConfig.medium;
  const tConfig = typeConfig[notif.type] || typeConfig.info;

  const timeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={[styles.notifCard, {
        backgroundColor: theme.card,
        borderColor: notif.read ? theme.cardBorder : pConfig.color + '30',
        borderLeftColor: pConfig.color,
      }]}>
        <View style={styles.notifTop}>
          <View style={[styles.notifIconWrap, { backgroundColor: pConfig.bg }]}>
            <Ionicons name={pConfig.icon} size={18} color={pConfig.color} />
          </View>
          <View style={styles.notifMeta}>
            <View style={[styles.typeBadge, { backgroundColor: pConfig.color + '18' }]}>
              <Text style={[styles.typeLabel, { color: pConfig.color }]}>{tConfig.label}</Text>
            </View>
            <Text style={[styles.notifTime, { color: theme.textMuted }]}>{timeAgo(notif.timestamp)}</Text>
          </View>
        </View>
        <Text style={[styles.notifTitle, { color: theme.text, opacity: notif.read ? 0.7 : 1 }]}>{notif.title}</Text>
        <Text style={[styles.notifMessage, { color: theme.textSecondary }]}>{notif.message}</Text>
        {!notif.read && <View style={[styles.unreadIndicator, { backgroundColor: pConfig.color }]} />}
      </View>
    </Animated.View>
  );
}

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(getApiUrl('/analytics/notifications'));
      const data = await res.json();
      if (data.notifications) setNotifications(data.notifications);
    } catch (err) {
      console.error('Notifications fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchNotifications(); };

  const filters = ['all', 'unread', 'critical', 'high', 'medium'];
  const filtered = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.priority === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
    >
      {/* Header Stats */}
      <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
            <Text style={[styles.headerSub, { color: theme.textSecondary }]}>{unreadCount} unread • {notifications.length} total</Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity style={[styles.markAllBtn, { backgroundColor: theme.accentLight }]} onPress={() => {
              setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            }}>
              <Text style={[styles.markAllText, { color: theme.accent }]}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {filters.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, {
              backgroundColor: filter === f ? theme.accent + '20' : 'transparent',
              borderColor: filter === f ? theme.accent : theme.border,
            }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, { color: filter === f ? theme.accent : theme.textSecondary }]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Notifications */}
      {filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="notifications-off-outline" size={48} color={theme.textMuted} />
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>No notifications to show</Text>
        </View>
      ) : (
        filtered.map((notif, index) => (
          <NotifCard key={notif.id} notif={notif} theme={theme} index={index} />
        ))
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerCard: { margin: 16, marginTop: 8, padding: 18, borderRadius: 16, borderWidth: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 4 },
  markAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  markAllText: { fontSize: 12, fontWeight: '600' },

  filterScroll: { marginTop: 4 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '600' },

  notifCard: { marginHorizontal: 16, marginTop: 10, padding: 16, borderRadius: 14, borderWidth: 1, borderLeftWidth: 3 },
  notifTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  notifIconWrap: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  notifMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  notifTime: { fontSize: 11, fontWeight: '500' },
  notifTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  notifMessage: { fontSize: 13, lineHeight: 19 },
  unreadIndicator: { position: 'absolute', top: 16, right: 16, width: 8, height: 8, borderRadius: 4 },

  emptyWrap: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15, marginTop: 12, fontWeight: '500' },
});
