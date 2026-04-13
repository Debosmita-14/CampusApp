import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getApiUrl } from '../api';

export default function BookingsScreen() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);

  const fetchRooms = () => {
    setLoading(true);
    fetch(getApiUrl('/bookings/rooms'))
      .then(res => res.json())
      .then(data => {
        if(data.rooms) setRooms(data.rooms);
        setLoading(false);
      })
      .catch(err => {
        console.error("Backend connection error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleBookRoom = (roomId, roomName) => {
    setBookingId(roomId);
    fetch(getApiUrl(`/bookings/book/${roomId}`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(data => {
        setBookingId(null);
        if (data.error) {
          Alert.alert('Booking Failed', data.error);
        } else {
          Alert.alert('Success!', `${roomName} has been booked successfully!`);
          // Update the room locally to reflect the change
          setRooms(prev => prev.map(room => 
            room.id === roomId ? { ...room, available: false } : room
          ));
        }
      })
      .catch(err => {
        setBookingId(null);
        Alert.alert('Error', 'Could not connect to the server. Please try again.');
        console.error("Booking error:", err);
      });
  };

  const renderRoom = ({ item }) => (
    <View style={styles.roomCard}>
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{item.name}</Text>
        <Text style={styles.roomCapacity}>Capacity: {item.capacity} people</Text>
        <Text style={[styles.statusText, item.available ? styles.statusAvailable : styles.statusReserved]}>
          {item.available ? '● Available' : '● Reserved'}
        </Text>
      </View>
      <TouchableOpacity 
        style={[styles.bookButton, !item.available && styles.bookButtonDisabled]}
        disabled={!item.available || bookingId === item.id}
        onPress={() => handleBookRoom(item.id, item.name)}
      >
        {bookingId === item.id ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.bookButtonText}>{item.available ? 'Book Now' : 'Reserved'}</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Available Rooms</Text>
        <TouchableOpacity onPress={fetchRooms} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 50 }} />
      ) : rooms.length === 0 ? (
        <Text style={styles.emptyText}>No rooms available at the moment.</Text>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={renderRoom}
          contentContainerStyle={{ paddingBottom: 20 }}
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
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  roomCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  roomCapacity: {
    color: '#94a3b8',
    marginTop: 5,
  },
  statusText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  statusAvailable: {
    color: '#10b981',
  },
  statusReserved: {
    color: '#ef4444',
  },
  bookButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#475569',
  },
  bookButtonText: {
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
