import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  RefreshControl, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, semantic } from '../../components/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AccueilScreen = ({ navigation }) => {
  const c              = useTheme();
  const { user }       = useAuth();

  const [sujets,     setSujets]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');

  const load = async () => {
    try {
      const res = await api.get('/sujets');
      setSujets(Array.isArray(res.data) ? res.data : []);
    } catch {
      setSujets([]);
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

  const filtered = sujets.filter(s => {
    const q = search.trim().toLowerCase();
    return !q || `${s.titre} ${s.contenu}`.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <View>
          <Text style={[styles.greeting, { color: c.subtext }]}>Bonjour,</Text>
          <Text style={[styles.name, { color: c.text }]}>
            {user?.prenom} {user?.nom} 👋
          </Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => navigation.navigate('Notifs')}
          >
            <Ionicons name="notifications-outline" size={20} color={c.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recherche */}
      <View style={[styles.searchBar, { backgroundColor: c.card, borderColor: c.border }]}>
        <Ionicons name="search-outline" size={18} color={c.subtext} />
        <TextInput
          style={[styles.searchInput, { color: c.text }]}
          placeholder="Rechercher un sujet..."
          placeholderTextColor={c.subtext}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={c.subtext} />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.primary} />
        }
      >

        {/* Stats rapides */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Ionicons name="chatbubbles-outline" size={20} color={c.primary} />
            <Text style={[styles.statValue, { color: c.primary }]}>{sujets.length}</Text>
            <Text style={[styles.statLabel, { color: c.subtext }]}>Sujets</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Ionicons name="checkmark-circle-outline" size={20} color={semantic.success} />
            <Text style={[styles.statValue, { color: semantic.success }]}>
              {sujets.filter(s => s.statut === 'ouvert').length}
            </Text>
            <Text style={[styles.statLabel, { color: c.subtext }]}>Ouverts</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Ionicons name="pin-outline" size={20} color={semantic.warning} />
            <Text style={[styles.statValue, { color: semantic.warning }]}>
              {sujets.filter(s => s.statut === 'epingle').length}
            </Text>
            <Text style={[styles.statLabel, { color: c.subtext }]}>Épinglés</Text>
          </View>
        </View>

        {/* Liste sujets */}
        <Text style={[styles.sectionTitle, { color: c.text }]}>Derniers sujets</Text>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={c.subtext} />
            <Text style={[styles.emptyText, { color: c.subtext }]}>Aucun sujet trouvé</Text>
            <TouchableOpacity
              style={[styles.creerBtn, { backgroundColor: c.primary }]}
              onPress={() => navigation.navigate('Creer')}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.creerBtnText}>Créer un sujet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map(sujet => (
            <TouchableOpacity
              key={sujet.id}
              style={[styles.sujetCard, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={() => navigation.navigate('SujetDetail', { sujetId: sujet.id })}
            >
              {/* Header carte */}
              <View style={styles.sujetHeader}>
                <View style={[styles.avatar, { backgroundColor: c.card }]}>
                  <Text style={[styles.avatarText, { color: c.primary }]}>
                    {sujet.user?.prenom?.[0] || 'U'}
                  </Text>
                </View>
                <View style={styles.sujetMeta}>
                  <Text style={[styles.sujetAuteur, { color: c.subtext }]}>
                    {sujet.user?.prenom} {sujet.user?.nom}
                  </Text>
                  <Text style={[styles.sujetDate, { color: c.subtext }]}>
                    {new Date(sujet.created_at).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                <View style={[
                  styles.statutBadge,
                  {
                    backgroundColor:
                      sujet.statut === 'ouvert'  ? semantic.successBg :
                      sujet.statut === 'epingle' ? semantic.warningBg :
                      semantic.errorBg
                  }
                ]}>
                  <Text style={[
                    styles.statutText,
                    {
                      color:
                        sujet.statut === 'ouvert'  ? semantic.success :
                        sujet.statut === 'epingle' ? semantic.warning :
                        semantic.error
                    }
                  ]}>
                    {sujet.statut}
                  </Text>
                </View>
              </View>

              {/* Titre */}
              <Text style={[styles.sujetTitre, { color: c.text }]} numberOfLines={2}>
                {sujet.titre}
              </Text>

              {/* Contenu */}
              <Text style={[styles.sujetContenu, { color: c.subtext }]} numberOfLines={2}>
                {sujet.contenu}
              </Text>

              {/* Footer */}
              <View style={styles.sujetFooter}>
                <View style={[styles.categorieBadge, { backgroundColor: c.card }]}>
                  <Ionicons name="book-outline" size={11} color={c.primary} />
                  <Text style={[styles.categorieText, { color: c.primary }]}>
                    {sujet.categorie?.nom || 'Catégorie'}
                  </Text>
                </View>
                <View style={styles.sujetStats}>
                  <Ionicons name="chatbubble-outline" size={13} color={c.subtext} />
                  <Text style={[styles.sujetStatText, { color: c.subtext }]}>
                    {sujet.messages_count || 0}
                  </Text>
                </View>
              </View>

            </TouchableOpacity>
          ))
        )}

      </ScrollView>

      {/* Bouton flottant */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.primary }]}
        onPress={() => navigation.navigate('Creer')}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: 1 },
  greeting:     { fontSize: 13 },
  name:         { fontSize: 18, fontWeight: '700' },
  headerIcons:  { flexDirection: 'row', gap: 8 },
  iconBtn:      { width: 38, height: 38, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  searchBar:    { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16, padding: 12, borderRadius: 12, borderWidth: 1 },
  searchInput:  { flex: 1, fontSize: 14 },
  content:      { padding: 16, paddingBottom: 100 },
  statsRow:     { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard:     { flex: 1, alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, gap: 4 },
  statValue:    { fontSize: 22, fontWeight: '900' },
  statLabel:    { fontSize: 11 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#fff' },
  empty:        { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyText:    { fontSize: 15 },
  creerBtn:     { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  creerBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  sujetCard:    { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10, marginBottom: 12 },
  sujetHeader:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar:       { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontWeight: '800', fontSize: 14 },
  sujetMeta:    { flex: 1 },
  sujetAuteur:  { fontSize: 12, fontWeight: '600' },
  sujetDate:    { fontSize: 11 },
  statutBadge:  { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statutText:   { fontSize: 10, fontWeight: '700' },
  sujetTitre:   { fontSize: 15, fontWeight: '700' },
  sujetContenu: { fontSize: 13, lineHeight: 20 },
  sujetFooter:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categorieBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  categorieText:  { fontSize: 11, fontWeight: '600' },
  sujetStats:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sujetStatText:{ fontSize: 12 },
  fab:          { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
});

export default AccueilScreen;