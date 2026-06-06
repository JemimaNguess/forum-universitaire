import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity
} from 'react-native';
import { useTheme } from '../../components/theme';
import { Ionicons } from '@expo/vector-icons'; 

const ChoixRoleScreen = ({ navigation }) => {
  const c = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>

      {/* Flèche retour */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backText, { color: c.text }]}>←</Text>
      </TouchableOpacity>

      {/* Titre */}
      <Text style={[styles.title, { color: c.text }]}>Vous êtes...</Text>
      <Text style={[styles.subtitle, { color: c.subtext }]}>
        Choisissez votre profil pour continuer l'inscription.
      </Text>

      {/* Cards rôles */}
      <View style={styles.cardsContainer}>

        {/* Étudiant */}
        <TouchableOpacity
          style={[styles.roleCard, { backgroundColor: c.surface, borderColor: c.border }]}
          onPress={() => navigation.navigate('InscriptionEtudiant')}
        >
          <View style={[styles.roleIconContainer, { backgroundColor: c.card }]}>
            <Ionicons name="school-outline" size={26} color={c.primary}/>
          </View>
          <View style={styles.roleInfo}>
            <Text style={[styles.roleTitle, { color: c.text }]}>Étudiant</Text>
            <Text style={[styles.roleDesc, { color: c.subtext }]}>Je suis étudiant</Text>
          </View>
          <Text style={[styles.roleArrow, { color: c.primary }]}>→</Text>
        </TouchableOpacity>

        {/* Enseignant */}
        <TouchableOpacity
          style={[styles.roleCard, { backgroundColor: c.surface, borderColor: c.border }]}
          onPress={() => navigation.navigate('InscriptionEnseignant')}
        >
          <View style={[styles.roleIconContainer, { backgroundColor: c.card }]}>
            <Ionicons name="person-outline" size={26} color={c.primary}/>
          </View>
          <View style={styles.roleInfo}>
            <Text style={[styles.roleTitle, { color: c.text }]}>Enseignant</Text>
            <Text style={[styles.roleDesc, { color: c.subtext }]}>Je suis enseignant</Text>
          </View>
          <Text style={[styles.roleArrow, { color: c.primary }]}>→</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:              1,
    paddingHorizontal: 24,
    paddingTop:        60,
  },
  backBtn: {
    marginBottom: 32,
  },
  backText: {
    fontSize: 24,
  },
  title: {
    fontSize:    28,
    fontWeight:  '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize:     14,
    lineHeight:   22,
    marginBottom: 40,
  },
  cardsContainer: {
    gap: 16,
  },
  roleCard: {
    flexDirection:  'row',
    alignItems:     'center',
    padding:        20,
    borderRadius:   16,
    borderWidth:    1.5,
    gap:            16,
  },
  roleIconContainer: {
    width:          56,
    height:         56,
    borderRadius:   14,
    alignItems:     'center',
    justifyContent: 'center',
  },
  roleIcon: {
    fontSize: 26,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize:    17,
    fontWeight:  '700',
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 13,
  },
  roleArrow: {
    fontSize:   20,
    fontWeight: '700',
  },
});

export default ChoixRoleScreen;