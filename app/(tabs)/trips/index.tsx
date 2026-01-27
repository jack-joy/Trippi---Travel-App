import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, router } from 'expo-router';
import { Trip } from '@/types';

// Current trip data (Tokyo trip from profile)
const currentTripData = {
  id: 'current-1',
  userId: 'user1',
  title: 'Tokyo Adventure',
  description: 'Exploring the vibrant culture, cuisine, and modern marvels of Tokyo',
  startDate: new Date(2026, 0, 20), // Jan 20, 2026
  endDate: new Date(2026, 1, 3),   // Feb 3, 2026
  destination: {
    city: 'Tokyo',
    country: 'Japan',
    coordinates: { latitude: 35.6762, longitude: 139.6503 }
  },
  photos: ['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800'],
  isPublic: true,
  likes: 156,
  comments: [],
  collaborators: ['@sarah', '@mike'],
  itinerary: [],
  tags: ['city', 'food', 'culture', 'technology'],
  createdAt: new Date(2025, 11, 1),
  updatedAt: new Date(2026, 0, 20),
  locations: [
    { name: 'Shibuya', emoji: '🏙️', date: 'Jan 20-22' },
    { name: 'Asakusa', emoji: '⛩️', date: 'Jan 23-25' },
    { name: 'Harajuku', emoji: '🎨', date: 'Jan 26-28' },
    { name: 'Akihabara', emoji: '🎮', date: 'Jan 29-31' },
    { name: 'Odaiba', emoji: '🌉', date: 'Feb 1-3' }
  ],
  dailyPlan: [
    { date: 'Jan 20', day: 'Mon', activities: ['Arrive at Narita Airport', 'Check into hotel in Shibuya', 'Shibuya Crossing exploration'], restaurants: [{ name: 'Ichiran Ramen', time: '7:00 PM' }] },
    { date: 'Jan 21', day: 'Tue', activities: ['Meiji Shrine visit', 'Yoyogi Park walk', 'Harajuku shopping', 'Shibuya Sky observation deck'], restaurants: [{ name: 'Sushi Zanmai', time: '12:30 PM' }, { name: 'Gonpachi', time: '7:30 PM' }] },
    { date: 'Jan 22', day: 'Wed', activities: ['TeamLab Borderless', 'Lunch in Daikanyama', 'Shibuya nightlife tour'], restaurants: [{ name: 'Afuri Ramen', time: '1:00 PM' }] },
    { date: 'Jan 23', day: 'Thu', activities: ['Senso-ji Temple', 'Nakamise Shopping Street', 'Tokyo Skytree', 'Sumida River cruise'], restaurants: [{ name: 'Sometaro Okonomiyaki', time: '6:30 PM' }] },
    { date: 'Jan 24', day: 'Fri', activities: ['Tsukiji Outer Market', 'Sushi breakfast', 'Asakusa Culture Center', 'Traditional tea ceremony'], restaurants: [{ name: 'Sushi Dai', time: '6:00 AM' }, { name: 'Tempura Daikokuya', time: '7:00 PM' }] },
    { date: 'Jan 25', day: 'Sat', activities: ['Ueno Park', 'Tokyo National Museum', 'Ameya-Yokocho market', 'Asakusa evening walk'], restaurants: [{ name: 'Kanda Yabu Soba', time: '12:00 PM' }] },
    { date: 'Jan 26', day: 'Sun', activities: ['Takeshita Street shopping', 'Kawaii culture tour', 'Cat Street boutiques', 'Omotesando architecture'], restaurants: [{ name: 'Kawaii Monster Cafe', time: '1:30 PM' }, { name: 'Bills Omotesando', time: '6:00 PM' }] },
    { date: 'Jan 27', day: 'Mon', activities: ['Nezu Museum', 'Yoyogi Park picnic', 'Vintage shopping', 'Harajuku street food'], restaurants: [{ name: 'Gyukatsu Motomura', time: '6:30 PM' }] },
    { date: 'Jan 28', day: 'Tue', activities: ['Design Festa Gallery', 'Togo Shrine', 'Fashion district tour', 'Themed cafe hopping'], restaurants: [{ name: 'Maisen Tonkatsu', time: '7:00 PM' }] },
    { date: 'Jan 29', day: 'Wed', activities: ['Akihabara Electric Town', 'Anime & manga shops', 'Retro gaming arcade', 'Maid cafe experience'], restaurants: [{ name: 'Maidreamin Maid Cafe', time: '2:00 PM' }] },
    { date: 'Jan 30', day: 'Thu', activities: ['Kanda Myojin Shrine', 'Electronics shopping', 'Gundam Cafe', 'Akihabara night tour'], restaurants: [{ name: 'Gundam Cafe', time: '12:00 PM' }, { name: 'Katsukura Tonkatsu', time: '7:30 PM' }] },
    { date: 'Jan 31', day: 'Fri', activities: ['Radio Kaikan', 'Figure shopping', 'Sega arcade'], restaurants: [{ name: 'Ichiran Ramen Akihabara', time: '8:00 PM' }] },
    { date: 'Feb 1', day: 'Sat', activities: ['TeamLab Planets', 'Odaiba Seaside Park', 'DiverCity Tokyo Plaza', 'Gundam statue'], restaurants: [{ name: 'Bills Odaiba', time: '11:00 AM' }, { name: 'Gonpachi Odaiba', time: '7:00 PM' }] },
    { date: 'Feb 2', day: 'Sun', activities: ['Palette Town', 'Oedo Onsen hot springs', 'Rainbow Bridge walk'], restaurants: [{ name: 'Tsukiji Sushiko', time: '6:30 PM' }] },
    { date: 'Feb 3', day: 'Mon', activities: ['Last-minute shopping', 'Pack and check out', 'Depart from Narita Airport'], restaurants: [{ name: 'Airport Ramen', time: '10:00 AM' }] },
  ],
  budget: {
    total: 3500,
    spent: 2100,
    categories: [
      { name: 'Accommodation', budgeted: 1000, spent: 650 },
      { name: 'Food', budgeted: 800, spent: 520 },
      { name: 'Activities', budgeted: 600, spent: 380 },
      { name: 'Transportation', budgeted: 400, spent: 280 },
      { name: 'Shopping', budgeted: 500, spent: 200 },
      { name: 'Miscellaneous', budgeted: 200, spent: 70 },
    ]
  },
  weather: [
    { date: 'Jan 20-22', temp: '8°C', condition: 'Partly Cloudy', icon: 'partly-sunny' },
    { date: 'Jan 23-25', temp: '10°C', condition: 'Sunny', icon: 'sunny' },
    { date: 'Jan 26-28', temp: '7°C', condition: 'Cloudy', icon: 'cloudy' },
    { date: 'Jan 29-31', temp: '9°C', condition: 'Clear', icon: 'sunny' },
    { date: 'Feb 1-3', temp: '11°C', condition: 'Partly Cloudy', icon: 'partly-sunny' },
  ],
  checklist: [
    { item: 'Book flights', completed: true },
    { item: 'Reserve hotels', completed: true },
    { item: 'Get JR Pass', completed: true },
    { item: 'Travel insurance', completed: true },
    { item: 'Pocket WiFi rental', completed: false },
    { item: 'Download offline maps', completed: false },
    { item: 'Pack luggage', completed: false },
  ]
};

// Mock data for trips
const mockTrips: Trip[] = [
  // Past Trips
  {
    id: 'past-1',
    userId: 'user1',
    title: 'Iceland Adventure',
    description: 'An unforgettable journey through Iceland\'s stunning landscapes, from the Blue Lagoon to the Northern Lights. Explored glaciers, waterfalls, and geothermal wonders in the land of fire and ice.',
    startDate: new Date(2025, 8, 5),
    endDate: new Date(2025, 8, 15),
    destination: {
      city: 'Reykjavik',
      country: 'Iceland',
      coordinates: {
        latitude: 64.1466,
        longitude: -21.9426
      }
    },
    photos: [
      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800',
      'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
      'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=800'
    ],
    isPublic: true,
    likes: 234,
    comments: [],
    collaborators: [],
    itinerary: [],
    tags: ['nature', 'adventure', 'photography', 'northern lights', 'glaciers'],
    restaurants: [
      { name: 'Dill Restaurant', cuisine: 'Nordic Fine Dining', rating: 9.7 },
      { name: 'Grillmarkaðurinn', cuisine: 'Icelandic Grill', rating: 9.3 },
      { name: 'Bæjarins Beztu Pylsur', cuisine: 'Hot Dogs', rating: 8.9 }
    ],
    hotels: [
      { name: 'Hotel Rangá', area: 'South Iceland', rating: 9.8 },
      { name: 'Ion Adventure Hotel', area: 'Thingvellir', rating: 9.6 }
    ],
    activities: [
      { name: 'Blue Lagoon', duration: '3 hours', rating: 9.5 },
      { name: 'Golden Circle Tour', duration: 'Full day', rating: 9.7 },
      { name: 'Northern Lights Hunt', duration: '4 hours', rating: 9.8 },
      { name: 'Glacier Hiking', duration: '5 hours', rating: 9.6 },
      { name: 'Jökulsárlón Glacier Lagoon', duration: '3 hours', rating: 9.9 }
    ],
    transportation: 'Rental Car, Guided Tours',
    bestTime: 'September - Northern Lights season begins',
    estimatedBudget: '$4,000 - $6,000',
    createdAt: new Date(2025, 7, 1),
    updatedAt: new Date(2025, 8, 16)
  },
  {
    id: 'past-2',
    userId: 'user1',
    title: 'New Zealand Road Trip',
    description: 'Epic 2-week road trip across New Zealand\'s North and South Islands. From Auckland\'s harbors to Queenstown\'s mountains, experienced breathtaking fjords, Hobbiton, and adventure sports.',
    startDate: new Date(2025, 2, 10),
    endDate: new Date(2025, 2, 24),
    destination: {
      city: 'Queenstown',
      country: 'New Zealand',
      coordinates: {
        latitude: -45.0312,
        longitude: 168.6626
      }
    },
    photos: [
      'https://images.unsplash.com/photo-1469521669194-babb45599def?w=800',
      'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800',
      'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=800'
    ],
    isPublic: true,
    likes: 312,
    comments: [],
    collaborators: [],
    itinerary: [],
    tags: ['adventure', 'nature', 'road trip', 'mountains', 'hiking'],
    restaurants: [
      { name: 'Rata', cuisine: 'Contemporary NZ', rating: 9.5 },
      { name: 'Fergburger', cuisine: 'Burgers', rating: 9.2 },
      { name: 'Botswana Butchery', cuisine: 'Steakhouse', rating: 9.4 }
    ],
    hotels: [
      { name: 'Matakauri Lodge', area: 'Queenstown', rating: 9.8 },
      { name: 'The Rees Hotel', area: 'Lake Wakatipu', rating: 9.5 }
    ],
    activities: [
      { name: 'Milford Sound Cruise', duration: 'Full day', rating: 9.9 },
      { name: 'Bungy Jumping', duration: '2 hours', rating: 9.7 },
      { name: 'Hobbiton Movie Set', duration: '3 hours', rating: 9.4 },
      { name: 'Skyline Gondola & Luge', duration: '2 hours', rating: 9.1 },
      { name: 'Lake Tekapo Stargazing', duration: '2 hours', rating: 9.6 }
    ],
    transportation: 'Rental Campervan',
    bestTime: 'March - Beautiful autumn colors',
    estimatedBudget: '$5,000 - $7,500',
    createdAt: new Date(2024, 12, 15),
    updatedAt: new Date(2025, 2, 25)
  },
  // Upcoming Trips
  {
    id: '1',
    userId: 'user1',
    title: 'Summer Europe Trip',
    description: 'A summer journey through Paris and beyond',
    startDate: new Date(2026, 5, 15),
    endDate: new Date(2026, 5, 30),
    destination: {
      city: 'Paris',
      country: 'France',
      coordinates: {
        latitude: 48.8566,
        longitude: 2.3522
      }
    },
    photos: [
      'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800'
    ],
    isPublic: true,
    likes: 89,
    comments: [],
    collaborators: [],
    itinerary: [],
    tags: ['culture', 'art', 'food', 'romance', 'museums', 'architecture'],
    restaurants: [
      { name: 'Le Jules Verne', cuisine: 'French Fine Dining', rating: 9.5 },
      { name: 'L\'Ami Jean', cuisine: 'Bistro', rating: 9.2 },
      { name: 'Septime', cuisine: 'Contemporary French', rating: 9.4 },
      { name: 'Breizh Café', cuisine: 'Crêperie', rating: 8.8 }
    ],
    hotels: [
      { name: 'Hotel Plaza Athénée', area: 'Champs-Élysées', rating: 9.6 },
      { name: 'Le Meurice', area: 'Tuileries', rating: 9.5 }
    ],
    activities: [
      { name: 'Eiffel Tower Summit', duration: '3 hours', rating: 9.7 },
      { name: 'Louvre Museum Tour', duration: '4 hours', rating: 9.8 },
      { name: 'Seine River Cruise', duration: '2 hours', rating: 9.3 },
      { name: 'Versailles Palace Day Trip', duration: 'Full day', rating: 9.6 },
      { name: 'Montmartre Walking Tour', duration: '3 hours', rating: 9.1 },
      { name: 'Musée d\'Orsay', duration: '3 hours', rating: 9.4 }
    ],
    transportation: 'Metro Pass, Airport Transfer',
    bestTime: 'June - Perfect weather for sightseeing',
    estimatedBudget: '$3,500 - $5,000',
    createdAt: new Date(2025, 4, 20),
    updatedAt: new Date(2026, 5, 10)
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Beach Vacation',
    description: 'Relaxing on the beaches of Bali',
    startDate: new Date(2026, 6, 10),
    endDate: new Date(2026, 6, 20),
    destination: {
      city: 'Bali',
      country: 'Indonesia',
      coordinates: {
        latitude: -8.3405,
        longitude: 115.0920,
      }
    },
    photos: [
      'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800',
      'https://images.unsplash.com/photo-1537996194471-e657df147ecc?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
    ],
    isPublic: true,
    likes: 156,
    comments: [],
    collaborators: [],
    itinerary: [],
    tags: ['beach', 'relax', 'culture', 'adventure', 'tropical', 'surfing'],
    restaurants: [
      { name: 'Locavore', cuisine: 'Modern Indonesian', rating: 9.6 },
      { name: 'Mozaic', cuisine: 'French-Indonesian Fusion', rating: 9.4 },
      { name: 'Warung Biah Biah', cuisine: 'Traditional Balinese', rating: 9.1 },
      { name: 'La Lucciola', cuisine: 'Italian Beachfront', rating: 8.9 },
      { name: 'Sari Organik', cuisine: 'Organic Farm-to-Table', rating: 9.0 }
    ],
    hotels: [
      { name: 'Four Seasons Resort Bali', area: 'Jimbaran Bay', rating: 9.7 },
      { name: 'The Mulia', area: 'Nusa Dua', rating: 9.5 },
      { name: 'Hanging Gardens of Bali', area: 'Ubud', rating: 9.6 }
    ],
    activities: [
      { name: 'Tegalalang Rice Terraces', duration: '3 hours', rating: 9.5 },
      { name: 'Uluwatu Temple & Kecak Dance', duration: '4 hours', rating: 9.4 },
      { name: 'Surfing Lessons at Seminyak', duration: '2 hours', rating: 9.2 },
      { name: 'Ubud Monkey Forest', duration: '2 hours', rating: 8.8 },
      { name: 'Tanah Lot Temple Sunset', duration: '3 hours', rating: 9.3 },
      { name: 'Bali Swing Experience', duration: '2 hours', rating: 9.0 },
      { name: 'Traditional Spa & Massage', duration: '2 hours', rating: 9.6 },
      { name: 'Snorkeling at Nusa Penida', duration: 'Full day', rating: 9.7 }
    ],
    transportation: 'Private Driver, Scooter Rental',
    bestTime: 'July - Dry season, perfect beach weather',
    estimatedBudget: '$2,500 - $4,000',
    createdAt: new Date(2025, 5, 25),
    updatedAt: new Date(2026, 6, 5)
  },
];

export default function TripsScreen() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigation = useNavigation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
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
  
  // Calculate progress for current trip
  const getTripProgress = () => {
    const now = new Date();
    const start = currentTripData.startDate.getTime();
    const end = currentTripData.endDate.getTime();
    const current = now.getTime();
    const progress = ((current - start) / (end - start)) * 100;
    return Math.max(0, Math.min(100, progress));
  };
  
  const getCurrentDay = () => {
    const now = new Date();
    const start = currentTripData.startDate;
    const daysDiff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(daysDiff, currentTripData.dailyPlan.length - 1));
  };
  
  const getCurrentLocation = () => {
    const progress = getTripProgress();
    const locationIndex = Math.floor((progress / 100) * currentTripData.locations.length);
    return Math.min(locationIndex, currentTripData.locations.length - 1);
  };
  
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
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={[styles.header, { marginTop: 4 }]}>
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
        {activeTab === 'current' && (
          <ScrollView style={styles.currentTripContainer} showsVerticalScrollIndicator={false}>
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <Image source={{ uri: currentTripData.photos[0] }} style={styles.heroImage} />
              <View style={styles.heroOverlay}>
                <Text style={styles.heroTitle}>{currentTripData.title}</Text>
                <Text style={styles.heroSubtitle}>{currentTripData.destination.city}, {currentTripData.destination.country}</Text>
                <View style={styles.heroDates}>
                  <Ionicons name="calendar" size={16} color="#fff" />
                  <Text style={styles.heroDateText}>
                    {currentTripData.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {currentTripData.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Progress Bar with Location Milestones */}
            <View style={styles.progressSection}>
              <Text style={styles.sectionTitle}>Trip Progress</Text>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>Day {getCurrentDay() + 1} of {currentTripData.dailyPlan.length}</Text>
                <Text style={styles.progressPercentage}>{Math.round(getTripProgress())}%</Text>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${getTripProgress()}%` }]} />
              </View>
              
              {/* Location Milestones */}
              <View style={styles.milestonesContainer}>
                {currentTripData.locations.map((location, index) => {
                  const isCompleted = index < getCurrentLocation();
                  const isCurrent = index === getCurrentLocation();
                  const milestonePosition = (index / (currentTripData.locations.length - 1)) * 100;
                  
                  return (
                    <View 
                      key={index} 
                      style={[styles.milestone, { left: `${milestonePosition}%` }]}
                    >
                      <View style={[
                        styles.milestoneMarker,
                        isCompleted && styles.milestoneCompleted,
                        isCurrent && styles.milestoneCurrent
                      ]}>
                        <Text style={styles.milestoneEmoji}>{location.emoji}</Text>
                      </View>
                      <Text style={[styles.milestoneName, isCurrent && styles.milestoneNameCurrent]}>
                        {location.name}
                      </Text>
                      <Text style={styles.milestoneDate}>{location.date}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Today's Schedule */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Today's Schedule</Text>
              <View style={styles.todayCard}>
                <View style={styles.todayHeader}>
                  <Text style={styles.todayDate}>{currentTripData.dailyPlan[getCurrentDay()].date}</Text>
                  <Text style={styles.todayDay}>{currentTripData.dailyPlan[getCurrentDay()].day}</Text>
                </View>
                
                <Text style={styles.scheduleSubheading}>Activities</Text>
                {currentTripData.dailyPlan[getCurrentDay()].activities.map((activity, idx) => (
                  <View key={idx} style={styles.activityItem}>
                    <View style={styles.activityDot} />
                    <Text style={styles.activityText}>{activity}</Text>
                  </View>
                ))}
                
                {currentTripData.dailyPlan[getCurrentDay()].restaurants && currentTripData.dailyPlan[getCurrentDay()].restaurants.length > 0 && (
                  <>
                    <Text style={[styles.scheduleSubheading, { marginTop: 12 }]}>Restaurants</Text>
                    {currentTripData.dailyPlan[getCurrentDay()].restaurants.map((restaurant, idx) => (
                      <View key={idx} style={styles.activityItem}>
                        <Ionicons name="restaurant" size={12} color="#0fa3a3" style={{ marginTop: 4, marginRight: 10 }} />
                        <Text style={styles.activityText}>
                          {restaurant.name} <Text style={styles.restaurantTime}>({restaurant.time})</Text>
                        </Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
            </View>

            {/* Calendar View */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Full Itinerary</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calendarScroll}>
                {currentTripData.dailyPlan.map((day, index) => {
                  const isToday = index === getCurrentDay();
                  const isPast = index < getCurrentDay();
                  
                  return (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.dayCard,
                        isToday && styles.dayCardToday,
                        isPast && styles.dayCardPast
                      ]}
                    >
                      <Text style={[styles.dayCardDate, isToday && styles.dayCardDateToday]}>{day.date}</Text>
                      <Text style={[styles.dayCardDay, isToday && styles.dayCardDayToday]}>{day.day}</Text>
                      
                      <View style={styles.dayCardActivities}>
                        {day.activities.slice(0, 2).map((activity, idx) => (
                          <Text key={idx} style={[styles.dayCardActivity, isToday && { color: '#fff' }]} numberOfLines={1}>• {activity}</Text>
                        ))}
                        {day.activities.length > 2 && (
                          <Text style={[styles.dayCardMore, isToday && { color: '#d0e8e8' }]}>+{day.activities.length - 2} more</Text>
                        )}
                      </View>
                      
                      {day.restaurants && day.restaurants.length > 0 && (
                        <View style={styles.dayCardRestaurants}>
                          <View style={styles.dayCardRestaurantHeader}>
                            <Ionicons name="restaurant" size={10} color={isToday ? '#fff' : '#0fa3a3'} />
                            <Text style={[styles.dayCardRestaurantLabel, isToday && { color: '#fff' }]}>Restaurants</Text>
                          </View>
                          {day.restaurants.slice(0, 1).map((restaurant, idx) => (
                            <View key={idx}>
                              <Text style={[styles.dayCardRestaurant, isToday && { color: '#e0f2f2' }]} numberOfLines={1}>
                                {restaurant.name}
                              </Text>
                              <Text style={[styles.dayCardRestaurantTime, isToday && { color: '#b0d8d8' }]}>
                                {restaurant.time}
                              </Text>
                            </View>
                          ))}
                          {day.restaurants.length > 1 && (
                            <Text style={[styles.dayCardMore, isToday && { color: '#d0e8e8' }]}>+{day.restaurants.length - 1} more</Text>
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Budget Tracker */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Budget Tracker</Text>
              <View style={styles.budgetOverview}>
                <View style={styles.budgetTotal}>
                  <Text style={styles.budgetLabel}>Total Budget</Text>
                  <Text style={styles.budgetAmount}>${currentTripData.budget.total}</Text>
                </View>
                <View style={styles.budgetSpent}>
                  <Text style={styles.budgetLabel}>Spent</Text>
                  <Text style={[styles.budgetAmount, styles.budgetSpentAmount]}>${currentTripData.budget.spent}</Text>
                </View>
                <View style={styles.budgetRemaining}>
                  <Text style={styles.budgetLabel}>Remaining</Text>
                  <Text style={[styles.budgetAmount, styles.budgetRemainingAmount]}>
                    ${currentTripData.budget.total - currentTripData.budget.spent}
                  </Text>
                </View>
              </View>
              
              <View style={styles.budgetBar}>
                <View style={[styles.budgetBarFill, { width: `${(currentTripData.budget.spent / currentTripData.budget.total) * 100}%` }]} />
              </View>
              
              {currentTripData.budget.categories.map((category, index) => (
                <View key={index} style={styles.budgetCategory}>
                  <View style={styles.budgetCategoryHeader}>
                    <Text style={styles.budgetCategoryName}>{category.name}</Text>
                    <Text style={styles.budgetCategoryAmount}>${category.spent} / ${category.budgeted}</Text>
                  </View>
                  <View style={styles.budgetCategoryBar}>
                    <View style={[
                      styles.budgetCategoryBarFill, 
                      { width: `${Math.min((category.spent / category.budgeted) * 100, 100)}%` },
                      category.spent > category.budgeted && { backgroundColor: '#ff4444' }
                    ]} />
                  </View>
                </View>
              ))}
            </View>

            {/* Weather Forecast */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weather Forecast</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weatherScroll}>
                {currentTripData.weather.map((weather, index) => (
                  <View key={index} style={styles.weatherCard}>
                    <Text style={styles.weatherDate}>{weather.date}</Text>
                    <Ionicons name={weather.icon as any} size={32} color="#0fa3a3" />
                    <Text style={styles.weatherTemp}>{weather.temp}</Text>
                    <Text style={styles.weatherCondition}>{weather.condition}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Checklist */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trip Checklist</Text>
              {currentTripData.checklist.map((item, index) => (
                <TouchableOpacity key={index} style={styles.checklistItem}>
                  <View style={[styles.checkbox, item.completed && styles.checkboxCompleted]}>
                    {item.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                  <Text style={[styles.checklistText, item.completed && styles.checklistTextCompleted]}>
                    {item.item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trip Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="location" size={24} color="#0fa3a3" />
                  <Text style={styles.statValue}>{currentTripData.locations.length}</Text>
                  <Text style={styles.statLabel}>Locations</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="calendar" size={24} color="#0fa3a3" />
                  <Text style={styles.statValue}>{currentTripData.dailyPlan.length}</Text>
                  <Text style={styles.statLabel}>Days</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="people" size={24} color="#0fa3a3" />
                  <Text style={styles.statValue}>{currentTripData.collaborators.length + 1}</Text>
                  <Text style={styles.statLabel}>Travelers</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="heart" size={24} color="#0fa3a3" />
                  <Text style={styles.statValue}>{currentTripData.likes}</Text>
                  <Text style={styles.statLabel}>Likes</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
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
              <Text style={styles.modalTitle}>{showCreateForm ? 'Create New Trip' : 'Add a Trip'}</Text>
              <TouchableOpacity onPress={() => {
                setShowCreateModal(false);
                setShowCreateForm(false);
              }}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {!showCreateForm ? (
              <View style={styles.tripOptionsContainer}>
                <TouchableOpacity 
                  style={styles.tripOptionCard}
                  onPress={() => setShowCreateForm(true)}
                >
                  <View style={styles.tripOptionIcon}>
                    <Ionicons name="add-circle" size={48} color="#0fa3a3" />
                  </View>
                  <Text style={styles.tripOptionTitle}>Create a Trip</Text>
                  <Text style={styles.tripOptionDescription}>
                    Manually create a new trip from scratch
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.tripOptionCard}
                  onPress={() => {
                    setShowCreateModal(false);
                    router.push('/(tabs)/bucket-list');
                  }}
                >
                  <View style={styles.tripOptionIcon}>
                    <Ionicons name="download" size={48} color="#0fa3a3" />
                  </View>
                  <Text style={styles.tripOptionTitle}>Import from Bucket List</Text>
                  <Text style={styles.tripOptionDescription}>
                    Choose a trip from your bucket list or friends' lists
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
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
                
                <View style={styles.formButtonRow}>
                  <TouchableOpacity 
                    style={[styles.formButton, styles.backButton]}
                    onPress={() => setShowCreateForm(false)}
                  >
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.formButton, styles.createTripButton]}
                    onPress={() => {
                      handleCreateTrip();
                      setShowCreateForm(false);
                    }}
                  >
                    <Text style={styles.createTripButtonText}>Create Trip</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
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
                  
                  {(selectedTrip as any).restaurants && (selectedTrip as any).restaurants.length > 0 && (
                    <View style={styles.tripDetailSection}>
                      <View style={styles.tripDetailRow}>
                        <Ionicons name="restaurant" size={22} color="#0fa3a3" />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.tripDetailLabel}>Restaurants</Text>
                          {(selectedTrip as any).restaurants.map((restaurant: any, index: number) => (
                            <View key={index} style={styles.listItem}>
                              <Text style={styles.listItemName}>{restaurant.name}</Text>
                              <Text style={styles.listItemDetail}>
                                {restaurant.cuisine} • <Text style={{ color: '#22c55e', fontWeight: '600' }}>{restaurant.rating}</Text>
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  )}
                  
                  {(selectedTrip as any).hotels && (selectedTrip as any).hotels.length > 0 && (
                    <View style={styles.tripDetailSection}>
                      <View style={styles.tripDetailRow}>
                        <Ionicons name="bed" size={22} color="#0fa3a3" />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.tripDetailLabel}>Hotels</Text>
                          {(selectedTrip as any).hotels.map((hotel: any, index: number) => (
                            <View key={index} style={styles.listItem}>
                              <Text style={styles.listItemName}>{hotel.name}</Text>
                              <Text style={styles.listItemDetail}>
                                {hotel.area} • <Text style={{ color: '#22c55e', fontWeight: '600' }}>{hotel.rating}</Text>
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  )}
                  
                  {(selectedTrip as any).activities && (selectedTrip as any).activities.length > 0 && (
                    <View style={styles.tripDetailSection}>
                      <View style={styles.tripDetailRow}>
                        <Ionicons name="compass" size={22} color="#0fa3a3" />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.tripDetailLabel}>Activities</Text>
                          {(selectedTrip as any).activities.map((activity: any, index: number) => (
                            <View key={index} style={styles.listItem}>
                              <Text style={styles.listItemName}>{activity.name}</Text>
                              <Text style={styles.listItemDetail}>
                                {activity.duration} • <Text style={{ color: '#22c55e', fontWeight: '600' }}>{activity.rating}</Text>
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  )}
                  
                  {(selectedTrip as any).bestTime && (
                    <View style={styles.tripDetailSection}>
                      <View style={styles.tripDetailRow}>
                        <Ionicons name="sunny" size={22} color="#0fa3a3" />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.tripDetailLabel}>Best Time to Visit</Text>
                          <Text style={styles.tripDetailValue}>{(selectedTrip as any).bestTime}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                  
                  {(selectedTrip as any).estimatedBudget && (
                    <View style={styles.tripDetailSection}>
                      <View style={styles.tripDetailRow}>
                        <Ionicons name="cash" size={22} color="#0fa3a3" />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.tripDetailLabel}>Estimated Budget</Text>
                          <Text style={styles.tripDetailValue}>{(selectedTrip as any).estimatedBudget}</Text>
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
    height: '90%',
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
  // Current Trip Progress Styles
  currentTripContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  heroSection: {
    position: 'relative',
    height: 250,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  heroDates: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroDateText: {
    fontSize: 14,
    color: '#fff',
  },
  progressSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0fa3a3',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 40,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0fa3a3',
    borderRadius: 4,
  },
  milestonesContainer: {
    position: 'relative',
    height: 80,
  },
  milestone: {
    position: 'absolute',
    alignItems: 'center',
    width: 60,
    marginLeft: -30,
  },
  milestoneMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 3,
    borderColor: '#fff',
  },
  milestoneCompleted: {
    backgroundColor: '#22c55e',
  },
  milestoneCurrent: {
    backgroundColor: '#0fa3a3',
    transform: [{ scale: 1.1 }],
  },
  milestoneEmoji: {
    fontSize: 20,
  },
  milestoneName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  milestoneNameCurrent: {
    color: '#0fa3a3',
    fontWeight: 'bold',
  },
  milestoneDate: {
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  todayCard: {
    backgroundColor: '#f0f9f9',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0fa3a3',
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d0e8e8',
  },
  todayDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0fa3a3',
  },
  todayDay: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0fa3a3',
    marginTop: 6,
    marginRight: 10,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  scheduleSubheading: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0fa3a3',
    marginBottom: 8,
    marginTop: 4,
  },
  restaurantTime: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  calendarScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  dayCard: {
    width: 140,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
  },
  dayCardToday: {
    backgroundColor: '#0fa3a3',
  },
  dayCardPast: {
    opacity: 0.6,
  },
  dayCardDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  dayCardDateToday: {
    color: '#fff',
  },
  dayCardDay: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  dayCardDayToday: {
    color: '#e0f2f2',
  },
  dayCardActivities: {
    gap: 4,
  },
  dayCardActivity: {
    fontSize: 11,
    color: '#666',
  },
  dayCardMore: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },
  dayCardRestaurants: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  dayCardRestaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  dayCardRestaurantLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0fa3a3',
  },
  dayCardRestaurant: {
    fontSize: 10,
    color: '#666',
    marginLeft: 14,
  },
  dayCardRestaurantTime: {
    fontSize: 9,
    color: '#999',
    marginLeft: 14,
    fontStyle: 'italic',
    marginTop: 2,
  },
  budgetOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  budgetTotal: {
    flex: 1,
  },
  budgetSpent: {
    flex: 1,
    alignItems: 'center',
  },
  budgetRemaining: {
    flex: 1,
    alignItems: 'flex-end',
  },
  budgetLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  budgetSpentAmount: {
    color: '#ff9800',
  },
  budgetRemainingAmount: {
    color: '#22c55e',
  },
  budgetBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  budgetBarFill: {
    height: '100%',
    backgroundColor: '#ff9800',
    borderRadius: 4,
  },
  budgetCategory: {
    marginBottom: 16,
  },
  budgetCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetCategoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  budgetCategoryAmount: {
    fontSize: 13,
    color: '#666',
  },
  budgetCategoryBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  budgetCategoryBarFill: {
    height: '100%',
    backgroundColor: '#0fa3a3',
    borderRadius: 3,
  },
  weatherScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  weatherCard: {
    width: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
  },
  weatherDate: {
    fontSize: 11,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  weatherTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  weatherCondition: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0fa3a3',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#0fa3a3',
  },
  checklistText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  checklistTextCompleted: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0fa3a3',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listItem: {
    marginTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  listItemDetail: {
    fontSize: 14,
    color: '#666',
  },
  tripOptionsContainer: {
    padding: 20,
    gap: 16,
  },
  tripOptionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  tripOptionIcon: {
    marginBottom: 16,
  },
  tripOptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  tripOptionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  formButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  formButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: '#f0f0f0',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
