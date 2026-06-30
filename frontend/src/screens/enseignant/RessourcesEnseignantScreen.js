import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { ActionButton, Badge, Card, TeacherScreen, teacherColors } from './TeacherUi';
import { useTheme } from '../../components/theme';
import api from '../../services/api';

const filters = ['Tous', 'PDF', 'IMG', 'ZIP'];

const RessourcesEnseignantScreen = () => {
  const theme = useTheme();
  const [resources, setResources] = useState([]);
  const [filtersSelected, setFiltersSelected] = useState('Tous');
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    loadResources();
    loadCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [categories]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ressources', {
        params: {
          categorie_id: selectedCategory?.id || null,
          search: search || null,
        },
      });
      setResources(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Erreur chargement ressources :', error);
      Alert.alert('Erreur', 'Impossible de charger les ressources.');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Erreur chargement catégories :', error);
    }
  };

  const getTypeLabel = (mime) => {
    if (!mime) return 'FICHIER';
    if (mime.includes('pdf')) return 'PDF';
    if (mime.includes('zip')) return 'ZIP';
    if (mime.includes('image')) return 'IMG';
    return 'FICHIER';
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'Taille inconnue';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} Ko`;
    return `${(kb / 1024).toFixed(1)} Mo`;
  };

  const filteredResources = resources.filter((item) => {
    const typeLabel = getTypeLabel(item.type_mime);
    const matchesFilter = filtersSelected === 'Tous' || typeLabel === filtersSelected;
    const matchesCategory = !selectedCategory || item.categorie_id === selectedCategory.id;
    const haystack = `${item.titre || item.name || ''} ${item.categorie?.nom || ''}`.toLowerCase();
    const matchesSearch = search.length === 0 || haystack.includes(search.toLowerCase());
    return matchesFilter && matchesCategory && matchesSearch;
  });

  const choisirFichier = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/zip'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'cancel' || result.canceled) return;

      const file = result.assets?.[0] ?? result;
      await uploadResource(file);
    } catch (error) {
      console.error('Erreur sélection fichier :', error);
      Alert.alert('Erreur', 'Impossible de sélectionner le fichier.');
    }
  };

  const uploadResource = async (file) => {
    if (!file || !file.uri) return;
    const category = selectedCategory || categories[0];
    if (!category) {
      Alert.alert('Catégorie manquante', 'Veuillez d’abord charger une catégorie ou contacter un administrateur.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('titre', file.name || 'Ressource');
      formData.append('categorie_id', category.id);
      formData.append('fichier', {
        uri: file.uri,
        name: file.name || `resource-${Date.now()}`,
        type: file.mimeType || file.type || 'application/octet-stream',
      });

      await api.post('/ressources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Succès', 'La ressource a bien été téléchargée.');
      await loadResources();
    } catch (error) {
      console.error('Erreur upload ressource :', error);
      Alert.alert('Erreur', 'Impossible de téléverser la ressource. Vérifiez le format et réessayez.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResource = async (id) => {
    try {
      await api.delete(`/ressources/${id}`);
      setResources((prev) => prev.filter((item) => item.id !== id));
      Alert.alert('Succès', 'La ressource a été supprimée.');
    } catch (error) {
      console.error('Erreur suppression ressource :', error);
      Alert.alert('Erreur', 'Impossible de supprimer cette ressource.');
    }
  };

  const handleDownloadResource = async (resource) => {
    if (!resource?.id) return;
    setDownloadingId(resource.id);
    try {
      const response = await api.get(`/ressources/${resource.id}`);
      const baseUrl = api.defaults.baseURL.replace(/\/api$/, '');
      const resourceUrl = `${baseUrl}/storage/${response.data.fichier}`;
      await Linking.openURL(resourceUrl);
      await loadResources();
    } catch (error) {
      console.error('Erreur téléchargement ressource :', error);
      Alert.alert('Erreur', 'Impossible de télécharger cette ressource.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <TeacherScreen title="Mes ressources" subtitle="PDF, images et ZIP jusqu'à 10 Mo">
      <View style={[local.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }] }>
        <Ionicons name="search-outline" size={18} color={theme.subtext} />
        <TextInput
          placeholder="Rechercher une ressource..."
          placeholderTextColor={theme.subtext}
          style={[local.searchInput, { color: theme.text }]}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={local.filters}>
        {filters.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              local.filterPill,
              { backgroundColor: theme.card, borderColor: theme.border },
              item === filtersSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
            onPress={() => setFiltersSelected(item)}
          >
            <Text style={[local.filterText, item === filtersSelected && { color: theme.white }]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={local.categoryRow} contentContainerStyle={local.categoryRowContent}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              local.categoryPill,
              { backgroundColor: theme.card, borderColor: theme.border },
              selectedCategory?.id === category.id && { backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[local.categoryText, selectedCategory?.id === category.id && { color: theme.white }]}> {category.nom || category.name} </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Card style={[local.uploadCard, { borderColor: theme.primary }] }>
        <View style={[local.uploadIcon, { backgroundColor: theme.primary + '22' }]}>
          <Ionicons name="cloud-upload-outline" size={30} color={theme.primary} />
        </View>
        <Text style={[local.uploadTitle, { color: theme.text }]}>Ajouter une ressource</Text>
        <Text style={[local.uploadText, { color: theme.subtext }]}>Formats acceptés : PDF, image ou ZIP.</Text>
        <ActionButton
          label={uploading ? 'Téléversement...' : 'Choisir un fichier'}
          icon="add-circle-outline"
          onPress={choisirFichier}
          disabled={uploading}
        />
      </Card>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
      ) : filteredResources.length === 0 ? (
        <Text style={[local.emptyText, { color: theme.subtext }]}>Aucune ressource trouvée.</Text>
      ) : null}

      {filteredResources.map((item) => (
        <Card key={item.id} style={local.resourceCard}>
          <View style={[local.fileIcon, getTypeLabel(item.type_mime) === 'PDF' ? local.pdfIcon : local.zipIcon]}>
            <Text style={local.fileText}>{getTypeLabel(item.type_mime)}</Text>
          </View>
          <View style={local.resourceInfo}>
            <Text style={[local.resourceTitle, { color: theme.text }]}>{item.titre || item.name}</Text>
            <Text style={[local.resourceMeta, { color: theme.subtext }]}> 
              {item.categorie?.nom || 'Sans catégorie'} · {formatSize(item.taille)}
            </Text>
            <Text style={[local.downloads, { color: theme.primary }]}>{item.nb_telechargements ?? 0} téléchargements</Text>
          </View>
          <View style={local.resourceActions}>
            <TouchableOpacity onPress={() => handleDownloadResource(item)} disabled={downloadingId === item.id}>
              {downloadingId === item.id ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Ionicons name="download-outline" size={19} color={theme.primary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteResource(item.id)}>
              <Ionicons name="trash-outline" size={19} color={teacherColors.danger} />
            </TouchableOpacity>
          </View>
        </Card>
      ))}
    </TeacherScreen>
  );
};

const local = StyleSheet.create({
  searchBox: {
    minHeight: 48,
    borderRadius: 15,
    backgroundColor: teacherColors.white,
    borderWidth: 1,
    borderColor: teacherColors.line,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: teacherColors.ink,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: teacherColors.white,
    borderWidth: 1,
    borderColor: teacherColors.line,
  },
  filterText: {
    color: teacherColors.muted,
    fontWeight: '800',
    fontSize: 12,
  },
  categoryRow: {
    marginBottom: 16,
  },
  categoryRowContent: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 10,
    borderWidth: 1,
    borderColor: teacherColors.line,
  },
  categoryText: {
    color: teacherColors.muted,
    fontWeight: '800',
    fontSize: 12,
  },
  uploadCard: {
    alignItems: 'center',
    gap: 9,
    borderStyle: 'dashed',
    borderColor: '#BDA9F5',
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: teacherColors.violetSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: {
    color: teacherColors.ink,
    fontWeight: '900',
    fontSize: 16,
  },
  uploadText: {
    color: teacherColors.muted,
    marginBottom: 4,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fileIcon: {
    width: 46,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfIcon: {
    backgroundColor: '#FFE8E8',
  },
  zipIcon: {
    backgroundColor: teacherColors.violetSoft,
  },
  fileText: {
    color: teacherColors.violetDark,
    fontWeight: '900',
    fontSize: 11,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    color: teacherColors.ink,
    fontWeight: '900',
  },
  resourceMeta: {
    color: teacherColors.muted,
    marginTop: 4,
    fontSize: 12,
  },
  downloads: {
    color: teacherColors.success,
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
  },
  resourceActions: {
    gap: 14,
  },
  emptyText: {
    marginTop: 20,
    textAlign: 'center',
  },
});

export default RessourcesEnseignantScreen;
