import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getApiUrl } from '../api';

export default function BookingsScreen() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  useEffect(() => {
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
  }, []);

  const renderRoom = ({ item }) => (
    <View style={styles.roomCard}>
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{item.name}</Text>
        <Text style={styles.roomCapacity}>Capacity: {item.capacity} people</Text>
      </View>
      <TouchableOpacity 
        style={[styles.bookButton, !item.available && styles.bookButtonDisabled]}
        disabled={!item.available}
      >
        <Text style={styles.bookButtonText}>{item.available ? 'Book Now' : 'Reserved'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Rooms</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 50 }} />
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
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
  bookButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookButtonDisabled: {
    backgroundColor: '#475569',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
