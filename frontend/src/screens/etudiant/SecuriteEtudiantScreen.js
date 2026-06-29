import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, semantic } from '../../components/theme';
import { useAuth } from '../../context/AuthContext';

const SecuriteEtudiantScreen = () => {
  const c = useTheme();
  const { logout } = useAuth();

  const [deuxFA, setDeuxFA] = useState(false);

  const sessions = [
    { id: 1, appareil: 'iPhone 13', localisation: 'Abidjan, CI', actuel: true,  date: 'Maintenant' },
    { id: 2, appareil: 'Chrome - Windows', localisation: 'Abidjan, CI', actuel: false, date: 'Il y a 2 jours' },
  ];

  const deconnecterTout = () => {
    Alert.alert(
      'Déconnexion globale',
      'Cette action déconnectera tous vos appareils, y compris celui-ci. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnecter tout', style: 'destructive', onPress: logout }
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
    >

      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.headerTitle, { color: c.text }]}>Sécurité</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: c.subtext }]}>AUTHENTIFICATION</Text>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <View style={[styles.row, { borderBottomColor: c.border }]}>
          <View style={[styles.rowIcon, { backgroundColor: c.card }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color={c.primary} />
          </View>
          <View style={styles.rowInfo}>
            <Text style={[styles.rowLabel, { color: c.text }]}>Authentification à deux facteurs</Text>
            <Text style={[styles.rowDesc, { color: c.subtext }]}>Sécurité renforcée à la connexion</Text>
          </View>
          <Switch
            value={deuxFA}
            onValueChange={(v) => {
              setDeuxFA(v);
              if (v) Alert.alert('Bientôt disponible', 'Cette fonctionnalité arrive prochainement.');
            }}
            trackColor={{ false: c.border, true: c.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.row, { borderBottomColor: c.border }]}>
          <View style={[styles.rowIcon, { backgroundColor: c.card }]}>
            <Ionicons name="mail-outline" size={18} color={semantic.success} />
          </View>
          <View style={styles.rowInfo}>
            <Text style={[styles.rowLabel, { color: c.text }]}>Email vérifié</Text>
            <Text style={[styles.rowDesc, { color: c.subtext }]}>Votre email est confirmé</Text>
          </View>
          <Ionicons name="checkmark-circle" size={20} color={semantic.success} />
        </View>

        <View style={styles.row}>
          <View style={[styles.rowIcon, { backgroundColor: c.card }]}>
            <Ionicons name="call-outline" size={18} color={c.subtext} />
          </View>
          <View style={styles.rowInfo}>
            <Text style={[styles.rowLabel, { color: c.text }]}>Téléphone vérifié</Text>
            <Text style={[styles.rowDesc, { color: c.subtext }]}>Non configuré</Text>
          </View>
          <TouchableOpacity onPress={() => Alert.alert('Bientôt disponible', 'Cette fonctionnalité arrive prochainement.')}>
            <Text style={[styles.ajouterText, { color: c.primary }]}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: c.subtext }]}>SESSIONS ACTIVES</Text>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        {sessions.map((session, index) => (
          <View
            key={session.id}
            style={[
              styles.sessionRow,
              index < sessions.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }
            ]}
          >
            <View style={[styles.rowIcon, { backgroundColor: c.card }]}>
              <Ionicons
                name={session.appareil.includes('iPhone') ? 'phone-portrait-outline' : 'desktop-outline'}
                size={18}
                color={c.primary}
              />
            </View>
            <View style={styles.rowInfo}>
              <View style={styles.sessionTop}>
                <Text style={[styles.rowLabel, { color: c.text }]}>{session.appareil}</Text>
                {session.actuel && (
                  <View style={[styles.badgeActuel, { backgroundColor: semantic.successBg }]}>
                    <Text style={[styles.badgeActuelText, { color: semantic.success }]}>Actuel</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.rowDesc, { color: c.subtext }]}>
                {session.localisation} · {session.date}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.dangerBtn, { borderColor: semantic.error }]}
        onPress={deconnecterTout}
      >
        <Ionicons name="log-out-outline" size={18} color={semantic.error} />
        <Text style={[styles.dangerBtnText, { color: semantic.error }]}>
          Déconnecter tous les appareils
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1 },
  content:          { paddingBottom: 40 },
  header:           { padding: 20, paddingTop: 50, borderBottomWidth: 1 },
  headerTitle:      { fontSize: 22, fontWeight: '800' },
  sectionTitle:     { fontSize: 12, fontWeight: '700', marginHorizontal: 16, marginTop: 24, marginBottom: 10, letterSpacing: 0.5 },
  card:             { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  row:              { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: 1 },
  rowIcon:          { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowInfo:          { flex: 1 },
  rowLabel:         { fontSize: 14, fontWeight: '600' },
  rowDesc:          { fontSize: 11, marginTop: 2 },
  ajouterText:      { fontSize: 13, fontWeight: '700' },
  sessionRow:       { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  sessionTop:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badgeActuel:      { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeActuelText:  { fontSize: 10, fontWeight: '700' },
  dangerBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginTop: 24, padding: 14, borderRadius: 12, borderWidth: 1.5 },
  dangerBtnText:    { fontSize: 14, fontWeight: '700' },
});

export default SecuriteEtudiantScreen;