import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Message { id: string; from: 'me' | 'them'; text: string; timestamp: number }

export default function ConversationScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: '1', from: 'them', text: `Hey @${username}, want to plan a trip?`, timestamp: Date.now() - 1000 * 60 * 60 },
    { id: '2', from: 'me', text: 'Absolutely! When are you thinking?', timestamp: Date.now() - 1000 * 60 * 30 },
  ]);
  const listRef = useRef<FlatList>(null);

  const title = useMemo(() => `@${username}`, [username]);

  const send = () => {
    const t = input.trim();
    if (!t) return;
    setMessages(prev => [...prev, { id: String(Date.now()), from: 'me', text: t, timestamp: Date.now() }]);
    setInput('');
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={22} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 36 }} />
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.from === 'me' ? styles.bubbleMe : styles.bubbleThem]}>
              <Text style={[styles.bubbleText, item.from === 'me' ? styles.bubbleTextMe : styles.bubbleTextThem]}>{item.text}</Text>
            </View>
          )}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            value={input}
            onChangeText={setInput}
            returnKeyType="send"
            onSubmitEditing={send}
          />
          <TouchableOpacity onPress={send} style={styles.sendBtn}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eaeaea' },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  bubble: { maxWidth: '80%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, marginBottom: 8 },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: '#0fa3a3' },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: '#eef7f7' },
  bubbleText: { fontSize: 14 },
  bubbleTextMe: { color: '#fff' },
  bubbleTextThem: { color: '#333' },
  inputBar: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
  input: { flex: 1, height: 40, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 12, marginRight: 8, backgroundColor: '#fff' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0fa3a3', alignItems: 'center', justifyContent: 'center' },
});
