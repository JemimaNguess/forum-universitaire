import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton, Badge, Card, TeacherScreen, teacherColors } from './TeacherUi';
import { useTheme } from '../../components/theme';
import api from '../../services/api';

const ModerationEnseignantScreen = () => {
  const theme = useTheme();
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSignalements = async () => {
    setLoading(true);
    try {
      const response = await api.get('/signalements');
      setSignalements(response.data || []);
    } catch (error) {
      console.error('Erreur chargement signalements :', error);
      Alert.alert('Erreur', 'Impossible de récupérer les signalements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignalements();
  }, []);

  const handleTraiter = async (id, action) => {
    try {
      await api.patch(`/signalements/${id}/traiter`, { action });
      await loadSignalements();
      Alert.alert('Succès', action === 'supprimer' ? 'Le message a été supprimé.' : 'Le signalement a été ignoré.');
    } catch (error) {
      console.error('Erreur traitement signalement :', error);
      Alert.alert('Erreur', 'Impossible de traiter ce signalement.');
    }
  };

  return (
    <TeacherScreen
      title="Modération"
      subtitle="Sujets, réponses et signalements"
      rightIcon="shield-checkmark-outline"
      onRightPress={loadSignalements}
    >
      {signalements.slice(0, 3).map((signalement) => (
        <Card key={signalement.id} style={local.topicCard}>
          <View style={local.topicTop}>
            <View style={[local.topicIcon, { backgroundColor: theme.primary + '18' }]}>
              <Ionicons name="chatbox-ellipses-outline" size={20} color={theme.primary} />
            </View>
            <View style={local.topicInfo}>
              <Text style={[local.topicTitle, { color: theme.text }]}>
                {signalement.message?.sujet?.titre || signalement.message?.contenu?.slice(0, 40) || 'Signalement'}
              </Text>
              <Text style={[local.topicMeta, { color: theme.subtext }]}> 
                {signalement.auteur?.prenom || 'Utilisateur'} • {signalement.message?.sujet?.categorie?.nom || 'Sans catégorie'}
              </Text>
            </View>
            <Badge
              label={signalement.statut || 'en_attente'}
              tone={signalement.statut === 'traite' ? 'green' : signalement.statut === 'en_attente' ? 'orange' : 'violet'}
            />
          </View>
          <View style={local.actions}>
            <ActionButton
              label="Ignorer"
              icon="close-outline"
              variant="light"
              onPress={() => handleTraiter(signalement.id, 'ignorer')}
            />
            <ActionButton
              label="Supprimer"
              icon="trash-outline"
              variant="danger"
              onPress={() => handleTraiter(signalement.id, 'supprimer')}
            />
          </View>
        </Card>
      ))}

      <Text style={[local.sectionTitle, { color: theme.text, marginTop: 10 }]}>Signalements récents</Text>
      {signalements.map((signalement) => (
        <Card key={signalement.id} style={local.reportCard}>
          <View style={local.reportLeft}>
            <Ionicons name="flag-outline" size={20} color={teacherColors.danger} />
            <View>
              <Text style={[local.reportTitle, { color: theme.text }]}>{signalement.raison}</Text>
              <Text style={[local.reportMeta, { color: theme.subtext }]}>
                {signalement.auteur?.prenom || 'Utilisateur'} · {signalement.message?.sujet?.titre || 'Sujet inconnu'}
              </Text>
            </View>
          </View>
          <Badge label={signalement.statut || 'en_attente'} tone={signalement.statut === 'traite' ? 'green' : 'orange'} />
        </Card>
      ))}
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
