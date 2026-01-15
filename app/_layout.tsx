import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';

// Root layout - wraps the entire app with auth, theme, and safe area providers
export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={useColorScheme() === 'dark' ? DarkTheme : DefaultTheme}>
        <SafeAreaProvider>
          <StatusBar style={useColorScheme() === 'dark' ? 'light' : 'dark'} />
          <RootLayoutNav />
        </SafeAreaProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#000'} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{
      headerShown: false,
      headerStyle: {
        backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
      },
      headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
    }}>
      {!user ? (
        // Show auth flow if not logged in
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      ) : (
        // Main app screens for authenticated users
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="trip/[id]" 
            options={{ 
              headerShown: true,
              title: 'Trip Details',
              headerBackTitle: 'Back'
            }} 
          />
          <Stack.Screen 
            name="user/[id]" 
            options={{ 
              headerShown: true,
              title: 'Profile',
              headerBackTitle: 'Back'
            }} 
          />
          <Stack.Screen 
            name="comments/[postId]" 
            options={{ 
              headerShown: true,
              title: 'Comments',
              headerBackTitle: 'Back',
              presentation: 'modal'
            }} 
          />
        </>
      )}
      
      {/* Common modals */}
      <Stack.Screen 
        name="modal" 
        options={{ 
          presentation: 'modal',
          headerShown: false
        }} 
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
