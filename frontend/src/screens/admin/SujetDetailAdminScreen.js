import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  RefreshControl, TextInput, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, semantic } from '../../components/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const SujetDetailAdminScreen = ({ navigation, route }) => {
  const c         = useTheme();
  const { user }  = useAuth();
  const sujetId   = route.params?.sujetId;

  const [sujet,      setSujet]      = useState(null);
  const [messages,   setMessages]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contenu,    setContenu]    = useState('');
  const [sending,    setSending]    = useState(false);
  const [moderating, setModerating] = useState(false);

  const load = async () => {
    try {
      const [sujetRes, messagesRes] = await Promise.all([
        api.get(`/sujets/${sujetId}`),
        api.get(`/sujets/${sujetId}/messages`),
      ]);
      setSujet(sujetRes.data);
      setMessages(Array.isArray(messagesRes.data) ? messagesRes.data : []);
    } catch {
      setSujet(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const envoyerMessage = async () => {
    if (!contenu.trim()) return;
    setSending(true);
    try {
      const res = await api.post(`/sujets/${sujetId}/messages`, { contenu });
      setMessages(curr => [...curr, res.data]);
      setContenu('');
    } catch {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message.');
    } finally {
      setSending(false);
    }
  };

  const voter = async (messageId, type) => {
    try {
      await api.post('/votes', { message_id: messageId, type });
      await load();
    } catch {
      Alert.alert('Erreur', 'Impossible de voter.');
    }
  };

  // Modération : admin peut supprimer n'importe quel message, pas seulement les siens
  const supprimerMessage = (messageId) => {
    Alert.alert('Supprimer', 'Supprimer ce message ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/messages/${messageId}`);
            setMessages(curr => curr.filter(m => m.id !== messageId));
          } catch {
            Alert.alert('Erreur', 'Impossible de supprimer.');
          }
        }
      }
    ]);
  };

  const signalerMessage = (messageId) => {
    Alert.alert('Signaler', 'Signaler ce message ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Signaler',
        onPress: async () => {
          try {
            await api.post('/signalements', {
              message_id: messageId,
              raison: 'Contenu signalé par un administrateur',
            });
            Alert.alert('Signalé', 'Le message a été signalé.');
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.message || 'Impossible de signaler.');
          }
        }
      }
    ]);
  };

  // Modération : épingler / désépingler le sujet
  const toggleEpingle = async () => {
    setModerating(true);
    try {
      const nouveauStatut = sujet.statut === 'epingle' ? 'ouvert' : 'epingle';
      const res = await api.put(`/sujets/${sujetId}/statut`, { statut: nouveauStatut });
      setSujet(res.data.sujet);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de modifier le statut du sujet.');
    } finally {
      setModerating(false);
    }
  };

  // Modération : fermer / rouvrir le sujet
  const toggleFerme = async () => {
    const ferme = sujet.statut === 'ferme';
    Alert.alert(
      ferme ? 'Rouvrir le sujet' : 'Fermer le sujet',
      ferme
        ? 'Les utilisateurs pourront à nouveau répondre.'
        : 'Les utilisateurs ne pourront plus répondre.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: ferme ? 'Rouvrir' : 'Fermer',
          style: ferme ? 'default' : 'destructive',
          onPress: async () => {
            setModerating(true);
            try {
              const nouveauStatut = ferme ? 'ouvert' : 'ferme';
              const res = await api.put(`/sujets/${sujetId}/statut`, { statut: nouveauStatut });
              setSujet(res.data.sujet);
            } catch (err) {
              console.log('Erreur ferme:', err.response?.status, JSON.stringify(err.response?.data));
              Alert.alert('Erreur', 'Impossible de modifier le statut du sujet.');
            } finally {
              setModerating(false);
            }
          }
        }
      ]
    );
  };

  const supprimerSujet = () => {
    Alert.alert('Supprimer le sujet', 'Cette action est irréversible. Supprimer ce sujet et toutes ses réponses ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/sujets/${sujetId}`);
            navigation.goBack();
          } catch {
            Alert.alert('Erreur', 'Impossible de supprimer le sujet.');
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (!sujet) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={[styles.errorText, { color: c.subtext }]}>Sujet introuvable</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >

      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: c.text }]} numberOfLines={1}>
            {sujet.titre}
          </Text>
          <Text style={[styles.headerSub, { color: c.subtext }]}>
            {messages.length} réponses
          </Text>
        </View>
        <TouchableOpacity onPress={supprimerSujet}>
          <Ionicons name="trash-outline" size={20} color={semantic.error} />
        </TouchableOpacity>
      </View>

      {/* Barre de modération admin */}
      <View style={[styles.modBar, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity
          style={[
            styles.modBtn,
            { backgroundColor: c.card },
            sujet.statut === 'epingle' && { backgroundColor: semantic.warningBg }
          ]}
          onPress={toggleEpingle}
          disabled={moderating}
        >
          <Ionicons
            name="pin"
            size={14}
            color={sujet.statut === 'epingle' ? semantic.warning : c.subtext}
          />
          <Text style={[
            styles.modBtnText,
            { color: sujet.statut === 'epingle' ? semantic.warning : c.subtext }
          ]}>
            {sujet.statut === 'epingle' ? 'Épinglé' : 'Épingler'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modBtn,
            { backgroundColor: c.card },
            sujet.statut === 'ferme' && { backgroundColor: semantic.errorBg }
          ]}
          onPress={toggleFerme}
          disabled={moderating}
        >
          <Ionicons
            name={sujet.statut === 'ferme' ? 'lock-closed' : 'lock-open-outline'}
            size={14}
            color={sujet.statut === 'ferme' ? semantic.error : c.subtext}
          />
          <Text style={[
            styles.modBtnText,
            { color: sujet.statut === 'ferme' ? semantic.error : c.subtext }
          ]}>
            {sujet.statut === 'ferme' ? 'Fermé' : 'Fermer'}
          </Text>
        </TouchableOpacity>

        {moderating && <ActivityIndicator size="small" color={c.primary} style={{ marginLeft: 4 }} />}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.primary} />
        }
      >

        {/* Sujet principal */}
        <View style={[styles.sujetCard, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.sujetHeader}>
            <View style={[styles.avatar, { backgroundColor: c.card }]}>
              <Text style={[styles.avatarText, { color: c.primary }]}>
                {sujet.user?.prenom?.[0] || 'U'}
              </Text>
            </View>
            <View style={styles.sujetMeta}>
              <Text style={[styles.sujetAuteur, { color: c.text }]}>
                {sujet.user?.prenom} {sujet.user?.nom}
              </Text>
              <Text style={[styles.sujetDate, { color: c.subtext }]}>
                {new Date(sujet.created_at).toLocaleDateString('fr-FR')}
              </Text>
            </View>
            <View style={[styles.categorieBadge, { backgroundColor: c.card }]}>
              <Text style={[styles.categorieText, { color: c.primary }]}>
                {sujet.categorie?.nom}
              </Text>
            </View>
          </View>

          <Text style={[styles.sujetTitre, { color: c.text }]}>{sujet.titre}</Text>
          <Text style={[styles.sujetContenu, { color: c.subtext }]}>{sujet.contenu}</Text>
        </View>

        {/* Messages */}
        <Text style={[styles.sectionTitle, { color: c.text }]}>
          {messages.length} réponse{messages.length > 1 ? 's' : ''}
        </Text>

        {messages.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="chatbubble-outline" size={40} color={c.subtext} />
            <Text style={[styles.emptyText, { color: c.subtext }]}>
              Aucune réponse pour le moment
            </Text>
          </View>
        ) : (
          messages.map(msg => (
            <View
              key={msg.id}
              style={[
                styles.messageCard,
                { backgroundColor: c.surface, borderColor: c.border },
                msg.user_id === user?.id && { borderColor: c.primary, borderWidth: 1.5 }
              ]}
            >
              <View style={styles.messageHeader}>
                <View style={[styles.msgAvatar, { backgroundColor: c.card }]}>
                  <Text style={[styles.msgAvatarText, { color: c.primary }]}>
                    {msg.user?.prenom?.[0] || 'U'}
                  </Text>
                </View>
                <View style={styles.msgMeta}>
                  <Text style={[styles.msgAuteur, { color: c.text }]}>
                    {msg.user?.prenom} {msg.user?.nom}
                    {msg.user_id === user?.id && (
                      <Text style={[styles.moiLabel, { color: c.primary }]}> (moi)</Text>
                    )}
                  </Text>
                  <Text style={[styles.msgDate, { color: c.subtext }]}>
                    {new Date(msg.created_at).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                {/* Admin : modération sur tout message + signalement */}
                <View style={styles.msgActions}>
                  <TouchableOpacity onPress={() => signalerMessage(msg.id)} style={{ marginRight: 12 }}>
                    <Ionicons name="flag-outline" size={16} color={c.subtext} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => supprimerMessage(msg.id)}>
                    <Ionicons name="trash-outline" size={16} color={semantic.error} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={[styles.msgContenu, { color: c.text }]}>{msg.contenu}</Text>

              {/* Votes */}
              <View style={styles.votesRow}>
                <TouchableOpacity
                  style={[styles.voteBtn, { backgroundColor: c.card }]}
                  onPress={() => voter(msg.id, 'like')}
                >
                  <Ionicons name="thumbs-up-outline" size={14} color={semantic.success} />
                  <Text style={[styles.voteCount, { color: semantic.success }]}>
                    {msg.likes || 0}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.voteBtn, { backgroundColor: c.card }]}
                  onPress={() => voter(msg.id, 'dislike')}
                >
                  <Ionicons name="thumbs-down-outline" size={14} color={semantic.error} />
                  <Text style={[styles.voteCount, { color: semantic.error }]}>
                    {msg.dislikes || 0}
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          ))
        )}

      </ScrollView>

      {/* Zone de saisie */}
      {sujet.statut !== 'ferme' && (
        <View style={[styles.inputZone, { backgroundColor: c.surface, borderTopColor: c.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
            placeholder="Écrire une réponse..."
            placeholderTextColor={c.subtext}
            value={contenu}
            onChangeText={setContenu}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: contenu.trim() ? c.primary : c.card }]}
            onPress={envoyerMessage}
            disabled={!contenu.trim() || sending}
          >
            {sending
              ? <ActivityIndicator color="#fff" size="small" />
              : <Ionicons name="send" size={18} color={contenu.trim() ? '#fff' : c.subtext} />
            }
          </TouchableOpacity>
        </View>
      )}

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container:      { flex: 1 },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText:      { fontSize: 15 },
  header:         { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, paddingTop: 50, borderBottomWidth: 1 },
  headerCenter:   { flex: 1 },
  headerTitle:    { fontSize: 16, fontWeight: '800' },
  headerSub:      { fontSize: 12 },
  modBar:         { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  modBtn:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  modBtnText:     { fontSize: 12, fontWeight: '700' },
  content:        { padding: 16, paddingBottom: 20, gap: 12 },
  sujetCard:      { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  sujetHeader:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar:         { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText:     { fontWeight: '800', fontSize: 16 },
  sujetMeta:      { flex: 1 },
  sujetAuteur:    { fontSize: 13, fontWeight: '700' },
  sujetDate:      { fontSize: 11 },
  categorieBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  categorieText:  { fontSize: 11, fontWeight: '700' },
  sujetTitre:     { fontSize: 17, fontWeight: '800', lineHeight: 24 },
  sujetContenu:   { fontSize: 14, lineHeight: 22 },
  sectionTitle:   { fontSize: 15, fontWeight: '700' },
  empty:          { alignItems: 'center', paddingTop: 30, gap: 10 },
  emptyText:      { fontSize: 14 },
  messageCard:    { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  messageHeader:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  msgAvatar:      { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  msgAvatarText:  { fontWeight: '800', fontSize: 13 },
  msgMeta:        { flex: 1 },
  msgAuteur:      { fontSize: 13, fontWeight: '600' },
  moiLabel:       { fontSize: 11, fontWeight: '600' },
  msgDate:        { fontSize: 11 },
  msgActions:     { flexDirection: 'row', alignItems: 'center' },
  msgContenu:     { fontSize: 14, lineHeight: 22 },
  votesRow:       { flexDirection: 'row', gap: 8 },
  voteBtn:        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  voteCount:      { fontSize: 12, fontWeight: '700' },
  inputZone:      { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, borderTopWidth: 1 },
  input:          { flex: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, borderWidth: 1, maxHeight: 100 },
  sendBtn:        { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});

export default SujetDetailAdminScreen;