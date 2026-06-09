import React from 'react';
import { Alert, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton, Badge, Card, TeacherScreen, teacherColors } from './TeacherUi';
import { useTheme } from '../../components/theme';

const annonces = [
  { title: 'Séminaire sur IA', date: '12/06/2026', type: 'Événement', icon: 'calendar-outline' },
  { title: 'Devoir de classe reporté', date: '15/06/2026', type: 'Urgent', icon: 'alert-circle-outline' },
  { title: 'Nouveau support de cours', date: '18/06/2026', type: 'Pédagogique', icon: 'book-outline' },
];

const AnnoncesEnseignantScreen = () => {
  const theme = useTheme();

  return (
    <TeacherScreen title="Annonces" subtitle="Notifications et annonces pédagogiques" rightIcon="notifications-outline">
      <Card style={local.composeCard}>
        <Ionicons name="megaphone" size={32} color={theme.primary} />
        <Text style={[local.composeTitle, { color: theme.text }]}>Informer rapidement vos étudiants</Text>
        <Text style={[local.composeText, { color: theme.subtext }]}>Préparez une annonce pédagogique, urgente ou événementielle.</Text>
        <ActionButton
        label="Créer une annonce"
        icon="add-circle-outline"
        onPress={() => Alert.alert('Annonce', 'Le formulaire de création sera branché ici.')}
      />
    </Card>

    {annonces.map((item) => (
      <Card key={item.title} style={local.announceCard}>
        <Ionicons name={item.icon} size={22} color={theme.primary} />
        <Text style={[local.announceTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[local.announceDate, { color: theme.subtext }]}>{item.date}</Text>
        <Badge label={item.type} tone={item.type === 'Urgent' ? 'red' : 'violet'} />
      </Card>
    ))}
  </TeacherScreen>
  );
};

const local = StyleSheet.create({
  composeCard: {
    alignItems: 'center',
    gap: 10,
  },
  composeTitle: {
    color: teacherColors.ink,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  composeText: {
    color: teacherColors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  announceCard: {
    gap: 8,
  },
  announceTitle: {
    color: teacherColors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  announceDate: {
    color: teacherColors.muted,
  },
});

export default AnnoncesEnseignantScreen;
