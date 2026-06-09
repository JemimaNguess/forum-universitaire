import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  RefreshControl, Alert, TextInput, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme, semantic } from '../../components/theme';
import api from '../../services/api';

const ImportScreen = () => {
  const c = useTheme();

  const [etudiants,    setEtudiants]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [importing,    setImporting]    = useState(false);
  const [resultat,     setResultat]     = useState(null);
  const [search,       setSearch]       = useState('');
  const [filter,       setFilter]       = useState('Tous');
  const [showModal,    setShowModal]    = useState(false);
  const [nomManuel,    setNomManuel]    = useState('');
  const [prenomManuel, setPrenomManuel] = useState('');
  const [emailManuel,  setEmailManuel]  = useState('');
  const [matriculeManuel, setMatriculeManuel] = useState('');
  const [savingManuel, setSavingManuel] = useState(false);
  const [errorManuel,  setErrorManuel]  = useState('');

  const filtres = ['Tous', 'Inscrits', 'Non inscrits'];

  const load = async () => {
    try {
      const res = await api.get('/admin/etudiants-autorises');
      setEtudiants(Array.isArray(res.data) ? res.data : []);
    } catch {
      setEtudiants([]);
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

  const pickAndImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv',
        ],
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setImporting(true);
      setResultat(null);

      const formData = new FormData();
      formData.append('fichier', {
        uri:  file.uri,
        name: file.name,
        type: file.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const res = await api.post('/admin/import-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResultat(res.data);
      await load();

    } catch (err) {
      Alert.alert('Erreur', "L'import a échoué. Vérifiez le format du fichier.");
    } finally {
      setImporting(false);
    }
  };

  const ajouterManuellement = async () => {
    setErrorManuel('');
    if (!nomManuel || !prenomManuel || !matriculeManuel) {
      setErrorManuel('Nom, prénom et matricule sont obligatoires.');
      return;
    }
    setSavingManuel(true);
    try {
      // Ajouter via import d'un seul étudiant
      const formData = new FormData();
      const csvContent = `nom,prenom,email,matricule\n${nomManuel},${prenomManuel},${emailManuel},${matriculeManuel}`;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      formData.append('fichier', blob, 'etudiant.csv');

      await api.post('/admin/import-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowModal(false);
      setNomManuel('');
      setPrenomManuel('');
      setEmailManuel('');
      setMatriculeManuel('');
      await load();
      Alert.alert('Succès', 'Étudiant ajouté avec succès.');
    } catch {
      setErrorManuel('Erreur lors de l\'ajout. Le matricule existe peut-être déjà.');
    } finally {
      setSavingManuel(false);
    }
  };

  const filtered = etudiants.filter(e => {
    const q = search.trim().toLowerCase();
    const byFilter =
      filter === 'Tous' ||
      (filter === 'Inscrits'     && e.statut === 'utilise') ||
      (filter === 'Non inscrits' && e.statut === 'disponible');
    const haystack = `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase();
    return byFilter && (!q || haystack.includes(q));
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
          <Text style={[styles.headerTitle, { color: c.text }]}>Import Excel</Text>
          <Text style={[styles.headerSub, { color: c.subtext }]}>
            {etudiants.length} étudiants autorisés
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: c.primary }]}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="person-add-outline" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.primary} />
        }
      >

        {/* Import Excel */}
        <View style={[styles.importCard, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.importCardHeader}>
            <Ionicons name="cloud-upload-outline" size={24} color={c.primary} />
            <Text style={[styles.importCardTitle, { color: c.text }]}>
              Importer un fichier Excel
            </Text>
          </View>
          <Text style={[styles.importCardDesc, { color: c.subtext }]}>
            Fichier .xlsx ou .csv avec les colonnes : nom, prenom, email, matricule
          </Text>

          <TouchableOpacity
            style={[styles.importBtn, { backgroundColor: c.primary }]}
            onPress={pickAndImport}
            disabled={importing}
          >
            {importing
              ? <ActivityIndicator color="#fff" size="small" />
              : <>
                  <Ionicons name="document-attach-outline" size={18} color="#fff" />
                  <Text style={styles.importBtnText}>Choisir un fichier</Text>
                </>
            }
          </TouchableOpacity>

          {/* Résultat import */}
          {resultat && (
            <View style={[styles.resultatBox, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text style={[styles.resultatTitle, { color: c.text }]}>Résultat de l'import</Text>
              <View style={styles.resultatRow}>
                <View style={[styles.resultatItem, { backgroundColor: semantic.successBg }]}>
                  <Ionicons name="checkmark-circle" size={20} color={semantic.success} />
                  <Text style={[styles.resultatCount, { color: semantic.success }]}>
                    {resultat.importes}
                  </Text>
                  <Text style={[styles.resultatLabel, { color: semantic.success }]}>importés</Text>
                </View>
                <View style={[styles.resultatItem, { backgroundColor: semantic.warningBg }]}>
                  <Ionicons name="alert-circle" size={20} color={semantic.warning} />
                  <Text style={[styles.resultatCount, { color: semantic.warning }]}>
                    {resultat.ignores}
                  </Text>
                  <Text style={[styles.resultatLabel, { color: semantic.warning }]}>ignorés</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Statistiques */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Ionicons name="people-outline" size={20} color={c.primary} />
            <Text style={[styles.statValue, { color: c.primary }]}>{etudiants.length}</Text>
            <Text style={[styles.statLabel, { color: c.subtext }]}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Ionicons name="checkmark-circle-outline" size={20} color={semantic.success} />
            <Text style={[styles.statValue, { color: semantic.success }]}>
              {etudiants.filter(e => e.statut === 'utilise').length}
            </Text>
            <Text style={[styles.statLabel, { color: c.subtext }]}>Inscrits</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Ionicons name="time-outline" size={20} color={semantic.warning} />
            <Text style={[styles.statValue, { color: semantic.warning }]}>
              {etudiants.filter(e => e.statut === 'disponible').length}
            </Text>
            <Text style={[styles.statLabel, { color: c.subtext }]}>En attente</Text>
          </View>
        </View>

        {/* Recherche */}
        <View style={[styles.searchBar, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="search-outline" size={18} color={c.subtext} />
          <TextInput
            style={[styles.searchInput, { color: c.text }]}
            placeholder="Rechercher par nom ou matricule..."
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
              onPress={() => setFilter(f)}
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

        {/* Liste étudiants */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="school-outline" size={48} color={c.subtext} />
            <Text style={[styles.emptyText, { color: c.subtext }]}>
              Aucun étudiant trouvé
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map(e => (
              <View
                key={e.id}
                style={[styles.etudiantCard, { backgroundColor: c.surface, borderColor: c.border }]}
              >
                <View style={[styles.avatar, { backgroundColor: c.card }]}>
                  <Text style={[styles.avatarText, { color: c.primary }]}>
                    {e.nom?.[0] || 'E'}
                  </Text>
                </View>
                <View style={styles.etudiantInfo}>
                  <Text style={[styles.etudiantNom, { color: c.text }]}>
                    {e.prenom} {e.nom}
                  </Text>
                  <Text style={[styles.etudiantMatricule, { color: c.subtext }]}>
                    {e.matricule}
                  </Text>
                  {e.email && (
                    <Text style={[styles.etudiantEmail, { color: c.subtext }]}>
                      {e.email}
                    </Text>
                  )}
                </View>
                <View style={[
                  styles.statutBadge,
                  { backgroundColor: e.statut === 'utilise' ? semantic.successBg : semantic.warningBg }
                ]}>
                  <Ionicons
                    name={e.statut === 'utilise' ? 'checkmark-circle' : 'time-outline'}
                    size={12}
                    color={e.statut === 'utilise' ? semantic.success : semantic.warning}
                  />
                  <Text style={[
                    styles.statutText,
                    { color: e.statut === 'utilise' ? semantic.success : semantic.warning }
                  ]}>
                    {e.statut === 'utilise' ? 'Inscrit' : 'En attente'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Modal ajout manuel */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface, borderColor: c.border }]}>

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.text }]}>Ajouter un étudiant</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={c.subtext} />
              </TouchableOpacity>
            </View>

            {errorManuel ? (
              <View style={[styles.errorBox, { backgroundColor: semantic.errorBg, borderColor: semantic.error }]}>
                <Text style={[styles.errorText, { color: semantic.error }]}>{errorManuel}</Text>
              </View>
            ) : null}

            <Text style={[styles.label, { color: c.subtext }]}>Nom *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
              placeholder="Nom de famille"
              placeholderTextColor={c.subtext}
              value={nomManuel}
              onChangeText={setNomManuel}
            />

            <Text style={[styles.label, { color: c.subtext }]}>Prénom *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
              placeholder="Prénom"
              placeholderTextColor={c.subtext}
              value={prenomManuel}
              onChangeText={setPrenomManuel}
            />

            <Text style={[styles.label, { color: c.subtext }]}>Matricule *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
              placeholder="ex : NGUM1706070001"
              placeholderTextColor={c.subtext}
              value={matriculeManuel}
              onChangeText={setMatriculeManuel}
              autoCapitalize="characters"
            />

            <Text style={[styles.label, { color: c.subtext }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
              placeholder="email@exemple.com (optionnel)"
              placeholderTextColor={c.subtext}
              value={emailManuel}
              onChangeText={setEmailManuel}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: c.border, backgroundColor: c.card }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={[styles.cancelText, { color: c.subtext }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: c.primary }]}
                onPress={ajouterManuellement}
                disabled={savingManuel}
              >
                {savingManuel
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveText}>Ajouter</Text>
                }
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1 },
  center:           { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: 1 },
  headerTitle:      { fontSize: 22, fontWeight: '800' },
  headerSub:        { fontSize: 12, marginTop: 2 },
  addBtn:           { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText:       { color: '#fff', fontSize: 13, fontWeight: '700' },
  content:          { padding: 16, gap: 16, paddingBottom: 40 },
  importCard:       { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  importCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  importCardTitle:  { fontSize: 16, fontWeight: '700' },
  importCardDesc:   { fontSize: 13, lineHeight: 20 },
  importBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12 },
  importBtnText:    { color: '#fff', fontSize: 14, fontWeight: '700' },
  resultatBox:      { borderRadius: 10, borderWidth: 1, padding: 14, gap: 10 },
  resultatTitle:    { fontSize: 14, fontWeight: '700' },
  resultatRow:      { flexDirection: 'row', gap: 10 },
  resultatItem:     { flex: 1, alignItems: 'center', padding: 12, borderRadius: 10, gap: 4 },
  resultatCount:    { fontSize: 24, fontWeight: '900' },
  resultatLabel:    { fontSize: 12, fontWeight: '600' },
  statsRow:         { flexDirection: 'row', gap: 10 },
  statCard:         { flex: 1, alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, gap: 4 },
  statValue:        { fontSize: 22, fontWeight: '900' },
  statLabel:        { fontSize: 11 },
  searchBar:        { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  searchInput:      { flex: 1, fontSize: 14 },
  filtresRow:       { gap: 8, paddingBottom: 4 },
  filtreBtn:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filtreText:       { fontSize: 12 },
  list:             { gap: 10 },
  empty:            { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyText:        { fontSize: 15 },
  etudiantCard:     { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 12, gap: 12 },
  avatar:           { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText:       { fontWeight: '800', fontSize: 16 },
  etudiantInfo:     { flex: 1 },
  etudiantNom:      { fontSize: 14, fontWeight: '700' },
  etudiantMatricule:{ fontSize: 12, marginTop: 2, fontFamily: 'monospace' },
  etudiantEmail:    { fontSize: 11, marginTop: 2 },
  statutBadge:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statutText:       { fontSize: 10, fontWeight: '700' },
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent:     { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderBottomWidth: 0 },
  modalHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:       { fontSize: 18, fontWeight: '800' },
  errorBox:         { borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1 },
  errorText:        { fontSize: 13 },
  label:            { fontSize: 13, marginBottom: 8 },
  input:            { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, marginBottom: 16, borderWidth: 1 },
  modalActions:     { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn:        { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  cancelText:       { fontSize: 14, fontWeight: '600' },
  saveBtn:          { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  saveText:         { color: '#fff', fontSize: 14, fontWeight: '700' },
});

export default ImportScreen;