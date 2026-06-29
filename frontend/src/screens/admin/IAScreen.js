import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, semantic } from '../../components/theme';
import api from '../../services/api';

const IAScreen = () => {
  const c = useTheme();

  const [rapport, setRapport] = useState(null);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const genererRapport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ia/rapport-admin');
      setRapport(res.data.rapport);
      setStats(res.data.stats);
    } catch {
      setError('Impossible de générer le rapport. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>

      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <View style={[styles.headerIcon, { backgroundColor: c.card }]}>
          <Ionicons name="sparkles-outline" size={20} color={c.primary} />
        </View>
        <View>
          <Text style={[styles.headerTitle, { color: c.text }]}>Assistant IA</Text>
            <Text style={[styles.headerSub, { color: c.subtext }]}>Rapports et modération assistée</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={22} color={c.primary} />
            <Text style={[styles.cardTitle, { color: c.text }]}>Rapport hebdomadaire</Text>
          </View>
          <Text style={[styles.cardDesc, { color: c.subtext }]}>
            Génère un résumé intelligent de l'activité de la semaine avec des suggestions d'actions.
          </Text>

          <TouchableOpacity
            style={[styles.genererBtn, { backgroundColor: c.primary }]}
            onPress={genererRapport}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <>
                  <Ionicons name="sparkles" size={16} color="#fff" />
                  <Text style={styles.genererBtnText}>Générer le rapport</Text>
                </>
            }
          </TouchableOpacity>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: semantic.errorBg, borderColor: semantic.error }]}>
              <Text style={[styles.errorText, { color: semantic.error }]}>{error}</Text>
            </View>
          ) : null}

          {rapport && (
            <View style={[styles.rapportBox, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={styles.rapportHeader}>
                <Ionicons name="sparkles" size={14} color={c.primary} />
                <Text style={[styles.rapportLabel, { color: c.primary }]}>Analyse IA</Text>
              </View>
              <Text style={[styles.rapportTexte, { color: c.text }]}>{rapport}</Text>
            </View>
          )}

          {stats && (
            <View style={styles.statsGrid}>
              <View style={[styles.statItem, { backgroundColor: c.card }]}>
                <Text style={[styles.statValue, { color: c.primary }]}>{stats.total_utilisateurs}</Text>
                <Text style={[styles.statLabel, { color: c.subtext }]}>Utilisateurs</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: c.card }]}>
                <Text style={[styles.statValue, { color: semantic.success }]}>{stats.nouveaux_semaine}</Text>
                <Text style={[styles.statLabel, { color: c.subtext }]}>Nouveaux</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: c.card }]}>
                <Text style={[styles.statValue, { color: c.primary }]}>{stats.sujets_semaine}</Text>
                <Text style={[styles.statLabel, { color: c.subtext }]}>Sujets</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: c.card }]}>
                <Text style={[styles.statValue, { color: semantic.warning }]}>{stats.en_attente}</Text>
                <Text style={[styles.statLabel, { color: c.subtext }]}>En attente</Text>
              </View>
            </View>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark-outline" size={22} color={c.primary} />
            <Text style={[styles.cardTitle, { color: c.text }]}>Modération assistée</Text>
          </View>
          <Text style={[styles.cardDesc, { color: c.subtext }]}>
            Lorsqu'un message est signalé, l'IA peut analyser automatiquement son contenu pour vous aider
            à prendre une décision rapide depuis l'écran Validations.
          </Text>
        </View>

      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container:      { flex: 1 },
  header:         { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, paddingTop: 50, borderBottomWidth: 1 },
  headerIcon:     { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle:    { fontSize: 18, fontWeight: '800' },
  headerSub:      { fontSize: 12, marginTop: 2 },
  content:        { padding: 16, gap: 16, paddingBottom: 40 },
  card:           { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  cardHeader:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle:      { fontSize: 15, fontWeight: '700' },
  cardDesc:       { fontSize: 13, lineHeight: 20 },
  genererBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12 },
  genererBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  errorBox:       { borderRadius: 10, padding: 12, borderWidth: 1 },
  errorText:      { fontSize: 13 },
  rapportBox:     { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  rapportHeader:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rapportLabel:   { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  rapportTexte:   { fontSize: 14, lineHeight: 22 },
  statsGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statItem:       { flex: 1, minWidth: '45%', alignItems: 'center', padding: 12, borderRadius: 10, gap: 4 },
  statValue:      { fontSize: 20, fontWeight: '900' },
  statLabel:      { fontSize: 11 },
});

export default IAScreen;