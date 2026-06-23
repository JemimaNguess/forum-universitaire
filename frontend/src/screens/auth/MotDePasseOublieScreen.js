import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, semantic } from '../../components/theme';
import api from '../../services/api';

const MotDePasseOublieScreen = ({ navigation }) => {
  const c = useTheme();

  const [etape,        setEtape]        = useState(1); // 1: email, 2: code, 3: nouveau mdp
  const [email,        setEmail]        = useState('');
  const [code,         setCode]         = useState(['', '', '', '', '', '']);
  const [newPass,      setNewPass]      = useState('');
  const [confirmPass,  setConfirmPass]  = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [timer,        setTimer]        = useState(60);
  const [canResend,    setCanResend]    = useState(false);

  const inputs = useRef([]);

  useEffect(() => {
    if (etape === 2 && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, etape]);

  // ── Étape 1 : Envoyer le code ────────────────
  const envoyerCode = async () => {
    setError('');
    if (!email) {
      setError('Veuillez saisir votre email.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/password/forgot', { email });
      setEtape(2);
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du code.');
    } finally {
      setLoading(false);
    }
  };

  // ── Étape 2 : Vérifier le code ───────────────
  const handleChangeCode = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const verifierCode = async () => {
    setError('');
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Veuillez entrer le code complet.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/password/verify', { email, code: fullCode });
      setEtape(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  const renvoyerCode = async () => {
    if (!canResend) return;
    setTimer(60);
    setCanResend(false);
    setCode(['', '', '', '', '', '']);
    setError('');
    try {
      await api.post('/password/resend', { email });
    } catch {
      setError('Erreur lors du renvoi du code.');
    }
  };

  // ── Étape 3 : Nouveau mot de passe ───────────
  const reinitialiser = async () => {
    setError('');
    if (!newPass || !confirmPass) {
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
    setLoading(true);
    try {
      await api.post('/password/reset', {
        email,
        code:                  code.join(''),
        password:              newPass,
        password_confirmation: confirmPass,
      });
      navigation.navigate('Connexion');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la réinitialisation.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = () => {
    const m = Math.floor(timer / 60).toString().padStart(2, '0');
    const s = (timer % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >

      {/* Flèche retour */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => etape === 1 ? navigation.goBack() : setEtape(etape - 1)}
      >
        <Ionicons name="arrow-back" size={24} color={c.text} />
      </TouchableOpacity>

      {/* ── ÉTAPE 1 : Email ── */}
      {etape === 1 && (
        <>
          <View style={[styles.iconCircle, { backgroundColor: c.card }]}>
            <Ionicons name="lock-closed-outline" size={32} color={c.primary} />
          </View>

          <Text style={[styles.title, { color: c.text }]}>Mot de passe oublié</Text>
          <Text style={[styles.subtitle, { color: c.subtext }]}>
            Entrez votre email pour recevoir un code de réinitialisation.
          </Text>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: semantic.errorBg, borderColor: semantic.error }]}>
              <Text style={[styles.errorText, { color: semantic.error }]}>{error}</Text>
            </View>
          ) : null}

          <Text style={[styles.label, { color: c.subtext }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
            placeholder="votre.email@uiya.ci"
            placeholderTextColor={c.subtext}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: c.primary }]}
            onPress={envoyerCode}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Envoyer le code</Text>
            }
          </TouchableOpacity>
        </>
      )}

      {/* ── ÉTAPE 2 : Code OTP ── */}
      {etape === 2 && (
        <>
          <View style={[styles.iconCircle, { backgroundColor: c.card }]}>
            <Ionicons name="mail-outline" size={32} color={c.primary} />
          </View>

          <Text style={[styles.title, { color: c.text }]}>Vérifiez votre email</Text>
          <Text style={[styles.subtitle, { color: c.subtext }]}>
            Code envoyé à{'\n'}
            <Text style={[styles.emailText, { color: c.primary }]}>{email}</Text>
          </Text>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: semantic.errorBg, borderColor: semantic.error }]}>
              <Text style={[styles.errorText, { color: semantic.error }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => (inputs.current[index] = ref)}
                style={[
                  styles.codeInput,
                  { backgroundColor: c.card, borderColor: c.border, color: c.text },
                  digit ? { borderColor: c.primary } : null,
                ]}
                value={digit}
                onChangeText={text => handleChangeCode(text.slice(-1), index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectionColor={c.primary}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: c.primary }]}
            onPress={verifierCode}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Vérifier</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btnSecondary,
              { borderColor: canResend ? c.primary : c.border, backgroundColor: c.card }
            ]}
            onPress={renvoyerCode}
            disabled={!canResend}
          >
            <Text style={[styles.btnSecondaryText, { color: canResend ? c.primary : c.subtext }]}>
              Renvoyer le code ({formatTimer()})
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* ── ÉTAPE 3 : Nouveau mot de passe ── */}
      {etape === 3 && (
        <>
          <View style={[styles.iconCircle, { backgroundColor: c.card }]}>
            <Ionicons name="key-outline" size={32} color={c.primary} />
          </View>

          <Text style={[styles.title, { color: c.text }]}>Nouveau mot de passe</Text>
          <Text style={[styles.subtitle, { color: c.subtext }]}>
            Choisissez un nouveau mot de passe sécurisé.
          </Text>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: semantic.errorBg, borderColor: semantic.error }]}>
              <Text style={[styles.errorText, { color: semantic.error }]}>{error}</Text>
            </View>
          ) : null}

          <Text style={[styles.label, { color: c.subtext }]}>Nouveau mot de passe</Text>
          <View style={[styles.inputRow, { backgroundColor: c.card, borderColor: c.border }]}>
            <TextInput
              style={[styles.inputFlex, { color: c.text }]}
              placeholder="••••••••"
              placeholderTextColor={c.subtext}
              value={newPass}
              onChangeText={setNewPass}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={c.subtext} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: c.subtext }]}>Confirmer le mot de passe</Text>
          <View style={[styles.inputRow, { backgroundColor: c.card, borderColor: c.border }]}>
            <TextInput
              style={[styles.inputFlex, { color: c.text }]}
              placeholder="••••••••"
              placeholderTextColor={c.subtext}
              value={confirmPass}
              onChangeText={setConfirmPass}
              secureTextEntry={!showConfirm}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={c.subtext} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: c.primary }]}
            onPress={reinitialiser}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Réinitialiser le mot de passe</Text>
            }
          </TouchableOpacity>
        </>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1 },
  content:          { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  backBtn:          { marginBottom: 32 },
  iconCircle:       { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title:            { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  subtitle:         { fontSize: 14, lineHeight: 22, marginBottom: 28 },
  emailText:        { fontWeight: '600' },
  errorBox:         { borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1 },
  errorText:        { fontSize: 13 },
  label:            { fontSize: 14, marginBottom: 8 },
  input:            { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 20, borderWidth: 1 },
  inputRow:         { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1 },
  inputFlex:        { flex: 1, paddingVertical: 14, fontSize: 15 },
  codeContainer:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 8 },
  codeInput:        { flex: 1, height: 60, borderRadius: 12, borderWidth: 2, fontSize: 24, fontWeight: 'bold' },
  btnPrimary:       { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  btnText:          { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  btnSecondary:     { paddingVertical: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1.5 },
  btnSecondaryText: { fontSize: 14, fontWeight: '600' },
});

export default MotDePasseOublieScreen;