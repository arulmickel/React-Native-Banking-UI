import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * Root component for the Banking UI application.
 * Wraps the app in SafeAreaProvider for notch/edge-aware layouts
 * and sets up the navigation container.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
