import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  TextInput, RefreshControl, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, semantic } from '../../components/theme';
import api from '../../services/api';

const UtilisateursScreen = ({ navigation }) => {
  const c = useTheme();

  const [users,      setUsers]      = useState([]);
  const [autorises,  setAutorises]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState('Tous');

  const filtres = ['Tous', 'etudiant', 'enseignant', 'Suspendus', 'Autorisés'];

  const load = async () => {
    try {
      const [usersRes, autorisesRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/etudiants-autorises'),
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setAutorises(Array.isArray(autorisesRes.data) ? autorisesRes.data : []);
    } catch {
      setUsers([]);
      setAutorises([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredUsers = useMemo(() => {
    if (filter === 'Autorisés') return [];
    const q = search.trim().toLowerCase();
    return users.filter(user => {
      const byFilter =
        filter === 'Tous' ||
        user.role === filter ||
        (filter === 'Suspendus' && user.statut === 'rejete');
      const haystack = `${user.prenom} ${user.nom} ${user.email}`.toLowerCase();
      return byFilter && (!q || haystack.includes(q));
    });
  }, [users, search, filter]);

  const filteredAutorises = useMemo(() => {
    if (filter !== 'Autorisés') return [];
    const q = search.trim().toLowerCase();
    return autorises.filter(e => {
      const haystack = `${e.nom} ${e.prenom} ${e.matricule} ${e.email || ''}`.toLowerCase();
      return !q || haystack.includes(q);
    });
  }, [autorises, search, filter]);

  const bloquer = async (id) => {
    Alert.alert('Bloquer', 'Voulez-vous bloquer cet utilisateur ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Bloquer', style: 'destructive',
        onPress: async () => {
          try {
            await api.patch(`/admin/bloquer/${id}`);
            setUsers(curr => curr.map(u => u.id === id ? { ...u, statut: 'rejete' } : u));
          } catch {
            Alert.alert('Erreur', 'Impossible de bloquer.');
          }
        }
      }
    ]);
  };

  const reactiver = async (id) => {
    try {
      await api.patch(`/admin/reactiver/${id}`);
      setUsers(curr => curr.map(u => u.id === id ? { ...u, statut: 'actif' } : u));
    } catch {
      Alert.alert('Erreur', 'Impossible de réactiver.');
    }
  };

  const supprimer = async (id) => {
    Alert.alert('Supprimer', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/users/${id}`);
            setUsers(curr => curr.filter(u => u.id !== id));
          } catch {
            Alert.alert('Erreur', 'Impossible de supprimer.');
          }
        }
      }
    ]);
  };

  const envoyerRappel = (etudiant) => {
    Alert.alert(
      'Rappel envoyé',
      `Un email de rappel a été envoyé à ${etudiant.prenom} ${etudiant.nom}.`
    );
  };

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const getStatutColor = (statut) => {
    if (statut === 'actif')      return { bg: semantic.successBg, text: semantic.success };
    if (statut === 'en_attente') return { bg: semantic.warningBg, text: semantic.warning };
    return { bg: semantic.errorBg, text: semantic.error };
  };

  const totalAffiches = filter === 'Autorisés' ? filteredAutorises.length : filteredUsers.length;

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
        <Text style={[styles.headerTitle, { color: c.text }]}>Utilisateurs</Text>
        <Text style={[styles.headerCount, { color: c.subtext }]}>{totalAffiches} résultats</Text>
      </View>

      {/* Recherche */}
      <View style={[styles.searchBar, { backgroundColor: c.card, borderColor: c.border }]}>
        <Ionicons name="search-outline" size={18} color={c.subtext} />
        <TextInput
          style={[styles.searchInput, { color: c.text }]}
          placeholder="Rechercher un utilisateur..."
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

      {/* Filtres */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtresRow}
      >
        {filtres.map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filtreBtn,
              { borderColor: c.border, backgroundColor: c.card },
              filter === f && { backgroundColor: c.primary, borderColor: c.primary }
            ]}
            onPress={() => { setFilter(f); setSearch(''); }}
          >
            <Text style={[
              styles.filtreText,
              { color: c.subtext },
              filter === f && { color: '#FFFFFF', fontWeight: '700' }
            ]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Liste */}
      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.primary} />
        }
      >

        {/* ── Liste Utilisateurs ── */}
        {filter !== 'Autorisés' && (
          filteredUsers.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={c.subtext} />
              <Text style={[styles.emptyText, { color: c.subtext }]}>Aucun utilisateur trouvé</Text>
            </View>
          ) : (
            filteredUsers.map(user => {
              const statut = getStatutColor(user.statut);
              return (
                <View key={user.id} style={[styles.userCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                  <View style={styles.userTop}>
                    <View style={[styles.avatar, { backgroundColor: c.card }]}>
                      <Text style={[styles.avatarText, { color: c.primary }]}>
                        {user.prenom?.[0] || 'U'}
                      </Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={[styles.userName, { color: c.text }]}>
                        {user.prenom} {user.nom}
                      </Text>
                      <Text style={[styles.userEmail, { color: c.subtext }]}>{user.email}</Text>
                      {user.filiere && (
                        <Text style={[styles.userMeta, { color: c.subtext }]}>
                          {user.filiere}{user.niveau ? ` · ${user.niveau}` : ''}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.statutBadge, { backgroundColor: statut.bg }]}>
                      <Text style={[styles.statutText, { color: statut.text }]}>
                        {user.statut}
                      </Text>
                    </View>
                  </View>

                  {/* Rôle */}
                  <View style={[styles.roleBadge, { backgroundColor: c.card }]}>
                    <Ionicons
                      name={user.role === 'etudiant' ? 'school-outline' : user.role === 'enseignant' ? 'person-outline' : 'shield-outline'}
                      size={12}
                      color={c.primary}
                    />
                    <Text style={[styles.roleText, { color: c.primary }]}>{user.role}</Text>
                  </View>

                  {/* Actions */}
                  {user.role !== 'admin' && (
                    <View style={styles.actions}>
                      {user.statut === 'rejete' ? (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: semantic.successBg, borderColor: semantic.success }]}
                          onPress={() => reactiver(user.id)}
                        >
                          <Ionicons name="refresh-outline" size={14} color={semantic.success} />
                          <Text style={[styles.actionText, { color: semantic.success }]}>Réactiver</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: semantic.warningBg, borderColor: semantic.warning }]}
                          onPress={() => bloquer(user.id)}
                        >
                          <Ionicons name="ban-outline" size={14} color={semantic.warning} />
                          <Text style={[styles.actionText, { color: semantic.warning }]}>Bloquer</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: semantic.errorBg, borderColor: semantic.error }]}
                        onPress={() => supprimer(user.id)}
                      >
                        <Ionicons name="trash-outline" size={14} color={semantic.error} />
                        <Text style={[styles.actionText, { color: semantic.error }]}>Supprimer</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )
        )}

        {/* ── Liste Étudiants Autorisés ── */}
        {filter === 'Autorisés' && (
          filteredAutorises.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="school-outline" size={48} color={c.subtext} />
              <Text style={[styles.emptyText, { color: c.subtext }]}>
                Aucun étudiant autorisé trouvé
              </Text>
              <TouchableOpacity
                style={[styles.importBtn, { backgroundColor: c.primary }]}
                onPress={() => navigation.navigate('Import')}
              >
                <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                <Text style={styles.importBtnText}>Importer des étudiants</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredAutorises.map(e => (
              <View
                key={e.id}
                style={[styles.userCard, { backgroundColor: c.surface, borderColor: c.border }]}
              >
                <View style={styles.userTop}>
                  <View style={[styles.avatar, { backgroundColor: c.card }]}>
                    <Text style={[styles.avatarText, { color: c.primary }]}>
                      {e.nom?.[0] || 'E'}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: c.text }]}>
                      {e.prenom} {e.nom}
                    </Text>
                    {e.email && (
                      <Text style={[styles.userEmail, { color: c.subtext }]}>{e.email}</Text>
                    )}
                    <Text style={[styles.userMeta, { color: c.subtext }]}>
                      Matricule : {e.matricule}
                    </Text>
                  </View>
                  <View style={[
                    styles.statutBadge,
                    { backgroundColor: e.statut === 'utilise' ? semantic.successBg : semantic.warningBg }
                  ]}>
                    <Text style={[
                      styles.statutText,
                      { color: e.statut === 'utilise' ? semantic.success : semantic.warning }
                    ]}>
                      {e.statut === 'utilise' ? 'Inscrit' : 'Non inscrit'}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: c.card, borderColor: c.border }]}
                    onPress={() => Alert.alert('Profil', `${e.prenom} ${e.nom}\nMatricule : ${e.matricule}\nEmail : ${e.email || 'Non renseigné'}\nStatut : ${e.statut === 'utilise' ? 'Inscrit' : 'Non inscrit'}`)}
                  >
                    <Ionicons name="eye-outline" size={14} color={c.primary} />
                    <Text style={[styles.actionText, { color: c.primary }]}>Voir profil</Text>
                  </TouchableOpacity>
                  {e.statut !== 'utilise' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: semantic.warningBg, borderColor: semantic.warning }]}
                      onPress={() => envoyerRappel(e)}
                    >
                      <Ionicons name="mail-outline" size={14} color={semantic.warning} />
                      <Text style={[styles.actionText, { color: semantic.warning }]}>Rappel</Text>
                    </TouchableOpacity>
                  )}
                </View>

              </View>
            ))
          )
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
  headerCount:  { fontSize: 13 },
  searchBar:    { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16, padding: 12, borderRadius: 12, borderWidth: 1 },
  searchInput:  { flex: 1, fontSize: 14 },
  filtresRow:   { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filtreBtn:    { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, height: 36 },
  filtreText:   { fontSize: 12 },
  list:         { padding: 16, gap: 12, paddingBottom: 480, flexGrow: 1, },
  empty:        { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText:    { fontSize: 15 },
  importBtn:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  importBtnText:{ color: '#fff', fontSize: 14, fontWeight: '700' },
  userCard:     { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  userTop:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar:       { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontWeight: '800', fontSize: 16 },
  userInfo:     { flex: 1 },
  userName:     { fontSize: 15, fontWeight: '700' },
  userEmail:    { fontSize: 12, marginTop: 2 },
  userMeta:     { fontSize: 11, marginTop: 2 },
  statutBadge:  { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statutText:   { fontSize: 10, fontWeight: '700' },
  roleBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  roleText:     { fontSize: 11, fontWeight: '600' },
  actions:      { flexDirection: 'row', gap: 8 },
  actionBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8, borderRadius: 8, borderWidth: 1 },
  actionText:   { fontSize: 12, fontWeight: '600' },
});

export default UtilisateursScreen;