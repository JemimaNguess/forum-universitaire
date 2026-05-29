import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Image
} from 'react-native';
import { useTheme } from '../../components/theme';

const { width, height } = Dimensions.get('window');

const AccueilScreen = ({ navigation }) => {
  const c = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>

      {/* Cercles décoratifs */}
      <View style={[styles.circleTop, { backgroundColor: c.card, opacity: 0.6 }]} />
      <View style={[styles.circleBottom, { backgroundColor: c.card, opacity: 0.4 }]} />

      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      {/* Texte */}
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: c.text }]}>
          Bienvenue sur le{'\n'}Forum Universitaire
        </Text>
        <Text style={[styles.subtitle, { color: c.subtext }]}>
          Échangez, partagez et apprenez{'\n'}ensemble.
        </Text>
      </View>

      {/* Boutons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.btnPrimary, { backgroundColor: c.primary }]}
          onPress={() => navigation.navigate('ChoixRole')}
        >
          <Text style={styles.btnPrimaryText}>S'inscrire</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnSecondary, { borderColor: c.border, backgroundColor: c.card }]}
          onPress={() => navigation.navigate('Connexion')}
        >
          <Text style={[styles.btnSecondaryText, { color: c.primary }]}>Se connecter</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  circleTop: {
    position:     'absolute',
    top:          -120,
    left:         -120,
    width:        350,
    height:       350,
    borderRadius: 175,
  },
  circleBottom: {
    position:     'absolute',
    bottom:       -100,
    right:        -100,
    width:        280,
    height:       280,
    borderRadius: 140,
  },
  illustrationContainer: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  illustration: {
    width:  width * 0.7,
    height: width * 0.7,
  },
  textContainer: {
    alignItems:   'center',
    marginBottom: 40,
  },
  title: {
    fontSize:    26,
    fontWeight:  '800',
    textAlign:   'center',
    lineHeight:  34,
    marginBottom: 12,
  },
  subtitle: {
    fontSize:  14,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonsContainer: {
    width: '100%',
    gap:   12,
  },
  btnPrimary: {
    paddingVertical: 16,
    borderRadius:    12,
    alignItems:      'center',
  },
  btnPrimaryText: {
    color:      '#FFFFFF',
    fontSize:   16,
    fontWeight: '700',
  },
  btnSecondary: {
    paddingVertical: 15,
    borderRadius:    12,
    alignItems:      'center',
    borderWidth:     1.5,
  },
  btnSecondaryText: {
    fontSize:   16,
    fontWeight: '600',
  },
});

export default AccueilScreen;