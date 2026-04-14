import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Animated, RefreshControl, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { getApiUrl } from '../api';

const { width } = Dimensions.get('window');

function AdminStatCard({ icon, label, value, color, bgColor, theme }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <View style={[styles.statIcon, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{typeof value === 'number' ? value.toLocaleString() : value}</Text>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

function ComplaintRow({ complaint, theme }) {
  const priorityColors = { critical: theme.danger, high: theme.warning, medium: theme.info, low: theme.textMuted };
  const statusColors = { open: theme.danger, in_progress: theme.warning, resolved: theme.success };
  const pColor = priorityColors[complaint.priority] || theme.info;
  const sColor = statusColors[complaint.status] || theme.info;

  return (
    <View style={[styles.complaintRow, { borderBottomColor: theme.border }]}>
      <View style={[styles.priorityDot, { backgroundColor: pColor }]} />
      <View style={styles.complaintInfo}>
        <Text style={[styles.complaintTitle, { color: theme.text }]} numberOfLines={1}>{complaint.title}</Text>
        <Text style={[styles.complaintMeta, { color: theme.textMuted }]}>{complaint.category} • {complaint.assigned_to || 'Unassigned'}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: sColor + '18' }]}>
        <Text style={[styles.statusText, { color: sColor }]}>
          {complaint.status === 'in_progress' ? 'In Progress' : complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
        </Text>
      </View>
    </View>
  );
}

function UtilizationChart({ chartData, theme }) {
  if (!chartData || chartData.length === 0) return null;
  const maxVal = Math.max(...chartData.map(d => d.utilization_percent));

  return (
    <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <Text style={[styles.chartTitle, { color: theme.text }]}>Campus Utilization (24h)</Text>
      <View style={styles.chartBars}>
        {chartData.map((d, i) => {
          const h = (d.utilization_percent / Math.max(maxVal, 1)) * 80;
          const barColor = d.utilization_percent > 70 ? theme.densityHigh : d.utilization_percent > 40 ? theme.densityMedium : theme.densityLow;
          return (
            <View key={i} style={styles.chartBarItem}>
              <View style={[styles.chartBarBg, { backgroundColor: theme.bgTertiary }]}>
                <View style={[styles.chartBarFill, { height: h, backgroundColor: barColor }]} />
              </View>
              {i % 3 === 0 && <Text style={[styles.chartBarLabel, { color: theme.textMuted }]}>{d.hour.slice(0, 2)}</Text>}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function AnomalyCard({ anomaly, theme }) {
  const severityColors = { high: theme.danger, medium: theme.warning, low: theme.info };
  const color = severityColors[anomaly.severity] || theme.info;

  return (
    <View style={[styles.anomalyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder, borderLeftColor: color }]}>
      <View style={styles.anomalyHeader}>
        <View style={[styles.anomalyIcon, { backgroundColor: color + '18' }]}>
          <Ionicons name="warning" size={16} color={color} />
        </View>
        <View style={[styles.severityBadge, { backgroundColor: color + '18' }]}>
          <Text style={[styles.severityText, { color }]}>{anomaly.severity.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={[styles.anomalyTitle, { color: theme.text }]}>{anomaly.title}</Text>
      <Text style={[styles.anomalyDesc, { color: theme.textSecondary }]} numberOfLines={2}>{anomaly.description}</Text>
      <View style={styles.anomalyFooter}>
        <View style={styles.anomalyMeta}>
          <Ionicons name="location" size={12} color={theme.textMuted} />
          <Text style={[styles.anomalyMetaText, { color: theme.textMuted }]}>{anomaly.location}</Text>
        </View>
        <Text style={[styles.anomalyConfidence, { color: theme.accent }]}>{Math.round(anomaly.ai_confidence * 100)}% conf.</Text>
      </View>
    </View>
  );
}

export default function AdminScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, usersRes, complaintsRes, anomaliesRes, chartRes] = await Promise.all([
        fetch(getApiUrl('/analytics/dashboard-stats')),
        fetch(getApiUrl('/auth/users')),
        fetch(getApiUrl('/analytics/complaints')),
        fetch(getApiUrl('/analytics/anomalies')),
        fetch(getApiUrl('/analytics/utilization-chart')),
      ]);
      const [statsData, usersData, complaintsData, anomaliesData, chartDataRes] = await Promise.all([
        statsRes.json(), usersRes.json(), complaintsRes.json(), anomaliesRes.json(), chartRes.json(),
      ]);
      setStats(statsData);
      if (usersData.users) setUsers(usersData.users);
      if (complaintsData.complaints) setComplaints(complaintsData.complaints);
      if (anomaliesData.anomalies) setAnomalies(anomaliesData.anomalies);
      if (chartDataRes.chart_data) setChartData(chartDataRes.chart_data);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchAll(); };

  if (loading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color="#fbbf24" />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading admin console...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fbbf24" />}
    >
      {/* Admin Hero */}
      <LinearGradient colors={isDark ? ['#1a1207', '#292211'] : ['#fef3c7', '#fde68a']} style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={[styles.heroLabel, { color: isDark ? '#fcd34d' : '#92400e' }]}>ADMIN CONSOLE</Text>
            <Text style={[styles.heroName, { color: isDark ? '#fff' : '#1e1b4b' }]}>Welcome, {user?.username}</Text>
          </View>
          <View style={styles.heroActions}>
            <TouchableOpacity onPress={toggleTheme} style={[styles.iconBtn, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={16} color={isDark ? '#fbbf24' : '#92400e'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={[styles.iconBtn, { backgroundColor: 'rgba(239,68,68,0.15)', marginLeft: 8 }]}>
              <Ionicons name="log-out-outline" size={16} color="#f87171" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.liveRow}>
          <View style={styles.liveDotWrap}><View style={styles.liveDot} /></View>
          <Text style={[styles.liveText, { color: isDark ? '#fcd34d' : '#92400e' }]}>System Operational • {stats?.ai_automations_today} AI actions today</Text>
        </View>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <AdminStatCard icon="people" label="Total Students" value={stats?.total_students} color="#818cf8" bgColor={theme.accentLight} theme={theme} />
        <AdminStatCard icon="flash" label="Active Now" value={stats?.active_now} color={theme.success} bgColor={theme.successBg} theme={theme} />
        <AdminStatCard icon="business" label="Rooms Free" value={stats?.rooms_available} color={theme.info} bgColor={theme.infoBg} theme={theme} />
        <AdminStatCard icon="construct" label="Open Tickets" value={stats?.pending_complaints} color={theme.warning} bgColor={theme.warningBg} theme={theme} />
      </View>

      {/* Utilization Chart */}
      <UtilizationChart chartData={chartData} theme={theme} />

      {/* Anomalies */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>AI Anomaly Detection</Text>
        <View style={[styles.countBadge, { backgroundColor: theme.dangerBg }]}>
          <Text style={[styles.countText, { color: theme.danger }]}>{anomalies.length}</Text>
        </View>
      </View>
      {anomalies.map(a => <AnomalyCard key={a.id} anomaly={a} theme={theme} />)}

      {/* Complaints */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Complaint Tickets</Text>
        <View style={[styles.countBadge, { backgroundColor: theme.warningBg }]}>
          <Text style={[styles.countText, { color: theme.warning }]}>{complaints.filter(c => c.status !== 'resolved').length}</Text>
        </View>
      </View>
      <View style={[styles.complaintsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        {complaints.map(c => <ComplaintRow key={c.id} complaint={c} theme={theme} />)}
      </View>

      {/* Users */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Registered Users</Text>
        <View style={[styles.countBadge, { backgroundColor: theme.accentLight }]}>
          <Text style={[styles.countText, { color: theme.accent }]}>{users.length}</Text>
        </View>
      </View>
      <View style={[styles.usersCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        {users.map(u => (
          <View key={u.id} style={[styles.userRow, { borderBottomColor: theme.border }]}>
            <View style={[styles.userAvatar, { backgroundColor: u.role === 'admin' ? '#fbbf24' + '18' : theme.accentLight }]}>
              <Ionicons name={u.role === 'admin' ? 'shield' : 'person'} size={16} color={u.role === 'admin' ? '#fbbf24' : theme.accent} />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.text }]}>{u.username}</Text>
              <Text style={[styles.userId, { color: theme.textMuted }]}>ID: {u.id}</Text>
            </View>
            <View style={[styles.roleBadge, { backgroundColor: u.role === 'admin' ? '#fbbf24' + '18' : theme.accentLight }]}>
              <Text style={[styles.roleText, { color: u.role === 'admin' ? '#fbbf24' : theme.accent }]}>{u.role.toUpperCase()}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 15 },

  // Hero
  hero: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  heroName: { fontSize: 24, fontWeight: '800', marginTop: 4 },
  heroActions: { flexDirection: 'row' },
  iconBtn: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  liveRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  liveDotWrap: { marginRight: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34d399' },
  liveText: { fontSize: 12, fontWeight: '600' },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginTop: 16, gap: 8 },
  statCard: { width: (width - 40) / 2, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  statIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 2 },

  // Chart
  chartCard: { marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 16, borderWidth: 1 },
  chartTitle: { fontSize: 15, fontWeight: '700', marginBottom: 14 },
  chartBars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 90 },
  chartBarItem: { alignItems: 'center', flex: 1 },
  chartBarBg: { width: 8, height: 80, borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  chartBarFill: { width: '100%', borderRadius: 4 },
  chartBarLabel: { fontSize: 8, marginTop: 4 },

  // Sections
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 20, marginBottom: 10, gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  countText: { fontSize: 12, fontWeight: '800' },

  // Anomalies
  anomalyCard: { marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 14, borderWidth: 1, borderLeftWidth: 3 },
  anomalyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  anomalyIcon: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  severityText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  anomalyTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  anomalyDesc: { fontSize: 12, lineHeight: 17 },
  anomalyFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' },
  anomalyMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  anomalyMetaText: { fontSize: 11 },
  anomalyConfidence: { fontSize: 11, fontWeight: '700' },

  // Complaints
  complaintsCard: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  complaintRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 0.5 },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  complaintInfo: { flex: 1 },
  complaintTitle: { fontSize: 14, fontWeight: '600' },
  complaintMeta: { fontSize: 11, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },

  // Users
  usersCard: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  userRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 0.5 },
  userAvatar: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 14, fontWeight: '600' },
  userId: { fontSize: 11, marginTop: 2 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  roleText: { fontSize: 10, fontWeight: '800' },
});
