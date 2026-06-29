import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator
} from 'react-native';
import { useTheme, semantic } from '../../components/theme';
import {Ionicons} from '@expo/vector-icons';
import api from '../../services/api';

const InscriptionEnseignantScreen = ({ navigation }) => {
  const c = useTheme();

  const [nom,                 setNom]                 = useState('');
  const [prenom,              setPrenom]              = useState('');
  const [email,               setEmail]               = useState('');
  const [matricule,           setMatricule]           = useState('');
  const [filiere,             setFiliere]             = useState('');
  const [motDePasse,          setMotDePasse]          = useState('');
  const [confirmerMotDePasse, setConfirmerMotDePasse] = useState('');
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirm,         setShowConfirm]         = useState(false);
  const [loading,             setLoading]             = useState(false);
  const [error,               setError]               = useState('');

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
        niveau:                'L1',
        password:              motDePasse,
        password_confirmation: confirmerMotDePasse,
        role:                  'enseignant',
      });

      navigation.navigate('VerificationEmail', { email });

    } catch (err) {
      const responseData = err.response?.data;
      const msg = responseData?.message
        || responseData?.errors
        || err.message
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
      <Text style={[styles.titleRole, { color: c.primary }]}>(Enseignant)</Text>

      {/* Info attente */}
      <View style={[styles.infoBox, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.infoText, { color: c.subtext }]}>
          ℹ️ Votre compte sera soumis à validation par l'administrateur avant activation.
        </Text>
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
      <Text style={[styles.label, { color: c.subtext }]}>Matricule enseignant *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
        placeholder="ex : ENS-2026-0001"
        placeholderTextColor={c.subtext}
        value={matricule}
        onChangeText={setMatricule}
        autoCapitalize="characters"
      />

      {/* Filière / Département */}
      <Text style={[styles.label, { color: c.subtext }]}>Département *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
        placeholder="ex : Informatique"
        placeholderTextColor={c.subtext}
        value={filiere}
        onChangeText={setFiliere}
      />

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
  container:   { flex: 1 },
  content:     { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  backBtn:     { marginBottom: 24 },
  backText:    { fontSize: 24 },
  title:       { fontSize: 26, fontWeight: 'bold' },
  titleRole:   { fontSize: 18, marginBottom: 16 },
  infoBox:     { borderRadius: 10, padding: 12, marginBottom: 20, borderWidth: 1 },
  infoText:    { fontSize: 13, lineHeight: 20 },
  errorBox:    { borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1 },
  errorText:   { fontSize: 14 },
  label:       { fontSize: 14, marginBottom: 8 },
  input:       { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 16, borderWidth: 1 },
  inputRow:    { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1 },
  inputFlex:   { flex: 1, paddingVertical: 14, fontSize: 15 },
  eyeIcon:     { fontSize: 18, paddingLeft: 8 },
  btnPrimary:  { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 24 },
  btnText:     { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  loginRow:    { flexDirection: 'row', justifyContent: 'center' },
  loginText:   { fontSize: 14 },
  loginLink:   { fontSize: 14, fontWeight: '600' },
});

export default InscriptionEnseignantScreen;