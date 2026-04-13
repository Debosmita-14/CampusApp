import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { getApiUrl } from '../api';
import { useAuth } from '../AuthContext';

export default function AdminScreen() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resUsers, resEvents] = await Promise.all([
        fetch(getApiUrl('/auth/users')),
        fetch(getApiUrl('/events/'))
      ]);
      const dataUsers = await resUsers.json();
      const dataEvents = await resEvents.json();
      
      if(dataUsers.users) setUsers(dataUsers.users);
      if(dataEvents.events) setEvents(dataEvents.events);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderUser = ({ item }) => (
    <View style={styles.rowItem}>
      <View>
        <Text style={styles.itemTitle}>{item.username}</Text>
        <Text style={styles.itemSubtitle}>ID: {item.id}</Text>
      </View>
      <View style={[styles.badge, item.role === 'admin' ? styles.badgeAdmin : styles.badgeUser]}>
        <Text style={styles.badgeText}>{item.role.toUpperCase()}</Text>
      </View>
    </View>
  );

  const renderEvent = ({ item }) => (
    <View style={styles.rowItem}>
      <View>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemSubtitle}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.eventLocation}>{item.location}</Text>
    </View>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#6366f1" /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Registered Users ({users.length})</Text>
      <View style={styles.listContainer}>
        {users.map(u => <View key={u.id}>{renderUser({item: u})}</View>)}
      </View>

      <Text style={styles.sectionTitle}>All Events ({events.length})</Text>
      <View style={styles.listContainer}>
         {events.map(e => <View key={e.id}>{renderEvent({item: e})}</View>)}
      </View>

      <View style={{height: 40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#cbd5e1',
    marginBottom: 15,
    marginTop: 10,
  },
  listContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  itemTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  itemSubtitle: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeAdmin: {
    backgroundColor: '#f59e0b',
  },
  badgeUser: {
    backgroundColor: '#3b82f6',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventLocation: {
    color: '#94a3b8',
    fontSize: 14,
  },
});
