import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator
} from 'react-native';
import { useTheme } from '../../components/theme';
import { semantic } from '../../components/theme';
import api from '../../services/api';

const InscriptionEtudiantScreen = ({ navigation }) => {
  const c = useTheme();

  const [nom,                 setNom]                 = useState('');
  const [prenom,              setPrenom]              = useState('');
  const [email,               setEmail]               = useState('');
  const [matricule,           setMatricule]           = useState('');
  const [filiere,             setFiliere]             = useState('');
  const [niveau,              setNiveau]              = useState('L3');
  const [motDePasse,          setMotDePasse]          = useState('');
  const [confirmerMotDePasse, setConfirmerMotDePasse] = useState('');
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirm,         setShowConfirm]         = useState(false);
  const [loading,             setLoading]             = useState(false);
  const [error,               setError]               = useState('');

  const niveaux = ['L1', 'L2', 'L3', 'M1', 'M2'];

  const handleInscription = async () => {
    setError('');

    if (!nom || !prenom || !email || !matricule || !filiere || !motDePasse || !confirmerMotDePasse) {
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
        nom,
        prenom,
        email,
        matricule,
        filiere,
        niveau,
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
        placeholder="Jemima"
        placeholderTextColor={c.subtext}
        value={prenom}
        onChangeText={setPrenom}
      />

      {/* Email */}
      <Text style={[styles.label, { color: c.subtext }]}>Email *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
        placeholder="jemima@email.com"
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
        placeholder="ex : NGUM1706070001"
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
      <TextInput
        style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
        placeholder="ex : Génie Logiciel"
        placeholderTextColor={c.subtext}
        value={filiere}
        onChangeText={setFiliere}
      />

      {/* Niveau */}
      <Text style={[styles.label, { color: c.subtext }]}>Niveau *</Text>
      <View style={styles.niveauxRow}>
        {niveaux.map(n => (
          <TouchableOpacity
            key={n}
            style={[
              styles.niveauBtn,
              { borderColor: c.border, backgroundColor: c.card },
              niveau === n && { backgroundColor: c.primary, borderColor: c.primary }
            ]}
            onPress={() => setNiveau(n)}
          >
            <Text style={[
              styles.niveauText,
              { color: c.subtext },
              niveau === n && { color: '#FFFFFF', fontWeight: '700' }
            ]}>
              {n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
          <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
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
          <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
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
  container:   { flex: 1 },
  content:     { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  backBtn:     { marginBottom: 24 },
  backText:    { fontSize: 24 },
  title:       { fontSize: 26, fontWeight: 'bold' },
  titleRole:   { fontSize: 18, marginBottom: 28 },
  errorBox:    { borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1 },
  errorText:   { fontSize: 14 },
  label:       { fontSize: 14, marginBottom: 8 },
  hint:        { fontSize: 12, marginTop: -10, marginBottom: 16 },
  input:       { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 16, borderWidth: 1 },
  inputRow:    { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1 },
  inputFlex:   { flex: 1, paddingVertical: 14, fontSize: 15 },
  eyeIcon:     { fontSize: 18, paddingLeft: 8 },
  niveauxRow:  { flexDirection: 'row', gap: 8, marginBottom: 16 },
  niveauBtn:   { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  niveauText:  { fontSize: 13 },
  btnPrimary:  { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 24 },
  btnText:     { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  loginRow:    { flexDirection: 'row', justifyContent: 'center' },
  loginText:   { fontSize: 14 },
  loginLink:   { fontSize: 14, fontWeight: '600' },
});

export default InscriptionEtudiantScreen;