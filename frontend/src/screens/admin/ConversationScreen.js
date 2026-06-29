import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  TextInput, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useTheme, semantic } from '../../components/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ConversationScreen = ({ navigation, route }) => {
  const c        = useTheme();
  const { user } = useAuth();
  const userId   = route.params?.userId;
  const userName = route.params?.userName || 'Conversation';

  const [messages,    setMessages]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [contenu,     setContenu]     = useState('');
  const [sending,     setSending]     = useState(false);
  const [recording,   setRecording]   = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime,  setRecordTime]  = useState(0);
  const [playingId,   setPlayingId]   = useState(null);
  const [sound,       setSound]       = useState(null);

  const scrollRef    = useRef(null);
  const recordTimer  = useRef(null);

  const load = async () => {
    try {
      const res = await api.get(`/messages-prives/${userId}`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const envoyer = async () => {
    if (!contenu.trim()) return;
    setSending(true);
    try {
      const res = await api.post('/messages-prives', {
        destinataire_id: userId,
        contenu,
      });
      setMessages(curr => [...curr, res.data]);
      setContenu('');
    } catch {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message.');
    } finally {
      setSending(false);
    }
  };

  const demarrerEnregistrement = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Autorisez l\'accès au micro pour envoyer une note vocale.');
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(rec);
      setIsRecording(true);
      setRecordTime(0);

      recordTimer.current = setInterval(() => {
        setRecordTime(t => t + 1);
      }, 1000);

    } catch {
      Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement.');
    }
  };

  const arreterEtEnvoyer = async () => {
    if (!recording) return;

    clearInterval(recordTimer.current);
    setIsRecording(false);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const duree = recordTime;
      setRecording(null);

      if (duree < 1) return;

      setSending(true);

      const formData = new FormData();
      formData.append('destinataire_id', userId);
      formData.append('duree', duree.toString());
      formData.append('fichier', {
        uri,
        name: 'vocal.m4a',
        type: 'audio/m4a',
      });

      const res = await api.post('/messages-prives/vocal', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessages(curr => [...curr, res.data]);

    } catch {
      Alert.alert('Erreur', 'Impossible d\'envoyer la note vocale.');
    } finally {
      setSending(false);
      setRecordTime(0);
    }
  };

  const annulerEnregistrement = async () => {
    clearInterval(recordTimer.current);
    setIsRecording(false);
    setRecordTime(0);
    if (recording) {
      try { await recording.stopAndUnloadAsync(); } catch {}
      setRecording(null);
    }
  };

  const lireVocal = async (msg) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      if (playingId === msg.id) {
        setPlayingId(null);
        return;
      }

      const url = `${api.defaults.baseURL.replace('/api', '')}/storage/${msg.fichier}`;
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
      setSound(newSound);
      setPlayingId(msg.id);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) setPlayingId(null);
      });

      await newSound.playAsync();

    } catch {
      Alert.alert('Erreur', 'Impossible de lire la note vocale.');
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >

      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <View style={[styles.headerAvatar, { backgroundColor: c.card }]}>
          <Text style={[styles.headerAvatarText, { color: c.primary }]}>{userName?.[0] || 'U'}</Text>
        </View>
        <Text style={[styles.headerTitle, { color: c.text }]} numberOfLines={1}>{userName}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('InfoConversation', { userId, userName })}>
          <Ionicons name="information-circle-outline" size={24} color={c.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.messagesList}>
        {messages.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="chatbubble-outline" size={40} color={c.subtext} />
            <Text style={[styles.emptyText, { color: c.subtext }]}>Aucun message. Dites bonjour !</Text>
          </View>
        ) : (
          messages.map(msg => {
            const estMoi = msg.expediteur_id === user?.id;
            return (
              <View key={msg.id} style={[styles.messageRow, estMoi ? styles.messageRowMoi : styles.messageRowAutre]}>
                <View style={[
                  styles.bulle,
                  estMoi ? { backgroundColor: c.primary, borderTopRightRadius: 4 } : { backgroundColor: c.card, borderTopLeftRadius: 4 }
                ]}>
                  {msg.type === 'vocal' ? (
                    <TouchableOpacity style={styles.vocalRow} onPress={() => lireVocal(msg)}>
                      <Ionicons name={playingId === msg.id ? 'pause-circle' : 'play-circle'} size={32} color={estMoi ? '#fff' : c.primary} />
                      <View style={[styles.vocalBar, { backgroundColor: estMoi ? 'rgba(255,255,255,0.4)' : c.border }]} />
                      <Text style={[styles.vocalDuree, { color: estMoi ? '#fff' : c.text }]}>{formatTime(msg.duree || 0)}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={[styles.messageTexte, { color: estMoi ? '#fff' : c.text }]}>{msg.contenu}</Text>
                  )}
                  <Text style={[styles.messageHeure, { color: estMoi ? 'rgba(255,255,255,0.7)' : c.subtext }]}>
                    {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {isRecording ? (
        <View style={[styles.recordingZone, { backgroundColor: c.surface, borderTopColor: c.border }]}>
          <TouchableOpacity onPress={annulerEnregistrement}>
            <Ionicons name="trash-outline" size={24} color={semantic.error} />
          </TouchableOpacity>
          <View style={styles.recordingInfo}>
            <View style={[styles.recordingDot, { backgroundColor: semantic.error }]} />
            <Text style={[styles.recordingTime, { color: c.text }]}>{formatTime(recordTime)}</Text>
            <Text style={[styles.recordingLabel, { color: c.subtext }]}>Enregistrement...</Text>
          </View>
          <TouchableOpacity style={[styles.sendVocalBtn, { backgroundColor: c.primary }]} onPress={arreterEtEnvoyer}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.inputZone, { backgroundColor: c.surface, borderTopColor: c.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
            placeholder="Écrire un message..."
            placeholderTextColor={c.subtext}
            value={contenu}
            onChangeText={setContenu}
            multiline
          />
          {contenu.trim() ? (
            <TouchableOpacity style={[styles.sendBtn, { backgroundColor: c.primary }]} onPress={envoyer} disabled={sending}>
              {sending ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="send" size={18} color="#fff" />}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.micBtn, { backgroundColor: c.primary }]} onPress={demarrerEnregistrement}>
              <Ionicons name="mic" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container:       { flex: 1 },
  center:          { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:          { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, paddingTop: 50, borderBottomWidth: 1 },
  headerAvatar:    { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerAvatarText:{ fontWeight: '800', fontSize: 14 },
  headerTitle:     { flex: 1, fontSize: 16, fontWeight: '700' },
  messagesList:    { padding: 16, gap: 8, paddingBottom: 10 },
  empty:           { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText:       { fontSize: 14 },
  messageRow:      { flexDirection: 'row', marginBottom: 4 },
  messageRowMoi:   { justifyContent: 'flex-end' },
  messageRowAutre: { justifyContent: 'flex-start' },
  bulle:           { maxWidth: '78%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  messageTexte:    { fontSize: 14, lineHeight: 20 },
  messageHeure:    { fontSize: 10, alignSelf: 'flex-end' },
  vocalRow:        { flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 160 },
  vocalBar:        { flex: 1, height: 3, borderRadius: 2 },
  vocalDuree:      { fontSize: 12, fontWeight: '600' },
  inputZone:       { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, borderTopWidth: 1 },
  input:           { flex: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, borderWidth: 1, maxHeight: 100 },
  sendBtn:         { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  micBtn:          { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  recordingZone:   { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderTopWidth: 1 },
  recordingInfo:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  recordingDot:    { width: 10, height: 10, borderRadius: 5 },
  recordingTime:   { fontSize: 15, fontWeight: '700' },
  recordingLabel:  { fontSize: 13 },
  sendVocalBtn:    { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});

export default ConversationScreen;