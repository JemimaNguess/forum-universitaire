import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  RefreshControl, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, semantic } from '../../components/theme';
import api from '../../services/api';

const ValidationsScreen = () => {
  const c = useTheme();

  const [tab,        setTab]        = useState('En attente');
  const [teachers,   setTeachers]   = useState([]);
  const [approved,   setApproved]   = useState([]);
  const [rejected,   setRejected]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const tabs = ['En attente', 'Approuvés', 'Refusés'];

  const load = async () => {
    try {
      const [enAttenteRes, approuvesRes, refusesRes] = await Promise.all([
        api.get('/admin/enseignants', { params: { statut: 'en_attente' } }),
        api.get('/admin/enseignants', { params: { statut: 'actif' } }),
        api.get('/admin/enseignants', { params: { statut: 'rejete' } }),
      ]);
      setTeachers(Array.isArray(enAttenteRes.data) ? enAttenteRes.data : []);
      setApproved(Array.isArray(approuvesRes.data) ? approuvesRes.data : []);
      setRejected(Array.isArray(refusesRes.data) ? refusesRes.data : []);
    } catch {
      setTeachers([]);
      setApproved([]);
      setRejected([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const visible = useMemo(() => {
    if (tab === 'Approuvés') return approved;
    if (tab === 'Refusés')   return rejected;
    return teachers;
  }, [tab, teachers, approved, rejected]);

  const valider = async (teacher) => {
    Alert.alert('Valider', `Valider le compte de ${teacher.prenom} ${teacher.nom} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Valider',
        onPress: async () => {
          try {
            await api.patch(`/admin/valider/${teacher.id}`);
            await load();
          } catch {
            Alert.alert('Erreur', 'Impossible de valider.');
          }
        }
      }
    ]);
  };

  const rejeter = async (teacher) => {
    Alert.alert('Rejeter', `Rejeter la demande de ${teacher.prenom} ${teacher.nom} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Rejeter', style: 'destructive',
        onPress: async () => {
          try {
            await api.patch(`/admin/rejeter/${teacher.id}`);
            await load();
          } catch {
            Alert.alert('Erreur', 'Impossible de rejeter.');
          }
        }
      }
    ]);
  };

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
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

      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.headerTitle, { color: c.text }]}>Validations</Text>
        <View style={[styles.countBadge, { backgroundColor: c.card }]}>
          <Text style={[styles.countText, { color: c.primary }]}>{teachers.length} en attente</Text>
        </View>
      </View>

      {/* Onglets */}
      <View style={[styles.tabsRow, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t}
            style={[
              styles.tabBtn,
              tab === t && { borderBottomWidth: 2, borderBottomColor: c.primary }
            ]}
            onPress={() => setTab(t)}
          >
            <Text style={[
              styles.tabText,
              { color: c.subtext },
              tab === t && { color: c.primary, fontWeight: '700' }
            ]}>
              {t}
              {t === 'En attente' && teachers.length > 0
                ? ` (${teachers.length})` : ''}
              {t === 'Approuvés'  && approved.length > 0
                ? ` (${approved.length})` : ''}
              {t === 'Refusés'    && rejected.length > 0
                ? ` (${rejected.length})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste */}
      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.primary} />
        }
      >
        {visible.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle-outline" size={48} color={c.subtext} />
            <Text style={[styles.emptyText, { color: c.subtext }]}>
              Aucune demande dans cette vue
            </Text>
          </View>
        ) : (
          visible.map(teacher => (
            <View
              key={teacher.id}
              style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
            >
              {/* Info enseignant */}
              <View style={styles.cardTop}>
                <View style={[styles.avatar, { backgroundColor: c.card }]}>
                  <Text style={[styles.avatarText, { color: c.primary }]}>
                    {teacher.prenom?.[0] || 'E'}
                  </Text>
                </View>
                <View style={styles.info}>
                  <Text style={[styles.name, { color: c.text }]}>
                    Pr. {teacher.prenom} {teacher.nom}
                  </Text>
                  <Text style={[styles.email, { color: c.subtext }]}>{teacher.email}</Text>
                  <Text style={[styles.meta, { color: c.subtext }]}>
                    Matricule : {teacher.matricule || 'ENS-UIYA'}
                  </Text>
                  {teacher.filiere && (
                    <Text style={[styles.meta, { color: c.subtext }]}>
                      Département : {teacher.filiere}
                    </Text>
                  )}
                </View>

                {/* Statut */}
                {teacher.statut === 'actif' && (
                  <View style={[styles.statutBadge, { backgroundColor: semantic.successBg }]}>
                    <Text style={[styles.statutText, { color: semantic.success }]}>Validé</Text>
                  </View>
                )}
                {teacher.statut === 'rejete' && (
                  <View style={[styles.statutBadge, { backgroundColor: semantic.errorBg }]}>
                    <Text style={[styles.statutText, { color: semantic.error }]}>Refusé</Text>
                  </View>
                )}
                {(!teacher.statut || teacher.statut === 'en_attente') && (
                  <View style={[styles.statutBadge, { backgroundColor: semantic.warningBg }]}>
                    <Text style={[styles.statutText, { color: semantic.warning }]}>En attente</Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              {tab === 'En attente' && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: semantic.errorBg, borderColor: semantic.error }]}
                    onPress={() => rejeter(teacher)}
                  >
                    <Ionicons name="close-outline" size={16} color={semantic.error} />
                    <Text style={[styles.actionText, { color: semantic.error }]}>Refuser</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: c.primary, borderColor: c.primary }]}
                    onPress={() => valider(teacher)}
                  >
                    <Ionicons name="checkmark-outline" size={16} color="#FFFFFF" />
                    <Text style={[styles.actionText, { color: '#FFFFFF' }]}>Accepter</Text>
                  </TouchableOpacity>
                </View>
              )}

            </View>
          ))
        )}
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: 1 },
  headerTitle:  { fontSize: 22, fontWeight: '800' },
  countBadge:   { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  countText:    { fontSize: 13, fontWeight: '700' },
  tabsRow:      { flexDirection: 'row', borderBottomWidth: 1 },
  tabBtn:       { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabText:      { fontSize: 13 },
  list:         { padding: 16, gap: 12, paddingBottom: 40 },
  empty:        { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText:    { fontSize: 15 },
  card:         { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  cardTop:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar:       { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontWeight: '800', fontSize: 16 },
  info:         { flex: 1 },
  name:         { fontSize: 15, fontWeight: '700' },
  email:        { fontSize: 12, marginTop: 2 },
  meta:         { fontSize: 11, marginTop: 2 },
  statutBadge:  { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statutText:   { fontSize: 10, fontWeight: '700' },
  actions:      { flexDirection: 'row', gap: 8 },
  actionBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 10, borderWidth: 1 },
  actionText:   { fontSize: 13, fontWeight: '700' },
});

export default ValidationsScreen;