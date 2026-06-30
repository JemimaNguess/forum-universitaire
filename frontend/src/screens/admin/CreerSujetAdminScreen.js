import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  TextInput, Alert, Modal, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, semantic } from '../../components/theme';
import api from '../../services/api';

const CreerSujetAdminScreen = ({ navigation, route }) => {
  const c            = useTheme();
  const categorieId  = route.params?.categorieId  || null;
  const categorieNom = route.params?.categorieNom || null;

  const [titre,        setTitre]        = useState('');
  const [contenu,      setContenu]      = useState('');
  const [categories,   setCategories]   = useState([]);
  const [categorie,    setCategorie]    = useState(
    categorieId ? { id: categorieId, nom: categorieNom } : null
  );
  const [showPicker,   setShowPicker]   = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [loadingCats,  setLoadingCats]  = useState(true);
  const [error,        setError]        = useState('');

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCategories([]);
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const creer = async () => {
    setError('');

    if (!titre.trim()) {
      setError('Le titre est obligatoire.');
      return;
    }
    if (!contenu.trim()) {
      setError('Le contenu est obligatoire.');
      return;
    }
    if (!categorie) {
      setError('Veuillez sélectionner une catégorie.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/sujets', {
        titre:        titre.trim(),
        contenu:      contenu.trim(),
        categorie_id: categorie.id,
      });
      Alert.alert('Succès', 'Votre sujet a été créé !', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>Nouveau sujet</Text>
        <TouchableOpacity
          style={[styles.publierBtn, { backgroundColor: c.primary }]}
          onPress={creer}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.publierText}>Publier</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >

        {/* Erreur */}
        {error ? (
          <View style={[styles.errorBox, { backgroundColor: semantic.errorBg, borderColor: semantic.error }]}>
            <Text style={[styles.errorText, { color: semantic.error }]}>{error}</Text>
          </View>
        ) : null}

        {/* Catégorie */}
        <Text style={[styles.label, { color: c.subtext }]}>Catégorie *</Text>
        <TouchableOpacity
          style={[styles.pickerBtn, { backgroundColor: c.card, borderColor: categorie ? c.primary : c.border }]}
          onPress={() => setShowPicker(true)}
        >
          <Ionicons name="book-outline" size={18} color={c.primary} />
          <Text style={[styles.pickerText, { color: categorie ? c.text : c.subtext }]}>
            {categorie ? categorie.nom : 'Sélectionner une catégorie'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={c.subtext} />
        </TouchableOpacity>

        {/* Titre */}
        <Text style={[styles.label, { color: c.subtext }]}>Titre *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
          placeholder="Titre de votre sujet..."
          placeholderTextColor={c.subtext}
          value={titre}
          onChangeText={setTitre}
          maxLength={255}
        />
        <Text style={[styles.counter, { color: c.subtext }]}>{titre.length}/255</Text>

        {/* Contenu */}
        <Text style={[styles.label, { color: c.subtext }]}>Description *</Text>
        <TextInput
          style={[styles.textarea, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
          placeholder="Décrivez votre sujet en détail..."
          placeholderTextColor={c.subtext}
          value={contenu}
          onChangeText={setContenu}
          multiline
          textAlignVertical="top"
        />

        {/* Aperçu */}
        {titre || contenu ? (
          <View style={[styles.preview, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={[styles.previewLabel, { color: c.subtext }]}>Aperçu</Text>
            {categorie && (
              <View style={[styles.categorieBadge, { backgroundColor: c.card }]}>
                <Text style={[styles.categorieText, { color: c.primary }]}>{categorie.nom}</Text>
              </View>
            )}
            {titre ? (
              <Text style={[styles.previewTitre, { color: c.text }]}>{titre}</Text>
            ) : null}
            {contenu ? (
              <Text style={[styles.previewContenu, { color: c.subtext }]} numberOfLines={3}>
                {contenu}
              </Text>
            ) : null}
          </View>
        ) : null}

      </ScrollView>

      {/* Modal catégories */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
              <Text style={[styles.modalTitle, { color: c.text }]}>Choisir une catégorie</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={24} color={c.subtext} />
              </TouchableOpacity>
            </View>
            {loadingCats ? (
              <ActivityIndicator color={c.primary} style={{ padding: 20 }} />
            ) : (
              <FlatList
                data={categories}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.catItem,
                      { borderBottomColor: c.border },
                      categorie?.id === item.id && { backgroundColor: c.card }
                    ]}
                    onPress={() => {
                      setCategorie(item);
                      setShowPicker(false);
                    }}
                  >
                    <Ionicons name="book-outline" size={18} color={c.primary} />
                    <View style={styles.catItemInfo}>
                      <Text style={[styles.catItemNom, { color: c.text }]}>{item.nom}</Text>
                      {item.description && (
                        <Text style={[styles.catItemDesc, { color: c.subtext }]} numberOfLines={1}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                    {categorie?.id === item.id && (
                      <Ionicons name="checkmark" size={20} color={c.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container:      { flex: 1 },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, borderBottomWidth: 1 },
  headerTitle:    { fontSize: 17, fontWeight: '800' },
  publierBtn:     { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  publierText:    { color: '#fff', fontSize: 14, fontWeight: '700' },
  content:        { padding: 16, gap: 8, paddingBottom: 40 },
  errorBox:       { borderRadius: 10, padding: 12, borderWidth: 1, marginBottom: 8 },
  errorText:      { fontSize: 13 },
  label:          { fontSize: 13, marginBottom: 6, marginTop: 8 },
  input:          { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, borderWidth: 1 },
  textarea:       { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, borderWidth: 1, height: 160 },
  counter:        { fontSize: 11, textAlign: 'right', marginTop: 4 },
  pickerBtn:      { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1 },
  pickerText:     { flex: 1, fontSize: 15 },
  preview:        { borderRadius: 12, borderWidth: 1, padding: 16, gap: 8, marginTop: 8 },
  previewLabel:   { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  categorieBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  categorieText:  { fontSize: 11, fontWeight: '700' },
  previewTitre:   { fontSize: 16, fontWeight: '800' },
  previewContenu: { fontSize: 13, lineHeight: 20 },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent:   { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderBottomWidth: 0, maxHeight: '60%' },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  modalTitle:     { fontSize: 17, fontWeight: '700' },
  catItem:        { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1 },
  catItemInfo:    { flex: 1 },
  catItemNom:     { fontSize: 15, fontWeight: '600' },
  catItemDesc:    { fontSize: 12, marginTop: 2 },
});

export default CreerSujetAdminScreen;