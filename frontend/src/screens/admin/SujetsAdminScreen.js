import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  RefreshControl, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, semantic } from '../../components/theme';
import api from '../../services/api';

const SujetsAdminScreen = ({ navigation, route }) => {
  const c            = useTheme();
  const categorieId  = route.params?.categorieId;
  const categorieNom = route.params?.categorieNom || 'Sujets';

  const [sujets,     setSujets]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');

  const load = async () => {
    try {
      const res = await api.get(`/categories/${categorieId}/sujets`);
      setSujets(Array.isArray(res.data.sujets) ? res.data.sujets : []);
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: c.text }]} numberOfLines={1}>
            {categorieNom}
          </Text>
          <Text style={[styles.headerCount, { color: c.subtext }]}>
            {sujets.length} sujets
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.creerBtn, { backgroundColor: c.primary }]}
          onPress={() => navigation.navigate('CreerSujetAdmin', { categorieId, categorieNom })}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
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
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={c.subtext} />
            <Text style={[styles.emptyText, { color: c.subtext }]}>
              Aucun sujet dans cette catégorie
            </Text>
            <TouchableOpacity
              style={[styles.creerBtnFull, { backgroundColor: c.primary }]}
              onPress={() => navigation.navigate('CreerSujetAdmin', { categorieId, categorieNom })}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.creerBtnText}>Créer le premier sujet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map(sujet => (
            <TouchableOpacity
              key={sujet.id}
              style={[styles.sujetCard, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={() => navigation.navigate('SujetDetailAdmin', { sujetId: sujet.id })}
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
                <View style={styles.sujetStats}>
                  <Ionicons name="chatbubble-outline" size={13} color={c.subtext} />
                  <Text style={[styles.sujetStatText, { color: c.subtext }]}>
                    {sujet.messages_count || 0} réponses
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={c.primary} />
              </View>

            </TouchableOpacity>
          ))
        )}
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:       { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, paddingTop: 50, borderBottomWidth: 1 },
  headerCenter: { flex: 1 },
  headerTitle:  { fontSize: 18, fontWeight: '800' },
  headerCount:  { fontSize: 12 },
  creerBtn:     { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  searchBar:    { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16, padding: 12, borderRadius: 12, borderWidth: 1 },
  searchInput:  { flex: 1, fontSize: 14 },
  content:      { padding: 16, paddingBottom: 40, gap: 12 },
  empty:        { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText:    { fontSize: 15 },
  creerBtnFull: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  creerBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  sujetCard:    { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
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
  sujetStats:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sujetStatText:{ fontSize: 12 },
});

export default SujetsAdminScreen;