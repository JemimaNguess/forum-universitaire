import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator,
  Modal, FlatList
} from 'react-native';
import { useTheme, semantic } from '../../components/theme';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const filiereOptions = [
  { label: "Sélectionner votre filière", value: '', disabled: true },
  { label: 'Informatique option Génie Logiciel', value: 'IGL' },
  { label: 'Science Économique et de Gestion', value: 'SEG' },
  { label: 'Management des Projets', value: 'MP' },
  { label: 'Audit et Contrôle de Gestion', value: 'ACG' },
  { label: 'Finance Comptabilité', value: 'FC' },
  { label: 'Anglais', value: 'ANG' },
  { label: 'Droit', value: 'DROIT' },
  { label: 'Big Data', value: 'BD' },
  { label: 'Communication JTV', value: 'IJTV' },
  { label: 'Communication RH', value: 'IRH' },
];

const niveaux = [
  { label: "Sélectionner votre niveau d'étude", value: '', disabled: true },
  { label: 'Licence 1 ', value: 'L1' },
  { label: 'Licence 2 ', value: 'L2' },
  { label: 'Licence 3 ', value: 'L3' },
  { label: 'Master 1 ',  value: 'M1' },
  { label: 'Master 2 ',  value: 'M2' },
];

const InscriptionEtudiantScreen = ({ navigation }) => {
  const c = useTheme();

  const [nom,                 setNom]                 = useState('');
  const [prenom,              setPrenom]              = useState('');
  const [email,               setEmail]               = useState('');
  const [matricule,           setMatricule]           = useState('');
  const [filiere,             setFiliere]             = useState('');
  const [niveau,              setNiveau]              = useState('');
  const [motDePasse,          setMotDePasse]          = useState('');
  const [confirmerMotDePasse, setConfirmerMotDePasse] = useState('');
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirm,         setShowConfirm]         = useState(false);
  const [loading,             setLoading]             = useState(false);
  const [error,               setError]               = useState('');
  const [showFilierePicker,   setShowFilierePicker]  = useState(false);
  const [showNiveauPicker,    setShowNiveauPicker]   = useState(false);

  const niveauLabel = niveaux.find(n => n.value === niveau)?.label || "Sélectionner votre niveau d'étude";
  const filiereLabel = filiereOptions.find(f => f.value === filiere)?.label || "Sélectionner votre filière";

  const handleInscription = async () => {
    setError('');

    if (!nom || !prenom || !email || !matricule || !filiere || !niveau || !motDePasse || !confirmerMotDePasse) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (motDePasse !== confirmerMotDePasse) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (motDePasse.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/register', {
        nom, prenom, email, matricule, filiere, niveau,
        password:              motDePasse,
        password_confirmation: confirmerMotDePasse,
        role:                  'etudiant',
      });
      navigation.navigate('VerificationEmail', { email });
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.errors
        || 'Erreur lors de l\'inscription.';
      setError(typeof msg === 'object' ? Object.values(msg).flat().join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Flèche retour */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={[styles.backText, { color: c.text }]}>←</Text>
      </TouchableOpacity>

      {/* Titre */}
      <Text style={[styles.title, { color: c.text }]}>Créer mon compte</Text>
      <Text style={[styles.titleRole, { color: c.primary }]}>(Étudiant)</Text>

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
        placeholder="Moayé"
        placeholderTextColor={c.subtext}
        value={nom}
        onChangeText={setNom}
      />

      {/* Prénom */}
      <Text style={[styles.label, { color: c.subtext }]}>Prénom *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
        placeholder="N'guessan"
        placeholderTextColor={c.subtext}
        value={prenom}
        onChangeText={setPrenom}
      />

      {/* Email */}
      <Text style={[styles.label, { color: c.subtext }]}>Email *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
        placeholder="jemima@gmail.com"
        placeholderTextColor={c.subtext}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Matricule */}
      <Text style={[styles.label, { color: c.subtext }]}>Matricule UIYA *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
        placeholder="ex : XXXX1234567891"
        placeholderTextColor={c.subtext}
        value={matricule}
        onChangeText={setMatricule}
        autoCapitalize="characters"
      />
      <Text style={[styles.hint, { color: c.subtext }]}>
        Votre identifiant permanent UIYA
      </Text>

      {/* Filière */}
      <Text style={[styles.label, { color: c.subtext }]}>Filière *</Text>
      <TouchableOpacity
        style={[styles.pickerBtn, { backgroundColor: c.card, borderColor: c.border }]}
        onPress={() => setShowFilierePicker(true)}
      >
        <Text style={[styles.pickerBtnText, { color: filiere ? c.text : c.subtext }]}>
          {filiereLabel}
        </Text>
        <Ionicons name="chevron-down" size={18} color={c.subtext} />
      </TouchableOpacity>


      {/* Modal Picker */}
      <Modal
        visible={showFilierePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilierePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
              <Text style={[styles.modalTitle, { color: c.text }]}>Filière</Text>
              <TouchableOpacity onPress={() => setShowFilierePicker(false)}>
                <Ionicons name="close" size={24} color={c.subtext} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={filiereOptions.filter(f => !f.disabled)}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.niveauItem,
                    { borderBottomColor: c.border },
                    filiere === item.value && { backgroundColor: c.card }
                  ]}
                  onPress={() => {
                    setFiliere(item.value);
                    setShowFilierePicker(false);
                  }}
                >
                  <Text style={[styles.niveauItemText, { color: c.text }]}>
                    {item.label}
                  </Text>
                  {filiere === item.value && (
                    <Ionicons name="checkmark" size={20} color={c.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Niveau */}
      <Text style={[styles.label, { color: c.subtext }]}>Niveau *</Text>
      <TouchableOpacity
        style={[styles.pickerBtn, { backgroundColor: c.card, borderColor: c.border }]}
        onPress={() => setShowNiveauPicker(true)}
      >
        <Text style={[styles.pickerBtnText, { color: niveau ? c.text : c.subtext }]}>
          {niveauLabel}
        </Text>
        <Ionicons name="chevron-down" size={18} color={c.subtext} />
      </TouchableOpacity>

      {/* Modal Picker */}
      <Modal
        visible={showNiveauPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNiveauPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
              <Text style={[styles.modalTitle, { color: c.text }]}>Niveau d'étude</Text>
              <TouchableOpacity onPress={() => setShowNiveauPicker(false)}>
                <Ionicons name="close" size={24} color={c.subtext} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={niveaux.filter(n => !n.disabled)}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.niveauItem,
                    { borderBottomColor: c.border },
                    niveau === item.value && { backgroundColor: c.card }
                  ]}
                  onPress={() => {
                    setNiveau(item.value);
                    setShowNiveauPicker(false);
                  }}
                >
                  <Text style={[styles.niveauItemText, { color: c.text }]}>
                    {item.label}
                  </Text>
                  {niveau === item.value && (
                    <Ionicons name="checkmark" size={20} color={c.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Mot de passe */}
      <Text style={[styles.label, { color: c.subtext }]}>Mot de passe *</Text>
      <View style={[styles.inputRow, { backgroundColor: c.card, borderColor: c.border }]}>
        <TextInput
          style={[styles.inputFlex, { color: c.text }]}
          placeholder="••••••••"
          placeholderTextColor={c.subtext}
          value={motDePasse}
          onChangeText={setMotDePasse}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={c.subtext}
          />
        </TouchableOpacity>
      </View>

      {/* Confirmer mot de passe */}
      <Text style={[styles.label, { color: c.subtext }]}>Confirmer le mot de passe *</Text>
      <View style={[styles.inputRow, { backgroundColor: c.card, borderColor: c.border }]}>
        <TextInput
          style={[styles.inputFlex, { color: c.text }]}
          placeholder="••••••••"
          placeholderTextColor={c.subtext}
          value={confirmerMotDePasse}
          onChangeText={setConfirmerMotDePasse}
          secureTextEntry={!showConfirm}
        />
        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
          <Ionicons
            name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={c.subtext}
          />
        </TouchableOpacity>
      </View>

      {/* Bouton */}
      <TouchableOpacity
        style={[styles.btnPrimary, { backgroundColor: c.primary }]}
        onPress={handleInscription}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Créer mon compte</Text>
        }
      </TouchableOpacity>

      {/* Lien connexion */}
      <View style={styles.loginRow}>
        <Text style={[styles.loginText, { color: c.subtext }]}>
          Vous avez déjà un compte ?{' '}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Connexion')}>
          <Text style={[styles.loginLink, { color: c.primary }]}>Se connecter</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container:       { flex: 1 },
  content:         { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  backBtn:         { marginBottom: 24 },
  backText:        { fontSize: 24 },
  title:           { fontSize: 26, fontWeight: 'bold' },
  titleRole:       { fontSize: 18, marginBottom: 28 },
  errorBox:        { borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1 },
  errorText:       { fontSize: 14 },
  label:           { fontSize: 14, marginBottom: 8 },
  hint:            { fontSize: 12, marginTop: -10, marginBottom: 16 },
  input:           { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 16, borderWidth: 1 },
  inputRow:        { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1 },
  inputFlex:       { flex: 1, paddingVertical: 14, fontSize: 15 },
  pickerBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16, borderWidth: 1 },
  pickerBtnText:   { fontSize: 15, flex: 1 },
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent:    { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderBottomWidth: 0, maxHeight: '50%' },
  modalHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  modalTitle:      { fontSize: 17, fontWeight: '700' },
  niveauItem:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1 },
  niveauItemText:  { fontSize: 15 },
  btnPrimary:      { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 24 },
  btnText:         { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  loginRow:        { flexDirection: 'row', justifyContent: 'center' },
  loginText:       { fontSize: 14 },
  loginLink:       { fontSize: 14, fontWeight: '600' },
});

export default InscriptionEtudiantScreen;