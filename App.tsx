import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { Header } from '@/component/Header';
import { ThemedView } from '@/component/ThemedView';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TodoList } from '@/component/TodoList';

const AppContent = () => {
  const { theme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <TodoList />
      </View>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </ThemedView>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppContent />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
