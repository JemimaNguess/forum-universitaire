import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  RefreshControl, Modal, TextInput, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, semantic } from '../../components/theme';
import api from '../../services/api';

const MessagerieScreen = ({ navigation }) => {
  const c = useTheme();

  const [conversations, setConversations] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [showModal,     setShowModal]     = useState(false);
  const [utilisateurs,  setUtilisateurs]  = useState([]);
  const [search,        setSearch]        = useState('');

  const load = async () => {
    try {
      const res = await api.get('/messages-prives');
      setConversations(Array.isArray(res.data) ? res.data : []);
    } catch {
      setConversations([]);
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

  const ouvrirNouvelleConversation = async () => {
    try {
      const res = await api.get('/utilisateurs-disponibles');
      setUtilisateurs(Array.isArray(res.data) ? res.data : []);
      setShowModal(true);
    } catch {
      setUtilisateurs([]);
    }
  };

  const utilisateursFiltres = utilisateurs.filter(u => {
    const q = search.trim().toLowerCase();
    return !q || `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(q);
  });

  const formatDate = (date) => {
    const d = new Date(date);
    const aujourdhui = new Date();
    if (d.toDateString() === aujourdhui.toDateString()) {
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>

      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>Messagerie</Text>
        <TouchableOpacity
          style={[styles.newBtn, { backgroundColor: c.primary }]}
          onPress={ouvrirNouvelleConversation}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.primary} />}
      >
        {conversations.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={c.subtext} />
            <Text style={[styles.emptyText, { color: c.subtext }]}>Aucune conversation</Text>
            <TouchableOpacity
              style={[styles.startBtn, { backgroundColor: c.primary }]}
              onPress={ouvrirNouvelleConversation}
            >
              <Text style={styles.startBtnText}>Démarrer une conversation</Text>
            </TouchableOpacity>
          </View>
        ) : (
          conversations.map(conv => (
            <TouchableOpacity
              key={conv.utilisateur.id}
              style={[styles.convCard, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={() => navigation.navigate('Conversation', {
                userId: conv.utilisateur.id,
                userName: `${conv.utilisateur.prenom} ${conv.utilisateur.nom}`,
              })}
            >
              <View style={[styles.avatar, { backgroundColor: c.card }]}>
                <Text style={[styles.avatarText, { color: c.primary }]}>
                  {conv.utilisateur.prenom?.[0] || 'U'}
                </Text>
              </View>
              <View style={styles.convInfo}>
                <View style={styles.convTop}>
                  <Text style={[styles.convNom, { color: c.text }]} numberOfLines={1}>
                    {conv.utilisateur.prenom} {conv.utilisateur.nom}
                  </Text>
                  <Text style={[styles.convDate, { color: c.subtext }]}>
                    {formatDate(conv.dernier_message.created_at)}
                  </Text>
                </View>
                <Text style={[styles.convMessage, { color: c.subtext }]} numberOfLines={1}>
                  {conv.dernier_message.type === 'vocal' ? '🎤 Note vocale' : conv.dernier_message.contenu}
                </Text>
              </View>
              {conv.non_lus > 0 && (
                <View style={[styles.badgeNonLu, { backgroundColor: c.primary }]}>
                  <Text style={styles.badgeNonLuText}>{conv.non_lus}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
              <Text style={[styles.modalTitle, { color: c.text }]}>Nouvelle conversation</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={c.subtext} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchBar, { backgroundColor: c.card, borderColor: c.border }]}>
              <Ionicons name="search-outline" size={18} color={c.subtext} />
              <TextInput
                style={[styles.searchInput, { color: c.text }]}
                placeholder="Rechercher un utilisateur..."
                placeholderTextColor={c.subtext}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <FlatList
              data={utilisateursFiltres}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.userItem, { borderBottomColor: c.border }]}
                  onPress={() => {
                    setShowModal(false);
                    navigation.navigate('Conversation', {
                      userId: item.id,
                      userName: `${item.prenom} ${item.nom}`,
                    });
                  }}
                >
                  <View style={[styles.avatar, { backgroundColor: c.card }]}>
                    <Text style={[styles.avatarText, { color: c.primary }]}>
                      {item.prenom?.[0] || 'U'}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userNom, { color: c.text }]}>{item.prenom} {item.nom}</Text>
                    <Text style={[styles.userRole, { color: c.subtext }]}>{item.role}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, borderBottomWidth: 1 },
  headerTitle:  { fontSize: 18, fontWeight: '800' },
  newBtn:       { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  list:         { padding: 16, gap: 10, paddingBottom: 40 },
  empty:        { alignItems: 'center', paddingTop: 60, gap: 16 },
  emptyText:    { fontSize: 15 },
  startBtn:     { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  startBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  convCard:     { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
  avatar:       { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontWeight: '800', fontSize: 17 },
  convInfo:     { flex: 1 },
  convTop:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  convNom:      { fontSize: 15, fontWeight: '700', flex: 1 },
  convDate:     { fontSize: 11 },
  convMessage:  { fontSize: 13 },
  badgeNonLu:   { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeNonLuText:{ color: '#fff', fontSize: 11, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderBottomWidth: 0, maxHeight: '75%' },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  modalTitle:   { fontSize: 17, fontWeight: '700' },
  searchBar:    { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16, padding: 12, borderRadius: 12, borderWidth: 1 },
  searchInput:  { flex: 1, fontSize: 14 },
  userItem:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingHorizontal: 16, borderBottomWidth: 1 },
  userInfo:     { flex: 1 },
  userNom:      { fontSize: 14, fontWeight: '600' },
  userRole:     { fontSize: 12, marginTop: 2 },
});

export default MessagerieScreen;