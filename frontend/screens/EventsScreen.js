import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { getApiUrl } from '../api';

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);

  useEffect(() => {
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
        console.error("RSVP error:", err);
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
    <View style={styles.container}>
      <Text style={styles.header}>Upcoming Events</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
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
});
