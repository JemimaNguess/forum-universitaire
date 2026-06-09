import React from 'react';
import { Alert, View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { ActionButton, Badge, Card, TeacherScreen, teacherColors } from './TeacherUi';
import { useTheme } from '../../components/theme';

const filters = ['Tous', 'PDF', 'Images', 'ZIP'];

const resources = [
  { title: 'Cours - Arbres binaires.pdf', type: 'PDF', course: 'systemes d\'exploitation linux', size: '2.4 Mo', downloads: 48 },
  { title: 'TD SQL jointures.zip', type: 'ZIP', course: 'devops', size: '6.1 Mo', downloads: 31 },
  { title: 'Schéma réseau campus.png', type: 'IMG', course: 'architecture des ordinateurs', size: '1.2 Mo', downloads: 19 },
  { title: 'Corrigé POO semaine 4.pdf', type: 'PDF', course: 'maitrise d\'exel', size: '950 Ko', downloads: 64 },
];

const RessourcesEnseignantScreen = () => {
  const theme = useTheme();

  const choisirFichier = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*', 'application/zip'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      Alert.alert('Fichier choisi', result.assets[0].name);
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
        />
      </View>

      <View style={local.filters}>
        {filters.map((filter, index) => (
          <View key={filter} style={[local.filterPill, { backgroundColor: theme.card, borderColor: theme.border }, index === 0 && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
            <Text style={[local.filterText, { color: theme.subtext }, index === 0 && { color: theme.white }]}>{filter}</Text>
          </View>
        ))}
      </View>

      <Card style={[local.uploadCard, { borderColor: theme.primary }] }>
        <View style={[local.uploadIcon, { backgroundColor: theme.primary + '22' }]}>
          <Ionicons name="cloud-upload-outline" size={30} color={theme.primary} />
        </View>
        <Text style={[local.uploadTitle, { color: theme.text }]}>Ajouter une ressource</Text>
        <Text style={[local.uploadText, { color: theme.subtext }]}>Formats acceptés: PDF, image ou ZIP.</Text>
        <ActionButton label="Choisir un fichier" icon="add-circle-outline" onPress={choisirFichier} />
      </Card>

      {resources.map((item) => (
        <Card key={item.title} style={local.resourceCard}>
          <View style={[local.fileIcon, item.type === 'PDF' ? local.pdfIcon : local.zipIcon]}>
            <Text style={local.fileText}>{item.type}</Text>
          </View>
          <View style={local.resourceInfo}>
            <Text style={[local.resourceTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[local.resourceMeta, { color: theme.subtext }]}>{item.course} · {item.size}</Text>
            <Text style={[local.downloads, { color: theme.primary }]}>{item.downloads} téléchargements</Text>
          </View>
          <View style={local.resourceActions}>
            <TouchableOpacity onPress={() => Alert.alert('Modification', item.title)}>
              <Ionicons name="create-outline" size={19} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert('Suppression', `${item.title} sera supprimé avec le backend.`)}>
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
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: teacherColors.white,
    borderWidth: 1,
    borderColor: teacherColors.line,
  },
  filterActive: {
    backgroundColor: teacherColors.violet,
    borderColor: teacherColors.violet,
  },
  filterText: {
    color: teacherColors.muted,
    fontWeight: '800',
    fontSize: 12,
  },
  filterTextActive: {
    color: teacherColors.white,
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
});

export default RessourcesEnseignantScreen;
