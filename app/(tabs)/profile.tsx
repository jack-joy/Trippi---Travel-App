import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TravelMap from '@/components/profile/TravelMap';
import TravelStats from '@/components/profile/TravelStats';

// Sample user data
const user = {
  name: 'John Doe',
  username: '@johndoe',
  bio: 'Travel enthusiast | Photographer | Food lover | 23 countries and counting',
  currentTrip: {
    location: 'Tokyo, Japan',
    startDate: 'Jan 20, 2026',
    endDate: 'Feb 5, 2026',
    emoji: '🇯🇵'
  },
  stats: {
    countries: 23,
    continents: 5,
    trips: 42,
    daysTraveled: 187,
    followers: 2840,
    following: 562,
  },
  countries: [
    'United States', 'France', 'Italy', 'Japan', 'Thailand',
    'Spain', 'Mexico', 'Canada', 'Australia', 'Germany',
    'United Kingdom', 'Netherlands', 'Belgium', 'Switzerland', 'Austria',
    'Greece', 'Portugal', 'Brazil', 'Argentina', 'South Africa',
    'China', 'South Korea', 'Vietnam'
  ],
  recentTrips: [
    { id: '1', title: 'Summer Europe Trip', location: 'Paris, France', date: 'Jun 15 - 30, 2023', image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=500' },
    { id: '2', title: 'Asian Adventure', location: 'Tokyo, Japan', date: 'Apr 5 - 20, 2023', image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=500' },
    { id: '3', title: 'Beach Vacation', location: 'Bali, Indonesia', date: 'Feb 10 - 20, 2023', image: 'https://images.unsplash.com/photo-1537996194471-e657df147ecc?w=500' },
  ],
  upcomingTrips: [
    { id: '4', title: 'Ski Trip', location: 'Whistler, Canada', date: 'Dec 10 - 18, 2023' },
    { id: '5', title: 'Food Tour', location: 'Bangkok, Thailand', date: 'Mar 5 - 15, 2024' },
  ],
  bucketList: [
    { id: 'b1', name: 'Santorini Sunset', location: 'Santorini, Greece', image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=800&auto=format&fit=crop' },
    { id: 'b2', name: 'Safari in Maasai Mara', location: 'Narok, Kenya', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800' },
    { id: 'b3', name: 'Northern Lights', location: 'Reykjavík, Iceland', image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800' },
  ],
  photos: [
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800',
    'https://images.unsplash.com/photo-1505764706515-aa95265c5abc?w=800',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
    'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800'
  ],
};

// Define Trip type
type Trip = {
  id: string;
  title: string;
  location: string;
  date: string;
  image?: string;
};

type BucketItem = {
  id: string;
  name: string;
  location?: string;
  image?: string;
};

// Define props for TripCard component
interface TripCardProps {
  trip: Trip;
  isUpcoming?: boolean;
  fullWidth?: boolean;
}

// Trip card component
const TripCard: React.FC<TripCardProps> = ({ trip, isUpcoming = false, fullWidth = false }) => (
  <View style={[styles.tripCard, fullWidth && styles.tripCardFull]}>
    {trip.image ? (
      <Image source={{ uri: trip.image }} style={styles.tripImage} />
    ) : (
      <View style={[styles.tripImage, styles.tripImagePlaceholder]}>
        <Ionicons name="airplane" size={32} color="#0fa3a3" />
      </View>
    )}
    <View style={styles.tripInfo}>
      <Text style={styles.tripTitle} numberOfLines={1}>{trip.title}</Text>
      <View style={styles.tripMeta}>
        <Ionicons name="location-outline" size={14} color="#666" />
        <Text style={styles.tripLocation}>{trip.location}</Text>
      </View>
      <View style={styles.tripMeta}>
        <Ionicons name="calendar-outline" size={14} color="#666" />
        <Text style={styles.tripDate}>{trip.date}</Text>
      </View>
      {isUpcoming && (
        <View style={styles.upcomingBadge}>
          <Text style={styles.upcomingText}>Upcoming</Text>
        </View>
      )}
    </View>
  </View>
);

export default function ProfileScreen() {
  const [activeSection, setActiveSection] = useState<'recent' | 'upcoming' | 'bucket'>('recent');
  // Initialize with an estimated inner width (screen - section padding), updated on layout
  const [photosContainerW, setPhotosContainerW] = useState<number>(Dimensions.get('window').width - 32);
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileInfo}>
          <View style={styles.headerRow}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400' }} 
              style={styles.avatar} 
            />
            <View style={styles.headerText}>
              <View style={styles.headerTitleRow}>
                <Text style={styles.name}>{user.name}</Text>
                <TouchableOpacity style={styles.settingsButton}>
                  <Ionicons name="settings-outline" size={22} color="#000" />
                </TouchableOpacity>
              </View>
              <Text style={styles.username}>{user.username}</Text>
              <Text style={styles.bio} numberOfLines={2} ellipsizeMode="tail">{user.bio}</Text>
            </View>
          </View>
          
          {/* Current Trip Banner */}
          {user.currentTrip && (
            <View style={styles.travelBanner}>
              <View style={styles.travelBannerContent}>
                <Text style={styles.travelEmoji}>{user.currentTrip.emoji}</Text>
                <View style={styles.travelInfo}>
                  <Text style={styles.travelStatus}>Currently Traveling</Text>
                  <Text style={styles.travelLocation}>{user.currentTrip.location}</Text>
                  <Text style={styles.travelDates}>{user.currentTrip.startDate} - {user.currentTrip.endDate}</Text>
                </View>
              </View>
              <Ionicons name="airplane" size={20} color="#0fa3a3" />
            </View>
          )}
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.stats.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.stats.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.stats.countries}</Text>
              <Text style={styles.statLabel}>Countries</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.stats.trips}</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
          </View>
          
          {/* Travel Map */}
          <View style={styles.sectionFullBleed}>
            <Text style={styles.sectionTitle}>My Travel Map</Text>
            <TravelMap countries={user.countries} />
          </View>
          
          {/* Travel Stats */}
          <TravelStats stats={user.stats} />

          {/* Photos from past trips */}
          {(Array.isArray((user as any).photos) && (user as any).photos.length > 0) || user.recentTrips.some(t => !!t.image) ? (
            <View style={styles.sectionFullBleed}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Photos</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              {(() => {
                const photos = (user as any).photos && (user as any).photos.length > 0
                  ? (user as any).photos.map((uri: string, idx: number) => ({ id: `p-${idx}`, uri }))
                  : user.recentTrips.filter(t => !!t.image).map(t => ({ id: t.id, uri: t.image as string }));
                const preview = photos.slice(0, 9);
                while (preview.length < 9) preview.push({ id: `ph-${preview.length}`, uri: '' });
                const cols = 3;
                const gap = 8;
                const containerW = photosContainerW ?? 0;
                const size = containerW > 0 ? Math.floor((containerW - gap * (cols - 1)) / cols) : 0;
                return (
                  <View
                    style={styles.photosGrid}
                    onLayout={(e) => setPhotosContainerW(e.nativeEvent.layout.width)}
                  >
                    {preview.map((p: { id: string; uri: string }, idx: number) => {
                      const edgeSpacing = { marginBottom: gap, marginRight: (idx % cols !== cols - 1) ? gap : 0 } as const;
                      const styleArrImg = size > 0
                        ? [styles.photoItem, { width: size, height: size }, edgeSpacing]
                        : [styles.photoItem, styles.photoItemPercent, edgeSpacing];
                      const styleArrView = size > 0
                        ? [styles.photoItem, { width: size, height: size }, edgeSpacing, styles.photoPlaceholder]
                        : [styles.photoItem, styles.photoItemPercent, edgeSpacing, styles.photoPlaceholder];
                      return p.uri ? (
                        <Image key={p.id} source={{ uri: p.uri }} style={styleArrImg} />
                      ) : (
                        <View key={p.id} style={styleArrView} />
                      );
                    })}
                  </View>
                );
              })()}
            </View>
          ) : null}

          {/* Segmented controls for trips/bucket */}
          <View style={[styles.sectionFullBleed, { paddingVertical: 12 }] }>
            <View style={styles.segmentRow}>
              <TouchableOpacity
                style={[styles.segmentBtn, activeSection === 'recent' && styles.segmentBtnActive]}
                onPress={() => setActiveSection('recent')}
              >
                <Text style={[styles.segmentText, activeSection === 'recent' && styles.segmentTextActive]}>Past Trips</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentBtn, activeSection === 'upcoming' && styles.segmentBtnActive]}
                onPress={() => setActiveSection('upcoming')}
              >
                <Text style={[styles.segmentText, activeSection === 'upcoming' && styles.segmentTextActive]}>Upcoming</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentBtn, activeSection === 'bucket' && styles.segmentBtnActive]}
                onPress={() => setActiveSection('bucket')}
              >
                <Text style={[styles.segmentText, activeSection === 'bucket' && styles.segmentTextActive]}>Bucket List</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* My Bucket List - Vertical list (full width) */}
          {activeSection === 'bucket' && user.bucketList && user.bucketList.length > 0 && (
            <View style={styles.sectionFullBleed}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Bucket List</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.bucketListVertical}>
                {user.bucketList.map((item: BucketItem) => (
                  <View key={item.id} style={[styles.tripCard, styles.tripCardFull]}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.tripImage} />
                    ) : (
                      <View style={[styles.tripImage, styles.tripImagePlaceholder]} />
                    )}
                    <View style={styles.tripInfo}>
                      <Text style={styles.tripTitle} numberOfLines={1}>{item.name}</Text>
                      {item.location ? (
                        <View style={styles.tripMeta}>
                          <Ionicons name="location-outline" size={14} color="#666" />
                          <Text style={styles.tripLocation}>{item.location}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Recent Trips - Vertical list (full width) */}
          {activeSection === 'recent' && (
          <View style={styles.sectionFullBleed}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Past Trips</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tripsListVertical}>
              {user.recentTrips.map(trip => (
                <TripCard key={trip.id} trip={trip} fullWidth />
              ))}
            </View>
          </View>
          )}
          
          {/* Upcoming Trips - Vertical list (full width) */}
          {activeSection === 'upcoming' && user.upcomingTrips.length > 0 && (
            <View style={styles.sectionFullBleed}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Trips</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tripsListVertical}>
                {user.upcomingTrips.map(trip => (
                  <TripCard key={trip.id} trip={trip} isUpcoming={true} fullWidth />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollView: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 0,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  settingsButton: {
    padding: 8,
    marginTop: 0,
  },
  profileInfo: {
    alignItems: 'stretch',
    padding: 24,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 8,
    marginBottom: 4,
  },
  headerText: {
    flex: 1,
    marginLeft: 16,
    paddingTop: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 0,
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 6,
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 6,
    marginTop: 0,
  },
  bio: {
    fontSize: 14,
    color: '#333',
    textAlign: 'left',
    marginBottom: 12,
    paddingHorizontal: 0,
    lineHeight: 20,
  },
  travelBanner: {
    backgroundColor: '#e6f7f7',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#0fa3a3',
  },
  travelBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  travelEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  travelInfo: {
    flex: 1,
  },
  travelStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0fa3a3',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  travelLocation: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  travelDates: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 12,
    width: '23%',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0fa3a3',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sectionFullBleed: {
    backgroundColor: '#fff',
    alignSelf: 'stretch',
    padding: 16,
    marginTop: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoItem: {
    width: '31%',
    aspectRatio: 1,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  photoItemPercent: {
    width: '31%',
    aspectRatio: 1,
  },
  photoPlaceholder: {
    backgroundColor: '#f0f0f0',
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: '#f2f6f6',
    borderRadius: 10,
    padding: 4,
    gap: 6,
  },
  segmentBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e6eeee',
  },
  segmentBtnActive: {
    backgroundColor: '#0fa3a3',
    borderColor: '#0fa3a3',
  },
  segmentText: {
    color: '#666',
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#fff',
  },
  seeAll: {
    color: '#0fa3a3',
    fontSize: 14,
    fontWeight: '500',
  },
  tripsContainer: {
    paddingVertical: 4,
  },
  tripsListVertical: {
    gap: 12,
  },
  bucketListVertical: {
    gap: 12,
  },
  tripCard: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tripCardFull: {
    width: '100%',
    marginRight: 0,
    marginBottom: 12,
  },
  tripImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  tripImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6f7f7',
  },
  tripInfo: {
    padding: 12,
    position: 'relative',
  },
  tripTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  tripMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  tripLocation: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  tripDate: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  upcomingBadge: {
    position: 'absolute',
    top: -12,
    right: 12,
    backgroundColor: '#0fa3a3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  upcomingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  addTripCard: {
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#0fa3a3',
    backgroundColor: '#f8fafa',
  },
  addTripText: {
    color: '#0fa3a3',
    marginTop: 8,
    fontWeight: '500',
  },
  placeholderCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  placeholderText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 14,
  },
});