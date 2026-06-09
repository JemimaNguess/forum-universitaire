import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton, Badge, Card, TeacherScreen, teacherColors } from './TeacherUi';
import { useTheme } from '../../components/theme';

const stats = [
  { label: 'Ressources', value: '12', icon: 'library-outline' },
  { label: 'Sujets suivis', value: '08', icon: 'chatbubbles-outline' },
  { label: 'Signalements', value: '03', icon: 'flag-outline' },
  { label: 'Annonces', value: '05', icon: 'megaphone-outline' },
];

const today = [
  { title: 'Arbres binaires', meta: 'Programmation · 24 réponses', state: 'Épinglé' },
  { title: 'Devoir noté - Algorithmes', meta: 'Algorithmique · échéance vendredi', state: 'Actif' },
  { title: 'Support de cours SQL', meta: 'Base de données · PDF publié', state: 'Nouveau' },
];

const AccueilEnseignantScreen = ({ navigation }) => {
  const theme = useTheme();

  return (
    <TeacherScreen title="Bonjour, Mr Irie" subtitle="Espace enseignant UIYA">
      <Card style={[local.hero, { backgroundColor: theme.primary }] }>
        <View style={local.heroText}>
          <Badge label="Semestre 2" />
          <Text style={local.heroTitle}>Pilotez vos cours et vos échanges depuis un seul espace.</Text>
          <Text style={local.heroSub}>Ressources, modération et annonces pédagogiques.</Text>
        </View>
        <View style={[local.heroIcon, { backgroundColor: theme.white + '18' }]}>
          <Ionicons name="school" size={34} color={teacherColors.white} />
        </View>
      </Card>

      <View style={local.statsGrid}>
        {stats.map((item) => (
          <Card key={item.label} style={local.statCard}>
            <Ionicons name={item.icon} size={20} color={theme.primary} />
            <Text style={[local.statValue, { color: theme.text }]}>{item.value}</Text>
            <Text style={[local.statLabel, { color: theme.subtext }]}>{item.label}</Text>
          </Card>
        ))}
      </View>

      <View style={local.sectionHead}>
        <Text style={[local.sectionTitle, { color: theme.text }]}>Priorités du jour</Text>
        <Text style={[local.sectionLink, { color: theme.primary }]}>Voir tout</Text>
      </View>

      {today.map((item) => (
        <Card key={item.title} style={local.rowCard}>
          <View style={[local.rowIcon, { backgroundColor: theme.primary + '18' }]}>
            <Ionicons name="document-text-outline" size={20} color={theme.primary} />
          </View>
          <View style={local.rowInfo}>
            <Text style={[local.rowTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[local.rowMeta, { color: theme.subtext }]}>{item.meta}</Text>
          </View>
          <Badge label={item.state} tone={item.state === 'Actif' ? 'green' : 'violet'} />
        </Card>
      ))}

      <View style={local.quickActions}>
        <ActionButton
          label="Publier une ressource"
          icon="cloud-upload-outline"
          onPress={() => navigation.navigate('Ressources')}
        />
        <ActionButton
          label="Créer une annonce"
          icon="megaphone-outline"
          variant="light"
          onPress={() => navigation.navigate('Notifs')}
        />
      </View>
    </TeacherScreen>
  );
};

const local = StyleSheet.create({
  hero: {
    backgroundColor: teacherColors.violet,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroText: {
    flex: 1,
    gap: 8,
  },
  heroTitle: {
    color: teacherColors.white,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '900',
  },
  heroSub: {
    color: '#E7DEFF',
    lineHeight: 20,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48.5%',
    gap: 8,
  },
  statValue: {
    color: teacherColors.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    color: teacherColors.muted,
    fontSize: 12,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  sectionTitle: {
    color: teacherColors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  sectionLink: {
    color: teacherColors.violet,
    fontWeight: '800',
    fontSize: 12,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: teacherColors.violetSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    color: teacherColors.ink,
    fontWeight: '800',
  },
  rowMeta: {
    color: teacherColors.muted,
    marginTop: 3,
    fontSize: 12,
  },
  quickActions: {
    gap: 10,
  },
});

export default AccueilEnseignantScreen;
