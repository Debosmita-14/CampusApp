import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { getApiUrl } from '../api';

export default function LostFoundScreen() {
  const { theme } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({ type: 'lost', title: '', location: '' });

  const fetchItems = () => {
    setLoading(true);
    fetch(getApiUrl('/lost-found/'))
      .then(res => res.json())
      .then(data => {
        if (data.items) setItems(data.items);
        setLoading(false);
      })
      .catch(err => {
        console.error('Backend connection error:', err);
        setLoading(false);
      });
  };

  useEffect(() => { fetchItems(); }, []);

  const handleReport = () => {
    if (!formData.title.trim() || !formData.location.trim()) {
      Alert.alert('Missing Info', 'Please fill in both the item name and location.');
      return;
    }
    setSubmitting(true);
    fetch(getApiUrl('/lost-found/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: formData.type,
        title: formData.title,
        location: formData.location,
        date: new Date().toISOString().split('T')[0],
      }),
    })
      .then(res => res.json())
      .then(data => {
        setSubmitting(false);
        if (data.item) setItems(prev => [data.item, ...prev]);
        setModalVisible(false);
        setFormData({ type: 'lost', title: '', location: '' });
        Alert.alert('Success!', 'Your report has been submitted.');
      })
      .catch(err => {
        setSubmitting(false);
        Alert.alert('Error', 'Could not submit report.');
      });
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);

  const renderItem = ({ item, index }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <View style={styles.cardTop}>
        <View style={[styles.typeBadge, {
          backgroundColor: item.type === 'lost' ? theme.dangerBg : theme.successBg,
          borderColor: (item.type === 'lost' ? theme.danger : theme.success) + '30',
        }]}>
          <Ionicons name={item.type === 'lost' ? 'alert-circle' : 'checkmark-circle'} size={12}
            color={item.type === 'lost' ? theme.danger : theme.success} />
          <Text style={[styles.typeBadgeText, { color: item.type === 'lost' ? theme.danger : theme.success }]}>
            {item.type.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.dateText, { color: theme.textMuted }]}>{item.date}</Text>
      </View>
      <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
      <View style={styles.locationRow}>
        <Ionicons name="location" size={14} color={theme.textMuted} />
        <Text style={[styles.locationText, { color: theme.textSecondary }]}>{item.location}</Text>
      </View>
    </View>
  );

  const filters = ['all', 'lost', 'found'];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View>
          <Text style={[styles.header, { color: theme.text }]}>Lost & Found</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
            {items.filter(i => i.type === 'lost').length} lost • {items.filter(i => i.type === 'found').length} found
          </Text>
        </View>
        <TouchableOpacity style={[styles.reportBtn, { backgroundColor: theme.accent }]} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.reportBtnText}>Report</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
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
      </View>

      {loading ? (
        <View style={styles.loadingWrap}><ActivityIndicator size="large" color={theme.accent} /></View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="search-outline" size={48} color={theme.textMuted} />
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>No items reported yet</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Report Modal */}
      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: theme.text }]}>Report an Item</Text>

            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, formData.type === 'lost' && { backgroundColor: theme.dangerBg, borderColor: theme.danger }]}
                onPress={() => setFormData(prev => ({ ...prev, type: 'lost' }))}
              >
                <Ionicons name="alert-circle" size={16} color={formData.type === 'lost' ? theme.danger : theme.textMuted} />
                <Text style={[styles.typeBtnText, { color: formData.type === 'lost' ? theme.danger : theme.textMuted }]}>Lost</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, formData.type === 'found' && { backgroundColor: theme.successBg, borderColor: theme.success }]}
                onPress={() => setFormData(prev => ({ ...prev, type: 'found' }))}
              >
                <Ionicons name="checkmark-circle" size={16} color={formData.type === 'found' ? theme.success : theme.textMuted} />
                <Text style={[styles.typeBtnText, { color: formData.type === 'found' ? theme.success : theme.textMuted }]}>Found</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
              placeholder="Item name (e.g., Blue Water Bottle)"
              placeholderTextColor={theme.textMuted}
              value={formData.title}
              onChangeText={text => setFormData(prev => ({ ...prev, title: text }))}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
              placeholder="Location (e.g., Library 2nd Floor)"
              placeholderTextColor={theme.textMuted}
              value={formData.location}
              onChangeText={text => setFormData(prev => ({ ...prev, location: text }))}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: theme.bgTertiary }]} onPress={() => {
                setModalVisible(false);
                setFormData({ type: 'lost', title: '', location: '' });
              }}>
                <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.accent }]} onPress={handleReport} disabled={submitting}>
                {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitText}>Submit Report</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerCard: { marginHorizontal: 16, marginTop: 8, padding: 16, borderRadius: 16, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  header: { fontSize: 22, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 2 },
  reportBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, gap: 4 },
  reportBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 12, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '600' },

  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 },
  card: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, gap: 4 },
  typeBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  dateText: { fontSize: 12 },
  itemTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  locationText: { fontSize: 13 },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15, marginTop: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#94a3b8', alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 18, textAlign: 'center' },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: 'transparent', gap: 6 },
  typeBtnText: { fontWeight: '700', fontSize: 15 },
  input: { borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, fontSize: 15 },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  cancelText: { fontWeight: '700', fontSize: 15 },
  submitBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
