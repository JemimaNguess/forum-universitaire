import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../components/theme';
import api from '../../services/api';

const HistoriqueScreen = () => {
  const c = useTheme();

  const [historique,  setHistorique]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [periode,     setPeriode]     = useState('tout');

  const periodes = [
    { label: 'Tout',           value: 'tout' },
    { label: 'Aujourd\'hui',   value: 'aujourd_hui' },
    { label: 'Cette semaine',  value: 'semaine' },
    { label: 'Ce mois',        value: 'mois' },
  ];

  const load = async () => {
    try {
      const res = await api.get('/admin/historique', {
        params: { periode: periode !== 'tout' ? periode : undefined }
      });
      setHistorique(Array.isArray(res.data) ? res.data : []);
    } catch {
      setHistorique([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [periode]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const getIcone = (action) => {
    if (action.includes('validation'))   return { name: 'checkmark-circle-outline', color: '#059669' };
    if (action.includes('rejet'))        return { name: 'close-circle-outline',     color: '#DC2626' };
    if (action.includes('blocage'))      return { name: 'ban-outline',              color: '#D97706' };
    if (action.includes('suppression'))  return { name: 'trash-outline',            color: '#DC2626' };
    if (action.includes('creation'))     return { name: 'add-circle-outline',       color: c.primary };
    return { name: 'time-outline', color: c.subtext };
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
        <Text style={[styles.headerTitle, { color: c.text }]}>Historique</Text>
        <Text style={[styles.headerCount, { color: c.subtext }]}>{historique.length} actions</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtresRow}
      >
        {periodes.map(p => (
          <TouchableOpacity
            key={p.value}
            style={[
              styles.filtreBtn,
              { borderColor: c.border, backgroundColor: c.card },
              periode === p.value && { backgroundColor: c.primary, borderColor: c.primary }
            ]}
            onPress={() => setPeriode(p.value)}
          >
            <Text style={[
              styles.filtreText,
              { color: c.subtext },
              periode === p.value && { color: '#FFFFFF', fontWeight: '700' }
            ]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.primary} />}
      >
        {historique.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={48} color={c.subtext} />
            <Text style={[styles.emptyText, { color: c.subtext }]}>Aucune action enregistrée</Text>
          </View>
        ) : (
          historique.map(item => {
            const icone = getIcone(item.action);
            return (
              <View key={item.id} style={[styles.itemCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={[styles.itemIcon, { backgroundColor: c.card }]}>
                  <Ionicons name={icone.name} size={18} color={icone.color} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemDesc, { color: c.text }]}>{item.description}</Text>
                  <Text style={[styles.itemMeta, { color: c.subtext }]}>
                    {item.admin?.prenom} {item.admin?.nom} · {new Date(item.created_at).toLocaleString('fr-FR')}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container:   { flex: 1 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  headerCount: { fontSize: 13 },
  filtresRow:  { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filtreBtn:   { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, height: 36 },
  filtreText:  { fontSize: 12 },
  list:        { padding: 16, gap: 10, paddingBottom: 40 },
  empty:       { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText:   { fontSize: 15 },
  itemCard:    { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 12, borderWidth: 1, padding: 14 },
  itemIcon:    { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  itemInfo:    { flex: 1, gap: 4 },
  itemDesc:    { fontSize: 13, lineHeight: 20 },
  itemMeta:    { fontSize: 11 },
});

export default HistoriqueScreen;