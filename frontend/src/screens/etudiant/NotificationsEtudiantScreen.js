import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, semantic } from '../../components/theme';
import api from '../../services/api';

const NotificationsEtudiantScreen = ({ navigation }) => {
  const c = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [filter,        setFilter]        = useState('Toutes');

  const filtres = ['Toutes', 'Non lues'];

  const load = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch {
      setNotifications([]);
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

  const marquerLu = async (id) => {
    try {
      await api.patch(`/notifications/${id}/lu`);
      setNotifications(curr =>
        curr.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
    } catch {}
  };

  const marquerToutLu = async () => {
    try {
      await api.patch('/notifications/tout-lu');
      setNotifications(curr =>
        curr.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
    } catch {}
  };

  const getIcone = (type) => {
    switch (type) {
      case 'nouvelle_reponse':   return { name: 'chatbubble-outline',       color: c.primary };
      case 'nouveau_compte':     return { name: 'person-add-outline',      color: semantic.success };
      case 'validation':         return { name: 'checkmark-circle-outline', color: semantic.success };
      case 'signalement':        return { name: 'flag-outline',            color: semantic.warning };
      default:                   return { name: 'notifications-outline',   color: c.primary };
    }
  };

  const getTexte = (notif) => {
    const d = notif.donnees || {};
    switch (notif.type) {
      case 'nouvelle_reponse': return `${d.auteur || 'Quelqu\'un'} a répondu à "${d.sujet_titre || ''}"`;
      case 'nouveau_compte':   return `Nouveau compte créé : ${d.nom || ''}`;
      case 'signalement':      return 'Un contenu a été signalé';
      default:                 return 'Nouvelle notification';
    }
  };

  const filtered = notifications.filter(n => filter === 'Non lues' ? !n.read_at : true);
  const nonLues  = notifications.filter(n => !n.read_at).length;

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
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: c.text }]}>Notifications</Text>
          {nonLues > 0 && (
            <Text style={[styles.headerSub, { color: c.subtext }]}>{nonLues} non lue{nonLues > 1 ? 's' : ''}</Text>
          )}
        </View>
        {nonLues > 0 && (
          <TouchableOpacity
            style={[styles.toutLuBtn, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={marquerToutLu}
          >
            <Ionicons name="checkmark-done-outline" size={16} color={c.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.filtresRow, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        {filtres.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filtreBtn, filter === f && { borderBottomWidth: 2, borderBottomColor: c.primary }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filtreText, { color: c.subtext }, filter === f && { color: c.primary, fontWeight: '700' }]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.primary} />}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={c.subtext} />
            <Text style={[styles.emptyText, { color: c.subtext }]}>Aucune notification</Text>
          </View>
        ) : (
          filtered.map(notif => {
            const icone = getIcone(notif.type);
            const isLue = !!notif.read_at;
            return (
              <TouchableOpacity
                key={notif.id}
                style={[
                  styles.notifCard,
                  { backgroundColor: isLue ? c.surface : c.card, borderColor: c.border },
                  !isLue && { borderLeftWidth: 3, borderLeftColor: c.primary }
                ]}
                onPress={() => !isLue && marquerLu(notif.id)}
              >
                <View style={[styles.notifIcon, { backgroundColor: c.card }]}>
                  <Ionicons name={icone.name} size={20} color={icone.color} />
                </View>
                <View style={styles.notifInfo}>
                  <Text style={[styles.notifTexte, { color: c.text }]}>{getTexte(notif)}</Text>
                  <Text style={[styles.notifDate, { color: c.subtext }]}>
                    {new Date(notif.created_at).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                {!isLue && <View style={[styles.dot, { backgroundColor: c.primary }]} />}
              </TouchableOpacity>
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
  header:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, paddingTop: 50, borderBottomWidth: 1 },
  headerCenter:{ flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  headerSub:   { fontSize: 12, marginTop: 2 },
  toutLuBtn:   { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  filtresRow:  { flexDirection: 'row', borderBottomWidth: 1 },
  filtreBtn:   { flex: 1, paddingVertical: 14, alignItems: 'center' },
  filtreText:  { fontSize: 13 },
  list:        { padding: 16, gap: 10, paddingBottom: 40 },
  empty:       { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText:   { fontSize: 15 },
  notifCard:   { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, borderWidth: 1, padding: 14 },
  notifIcon:   { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  notifInfo:   { flex: 1, gap: 4 },
  notifTexte:  { fontSize: 13, lineHeight: 20 },
  notifDate:   { fontSize: 11 },
  dot:         { width: 8, height: 8, borderRadius: 4 },
});

export default NotificationsEtudiantScreen;