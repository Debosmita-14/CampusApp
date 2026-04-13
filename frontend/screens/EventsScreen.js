import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getApiUrl } from '../api';
import { useAuth } from '../AuthContext';

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  
  // Admin Add Event state
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
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
        console.error("Backend connection error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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
      Alert.alert('Missing Info', 'Please fill in all fields (Title, Date, Location).');
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
        if (data.event) {
          setEvents(prev => [...prev, data.event]);
        }
        setModalVisible(false);
        setFormData({ title: '', date: '', location: '' });
        Alert.alert('Success!', 'New event has been added.');
      })
      .catch(err => {
        setSubmitting(false);
        Alert.alert('Error', 'Could not add event. Please try again.');
        console.error("Event error:", err);
      });
  };

  const renderEvent = ({ item }) => {
    const formattedDate = new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const isRegistered = registeredEvents.includes(item.id);
    return (
      <View style={styles.card}>
        <View style={styles.dateBox}>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventLocation}>📍 {item.location}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.regButton, isRegistered && styles.regButtonDone]}
          onPress={() => handleRSVP(item.id, item.title)}
          disabled={isRegistered || registeringId === item.id}
        >
          {registeringId === item.id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.regButtonText}>{isRegistered ? '✓ Going' : 'RSVP'}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Upcoming Events</Text>
        {isAdmin && (
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>+ Create Event</Text>
          </TouchableOpacity>
        )}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 50 }} />
      ) : events.length === 0 ? (
        <Text style={styles.emptyText}>No upcoming events at the moment.</Text>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEvent}
        />
      )}

      {/* Add Event Modal (Admin Only) */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Event</Text>

            <TextInput
              style={styles.input}
              placeholder="Event Title"
              placeholderTextColor="#64748b"
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor="#64748b"
              value={formData.date}
              onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              placeholderTextColor="#64748b"
              value={formData.location}
              onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleAddEvent} disabled={submitting}>
                {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitButtonText}>Add Event</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dateBox: {
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 10,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: 65,
  },
  dateText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventLocation: {
    color: '#94a3b8',
    fontSize: 12,
  },
  regButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  regButtonDone: {
    backgroundColor: '#10b981',
  },
  regButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#475569',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    color: '#fff',
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#475569',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#fff', fontWeight: 'bold' },
  submitButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontWeight: 'bold' },
});
