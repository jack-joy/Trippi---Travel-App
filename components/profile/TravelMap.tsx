import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// Sample country coordinates (in a real app, this would come from your data)
const countryCoordinates = {
  'United States': { latitude: 37.0902, longitude: -95.7129 },
  'France': { latitude: 46.2276, longitude: 2.2137 },
  'Italy': { latitude: 41.8719, longitude: 12.5674 },
  'Japan': { latitude: 36.2048, longitude: 138.2529 },
  'Thailand': { latitude: 15.87, longitude: 100.9925 },
  'Spain': { latitude: 40.4637, longitude: -3.7492 },
  'Mexico': { latitude: 23.6345, longitude: -102.5528 },
  'Canada': { latitude: 56.1304, longitude: -106.3468 },
  'Australia': { latitude: -25.2744, longitude: 133.7751 },
  'Germany': { latitude: 51.1657, longitude: 10.4515 },
};

interface TravelMapProps {
  countries: string[];
}

const TravelMap: React.FC<TravelMapProps> = ({ countries }) => {
  // Get coordinates for the visited countries
  const markers = countries
    .filter(country => countryCoordinates[country as keyof typeof countryCoordinates])
    .map(country => ({
      ...countryCoordinates[country as keyof typeof countryCoordinates],
      id: country,
    }));

  // Initialize centered on the United States
  const getRegion = () => {
    return {
      latitude: countryCoordinates['United States'].latitude,
      longitude: countryCoordinates['United States'].longitude,
      latitudeDelta: 25,
      longitudeDelta: 35,
    };
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getRegion()}
        scrollEnabled={true}
        zoomEnabled={true}
        rotateEnabled={false}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.id}
          >
            <View style={styles.marker}>
              <View style={styles.markerInner} />
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
    backgroundColor: '#f0f0f0',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 163, 163, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0fa3a3',
  },
});

export default TravelMap;
