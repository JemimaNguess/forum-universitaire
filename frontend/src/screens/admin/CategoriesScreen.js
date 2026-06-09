import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  TextInput, RefreshControl, Alert, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, semantic } from '../../components/theme';
import api from '../../services/api';

const CategoriesScreen = () => {
  const c = useTheme();

  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [editMode,    setEditMode]    = useState(false);
  const [selected,    setSelected]    = useState(null);
  const [nom,         setNom]         = useState('');
  const [description, setDescription] = useState('');
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

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

  const openCreate = () => {
    setEditMode(false);
    setSelected(null);
    setNom('');
    setDescription('');
    setError('');
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditMode(true);
    setSelected(cat);
    setNom(cat.nom);
    setDescription(cat.description || '');
    setError('');
    setShowModal(true);
  };

  const save = async () => {
    if (!nom.trim()) {
      setError('Le nom est obligatoire.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editMode && selected) {
        const res = await api.put(`/categories/${selected.id}`, { nom, description });
        setCategories(curr => curr.map(c => c.id === selected.id ? res.data : c));
      } else {
        const res = await api.post('/categories', { nom, description });
        setCategories(curr => [res.data, ...curr]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const supprimer = (id) => {
    Alert.alert('Supprimer', 'Supprimer cette catégorie et tous ses sujets ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/categories/${id}`);
            setCategories(curr => curr.filter(c => c.id !== id));
          } catch {
            Alert.alert('Erreur', 'Impossible de supprimer.');
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
        <Text style={[styles.headerTitle, { color: c.text }]}>Catégories</Text>
        <Text style={[styles.headerCount, { color: c.subtext }]}>{categories.length} catégories</Text>
      </View>

      {/* Liste */}
      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.primary} />
        }
      >
        {categories.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={48} color={c.subtext} />
            <Text style={[styles.emptyText, { color: c.subtext }]}>
              Aucune catégorie créée
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: c.primary }]}
              onPress={openCreate}
            >
              <Text style={styles.emptyBtnText}>Créer une catégorie</Text>
            </TouchableOpacity>
          </View>
        ) : (
          categories.map(cat => (
            <View
              key={cat.id}
              style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.catIcon, { backgroundColor: c.card }]}>
                  <Ionicons name="book-outline" size={22} color={c.primary} />
                </View>
                <View style={styles.catInfo}>
                  <Text style={[styles.catNom, { color: c.text }]}>{cat.nom}</Text>
                  <Text style={[styles.catDesc, { color: c.subtext }]} numberOfLines={2}>
                    {cat.description || 'Aucune description'}
                  </Text>
                  <View style={[styles.sujetsBadge, { backgroundColor: c.card }]}>
                    <Ionicons name="chatbubble-outline" size={11} color={c.primary} />
                    <Text style={[styles.sujetsText, { color: c.primary }]}>
                      {cat.sujets_count || 0} sujets
                    </Text>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.iconAction, { backgroundColor: c.card }]}
                  onPress={() => openEdit(cat)}
                >
                  <Ionicons name="pencil-outline" size={16} color={c.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconAction, { backgroundColor: semantic.errorBg }]}
                  onPress={() => supprimer(cat.id)}
                >
                  <Ionicons name="trash-outline" size={16} color={semantic.error} />
                </TouchableOpacity>
              </View>

            </View>
          ))
        )}
      </ScrollView>

      {/* Bouton flottant */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.primary }]}
        onPress={openCreate}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal Créer / Modifier */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface, borderColor: c.border }]}>

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.text }]}>
                {editMode ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={c.subtext} />
              </TouchableOpacity>
            </View>

            {/* Erreur */}
            {error ? (
              <View style={[styles.errorBox, { backgroundColor: semantic.errorBg, borderColor: semantic.error }]}>
                <Text style={[styles.errorText, { color: semantic.error }]}>{error}</Text>
              </View>
            ) : null}

            {/* Nom */}
            <Text style={[styles.label, { color: c.subtext }]}>Nom *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
              placeholder="ex : Algorithmique"
              placeholderTextColor={c.subtext}
              value={nom}
              onChangeText={setNom}
            />

            {/* Description */}
            <Text style={[styles.label, { color: c.subtext }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
              placeholder="Décrire cette catégorie..."
              placeholderTextColor={c.subtext}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {/* Aperçu */}
            <View style={[styles.preview, { backgroundColor: c.card, borderColor: c.border }]}>
              <Ionicons name="book-outline" size={20} color={c.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.previewNom, { color: c.text }]}>
                  {nom || 'Nom de la catégorie'}
                </Text>
                <Text style={[styles.previewDesc, { color: c.subtext }]}>
                  {description || 'Description...'}
                </Text>
              </View>
            </View>

            {/* Boutons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: c.border, backgroundColor: c.card }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={[styles.cancelText, { color: c.subtext }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: c.primary }]}
                onPress={save}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveText}>
                      {editMode ? 'Modifier' : 'Enregistrer'}
                    </Text>
                }
              </TouchableOpacity>
            </View>

            {/* Supprimer en mode édition */}
            {editMode && (
              <TouchableOpacity
                style={[styles.deleteBtn, { borderColor: semantic.error }]}
                onPress={() => {
                  setShowModal(false);
                  supprimer(selected.id);
                }}
              >
                <Ionicons name="trash-outline" size={16} color={semantic.error} />
                <Text style={[styles.deleteText, { color: semantic.error }]}>
                  Supprimer la catégorie
                </Text>
              </TouchableOpacity>
            )}

          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: 1 },
  headerTitle:  { fontSize: 22, fontWeight: '800' },
  headerCount:  { fontSize: 13 },
  list:         { padding: 16, gap: 12, paddingBottom: 100 },
  empty:        { alignItems: 'center', paddingTop: 60, gap: 16 },
  emptyText:    { fontSize: 15 },
  emptyBtn:     { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  card:         { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  cardLeft:     { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  catIcon:      { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catInfo:      { flex: 1, gap: 4 },
  catNom:       { fontSize: 15, fontWeight: '700' },
  catDesc:      { fontSize: 12, lineHeight: 18 },
  sujetsBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginTop: 4 },
  sujetsText:   { fontSize: 11, fontWeight: '600' },
  cardActions:  { gap: 8 },
  iconAction:   { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  fab:          { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderBottomWidth: 0 },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:   { fontSize: 18, fontWeight: '800' },
  errorBox:     { borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1 },
  errorText:    { fontSize: 13 },
  label:        { fontSize: 13, marginBottom: 8 },
  input:        { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, marginBottom: 16, borderWidth: 1 },
  textarea:     { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  preview:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  previewNom:   { fontSize: 14, fontWeight: '700' },
  previewDesc:  { fontSize: 12, marginTop: 2 },
  modalActions: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  cancelBtn:    { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  cancelText:   { fontSize: 14, fontWeight: '600' },
  saveBtn:      { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  saveText:     { color: '#fff', fontSize: 14, fontWeight: '700' },
  deleteBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, borderWidth: 1.5 },
  deleteText:   { fontSize: 14, fontWeight: '700' },
});

export default CategoriesScreen;