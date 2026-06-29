import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert,
  ActivityIndicator, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, semantic } from '../../components/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ProfilAdminScreen = ({navigation}) => {
  const c              = useTheme();
  const { user, logout } = useAuth();

  const [showInfoModal,  setShowInfoModal]  = useState(false);
  const [showPassModal,  setShowPassModal]  = useState(false);
  const [nom,            setNom]            = useState(user?.nom    || '');
  const [prenom,         setPrenom]         = useState(user?.prenom || '');
  const [bio,            setBio]            = useState(user?.bio    || '');
  const [ancienPass,     setAncienPass]     = useState('');
  const [newPass,        setNewPass]        = useState('');
  const [confirmPass,    setConfirmPass]    = useState('');
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState('');

  const saveInfo = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put('/profile', { nom, prenom, bio });
      setShowInfoModal(false);
      Alert.alert('Succès', 'Informations mises à jour.');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!ancienPass || !newPass || !confirmPass) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (newPass !== confirmPass) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (newPass.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.put('/change-password', {
        ancien_password:       ancienPass,
        password:              newPass,
        password_confirmation: confirmPass,
      });
      setShowPassModal(false);
      setAncienPass('');
      setNewPass('');
      setConfirmPass('');
      Alert.alert('Succès', 'Mot de passe modifié.');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du changement.');
    } finally {
      setSaving(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: logout },
      ]
    );
  };

  const menuItems = [
  { icon: 'person-outline',        label: 'Informations personnelles', onPress: () => { setError(''); setShowInfoModal(true); } },
  { icon: 'lock-closed-outline',   label: 'Changer le mot de passe',   onPress: () => { setError(''); setShowPassModal(true); } },
  { icon: 'settings-outline',      label: 'Paramètres',                onPress: () => navigation.navigate('Parametres') },
  { icon: 'shield-outline',        label: 'Sécurité',                  onPress: () => navigation.navigate('Securite') },
  { icon: 'notifications-outline', label: 'Notifications',             onPress: () => navigation.navigate('Notifications') },
  { icon: 'time-outline',          label: 'Historique des actions',    onPress: () => navigation.navigate('Historique') },
];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
    >

      {/* Header profil */}
      <View style={[styles.profileHeader, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <View style={[styles.avatar, { backgroundColor: c.card }]}>
          <Text style={[styles.avatarText, { color: c.primary }]}>
            {user?.prenom?.[0] || 'A'}
          </Text>
        </View>
        <Text style={[styles.profileName, { color: c.text }]}>
          {user?.prenom} {user?.nom}
        </Text>
        <View style={[styles.adminBadge, { backgroundColor: c.card }]}>
          <Ionicons name="shield-checkmark" size={14} color={c.primary} />
          <Text style={[styles.adminBadgeText, { color: c.primary }]}>Administrateur</Text>
        </View>
        <Text style={[styles.profileEmail, { color: c.subtext }]}>{user?.email}</Text>
      </View>

      {/* Menu */}
      <View style={[styles.menuCard, { backgroundColor: c.surface, borderColor: c.border }]}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.menuItem,
              index < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }
            ]}
            onPress={item.onPress}
          >
            <View style={[styles.menuIcon, { backgroundColor: c.card }]}>
              <Ionicons name={item.icon} size={18} color={c.primary} />
            </View>
            <Text style={[styles.menuLabel, { color: c.text }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={c.subtext} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Déconnexion */}
      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: semantic.error }]}
        onPress={confirmLogout}
      >
        <Ionicons name="log-out-outline" size={18} color={semantic.error} />
        <Text style={[styles.logoutText, { color: semantic.error }]}>Se déconnecter</Text>
      </TouchableOpacity>

      {/* Modal Informations */}
      <Modal visible={showInfoModal} animationType="slide" transparent onRequestClose={() => setShowInfoModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.text }]}>Informations personnelles</Text>
              <TouchableOpacity onPress={() => setShowInfoModal(false)}>
                <Ionicons name="close" size={24} color={c.subtext} />
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: semantic.errorBg, borderColor: semantic.error }]}>
                <Text style={[styles.errorText, { color: semantic.error }]}>{error}</Text>
              </View>
            ) : null}

            <Text style={[styles.label, { color: c.subtext }]}>Nom</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
              value={nom}
              onChangeText={setNom}
              placeholder="Nom"
              placeholderTextColor={c.subtext}
            />

            <Text style={[styles.label, { color: c.subtext }]}>Prénom</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
              value={prenom}
              onChangeText={setPrenom}
              placeholder="Prénom"
              placeholderTextColor={c.subtext}
            />

            <Text style={[styles.label, { color: c.subtext }]}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textarea, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Votre biographie..."
              placeholderTextColor={c.subtext}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: c.border, backgroundColor: c.card }]}
                onPress={() => setShowInfoModal(false)}
              >
                <Text style={[styles.cancelText, { color: c.subtext }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: c.primary }]}
                onPress={saveInfo}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveText}>Enregistrer</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Mot de passe */}
      <Modal visible={showPassModal} animationType="slide" transparent onRequestClose={() => setShowPassModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.text }]}>Changer le mot de passe</Text>
              <TouchableOpacity onPress={() => setShowPassModal(false)}>
                <Ionicons name="close" size={24} color={c.subtext} />
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: semantic.errorBg, borderColor: semantic.error }]}>
                <Text style={[styles.errorText, { color: semantic.error }]}>{error}</Text>
              </View>
            ) : null}

            <Text style={[styles.label, { color: c.subtext }]}>Ancien mot de passe</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
              value={ancienPass}
              onChangeText={setAncienPass}
              placeholder="••••••••"
              placeholderTextColor={c.subtext}
              secureTextEntry
            />

            <Text style={[styles.label, { color: c.subtext }]}>Nouveau mot de passe</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
              value={newPass}
              onChangeText={setNewPass}
              placeholder="••••••••"
              placeholderTextColor={c.subtext}
              secureTextEntry
            />

            <Text style={[styles.label, { color: c.subtext }]}>Confirmer le mot de passe</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
              value={confirmPass}
              onChangeText={setConfirmPass}
              placeholder="••••••••"
              placeholderTextColor={c.subtext}
              secureTextEntry
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: c.border, backgroundColor: c.card }]}
                onPress={() => setShowPassModal(false)}
              >
                <Text style={[styles.cancelText, { color: c.subtext }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: c.primary }]}
                onPress={savePassword}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveText}>Modifier</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container:       { flex: 1 },
  content:         { paddingBottom: 40 },
  profileHeader:   { alignItems: 'center', padding: 30, paddingTop: 60, borderBottomWidth: 1, gap: 8 },
  avatar:          { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarText:      { fontSize: 32, fontWeight: '800' },
  profileName:     { fontSize: 22, fontWeight: '800' },
  adminBadge:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  adminBadgeText:  { fontSize: 13, fontWeight: '700' },
  profileEmail:    { fontSize: 13 },
  menuCard:        { margin: 16, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  menuItem:        { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuIcon:        { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel:       { flex: 1, fontSize: 15, fontWeight: '500' },
  logoutBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 16, padding: 14, borderRadius: 12, borderWidth: 1.5 },
  logoutText:      { fontSize: 15, fontWeight: '700' },
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent:    { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderBottomWidth: 0 },
  modalHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:      { fontSize: 18, fontWeight: '800' },
  errorBox:        { borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1 },
  errorText:       { fontSize: 13 },
  label:           { fontSize: 13, marginBottom: 8 },
  input:           { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, marginBottom: 16, borderWidth: 1 },
  textarea:        { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  modalActions:    { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn:       { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  cancelText:      { fontSize: 14, fontWeight: '600' },
  saveBtn:         { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  saveText:        { color: '#fff', fontSize: 14, fontWeight: '700' },
});

export default ProfilAdminScreen;