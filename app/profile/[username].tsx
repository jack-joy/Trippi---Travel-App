import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TravelMap from '@/components/profile/TravelMap';
import TravelStats from '@/components/profile/TravelStats';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=200&auto=format&fit=crop';

// User profile types and mock data directory
type Trip = { id: string; title: string; location: string; date: string; image?: string };
type BucketItem = { id: string; name: string; location?: string; image?: string };
type UserRecord = {
  name: string;
  avatar?: string;
  bio?: string;
  photos: string[];
  stats?: { countries: number; continents: number; trips: number; daysTraveled: number; followers: number; following: number };
  countries?: string[];
  recentTrips?: Trip[];
  upcomingTrips?: Trip[];
  bucketList?: BucketItem[];
  currentTrip?: {
    location: string;
    startDate: string;
    endDate: string;
    emoji: string;
  };
};

const USER_DIRECTORY: Record<string, UserRecord > = {
  traveler123: {
    name: 'Alex Johnson',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    bio: 'Exploring cities and coffee shops ☕️✈️',
    photos: [
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800',
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
    ],
    stats: { countries: 12, continents: 3, trips: 18, daysTraveled: 94, followers: 820, following: 340 },
    countries: ['United States', 'France', 'Italy', 'Japan', 'Spain', 'Mexico', 'Canada', 'Germany', 'United Kingdom', 'Belgium', 'Switzerland', 'Austria'],
    recentTrips: [
      { id: 't1', title: 'NYC Coffee Crawl', location: 'New York, USA', date: 'Nov 8-14, 2025', image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800' },
      { id: 't2', title: 'Paris Weekend', location: 'Paris, France', date: 'Oct 2-5, 2025', image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800' },
    ],
    upcomingTrips: [
      { id: 'u1', title: 'LA Food Tour', location: 'Los Angeles, USA', date: 'Feb 12-18, 2026' },
    ],
    bucketList: [
      { id: 'b1', name: 'Santorini Sunset', location: 'Santorini, Greece', image: 'https://images.unsplash.com/photo-1502819126416-d387f3123b94?w=800' },
    ],
  },
  explorer22: {
    name: 'Taylor Smith',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    bio: 'Foodie and museum lover in London. 🏛️',
    photos: [
      'https://images.unsplash.com/photo-1505764706515-aa95265c5abc?w=800',
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800',
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
      'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800',
      'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=800',
      'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800',
      'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=800',
    ],
    stats: { countries: 8, continents: 2, trips: 11, daysTraveled: 63, followers: 420, following: 210 },
    countries: ['United Kingdom', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Germany', 'Portugal'],
    recentTrips: [
      { id: 't3', title: 'Thames Walk', location: 'London, UK', date: 'Dec 1-3, 2025', image: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800' },
    ],
    upcomingTrips: [
      { id: 'u2', title: 'Iberian Rail', location: 'Spain & Portugal', date: 'Mar 2026' },
    ],
    bucketList: [
      { id: 'b2', name: 'Northern Lights', location: 'Iceland', image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800' },
    ],
  },
  wanderer_jp: {
    name: 'Kenji',
    avatar: 'https://images.unsplash.com/photo-1541214113241-7f4f6b1659a0?q=80&w=200&auto=format&fit=crop',
    bio: 'Ramen hunter 🍜 | Anime fan | Tech geek | Showing you the real Japan',
    photos: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800',
      'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
      'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=800',
      'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800',
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=800',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800',
    ],
    stats: { countries: 18, continents: 4, trips: 42, daysTraveled: 156, followers: 5670, following: 423 },
    countries: ['Japan', 'South Korea', 'China', 'Taiwan'],
    recentTrips: [
      { id: 't4', title: 'Kyoto Temples', location: 'Kyoto, Japan', date: 'Nov 2025', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800' },
      { id: 't4b', title: 'Tokyo Ramen Tour', location: 'Tokyo, Japan', date: 'Oct 2025', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800' },
    ],
    upcomingTrips: [
      { id: 'u3', title: 'Seoul Food Markets', location: 'Seoul, South Korea', date: 'Mar 2026' },
    ],
    bucketList: [
      { id: 'b3', name: 'Alps Snow', location: 'Switzerland', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800' },
      { id: 'b3b', name: 'Mount Fuji Hike', location: 'Japan', image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800' },
    ],
    currentTrip: {
      location: 'Kyoto, Japan',
      startDate: 'Jan 22, 2026',
      endDate: 'Jan 30, 2026',
      emoji: '🍜'
    },
  },
  sophie_travels: {
    name: 'Sophie Martin',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
    bio: 'Fashion blogger | Art lover 🎨 | Parisian at heart | Living for croissants and culture',
    photos: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
      'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800',
      'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=800',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
      'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800',
      'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800',
    ],
    stats: { countries: 28, continents: 5, trips: 52, daysTraveled: 234, followers: 8920, following: 1240 },
    countries: ['France', 'Italy', 'Spain', 'UK', 'USA', 'Japan'],
    recentTrips: [
      { id: 't5', title: 'Paris Fashion Week', location: 'Paris, France', date: 'Sep 28-Oct 5, 2025', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800' },
      { id: 't6', title: 'Milan Shopping', location: 'Milan, Italy', date: 'Aug 12-18, 2025', image: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800' },
    ],
    upcomingTrips: [
      { id: 'u4', title: 'Tokyo Street Style', location: 'Tokyo, Japan', date: 'Apr 5-12, 2026' },
    ],
    bucketList: [
      { id: 'b4', name: 'New York Fashion Week', location: 'New York, USA', image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800' },
      { id: 'b5', name: 'Amalfi Coast', location: 'Italy', image: 'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=800' },
    ],
  },
  aussie_adventurer: {
    name: 'Jake Wilson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    bio: 'Surfer 🏄 | Beach bum | Wildlife photographer | G\'day from down under!',
    photos: [
      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
      'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800',
      'https://images.unsplash.com/photo-1549180030-48bf079fb38a?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      'https://images.unsplash.com/photo-1537996194471-e657df147ecc?w=800',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
      'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800',
      'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800',
    ],
    stats: { countries: 31, continents: 6, trips: 67, daysTraveled: 312, followers: 12500, following: 890 },
    countries: ['Australia', 'Indonesia', 'Thailand', 'USA', 'New Zealand'],
    recentTrips: [
      { id: 't7', title: 'Great Barrier Reef', location: 'Queensland, Australia', date: 'Dec 10-17, 2025', image: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=800' },
    ],
    upcomingTrips: [
      { id: 'u5', title: 'Fiji Islands', location: 'Fiji', date: 'May 2026' },
    ],
    bucketList: [
      { id: 'b6', name: 'Surfing in Hawaii', location: 'Hawaii, USA', image: 'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=800' },
    ],
    currentTrip: {
      location: 'Bali, Indonesia',
      startDate: 'Jan 18, 2026',
      endDate: 'Feb 2, 2026',
      emoji: '🏄'
    },
  },
  marco_explorer: {
    name: 'Marco Rossi',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
    bio: 'Italian chef | Wine connoisseur 🍷 | Ancient history enthusiast | La dolce vita',
    photos: [
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
      'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800',
      'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=800',
      'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800',
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
      'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?w=800',
      'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800',
      'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=800',
    ],
    stats: { countries: 19, continents: 4, trips: 38, daysTraveled: 178, followers: 6780, following: 567 },
    countries: ['Italy', 'France', 'Spain', 'Greece', 'Turkey'],
    recentTrips: [
      { id: 't8', title: 'Tuscany Wine Tour', location: 'Tuscany, Italy', date: 'Oct 20-27, 2025', image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800' },
      { id: 't9', title: 'Greek Islands', location: 'Santorini, Greece', date: 'Sep 5-12, 2025', image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800' },
    ],
    upcomingTrips: [
      { id: 'u6', title: 'Sicily Food Festival', location: 'Sicily, Italy', date: 'Jun 2026' },
    ],
    bucketList: [
      { id: 'b7', name: 'Cooking Class in Bologna', location: 'Bologna, Italy', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800' },
    ],
  },
  natasha_wanderlust: {
    name: 'Natasha Ivanova',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    bio: 'Ballet dancer | Architecture lover 🏛️ | Winter sports enthusiast | Exploring Eastern Europe',
    photos: [
      'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800',
      'https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=800',
      'https://images.unsplash.com/photo-1520106212299-d99c443e4568?w=800',
      'https://images.unsplash.com/photo-1548678967-f1aec58f6fb2?w=800',
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800',
      'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
      'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=800',
    ],
    stats: { countries: 24, continents: 4, trips: 41, daysTraveled: 198, followers: 4320, following: 723 },
    countries: ['Russia', 'Czech Republic', 'Poland', 'Austria', 'Germany'],
    recentTrips: [
      { id: 't10', title: 'Prague Christmas Markets', location: 'Prague, Czech Republic', date: 'Dec 2025', image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800' },
    ],
    upcomingTrips: [
      { id: 'u7', title: 'Vienna Opera Season', location: 'Vienna, Austria', date: 'Mar 2026' },
    ],
    bucketList: [
      { id: 'b8', name: 'Trans-Siberian Railway', location: 'Russia', image: 'https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=800' },
      { id: 'b9', name: 'Northern Lights', location: 'Norway', image: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?w=800' },
    ],
  },
  desert_nomad: {
    name: 'Ahmed Al-Rashid',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    bio: 'Luxury travel expert | Desert safari guide 🐪 | Skyscraper enthusiast | Living the high life',
    photos: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=800',
    ],
    stats: { countries: 42, continents: 6, trips: 89, daysTraveled: 456, followers: 18700, following: 1450 },
    countries: ['UAE', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait'],
    recentTrips: [
      { id: 't11', title: 'Dubai Luxury Tour', location: 'Dubai, UAE', date: 'Nov 2025', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800' },
    ],
    upcomingTrips: [
      { id: 'u8', title: 'Maldives Resort', location: 'Maldives', date: 'Apr 2026' },
    ],
    bucketList: [
      { id: 'b10', name: 'Safari in Kenya', location: 'Kenya', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800' },
    ],
  },
  brazilian_vibes: {
    name: 'Isabella Santos',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    bio: 'Samba dancer 💃 | Beach volleyball player | Carnival queen | Spreading Brazilian joy worldwide',
    photos: [
      'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
      'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800',
      'https://images.unsplash.com/photo-1544989164-fb6d42bd3e3b?w=800',
    ],
    stats: { countries: 16, continents: 4, trips: 29, daysTraveled: 142, followers: 7650, following: 934 },
    countries: ['Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia'],
    recentTrips: [
      { id: 't12', title: 'Rio Carnival', location: 'Rio de Janeiro, Brazil', date: 'Feb 2025', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800' },
    ],
    upcomingTrips: [
      { id: 'u9', title: 'Amazon Rainforest', location: 'Brazil', date: 'Jul 2026' },
    ],
    bucketList: [
      { id: 'b11', name: 'Iguazu Falls', location: 'Argentina/Brazil', image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800' },
    ],
  },
  asia_explorer: {
    name: 'Wei Chen',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
    bio: 'Tech entrepreneur | Foodie 🥟 | Smart city enthusiast | Connecting Asia to the world',
    photos: [
      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800',
      'https://images.unsplash.com/photo-1508964942454-1a56651d54ac?w=800',
      'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800',
    ],
    stats: { countries: 35, continents: 5, trips: 78, daysTraveled: 367, followers: 11200, following: 1890 },
    countries: ['Singapore', 'China', 'Japan', 'South Korea', 'Malaysia'],
    recentTrips: [
      { id: 't13', title: 'Singapore Food Tour', location: 'Singapore', date: 'Dec 2025', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800' },
    ],
    upcomingTrips: [
      { id: 'u10', title: 'Shanghai Tech Summit', location: 'Shanghai, China', date: 'May 2026' },
    ],
    bucketList: [
      { id: 'b12', name: 'Great Wall of China', location: 'China', image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800' },
    ],
  },
  carlos_travels: {
    name: 'Carlos Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&auto=format&fit=crop',
    bio: 'Archaeologist | Taco expert 🌮 | Pyramid climber | Uncovering ancient mysteries',
    photos: [
      'https://images.unsplash.com/photo-1518659526054-e3231116e1a1?w=800',
      'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=800',
      'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800',
    ],
    stats: { countries: 21, continents: 4, trips: 44, daysTraveled: 211, followers: 5430, following: 678 },
    countries: ['Mexico', 'Guatemala', 'Peru', 'Egypt', 'Greece'],
    recentTrips: [
      { id: 't14', title: 'Chichen Itza Expedition', location: 'Yucatan, Mexico', date: 'Oct 2025', image: 'https://images.unsplash.com/photo-1518659526054-e3231116e1a1?w=800' },
    ],
    upcomingTrips: [
      { id: 'u11', title: 'Machu Picchu Trek', location: 'Peru', date: 'Jun 2026' },
    ],
    bucketList: [
      { id: 'b13', name: 'Pyramids of Giza', location: 'Egypt', image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800' },
    ],
  },
  thai_foodie: {
    name: 'Ploy Srisai',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
    bio: 'Street food queen 👑 | Spice lover 🌶️ | Temple explorer | Sharing Thai culture & cuisine',
    photos: [
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800',
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
      'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800',
    ],
    stats: { countries: 14, continents: 3, trips: 32, daysTraveled: 156, followers: 9870, following: 456 },
    countries: ['Thailand', 'Vietnam', 'Cambodia', 'Laos', 'Myanmar'],
    recentTrips: [
      { id: 't15', title: 'Bangkok Street Food', location: 'Bangkok, Thailand', date: 'Nov 2025', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800' },
    ],
    upcomingTrips: [
      { id: 'u12', title: 'Chiang Mai Cooking Class', location: 'Chiang Mai, Thailand', date: 'Apr 2026' },
    ],
    bucketList: [
      { id: 'b14', name: 'Angkor Wat Sunrise', location: 'Cambodia', image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800' },
    ],
  },
  tango_lover: {
    name: 'Maria Garcia',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop',
    bio: 'Professional tango dancer 💃 | Steak enthusiast 🥩 | Wine lover | Buenos Aires soul',
    photos: [
      'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800',
      'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800',
      'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800',
    ],
    stats: { countries: 17, continents: 4, trips: 36, daysTraveled: 178, followers: 6540, following: 789 },
    countries: ['Argentina', 'Uruguay', 'Chile', 'Brazil', 'Spain'],
    recentTrips: [
      { id: 't16', title: 'Buenos Aires Tango Festival', location: 'Buenos Aires, Argentina', date: 'Aug 2025', image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800' },
    ],
    upcomingTrips: [
      { id: 'u13', title: 'Patagonia Adventure', location: 'Argentina', date: 'Mar 2026' },
    ],
    bucketList: [
      { id: 'b15', name: 'Wine Tasting in Mendoza', location: 'Mendoza, Argentina', image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800' },
    ],
  },
  tech_traveler: {
    name: 'Ryan Park',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop',
    bio: 'Software engineer | Startup founder 💻 | Coffee snob | Digital nomad life',
    photos: [
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
      'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?w=800',
      'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800',
    ],
    stats: { countries: 29, continents: 5, trips: 61, daysTraveled: 298, followers: 8340, following: 1120 },
    countries: ['USA', 'Canada', 'UK', 'Germany', 'Japan'],
    recentTrips: [
      { id: 't17', title: 'Silicon Valley Tour', location: 'San Francisco, USA', date: 'Sep 2025', image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800' },
    ],
    upcomingTrips: [
      { id: 'u14', title: 'Web Summit Lisbon', location: 'Lisbon, Portugal', date: 'Nov 2026' },
    ],
    bucketList: [
      { id: 'b16', name: 'Iceland Digital Nomad', location: 'Reykjavik, Iceland', image: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800' },
    ],
  },
  german_wanderer: {
    name: 'Hans Mueller',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=200&auto=format&fit=crop',
    bio: 'Beer enthusiast 🍺 | History teacher | Castle explorer | Documenting European heritage',
    photos: [
      'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800',
      'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=800',
      'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=800',
    ],
    stats: { countries: 33, continents: 5, trips: 58, daysTraveled: 267, followers: 4920, following: 834 },
    countries: ['Germany', 'Austria', 'Czech Republic', 'Poland', 'Switzerland'],
    recentTrips: [
      { id: 't18', title: 'Bavarian Castles', location: 'Bavaria, Germany', date: 'Oct 2025', image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800' },
    ],
    upcomingTrips: [
      { id: 'u15', title: 'Rhine River Cruise', location: 'Germany', date: 'Jun 2026' },
    ],
    bucketList: [
      { id: 'b17', name: 'Oktoberfest Munich', location: 'Munich, Germany', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800' },
    ],
  },
  china_explorer: {
    name: 'Li Wang',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop',
    bio: 'Great Wall hiker 🏯 | Calligraphy artist | Tea ceremony master | 5000 years of culture',
    photos: [
      'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
      'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800',
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
    ],
    stats: { countries: 26, continents: 5, trips: 49, daysTraveled: 234, followers: 10300, following: 923 },
    countries: ['China', 'Japan', 'South Korea', 'Vietnam', 'Thailand'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  pyramid_seeker: {
    name: 'Amira Hassan',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=200&auto=format&fit=crop',
    bio: 'Egyptologist | Desert photographer 📸 | Hieroglyphics decoder | Guardian of ancient secrets',
    photos: [
      'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800',
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800',
      'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800',
    ],
    stats: { countries: 38, continents: 5, trips: 72, daysTraveled: 345, followers: 13400, following: 1567 },
    countries: ['Egypt', 'Jordan', 'Morocco', 'Tunisia', 'Sudan'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  nordic_nomad: {
    name: 'Erik Larsen',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
    bio: 'Fjord explorer ⛰️ | Northern lights chaser | Viking history buff | Hygge lifestyle',
    photos: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800',
      'https://images.unsplash.com/photo-1601439678777-b2b3c56fa627?w=800',
      'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
    ],
    stats: { countries: 27, continents: 5, trips: 45, daysTraveled: 223, followers: 5780, following: 692 },
    countries: ['Norway', 'Sweden', 'Denmark', 'Finland', 'Iceland'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  safari_guide: {
    name: 'Jabari Okonkwo',
    avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=200&auto=format&fit=crop',
    bio: 'Wildlife photographer 🦁 | Conservation activist | Safari expert | Protecting Africa\'s beauty',
    photos: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
      'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800',
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
      'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=800',
    ],
    stats: { countries: 23, continents: 4, trips: 156, daysTraveled: 678, followers: 24800, following: 2340 },
    countries: ['Kenya', 'Tanzania', 'South Africa', 'Botswana', 'Zimbabwe'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  maple_traveler: {
    name: 'Emma Thompson',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    bio: 'Maple syrup lover 🍁 | Ice hockey fan | Poutine enthusiast | Exploring the Great White North',
    photos: [
      'https://images.unsplash.com/photo-1519659528534-7fd733a832a0?w=800',
      'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800',
      'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800',
    ],
    stats: { countries: 19, continents: 4, trips: 34, daysTraveled: 167, followers: 3890, following: 567 },
    countries: ['Canada', 'USA', 'UK', 'France', 'Iceland'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  celebrity_traveler: {
    name: 'Celebrity Traveler',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    bio: 'Luxury lifestyle | Hollywood adventures ✨ | Living the dream',
    photos: [
      'https://images.unsplash.com/photo-1534190239940-9ba8944ea261?w=800',
      'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800',
      'https://images.unsplash.com/photo-1542856204-00101eb6def4?w=800',
    ],
    stats: { countries: 45, continents: 6, trips: 120, daysTraveled: 567, followers: 2847000, following: 890 },
    countries: ['USA', 'France', 'Italy', 'UAE', 'Maldives'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  influencer_world: {
    name: 'World Influencer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    bio: 'Travel influencer 🌍 | Luxury destinations | Living my best life',
    photos: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800',
      'https://images.unsplash.com/photo-1546412414-e1885259563a?w=800',
    ],
    stats: { countries: 52, continents: 6, trips: 145, daysTraveled: 678, followers: 4521000, following: 1234 },
    countries: ['UAE', 'Maldives', 'Switzerland', 'Monaco', 'Singapore'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  travel_influencer_es: {
    name: 'Spanish Explorer',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop',
    bio: 'Spanish travel expert 🇪🇸 | Tapas lover | Flamenco enthusiast | ¡Viva España!',
    photos: [
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800',
      'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800',
    ],
    stats: { countries: 34, continents: 5, trips: 78, daysTraveled: 389, followers: 342000, following: 567 },
    countries: ['Spain', 'Portugal', 'Morocco', 'France', 'Italy'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  wildlife_explorer: {
    name: 'Wildlife Explorer',
    avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=200&auto=format&fit=crop',
    bio: 'Safari expert 🦁 | Wildlife photographer | Conservation advocate | Protecting nature',
    photos: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
      'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800',
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
    ],
    stats: { countries: 28, continents: 4, trips: 189, daysTraveled: 890, followers: 876000, following: 2340 },
    countries: ['Kenya', 'Tanzania', 'South Africa', 'Botswana', 'Zimbabwe'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  aurora_chaser: {
    name: 'Aurora Chaser',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
    bio: 'Northern lights hunter 🌌 | Night photographer | Arctic explorer | Chasing magic',
    photos: [
      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800',
      'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
      'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=800',
    ],
    stats: { countries: 22, continents: 4, trips: 67, daysTraveled: 234, followers: 689000, following: 456 },
    countries: ['Iceland', 'Norway', 'Finland', 'Canada', 'Alaska'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  adventure_seeker: {
    name: 'Adventure Seeker',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&auto=format&fit=crop',
    bio: 'Mountain climber 🏔️ | Thrill seeker | Extreme adventures | Living on the edge',
    photos: [
      'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
      'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',
      'https://images.unsplash.com/photo-1580837119756-563d608dd119?w=800',
    ],
    stats: { countries: 41, continents: 6, trips: 98, daysTraveled: 456, followers: 934000, following: 789 },
    countries: ['Peru', 'Nepal', 'New Zealand', 'Switzerland', 'Chile'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  history_traveler: {
    name: 'History Traveler',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
    bio: 'Ancient civilizations expert 🏛️ | Archaeology lover | Time traveler | History buff',
    photos: [
      'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800',
      'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=800',
      'https://images.unsplash.com/photo-1601581987809-a874a81309c9?w=800',
    ],
    stats: { countries: 38, continents: 5, trips: 89, daysTraveled: 423, followers: 456000, following: 678 },
    countries: ['Greece', 'Italy', 'Egypt', 'Turkey', 'Jordan'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  tango_queen: {
    name: 'Tango Queen',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop',
    bio: 'Professional dancer 💃 | Tango instructor | Argentine soul | Dance is life',
    photos: [
      'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800',
      'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800',
      'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800',
    ],
    stats: { countries: 24, continents: 4, trips: 56, daysTraveled: 267, followers: 567000, following: 890 },
    countries: ['Argentina', 'Uruguay', 'Chile', 'Spain', 'Italy'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  india_explorer: {
    name: 'India Explorer',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
    bio: 'Indian subcontinent specialist 🕌 | Spiritual journeys | Curry connoisseur | Namaste',
    photos: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
    ],
    stats: { countries: 32, continents: 4, trips: 92, daysTraveled: 445, followers: 789000, following: 1234 },
    countries: ['India', 'Nepal', 'Bhutan', 'Sri Lanka', 'Pakistan'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  japan_wanderer: {
    name: 'Japan Wanderer',
    avatar: 'https://images.unsplash.com/photo-1541214113241-7f4f6b1659a0?q=80&w=200&auto=format&fit=crop',
    bio: 'Japan specialist 🗻 | Mount Fuji climber | Zen seeker | Traditional culture',
    photos: [
      'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800',
      'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=800',
      'https://images.unsplash.com/photo-1576675784201-9710bcb1c1d0?w=800',
    ],
    stats: { countries: 18, continents: 3, trips: 78, daysTraveled: 356, followers: 623000, following: 567 },
    countries: ['Japan', 'South Korea', 'China', 'Taiwan', 'Vietnam'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  art_lover_italy: {
    name: 'Italian Art Lover',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
    bio: 'Renaissance art expert 🎨 | Museum curator | Florence lover | La bella vita',
    photos: [
      'https://images.unsplash.com/photo-1541017736704-8c77c90c4b2a?w=800',
      'https://images.unsplash.com/photo-1557603640-26d6aa1e2b3b?w=800',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800',
    ],
    stats: { countries: 26, continents: 4, trips: 67, daysTraveled: 312, followers: 543000, following: 789 },
    countries: ['Italy', 'France', 'Spain', 'Netherlands', 'Austria'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  nordic_explorer: {
    name: 'Nordic Explorer',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
    bio: 'Scandinavian specialist ⛰️ | Fjord lover | Viking history | Hygge lifestyle',
    photos: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800',
      'https://images.unsplash.com/photo-1601439678777-b2b3c56fa627?w=800',
      'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
    ],
    stats: { countries: 29, continents: 4, trips: 72, daysTraveled: 334, followers: 489000, following: 678 },
    countries: ['Norway', 'Sweden', 'Denmark', 'Finland', 'Iceland'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  cityscape_photographer: {
    name: 'Cityscape Photographer',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
    bio: 'Urban photographer 📸 | Skyline specialist | Night photography | City lights',
    photos: [
      'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800',
    ],
    stats: { countries: 43, continents: 6, trips: 134, daysTraveled: 567, followers: 712000, following: 1456 },
    countries: ['Hong Kong', 'Singapore', 'Dubai', 'New York', 'Tokyo'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  south_africa_guide: {
    name: 'South Africa Guide',
    avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=200&auto=format&fit=crop',
    bio: 'Safari guide 🦒 | Wildlife expert | Conservation | Rainbow nation',
    photos: [
      'https://images.unsplash.com/photo-1484318571209-661cf29a69c3?w=800',
      'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
      'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800',
    ],
    stats: { countries: 21, continents: 3, trips: 98, daysTraveled: 456, followers: 389000, following: 567 },
    countries: ['South Africa', 'Botswana', 'Zimbabwe', 'Namibia', 'Zambia'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  canada_adventures: {
    name: 'Canada Adventures',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    bio: 'Canadian explorer 🍁 | Mountain lover | Outdoor adventures | True North',
    photos: [
      'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=800',
      'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800',
      'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?w=800',
    ],
    stats: { countries: 25, continents: 4, trips: 67, daysTraveled: 298, followers: 456000, following: 789 },
    countries: ['Canada', 'USA', 'Iceland', 'Norway', 'New Zealand'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  egypt_historian: {
    name: 'Egypt Historian',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=200&auto=format&fit=crop',
    bio: 'Egyptologist 🐫 | Pyramid expert | Ancient mysteries | Pharaohs legacy',
    photos: [
      'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800',
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800',
      'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800',
    ],
    stats: { countries: 36, continents: 5, trips: 89, daysTraveled: 412, followers: 823000, following: 1234 },
    countries: ['Egypt', 'Jordan', 'Morocco', 'Tunisia', 'Sudan'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  europe_backpacker: {
    name: 'Europe Backpacker',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    bio: 'European traveler 🎒 | Budget explorer | Hostel hopper | Wanderlust',
    photos: [
      'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800',
      'https://images.unsplash.com/photo-1592906209472-a36b1f3782ef?w=800',
      'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=800',
    ],
    stats: { countries: 47, continents: 4, trips: 112, daysTraveled: 534, followers: 512000, following: 890 },
    countries: ['Czech Republic', 'Poland', 'Hungary', 'Croatia', 'Romania'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  asia_foodie: {
    name: 'Asia Foodie',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
    bio: 'Asian cuisine expert 🍜 | Street food hunter | Spice lover | Culinary adventures',
    photos: [
      'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800',
      'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=800',
      'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800',
    ],
    stats: { countries: 28, continents: 3, trips: 87, daysTraveled: 389, followers: 678000, following: 1123 },
    countries: ['Malaysia', 'Thailand', 'Vietnam', 'Singapore', 'Indonesia'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  peru_gastronomy: {
    name: 'Peru Gastronomy',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    bio: 'Peruvian food expert 🐟 | Ceviche master | Culinary tours | Taste of Peru',
    photos: [
      'https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=800',
      'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800',
      'https://images.unsplash.com/photo-1582639590011-f5a8416d1101?w=800',
    ],
    stats: { countries: 23, continents: 3, trips: 64, daysTraveled: 287, followers: 589000, following: 678 },
    countries: ['Peru', 'Ecuador', 'Colombia', 'Bolivia', 'Chile'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
  russian_culture: {
    name: 'Russian Culture',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    bio: 'Russian heritage 🏛️ | Imperial history | Ballet lover | Eastern Europe',
    photos: [
      'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800',
      'https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=800',
      'https://images.unsplash.com/photo-1520106212299-d99c443e4568?w=800',
    ],
    stats: { countries: 31, continents: 4, trips: 76, daysTraveled: 356, followers: 634000, following: 890 },
    countries: ['Russia', 'Ukraine', 'Belarus', 'Georgia', 'Armenia'],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  },
};

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const user = USER_DIRECTORY[(username || '').toLowerCase()] || {
    name: username,
    avatar: DEFAULT_AVATAR,
    bio: 'Traveler on Trippi',
    photos: [],
    stats: { countries: 0, continents: 0, trips: 0, daysTraveled: 0, followers: 0, following: 0 },
    countries: [],
    recentTrips: [],
    upcomingTrips: [],
    bucketList: [],
  };

  const photos = useMemo(() => user.photos || [], [user]);
  const photoItems = useMemo(() => {
    const src = user.photos || [];
    // Only show unique photos, don't repeat them
    const out: string[] = [];
    for (let i = 0; i < Math.min(9, src.length); i++) {
      out.push(src[i]);
    }
    // Fill remaining slots with empty strings if less than 9 photos
    while (out.length < 9) {
      out.push('');
    }
    return out;
  }, [user]);
  const [activeSection, setActiveSection] = useState<'recent' | 'upcoming' | 'bucket'>('recent');
  const [gridW, setGridW] = useState<number>(0);
  const [addedToBucketList, setAddedToBucketList] = useState<Set<string>>(new Set());

  const handleAddToBucketList = (id: string, title: string) => {
    setAddedToBucketList(prev => new Set(prev).add(id));
    // TODO: Add to actual bucket list in backend
    console.log(`Added "${title}" to bucket list`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{user.name}</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={[0]}
        keyExtractor={(item, idx) => `only-${idx}`}
        renderItem={() => null}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListHeaderComponent={(
          <>
        <View style={styles.profileRow}>
          <Image source={{ uri: user.avatar || DEFAULT_AVATAR }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.username}>@{username}</Text>
          </View>
          <TouchableOpacity style={styles.messageBtn} onPress={() => router.push({ pathname: '/chat/[username]', params: { username } })}>
            <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
            <Text style={styles.messageBtnText}>Message</Text>
          </TouchableOpacity>
        </View>

        {!!user.bio && (
          <Text style={styles.bio}>{user.bio}</Text>
        )}

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

        {/* Travel Map and Stats */}
        {user.countries && user.countries.length > 0 ? (
          <View style={styles.sectionFullBleed}>
            <Text style={styles.sectionTitleInner}>Travel Map</Text>
            <TravelMap countries={user.countries} />
          </View>
        ) : null}

        {user.stats ? <TravelStats stats={user.stats} /> : null}

        {/* Photos placed above toggles */}
        <Text style={styles.sectionTitle}>Photos</Text>
        <View style={{ paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap' }}>
          {(() => {
            const screenWidth = Dimensions.get('window').width;
            const contentW = screenWidth - 32; // 16px padding on both sides
            const gutter = 4;
            const cell = (contentW - gutter * 2) / 3;
            return photoItems.map((item, index) => {
              const isEnd = index % 3 === 2;
              const commonStyle = { width: cell, height: cell, marginRight: isEnd ? 0 : gutter, marginBottom: gutter } as const;
              if (item) {
                return <Image key={`${item}-${index}`} source={{ uri: item }} style={[styles.gridPhoto, commonStyle]} />;
              }
              return <View key={`ph-${index}`} style={[styles.gridPhoto, styles.gridPlaceholder, commonStyle]} />;
            });
          })()}
        </View>

        {/* Segmented controls */}
        <View style={[styles.sectionFullBleed, { paddingVertical: 12 }]}>
          <View style={styles.segmentRow}>
            <TouchableOpacity
              style={[styles.segmentBtn, activeSection === 'recent' && styles.segmentBtnActive]}
              onPress={() => setActiveSection('recent')}
            >
              <Text style={[styles.segmentText, activeSection === 'recent' && styles.segmentTextActive]}>Recent Trips</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, activeSection === 'upcoming' && styles.segmentBtnActive]}
              onPress={() => setActiveSection('upcoming')}
            >
              <Text style={[styles.segmentText, activeSection === 'upcoming' && styles.segmentTextActive]}>Upcoming Trips</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, activeSection === 'bucket' && styles.segmentBtnActive]}
              onPress={() => setActiveSection('bucket')}
            >
              <Text style={[styles.segmentText, activeSection === 'bucket' && styles.segmentTextActive]}>Bucket List</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Trips */}
        {activeSection === 'recent' && user.recentTrips && user.recentTrips.length > 0 && (
          <View style={styles.sectionFullBleed}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleInner}>Recent Trips</Text>
            </View>
            <View style={styles.tripsListVertical}>
              {user.recentTrips.map((t) => (
                <View key={t.id} style={[styles.tripCard, styles.tripCardFull]}>
                  {t.image ? (
                    <Image source={{ uri: t.image }} style={styles.tripImage} />
                  ) : (
                    <View style={[styles.tripImage, styles.tripImagePlaceholder]} />
                  )}
                  <View style={styles.tripInfo}>
                    <View style={styles.tripInfoHeader}>
                      <Text style={styles.tripTitle} numberOfLines={1}>{t.title}</Text>
                      <TouchableOpacity 
                        style={[styles.addButton, addedToBucketList.has(t.id) && styles.addButtonAdded]}
                        onPress={() => handleAddToBucketList(t.id, t.title)}
                        disabled={addedToBucketList.has(t.id)}
                      >
                        <MaterialCommunityIcons 
                          name={addedToBucketList.has(t.id) ? "bucket" : "bucket-outline"} 
                          size={18} 
                          color={addedToBucketList.has(t.id) ? "#0fa3a3" : "#fff"} 
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.tripMeta}>
                      <Ionicons name="location-outline" size={14} color="#666" />
                      <Text style={styles.tripLocation}>{t.location}</Text>
                    </View>
                    <View style={styles.tripMeta}>
                      <Ionicons name="calendar-outline" size={14} color="#666" />
                      <Text style={styles.tripDate}>{t.date}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Upcoming Trips */}
        {activeSection === 'upcoming' && user.upcomingTrips && user.upcomingTrips.length > 0 && (
          <View style={styles.sectionFullBleed}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleInner}>Upcoming Trips</Text>
            </View>
            <View style={styles.tripsListVertical}>
              {user.upcomingTrips.map((t) => (
                <View key={t.id} style={[styles.tripCard, styles.tripCardFull]}>
                  <View style={[styles.tripImage, styles.tripImagePlaceholder]} />
                  <View style={styles.tripInfo}>
                    <View style={styles.tripInfoHeader}>
                      <Text style={styles.tripTitle} numberOfLines={1}>{t.title}</Text>
                      <TouchableOpacity 
                        style={[styles.addButton, addedToBucketList.has(t.id) && styles.addButtonAdded]}
                        onPress={() => handleAddToBucketList(t.id, t.title)}
                        disabled={addedToBucketList.has(t.id)}
                      >
                        <MaterialCommunityIcons 
                          name={addedToBucketList.has(t.id) ? "bucket" : "bucket-outline"} 
                          size={18} 
                          color={addedToBucketList.has(t.id) ? "#0fa3a3" : "#fff"} 
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.tripMeta}>
                      <Ionicons name="location-outline" size={14} color="#666" />
                      <Text style={styles.tripLocation}>{t.location}</Text>
                    </View>
                    <View style={styles.tripMeta}>
                      <Ionicons name="calendar-outline" size={14} color="#666" />
                      <Text style={styles.tripDate}>{t.date}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bucket List */}
        {activeSection === 'bucket' && user.bucketList && user.bucketList.length > 0 && (
          <View style={styles.sectionFullBleed}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleInner}>Bucket List</Text>
            </View>
            <View style={styles.tripsListVertical}>
              {user.bucketList.map((b) => (
                <View key={b.id} style={[styles.tripCard, styles.tripCardFull]}>
                  {b.image ? (
                    <Image source={{ uri: b.image }} style={styles.tripImage} />
                  ) : (
                    <View style={[styles.tripImage, styles.tripImagePlaceholder]} />
                  )}
                  <View style={styles.tripInfo}>
                    <View style={styles.tripInfoHeader}>
                      <Text style={styles.tripTitle} numberOfLines={1}>{b.name}</Text>
                      <TouchableOpacity 
                        style={[styles.addButton, addedToBucketList.has(b.id) && styles.addButtonAdded]}
                        onPress={() => handleAddToBucketList(b.id, b.name)}
                        disabled={addedToBucketList.has(b.id)}
                      >
                        <Ionicons 
                          name={addedToBucketList.has(b.id) ? "checkmark" : "add"} 
                          size={18} 
                          color={addedToBucketList.has(b.id) ? "#0fa3a3" : "#fff"} 
                        />
                      </TouchableOpacity>
                    </View>
                    {b.location ? (
                      <View style={styles.tripMeta}>
                        <Ionicons name="location-outline" size={14} color="#666" />
                        <Text style={styles.tripLocation}>{b.location}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

          </>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eaeaea' },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  profileRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  name: { fontSize: 18, fontWeight: '700', color: '#111' },
  username: { color: '#666', marginTop: 2 },
  bio: { paddingHorizontal: 16, color: '#333', marginBottom: 12 },
  travelBanner: { backgroundColor: '#e6f7f7', borderRadius: 12, padding: 16, marginHorizontal: 16, marginTop: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#0fa3a3' },
  travelBannerContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  travelEmoji: { fontSize: 32, marginRight: 12 },
  travelInfo: { flex: 1 },
  travelStatus: { fontSize: 12, fontWeight: '600', color: '#0fa3a3', textTransform: 'uppercase', letterSpacing: 0.5 },
  travelLocation: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 2 },
  travelDates: { fontSize: 13, color: '#666', marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionFullBleed: { backgroundColor: '#fff', alignSelf: 'stretch', padding: 16, marginTop: 12, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  sectionTitle: { paddingHorizontal: 16, fontWeight: '700', color: '#111', marginTop: 8, marginBottom: 8 },
  sectionTitleInner: { fontWeight: '700', color: '#111' },
  gridPhoto: { borderRadius: 8, backgroundColor: '#eee' },
  gridPlaceholder: { backgroundColor: '#f1f3f5' },
  messageBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0fa3a3', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  messageBtnText: { color: '#fff', fontWeight: '700', marginLeft: 6 },
  tripsListVertical: { gap: 12 },
  tripCard: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tripCardFull: { width: '100%', marginRight: 0, marginBottom: 0 },
  tripImage: { width: '100%', height: 120, backgroundColor: '#f0f0f0' },
  tripImagePlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e6f7f7' },
  tripInfo: { padding: 12 },
  tripInfoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  tripTitle: { fontSize: 15, fontWeight: '600', color: '#333', flex: 1 },
  addButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0fa3a3', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  addButtonAdded: { backgroundColor: '#e6f7f7', borderWidth: 1, borderColor: '#0fa3a3' },
  tripMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  tripLocation: { fontSize: 13, color: '#666', marginLeft: 4 },
  tripDate: { fontSize: 12, color: '#888', marginLeft: 4 },
  segmentRow: { flexDirection: 'row', backgroundColor: '#f2f6f6', borderRadius: 10, padding: 4, gap: 6 },
  segmentBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 8, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e6eeee' },
  segmentBtnActive: { backgroundColor: '#0fa3a3', borderColor: '#0fa3a3' },
  segmentText: { color: '#666', fontWeight: '600' },
  segmentTextActive: { color: '#fff' },
});
