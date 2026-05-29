import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator
} from 'react-native';
import { useTheme, semantic } from '../../components/theme';
import api from '../../services/api';

const VerificationEmailScreen = ({ navigation, route }) => {
  const c     = useTheme();
  const email = route.params?.email || '';

  const [code,      setCode]      = useState(['', '', '', '', '', '']);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [timer,     setTimer]     = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (text, index) => {
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

  const handleVerifier = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Veuillez entrer le code complet.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/verify-email', { email, code: fullCode });
      navigation.navigate('Connexion');
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setTimer(60);
    setCanResend(false);
    setCode(['', '', '', '', '', '']);
    setError('');
    try {
      await api.post('/resend-code', { email });
    } catch {
      setError('Erreur lors du renvoi du code.');
    }
  };

  const formatTimer = () => {
    const m = Math.floor(timer / 60).toString().padStart(2, '0');
    const s = (timer % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>

      {/* Flèche retour */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={[styles.backText, { color: c.text }]}>←</Text>
      </TouchableOpacity>

      {/* Titre */}
      <Text style={[styles.title, { color: c.text }]}>Vérifiez votre email</Text>
      <Text style={[styles.subtitle, { color: c.subtext }]}>
        Nous avons envoyé un code à 6 chiffres à{'\n'}
        <Text style={[styles.emailText, { color: c.primary }]}>{email}</Text>
      </Text>

      {/* Erreur */}
      {error ? (
        <View style={[styles.errorBox, { backgroundColor: semantic.errorBg, borderColor: semantic.error }]}>
          <Text style={[styles.errorText, { color: semantic.error }]}>{error}</Text>
        </View>
      ) : null}

      {/* Champs code */}
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
            onChangeText={text => handleChange(text.slice(-1), index)}
            onKeyPress={e => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            selectionColor={c.primary}
          />
        ))}
      </View>

      {/* Timer */}
      <View style={styles.timerRow}>
        <Text style={[styles.timerText, { color: c.subtext }]}>Code valide </Text>
        <Text style={[styles.timerCount, { color: c.primary }]}>{formatTimer()}</Text>
        <Text style={[styles.timerText, { color: c.subtext }]}> ⏱</Text>
      </View>

      {/* Bouton Vérifier */}
      <TouchableOpacity
        style={[styles.btnPrimary, { backgroundColor: c.primary }]}
        onPress={handleVerifier}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Vérifier</Text>
        }
      </TouchableOpacity>

      {/* Renvoyer */}
      <TouchableOpacity
        style={[
          styles.btnSecondary,
          { borderColor: canResend ? c.primary : c.border, backgroundColor: c.card }
        ]}
        onPress={handleResend}
        disabled={!canResend}
      >
        <Text style={[styles.btnSecondaryText, { color: canResend ? c.primary : c.subtext }]}>
          Renvoyer le code ({formatTimer()})
        </Text>
      </TouchableOpacity>

      {/* Modifier email */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={[styles.modifierEmail, { color: c.primary }]}>Modifier mon email</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  backBtn:          { marginBottom: 32 },
  backText:         { fontSize: 24 },
  title:            { fontSize: 26, fontWeight: 'bold', marginBottom: 12 },
  subtitle:         { fontSize: 15, marginBottom: 32, lineHeight: 22 },
  emailText:        { fontWeight: '600' },
  errorBox:         { borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1 },
  errorText:        { fontSize: 14 },
  codeContainer:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 8 },
  codeInput:        { flex: 1, height: 60, borderRadius: 12, borderWidth: 2, fontSize: 24, fontWeight: 'bold' },
  timerRow:         { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 28 },
  timerText:        { fontSize: 14 },
  timerCount:       { fontSize: 14, fontWeight: '600' },
  btnPrimary:       { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  btnText:          { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  btnSecondary:     { paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginBottom: 20, borderWidth: 1.5 },
  btnSecondaryText: { fontSize: 15, fontWeight: '600' },
  modifierEmail:    { fontSize: 14, textAlign: 'center', fontWeight: '600' },
});

export default VerificationEmailScreen;