import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton, Card, TeacherScreen, teacherColors } from './TeacherUi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../components/theme';

const infos = [
  ['Email', 'm.irie@uiya.edu.ci'],
  ['Département', 'Informatique'],
  ['Matières', 'Architecture des ordinateurs, Système d\'exploitation,devops'],
  ['Statut', 'Compte enseignant validé'],
];

const ProfilEnseignantScreen = () => {
  const { logout } = useAuth();
  const theme = useTheme();
  const scheme = useColorScheme();
  const mode = scheme === 'dark' ? 'dark' : 'light';

  return (
    <TeacherScreen title="Profil" subtitle="Compte et préférences" rightIcon="settings-outline">
      <Card style={[local.profileCard, { backgroundColor: theme.card }] }>
        <View style={local.avatar}>
          <Text style={local.avatarText}>MI</Text>
        </View>
        <Text style={[local.name, { color: theme.text }]}>Mr Irie</Text>
        <Text style={[local.role, { color: theme.subtext }]}>Enseignant · UIYA</Text>
        <View style={[local.scoreBox, { backgroundColor: theme.surface }] }>
          <Ionicons name="star" size={18} color={theme.primary} />
          <Text style={[local.scoreText, { color: theme.text }]}>Réputation 4.8 · Badge Expert</Text>
        </View>
      </Card>

      <Card style={local.infoCard}>
        {infos.map(([label, value]) => (
          <View key={label} style={local.infoRow}>
            <Text style={[local.infoLabel, { color: theme.subtext }]}>{label}</Text>
            <Text style={[local.infoValue, { color: theme.text }]}>{value}</Text>
          </View>
        ))}
      </Card>

      <View style={[local.themeRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View>
          <Text style={[local.infoLabel, { color: theme.text }]}>Mode sombre</Text>
          <Text style={[local.infoValue, { color: theme.subtext }]}>{mode === 'dark' ? 'Activé' : 'Désactivé'}</Text>
        </View>
        <Switch
          value={mode === 'dark'}
          onValueChange={() => {}}
          disabled={true}
          trackColor={{ false: '#A1A1AA', true: theme.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      <ActionButton label="Modifier le profil" icon="create-outline" />
      <TouchableOpacity style={[local.logoutBtn, { backgroundColor: '#FDECEC' }]} onPress={logout}>
        <Ionicons name="log-out-outline" size={18} color={teacherColors.danger} />
        <Text style={local.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </TeacherScreen>
  );
};

const local = StyleSheet.create({
  profileCard: {
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 26,
    backgroundColor: teacherColors.violet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: teacherColors.white,
    fontSize: 24,
    fontWeight: '900',
  },
  name: {
    color: teacherColors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  role: {
    color: teacherColors.muted,
  },
  scoreBox: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFF4DE',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreText: {
    color: '#9A640B',
    fontWeight: '800',
    fontSize: 12,
  },
  infoCard: {
    gap: 14,
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    color: teacherColors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  infoValue: {
    color: teacherColors.ink,
    fontWeight: '800',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: teacherColors.line,
    marginTop: 10,
  },
  logoutBtn: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: '#FDECEC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    color: teacherColors.danger,
    fontWeight: '900',
  },
});

export default ProfilEnseignantScreen;
