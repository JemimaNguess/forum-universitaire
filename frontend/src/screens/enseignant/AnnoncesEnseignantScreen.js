import React, { useEffect, useState } from 'react';
import { Alert, Text, StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton, Badge, Card, TeacherScreen, teacherColors } from './TeacherUi';
import { useTheme } from '../../components/theme';
import api from '../../services/api';

const AnnoncesEnseignantScreen = () => {
  const theme = useTheme();
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [type, setType] = useState('pedagogique');
  const [creating, setCreating] = useState(false);

  const loadAnnonces = async () => {
    setLoading(true);
    try {
      const response = await api.get('/annonces');
      setAnnonces(response.data || []);
    } catch (error) {
      console.error('Erreur chargement annonces :', error);
      Alert.alert('Erreur', 'Impossible de récupérer les annonces.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnonces();
  }, []);

  const handleDeleteAnnonce = async (id) => {
    try {
      await api.delete(`/annonces/${id}`);
      setAnnonces((prev) => prev.filter((annonce) => annonce.id !== id));
    } catch (error) {
      console.error('Erreur suppression annonce :', error);
      Alert.alert('Erreur', 'Impossible de supprimer cette annonce.');
    }
  };

  const handleCreateAnnonce = async () => {
    if (!titre.trim() || !contenu.trim()) {
      return Alert.alert('Informations manquantes', 'Remplissez le titre et le contenu.');
    }

    setCreating(true);
    try {
      const response = await api.post('/annonces', {
        titre: titre.trim(),
        contenu: contenu.trim(),
        type,
      });
      setAnnonces((prev) => [response.data, ...prev]);
      setTitre('');
      setContenu('');
      setType('pedagogique');
      setShowForm(false);
      Alert.alert('Succès', 'Annonce créée avec succès.');
    } catch (error) {
      console.error('Erreur création annonce :', error);
      Alert.alert('Erreur', 'Impossible de créer cette annonce.');
    } finally {
      setCreating(false);
    }
  };

  const getTone = (type) => {
    if (type === 'urgente') return 'red';
    if (type === 'evenement') return 'orange';
    return 'violet';
  };

  return (
    <TeacherScreen title="Annonces" subtitle="Notifications et annonces pédagogiques" rightIcon="notifications-outline">
      <Card style={local.composeCard}>
        <Ionicons name="megaphone" size={32} color={theme.primary} />
        <Text style={[local.composeTitle, { color: theme.text }]}>Informer rapidement vos étudiants</Text>
        <Text style={[local.composeText, { color: theme.subtext }]}>Préparez une annonce pédagogique, urgente ou événementielle.</Text>
        <ActionButton
          label={showForm ? 'Fermer le formulaire' : 'Créer une annonce'}
          icon="add-circle-outline"
          onPress={() => setShowForm(!showForm)}
        />
        {showForm ? (
          <View style={local.formContainer}>
            <TextInput
              value={titre}
              onChangeText={setTitre}
              placeholder="Titre de l'annonce"
              placeholderTextColor={theme.subtext}
              style={[local.input, { color: theme.text, borderColor: theme.border }]}
            />
            <TextInput
              value={contenu}
              onChangeText={setContenu}
              placeholder="Contenu de l'annonce"
              placeholderTextColor={theme.subtext}
              multiline
              numberOfLines={4}
              style={[local.textArea, { color: theme.text, borderColor: theme.border }]}
            />
            <View style={local.typeRow}>
              {['pedagogique', 'urgente', 'evenement'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    local.typePill,
                    { borderColor: theme.border, backgroundColor: theme.card },
                    type === option && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => setType(option)}
                >
                  <Text style={[local.typeText, type === option && { color: theme.white }]}>
                    {option === 'pedagogique' ? 'Pédagogique' : option === 'urgente' ? 'Urgente' : 'Événement'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <ActionButton
              label={creating ? 'Création...' : 'Publier l’annonce'}
              icon="send-outline"
              onPress={handleCreateAnnonce}
              disabled={creating}
            />
          </View>
        ) : null}
      </Card>

      {annonces.length === 0 && !loading ? (
        <Text style={[local.emptyText, { color: theme.subtext }]}>Aucune annonce trouvée.</Text>
      ) : null}

      {annonces.map((item) => (
        <Card key={item.id} style={local.announceCard}>
          <Ionicons name="megaphone-outline" size={22} color={theme.primary} />
          <Text style={[local.announceTitle, { color: theme.text }]}>{item.titre || item.title}</Text>
          <Text style={[local.announceDate, { color: theme.subtext }]}>{item.expire_at || item.created_at || 'Date inconnue'}</Text>
          <Badge label={item.type || 'Info'} tone={getTone(item.type)} />
          <ActionButton
            label="Supprimer"
            icon="trash-outline"
            variant="danger"
            onPress={() => handleDeleteAnnonce(item.id)}
          />
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
  formContainer: {
    width: '100%',
    gap: 12,
    marginTop: 12,
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  textArea: {
    minHeight: 98,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
    backgroundColor: 'transparent',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '800',
    color: teacherColors.muted,
  },
  emptyText: {
    marginTop: 20,
    textAlign: 'center',
  },
});

export default AnnoncesEnseignantScreen;
