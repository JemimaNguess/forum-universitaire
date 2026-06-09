import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../components/theme';

const DashboardScreen = () => {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <Text style={[styles.title, { color: theme.text }]}>Dashboard Admin</Text>
      <Text style={[styles.subtitle, { color: theme.subtext }]}>Écran de gestion administrative temporaire.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default DashboardScreen;
