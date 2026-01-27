import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  Animated, 
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { bucketListApi, BucketListItem, supabase } from '@/lib/supabase';

// Need to enable layout animations on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface BucketListState {
  items: BucketListItem[];
  searchQuery: string;
  isAdding: boolean;
  newItem: {
    name: string;
    location: string;
    notes: string;
    priority: 'high' | 'medium' | 'low';
  };
  isLoading: boolean;
  friends: FriendBucketList[];
  friendsLoading: boolean;
  viewMode: 'my' | 'friends';
  availableTrips: FriendBucketList[];
  selectedItem: BucketListItem | null;
  selectedFriendTrip: FriendBucketList | null;
  showDetailModal: boolean;
  showFriendDetailModal: boolean;
  showEditModal: boolean;
  editItem: {
    name: string;
    location: string;
    notes: string;
    priority: 'high' | 'medium' | 'low';
  };
  requestedTrips: Set<string>;
}

interface FriendBucketList {
  userId: string;
  name: string;
  avatar: string;
  itemsCount: number;
  previewImage: string;
  tripTitle: string;
  dates: string;
  location: string;
  notes?: string;
  activities?: string[];
  hotels?: string[];
  restaurants?: string[];
  flights?: string;
  best_time?: string;
  estimated_budget?: string;
  duration?: string;
}

export default function BucketListScreen() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [state, setState] = useState<BucketListState>({
    items: [],
    searchQuery: '',
    isAdding: false,
    newItem: { name: '', location: '', notes: '', priority: 'medium' },
    isLoading: true,
    friends: [],
    friendsLoading: true,
    viewMode: 'my',
    availableTrips: [],
    selectedItem: null,
    selectedFriendTrip: null,
    showDetailModal: false,
    showFriendDetailModal: false,
    showEditModal: false,
    editItem: { name: '', location: '', notes: '', priority: 'medium' },
    requestedTrips: new Set<string>(),
  });

  const { items, searchQuery, isAdding, newItem, isLoading, friends, friendsLoading, viewMode, availableTrips, selectedItem, selectedFriendTrip, showDetailModal, showFriendDetailModal, showEditModal, editItem, requestedTrips } = state;

  const updateState = (updates: Partial<BucketListState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleInputChange = (field: keyof typeof newItem, value: string) => {
    setState(prev => ({
      ...prev,
      newItem: {
        ...prev.newItem,
        [field]: value
      }
    }));
  };

  const handleSearch = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  const fetchBucketList = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Using the same mock items as the profile tab for consistency
      const PROFILE_BUCKET_MOCK: BucketListItem[] = [
        {
          id: 'b1',
          user_id: user?.id ?? 'mock',
          name: 'Santorini Sunset',
          location: 'Santorini, Greece',
          notes: 'Watch the famous sunset in Oia, explore white-washed villages, and relax on unique beaches.',
          priority: 'high',
          is_completed: false,
          image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=800&auto=format&fit=crop',
          created_at: new Date().toISOString(),
          activities: ['Sunset viewing in Oia', 'Wine tasting tour', 'Red Beach visit', 'Boat tour to volcano', 'Explore Fira town'],
          hotels: ['Katikies Hotel', 'Canaves Oia Suites', 'Grace Hotel Santorini'],
          restaurants: ['Ammoudi Fish Tavern', 'Metaxi Mas', 'Selene Restaurant'],
          flights: 'Direct flights from Athens (ATH) to Santorini (JTR) - 45 min. International: Connect through Athens.',
          best_time: 'April to November (peak: June-September)',
          estimated_budget: '$2,500 - $4,000',
          duration: '4-5 days',
        },
        {
          id: 'b2',
          user_id: user?.id ?? 'mock',
          name: 'Safari in Maasai Mara',
          location: 'Narok, Kenya',
          notes: 'Experience the Great Migration and see the Big Five in their natural habitat.',
          priority: 'high',
          is_completed: false,
          image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
          created_at: new Date().toISOString(),
          activities: ['Game drives', 'Hot air balloon safari', 'Visit Maasai village', 'Photography safari', 'Bush dinner'],
          hotels: ['Mara Serena Safari Lodge', 'Governors\' Camp', 'Angama Mara'],
          restaurants: ['Lodge dining (included in safari packages)'],
          flights: 'Fly to Nairobi (NBO), then domestic flight to Maasai Mara or drive (5-6 hours).',
          best_time: 'July to October (Great Migration)',
          estimated_budget: '$3,000 - $6,000',
          duration: '5-7 days',
        },
        {
          id: 'b3',
          user_id: user?.id ?? 'mock',
          name: 'Northern Lights',
          location: 'Reykjavík, Iceland',
          notes: 'Chase the Aurora Borealis and explore Iceland\'s stunning winter landscapes.',
          priority: 'medium',
          is_completed: false,
          image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800',
          created_at: new Date().toISOString(),
          activities: ['Northern Lights tour', 'Blue Lagoon spa', 'Golden Circle tour', 'Ice cave exploration', 'Glacier hiking'],
          hotels: ['Hotel Rangá', 'Ion Adventure Hotel', 'Reykjavik Konsulat Hotel'],
          restaurants: ['Dill Restaurant', 'Grillmarkaðurinn', 'Fiskfélagið'],
          flights: 'Direct flights available from major US/European cities to Keflavík (KEF) - 5-7 hours.',
          best_time: 'September to March (peak: December-February)',
          estimated_budget: '$2,000 - $3,500',
          duration: '5-6 days',
        },
      ];

      // Show mock data if user isn't logged in
      if (!user) {
        updateState({ items: PROFILE_BUCKET_MOCK, isLoading: false });
        return;
      }

      const data = await bucketListApi.getBucketList(user.id);
      const existingIds = new Set(data.map((d) => d.id));
      const merged = PROFILE_BUCKET_MOCK.filter((m) => !existingIds.has(m.id)).concat(data);
      updateState({ items: merged, isLoading: false });
    } catch (error) {
      console.error('Error fetching bucket list:', error);
      // Show fallback data if fetch fails
      updateState({ items: [
        {
          id: 'b1', user_id: 'mock', name: 'Santorini Sunset', location: 'Santorini, Greece', notes: 'May 20 - Jun 5, 2026',
          priority: 'medium', is_completed: false,
          image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=800&auto=format&fit=crop', created_at: new Date().toISOString(),
        },
        {
          id: 'b2', user_id: 'mock', name: 'Safari in Maasai Mara', location: 'Narok, Kenya', notes: 'Jul 10 - Jul 25, 2026',
          priority: 'medium', is_completed: false,
          image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800', created_at: new Date().toISOString(),
        },
        {
          id: 'b3', user_id: 'mock', name: 'Northern Lights', location: 'Reykjavík, Iceland', notes: 'Dec 1 - Dec 15, 2026',
          priority: 'medium', is_completed: false,
          image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800', created_at: new Date().toISOString(),
        },
      ], isLoading: false });
    }
  };

  useEffect(() => {
    fetchBucketList();
    
    // Mock data for trips you can request to join
    const availableTripsData: FriendBucketList[] = [
      {
        userId: 'u_david',
        name: 'David Kim',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
        itemsCount: 6,
        previewImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop',
        tripTitle: 'Japan Cherry Blossoms',
        dates: 'Mar 25 - Apr 8, 2026',
        location: 'Tokyo, Kyoto, Osaka',
        notes: 'Experience the magical cherry blossom season across Japan\'s most iconic cities, from ancient temples to modern metropolises.',
        activities: ['Cherry blossom viewing in Ueno Park', 'Visit Senso-ji Temple', 'Fushimi Inari Shrine', 'Arashiyama Bamboo Grove', 'Osaka Castle tour'],
        hotels: ['Park Hyatt Tokyo', 'The Ritz-Carlton Kyoto', 'Conrad Osaka'],
        restaurants: ['Sukiyabashi Jiro', 'Kikunoi Honten', 'Dotonbori Street Food'],
        flights: 'Direct flights to Tokyo (NRT/HND), then Shinkansen between cities.',
        best_time: 'Late March to early April',
        estimated_budget: '$3,500 - $5,500',
        duration: '14 days',
      },
      {
        userId: 'u_emma',
        name: 'Emma Wilson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
        itemsCount: 9,
        previewImage: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=800&auto=format&fit=crop',
        tripTitle: 'Australian Outback',
        dates: 'Apr 15 - May 5, 2026',
        location: 'Sydney, Melbourne, Cairns',
        notes: 'Explore Australia\'s diverse landscapes from cosmopolitan cities to the Great Barrier Reef and the rugged Outback.',
        activities: ['Sydney Opera House tour', 'Great Barrier Reef snorkeling', 'Uluru sunrise viewing', 'Great Ocean Road drive', 'Daintree Rainforest'],
        hotels: ['Park Hyatt Sydney', 'Crown Towers Melbourne', 'Shangri-La Cairns'],
        restaurants: ['Quay Restaurant', 'Attica', 'Ochre Restaurant'],
        flights: 'Fly into Sydney (SYD), domestic flights between cities.',
        best_time: 'April to October',
        estimated_budget: '$4,000 - $6,500',
        duration: '20 days',
      },
      {
        userId: 'u_carlos',
        name: 'Carlos Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
        itemsCount: 7,
        previewImage: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=800&auto=format&fit=crop',
        tripTitle: 'Caribbean Paradise',
        dates: 'Feb 10 - Feb 24, 2026',
        location: 'Jamaica, Bahamas, Aruba',
        notes: 'Island hopping adventure through the Caribbean\'s most beautiful beaches and vibrant cultures.',
        activities: ['Dunn\'s River Falls climb', 'Snorkeling in Nassau', 'Arikok National Park', 'Bob Marley Museum', 'Beach hopping'],
        hotels: ['Round Hill Hotel Jamaica', 'Atlantis Paradise Island', 'Bucuti & Tara Beach Resort'],
        restaurants: ['Scotchies Jamaica', 'Graycliff Restaurant', 'The Flying Fishbone'],
        flights: 'Fly into Montego Bay (MBJ), then island hop via regional flights.',
        best_time: 'December to April',
        estimated_budget: '$3,000 - $5,000',
        duration: '14 days',
      },
      {
        userId: 'u_lily',
        name: 'Lily Zhang',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        itemsCount: 11,
        previewImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=800&auto=format&fit=crop',
        tripTitle: 'African Safari',
        dates: 'Jul 5 - Jul 22, 2026',
        location: 'Tanzania, Kenya, South Africa',
        notes: 'Ultimate African safari experience witnessing the Great Migration and exploring diverse wildlife across three countries.',
        activities: ['Serengeti game drives', 'Maasai Mara safari', 'Kruger National Park', 'Hot air balloon safari', 'Visit Maasai village'],
        hotels: ['Four Seasons Safari Lodge', 'Angama Mara', 'Singita Kruger National Park'],
        restaurants: ['Carnivore Restaurant Nairobi', 'The Boma Dinner', 'Moyo Melrose Arch'],
        flights: 'Fly into Kilimanjaro (JRO) or Nairobi (NBO), domestic flights between parks.',
        best_time: 'June to October',
        estimated_budget: '$5,000 - $8,500',
        duration: '17 days',
      },
    ];
    
    // Mock data for trips you've already joined
    const mockFriends: FriendBucketList[] = [
      {
        userId: 'u_anna',
        name: 'Anna Rivera',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
        itemsCount: 8,
        previewImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop',
        tripTitle: 'European Adventure',
        dates: 'Jun 15 - Jul 2, 2026',
        location: 'Italy, France, Switzerland',
        notes: 'Multi-country European tour covering the best of Italy, France, and Switzerland with a mix of culture, food, and scenic beauty.',
        activities: ['Colosseum tour in Rome', 'Eiffel Tower visit', 'Swiss Alps hiking', 'Venice gondola ride', 'Wine tasting in Tuscany'],
        hotels: ['Hotel Artemide Rome', 'Hotel Le Six Paris', 'Hotel Schweizerhof Bern'],
        restaurants: ['Trattoria Da Enzo', 'Le Comptoir du Relais', 'Restaurant Rosengarten'],
        flights: 'Fly into Rome (FCO), travel by train between cities, depart from Zurich (ZRH).',
        best_time: 'May to September',
        estimated_budget: '$4,500 - $7,000',
        duration: '17 days',
      },
      {
        userId: 'u_marcus',
        name: 'Marcus Lee',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
        itemsCount: 12,
        previewImage: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=800&auto=format&fit=crop',
        tripTitle: 'Desert Road Trip',
        dates: 'Aug 10 - Aug 24, 2026',
        location: 'Arizona, Utah, Nevada',
      },
      {
        userId: 'u_samira',
        name: 'Samira K.',
        avatar: 'https://images.unsplash.com/photo-1541214113241-7f4f6b1659a0?q=80&w=200&auto=format&fit=crop',
        itemsCount: 5,
        previewImage: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=800&auto=format&fit=crop',
        tripTitle: 'Asian Temples Tour',
        dates: 'Sep 5 - Sep 18, 2026',
        location: 'Thailand, Cambodia, Vietnam',
      },
      {
        userId: 'u_james',
        name: 'James Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
        itemsCount: 15,
        previewImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=800&auto=format&fit=crop',
        tripTitle: 'South America Explorer',
        dates: 'Oct 1 - Oct 30, 2026',
        location: 'Peru, Chile, Argentina',
      },
      {
        userId: 'u_sofia',
        name: 'Sofia Martinez',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
        itemsCount: 10,
        previewImage: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=800&auto=format&fit=crop',
        tripTitle: 'Island Hopping',
        dates: 'Nov 12 - Nov 28, 2026',
        location: 'Maldives, Seychelles, Mauritius',
      },
    ];
    updateState({ friends: mockFriends, friendsLoading: false, availableTrips: availableTripsData });
    
    // Animate in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const requestToJoin = async (friendId: string) => {
    const newRequested = new Set(requestedTrips);
    newRequested.add(friendId);
    updateState({ requestedTrips: newRequested });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Alert.alert('Request Sent', 'Your request to join has been sent!');
  };

  const addBucketListItem = async () => {
    if (!newItem.name.trim()) return;
    
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      
      const addedItem = await bucketListApi.addItem({
        name: newItem.name,
        location: newItem.location,
        notes: newItem.notes || null,
        priority: newItem.priority,
        is_completed: false,
        image: `https://source.unsplash.com/random/300x200/?travel,${encodeURIComponent(newItem.name || 'travel')}`,
      });

      updateState({
        items: [addedItem, ...items],
        newItem: { name: '', location: '', notes: '', priority: 'medium' },
        isAdding: false,
      });
    } catch (error) {
      console.error('Error adding bucket list item:', error);
    }
  };

  const toggleItemCompletion = async (id: string, currentStatus: boolean) => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await bucketListApi.toggleCompletion(id, currentStatus);
      
      updateState({
        items: items.map(item => 
          item.id === id ? { ...item, is_completed: !currentStatus } : item
        )
      });
    } catch (error) {
      console.error('Error toggling item completion:', error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await bucketListApi.deleteItem(id);
      updateState({
        items: items.filter(item => item.id !== id)
      });
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const filteredItems = items.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      (item.location?.toLowerCase() || '').includes(searchLower)
    );
  });

  const renderItem = ({ item }: { item: BucketListItem }) => (
    <TouchableOpacity 
      style={styles.friendBucketCard}
      onPress={() => {
        updateState({ selectedItem: item, showDetailModal: true });
      }}
      activeOpacity={0.7}
    >
      {item.image ? (
        <Image 
          source={{ uri: item.image }} 
          style={styles.friendBucketPreview} 
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.friendBucketPreview, { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="image-outline" size={48} color="#999" />
        </View>
      )}
      <View style={styles.friendBucketInfo}>
        <View style={styles.myListItemHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.friendBucketName}>{item.name}</Text>
            {item.location && (
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={12} color="#666" />
                <Text style={styles.friendBucketMeta}>{item.location}</Text>
              </View>
            )}
            {item.notes && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Ionicons name="calendar-outline" size={12} color="#666" />
                <Text style={[styles.friendBucketMeta, { marginLeft: 4 }]}>{item.notes}</Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity 
              style={[
                styles.checkboxSmall,
                item.is_completed && styles.checkboxCompleted
              ]}
              onPress={() => toggleItemCompletion(item.id, item.is_completed)}
            >
              {item.is_completed && (
                <Ionicons name="checkmark" size={14} color="#fff" />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => deleteItem(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 80 }}
      >
        {/* Friends' Bucket Lists */}
        <View style={styles.friendsSection}>
          <View style={styles.friendsHeader}>
            <Text style={styles.friendsTitle}>Friends' Bucket Lists</Text>
            <TouchableOpacity>
              <Text style={styles.friendsSeeAll}>See All</Text>
            </TouchableOpacity>
          </View>
        <FlatList
          horizontal
          data={state.availableTrips}
          keyExtractor={(f) => f.userId}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.friendsList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.friendCard}
              onPress={() => updateState({ selectedFriendTrip: item, showFriendDetailModal: true })}
              activeOpacity={0.8}
            >
              <Image source={{ uri: item.previewImage }} style={styles.friendPreview} />
              <View style={styles.friendCardContent}>
                <Text style={styles.friendTripTitle} numberOfLines={1}>{item.tripTitle}</Text>
                <Text style={styles.friendTripDates}>{item.dates}</Text>
                <View style={styles.friendInfoRow}>
                  <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.friendName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.friendMeta}>{item.itemsCount} people</Text>
                  </View>
                  <TouchableOpacity 
                    style={[
                      styles.joinBtn,
                      requestedTrips.has(item.userId) && styles.requestedBtn
                    ]} 
                    onPress={(e) => {
                      e.stopPropagation();
                      requestToJoin(item.userId);
                    }}
                    disabled={requestedTrips.has(item.userId)}
                  >
                    <Text style={[
                      styles.joinBtnText,
                      requestedTrips.has(item.userId) && styles.requestedBtnText
                    ]}>
                      {requestedTrips.has(item.userId) ? 'Requested' : 'Join'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            state.friendsLoading ? (
              <View style={styles.friendsEmpty}><ActivityIndicator color="#0fa3a3" /></View>
            ) : null
          }
        />
      </View>

      {/* Toggle View Mode */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, state.viewMode === 'my' && styles.toggleButtonActive]}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            updateState({ viewMode: 'my' });
          }}
        >
          <Ionicons 
            name="person" 
            size={18} 
            color={state.viewMode === 'my' ? '#fff' : '#0fa3a3'} 
          />
          <Text style={[styles.toggleText, state.viewMode === 'my' && styles.toggleTextActive]}>
            My Lists
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, state.viewMode === 'friends' && styles.toggleButtonActive]}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            updateState({ viewMode: 'friends' });
          }}
        >
          <Ionicons 
            name="people" 
            size={18} 
            color={state.viewMode === 'friends' ? '#fff' : '#0fa3a3'} 
          />
          <Text style={[styles.toggleText, state.viewMode === 'friends' && styles.toggleTextActive]}>
            Joined Lists
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>{state.viewMode === 'my' ? 'My Bucket List' : "Joined Lists"}</Text>
        {state.viewMode === 'my' && (
          <TouchableOpacity 
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              updateState({ isAdding: !isAdding });
            }}
          >
            <Ionicons 
              name={isAdding ? 'close' : 'add'} 
              size={28} 
              color="#0fa3a3" 
            />
          </TouchableOpacity>
        )}
      </View>

      

      {state.viewMode === 'my' && isAdding && (
        <Animated.View 
          style={[
            styles.addForm, 
            { 
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0]
                })
              }]
            }
          ]}
        >
          <Text style={styles.addTitle}>Add to Bucket List</Text>
          <TextInput
            style={styles.input}
            placeholder="Destination name (required)"
            value={newItem.name}
            onChangeText={(text) => handleInputChange('name', text)}
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Location (city, country)"
            value={newItem.location}
            onChangeText={(text) => handleInputChange('location', text)}
            placeholderTextColor="#999"
          />
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Notes (optional)"
            value={newItem.notes}
            onChangeText={(text) => handleInputChange('notes', text)}
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
          <View style={styles.priorityContainer}>
            <Text style={styles.priorityLabel}>Priority:</Text>
            {['high', 'medium', 'low'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.priorityButton,
                  newItem.priority === level && styles[`${level}PriorityButton`]
                ]}
                onPress={() => handleInputChange('priority', level as 'high' | 'medium' | 'low')}
              >
                <Text 
                  style={[
                    styles.priorityButtonText,
                    newItem.priority === level && styles[`${level}PriorityText`]
                  ]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity 
            style={[
              styles.addButton,
              { opacity: newItem.name.trim() ? 1 : 0.6 }
            ]}
            onPress={addBucketListItem}
            disabled={!newItem.name.trim()}
          >
            <Text style={styles.addButtonText}>
              {isLoading ? 'Adding...' : 'Add to Bucket List'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {state.viewMode === 'my' && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bucket list..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
        </View>
      )}

      {state.viewMode === 'my' && isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0fa3a3" />
        </View>
      ) : state.viewMode === 'my' ? (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="map-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No bucket list items yet</Text>
              <Text style={styles.emptySubtext}>Tap + to add your first destination</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={state.friends}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.friendBucketCard}
              onPress={() => updateState({ selectedFriendTrip: item, showFriendDetailModal: true })}
            >
              <Image source={{ uri: item.previewImage }} style={styles.friendBucketPreview} />
              <View style={styles.friendBucketInfo}>
                <Text style={styles.friendBucketTripTitle} numberOfLines={1}>{item.tripTitle}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Ionicons name="location-outline" size={13} color="#666" />
                  <Text style={[styles.friendBucketTripDates, { marginLeft: 4, marginBottom: 0 }]}>{item.location}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Ionicons name="calendar-outline" size={13} color="#666" />
                  <Text style={[styles.friendBucketTripDates, { marginLeft: 4, marginBottom: 0 }]}>{item.dates}</Text>
                </View>
                <View style={styles.friendBucketHeader}>
                  <Image source={{ uri: item.avatar }} style={styles.friendBucketAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.friendBucketName}>{item.name}</Text>
                    <Text style={styles.friendBucketMeta}>{item.itemsCount} destinations</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            state.friendsLoading ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#0fa3a3" />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No friends' bucket lists yet</Text>
                <Text style={styles.emptySubtext}>Connect with friends to see their lists</Text>
              </View>
            )
          }
        />
      )}
      </ScrollView>
      
      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => updateState({ showDetailModal: false, selectedItem: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.detailModalHeader}>
              <Text style={styles.detailModalTitle}>Trip Details</Text>
              <TouchableOpacity onPress={() => updateState({ showDetailModal: false, selectedItem: null })}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            
            {selectedItem ? (
              <ScrollView style={styles.detailModalBody} showsVerticalScrollIndicator={false}>
                {selectedItem.image && (
                  <Image 
                    source={{ uri: selectedItem.image }} 
                    style={styles.detailImage}
                    resizeMode="cover"
                  />
                )}
                
                <View style={styles.detailContent}>
                  <Text style={styles.detailName}>{selectedItem.name}</Text>
                  
                  {selectedItem.location && (
                    <View style={styles.detailRow}>
                      <Ionicons name="location" size={20} color="#0fa3a3" />
                      <Text style={styles.detailLocation}>{selectedItem.location}</Text>
                    </View>
                  )}
                  
                  {selectedItem.notes && (
                    <View style={styles.detailSection}>
                      <View style={styles.detailRow}>
                        <Ionicons name="document-text" size={20} color="#0fa3a3" />
                        <Text style={styles.detailSectionTitle}>About</Text>
                      </View>
                      <Text style={styles.detailNotes}>{selectedItem.notes}</Text>
                    </View>
                  )}
                  
                  {selectedItem.duration && (
                    <View style={styles.detailSection}>
                      <View style={styles.detailRow}>
                        <Ionicons name="time" size={20} color="#0fa3a3" />
                        <Text style={styles.detailSectionTitle}>Duration</Text>
                      </View>
                      <Text style={styles.detailText}>{selectedItem.duration}</Text>
                    </View>
                  )}
                  
                  {selectedItem.best_time && (
                    <View style={styles.detailSection}>
                      <View style={styles.detailRow}>
                        <Ionicons name="calendar" size={20} color="#0fa3a3" />
                        <Text style={styles.detailSectionTitle}>Best Time to Visit</Text>
                      </View>
                      <Text style={styles.detailText}>{selectedItem.best_time}</Text>
                    </View>
                  )}
                  
                  {selectedItem.estimated_budget && (
                    <View style={styles.detailSection}>
                      <View style={styles.detailRow}>
                        <Ionicons name="cash" size={20} color="#0fa3a3" />
                        <Text style={styles.detailSectionTitle}>Estimated Budget</Text>
                      </View>
                      <Text style={styles.detailText}>{selectedItem.estimated_budget}</Text>
                    </View>
                  )}
                  
                  {selectedItem.activities && selectedItem.activities.length > 0 && (
                    <View style={styles.detailSection}>
                      <View style={styles.detailRow}>
                        <Ionicons name="list" size={20} color="#0fa3a3" />
                        <Text style={styles.detailSectionTitle}>Activities</Text>
                      </View>
                      {selectedItem.activities.map((activity, index) => (
                        <View key={index} style={styles.listItem}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.listItemText}>{activity}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {selectedItem.hotels && selectedItem.hotels.length > 0 && (
                    <View style={styles.detailSection}>
                      <View style={styles.detailRow}>
                        <Ionicons name="bed" size={20} color="#0fa3a3" />
                        <Text style={styles.detailSectionTitle}>Hotels</Text>
                      </View>
                      {selectedItem.hotels.map((hotel, index) => (
                        <View key={index} style={styles.listItem}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.listItemText}>{hotel}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {selectedItem.restaurants && selectedItem.restaurants.length > 0 && (
                    <View style={styles.detailSection}>
                      <View style={styles.detailRow}>
                        <Ionicons name="restaurant" size={20} color="#0fa3a3" />
                        <Text style={styles.detailSectionTitle}>Restaurants</Text>
                      </View>
                      {selectedItem.restaurants.map((restaurant, index) => (
                        <View key={index} style={styles.listItem}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.listItemText}>{restaurant}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {selectedItem.flights && (
                    <View style={styles.detailSection}>
                      <View style={styles.detailRow}>
                        <Ionicons name="airplane" size={20} color="#0fa3a3" />
                        <Text style={styles.detailSectionTitle}>Flights</Text>
                      </View>
                      <Text style={styles.detailText}>{selectedItem.flights}</Text>
                    </View>
                  )}
                  
                  {selectedItem.priority && (
                    <View style={styles.detailSection}>
                      <View style={styles.detailRow}>
                        <Ionicons name="flag" size={20} color="#0fa3a3" />
                        <Text style={styles.detailSectionTitle}>Priority</Text>
                      </View>
                      <View style={[
                        styles.detailPriorityBadge,
                        selectedItem.priority === 'high' && styles.highPriorityBadge,
                        selectedItem.priority === 'medium' && styles.mediumPriorityBadge,
                        selectedItem.priority === 'low' && styles.lowPriorityBadge,
                      ]}>
                        <Text style={[
                          styles.priorityBadgeText,
                          selectedItem.priority === 'high' && styles.highPriorityText,
                          selectedItem.priority === 'medium' && styles.mediumPriorityText,
                          selectedItem.priority === 'low' && styles.lowPriorityText,
                        ]}>
                          {selectedItem.priority.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                      <Ionicons name="checkmark-circle" size={20} color="#0fa3a3" />
                      <Text style={styles.detailSectionTitle}>Status</Text>
                    </View>
                    <Text style={[
                      styles.statusText,
                      selectedItem.is_completed && styles.statusCompleted
                    ]}>
                      {selectedItem.is_completed ? 'Completed ✓' : 'Not completed yet'}
                    </Text>
                  </View>
                  
                  <View style={styles.detailActions}>
                    <TouchableOpacity 
                      style={[styles.detailButton, styles.editButton]}
                      onPress={() => {
                        updateState({ 
                          editItem: {
                            name: selectedItem.name,
                            location: selectedItem.location || '',
                            notes: selectedItem.notes || '',
                            priority: selectedItem.priority || 'medium'
                          },
                          showEditModal: true,
                          showDetailModal: false
                        });
                      }}
                    >
                      <Ionicons name="create" size={20} color="#fff" />
                      <Text style={styles.detailButtonText}>Edit</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.detailButton, styles.makeTripButton]}
                      onPress={() => {
                        Alert.alert(
                          'Create Trip',
                          `Create a trip for "${selectedItem.name}"?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                              text: 'Create', 
                              onPress: () => {
                                // Navigate to trips tab with the bucket list item data
                                router.push({
                                  pathname: '/(tabs)/trips',
                                  params: {
                                    fromBucketList: 'true',
                                    tripName: selectedItem.name,
                                    destination: selectedItem.location || '',
                                    notes: selectedItem.notes || ''
                                  }
                                });
                                updateState({ showDetailModal: false, selectedItem: null });
                                Alert.alert('Success', 'Trip created! Check the Trips tab.');
                              }
                            }
                          ]
                        );
                      }}
                    >
                      <Ionicons name="airplane" size={20} color="#fff" />
                      <Text style={styles.detailButtonText}>Make it a Trip</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.detailButton, styles.deleteButtonDetail]}
                    onPress={() => {
                      Alert.alert(
                        'Delete Item',
                        'Are you sure you want to delete this item?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Delete', 
                            style: 'destructive',
                            onPress: () => {
                              deleteItem(selectedItem.id);
                              updateState({ showDetailModal: false, selectedItem: null });
                            }
                          }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash" size={20} color="#fff" />
                    <Text style={styles.detailButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            ) : (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#999' }}>Loading...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Friend Trip Detail Modal */}
      <Modal
        visible={showFriendDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => updateState({ showFriendDetailModal: false, selectedFriendTrip: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.detailModalHeader}>
              <Text style={styles.detailModalTitle}>Trip Details</Text>
              <TouchableOpacity onPress={() => updateState({ showFriendDetailModal: false, selectedFriendTrip: null })}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            
            {selectedFriendTrip ? (
              <ScrollView style={styles.detailModalBody} showsVerticalScrollIndicator={false}>
                <Image 
                  source={{ uri: selectedFriendTrip.previewImage }} 
                  style={styles.detailImage}
                  resizeMode="cover"
                />
                
                <View style={styles.detailContent}>
                  <Text style={styles.detailName}>{selectedFriendTrip.tripTitle}</Text>
                  
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={20} color="#0fa3a3" />
                    <Text style={styles.detailLocation}>{selectedFriendTrip.location}</Text>
                  </View>
                  
                  {selectedFriendTrip.notes && (
                    <View style={styles.detailSection}>
                      <View style={styles.detailRow}>
                        <Ionicons name="document-text" size={20} color="#0fa3a3" />
                        <Text style={styles.detailSectionTitle}>About</Text>
                      </View>
                      <Text style={styles.detailNotes}>{selectedFriendTrip.notes}</Text>
                    </View>
                  )}
                  
                  {selectedFriendTrip.duration && (
                    <View style={styles.detailSection}>
                      <View style={styles.detailRow}>
                        <Ionicons name="time" size={20} color="#0fa3a3" />
                        <Text style={styles.detailSectionTitle}>Duration</Text>
                      </View>
                      <Text style={styles.detailText}>{selectedFriendTrip.duration}</Text>
                    </View>
                  )}
                  
                  {selectedFriendTrip.best_time && (
                    <View style={styles.detailSection}>
                      <View style={styles.detailRow}>
                        <Ionicons name="calendar" size={20} color="#0fa3a3" />
                        <Text style={styles.detailSectionTitle}>Best Time to Visit</Text>
                      </View>
                      <Text style={styles.detailText}>{selectedFriendTrip.best_time}</Text>
                    </View>
                  )}
                  
                  {selectedFriendTrip.estimated_budget && (
                    <View style={styles.detailSection}>
                      <View style={styles.detailRow}>
                        <Ionicons name="cash" size={20} color="#0fa3a3" />
                        <Text style={styles.detailSectionTitle}>Estimated Budget</Text>
                      </View>
                      <Text style={styles.detailText}>{selectedFriendTrip.estimated_budget}</Text>
                    </View>
                  )}
                  
                  {selectedFriendTrip.activities && selectedFriendTrip.activities.length > 0 && (
                    <View style={styles.detailSection}>
                      <View style={styles.detailRow}>
                        <Ionicons name="list" size={20} color="#0fa3a3" />
                        <Text style={styles.detailSectionTitle}>Activities</Text>
                      </View>
                      {selectedFriendTrip.activities.map((activity, index) => (
                        <View key={index} style={styles.listItem}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.listItemText}>{activity}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {selectedFriendTrip.hotels && selectedFriendTrip.hotels.length > 0 && (
                    <View style={styles.detailSection}>
                      <View style={styles.detailRow}>
                        <Ionicons name="bed" size={20} color="#0fa3a3" />
                        <Text style={styles.detailSectionTitle}>Hotels</Text>
                      </View>
                      {selectedFriendTrip.hotels.map((hotel, index) => (
                        <View key={index} style={styles.listItem}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.listItemText}>{hotel}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {selectedFriendTrip.restaurants && selectedFriendTrip.restaurants.length > 0 && (
                    <View style={styles.detailSection}>
                      <View style={styles.detailRow}>
                        <Ionicons name="restaurant" size={20} color="#0fa3a3" />
                        <Text style={styles.detailSectionTitle}>Restaurants</Text>
                      </View>
                      {selectedFriendTrip.restaurants.map((restaurant, index) => (
                        <View key={index} style={styles.listItem}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.listItemText}>{restaurant}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {selectedFriendTrip.flights && (
                    <View style={styles.detailSection}>
                      <View style={styles.detailRow}>
                        <Ionicons name="airplane" size={20} color="#0fa3a3" />
                        <Text style={styles.detailSectionTitle}>Flights</Text>
                      </View>
                      <Text style={styles.detailText}>{selectedFriendTrip.flights}</Text>
                    </View>
                  )}
                  
                  <View style={styles.detailActions}>
                    <TouchableOpacity 
                      style={[styles.detailButton, styles.editButton]}
                      onPress={() => {
                        Alert.alert('Edit Trip', `Edit your notes and preferences for "${selectedFriendTrip.tripTitle}"`);
                      }}
                    >
                      <Ionicons name="create" size={20} color="#fff" />
                      <Text style={styles.detailButtonText}>Edit</Text>
                    </TouchableOpacity>
                    
                    {friends.some(f => f.userId === selectedFriendTrip.userId) ? (
                      <TouchableOpacity 
                        style={[styles.detailButton, { backgroundColor: '#ff4444' }]}
                        onPress={() => {
                          Alert.alert(
                            'Leave Trip',
                            `Are you sure you want to leave "${selectedFriendTrip.tripTitle}"?`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { 
                                text: 'Leave', 
                                style: 'destructive',
                                onPress: () => {
                                  updateState({ 
                                    friends: friends.filter(f => f.userId !== selectedFriendTrip.userId),
                                    showFriendDetailModal: false, 
                                    selectedFriendTrip: null 
                                  });
                                  Alert.alert('Left Trip', `You have left "${selectedFriendTrip.tripTitle}"`);
                                }
                              }
                            ]
                          );
                        }}
                      >
                        <Ionicons name="exit" size={20} color="#fff" />
                        <Text style={styles.detailButtonText}>Leave Trip</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity 
                        style={[
                          styles.detailButton, 
                          { backgroundColor: requestedTrips.has(selectedFriendTrip.userId) ? '#999' : '#22c55e' }
                        ]}
                        onPress={() => {
                          if (!requestedTrips.has(selectedFriendTrip.userId)) {
                            requestToJoin(selectedFriendTrip.userId);
                          }
                        }}
                        disabled={requestedTrips.has(selectedFriendTrip.userId)}
                      >
                        <Ionicons 
                          name={requestedTrips.has(selectedFriendTrip.userId) ? "checkmark-circle" : "add-circle"} 
                          size={20} 
                          color="#fff" 
                        />
                        <Text style={styles.detailButtonText}>
                          {requestedTrips.has(selectedFriendTrip.userId) ? 'Requested' : 'Join Trip'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  tabs: {
    // removed
  },
  tab: {
    // removed
  },
  activeTab: {
    // removed
  },
  tabText: {
    // removed
  },
  activeTabText: {
    // removed
  },
  listContent: {
    paddingBottom: 100,
  },
  friendsSection: {
    marginBottom: 16,
  },
  friendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  friendsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  friendsSeeAll: {
    color: '#0fa3a3',
    fontWeight: '600',
  },
  friendsList: {
    paddingVertical: 4,
  },
  friendCard: {
    width: 260,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  friendPreview: {
    width: '100%',
    height: 120,
    backgroundColor: '#eee',
  },
  friendInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
  },
  friendAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  friendMeta: {
    fontSize: 12,
    color: '#666',
  },
  joinBtn: {
    backgroundColor: '#0fa3a3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  requestedBtn: {
    backgroundColor: '#FFC107',
  },
  joinBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  requestedBtnText: {
    color: '#333',
  },
  friendsEmpty: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  itemContainer: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  itemContent: {
    width: '100%',
  },
  itemImageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  checkbox: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#0fa3a3',
    borderColor: '#0fa3a3',
  },
  priorityBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  highPriority: {
    backgroundColor: 'rgba(220, 53, 69, 0.8)',
  },
  mediumPriority: {
    backgroundColor: 'rgba(255, 193, 7, 0.8)',
  },
  lowPriority: {
    backgroundColor: 'rgba(40, 167, 69, 0.8)',
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  itemDetails: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLocation: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  moreButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    lineHeight: 24,
  },
  addForm: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  priorityLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  priorityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  highPriorityButton: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  mediumPriorityButton: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
  },
  lowPriorityButton: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  priorityButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  highPriorityText: {
    color: '#721c24',
  },
  mediumPriorityText: {
    color: '#856404',
  },
  lowPriorityText: {
    color: '#155724',
  },
  addButton: {
    backgroundColor: '#0fa3a3',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#0fa3a3',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0fa3a3',
  },
  toggleTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
  friendBucketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  friendBucketPreview: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  friendBucketInfo: {
    padding: 12,
  },
  friendBucketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  friendBucketAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  friendBucketName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  friendBucketMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  viewBtn: {
    backgroundColor: '#0fa3a3',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  viewBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  myListItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkboxSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  deleteButton: {
    padding: 4,
  },
  friendCardContent: {
    padding: 12,
  },
  friendTripTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  friendTripDates: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  friendBucketTripTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  friendBucketTripDates: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  // Detail Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  detailModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  detailModalBody: {
    maxHeight: '80%',
  },
  detailImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  detailContent: {
    padding: 20,
  },
  detailName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  detailLocation: {
    fontSize: 16,
    color: '#666',
  },
  detailSection: {
    marginTop: 20,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  detailNotes: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginTop: 8,
  },
  detailPriorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  highPriorityBadge: {
    backgroundColor: '#f8d7da',
  },
  mediumPriorityBadge: {
    backgroundColor: '#fff3cd',
  },
  lowPriorityBadge: {
    backgroundColor: '#d4edda',
  },
  priorityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  statusCompleted: {
    color: '#51CF66',
    fontWeight: '600',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
    marginBottom: 20,
  },
  detailButton: {
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
  makeTripButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButtonDetail: {
    backgroundColor: '#ff4444',
    marginTop: 12,
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 15,
    color: '#666',
    marginTop: 8,
    lineHeight: 22,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#0fa3a3',
    marginRight: 8,
    marginTop: 2,
  },
  listItemText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
    lineHeight: 22,
  },
});
