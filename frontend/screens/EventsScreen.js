import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { getApiUrl } from '../api';
import { useAuth } from '../AuthContext';

export default function EventsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', location: '' });

  const fetchEvents = () => {
    fetch(getApiUrl('/events/'))
      .then(res => res.json())
      .then(data => {
        if (data.events) setEvents(data.events);
        setLoading(false);
      })
      .catch(err => {
        console.error('Backend connection error:', err);
        setLoading(false);
      });
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleRSVP = (eventId, eventTitle) => {
    setRegisteringId(eventId);
    fetch(getApiUrl(`/events/${eventId}/register`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(data => {
        setRegisteringId(null);
        setRegisteredEvents(prev => [...prev, eventId]);
        Alert.alert('RSVP Confirmed!', `You have registered for "${eventTitle}"`);
      })
      .catch(err => {
        setRegisteringId(null);
        Alert.alert('Error', 'Could not register. Please try again.');
      });
  };

  const handleAddEvent = () => {
    if (!formData.title.trim() || !formData.date.trim() || !formData.location.trim()) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    fetch(getApiUrl('/events/add'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then(res => res.json())
      .then(data => {
        setSubmitting(false);
        if (data.event) setEvents(prev => [...prev, data.event]);
        setModalVisible(false);
        setFormData({ title: '', date: '', location: '' });
        Alert.alert('Success!', 'New event has been added.');
      })
      .catch(err => {
        setSubmitting(false);
        Alert.alert('Error', 'Could not add event.');
      });
  };

  const renderEvent = ({ item, index }) => {
    const formattedDate = new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const isRegistered = registeredEvents.includes(item.id);
    const dayNum = new Date(item.date).getDate();
    const monthStr = new Date(item.date).toLocaleDateString(undefined, { month: 'short' });

    return (
      <View style={[styles.eventCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={[styles.dateBlock, { backgroundColor: theme.accentLight }]}>
          <Text style={[styles.dateDay, { color: theme.accent }]}>{dayNum}</Text>
          <Text style={[styles.dateMonth, { color: theme.accent }]}>{monthStr}</Text>
        </View>
        <View style={styles.eventInfo}>
          <Text style={[styles.eventTitle, { color: theme.text }]}>{item.title}</Text>
          <View style={styles.eventMeta}>
            <Ionicons name="location" size={12} color={theme.textMuted} />
            <Text style={[styles.eventLocation, { color: theme.textMuted }]}>{item.location}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.rsvpBtn, {
            backgroundColor: isRegistered ? theme.successBg : theme.accent,
            borderColor: isRegistered ? theme.success : 'transparent',
            borderWidth: isRegistered ? 1 : 0,
          }]}
          onPress={() => handleRSVP(item.id, item.title)}
          disabled={isRegistered || registeringId === item.id}
        >
          {registeringId === item.id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : isRegistered ? (
            <>
              <Ionicons name="checkmark" size={14} color={theme.success} />
              <Text style={[styles.rsvpText, { color: theme.success }]}>Going</Text>
            </>
          ) : (
            <Text style={styles.rsvpText}>RSVP</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View>
          <Text style={[styles.header, { color: theme.text }]}>Campus Events</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>{events.length} upcoming events</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.accent }]} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addBtnText}>Create</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingWrap}><ActivityIndicator size="large" color={theme.accent} /></View>
      ) : events.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="calendar-outline" size={48} color={theme.textMuted} />
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>No upcoming events</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => item.id}
          renderItem={renderEvent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Event Modal */}
      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: theme.text }]}>Create Event</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
              placeholder="Event Title"
              placeholderTextColor={theme.textMuted}
              value={formData.title}
              onChangeText={text => setFormData(prev => ({ ...prev, title: text }))}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor={theme.textMuted}
              value={formData.date}
              onChangeText={text => setFormData(prev => ({ ...prev, date: text }))}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
              placeholder="Location"
              placeholderTextColor={theme.textMuted}
              value={formData.location}
              onChangeText={text => setFormData(prev => ({ ...prev, location: text }))}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: theme.bgTertiary }]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.accent }]} onPress={handleAddEvent} disabled={submitting}>
                {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitText}>Create Event</Text>}
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
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, gap: 4 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 },
  eventCard: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  dateBlock: { width: 52, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  dateDay: { fontSize: 20, fontWeight: '800' },
  dateMonth: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventLocation: { fontSize: 12 },
  rsvpBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, gap: 4 },
  rsvpText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15, marginTop: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#94a3b8', alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 18, textAlign: 'center' },
  input: { borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, fontSize: 15 },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  cancelText: { fontWeight: '700', fontSize: 15 },
  submitBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
