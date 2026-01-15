import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

type TabType = 'flights' | 'hotels' | 'restaurants' | 'activities';

export default function TravelScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('flights');
  const [searchQuery, setSearchQuery] = useState('');
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [travelers, setTravelers] = useState(1);
  // Restaurants state
  const [restaurantLocation, setRestaurantLocation] = useState('');
  const [restaurantLoading, setRestaurantLoading] = useState(false);
  const [restaurantError, setRestaurantError] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Array<{ id: string; name: string; cuisine?: string; address?: string; lat?: number; lon?: number }>>([]);
  // Hotels state
  const [hotelLocation, setHotelLocation] = useState('');
  const [hotelLoading, setHotelLoading] = useState(false);
  const [hotelError, setHotelError] = useState<string | null>(null);
  const [hotels, setHotels] = useState<Array<{ id: string; name: string; stars?: string; address?: string; lat?: number; lon?: number }>>([]);
  // Activities state
  const [activityLocation, setActivityLocation] = useState('');
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [activities, setActivities] = useState<Array<{ id: string; name: string; type?: string; address?: string; lat?: number; lon?: number }>>([]);
  // Map state
  const [mapRegion, setMapRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null>(null);
  // Add to trip modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ name: string; type: string } | null>(null);

  const searchRestaurants = async () => {
    const q = restaurantLocation.trim();
    if (!q) return;
    setRestaurantLoading(true);
    setRestaurantError(null);
    setRestaurants([]);
    try {
      // 1) Geocode location to lat/lon (Nominatim)
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Trippi/1.0 (educational app)' }
      });
      const geoJson = await geoRes.json();
      if (!Array.isArray(geoJson) || geoJson.length === 0) {
        throw new Error('No results for that location');
      }
      const { lat, lon } = geoJson[0];

      // 2) Query Overpass for restaurants near location
      const radius = 3000; // meters
      const overpassQuery = `[
        out:json][timeout:25];
        (
          node["amenity"="restaurant"](around:${radius},${lat},${lon});
          way["amenity"="restaurant"](around:${radius},${lat},${lon});
          relation["amenity"="restaurant"](around:${radius},${lat},${lon});
        );
        out center 20;`;

      const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ data: overpassQuery }).toString(),
      });
      const overpassJson = await overpassRes.json();
      const elements = Array.isArray(overpassJson?.elements) ? overpassJson.elements : [];

      // Map and take top 20 by presence of name
      const mapped: Array<{ id: string; name: string; cuisine?: string; address?: string; lat?: number; lon?: number }> = elements
        .map((el: any) => ({
          id: String(el.id),
          name: el.tags?.name || 'Unnamed Restaurant',
          cuisine: el.tags?.cuisine,
          address: el.tags?.['addr:street']
            ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}`.trim()
            : undefined,
          lat: el.lat || el.center?.lat,
          lon: el.lon || el.center?.lon,
        }))
        .filter((r: { id: string; name: string }) => !!r.name)
        .slice(0, 20);

      setRestaurants(mapped);
      // Set map region to center on results
      if (mapped.length > 0 && mapped[0].lat && mapped[0].lon) {
        setMapRegion({
          latitude: mapped[0].lat,
          longitude: mapped[0].lon,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (e: any) {
      setRestaurantError(e?.message || 'Failed to load restaurants');
    } finally {
      setRestaurantLoading(false);
    }
  };

  const searchHotels = async () => {
    const q = hotelLocation.trim();
    if (!q) return;
    setHotelLoading(true);
    setHotelError(null);
    setHotels([]);
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Trippi/1.0 (educational app)' }
      });
      const geoJson = await geoRes.json();
      if (!Array.isArray(geoJson) || geoJson.length === 0) {
        throw new Error('No results for that location');
      }
      const { lat, lon } = geoJson[0];

      const radius = 5000; // meters
      const overpassQuery = `[
        out:json][timeout:25];
        (
          node["tourism"="hotel"](around:${radius},${lat},${lon});
          way["tourism"="hotel"](around:${radius},${lat},${lon});
          node["tourism"="guest_house"](around:${radius},${lat},${lon});
          way["tourism"="guest_house"](around:${radius},${lat},${lon});
        );
        out center 30;`;

      const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ data: overpassQuery }).toString(),
      });
      const overpassJson = await overpassRes.json();
      const elements = Array.isArray(overpassJson?.elements) ? overpassJson.elements : [];

      const mapped: Array<{ id: string; name: string; stars?: string; address?: string; lat?: number; lon?: number }> = elements
        .map((el: any) => ({
          id: String(el.id),
          name: el.tags?.name || 'Unnamed Hotel',
          stars: el.tags?.['stars'],
          address: el.tags?.['addr:street']
            ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}`.trim()
            : undefined,
          lat: el.lat || el.center?.lat,
          lon: el.lon || el.center?.lon,
        }))
        .filter((h: { id: string; name: string }) => !!h.name)
        .slice(0, 30);

      setHotels(mapped);
      // Set map region to center on results
      if (mapped.length > 0 && mapped[0].lat && mapped[0].lon) {
        setMapRegion({
          latitude: mapped[0].lat,
          longitude: mapped[0].lon,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (e: any) {
      setHotelError(e?.message || 'Failed to load hotels');
    } finally {
      setHotelLoading(false);
    }
  };

  const searchActivities = async () => {
    const q = activityLocation.trim();
    if (!q) return;
    setActivityLoading(true);
    setActivityError(null);
    setActivities([]);
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Trippi/1.0 (educational app)' }
      });
      const geoJson = await geoRes.json();
      if (!Array.isArray(geoJson) || geoJson.length === 0) {
        throw new Error('No results for that location');
      }
      const { lat, lon } = geoJson[0];

      const radius = 6000;
      const overpassQuery = `[
        out:json][timeout:25];
        (
          node["tourism"="attraction"](around:${radius},${lat},${lon});
          way["tourism"="attraction"](around:${radius},${lat},${lon});
          node["leisure"="park"](around:${radius},${lat},${lon});
          way["leisure"="park"](around:${radius},${lat},${lon});
        );
        out center 30;`;

      const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ data: overpassQuery }).toString(),
      });
      const overpassJson = await overpassRes.json();
      const elements = Array.isArray(overpassJson?.elements) ? overpassJson.elements : [];

      const mapped: Array<{ id: string; name: string; type?: string; address?: string; lat?: number; lon?: number }> = elements
        .map((el: any) => ({
          id: String(el.id),
          name: el.tags?.name || 'Attraction',
          type: el.tags?.tourism || el.tags?.leisure,
          address: el.tags?.['addr:street']
            ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}`.trim()
            : undefined,
          lat: el.lat || el.center?.lat,
          lon: el.lon || el.center?.lon,
        }))
        .filter((a: { id: string; name: string }) => !!a.name)
        .slice(0, 30);

      setActivities(mapped);
      // Set map region to center on results
      if (mapped.length > 0 && mapped[0].lat && mapped[0].lon) {
        setMapRegion({
          latitude: mapped[0].lat,
          longitude: mapped[0].lon,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (e: any) {
      setActivityError(e?.message || 'Failed to load activities');
    } finally {
      setActivityLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'flights':
        return (
          <View style={styles.tabContent}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Where are you flying to?"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Destination</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#0fa3a3" />
                <TextInput
                  style={styles.input}
                  placeholder="City or Airport"
                  value={destination}
                  onChangeText={setDestination}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Dates</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="calendar-outline" size={20} color="#0fa3a3" />
                  <TextInput
                    style={styles.input}
                    placeholder="Select dates"
                    value={dates}
                    onChangeText={setDates}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Travelers</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="people-outline" size={20} color="#0fa3a3" />
                  <TextInput
                    style={styles.input}
                    placeholder="1 traveler"
                    value={travelers.toString()}
                    onChangeText={(text) => setTravelers(parseInt(text) || 1)}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.searchButton}>
              <Text style={styles.searchButtonText}>Search Flights</Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'hotels':
        return (
          <View style={styles.tabContent}>
            <View style={styles.searchContainer}>
              <Ionicons name="location-outline" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Enter a city or address"
                value={hotelLocation}
                onChangeText={setHotelLocation}
                placeholderTextColor="#999"
                returnKeyType="search"
                onSubmitEditing={searchHotels}
              />
            </View>
            <TouchableOpacity style={styles.searchButton} onPress={searchHotels} disabled={hotelLoading || !hotelLocation.trim()}>
              {hotelLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>Find Hotels</Text>
              )}
            </TouchableOpacity>
            {hotelError && (
              <Text style={{ color: '#cc0000', marginTop: 10 }}>{hotelError}</Text>
            )}
            {/* Map View */}
            {mapRegion && hotels.length > 0 && (
              <View style={styles.mapView}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={styles.map}
                  region={mapRegion}
                >
                  {hotels.filter(h => h.lat && h.lon).map(h => (
                    <Marker
                      key={h.id}
                      coordinate={{ latitude: h.lat!, longitude: h.lon! }}
                      title={h.name}
                      description={h.address}
                    >
                      <View style={styles.mapMarker}>
                        <Ionicons name="bed" size={16} color="#fff" />
                      </View>
                    </Marker>
                  ))}
                </MapView>
              </View>
            )}
            <View style={{ marginTop: 16, gap: 12 }}>
              {hotels.map(h => (
                <View key={h.id} style={{ backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>{h.name}</Text>
                    {h.stars && <Text style={{ color: '#666', marginTop: 2 }}>{h.stars}★</Text>}
                    {h.address && <Text style={{ color: '#666', marginTop: 2 }}>{h.address}</Text>}
                  </View>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setSelectedItem({ name: h.name, type: 'hotel' });
                      setShowAddModal(true);
                    }}
                  >
                    <Ionicons name="add-circle" size={18} color="#0fa3a3" />
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {!hotelLoading && hotels.length === 0 && !hotelError && (
                <Text style={{ color: '#666', textAlign: 'center', marginTop: 12 }}>Enter a location to see nearby hotels</Text>
              )}
            </View>
          </View>
        );
      
      case 'restaurants':
        return (
          <View style={styles.tabContent}>
            <View style={styles.searchContainer}>
              <Ionicons name="location-outline" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Enter a city or address"
                value={restaurantLocation}
                onChangeText={setRestaurantLocation}
                placeholderTextColor="#999"
                returnKeyType="search"
                onSubmitEditing={searchRestaurants}
              />
            </View>
            <TouchableOpacity style={styles.searchButton} onPress={searchRestaurants} disabled={restaurantLoading || !restaurantLocation.trim()}>
              {restaurantLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>Find Restaurants</Text>
              )}
            </TouchableOpacity>
            {restaurantError && (
              <Text style={{ color: '#cc0000', marginTop: 10 }}>{restaurantError}</Text>
            )}
            {/* Map View */}
            {mapRegion && restaurants.length > 0 && (
              <View style={styles.mapView}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={styles.map}
                  region={mapRegion}
                >
                  {restaurants.filter(r => r.lat && r.lon).map(r => (
                    <Marker
                      key={r.id}
                      coordinate={{ latitude: r.lat!, longitude: r.lon! }}
                      title={r.name}
                      description={r.cuisine}
                    >
                      <View style={styles.mapMarker}>
                        <Ionicons name="restaurant" size={16} color="#fff" />
                      </View>
                    </Marker>
                  ))}
                </MapView>
              </View>
            )}
            <View style={{ marginTop: 16, gap: 12 }}>
              {restaurants.map(r => (
                <View key={r.id} style={{ backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>{r.name}</Text>
                    {r.cuisine && <Text style={{ color: '#666', marginTop: 2 }}>{r.cuisine}</Text>}
                    {r.address && <Text style={{ color: '#666', marginTop: 2 }}>{r.address}</Text>}
                  </View>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setSelectedItem({ name: r.name, type: 'restaurant' });
                      setShowAddModal(true);
                    }}
                  >
                    <Ionicons name="add-circle" size={18} color="#0fa3a3" />
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {!restaurantLoading && restaurants.length === 0 && !restaurantError && (
                <Text style={{ color: '#666', textAlign: 'center', marginTop: 12 }}>Enter a location to see top nearby restaurants</Text>
              )}
            </View>
          </View>
        );
      
      case 'activities':
        return (
          <View style={styles.tabContent}>
            <View style={styles.searchContainer}>
              <Ionicons name="location-outline" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Enter a city or address"
                value={activityLocation}
                onChangeText={setActivityLocation}
                placeholderTextColor="#999"
                returnKeyType="search"
                onSubmitEditing={searchActivities}
              />
            </View>
            <TouchableOpacity style={styles.searchButton} onPress={searchActivities} disabled={activityLoading || !activityLocation.trim()}>
              {activityLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>Find Activities</Text>
              )}
            </TouchableOpacity>
            {activityError && (
              <Text style={{ color: '#cc0000', marginTop: 10 }}>{activityError}</Text>
            )}
            {/* Map View */}
            {mapRegion && activities.length > 0 && (
              <View style={styles.mapView}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={styles.map}
                  region={mapRegion}
                >
                  {activities.filter(a => a.lat && a.lon).map(a => (
                    <Marker
                      key={a.id}
                      coordinate={{ latitude: a.lat!, longitude: a.lon! }}
                      title={a.name}
                      description={a.type}
                    >
                      <View style={styles.mapMarker}>
                        <Ionicons name="map" size={16} color="#fff" />
                      </View>
                    </Marker>
                  ))}
                </MapView>
              </View>
            )}
            <View style={{ marginTop: 16, gap: 12 }}>
              {activities.map(a => (
                <View key={a.id} style={{ backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>{a.name}</Text>
                    {a.type && <Text style={{ color: '#666', marginTop: 2 }}>{a.type}</Text>}
                    {a.address && <Text style={{ color: '#666', marginTop: 2 }}>{a.address}</Text>}
                  </View>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setSelectedItem({ name: a.name, type: 'activity' });
                      setShowAddModal(true);
                    }}
                  >
                    <Ionicons name="add-circle" size={18} color="#0fa3a3" />
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {!activityLoading && activities.length === 0 && !activityError && (
                <Text style={{ color: '#666', textAlign: 'center', marginTop: 12 }}>Enter a location to see nearby attractions and parks</Text>
              )}
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Add to Trip/Bucket List Modal */}
      {showAddModal && selectedItem && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add {selectedItem.name}</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Add this {selectedItem.type} to:</Text>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                // Add to bucket list logic here
                setShowAddModal(false);
                // Show success toast
              }}
            >
              <Ionicons name="heart-outline" size={22} color="#0fa3a3" />
              <Text style={styles.modalOptionText}>Bucket List</Text>
              <Ionicons name="chevron-forward" size={18} color="#bbb" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                // Navigate to trip selection
                setShowAddModal(false);
                // router.push('/bucket-list');
              }}
            >
              <Ionicons name="airplane-outline" size={22} color="#0fa3a3" />
              <Text style={styles.modalOptionText}>Upcoming Trip</Text>
              <Ionicons name="chevron-forward" size={18} color="#bbb" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                // Create new trip with this item
                setShowAddModal(false);
                // router.push('/trips');
              }}
            >
              <Ionicons name="add-circle-outline" size={22} color="#0fa3a3" />
              <Text style={styles.modalOptionText}>Create New Trip</Text>
              <Ionicons name="chevron-forward" size={18} color="#bbb" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'flights' && styles.activeTab]}
          onPress={() => setActiveTab('flights')}
        >
          <Ionicons 
            name="airplane" 
            size={22} 
            color={activeTab === 'flights' ? '#fff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'flights' && styles.activeTabText]}>
            Flights
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'hotels' && styles.activeTab]}
          onPress={() => setActiveTab('hotels')}
        >
          <Ionicons 
            name="bed" 
            size={22} 
            color={activeTab === 'hotels' ? '#fff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'hotels' && styles.activeTabText]}>
            Hotels
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'restaurants' && styles.activeTab]}
          onPress={() => setActiveTab('restaurants')}
        >
          <Ionicons 
            name="restaurant" 
            size={22} 
            color={activeTab === 'restaurants' ? '#fff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'restaurants' && styles.activeTabText]}>
            Restaurants
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'activities' && styles.activeTab]}
          onPress={() => setActiveTab('activities')}
        >
          <Ionicons 
            name="map" 
            size={22} 
            color={activeTab === 'activities' ? '#fff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'activities' && styles.activeTabText]}>
            Activities
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView 
        style={styles.contentContainer}
        contentContainerStyle={{ paddingBottom: 30 }} // Add some padding at the bottom
      >
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    marginBottom: 16,
    // Wrap to two rows
    flexWrap: 'wrap',
    rowGap: 10,
    columnGap: 12,
    justifyContent: 'space-between',
  },
  tab: {
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginHorizontal: 0,
    // Two per row
    width: '48%',
  },
  activeTab: {
    backgroundColor: '#0fa3a3',
  },
  tabText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    marginTop: 8,
    height: 50,
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
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginHorizontal: -5,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 50,
  },
  input: {
    flex: 1,
    height: '100%',
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#0fa3a3',
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  comingSoon: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#0fa3a3',
  },
  addButtonText: {
    color: '#0fa3a3',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  modalOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  mapView: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  map: {
    flex: 1,
  },
  mapMarker: {
    backgroundColor: '#0fa3a3',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
});