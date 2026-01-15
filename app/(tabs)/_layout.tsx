import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Platform } from 'react-native';
import React from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Tabs 
          screenOptions={{ 
            headerShown: false, 
            header: () => null,
            tabBarActiveTintColor: '#0fa3a3',
            tabBarInactiveTintColor: isDark ? '#888' : '#666',
            tabBarStyle: {
              height: Platform.OS === 'ios' ? 88 : 72,
              paddingBottom: Platform.OS === 'ios' ? 20 : 8,
              paddingTop: 8,
              borderTopWidth: 1,
              backgroundColor: isDark ? '#121212' : '#fff',
              borderTopColor: isDark ? '#333' : '#f0f0f0',
              elevation: 0,
              shadowOpacity: 0,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
              marginBottom: 4,
            },
            tabBarItemStyle: {
              paddingVertical: 4,
            },
          }}
          initialRouteName="explore"
        >
          {/* Explore Tab - Discover new trips and destinations */}
          <Tabs.Screen
            name="explore"
            options={{
              title: 'Explore',
              tabBarIcon: ({ color, size, focused }) => (
                <MaterialCommunityIcons 
                  name={'earth'} 
                  size={size} 
                  color={color} 
                />
              ),
            }}
          />
          
          {/* Create Tab - Create new trips, posts, or activities */}
          <Tabs.Screen
            name="create"
            options={{
              title: 'Create',
              tabBarIcon: ({ color, size, focused }) => (
                <View style={{
                  backgroundColor: focused ? '#0fa3a3' : '#f0f0f0',
                  width: size * 2,
                  height: size * 2,
                  borderRadius: size,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: Platform.OS === 'ios' ? 20 : 0,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                }}>
                  <Ionicons 
                    name="add" 
                    size={size * 0.8} 
                    color={focused ? '#fff' : '#666'}
                  />
                </View>
              ),
              tabBarLabel: () => null,
            }}
          />

          {/* Travel Tab - renamed to Book */}
          <Tabs.Screen
            name="travel"
            options={{
              title: 'Book',
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons 
                  name={focused ? 'airplane' : 'airplane-outline'} 
                  size={size} 
                  color={color} 
                />
              ),
            }}
          />

          {/* Bucket List Tab */}
          <Tabs.Screen
            name="bucket-list"
            options={{
              title: 'Bucket',
              tabBarIcon: ({ color, size, focused }) => (
                <MaterialCommunityIcons 
                  name={focused ? 'bucket' : 'bucket-outline'} 
                  size={size} 
                  color={color} 
                />
              ),
            }}
          />
          
          {/* Trips (folder) Tab - maps to trips/index */}
          <Tabs.Screen
            name="trips/index"
            options={{
              title: 'Trips',
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons 
                  name={focused ? 'add-circle' : 'add-circle-outline'} 
                  size={size} 
                  color={color} 
                />
              ),
            }}
          />
          
          {/* Trips Tab - View and manage your trips */}
          <Tabs.Screen
            name="trips"
            options={{
              title: 'Trips',
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons 
                  name={focused ? 'add-circle' : 'add-circle-outline'} 
                  size={size} 
                  color={color} 
                />
              ),
            }}
          />
          
          {/* Profile Tab - User profile and settings */}
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, size, focused }) => (
                <View style={{
                  width: size + 8,
                  height: size + 8,
                  borderRadius: (size + 8) / 2,
                  borderWidth: focused ? 2 : 0,
                  borderColor: focused ? '#0fa3a3' : 'transparent',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Ionicons 
                    name={focused ? 'person' : 'person-outline'} 
                    size={size * 0.9} 
                    color={color} 
                  />
                </View>
              ),
            }}
          />
        </Tabs>
      </SafeAreaView>
    </View>
  );
}
