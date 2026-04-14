import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { getApiUrl } from '../api';

function SuggestionCard({ item, theme, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay: index * 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay: index * 120, useNativeDriver: true }),
    ]).start();
  }, []);

  const typeConfig = {
    room_swap: { icon: 'swap-horizontal', color: '#818cf8', label: 'Room Optimization' },
    time_shift: { icon: 'time', color: '#34d399', label: 'Time Adjustment' },
    auto_booking: { icon: 'calendar', color: '#f472b6', label: 'Auto Booking' },
  };

  const impactConfig = {
    high: { color: theme.success, label: 'High Impact' },
    medium: { color: theme.warning, label: 'Medium Impact' },
    low: { color: theme.textMuted, label: 'Low Impact' },
  };

  const tc = typeConfig[item.type] || typeConfig.room_swap;
  const ic = impactConfig[item.impact] || impactConfig.medium;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={[styles.suggCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.suggHeader}>
          <View style={[styles.suggIconWrap, { backgroundColor: tc.color + '18' }]}>
            <Ionicons name={tc.icon} size={22} color={tc.color} />
          </View>
          <View style={styles.suggBadges}>
            <View style={[styles.typeBadge, { backgroundColor: tc.color + '18' }]}>
              <Text style={[styles.typeLabel, { color: tc.color }]}>{tc.label}</Text>
            </View>
            <View style={[styles.impactBadge, { backgroundColor: ic.color + '18' }]}>
              <Text style={[styles.impactLabel, { color: ic.color }]}>{ic.label}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.suggTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.suggDesc, { color: theme.textSecondary }]}>{item.description}</Text>

        <View style={[styles.suggStats, { borderTopColor: theme.border }]}>
          <View style={styles.suggStatItem}>
            <Ionicons name="trending-up" size={14} color={theme.success} />
            <Text style={[styles.suggStatText, { color: theme.textSecondary }]}>{item.savings}</Text>
          </View>
          <View style={styles.suggStatItem}>
            <Ionicons name="analytics" size={14} color={theme.accent} />
            <Text style={[styles.suggStatText, { color: theme.textSecondary }]}>{Math.round(item.confidence * 100)}% confidence</Text>
          </View>
        </View>

        <View style={styles.suggActions}>
          <TouchableOpacity style={[styles.applyBtn, { backgroundColor: theme.accent }]}>
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dismissBtn, { backgroundColor: theme.bgTertiary }]}>
            <Text style={[styles.dismissText, { color: theme.textSecondary }]}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

function PredictionRow({ pred, theme }) {
  const maxPercent = Math.max(...pred.predictions.map(p => p.predicted_percent));
  const peakHour = pred.peak_prediction;
  const barColor = maxPercent > 80 ? theme.densityHigh : maxPercent > 50 ? theme.densityMedium : theme.densityLow;

  return (
    <View style={[styles.predCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <View style={styles.predHeader}>
        <Text style={[styles.predName, { color: theme.text }]}>{pred.zone_name}</Text>
        <View style={[styles.peakBadge, { backgroundColor: barColor + '18' }]}>
          <Text style={[styles.peakText, { color: barColor }]}>Peak: {peakHour.hour}</Text>
        </View>
      </View>

      <View style={styles.predBars}>
        {pred.predictions.map((p, i) => (
          <View key={i} style={styles.predBarItem}>
            <View style={[styles.predBarBg, { backgroundColor: theme.bgTertiary }]}>
              <View style={[styles.predBarFill, {
                height: `${Math.min(p.predicted_percent, 100)}%`,
                backgroundColor: p.predicted_percent > 80 ? theme.densityHigh : p.predicted_percent > 50 ? theme.densityMedium : theme.densityLow,
              }]} />
            </View>
            <Text style={[styles.predBarLabel, { color: theme.textMuted }]}>{p.hour.slice(0, 2)}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.predRecommendation, { color: theme.textSecondary }]}>{pred.recommendation}</Text>
    </View>
  );
}

export default function SmartScheduleScreen() {
  const { theme } = useTheme();
  const [suggestions, setSuggestions] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('suggestions');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [suggRes, predRes] = await Promise.all([
        fetch(getApiUrl('/analytics/smart-schedule')),
        fetch(getApiUrl('/analytics/predictions')),
      ]);
      const suggData = await suggRes.json();
      const predData = await predRes.json();
      if (suggData.suggestions) setSuggestions(suggData.suggestions);
      if (predData.predictions) setPredictions(predData.predictions);
    } catch (err) {
      console.error('SmartSchedule fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  if (loading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>AI is analyzing patterns...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
    >
      {/* AI Header */}
      <View style={[styles.aiHeader, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={[styles.aiIconWrap, { backgroundColor: theme.accentLight }]}>
          <Ionicons name="sparkles" size={24} color={theme.accent} />
        </View>
        <Text style={[styles.aiTitle, { color: theme.text }]}>Smart Scheduler</Text>
        <Text style={[styles.aiSub, { color: theme.textSecondary }]}>AI-powered recommendations based on usage patterns, demand analysis, and historical data</Text>
        <View style={styles.modelBadge}>
          <Ionicons name="hardware-chip" size={12} color={theme.accent} />
          <Text style={[styles.modelText, { color: theme.accent }]}>CampusAI v2.1</Text>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={[styles.tabBar, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.tab, tab === 'suggestions' && { backgroundColor: theme.accent }]}
          onPress={() => setTab('suggestions')}
        >
          <Ionicons name="bulb" size={16} color={tab === 'suggestions' ? '#fff' : theme.textSecondary} />
          <Text style={[styles.tabText, { color: tab === 'suggestions' ? '#fff' : theme.textSecondary }]}>Suggestions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'predictions' && { backgroundColor: theme.accent }]}
          onPress={() => setTab('predictions')}
        >
          <Ionicons name="trending-up" size={16} color={tab === 'predictions' ? '#fff' : theme.textSecondary} />
          <Text style={[styles.tabText, { color: tab === 'predictions' ? '#fff' : theme.textSecondary }]}>Predictions</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {tab === 'suggestions' ? (
        suggestions.map((item, index) => (
          <SuggestionCard key={item.id} item={item} theme={theme} index={index} />
        ))
      ) : (
        predictions.slice(0, 6).map((pred) => (
          <PredictionRow key={pred.zone_id} pred={pred} theme={theme} />
        ))
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 15 },

  // AI Header
  aiHeader: { margin: 16, padding: 20, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  aiIconWrap: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  aiTitle: { fontSize: 22, fontWeight: '800' },
  aiSub: { fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 19, paddingHorizontal: 10 },
  modelBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 5 },
  modelText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  // Tab Bar
  tabBar: { marginHorizontal: 16, flexDirection: 'row', borderRadius: 12, padding: 4, borderWidth: 1, marginBottom: 8 },
  tab: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
  tabText: { fontSize: 14, fontWeight: '600' },

  // Suggestion Cards
  suggCard: { marginHorizontal: 16, marginTop: 12, padding: 18, borderRadius: 16, borderWidth: 1 },
  suggHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  suggIconWrap: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  suggBadges: { flexDirection: 'row', gap: 6 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeLabel: { fontSize: 10, fontWeight: '700' },
  impactBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  impactLabel: { fontSize: 10, fontWeight: '700' },
  suggTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  suggDesc: { fontSize: 13, lineHeight: 19 },
  suggStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 0.5 },
  suggStatItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  suggStatText: { fontSize: 12, fontWeight: '500' },
  suggActions: { flexDirection: 'row', marginTop: 14, gap: 10 },
  applyBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 10, gap: 5 },
  applyText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  dismissBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  dismissText: { fontWeight: '600', fontSize: 14 },

  // Prediction Cards
  predCard: { marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  predHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  predName: { fontSize: 15, fontWeight: '700' },
  peakBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  peakText: { fontSize: 10, fontWeight: '700' },
  predBars: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 60 },
  predBarItem: { alignItems: 'center' },
  predBarBg: { width: 20, height: 50, borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  predBarFill: { width: '100%', borderRadius: 4 },
  predBarLabel: { fontSize: 9, marginTop: 4, fontWeight: '500' },
  predRecommendation: { fontSize: 12, marginTop: 12, lineHeight: 17, fontStyle: 'italic' },
});
