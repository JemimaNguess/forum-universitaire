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

const SujetDetailScreen = ({ navigation, route }) => {
  const c         = useTheme();
  const { user }  = useAuth();
  const sujetId   = route.params?.sujetId;

  const [sujet,      setSujet]      = useState(null);
  const [messages,   setMessages]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contenu,    setContenu]    = useState('');
  const [sending,    setSending]    = useState(false);

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
              Soyez le premier à répondre !
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
                {msg.user_id === user?.id && (
                  <TouchableOpacity onPress={() => supprimerMessage(msg.id)}>
                    <Ionicons name="trash-outline" size={16} color={semantic.error} />
                  </TouchableOpacity>
                )}
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
  msgContenu:     { fontSize: 14, lineHeight: 22 },
  votesRow:       { flexDirection: 'row', gap: 8 },
  voteBtn:        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  voteCount:      { fontSize: 12, fontWeight: '700' },
  inputZone:      { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, borderTopWidth: 1 },
  input:          { flex: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, borderWidth: 1, maxHeight: 100 },
  sendBtn:        { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});

export default SujetDetailScreen;