import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated,
  Dimensions, Image
} from 'react-native';
import { useTheme } from '../../components/theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const c          = useTheme();
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 900, useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0, duration: 900, useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Accueil');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>

      {/* Cercles décoratifs */}
      <View style={[styles.circleTop, { backgroundColor: c.card }]} />
      <View style={[styles.circleBottom, { backgroundColor: c.card }]} />

      <Animated.View style={[
        styles.content,
        { opacity, transform: [{ translateY }] }
      ]}>

        {/* Logo PNG */}
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Texte */}
        <Text style={[styles.title, { color: c.text }]}>Forum</Text>
        <Text style={[styles.title, { color: c.text }]}>Universitaire</Text>
        <Text style={[styles.tagline, { color: c.subtext }]}>
          Échangez, partagez et apprenez{'\n'}ensemble.
        </Text>

      </Animated.View>

      {/* Points de chargement */}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, { backgroundColor: c.primary }]} />
        <View style={[styles.dot, { backgroundColor: c.border }]} />
        <View style={[styles.dot, { backgroundColor: c.border }]} />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  circleTop: {
    position:     'absolute',
    top:          -120,
    left:         -120,
    width:        350,
    height:       350,
    borderRadius: 175,
    opacity:      0.6,
  },
  circleBottom: {
    position:     'absolute',
    bottom:       -100,
    right:        -100,
    width:        280,
    height:       280,
    borderRadius: 140,
    opacity:      0.4,
  },
  content: {
    alignItems:    'center',
    paddingBottom: 40,
  },
  logo: {
    width:        500,
    height:       400,
    marginBottom: -120,
  },
  title: {
    fontSize:   30,
    fontWeight: '800',
    lineHeight: 36,
    textAlign:  'center',
  },
  tagline: {
    fontSize:   13,
    marginTop:  12,
    textAlign:  'center',
    lineHeight: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    position:      'absolute',
    bottom:        60,
    gap:           8,
  },
  dot: {
    width:        8,
    height:       8,
    borderRadius: 4,
  },
});

export default SplashScreen;