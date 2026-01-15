import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Default avatar in case user image fails to load
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=200&auto=format&fit=crop';
const Avatar = ({ uri, style }: { uri?: string; style: any }) => {
  const [src, setSrc] = React.useState(uri && uri.length > 0 ? uri : DEFAULT_AVATAR);
  return (
    <Image source={{ uri: src }} style={style} onError={() => setSrc(DEFAULT_AVATAR)} />
  );
};

// Chat thread interface and mock data for demo
interface Thread {
  username: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: number;
  unread?: boolean;
}

const MOCK_THREADS: Thread[] = [
  {
    username: 'traveler123',
    name: 'Alex Johnson',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    lastMessage: 'Let’s plan the Paris trip! 🗼',
    timestamp: Date.now() - 1000 * 60 * 5,
    unread: true,
  },
  {
    username: 'explorer22',
    name: 'Taylor Smith',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    lastMessage: "Got flights, what's next?",
    timestamp: Date.now() - 1000 * 60 * 60,
  },
  {
    username: 'wanderer_jp',
    name: 'Kenji',
    avatar: 'https://images.unsplash.com/photo-1541214113241-7f4f6b1659a0?q=80&w=200&auto=format&fit=crop',
    lastMessage: 'Sushi tour in Tokyo? 🍣',
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
  },
];

export default function InboxScreen() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_THREADS;
    return MOCK_THREADS.filter(t =>
      t.username.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#777" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={filtered.sort((a, b) => b.timestamp - a.timestamp)}
        keyExtractor={(item) => item.username}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.threadRow}
            onPress={() => router.push(`/chat/${item.username}`)}
          >
            <Avatar uri={item.avatar} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <View style={styles.threadTop}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.time}>{timeAgo(item.timestamp)}</Text>
              </View>
              <Text style={[styles.preview, item.unread && styles.unread]} numberOfLines={1}>
                {item.lastMessage}
              </Text>
              <Text style={styles.username}>@{item.username}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#bbb" />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      <View style={styles.newRow}>
        <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/chat/new')}>
          <Ionicons name="create" size={16} color="#fff" />
          <Text style={styles.newBtnText}>New Message</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 20, fontWeight: '700' },
  closeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', margin: 16, paddingHorizontal: 12,
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10, height: 40,
  },
  searchInput: { flex: 1 },
  threadRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  threadTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  name: { fontWeight: '600', color: '#111', maxWidth: '70%' },
  time: { color: '#999', fontSize: 12 },
  preview: { color: '#666' },
  unread: { color: '#111', fontWeight: '700' },
  username: { color: '#999', fontSize: 12, marginTop: 2 },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#eee', marginLeft: 76 },
  newRow: { position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center' },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0fa3a3', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  newBtnText: { color: '#fff', fontWeight: '700' },
});
