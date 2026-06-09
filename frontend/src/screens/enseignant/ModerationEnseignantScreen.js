import React from 'react';
import { Alert, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton, Badge, Card, TeacherScreen, teacherColors } from './TeacherUi';
import { useTheme } from '../../components/theme';

const topics = [
  { title: "Besoin d'aide sur les arbres binaires", author: 'Marie L.', replies: 24, status: 'Épinglé' },
  { title: 'Correction exercice récursivité', author: 'Kevin R.', replies: 11, status: 'Ouvert' },
  { title: 'Débat hors sujet en programmation', author: 'Arthur D.', replies: 8, status: 'Signalé' },
];

const reports = [
  { reason: 'Contenu inapproprié', user: 'Signalé par Awa K.', level: 'Urgent' },
  { reason: 'Message répétitif', user: 'Signalé par Lucie B.', level: 'Normal' },
];

const ModerationEnseignantScreen = () => {
  const theme = useTheme();

  return (
    <TeacherScreen title="Modération" subtitle="Sujets, réponses et signalements" rightIcon="shield-checkmark-outline">
    {topics.map((topic) => (
      <Card key={topic.title} style={local.topicCard}>
        <View style={local.topicTop}>
          <View style={[local.topicIcon, { backgroundColor: theme.primary + '18' }]}>
            <Ionicons name="chatbox-ellipses-outline" size={20} color={theme.primary} />
          </View>
          <View style={local.topicInfo}>
            <Text style={[local.topicTitle, { color: theme.text }]}>{topic.title}</Text>
            <Text style={[local.topicMeta, { color: theme.subtext }]}>{topic.author} · {topic.replies} réponses</Text>
          </View>
          <Badge
            label={topic.status}
            tone={topic.status === 'Signalé' ? 'red' : topic.status === 'Ouvert' ? 'green' : 'violet'}
          />
        </View>
        <View style={local.actions}>
          <ActionButton
            label="Épingler"
            icon="pin-outline"
            variant="light"
            onPress={() => Alert.alert('Sujet épinglé', topic.title)}
          />
          <ActionButton
            label="Fermer"
            icon="lock-closed-outline"
            onPress={() => Alert.alert('Sujet fermé', topic.title)}
          />
        </View>
      </Card>
    ))}

    <Text style={[local.sectionTitle, { color: theme.text }]}>Signalements récents</Text>
    {reports.map((report) => (
      <Card key={report.reason} style={local.reportCard}>
        <View style={local.reportLeft}>
          <Ionicons name="flag-outline" size={20} color={teacherColors.danger} />
          <View>
            <Text style={[local.reportTitle, { color: theme.text }]}>{report.reason}</Text>
            <Text style={[local.reportMeta, { color: theme.subtext }]}>{report.user}</Text>
          </View>
        </View>
        <Badge label={report.level} tone={report.level === 'Urgent' ? 'red' : 'orange'} />
      </Card>
    ))}

    <ActionButton
      label="Supprimer le message sélectionné"
      icon="trash-outline"
      variant="danger"
      onPress={() => Alert.alert('Suppression', 'Action simulée en frontend uniquement.')}
    />
  </TeacherScreen>
  );
};

const local = StyleSheet.create({
  topicCard: {
    gap: 14,
  },
  topicTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topicIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: teacherColors.violetSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    color: teacherColors.ink,
    fontWeight: '900',
  },
  topicMeta: {
    color: teacherColors.muted,
    marginTop: 4,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  sectionTitle: {
    color: teacherColors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  reportLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reportTitle: {
    color: teacherColors.ink,
    fontWeight: '800',
  },
  reportMeta: {
    color: teacherColors.muted,
    marginTop: 3,
    fontSize: 12,
  },
});

export default ModerationEnseignantScreen;
