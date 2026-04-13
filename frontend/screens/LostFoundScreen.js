import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { getApiUrl } from '../api';

export default function LostFoundScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: 'lost',
    title: '',
    location: '',
  });

  const fetchItems = () => {
    setLoading(true);
    fetch(getApiUrl('/lost-found/'))
      .then(res => res.json())
      .then(data => {
        if(data.items) setItems(data.items);
        setLoading(false);
      })
      .catch(err => {
        console.error("Backend connection error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

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
        if (data.item) {
          setItems(prev => [data.item, ...prev]);
        }
        setModalVisible(false);
        setFormData({ type: 'lost', title: '', location: '' });
        Alert.alert('Success!', 'Your report has been submitted.');
      })
      .catch(err => {
        setSubmitting(false);
        Alert.alert('Error', 'Could not submit report. Please try again.');
        console.error("Report error:", err);
      });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={[styles.badge, item.type === 'lost' ? styles.badgeLost : styles.badgeFound]}>
        <Text style={styles.badgeText}>{item.type.toUpperCase()}</Text>
      </View>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemDetail}>📍 Location: {item.location}</Text>
      <Text style={styles.itemDetail}>📅 Date: {item.date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Lost & Found</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Report</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 50 }} />
      ) : items.length === 0 ? (
        <Text style={styles.emptyText}>No lost or found items reported yet.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}

      {/* Report Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report an Item</Text>

            {/* Type Toggle */}
            <View style={styles.typeRow}>
              <TouchableOpacity 
                style={[styles.typeButton, formData.type === 'lost' && styles.typeButtonActiveLost]}
                onPress={() => setFormData(prev => ({ ...prev, type: 'lost' }))}
              >
                <Text style={[styles.typeButtonText, formData.type === 'lost' && styles.typeButtonTextActive]}>Lost</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeButton, formData.type === 'found' && styles.typeButtonActiveFound]}
                onPress={() => setFormData(prev => ({ ...prev, type: 'found' }))}
              >
                <Text style={[styles.typeButtonText, formData.type === 'found' && styles.typeButtonTextActive]}>Found</Text>
              </TouchableOpacity>
            </View>

            {/* Item Name */}
            <TextInput
              style={styles.input}
              placeholder="Item name (e.g., Blue Water Bottle)"
              placeholderTextColor="#64748b"
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            />

            {/* Location */}
            <TextInput
              style={styles.input}
              placeholder="Location (e.g., Library 2nd Floor)"
              placeholderTextColor="#64748b"
              value={formData.location}
              onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
            />

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setModalVisible(false);
                  setFormData({ type: 'lost', title: '', location: '' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleReport}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
  },
  badgeLost: {
    backgroundColor: '#ef4444',
  },
  badgeFound: {
    backgroundColor: '#10b981',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemDetail: {
    color: '#94a3b8',
    marginTop: 2,
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  typeRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  typeButtonActiveLost: {
    backgroundColor: '#ef4444',
  },
  typeButtonActiveFound: {
    backgroundColor: '#10b981',
  },
  typeButtonText: {
    color: '#94a3b8',
    fontWeight: 'bold',
    fontSize: 16,
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#94a3b8',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
