import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, semantic } from '../../components/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const DashboardScreen = ({ navigation }) => {
  const c                = useTheme();
  const { user, logout } = useAuth();

  const [stats,      setStats]      = useState(null);
  const [attente,    setAttente]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [statsRes, attenteRes] = await Promise.all([
        api.get('/admin/statistiques'),
        api.get('/admin/enseignants-en-attente'),
      ]);
      setStats(statsRes.data);
      setAttente(attenteRes.data.slice(0, 3));
    } catch (err) {
      console.log('Erreur dashboard:', err);
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

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.primary} />
      }
    >

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
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={20} color={c.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: c.card, borderColor: c.border }]}
          >
            <Ionicons name="chatbubble-outline" size={20} color={c.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Badge Admin */}
      <View style={[styles.badgeAdmin, { backgroundColor: c.card, borderColor: c.border }]}>
        <Ionicons name="shield-checkmark-outline" size={16} color={c.primary} />
        <Text style={[styles.badgeText, { color: c.primary }]}>Administrateur</Text>
      </View>

      {/* Statistiques */}
      <Text style={[styles.sectionTitle, { color: c.text }]}>Statistiques</Text>
      <View style={styles.statsGrid}>
        <StatCard label="Utilisateurs" value={stats?.total_utilisateurs}  icon="people-outline"           color={c.primary}        c={c} />
        <StatCard label="Étudiants"    value={stats?.etudiants}           icon="school-outline"           color={semantic.success} c={c} />
        <StatCard label="Enseignants"  value={stats?.enseignants}         icon="person-outline"           color={c.primary}        c={c} />
        <StatCard label="En attente"   value={stats?.en_attente}          icon="time-outline"             color={semantic.warning} c={c} />
        <StatCard label="Suspendus"    value={stats?.suspendus}           icon="ban-outline"              color={semantic.error}   c={c} />
        <StatCard label="Autorisés"    value={stats?.etudiants_autorises} icon="checkmark-circle-outline" color={semantic.success} c={c} />
      </View>

      {/* Actions rapides */}
      <Text style={[styles.sectionTitle, { color: c.text }]}>Actions rapides</Text>
      <View style={styles.actionsGrid}>
        {[
          { label: 'Utilisateurs', icon: 'people-outline',           route: 'Utilisateurs' },
          { label: 'Validations',  icon: 'checkmark-circle-outline', route: 'Validations'  },
          { label: 'Catégories',   icon: 'book-outline',             route: 'Categories'   },
          { label: 'Profil',       icon: 'person-outline',           route: 'Profil'       },
          { label: 'Import Excel', icon: 'cloud-upload-outline',     route: 'Import'       },
        ].map(item => (
          <TouchableOpacity
            key={item.label}
            style={[styles.actionBtn, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => navigation.navigate(item.route)}
          >
            <Ionicons name={item.icon} size={26} color={c.primary} />
            <Text style={[styles.actionLabel, { color: c.text }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Alertes récentes */}
      {attente.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Alertes récentes</Text>
          {attente.map(ens => (
            <View
              key={ens.id}
              style={[styles.alertCard, { backgroundColor: c.surface, borderColor: c.border }]}
            >
              <View style={styles.alertLeft}>
                <View style={[styles.alertAvatar, { backgroundColor: c.card }]}>
                  <Text style={[styles.alertAvatarText, { color: c.primary }]}>
                    {ens.prenom?.[0] || 'E'}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.alertTitle, { color: c.text }]}>
                    Nouvelle demande enseignant
                  </Text>
                  <Text style={[styles.alertSub, { color: c.subtext }]}>
                    {ens.prenom} {ens.nom}
                  </Text>
                </View>
              </View>
              <View style={[styles.badge, { backgroundColor: semantic.warningBg }]}>
                <Text style={[styles.badgeLabel, { color: semantic.warning }]}>En attente</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity onPress={() => navigation.navigate('Validations')}>
            <Text style={[styles.voirTout, { color: c.primary }]}>
              Voir toutes les validations →
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Déconnexion */}
      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: semantic.error }]}
        onPress={logout}
      >
        <Ionicons name="log-out-outline" size={18} color={semantic.error} />
        <Text style={[styles.logoutText, { color: semantic.error }]}>Se déconnecter</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

// ── Composant StatCard ────────────────────────
const StatCard = ({ label, value, icon, color, c }) => (
  <View style={[styles.statCard, { backgroundColor: c.surface, borderColor: c.border }]}>
    <Ionicons name={icon} size={22} color={color} />
    <Text style={[styles.statValue, { color }]}>{value ?? '—'}</Text>
    <Text style={[styles.statLabel, { color: c.subtext }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container:       { flex: 1 },
  content:         { paddingBottom: 40 },
  center:          { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: 1 },
  greeting:        { fontSize: 13 },
  name:            { fontSize: 18, fontWeight: '700' },
  headerIcons:     { flexDirection: 'row', gap: 8 },
  iconBtn:         { width: 38, height: 38, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  badgeAdmin:      { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 16, padding: 10, borderRadius: 10, borderWidth: 1, justifyContent: 'center' },
  badgeText:       { fontSize: 14, fontWeight: '700' },
  sectionTitle:    { fontSize: 16, fontWeight: '700', marginHorizontal: 16, marginTop: 20, marginBottom: 12 },
  statsGrid:       { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  statCard:        { width: '30%', padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center', gap: 4 },
  statValue:       { fontSize: 22, fontWeight: '900' },
  statLabel:       { fontSize: 11, textAlign: 'center' },
  actionsGrid:     { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  actionBtn:       { width: '47%', padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center', gap: 8 },
  actionLabel:     { fontSize: 13, fontWeight: '600' },
  alertCard:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
  alertLeft:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  alertAvatar:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  alertAvatarText: { fontWeight: '700', fontSize: 14 },
  alertTitle:      { fontSize: 13, fontWeight: '600' },
  alertSub:        { fontSize: 12 },
  badge:           { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeLabel:      { fontSize: 11, fontWeight: '700' },
  voirTout:        { textAlign: 'center', fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: 16 },
  logoutBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 16, marginTop: 24, padding: 14, borderRadius: 12, borderWidth: 1.5 },
  logoutText:      { fontSize: 15, fontWeight: '700' },
});

export default DashboardScreen;