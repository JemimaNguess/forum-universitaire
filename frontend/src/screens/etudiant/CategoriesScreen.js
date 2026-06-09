import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,RefreshControl, TextInput} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../components/theme';
import api from '../../services/api';

const CategoriesScreen = ({ navigation }) => {
  const c = useTheme();

  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [search,      setSearch]      = useState('');

  const load = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCategories([]);
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

  const filtered = categories.filter(cat => {
    const q = search.trim().toLowerCase();
    return !q || cat.nom.toLowerCase().includes(q);
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
        <Text style={[styles.headerTitle, { color: c.text }]}>Catégories</Text>
        <Text style={[styles.headerCount, { color: c.subtext }]}>
          {categories.length} catégories
        </Text>
      </View>

      {/* Recherche */}
      <View style={[styles.searchBar, { backgroundColor: c.card, borderColor: c.border }]}>
        <Ionicons name="search-outline" size={18} color={c.subtext} />
        <TextInput
          style={[styles.searchInput, { color: c.text }]}
          placeholder="Rechercher une catégorie..."
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
            <Ionicons name="book-outline" size={48} color={c.subtext} />
            <Text style={[styles.emptyText, { color: c.subtext }]}>
              Aucune catégorie trouvée
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filtered.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catCard, { backgroundColor: c.surface, borderColor: c.border }]}
                onPress={() => navigation.navigate('Sujets', { categorieId: cat.id, categorieNom: cat.nom })}
              >
                <View style={[styles.catIconContainer, { backgroundColor: c.card }]}>
                  <Ionicons name="book-outline" size={26} color={c.primary} />
                </View>
                <Text style={[styles.catNom, { color: c.text }]} numberOfLines={1}>
                  {cat.nom}
                </Text>
                <Text style={[styles.catDesc, { color: c.subtext }]} numberOfLines={2}>
                  {cat.description || 'Aucune description'}
                </Text>
                <View style={[styles.catFooter, { borderTopColor: c.border }]}>
                  <Ionicons name="chatbubble-outline" size={12} color={c.subtext} />
                  <Text style={[styles.catSujets, { color: c.subtext }]}>
                    {cat.sujets_count || 0} sujets
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={c.primary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1 },
  center:           { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: 1 },
  headerTitle:      { fontSize: 22, fontWeight: '800' },
  headerCount:      { fontSize: 13 },
  searchBar:        { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16, padding: 12, borderRadius: 12, borderWidth: 1 },
  searchInput:      { flex: 1, fontSize: 14 },
  content:          { padding: 16, paddingBottom: 40 },
  empty:            { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText:        { fontSize: 15 },
  grid:             { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catCard:          { width: '47%', borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  catIconContainer: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catNom:           { fontSize: 15, fontWeight: '700' },
  catDesc:          { fontSize: 12, lineHeight: 18 },
  catFooter:        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 8, borderTopWidth: 1, marginTop: 4 },
  catSujets:        { flex: 1, fontSize: 11 },
});

export default CategoriesScreen;