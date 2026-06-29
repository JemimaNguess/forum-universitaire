import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../components/theme';

const ParametresScreen = () => {
  const c = useTheme();

  const [notifPush,        setNotifPush]        = useState(true);
  const [emailsAdmin,       setEmailsAdmin]      = useState(true);
  const [sons,               setSons]             = useState(true);
  const [autoriserInscr,    setAutoriserInscr]   = useState(true);
  const [validationAutoEns, setValidationAutoEns]= useState(false);

  const SettingRow = ({ icon, label, value, onValueChange, description }) => (
    <View style={[styles.settingRow, { borderBottomColor: c.border }]}>
      <View style={[styles.settingIcon, { backgroundColor: c.card }]}>
        <Ionicons name={icon} size={18} color={c.primary} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: c.text }]}>{label}</Text>
        {description && (
          <Text style={[styles.settingDesc, { color: c.subtext }]}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: c.border, true: c.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
    >

      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.headerTitle, { color: c.text }]}>Paramètres</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: c.subtext }]}>NOTIFICATIONS</Text>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <SettingRow icon="notifications-outline" label="Notifications push" value={notifPush} onValueChange={setNotifPush} />
        <SettingRow icon="mail-outline" label="Emails administratifs" value={emailsAdmin} onValueChange={setEmailsAdmin} />
        <SettingRow icon="volume-high-outline" label="Sons et vibrations" value={sons} onValueChange={setSons} />
      </View>

      <Text style={[styles.sectionTitle, { color: c.subtext }]}>GESTION DU FORUM</Text>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <SettingRow
          icon="person-add-outline"
          label="Autoriser les inscriptions"
          description="Permet aux nouveaux étudiants de s'inscrire"
          value={autoriserInscr}
          onValueChange={setAutoriserInscr}
        />
        <SettingRow
          icon="checkmark-done-outline"
          label="Validation automatique enseignants"
          description="Désactivé : validation manuelle requise"
          value={validationAutoEns}
          onValueChange={(v) => {
            if (v) {
              Alert.alert(
                'Attention',
                'Activer cette option validera automatiquement tous les nouveaux comptes enseignants sans vérification manuelle.',
                [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Activer', onPress: () => setValidationAutoEns(true) }
                ]
              );
            } else {
              setValidationAutoEns(false);
            }
          }}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: c.subtext }]}>SYSTÈME</Text>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <TouchableOpacity
          style={[styles.actionRow, { borderBottomColor: c.border }]}
          onPress={() => Alert.alert('Cache vidé', 'Le cache de l\'application a été réinitialisé.')}
        >
          <View style={[styles.settingIcon, { backgroundColor: c.card }]}>
            <Ionicons name="trash-outline" size={18} color={c.primary} />
          </View>
          <Text style={[styles.actionLabel, { color: c.text }]}>Réinitialiser le cache</Text>
          <Ionicons name="chevron-forward" size={16} color={c.subtext} />
        </TouchableOpacity>
        <View style={styles.versionRow}>
          <Text style={[styles.versionText, { color: c.subtext }]}>Version 1.0.0</Text>
        </View>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1 },
  content:      { paddingBottom: 40 },
  header:       { padding: 20, paddingTop: 50, borderBottomWidth: 1 },
  headerTitle:  { fontSize: 22, fontWeight: '800' },
  sectionTitle: { fontSize: 12, fontWeight: '700', marginHorizontal: 16, marginTop: 24, marginBottom: 10, letterSpacing: 0.5 },
  card:         { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  settingRow:   { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: 1 },
  settingIcon:  { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingInfo:  { flex: 1 },
  settingLabel: { fontSize: 14, fontWeight: '600' },
  settingDesc:  { fontSize: 11, marginTop: 2 },
  actionRow:    { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: 1 },
  actionLabel:  { flex: 1, fontSize: 14, fontWeight: '600' },
  versionRow:   { padding: 14, alignItems: 'center' },
  versionText:  { fontSize: 12 },
});

export default ParametresScreen;