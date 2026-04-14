import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { getApiUrl } from '../api';

const ZONE_ICONS = {
  library: 'book',
  lab: 'flask',
  common: 'cafe',
  academic: 'school',
  events: 'megaphone',
  sports: 'football',
  dining: 'restaurant',
  admin: 'shield',
};

function ZoneCard({ zone, theme, onPress }) {
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const densityColor = zone.density === 'low' ? theme.densityLow : zone.density === 'medium' ? theme.densityMedium : theme.densityHigh;
  const densityLabel = zone.density === 'low' ? 'Low' : zone.density === 'medium' ? 'Moderate' : 'Crowded';
  const icon = ZONE_ICONS[zone.type] || 'location';

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.zoneCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
      >
        <View style={styles.zoneHeader}>
          <View style={[styles.zoneIconWrap, { backgroundColor: densityColor + '18' }]}>
            <Ionicons name={icon} size={22} color={densityColor} />
          </View>
          <View style={[styles.densityBadge, { backgroundColor: densityColor + '20', borderColor: densityColor + '40' }]}>
            <View style={[styles.densityDot, { backgroundColor: densityColor }]} />
            <Text style={[styles.densityText, { color: densityColor }]}>{densityLabel}</Text>
          </View>
        </View>

        <Text style={[styles.zoneName, { color: theme.text }]}>{zone.name}</Text>
        <Text style={[styles.zoneType, { color: theme.textMuted }]}>{zone.type.charAt(0).toUpperCase() + zone.type.slice(1)}</Text>

        <View style={styles.zoneStats}>
          <View style={styles.zoneStatItem}>
            <Text style={[styles.zoneStatValue, { color: theme.text }]}>{zone.current_occupancy}</Text>
            <Text style={[styles.zoneStatLabel, { color: theme.textMuted }]}>Current</Text>
          </View>
          <View style={[styles.zoneStatDivider, { backgroundColor: theme.border }]} />
          <View style={styles.zoneStatItem}>
            <Text style={[styles.zoneStatValue, { color: theme.text }]}>{zone.capacity}</Text>
            <Text style={[styles.zoneStatLabel, { color: theme.textMuted }]}>Capacity</Text>
          </View>
          <View style={[styles.zoneStatDivider, { backgroundColor: theme.border }]} />
          <View style={styles.zoneStatItem}>
            <Text style={[styles.zoneStatValue, { color: densityColor }]}>{zone.occupancy_percent}%</Text>
            <Text style={[styles.zoneStatLabel, { color: theme.textMuted }]}>Full</Text>
          </View>
        </View>

        {/* Occupancy bar */}
        <View style={[styles.barBg, { backgroundColor: theme.bgTertiary }]}>
          <View style={[styles.barFill, { width: `${Math.min(zone.occupancy_percent, 100)}%`, backgroundColor: densityColor }]} />
        </View>

        {/* Mini trend */}
        {zone.trend && zone.trend.length > 0 && (
          <View style={styles.trendRow}>
            {zone.trend.map((t, i) => (
              <View key={i} style={styles.trendItem}>
                <View style={[styles.trendBar, {
                  height: Math.max(4, (t.count / zone.capacity) * 28),
                  backgroundColor: densityColor + '60',
                }]} />
                <Text style={[styles.trendLabel, { color: theme.textMuted }]}>{t.hour.slice(0, 2)}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LiveMapScreen() {
  const { theme } = useTheme();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedZone, setSelectedZone] = useState(null);

  useEffect(() => {
    fetchOccupancy();
    const interval = setInterval(fetchOccupancy, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchOccupancy = async () => {
    try {
      const res = await fetch(getApiUrl('/analytics/live-occupancy'));
      const data = await res.json();
      if (data.zones) setZones(data.zones);
    } catch (err) {
      console.error('Occupancy fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchOccupancy(); };

  const types = ['all', ...new Set(zones.map(z => z.type))];
  const filteredZones = filter === 'all' ? zones : zones.filter(z => z.type === filter);

  const totalOccupied = zones.reduce((sum, z) => sum + z.current_occupancy, 0);
  const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
  const overallPercent = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  if (loading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading live data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
    >
      {/* Overview card */}
      <View style={[styles.overviewCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.overviewRow}>
          <View>
            <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Campus Occupancy</Text>
            <Text style={[styles.overviewValue, { color: theme.text }]}>{totalOccupied.toLocaleString()} <Text style={[styles.overviewTotal, { color: theme.textMuted }]}>/ {totalCapacity.toLocaleString()}</Text></Text>
          </View>
          <View style={styles.overviewRight}>
            <Text style={[styles.overviewPercent, { color: overallPercent > 70 ? theme.densityHigh : overallPercent > 40 ? theme.densityMedium : theme.densityLow }]}>
              {overallPercent}%
            </Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={[styles.liveLabel, { color: theme.success }]}>LIVE</Text>
            </View>
          </View>
        </View>
        <View style={[styles.overviewBar, { backgroundColor: theme.bgTertiary }]}>
          <View style={[styles.overviewBarFill, {
            width: `${Math.min(overallPercent, 100)}%`,
            backgroundColor: overallPercent > 70 ? theme.densityHigh : overallPercent > 40 ? theme.densityMedium : theme.densityLow,
          }]} />
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {types.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.filterChip, filter === type && { backgroundColor: theme.accent + '20', borderColor: theme.accent }]}
            onPress={() => setFilter(type)}
          >
            <Text style={[styles.filterText, { color: filter === type ? theme.accent : theme.textSecondary }]}>
              {type === 'all' ? '🏫 All' : (ZONE_ICONS[type] ? `${type.charAt(0).toUpperCase() + type.slice(1)}` : type)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Zone Cards */}
      <View style={styles.zonesGrid}>
        {filteredZones.map(zone => (
          <ZoneCard
            key={zone.id}
            zone={zone}
            theme={theme}
            onPress={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
          />
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

  // Overview
  overviewCard: { margin: 16, padding: 18, borderRadius: 16, borderWidth: 1 },
  overviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  overviewLabel: { fontSize: 13, fontWeight: '500' },
  overviewValue: { fontSize: 24, fontWeight: '800', marginTop: 4 },
  overviewTotal: { fontSize: 16, fontWeight: '500' },
  overviewRight: { alignItems: 'flex-end' },
  overviewPercent: { fontSize: 28, fontWeight: '800' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34d399', marginRight: 5 },
  liveLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  overviewBar: { height: 6, borderRadius: 3, marginTop: 14, overflow: 'hidden' },
  overviewBarFill: { height: '100%', borderRadius: 3 },

  // Filters
  filterScroll: { marginTop: 4 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'transparent' },
  filterText: { fontSize: 13, fontWeight: '600' },

  // Zone Cards
  zonesGrid: { paddingHorizontal: 16, marginTop: 12, gap: 12 },
  zoneCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
  zoneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  zoneIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  densityBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  densityDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  densityText: { fontSize: 11, fontWeight: '700' },
  zoneName: { fontSize: 16, fontWeight: '700' },
  zoneType: { fontSize: 12, marginTop: 2, textTransform: 'capitalize' },
  zoneStats: { flexDirection: 'row', marginTop: 14, justifyContent: 'space-around' },
  zoneStatItem: { alignItems: 'center' },
  zoneStatValue: { fontSize: 18, fontWeight: '800' },
  zoneStatLabel: { fontSize: 10, marginTop: 2, fontWeight: '500' },
  zoneStatDivider: { width: 1, height: 30 },
  barBg: { height: 5, borderRadius: 3, marginTop: 14, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },

  // Mini trend
  trendRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 14, alignItems: 'flex-end' },
  trendItem: { alignItems: 'center' },
  trendBar: { width: 14, borderRadius: 3, marginBottom: 4 },
  trendLabel: { fontSize: 9, fontWeight: '500' },
});
