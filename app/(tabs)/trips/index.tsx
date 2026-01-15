import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, router } from 'expo-router';
import { Trip } from '@/types';

// Mock data for trips
const mockTrips: Trip[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'Summer Europe Trip',
    description: 'A summer journey through Paris and beyond',
    startDate: new Date(2023, 5, 15),
    endDate: new Date(2023, 5, 30),
    destination: {
      city: 'Paris',
      country: 'France',
      coordinates: {
        latitude: 48.8566,
        longitude: 2.3522
      }
    },
    photos: ['https://images.unsplash.com/photo-1431274172761-fca41d930114?w=500'],
    isPublic: true,
    likes: 42,
    comments: [],
    collaborators: [],
    itinerary: [],
    tags: ['beach', 'adventure', 'culture'],
    createdAt: new Date(2023, 4, 20),
    updatedAt: new Date(2023, 4, 20)
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Asian Adventure',
    description: 'Exploring Tokyo and nearby sights',
    startDate: new Date(2023, 3, 5),
    endDate: new Date(2023, 3, 20),
    destination: {
      city: 'Tokyo',
      country: 'Japan',
      coordinates: {
        latitude: 35.6762,
        longitude: 139.6503,
      }
    },
    photos: ['https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=500'],
    isPublic: true,
    likes: 30,
    comments: [],
    collaborators: [],
    itinerary: [],
    tags: ['city', 'food', 'culture'],
    createdAt: new Date(2023, 2, 10),
    updatedAt: new Date(2023, 2, 10)
  },
  {
    id: '3',
    userId: 'user1',
    title: 'Beach Vacation',
    description: 'Relaxing on the beaches of Bali',
    startDate: new Date(2023, 1, 10),
    endDate: new Date(2023, 1, 20),
    destination: {
      city: 'Bali',
      country: 'Indonesia',
      coordinates: {
        latitude: -8.3405,
        longitude: 115.0920,
      }
    },
    photos: ['https://images.unsplash.com/photo-1537996194471-e657df147ecc?w=500'],
    isPublic: true,
    likes: 24,
    comments: [],
    collaborators: [],
    itinerary: [],
    tags: ['beach', 'relax'],
    createdAt: new Date(2023, 0, 25),
    updatedAt: new Date(2023, 0, 25)
  },
];

export default function TripsScreen() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigation = useNavigation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  
  // Form state
  const [newTrip, setNewTrip] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const upcomingTrips = trips.filter(trip => trip.startDate > new Date());
  const pastTrips = trips.filter(trip => trip.endDate < new Date());
  const currentTrips = trips.filter(trip => 
    trip.startDate <= new Date() && trip.endDate >= new Date()
  );
  
  const handleCreateTrip = () => {
    if (!newTrip.title || !newTrip.destination || !newTrip.startDate || !newTrip.endDate) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    
    try {
      const trip: Trip = {
        id: Date.now().toString(),
        userId: 'user1',
        title: newTrip.title,
        description: newTrip.description,
        startDate: new Date(newTrip.startDate),
        endDate: new Date(newTrip.endDate),
        destination: {
          city: newTrip.destination.split(',')[0]?.trim() || newTrip.destination,
          country: newTrip.destination.split(',')[1]?.trim() || 'Unknown',
          coordinates: { latitude: 0, longitude: 0 }
        },
        photos: [],
        isPublic: true,
        likes: 0,
        comments: [],
        collaborators: [],
        itinerary: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setTrips([...trips, trip]);
      setShowCreateModal(false);
      setNewTrip({ title: '', destination: '', startDate: '', endDate: '', description: '' });
      Alert.alert('Success', 'Trip created successfully!');
    } catch (error) {
      console.error('Error creating trip:', error);
      Alert.alert('Error', 'Failed to create trip. Please try again.');
    }
  };

  const renderTripCard = ({ item }: { item: Trip }) => (
    <TouchableOpacity 
      style={styles.tripCard}
      onPress={() => {
        setSelectedTrip(item);
        setShowDetailModal(true);
      }}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.photos[0] || 'https://via.placeholder.com/300x200' }} 
        style={styles.tripImage}
      />
      <View style={styles.tripInfo}>
        <Text style={styles.tripTitle}>{item.title}</Text>
        <View style={styles.tripMeta}>
          <Ionicons name="location" size={14} color="#666" />
          <Text style={styles.tripLocation}>{item.destination.city}, {item.destination.country}</Text>
        </View>
        <View style={styles.tripMeta}>
          <Ionicons name="calendar" size={14} color="#666" />
          <Text style={styles.tripDate}>
            {item.startDate.toLocaleDateString()} - {item.endDate.toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="card-travel" size={64} color="#ccc" />
      <Text style={styles.emptyStateText}>No trips found</Text>
      <Text style={styles.emptyStateSubtext}>Start planning your next adventure!</Text>
      {activeTab === 'upcoming' && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Create Trip</Text>
        </TouchableOpacity>
      )}
      {activeTab === 'upcoming' && (
        <TouchableOpacity
          style={styles.addFromBucketButton}
          onPress={() => router.push('/(tabs)/bucket-list')}
        >
          <Text style={styles.addFromBucketText}>+ Add From Bucket List</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderTripList = (trips: Trip[]) => (
    <FlatList
      data={trips}
      renderItem={renderTripCard}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.tripList}
      ListEmptyComponent={renderEmptyState}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Trips</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={20} color="#0fa3a3" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
          {activeTab === 'upcoming' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'current' && styles.activeTab]}
          onPress={() => setActiveTab('current')}
        >
          <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>Current</Text>
          {activeTab === 'current' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>Past</Text>
          {activeTab === 'past' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'upcoming' && renderTripList(upcomingTrips)}
        {activeTab === 'current' && renderTripList(currentTrips)}
        {activeTab === 'past' && renderTripList(pastTrips)}
      </View>
      
      {/* Create Trip Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Trip</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Trip Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Summer Europe Adventure"
                  value={newTrip.title}
                  onChangeText={(text) => setNewTrip({ ...newTrip, title: text })}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Destination *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Paris, France"
                  value={newTrip.destination}
                  onChangeText={(text) => setNewTrip({ ...newTrip, destination: text })}
                />
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Start Date *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={newTrip.startDate}
                    onChangeText={(text) => setNewTrip({ ...newTrip, startDate: text })}
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>End Date *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={newTrip.endDate}
                    onChangeText={(text) => setNewTrip({ ...newTrip, endDate: text })}
                  />
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Tell us about your trip..."
                  value={newTrip.description}
                  onChangeText={(text) => setNewTrip({ ...newTrip, description: text })}
                  multiline
                  numberOfLines={4}
                />
              </View>
              
              <TouchableOpacity 
                style={styles.createTripButton}
                onPress={handleCreateTrip}
              >
                <Text style={styles.createTripButtonText}>Create Trip</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Trip Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowDetailModal(false);
          setSelectedTrip(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tripDetailModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Trip Details</Text>
              <TouchableOpacity onPress={() => {
                setShowDetailModal(false);
                setSelectedTrip(null);
              }}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            
            {selectedTrip && (
              <ScrollView style={styles.tripDetailScroll}>
                {selectedTrip.photos && selectedTrip.photos.length > 0 && (
                  <Image 
                    source={{ uri: selectedTrip.photos[0] }} 
                    style={styles.tripDetailImage}
                    resizeMode="cover"
                  />
                )}
                
                <View style={styles.tripDetailContent}>
                  <Text style={styles.tripDetailTitle}>{selectedTrip.title}</Text>
                  
                  {selectedTrip.description && (
                    <Text style={styles.tripDetailDescription}>{selectedTrip.description}</Text>
                  )}
                  
                  <View style={styles.tripDetailSection}>
                    <View style={styles.tripDetailRow}>
                      <Ionicons name="location" size={22} color="#0fa3a3" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tripDetailLabel}>Destination</Text>
                        <Text style={styles.tripDetailValue}>
                          {selectedTrip.destination.city}, {selectedTrip.destination.country}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.tripDetailSection}>
                    <View style={styles.tripDetailRow}>
                      <Ionicons name="calendar" size={22} color="#0fa3a3" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tripDetailLabel}>Dates</Text>
                        <Text style={styles.tripDetailValue}>
                          {selectedTrip.startDate.toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </Text>
                        <Text style={styles.tripDetailValue}>
                          to {selectedTrip.endDate.toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.tripDetailSection}>
                    <View style={styles.tripDetailRow}>
                      <Ionicons name="time" size={22} color="#0fa3a3" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tripDetailLabel}>Duration</Text>
                        <Text style={styles.tripDetailValue}>
                          {Math.ceil((selectedTrip.endDate.getTime() - selectedTrip.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {selectedTrip.tags && selectedTrip.tags.length > 0 && (
                    <View style={styles.tripDetailSection}>
                      <View style={styles.tripDetailRow}>
                        <Ionicons name="pricetag" size={22} color="#0fa3a3" />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.tripDetailLabel}>Tags</Text>
                          <View style={styles.tagsContainer}>
                            {selectedTrip.tags.map((tag, index) => (
                              <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      </View>
                    </View>
                  )}
                  
                  <View style={styles.tripDetailSection}>
                    <View style={styles.tripDetailRow}>
                      <Ionicons name="heart" size={22} color="#0fa3a3" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tripDetailLabel}>Engagement</Text>
                        <Text style={styles.tripDetailValue}>
                          {selectedTrip.likes} likes • {selectedTrip.comments?.length || 0} comments
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.tripDetailSection}>
                    <View style={styles.tripDetailRow}>
                      <Ionicons name="eye" size={22} color="#0fa3a3" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tripDetailLabel}>Visibility</Text>
                        <Text style={styles.tripDetailValue}>
                          {selectedTrip.isPublic ? 'Public' : 'Private'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.tripDetailActions}>
                    <TouchableOpacity 
                      style={[styles.tripDetailButton, styles.editButton]}
                      onPress={() => {
                        Alert.alert('Edit Trip', 'Edit functionality coming soon!');
                      }}
                    >
                      <Ionicons name="create" size={20} color="#fff" />
                      <Text style={styles.tripDetailButtonText}>Edit Trip</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.tripDetailButton, styles.shareButton]}
                      onPress={() => {
                        Alert.alert('Share Trip', 'Share functionality coming soon!');
                      }}
                    >
                      <Ionicons name="share-social" size={20} color="#fff" />
                      <Text style={styles.tripDetailButtonText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.tripDetailButton, styles.deleteButton]}
                    onPress={() => {
                      Alert.alert(
                        'Delete Trip',
                        'Are you sure you want to delete this trip?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Delete', 
                            style: 'destructive',
                            onPress: () => {
                              setTrips(trips.filter(t => t.id !== selectedTrip.id));
                              setShowDetailModal(false);
                              setSelectedTrip(null);
                              Alert.alert('Success', 'Trip deleted successfully!');
                            }
                          }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash" size={20} color="#fff" />
                    <Text style={styles.tripDetailButtonText}>Delete Trip</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#f9f9f9',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#0fa3a3',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '100%',
    backgroundColor: '#0fa3a3',
  },
  content: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  tripList: {
    padding: 16,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tripImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
  },
  tripInfo: {
    padding: 16,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  tripMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tripLocation: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  tripDate: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#0fa3a3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addFromBucketButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#0fa3a3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFromBucketText: {
    color: '#0fa3a3',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalForm: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createTripButton: {
    backgroundColor: '#0fa3a3',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  createTripButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Trip Detail Modal Styles
  tripDetailModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    width: '100%',
  },
  tripDetailScroll: {
    flex: 1,
  },
  tripDetailImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  tripDetailContent: {
    padding: 20,
  },
  tripDetailTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tripDetailDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  tripDetailSection: {
    marginBottom: 20,
  },
  tripDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tripDetailLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  tripDetailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#e8f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#0fa3a3',
    fontSize: 13,
    fontWeight: '500',
  },
  tripDetailActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 16,
  },
  tripDetailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  editButton: {
    backgroundColor: '#0fa3a3',
  },
  shareButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    marginTop: 8,
  },
  tripDetailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
