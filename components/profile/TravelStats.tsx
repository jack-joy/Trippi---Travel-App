import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TravelStatsProps {
  stats: {
    countries: number;
    continents: number;
    trips: number;
    daysTraveled: number;
  };
}

const TravelStats: React.FC<TravelStatsProps> = ({ stats }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Travel Statistics</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.countries}</Text>
          <Text style={styles.statLabel}>Countries</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.continents}</Text>
          <Text style={styles.statLabel}>Continents</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.trips}</Text>
          <Text style={styles.statLabel}>Trips</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.daysTraveled}+</Text>
          <Text style={styles.statLabel}>Days Traveled</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignSelf: 'stretch',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0fa3a3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default TravelStats;
