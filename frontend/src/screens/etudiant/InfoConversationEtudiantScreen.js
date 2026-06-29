import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, semantic } from '../../components/theme';
import api from '../../services/api';

const InfoConversationEtudiantScreen = ({ navigation, route }) => {
  const c        = useTheme();
  const userId   = route.params?.userId;
  const userName = route.params?.userName || 'Utilisateur';

  const [medias,  setMedias]  = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get(`/messages-prives/${userId}`);
      const vocaux = (res.data || []).filter(m => m.type === 'vocal');
      setMedias(vocaux);
    } catch {
      setMedias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const bloquerUtilisateur = () => {
    Alert.alert(
      'Bloquer l\'utilisateur',
      `Voulez-vous bloquer ${userName} ? Vous ne pourrez plus échanger de messages.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Bloquer', style: 'destructive', onPress: () => Alert.alert('Bloqué', `${userName} a été bloqué.`) }
      ]
    );
  };

  const supprimerConversation = () => {
    Alert.alert(
      'Supprimer la conversation',
      'Cette action est irréversible. Tous les messages seront supprimés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/messages-prives/conversation/${userId}`);
              navigation.navigate('Messagerie');
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer la conversation.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>

      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>Informations</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.profileSection, { borderBottomColor: c.border }]}>
        <View style={[styles.avatar, { backgroundColor: c.card }]}>
          <Text style={[styles.avatarText, { color: c.primary }]}>{userName?.[0] || 'U'}</Text>
        </View>
        <Text style={[styles.userName, { color: c.text }]}>{userName}</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: c.subtext }]}>NOTES VOCALES PARTAGÉES</Text>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        {loading ? (
          <ActivityIndicator color={c.primary} style={{ padding: 20 }} />
        ) : medias.length === 0 ? (
          <View style={styles.emptyMedias}>
            <Ionicons name="mic-off-outline" size={32} color={c.subtext} />
            <Text style={[styles.emptyMediasText, { color: c.subtext }]}>Aucune note vocale échangée</Text>
          </View>
        ) : (
          medias.map((m, index) => (
            <View
              key={m.id}
              style={[styles.mediaRow, index < medias.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }]}
            >
              <Ionicons name="mic-outline" size={18} color={c.primary} />
              <Text style={[styles.mediaText, { color: c.text }]}>Note vocale · {m.duree}s</Text>
              <Text style={[styles.mediaDate, { color: c.subtext }]}>
                {new Date(m.created_at).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          ))
        )}
      </View>

      <Text style={[styles.sectionTitle, { color: c.subtext }]}>ACTIONS</Text>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <TouchableOpacity style={[styles.actionRow, { borderBottomColor: c.border }]} onPress={bloquerUtilisateur}>
          <View style={[styles.actionIcon, { backgroundColor: c.card }]}>
            <Ionicons name="ban-outline" size={18} color={semantic.warning} />
          </View>
          <Text style={[styles.actionLabel, { color: semantic.warning }]}>Bloquer cet utilisateur</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow} onPress={supprimerConversation}>
          <View style={[styles.actionIcon, { backgroundColor: c.card }]}>
            <Ionicons name="trash-outline" size={18} color={semantic.error} />
          </View>
          <Text style={[styles.actionLabel, { color: semantic.error }]}>Supprimer la conversation</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container:       { flex: 1 },
  content:         { paddingBottom: 40 },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, borderBottomWidth: 1 },
  headerTitle:     { fontSize: 17, fontWeight: '800' },
  profileSection:  { alignItems: 'center', padding: 30, gap: 12, borderBottomWidth: 1 },
  avatar:          { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  avatarText:      { fontSize: 28, fontWeight: '800' },
  userName:        { fontSize: 18, fontWeight: '700' },
  sectionTitle:    { fontSize: 12, fontWeight: '700', marginHorizontal: 16, marginTop: 24, marginBottom: 10, letterSpacing: 0.5 },
  card:            { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  emptyMedias:     { alignItems: 'center', padding: 24, gap: 10 },
  emptyMediasText: { fontSize: 13 },
  mediaRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  mediaText:       { flex: 1, fontSize: 13 },
  mediaDate:       { fontSize: 11 },
  actionRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1 },
  actionIcon:      { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionLabel:     { fontSize: 14, fontWeight: '600' },
});

export default InfoConversationEtudiantScreen;