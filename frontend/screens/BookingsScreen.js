import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { getApiUrl } from '../api';

export default function BookingsScreen() {
  const { theme } = useTheme();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);

  const fetchRooms = () => {
    setLoading(true);
    fetch(getApiUrl('/bookings/rooms'))
      .then(res => res.json())
      .then(data => {
        if (data.rooms) setRooms(data.rooms);
        setLoading(false);
      })
      .catch(err => {
        console.error('Backend connection error:', err);
        setLoading(false);
      });
  };

  useEffect(() => { fetchRooms(); }, []);

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
          setRooms(prev => prev.map(room =>
            room.id === roomId ? { ...room, available: false } : room
          ));
        }
      })
      .catch(err => {
        setBookingId(null);
        Alert.alert('Error', 'Could not connect to the server.');
        console.error('Booking error:', err);
      });
  };

  const renderRoom = ({ item, index }) => {
    const fadeAnim = new Animated.Value(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 60, useNativeDriver: true }).start();

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={[styles.roomCard, {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
          borderLeftColor: item.available ? theme.success : theme.danger,
        }]}>
          <View style={styles.roomLeft}>
            <View style={[styles.roomIconWrap, { backgroundColor: item.available ? theme.successBg : theme.dangerBg }]}>
              <Ionicons name={item.available ? 'business' : 'lock-closed'} size={20} color={item.available ? theme.success : theme.danger} />
            </View>
            <View style={styles.roomInfo}>
              <Text style={[styles.roomName, { color: theme.text }]}>{item.name}</Text>
              <View style={styles.roomMeta}>
                <Ionicons name="people" size={12} color={theme.textMuted} />
                <Text style={[styles.roomCapacity, { color: theme.textMuted }]}>{item.capacity} seats</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.available ? theme.successBg : theme.dangerBg }]}>
                <View style={[styles.statusDot, { backgroundColor: item.available ? theme.success : theme.danger }]} />
                <Text style={[styles.statusText, { color: item.available ? theme.success : theme.danger }]}>
                  {item.available ? 'Available' : 'Reserved'}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.bookButton, {
              backgroundColor: item.available ? theme.accent : theme.bgTertiary,
              opacity: item.available ? 1 : 0.5,
            }]}
            disabled={!item.available || bookingId === item.id}
            onPress={() => handleBookRoom(item.id, item.name)}
          >
            {bookingId === item.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name={item.available ? 'checkmark-circle' : 'close-circle'} size={16} color="#fff" />
                <Text style={styles.bookButtonText}>{item.available ? 'Book' : 'Full'}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View>
          <Text style={[styles.header, { color: theme.text }]}>Room Bookings</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
            {rooms.filter(r => r.available).length} of {rooms.length} rooms available
          </Text>
        </View>
        <TouchableOpacity onPress={fetchRooms} style={[styles.refreshButton, { backgroundColor: theme.accentLight }]}>
          <Ionicons name="refresh" size={18} color={theme.accent} />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={[styles.quickStat, { backgroundColor: theme.successBg, borderColor: theme.success + '30' }]}>
          <Text style={[styles.quickStatValue, { color: theme.success }]}>{rooms.filter(r => r.available).length}</Text>
          <Text style={[styles.quickStatLabel, { color: theme.success }]}>Free</Text>
        </View>
        <View style={[styles.quickStat, { backgroundColor: theme.dangerBg, borderColor: theme.danger + '30' }]}>
          <Text style={[styles.quickStatValue, { color: theme.danger }]}>{rooms.filter(r => !r.available).length}</Text>
          <Text style={[styles.quickStatLabel, { color: theme.danger }]}>Booked</Text>
        </View>
        <View style={[styles.quickStat, { backgroundColor: theme.infoBg, borderColor: theme.info + '30' }]}>
          <Text style={[styles.quickStatValue, { color: theme.info }]}>{rooms.length}</Text>
          <Text style={[styles.quickStatLabel, { color: theme.info }]}>Total</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : rooms.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="business-outline" size={48} color={theme.textMuted} />
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>No rooms available at the moment</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={item => item.id}
          renderItem={renderRoom}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerCard: { marginHorizontal: 16, marginTop: 8, padding: 16, borderRadius: 16, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  header: { fontSize: 22, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 2 },
  refreshButton: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  quickStats: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, gap: 10 },
  quickStat: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  quickStatValue: { fontSize: 20, fontWeight: '800' },
  quickStatLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 },
  roomCard: { padding: 16, borderRadius: 14, borderWidth: 1, borderLeftWidth: 3, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomLeft: { flexDirection: 'row', flex: 1 },
  roomIconWrap: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  roomInfo: { flex: 1 },
  roomName: { fontSize: 15, fontWeight: '700' },
  roomMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  roomCapacity: { fontSize: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 6, gap: 4 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  bookButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, gap: 5 },
  bookButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15, marginTop: 12 },
});
