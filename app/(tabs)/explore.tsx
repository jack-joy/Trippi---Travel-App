import React, { useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Image, ScrollView, TextInput, Animated, PanResponder, LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';

// Fallback avatar to avoid blanks
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=200&auto=format&fit=crop';
const Avatar = ({ uri, style }: { uri?: string; style: any }) => {
  const [src, setSrc] = React.useState(uri && uri.length > 0 ? uri : DEFAULT_AVATAR);
  return (
    <Image
      source={{ uri: src }}
      style={style}
      onError={() => setSrc(DEFAULT_AVATAR)}
    />
  );
};

// Sample data for posts on the map
interface Post {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  username: string;
  image: string; // post/location image
  avatar: string; // user's profile picture
}

const samplePosts: Post[] = [
  {
    id: '1',
    latitude: 40.7128,
    longitude: -74.0060,
    title: 'New York',
    username: 'traveler123',
    image: 'https://source.unsplash.com/random/800x800/?newyork',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '2',
    latitude: 51.5074,
    longitude: -0.1278,
    title: 'London',
    username: 'explorer22',
    image: 'https://source.unsplash.com/random/800x800/?london',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '3',
    latitude: 35.6762,
    longitude: 139.6503,
    title: 'Tokyo',
    username: 'wanderer_jp',
    image: 'https://source.unsplash.com/random/800x800/?tokyo',
    avatar: 'https://images.unsplash.com/photo-1541214113241-7f4f6b1659a0?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '4',
    latitude: 48.8566,
    longitude: 2.3522,
    title: 'Paris',
    username: 'sophie_travels',
    image: 'https://source.unsplash.com/random/800x800/?paris',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '5',
    latitude: -33.8688,
    longitude: 151.2093,
    title: 'Sydney',
    username: 'aussie_adventurer',
    image: 'https://source.unsplash.com/random/800x800/?sydney',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '6',
    latitude: 41.9028,
    longitude: 12.4964,
    title: 'Rome',
    username: 'marco_explorer',
    image: 'https://source.unsplash.com/random/800x800/?rome',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '7',
    latitude: 55.7558,
    longitude: 37.6173,
    title: 'Moscow',
    username: 'natasha_wanderlust',
    image: 'https://source.unsplash.com/random/800x800/?moscow',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '8',
    latitude: 25.2048,
    longitude: 55.2708,
    title: 'Dubai',
    username: 'desert_nomad',
    image: 'https://source.unsplash.com/random/800x800/?dubai',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '9',
    latitude: -22.9068,
    longitude: -43.1729,
    title: 'Rio de Janeiro',
    username: 'brazilian_vibes',
    image: 'https://source.unsplash.com/random/800x800/?rio',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '10',
    latitude: 1.3521,
    longitude: 103.8198,
    title: 'Singapore',
    username: 'asia_explorer',
    image: 'https://source.unsplash.com/random/800x800/?singapore',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '11',
    latitude: 19.4326,
    longitude: -99.1332,
    title: 'Mexico City',
    username: 'carlos_travels',
    image: 'https://source.unsplash.com/random/800x800/?mexicocity',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '12',
    latitude: 13.7563,
    longitude: 100.5018,
    title: 'Bangkok',
    username: 'thai_foodie',
    image: 'https://source.unsplash.com/random/800x800/?bangkok',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '13',
    latitude: -34.6037,
    longitude: -58.3816,
    title: 'Buenos Aires',
    username: 'tango_lover',
    image: 'https://source.unsplash.com/random/800x800/?buenosaires',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '14',
    latitude: 37.7749,
    longitude: -122.4194,
    title: 'San Francisco',
    username: 'tech_traveler',
    image: 'https://source.unsplash.com/random/800x800/?sanfrancisco',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '15',
    latitude: 52.5200,
    longitude: 13.4050,
    title: 'Berlin',
    username: 'german_wanderer',
    image: 'https://source.unsplash.com/random/800x800/?berlin',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '16',
    latitude: 39.9042,
    longitude: 116.4074,
    title: 'Beijing',
    username: 'china_explorer',
    image: 'https://source.unsplash.com/random/800x800/?beijing',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '17',
    latitude: 30.0444,
    longitude: 31.2357,
    title: 'Cairo',
    username: 'pyramid_seeker',
    image: 'https://source.unsplash.com/random/800x800/?cairo',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '18',
    latitude: 59.9139,
    longitude: 10.7522,
    title: 'Oslo',
    username: 'nordic_nomad',
    image: 'https://source.unsplash.com/random/800x800/?oslo',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '19',
    latitude: -1.2921,
    longitude: 36.8219,
    title: 'Nairobi',
    username: 'safari_guide',
    image: 'https://source.unsplash.com/random/800x800/?nairobi',
    avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: '20',
    latitude: 45.4215,
    longitude: -75.6972,
    title: 'Ottawa',
    username: 'maple_traveler',
    image: 'https://source.unsplash.com/random/800x800/?ottawa',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
  },
];

const initialRegion = {
  latitude: 20,
  longitude: 0,
  latitudeDelta: 100,
  longitudeDelta: 100,
};

// Simple mock mapping of usernames -> display names
const userDisplayNames: Record<string, string> = {
  traveler123: 'Alex Johnson',
  explorer22: 'Taylor Smith',
  wanderer_jp: 'Kenji',
  sophie_travels: 'Sophie Martin',
  aussie_adventurer: 'Jake Wilson',
  marco_explorer: 'Marco Rossi',
  natasha_wanderlust: 'Natasha Ivanova',
  desert_nomad: 'Ahmed Al-Rashid',
  brazilian_vibes: 'Isabella Santos',
  asia_explorer: 'Wei Chen',
  carlos_travels: 'Carlos Rodriguez',
  thai_foodie: 'Ploy Srisai',
  tango_lover: 'Maria Garcia',
  tech_traveler: 'Ryan Park',
  german_wanderer: 'Hans Mueller',
  china_explorer: 'Li Wang',
  pyramid_seeker: 'Amira Hassan',
  nordic_nomad: 'Erik Larsen',
  safari_guide: 'Jabari Okonkwo',
  maple_traveler: 'Emma Thompson',
  johndoe: 'John Doe',
};

// User profile data
type UserProfile = {
  name: string;
  username: string;
  bio: string;
  stats: {
    countries: number;
    continents: number;
    trips: number;
    followers: number;
    following: number;
  };
  travelStyle: string[];
  favoriteDestinations: string[];
};

const userProfiles: Record<string, UserProfile> = {
  traveler123: {
    name: 'Alex Johnson',
    username: '@traveler123',
    bio: 'Urban explorer | Street photography | Coffee addict ☕ | NYC based',
    stats: { countries: 15, continents: 4, trips: 28, followers: 3240, following: 892 },
    travelStyle: ['Urban', 'Photography', 'Food'],
    favoriteDestinations: ['New York', 'London', 'Tokyo'],
  },
  explorer22: {
    name: 'Taylor Smith',
    username: '@explorer22',
    bio: 'History buff | Museum lover | Tea enthusiast 🫖 | Exploring the world one city at a time',
    stats: { countries: 22, continents: 5, trips: 35, followers: 2180, following: 654 },
    travelStyle: ['Cultural', 'Historical', 'Museums'],
    favoriteDestinations: ['London', 'Rome', 'Athens'],
  },
  wanderer_jp: {
    name: 'Kenji',
    username: '@wanderer_jp',
    bio: 'Ramen hunter 🍜 | Anime fan | Tech geek | Showing you the real Japan',
    stats: { countries: 18, continents: 4, trips: 42, followers: 5670, following: 423 },
    travelStyle: ['Food', 'Technology', 'Culture'],
    favoriteDestinations: ['Tokyo', 'Osaka', 'Kyoto'],
  },
  sophie_travels: {
    name: 'Sophie Martin',
    username: '@sophie_travels',
    bio: 'Fashion blogger | Art lover 🎨 | Parisian at heart | Living for croissants and culture',
    stats: { countries: 28, continents: 5, trips: 52, followers: 8920, following: 1240 },
    travelStyle: ['Fashion', 'Art', 'Luxury'],
    favoriteDestinations: ['Paris', 'Milan', 'Barcelona'],
  },
  aussie_adventurer: {
    name: 'Jake Wilson',
    username: '@aussie_adventurer',
    bio: 'Surfer 🏄 | Beach bum | Wildlife photographer | G\'day from down under!',
    stats: { countries: 31, continents: 6, trips: 67, followers: 12500, following: 890 },
    travelStyle: ['Adventure', 'Beach', 'Wildlife'],
    favoriteDestinations: ['Sydney', 'Bali', 'Hawaii'],
  },
  marco_explorer: {
    name: 'Marco Rossi',
    username: '@marco_explorer',
    bio: 'Italian chef | Wine connoisseur 🍷 | Ancient history enthusiast | La dolce vita',
    stats: { countries: 19, continents: 4, trips: 38, followers: 6780, following: 567 },
    travelStyle: ['Food', 'Wine', 'History'],
    favoriteDestinations: ['Rome', 'Florence', 'Venice'],
  },
  natasha_wanderlust: {
    name: 'Natasha Ivanova',
    username: '@natasha_wanderlust',
    bio: 'Ballet dancer | Architecture lover 🏛️ | Winter sports enthusiast | Exploring Eastern Europe',
    stats: { countries: 24, continents: 4, trips: 41, followers: 4320, following: 723 },
    travelStyle: ['Architecture', 'Culture', 'Winter Sports'],
    favoriteDestinations: ['Moscow', 'St. Petersburg', 'Prague'],
  },
  desert_nomad: {
    name: 'Ahmed Al-Rashid',
    username: '@desert_nomad',
    bio: 'Luxury travel expert | Desert safari guide 🐪 | Skyscraper enthusiast | Living the high life',
    stats: { countries: 42, continents: 6, trips: 89, followers: 18700, following: 1450 },
    travelStyle: ['Luxury', 'Desert', 'Modern Architecture'],
    favoriteDestinations: ['Dubai', 'Abu Dhabi', 'Doha'],
  },
  brazilian_vibes: {
    name: 'Isabella Santos',
    username: '@brazilian_vibes',
    bio: 'Samba dancer 💃 | Beach volleyball player | Carnival queen | Spreading Brazilian joy worldwide',
    stats: { countries: 16, continents: 4, trips: 29, followers: 7650, following: 934 },
    travelStyle: ['Beach', 'Party', 'Culture'],
    favoriteDestinations: ['Rio de Janeiro', 'Salvador', 'Florianópolis'],
  },
  asia_explorer: {
    name: 'Wei Chen',
    username: '@asia_explorer',
    bio: 'Tech entrepreneur | Foodie 🥟 | Smart city enthusiast | Connecting Asia to the world',
    stats: { countries: 35, continents: 5, trips: 78, followers: 11200, following: 1890 },
    travelStyle: ['Technology', 'Food', 'Business'],
    favoriteDestinations: ['Singapore', 'Hong Kong', 'Seoul'],
  },
  carlos_travels: {
    name: 'Carlos Rodriguez',
    username: '@carlos_travels',
    bio: 'Archaeologist | Taco expert 🌮 | Pyramid climber | Uncovering ancient mysteries',
    stats: { countries: 21, continents: 4, trips: 44, followers: 5430, following: 678 },
    travelStyle: ['History', 'Food', 'Adventure'],
    favoriteDestinations: ['Mexico City', 'Oaxaca', 'Yucatan'],
  },
  thai_foodie: {
    name: 'Ploy Srisai',
    username: '@thai_foodie',
    bio: 'Street food queen 👑 | Spice lover 🌶️ | Temple explorer | Sharing Thai culture & cuisine',
    stats: { countries: 14, continents: 3, trips: 32, followers: 9870, following: 456 },
    travelStyle: ['Food', 'Street Food', 'Culture'],
    favoriteDestinations: ['Bangkok', 'Chiang Mai', 'Phuket'],
  },
  tango_lover: {
    name: 'Maria Garcia',
    username: '@tango_lover',
    bio: 'Professional tango dancer 💃 | Steak enthusiast 🥩 | Wine lover | Buenos Aires soul',
    stats: { countries: 17, continents: 4, trips: 36, followers: 6540, following: 789 },
    travelStyle: ['Dance', 'Food', 'Wine'],
    favoriteDestinations: ['Buenos Aires', 'Mendoza', 'Montevideo'],
  },
  tech_traveler: {
    name: 'Ryan Park',
    username: '@tech_traveler',
    bio: 'Software engineer | Startup founder 💻 | Coffee snob | Digital nomad life',
    stats: { countries: 29, continents: 5, trips: 61, followers: 8340, following: 1120 },
    travelStyle: ['Technology', 'Coworking', 'Coffee'],
    favoriteDestinations: ['San Francisco', 'Austin', 'Seattle'],
  },
  german_wanderer: {
    name: 'Hans Mueller',
    username: '@german_wanderer',
    bio: 'Beer enthusiast 🍺 | History teacher | Castle explorer | Documenting European heritage',
    stats: { countries: 33, continents: 5, trips: 58, followers: 4920, following: 834 },
    travelStyle: ['History', 'Beer', 'Architecture'],
    favoriteDestinations: ['Berlin', 'Munich', 'Hamburg'],
  },
  china_explorer: {
    name: 'Li Wang',
    username: '@china_explorer',
    bio: 'Great Wall hiker 🏯 | Calligraphy artist | Tea ceremony master | 5000 years of culture',
    stats: { countries: 26, continents: 5, trips: 49, followers: 10300, following: 923 },
    travelStyle: ['History', 'Culture', 'Hiking'],
    favoriteDestinations: ['Beijing', 'Shanghai', 'Xi\'an'],
  },
  pyramid_seeker: {
    name: 'Amira Hassan',
    username: '@pyramid_seeker',
    bio: 'Egyptologist | Desert photographer 📸 | Hieroglyphics decoder | Guardian of ancient secrets',
    stats: { countries: 38, continents: 5, trips: 72, followers: 13400, following: 1567 },
    travelStyle: ['History', 'Photography', 'Desert'],
    favoriteDestinations: ['Cairo', 'Luxor', 'Aswan'],
  },
  nordic_nomad: {
    name: 'Erik Larsen',
    username: '@nordic_nomad',
    bio: 'Fjord explorer ⛰️ | Northern lights chaser | Viking history buff | Hygge lifestyle',
    stats: { countries: 27, continents: 5, trips: 45, followers: 5780, following: 692 },
    travelStyle: ['Nature', 'Photography', 'Hiking'],
    favoriteDestinations: ['Oslo', 'Bergen', 'Tromsø'],
  },
  safari_guide: {
    name: 'Jabari Okonkwo',
    username: '@safari_guide',
    bio: 'Wildlife photographer 🦁 | Conservation activist | Safari expert | Protecting Africa\'s beauty',
    stats: { countries: 23, continents: 4, trips: 156, followers: 24800, following: 2340 },
    travelStyle: ['Wildlife', 'Photography', 'Conservation'],
    favoriteDestinations: ['Nairobi', 'Serengeti', 'Kruger'],
  },
  maple_traveler: {
    name: 'Emma Thompson',
    username: '@maple_traveler',
    bio: 'Maple syrup lover 🍁 | Ice hockey fan | Poutine enthusiast | Exploring the Great White North',
    stats: { countries: 19, continents: 4, trips: 34, followers: 3890, following: 567 },
    travelStyle: ['Nature', 'Food', 'Winter'],
    favoriteDestinations: ['Ottawa', 'Toronto', 'Vancouver'],
  },
};

// Trip details mock data keyed by username
type TripDetails = {
  startDate: string; // ISO
  endDate: string;   // ISO
  photos: string[];
  restaurants: string[];
  activities: string[];
  likes: number;
  comments: { id: string; user: string; text: string; timestamp: number }[];
};

const tripData: Record<string, TripDetails> = {
  traveler123: {
    startDate: '2026-02-01',
    endDate: '2026-02-08',
    photos: [
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    ],
    restaurants: ["Katz's Deli", "Joe's Pizza", 'Le Bernardin'],
    activities: ['Central Park Bike', 'Top of the Rock', 'Brooklyn Bridge Walk'],
    likes: 24,
    comments: [
      { id: 'c1', user: 'maria', text: 'NYC looks amazing! 🗽', timestamp: Date.now() - 1000 * 60 * 25 },
    ],
  },
  explorer22: {
    startDate: '2026-03-15',
    endDate: '2026-03-22',
    photos: [
      'https://images.unsplash.com/photo-1505764706515-aa95265c5abc?w=800',
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800',
    ],
    restaurants: ['Dishoom', 'Flat Iron', 'Padella'],
    activities: ['London Eye', 'Thames Cruise', 'Borough Market'],
    likes: 12,
    comments: [
      { id: 'c2', user: 'ben', text: 'Save me a seat at Dishoom!', timestamp: Date.now() - 1000 * 60 * 60 * 3 },
    ],
  },
  wanderer_jp: {
    startDate: '2026-05-10',
    endDate: '2026-05-18',
    photos: [
      'https://images.unsplash.com/photo-1541214113241-7f4f6b1659a0?w=800',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800',
    ],
    restaurants: ['Sukiyabashi Jiro', 'Ichiran Ramen', 'Sushi Dai'],
    activities: ['Shibuya Crossing', 'Tsukiji Market', 'Asakusa Temple'],
    likes: 33,
    comments: [
      { id: 'c3', user: 'sam', text: 'Tokyo food is the best 😍', timestamp: Date.now() - 1000 * 60 * 90 },
    ],
  },
  // John Doe's trips (My Trips tab)
  johndoe: {
    startDate: '2023-06-15',
    endDate: '2023-06-30',
    photos: [
      'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
    ],
    restaurants: ['Le Jules Verne', 'Septime', 'L\'Ami Jean'],
    activities: ['Eiffel Tower', 'Louvre Museum', 'Seine River Cruise', 'Montmartre Walk'],
    likes: 156,
    comments: [
      { id: 'c4', user: 'sarah', text: 'Paris is always a good idea! 🇫🇷', timestamp: Date.now() - 1000 * 60 * 45 },
      { id: 'c5', user: 'mike', text: 'Did you try the croissants?', timestamp: Date.now() - 1000 * 60 * 30 },
    ],
  },
  // Featured travelers
  celebrity_traveler: {
    startDate: '2026-01-20',
    endDate: '2026-01-28',
    photos: [
      'https://images.unsplash.com/photo-1534190239940-9ba8944ea261?w=800',
      'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800',
      'https://images.unsplash.com/photo-1542856204-00101eb6def4?w=800',
      'https://images.unsplash.com/photo-1518416177092-ec985e4d6c14?w=800',
    ],
    restaurants: ['Nobu Malibu', 'Republique', 'Bestia'],
    activities: ['Hollywood Sign Hike', 'Venice Beach', 'Getty Center', 'Rodeo Drive'],
    likes: 2847,
    comments: [
      { id: 'c6', user: 'fan123', text: 'Love your LA content! ✨', timestamp: Date.now() - 1000 * 60 * 120 },
      { id: 'c7', user: 'traveler_pro', text: 'Which hotel did you stay at?', timestamp: Date.now() - 1000 * 60 * 80 },
      { id: 'c8', user: 'foodie_girl', text: 'Nobu is the best! 🍣', timestamp: Date.now() - 1000 * 60 * 50 },
    ],
  },
  influencer_world: {
    startDate: '2026-02-10',
    endDate: '2026-02-17',
    photos: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800',
      'https://images.unsplash.com/photo-1546412414-e1885259563a?w=800',
      'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=800',
    ],
    restaurants: ['At.mosphere', 'Zuma Dubai', 'Pierchic'],
    activities: ['Burj Khalifa', 'Desert Safari', 'Dubai Mall', 'Palm Jumeirah'],
    likes: 4521,
    comments: [
      { id: 'c9', user: 'luxury_life', text: 'Dubai is incredible! 🏙️', timestamp: Date.now() - 1000 * 60 * 200 },
      { id: 'c10', user: 'travel_goals', text: 'Adding this to my bucket list!', timestamp: Date.now() - 1000 * 60 * 150 },
      { id: 'c11', user: 'wanderlust22', text: 'The views from Burj Khalifa 😍', timestamp: Date.now() - 1000 * 60 * 100 },
    ],
  },
  sophie_travels: {
    startDate: '2026-04-05',
    endDate: '2026-04-12',
    photos: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
      'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800',
    ],
    restaurants: ['Le Jules Verne', 'L\'Ami Jean', 'Septime'],
    activities: ['Eiffel Tower', 'Louvre Museum', 'Seine River Cruise', 'Montmartre Walk'],
    likes: 45,
    comments: [
      { id: 'c12', user: 'emma', text: 'Paris is always a good idea! 🗼', timestamp: Date.now() - 1000 * 60 * 120 },
      { id: 'c13', user: 'lucas', text: 'Did you try the croissants?', timestamp: Date.now() - 1000 * 60 * 80 },
    ],
  },
  aussie_adventurer: {
    startDate: '2026-06-01',
    endDate: '2026-06-10',
    photos: [
      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
      'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800',
      'https://images.unsplash.com/photo-1549180030-48bf079fb38a?w=800',
    ],
    restaurants: ['Quay', 'Bennelong', 'Aria Restaurant'],
    activities: ['Opera House Tour', 'Bondi Beach', 'Harbour Bridge Climb'],
    likes: 38,
    comments: [
      { id: 'c14', user: 'olivia', text: 'Bondi looks incredible! 🏖️', timestamp: Date.now() - 1000 * 60 * 150 },
    ],
  },
  marco_explorer: {
    startDate: '2026-03-20',
    endDate: '2026-03-27',
    photos: [
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
      'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800',
      'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=800',
      'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=800',
    ],
    restaurants: ['La Pergola', 'Roscioli', 'Trattoria Da Enzo'],
    activities: ['Colosseum Tour', 'Vatican Museums', 'Trevi Fountain', 'Roman Forum'],
    likes: 52,
    comments: [
      { id: 'c15', user: 'isabella', text: 'When in Rome! 🏛️', timestamp: Date.now() - 1000 * 60 * 200 },
      { id: 'c16', user: 'giovanni', text: 'Best pasta ever!', timestamp: Date.now() - 1000 * 60 * 180 },
    ],
  },
  natasha_wanderlust: {
    startDate: '2026-07-15',
    endDate: '2026-07-22',
    photos: [
      'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800',
      'https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=800',
      'https://images.unsplash.com/photo-1520106212299-d99c443e4568?w=800',
    ],
    restaurants: ['White Rabbit', 'Café Pushkin', 'Twins Garden'],
    activities: ['Red Square', 'Kremlin Tour', 'Bolshoi Theatre', 'Metro Tour'],
    likes: 29,
    comments: [
      { id: 'c17', user: 'dmitri', text: 'Beautiful architecture! 🏰', timestamp: Date.now() - 1000 * 60 * 100 },
    ],
  },
  desert_nomad: {
    startDate: '2026-02-10',
    endDate: '2026-02-17',
    photos: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=800',
    ],
    restaurants: ['At.mosphere', 'Pierchic', 'Zuma Dubai'],
    activities: ['Burj Khalifa', 'Desert Safari', 'Dubai Mall', 'Palm Jumeirah'],
    likes: 67,
    comments: [
      { id: 'c18', user: 'sarah', text: 'Luxury at its finest! ✨', timestamp: Date.now() - 1000 * 60 * 240 },
      { id: 'c19', user: 'ahmed', text: 'Desert safari is a must!', timestamp: Date.now() - 1000 * 60 * 220 },
    ],
  },
  brazilian_vibes: {
    startDate: '2026-01-15',
    endDate: '2026-01-22',
    photos: [
      'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
      'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800',
      'https://images.unsplash.com/photo-1544989164-fb6d42bd3e3b?w=800',
    ],
    restaurants: ['Oro', 'Aprazível', 'Marius Degustare'],
    activities: ['Christ the Redeemer', 'Sugarloaf Mountain', 'Copacabana Beach', 'Samba Show'],
    likes: 41,
    comments: [
      { id: 'c20', user: 'carlos', text: 'Rio is pure energy! 🎉', timestamp: Date.now() - 1000 * 60 * 300 },
    ],
  },
  asia_explorer: {
    startDate: '2026-04-20',
    endDate: '2026-04-25',
    photos: [
      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800',
      'https://images.unsplash.com/photo-1508964942454-1a56651d54ac?w=800',
      'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800',
    ],
    restaurants: ['Odette', 'Burnt Ends', 'Hawker Chan'],
    activities: ['Marina Bay Sands', 'Gardens by the Bay', 'Sentosa Island', 'Clarke Quay'],
    likes: 35,
    comments: [
      { id: 'c21', user: 'wei', text: 'Singapore is so clean! 🌆', timestamp: Date.now() - 1000 * 60 * 140 },
    ],
  },
  carlos_travels: {
    startDate: '2026-05-05',
    endDate: '2026-05-12',
    photos: [
      'https://images.unsplash.com/photo-1518659526054-e3231116e1a1?w=800',
      'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=800',
      'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800',
      'https://images.unsplash.com/photo-1512813498716-3e640fed3f39?w=800',
    ],
    restaurants: ['Pujol', 'Quintonil', 'Contramar'],
    activities: ['Teotihuacan Pyramids', 'Frida Kahlo Museum', 'Xochimilco', 'Chapultepec Castle'],
    likes: 48,
    comments: [
      { id: 'c22', user: 'maria', text: 'Tacos for life! 🌮', timestamp: Date.now() - 1000 * 60 * 160 },
      { id: 'c23', user: 'diego', text: 'The pyramids are breathtaking!', timestamp: Date.now() - 1000 * 60 * 140 },
    ],
  },
  thai_foodie: {
    startDate: '2026-03-01',
    endDate: '2026-03-08',
    photos: [
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800',
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
      'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800',
    ],
    restaurants: ['Gaggan', 'Jay Fai', 'Bo.lan'],
    activities: ['Grand Palace', 'Floating Market', 'Wat Pho', 'Chatuchak Market'],
    likes: 56,
    comments: [
      { id: 'c24', user: 'tom', text: 'Street food heaven! 🍜', timestamp: Date.now() - 1000 * 60 * 180 },
      { id: 'c25', user: 'ploy', text: 'Jay Fai is worth the wait!', timestamp: Date.now() - 1000 * 60 * 160 },
    ],
  },
  tango_lover: {
    startDate: '2026-06-15',
    endDate: '2026-06-22',
    photos: [
      'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800',
      'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800',
      'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800',
    ],
    restaurants: ['Don Julio', 'La Cabrera', 'Sarkis'],
    activities: ['Tango Show', 'La Boca', 'Recoleta Cemetery', 'San Telmo Market'],
    likes: 39,
    comments: [
      { id: 'c26', user: 'pablo', text: 'Tango is life! 💃', timestamp: Date.now() - 1000 * 60 * 200 },
    ],
  },
  tech_traveler: {
    startDate: '2026-02-20',
    endDate: '2026-02-27',
    photos: [
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
      'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?w=800',
      'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800',
    ],
    restaurants: ['State Bird Provisions', 'Tartine', 'Zuni Café'],
    activities: ['Golden Gate Bridge', 'Alcatraz', 'Cable Car Ride', 'Fisherman\'s Wharf'],
    likes: 44,
    comments: [
      { id: 'c27', user: 'steve', text: 'SF never gets old! 🌉', timestamp: Date.now() - 1000 * 60 * 250 },
    ],
  },
  german_wanderer: {
    startDate: '2026-04-10',
    endDate: '2026-04-17',
    photos: [
      'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800',
      'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=800',
      'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=800',
    ],
    restaurants: ['Nobelhart & Schmutzig', 'Katz Orange', 'Curry 36'],
    activities: ['Brandenburg Gate', 'Berlin Wall', 'Museum Island', 'Reichstag'],
    likes: 31,
    comments: [
      { id: 'c28', user: 'hans', text: 'History everywhere! 🏛️', timestamp: Date.now() - 1000 * 60 * 170 },
    ],
  },
  china_explorer: {
    startDate: '2026-05-20',
    endDate: '2026-05-28',
    photos: [
      'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
      'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800',
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
      'https://images.unsplash.com/photo-1537890992424-3044f2bc6d0e?w=800',
    ],
    restaurants: ['TRB Hutong', 'Da Dong', 'Jing Yaa Tang'],
    activities: ['Great Wall', 'Forbidden City', 'Temple of Heaven', 'Summer Palace'],
    likes: 61,
    comments: [
      { id: 'c29', user: 'li', text: 'The Great Wall is magnificent! 🏯', timestamp: Date.now() - 1000 * 60 * 190 },
      { id: 'c30', user: 'zhang', text: 'Peking duck at Da Dong!', timestamp: Date.now() - 1000 * 60 * 170 },
    ],
  },
  pyramid_seeker: {
    startDate: '2026-03-10',
    endDate: '2026-03-17',
    photos: [
      'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800',
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800',
      'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800',
    ],
    restaurants: ['Sequoia', 'Abou El Sid', 'Zooba'],
    activities: ['Pyramids of Giza', 'Egyptian Museum', 'Nile Cruise', 'Khan el-Khalili'],
    likes: 73,
    comments: [
      { id: 'c31', user: 'amira', text: 'Ancient wonders! 🐫', timestamp: Date.now() - 1000 * 60 * 280 },
      { id: 'c32', user: 'omar', text: 'The Sphinx is incredible!', timestamp: Date.now() - 1000 * 60 * 260 },
    ],
  },
  nordic_nomad: {
    startDate: '2026-07-01',
    endDate: '2026-07-08',
    photos: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800',
      'https://images.unsplash.com/photo-1601439678777-b2b3c56fa627?w=800',
      'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
    ],
    restaurants: ['Maaemo', 'Kontrast', 'Vippa Food Hall'],
    activities: ['Viking Ship Museum', 'Opera House', 'Vigeland Park', 'Fjord Cruise'],
    likes: 27,
    comments: [
      { id: 'c33', user: 'erik', text: 'Norway is stunning! 🏔️', timestamp: Date.now() - 1000 * 60 * 130 },
    ],
  },
  safari_guide: {
    startDate: '2026-08-05',
    endDate: '2026-08-12',
    photos: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
      'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800',
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
      'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=800',
    ],
    restaurants: ['Carnivore', 'Talisman', 'The Talisman'],
    activities: ['Nairobi National Park', 'Giraffe Centre', 'David Sheldrick Elephant Orphanage', 'Maasai Market'],
    likes: 85,
    comments: [
      { id: 'c34', user: 'jabari', text: 'Wildlife paradise! 🦁', timestamp: Date.now() - 1000 * 60 * 210 },
      { id: 'c35', user: 'amani', text: 'The elephants were amazing!', timestamp: Date.now() - 1000 * 60 * 190 },
    ],
  },
  maple_traveler: {
    startDate: '2026-06-20',
    endDate: '2026-06-27',
    photos: [
      'https://images.unsplash.com/photo-1519659528534-7fd733a832a0?w=800',
      'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800',
      'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800',
    ],
    restaurants: ['Atelier', 'Beckta', 'Play Food & Wine'],
    activities: ['Parliament Hill', 'Rideau Canal', 'ByWard Market', 'Canadian Museum of History'],
    likes: 22,
    comments: [
      { id: 'c36', user: 'emma', text: 'Canada is beautiful! 🍁', timestamp: Date.now() - 1000 * 60 * 150 },
    ],
  },
  travel_influencer_es: {
    startDate: '2026-03-15',
    endDate: '2026-03-22',
    photos: [
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800',
      'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800',
    ],
    restaurants: ['DiverXO', 'Botín', 'Mercado de San Miguel'],
    activities: ['Prado Museum', 'Royal Palace', 'Retiro Park', 'Flamenco Show'],
    likes: 3420,
    comments: [
      { id: 'c37', user: 'maria', text: 'Madrid es increíble! 🇪🇸', timestamp: Date.now() - 1000 * 60 * 180 },
      { id: 'c38', user: 'carlos', text: 'Best tapas ever!', timestamp: Date.now() - 1000 * 60 * 140 },
    ],
  },
  wildlife_explorer: {
    startDate: '2026-07-10',
    endDate: '2026-07-20',
    photos: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
      'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800',
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
      'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=800',
    ],
    restaurants: ['Carnivore Restaurant', 'Talisman', 'Mama Oliech'],
    activities: ['Safari Game Drive', 'Giraffe Centre', 'Elephant Orphanage', 'Maasai Village'],
    likes: 8760,
    comments: [
      { id: 'c39', user: 'nature_lover', text: 'The Big Five! 🦁🐘🦏', timestamp: Date.now() - 1000 * 60 * 220 },
      { id: 'c40', user: 'safari_fan', text: 'Bucket list trip!', timestamp: Date.now() - 1000 * 60 * 190 },
    ],
  },
  aurora_chaser: {
    startDate: '2026-02-01',
    endDate: '2026-02-08',
    photos: [
      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800',
      'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
      'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=800',
    ],
    restaurants: ['Dill Restaurant', 'Grillmarkaðurinn', 'Bæjarins Beztu Pylsur'],
    activities: ['Northern Lights Tour', 'Blue Lagoon', 'Golden Circle', 'Ice Cave'],
    likes: 6890,
    comments: [
      { id: 'c41', user: 'aurora_fan', text: 'The lights are magical! 🌌', timestamp: Date.now() - 1000 * 60 * 260 },
    ],
  },
  adventure_seeker: {
    startDate: '2026-05-15',
    endDate: '2026-05-22',
    photos: [
      'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
      'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',
      'https://images.unsplash.com/photo-1580837119756-563d608dd119?w=800',
    ],
    restaurants: ['Central', 'Cicciolina', 'Café Inkaterra'],
    activities: ['Machu Picchu Trek', 'Sacred Valley', 'Inca Trail', 'Rainbow Mountain'],
    likes: 9340,
    comments: [
      { id: 'c42', user: 'hiker', text: 'Worth every step! 🏔️', timestamp: Date.now() - 1000 * 60 * 200 },
      { id: 'c43', user: 'traveler', text: 'Incredible views!', timestamp: Date.now() - 1000 * 60 * 180 },
    ],
  },
  history_traveler: {
    startDate: '2026-04-20',
    endDate: '2026-04-27',
    photos: [
      'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800',
      'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=800',
      'https://images.unsplash.com/photo-1601581987809-a874a81309c9?w=800',
    ],
    restaurants: ['Funky Gourmet', 'Spondi', 'Varoulko Seaside'],
    activities: ['Acropolis', 'Parthenon', 'Ancient Agora', 'Temple of Zeus'],
    likes: 4560,
    comments: [
      { id: 'c44', user: 'history_buff', text: 'Ancient wonders! 🏛️', timestamp: Date.now() - 1000 * 60 * 170 },
    ],
  },
  tango_queen: {
    startDate: '2026-06-10',
    endDate: '2026-06-17',
    photos: [
      'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800',
      'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800',
      'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800',
    ],
    restaurants: ['Don Julio', 'La Cabrera', 'Elena'],
    activities: ['Tango Show', 'La Boca', 'Recoleta Cemetery', 'Teatro Colón'],
    likes: 5670,
    comments: [
      { id: 'c45', user: 'dancer', text: 'Tango paradise! 💃', timestamp: Date.now() - 1000 * 60 * 210 },
    ],
  },
  india_explorer: {
    startDate: '2026-03-05',
    endDate: '2026-03-12',
    photos: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
    ],
    restaurants: ['Peshawri', 'Esphahan', 'Pinch of Spice'],
    activities: ['Taj Mahal Visit', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh'],
    likes: 7890,
    comments: [
      { id: 'c46', user: 'india_fan', text: 'Monument of love! 🕌', timestamp: Date.now() - 1000 * 60 * 240 },
      { id: 'c47', user: 'photographer', text: 'Sunrise was breathtaking!', timestamp: Date.now() - 1000 * 60 * 220 },
    ],
  },
  japan_wanderer: {
    startDate: '2026-04-01',
    endDate: '2026-04-08',
    photos: [
      'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800',
      'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=800',
      'https://images.unsplash.com/photo-1576675784201-9710bcb1c1d0?w=800',
    ],
    restaurants: ['Houtou Fudou', 'Yoshida Udon', 'Lake View Restaurant'],
    activities: ['Mt. Fuji Climb', 'Lake Kawaguchi', 'Chureito Pagoda', 'Oshino Hakkai'],
    likes: 6230,
    comments: [
      { id: 'c48', user: 'japan_lover', text: 'Iconic Japan! 🗻', timestamp: Date.now() - 1000 * 60 * 190 },
    ],
  },
  art_lover_italy: {
    startDate: '2026-05-10',
    endDate: '2026-05-17',
    photos: [
      'https://images.unsplash.com/photo-1541017736704-8c77c90c4b2a?w=800',
      'https://images.unsplash.com/photo-1557603640-26d6aa1e2b3b?w=800',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800',
    ],
    restaurants: ['Enoteca Pinchiorri', 'Trattoria Mario', 'All\'Antico Vinaio'],
    activities: ['Uffizi Gallery', 'Duomo', 'Ponte Vecchio', 'Michelangelo\'s David'],
    likes: 5430,
    comments: [
      { id: 'c49', user: 'art_fan', text: 'Renaissance beauty! 🎨', timestamp: Date.now() - 1000 * 60 * 160 },
    ],
  },
  nordic_explorer: {
    startDate: '2026-07-05',
    endDate: '2026-07-12',
    photos: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800',
      'https://images.unsplash.com/photo-1601439678777-b2b3c56fa627?w=800',
      'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
    ],
    restaurants: ['Maaemo', 'Kontrast', 'Lysverket'],
    activities: ['Fjord Cruise', 'Viking Ship Museum', 'Vigeland Park', 'Opera House'],
    likes: 4890,
    comments: [
      { id: 'c50', user: 'fjord_lover', text: 'Stunning fjords! ⛰️', timestamp: Date.now() - 1000 * 60 * 150 },
    ],
  },
  cityscape_photographer: {
    startDate: '2026-03-20',
    endDate: '2026-03-27',
    photos: [
      'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800',
    ],
    restaurants: ['Tim Ho Wan', 'Lung King Heen', 'Yardbird'],
    activities: ['Victoria Peak', 'Star Ferry', 'Temple Street Market', 'Big Buddha'],
    likes: 7120,
    comments: [
      { id: 'c51', user: 'city_fan', text: 'Skyline goals! 🏙️', timestamp: Date.now() - 1000 * 60 * 200 },
    ],
  },
  south_africa_guide: {
    startDate: '2026-08-01',
    endDate: '2026-08-10',
    photos: [
      'https://images.unsplash.com/photo-1484318571209-661cf29a69c3?w=800',
      'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
      'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800',
    ],
    restaurants: ['La Madeleine', 'Crawdaddy\'s', 'The Blue Crane'],
    activities: ['Kruger Safari', 'Union Buildings', 'Voortrekker Monument', 'Pretoria Zoo'],
    likes: 3890,
    comments: [
      { id: 'c52', user: 'safari_lover', text: 'Wildlife paradise! 🦒', timestamp: Date.now() - 1000 * 60 * 180 },
    ],
  },
  canada_adventures: {
    startDate: '2026-06-15',
    endDate: '2026-06-22',
    photos: [
      'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=800',
      'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800',
      'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?w=800',
    ],
    restaurants: ['Miku', 'Hawksworth', 'Chambar'],
    activities: ['Stanley Park', 'Capilano Bridge', 'Granville Island', 'Grouse Mountain'],
    likes: 4560,
    comments: [
      { id: 'c53', user: 'canada_fan', text: 'Beautiful BC! 🏔️', timestamp: Date.now() - 1000 * 60 * 170 },
    ],
  },
  egypt_historian: {
    startDate: '2026-03-10',
    endDate: '2026-03-17',
    photos: [
      'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800',
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800',
      'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800',
    ],
    restaurants: ['Sequoia', 'Abou El Sid', 'Zooba'],
    activities: ['Pyramids of Giza', 'Sphinx', 'Egyptian Museum', 'Khan el-Khalili'],
    likes: 8230,
    comments: [
      { id: 'c54', user: 'egypt_fan', text: 'Ancient wonders! 🐫', timestamp: Date.now() - 1000 * 60 * 250 },
      { id: 'c55', user: 'history_lover', text: 'Pharaohs legacy!', timestamp: Date.now() - 1000 * 60 * 230 },
    ],
  },
  europe_backpacker: {
    startDate: '2026-04-15',
    endDate: '2026-04-22',
    photos: [
      'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800',
      'https://images.unsplash.com/photo-1592906209472-a36b1f3782ef?w=800',
      'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=800',
    ],
    restaurants: ['Lokál', 'U Fleků', 'Café Savoy'],
    activities: ['Charles Bridge', 'Prague Castle', 'Old Town Square', 'Astronomical Clock'],
    likes: 5120,
    comments: [
      { id: 'c56', user: 'prague_lover', text: 'Fairytale city! 🏰', timestamp: Date.now() - 1000 * 60 * 190 },
    ],
  },
  asia_foodie: {
    startDate: '2026-05-20',
    endDate: '2026-05-27',
    photos: [
      'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800',
      'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=800',
      'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800',
    ],
    restaurants: ['Dewakan', 'Bijan', 'Jalan Alor Street Food'],
    activities: ['Petronas Towers', 'Batu Caves', 'KL Tower', 'Central Market'],
    likes: 6780,
    comments: [
      { id: 'c57', user: 'food_lover', text: 'Street food heaven! 🍜', timestamp: Date.now() - 1000 * 60 * 160 },
    ],
  },
  peru_gastronomy: {
    startDate: '2026-06-05',
    endDate: '2026-06-12',
    photos: [
      'https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=800',
      'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800',
      'https://images.unsplash.com/photo-1582639590011-f5a8416d1101?w=800',
    ],
    restaurants: ['Central', 'Maido', 'Astrid y Gastón'],
    activities: ['Miraflores', 'Larco Museum', 'Huaca Pucllana', 'Barranco District'],
    likes: 5890,
    comments: [
      { id: 'c58', user: 'foodie', text: 'Ceviche capital! 🐟', timestamp: Date.now() - 1000 * 60 * 180 },
    ],
  },
  russian_culture: {
    startDate: '2026-07-15',
    endDate: '2026-07-22',
    photos: [
      'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800',
      'https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=800',
      'https://images.unsplash.com/photo-1520106212299-d99c443e4568?w=800',
    ],
    restaurants: ['White Rabbit', 'Café Pushkin', 'Twins Garden'],
    activities: ['Red Square', 'Kremlin', 'Bolshoi Theatre', 'St. Basil\'s Cathedral'],
    likes: 6340,
    comments: [
      { id: 'c59', user: 'russia_fan', text: 'Imperial grandeur! 🏛️', timestamp: Date.now() - 1000 * 60 * 140 },
    ],
  },
};

const formatRangeAndDaysLeft = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  const now = new Date();
  const range = `${s.toLocaleDateString()} - ${e.toLocaleDateString()}`;
  let suffix = '';
  if (now < e) {
    const ms = e.getTime() - now.getTime();
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    suffix = ` • ${days} day${days !== 1 ? 's' : ''} left`;
  } else {
    suffix = ' • Trip ended';
  }
  return range + suffix;
};

type MapMode = 'followers' | 'myTrips' | 'featured';

export default function ExploreScreen() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedFollower, setSelectedFollower] = useState<string | null>(null);
  const [followerQuery, setFollowerQuery] = useState('');
  const [searchMatch, setSearchMatch] = useState<string | null>(null);
  const [region, setRegion] = useState(initialRegion);
  const mapRef = useRef<MapView | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>('followers');
  const [showModeToast, setShowModeToast] = useState<boolean>(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [likeCount, setLikeCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [comments, setComments] = useState<{ id: string; user: string; text: string; timestamp: number }[]>([]);
  const [commentInput, setCommentInput] = useState<string>('');
  const [containerH, setContainerH] = useState<number>(0);
  const sheetH = useRef(new Animated.Value(320)).current;

  const onContainerLayout = (e: LayoutChangeEvent) => {
    setContainerH(e.nativeEvent.layout.height);
  };

  const getExpandedH = () => Math.max(360, containerH); // allow full-screen height

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 8,
      onPanResponderMove: (_, gesture) => {
        const collapsed = 320;
        const expanded = getExpandedH();
        // @ts-ignore accessing current value
        const current = (sheetH as any)._value as number;
        const next = Math.max(collapsed, Math.min(expanded, current - gesture.dy));
        sheetH.setValue(next);
      },
      onPanResponderRelease: (_, gesture) => {
        const collapsed = 320;
        const expanded = getExpandedH();
        // @ts-ignore
        const current = (sheetH as any)._value as number;
        const mid = (collapsed + expanded) / 2;
        const snapTo = current > mid || gesture.vy < -0.5 ? expanded : collapsed;
        Animated.spring(sheetH, { toValue: snapTo, useNativeDriver: false, friction: 9, tension: 60 }).start();
      },
    })
  ).current;

  // Expand on upward scroll inside the sheet
  const lastScrollYRef = useRef(0);
  const handleScrollBeginDrag = (e: any) => {
    lastScrollYRef.current = e.nativeEvent.contentOffset.y || 0;
  };
  const handleScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y || 0;
    const delta = y - lastScrollYRef.current;
    // If user scrolls upward (delta < 0) and sheet isn't expanded, expand it
    // @ts-ignore
    const currentH = (sheetH as any)._value as number;
    const expanded = getExpandedH();
    if (delta < -4 && currentH < expanded - 8) {
      Animated.spring(sheetH, { toValue: expanded, useNativeDriver: false, friction: 9, tension: 60 }).start();
    }
    lastScrollYRef.current = y;
  };

  // Reset some explore UI every time screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setSelectedPost(null);
      setSelectedFollower(null);
      setFollowerQuery('');
      setRegion(initialRegion);
      if (mapRef.current?.animateToRegion) {
        mapRef.current.animateToRegion(initialRegion, 300);
      }
      return undefined;
    }, [])
  );

  const handleSelectTraveler = (post: Post) => {
    setSelectedFollower(post.username);
    setSelectedPost(post);

    const userPosts = samplePosts.filter(p => p.username === post.username);
    const coords = userPosts.map(p => ({ latitude: p.latitude, longitude: p.longitude }));
    if (coords.length && mapRef.current?.fitToCoordinates) {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 80, bottom: 80, left: 80, right: 80 },
        animated: true,
      });
    } else {
      setRegion({
        ...region,
        latitude: post.latitude,
        longitude: post.longitude,
        latitudeDelta: 10,
        longitudeDelta: 10,
      });
    }
  };

  // Hydrate like/comments when a post is selected
  React.useEffect(() => {
    if (selectedPost) {
      const td = tripData[selectedPost.username];
      if (td) {
        setLikeCount(td.likes);
        setLiked(false);
        setComments(td.comments);
        setCommentInput('');
      } else {
        setLikeCount(0);
        setLiked(false);
        setComments([]);
        setCommentInput('');
      }
      Animated.spring(sheetH, { toValue: 320, useNativeDriver: false, friction: 9, tension: 60 }).start();
    }
  }, [selectedPost]);

  

  const handleSearchFollower = () => {
    const query = followerQuery.trim().toLowerCase();
    if (!query) {
      setSelectedFollower(null);
      setSearchMatch(null);
      return;
    }
    setSelectedPost(null);
    // filter posts by usernames that include query
    const userNames = Array.from(new Set(samplePosts.map(p => p.username)));
    const match = userNames.find(u => u.toLowerCase().includes(query)) || null;
    setSelectedFollower(match);
    setSearchMatch(match);

    const posts = samplePosts.filter(p => (match ? p.username === match : true));
    const coords = posts.map(p => ({ latitude: p.latitude, longitude: p.longitude }));
    if (coords.length && mapRef.current?.fitToCoordinates) {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 80, bottom: 80, left: 80, right: 80 },
        animated: true,
      });
    }
  };

  // Mock data for 'myTrips' and 'featured' - using John Doe's actual trips
  const myTripsPosts: Post[] = [
    {
      id: 'my1',
      latitude: 48.8566,
      longitude: 2.3522,
      title: 'Summer Europe Trip',
      username: 'johndoe',
      image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=500',
      avatar: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400',
    },
    {
      id: 'my2',
      latitude: 35.6762,
      longitude: 139.6503,
      title: 'Asian Adventure',
      username: 'johndoe',
      image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=500',
      avatar: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400',
    },
    {
      id: 'my3',
      latitude: -8.3405,
      longitude: 115.0920,
      title: 'Beach Vacation',
      username: 'johndoe',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df147ecc?w=500',
      avatar: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400',
    },
    {
      id: 'my4',
      latitude: 41.9028,
      longitude: 12.4964,
      title: 'Roman Holiday',
      username: 'johndoe',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=500',
      avatar: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400',
    },
    {
      id: 'my5',
      latitude: 40.7128,
      longitude: -74.0060,
      title: 'NYC Weekend',
      username: 'johndoe',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500',
      avatar: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400',
    },
    {
      id: 'my6',
      latitude: 51.5074,
      longitude: -0.1278,
      title: 'London Calling',
      username: 'johndoe',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500',
      avatar: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400',
    },
    {
      id: 'my7',
      latitude: 41.3851,
      longitude: 2.1734,
      title: 'Barcelona Vibes',
      username: 'johndoe',
      image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=500',
      avatar: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400',
    },
    {
      id: 'my8',
      latitude: -33.8688,
      longitude: 151.2093,
      title: 'Sydney Adventure',
      username: 'johndoe',
      image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=500',
      avatar: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400',
    },
    {
      id: 'my9',
      latitude: 13.7563,
      longitude: 100.5018,
      title: 'Bangkok Street Food',
      username: 'johndoe',
      image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=500',
      avatar: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400',
    },
    {
      id: 'my10',
      latitude: 37.7749,
      longitude: -122.4194,
      title: 'San Francisco Tech Tour',
      username: 'johndoe',
      image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=500',
      avatar: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400',
    },
    {
      id: 'my11',
      latitude: 52.5200,
      longitude: 13.4050,
      title: 'Berlin History Tour',
      username: 'johndoe',
      image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=500',
      avatar: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400',
    },
    {
      id: 'my12',
      latitude: 25.2048,
      longitude: 55.2708,
      title: 'Dubai Luxury',
      username: 'johndoe',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500',
      avatar: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400',
    },
    {
      id: 'my13',
      latitude: 1.3521,
      longitude: 103.8198,
      title: 'Singapore Stopover',
      username: 'johndoe',
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=500',
      avatar: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400',
    },
    {
      id: 'my14',
      latitude: 19.4326,
      longitude: -99.1332,
      title: 'Mexico City Culture',
      username: 'johndoe',
      image: 'https://images.unsplash.com/photo-1518659526054-e3231116e1a1?w=500',
      avatar: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400',
    },
    {
      id: 'my15',
      latitude: -22.9068,
      longitude: -43.1729,
      title: 'Rio Carnival',
      username: 'johndoe',
      image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=500',
      avatar: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400',
    },
  ];

  const featuredPosts: Post[] = [
    {
      id: 'f1',
      latitude: 34.0522,
      longitude: -118.2437,
      title: 'Los Angeles',
      username: 'celebrity_traveler',
      image: 'https://source.unsplash.com/random/800x800/?losangeles',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'f2',
      latitude: 25.2048,
      longitude: 55.2708,
      title: 'Dubai',
      username: 'influencer_world',
      image: 'https://source.unsplash.com/random/800x800/?dubai',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'f3',
      latitude: 40.4168,
      longitude: -3.7038,
      title: 'Madrid',
      username: 'travel_influencer_es',
      image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'f4',
      latitude: -1.2921,
      longitude: 36.8219,
      title: 'Nairobi Safari',
      username: 'wildlife_explorer',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
      avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'f5',
      latitude: 64.1466,
      longitude: -21.9426,
      title: 'Iceland Northern Lights',
      username: 'aurora_chaser',
      image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'f6',
      latitude: -13.1631,
      longitude: -72.5450,
      title: 'Machu Picchu',
      username: 'adventure_seeker',
      image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'f7',
      latitude: 37.9838,
      longitude: 23.7275,
      title: 'Athens',
      username: 'history_traveler',
      image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'f8',
      latitude: -34.6037,
      longitude: -58.3816,
      title: 'Buenos Aires',
      username: 'tango_queen',
      image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'f9',
      latitude: 27.1751,
      longitude: 78.0421,
      title: 'Taj Mahal',
      username: 'india_explorer',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'f10',
      latitude: 36.2048,
      longitude: 138.2529,
      title: 'Mount Fuji',
      username: 'japan_wanderer',
      image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800',
      avatar: 'https://images.unsplash.com/photo-1541214113241-7f4f6b1659a0?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'f11',
      latitude: 43.7696,
      longitude: 11.2558,
      title: 'Florence',
      username: 'art_lover_italy',
      image: 'https://images.unsplash.com/photo-1541017736704-8c77c90c4b2a?w=800',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'f12',
      latitude: 59.9139,
      longitude: 10.7522,
      title: 'Oslo Fjords',
      username: 'nordic_explorer',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'f13',
      latitude: 22.3193,
      longitude: 114.1694,
      title: 'Hong Kong',
      username: 'cityscape_photographer',
      image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'f14',
      latitude: -25.7479,
      longitude: 28.2293,
      title: 'Pretoria',
      username: 'south_africa_guide',
      image: 'https://images.unsplash.com/photo-1484318571209-661cf29a69c3?w=800',
      avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'f15',
      latitude: 49.2827,
      longitude: -123.1207,
      title: 'Vancouver',
      username: 'canada_adventures',
      image: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=800',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'f16',
      latitude: 30.0444,
      longitude: 31.2357,
      title: 'Cairo Pyramids',
      username: 'egypt_historian',
      image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800',
      avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'f17',
      latitude: 50.0755,
      longitude: 14.4378,
      title: 'Prague',
      username: 'europe_backpacker',
      image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'f18',
      latitude: 3.1390,
      longitude: 101.6869,
      title: 'Kuala Lumpur',
      username: 'asia_foodie',
      image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'f19',
      latitude: -12.0464,
      longitude: -77.0428,
      title: 'Lima',
      username: 'peru_gastronomy',
      image: 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=800',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'f20',
      latitude: 55.7558,
      longitude: 37.6173,
      title: 'Moscow',
      username: 'russian_culture',
      image: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    },
  ];

  const postsToShow = (() => {
    if (selectedFollower) return samplePosts.filter(p => p.username === selectedFollower);
    if (mapMode === 'myTrips') return myTripsPosts;
    if (mapMode === 'featured') return featuredPosts;
    return samplePosts; // followers
  })();

  const handleToggleMapMode = () => {
    const modes: MapMode[] = ['followers', 'myTrips', 'featured'];
    const currentIndex = modes.indexOf(mapMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setMapMode(nextMode);
    setSelectedPost(null);
    setSelectedFollower(null);
    
    // Show toast notification
    setShowModeToast(true);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setShowModeToast(false));
  };

  const getMapModeIcon = () => {
    if (mapMode === 'followers') return 'people';
    if (mapMode === 'myTrips') return 'person';
    return 'star'; // featured
  };

  const getMapModeLabel = () => {
    if (mapMode === 'followers') return 'Friends Recent Trips';
    if (mapMode === 'myTrips') return 'My Trips';
    return 'Featured Trips';
  };

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      {/* Recent Travelers - Avatar bar */}
      <View style={styles.avatarsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
          {samplePosts.map((post) => (
            <TouchableOpacity key={post.id} style={styles.avatarItem} onPress={() => handleSelectTraveler(post)}>
              <Avatar uri={post.avatar} style={styles.avatarImage} />
              <Text style={styles.avatarName} numberOfLines={1}>
                @{post.username}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Follower Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search followers..."
          value={followerQuery}
          onChangeText={setFollowerQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearchFollower}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchFollower}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      {searchMatch && (
        <TouchableOpacity
          style={styles.searchResultRow}
          onPress={() => router.push({ pathname: '/profile/[username]', params: { username: searchMatch } })}
        >
          {(() => {
            const post = samplePosts.find(p => p.username === searchMatch);
            return (
              <>
                <Avatar uri={post?.avatar} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.displayName}>{userDisplayNames[searchMatch] || searchMatch}</Text>
                  <Text style={styles.username}>@{searchMatch}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#bbb" />
              </>
            );
          })()}
        </TouchableOpacity>
      )}

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          {postsToShow.map((post: Post) => (
            <Marker
              key={post.id}
              coordinate={{
                latitude: post.latitude,
                longitude: post.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={() => setSelectedPost(post)}
            >
              <View style={[styles.avatarPin, selectedPost?.id === post.id && styles.avatarPinSelected]}>
                <Avatar uri={post.avatar} style={styles.avatarPinImage} />
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      {/* Selected Post Details */}
      {selectedPost && (
        <Animated.View style={[styles.detailsContainer, { height: sheetH }]}>
          <View style={styles.dragHandleArea} {...panResponder.panHandlers}>
            <View style={styles.dragHandle} />
          </View>
          <ScrollView
            style={styles.detailsScroll}
            contentContainerStyle={styles.detailsContent}
            onScrollBeginDrag={handleScrollBeginDrag}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <TouchableOpacity
              onPress={() => setSelectedPost(null)}
              hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
              style={styles.closeTouchable}
              activeOpacity={0.6}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.cityName}>{selectedPost.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                onPress={() => router.push({ pathname: '/profile/[username]', params: { username: selectedPost.username } })}
                activeOpacity={0.7}
              >
                <Avatar uri={selectedPost.avatar} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.displayName}>{userDisplayNames[selectedPost.username] || selectedPost.username}</Text>
                  <Text style={styles.username}>@{selectedPost.username}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.messageBtn}
                onPress={() => router.push({ pathname: '/chat/[username]', params: { username: selectedPost.username } })}
              >
                <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
                <Text style={styles.messageBtnText}>Message</Text>
              </TouchableOpacity>
            </View>
            {(() => {
              const td = tripData[selectedPost.username];
              const gallery = td?.photos?.length ? td.photos : [selectedPost.image];
              return (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery} contentContainerStyle={{ gap: 8 }}>
                  {gallery.slice(0, 10).map((uri, idx) => (
                    <Image key={`${selectedPost.id}-g-${idx}`} source={{ uri }} style={styles.galleryImg} />
                  ))}
                </ScrollView>
              );
            })()}

            {tripData[selectedPost.username] && (
              <View style={styles.tripInfoBox}>
                <Text style={styles.tripInfoTitle}>Trip Info</Text>
                <Text style={styles.tripInfoText}>
                  {formatRangeAndDaysLeft(tripData[selectedPost.username].startDate, tripData[selectedPost.username].endDate)}
                </Text>
                {!!tripData[selectedPost.username].restaurants?.length && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.subHeading}>Restaurants</Text>
                    <View style={styles.chipsRow}>
                      {tripData[selectedPost.username].restaurants.map((r, i) => (
                        <View key={`r-${i}`} style={styles.chip}><Text style={styles.chipText}>{r}</Text></View>
                      ))}
                    </View>
                  </View>
                )}
                {!!tripData[selectedPost.username].activities?.length && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.subHeading}>Activities</Text>
                    <View style={styles.chipsRow}>
                      {tripData[selectedPost.username].activities.map((a, i) => (
                        <View key={`a-${i}`} style={styles.chip}><Text style={styles.chipText}>{a}</Text></View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Like & Comments */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                onPress={() => {
                  setLiked((prev) => {
                    const next = !prev;
                    setLikeCount((c) => c + (next ? 1 : -1));
                    return next;
                  });
                }}
                style={styles.likeBtn}
              >
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? '#ff3040' : '#ff3040'} />
                <Text style={styles.likeText}>{likeCount}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.commentsBox}>
              <Text style={styles.subHeading}>Comments</Text>
              {comments.map((c) => (
                <View key={c.id} style={styles.commentRow}>
                  <Text style={styles.commentUser}>@{c.user}</Text>
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
              ))}
              <View style={styles.commentInputRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  value={commentInput}
                  onChangeText={setCommentInput}
                  returnKeyType="send"
                  onSubmitEditing={() => {
                    const txt = commentInput.trim();
                    if (!txt) return;
                    setComments((prev) => [...prev, { id: String(Date.now()), user: 'you', text: txt, timestamp: Date.now() }]);
                    setCommentInput('');
                  }}
                />
                <TouchableOpacity
                  style={styles.commentSend}
                  onPress={() => {
                    const txt = commentInput.trim();
                    if (!txt) return;
                    setComments((prev) => [...prev, { id: String(Date.now()), user: 'you', text: txt, timestamp: Date.now() }]);
                    setCommentInput('');
                  }}
                >
                  <Ionicons name="send" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      )}

      {/* Mode toast notification */}
      {showModeToast && (
        <Animated.View style={[styles.modeToast, { opacity: toastOpacity }]}>
          <Ionicons name={getMapModeIcon()} size={20} color="#0fa3a3" />
          <Text style={styles.modeToastText}>{getMapModeLabel()}</Text>
        </Animated.View>
      )}

      {/* Floating buttons */}
      <View style={styles.fabContainer}>
        {/* Map mode toggle */}
        <TouchableOpacity
          style={[styles.fab, { marginBottom: 12 }]}
          onPress={handleToggleMapMode}
          activeOpacity={0.8}
        >
          <Ionicons name={getMapModeIcon()} size={22} color="#0fa3a3" />
        </TouchableOpacity>
        {/* DM button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push({ pathname: '/chat' })}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-ellipses" size={22} color="#0fa3a3" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  avatarsContainer: {
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0fa3a3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultRow: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 72,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#0fa3a3',
    backgroundColor: '#ddd',
  },
  avatarName: {
    marginTop: 6,
    fontSize: 12,
    color: '#333',
    maxWidth: 72,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    alignItems: 'center',
  },
  avatarPin: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0fa3a3',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  avatarPinSelected: {
    borderColor: '#ff3040',
  },
  avatarPinImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  detailsContent: {
    padding: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  closeTouchable: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  username: {
    color: '#666',
    marginBottom: 0,
  },
  displayName: {
    fontWeight: '700',
    color: '#111',
    marginBottom: 2,
  },
  postImage: {
    height: 200,
    width: '100%',
    borderRadius: 12,
  },
  modeToast: {
    position: 'absolute',
    top: 200,
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#0fa3a3',
  },
  modeToastText: {
    color: '#0fa3a3',
    fontSize: 15,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#0fa3a3',
  },
  messageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#0fa3a3',
  },
  messageBtnText: {
    color: '#0fa3a3',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 6,
  },
  // Bottom sheet additions
  dragHandleArea: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  detailsScroll: {
    flex: 1,
  },
  // New styles for trip gallery, info, likes/comments
  gallery: {
    marginTop: 8,
  },
  galleryImg: {
    width: 140,
    height: 100,
    borderRadius: 10,
  },
  tripInfoBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fafafa',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  tripInfoTitle: {
    fontWeight: '700',
    marginBottom: 4,
    color: '#111',
  },
  tripInfoText: {
    color: '#444',
  },
  subHeading: {
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#eef7f7',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d5ecec',
  },
  chipText: {
    color: '#0fa3a3',
    fontWeight: '600',
    fontSize: 12,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff0f2',
    borderWidth: 1,
    borderColor: '#ffd5db',
  },
  likeText: {
    color: '#ff3040',
    fontWeight: '700',
  },
  commentsBox: {
    marginTop: 12,
  },
  commentRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  commentUser: {
    fontWeight: '700',
    color: '#111',
  },
  commentText: {
    color: '#333',
    flexShrink: 1,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 18,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  commentSend: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0fa3a3',
    alignItems: 'center',
    justifyContent: 'center',
  },
});