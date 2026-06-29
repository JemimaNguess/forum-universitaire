import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator
} from 'react-native';
import { useTheme, semantic } from '../../components/theme';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const ConnexionScreen = ({ navigation }) => {
  const c              = useTheme();
  const { login }      = useAuth();

  const [email,       setEmail]       = useState('');
  const [motDePasse,  setMotDePasse]  = useState('');
  const [showPassword,setShowPassword]= useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const handleConnexion = async () => {
    setError('');

    if (!email || !motDePasse) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    const result = await login(email, motDePasse);

    if (!result.success) {
      setError(result.message);
    }

    setLoading(false);
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
      <Text style={[styles.title, { color: c.text }]}>Se connecter</Text>
      <Text style={[styles.subtitle, { color: c.subtext }]}>
        Bienvenue de retour ! Connectez-vous pour continuer.
      </Text>

      {/* Erreur */}
      {error ? (
        <View style={[styles.errorBox, { backgroundColor: semantic.errorBg, borderColor: semantic.error }]}>
          <Text style={[styles.errorText, { color: semantic.error }]}>{error}</Text>
        </View>
      ) : null}

      {/* Email */}
      <Text style={[styles.label, { color: c.subtext }]}>Email</Text>
      <TextInput
        style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
        placeholder="jemima@gmail.com"
        placeholderTextColor={c.subtext}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Mot de passe */}
      <Text style={[styles.label, { color: c.subtext }]}>Mot de passe</Text>
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
          <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color={c.subtext} />
        </TouchableOpacity>
      </View>

      {/* Mot de passe oublié */}
      <TouchableOpacity
        style={styles.forgotBtn}
        onPress={() => navigation.navigate('MotDePasseOublie')}
      >
        <Text style={[styles.forgotText, { color: c.primary }]}>Mot de passe oublié ?</Text>
      </TouchableOpacity>

      {/* Bouton connexion */}
      <TouchableOpacity
        style={[styles.btnPrimary, { backgroundColor: c.primary }]}
        onPress={handleConnexion}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Se connecter</Text>
        }
      </TouchableOpacity>


      {/* Lien inscription */}
      <View style={styles.registerRow}>
        <Text style={[styles.registerText, { color: c.subtext }]}>
          Vous n'avez pas de compte ?{' '}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('ChoixRole')}>
          <Text style={[styles.registerLink, { color: c.primary }]}>S'inscrire</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container:      { flex: 1 },
  content:        { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  backBtn:        { marginBottom: 24 },
  backText:       { fontSize: 24 },
  title:          { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle:       { fontSize: 15, marginBottom: 32, lineHeight: 22 },
  errorBox:       { borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1 },
  errorText:      { fontSize: 14 },
  label:          { fontSize: 14, marginBottom: 8 },
  input:          { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 16, borderWidth: 1 },
  inputRow:       { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 16, marginBottom: 8, borderWidth: 1 },
  inputFlex:      { flex: 1, paddingVertical: 14, fontSize: 15 },
  eyeIcon:        { fontSize: 18, paddingLeft: 8 },
  forgotBtn:      { alignSelf: 'flex-end', marginBottom: 28 },
  forgotText:     { fontSize: 14, fontWeight: '600' },
  btnPrimary:     { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  btnText:        { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  separatorRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  separatorLine:  { flex: 1, height: 1 },
  separatorText:  { fontSize: 13 },
  socialRow:      { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 32 },
  socialBtn:      { width: 52, height: 52, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  socialIcon:     { fontSize: 20, fontWeight: 'bold' },
  registerRow:    { flexDirection: 'row', justifyContent: 'center' },
  registerText:   { fontSize: 14 },
  registerLink:   { fontSize: 14, fontWeight: '600' },
});

export default ConnexionScreen;