import { router, useLocalSearchParams } from 'expo-router';
import { markConversationRead } from '@/store/read-conversations';
import { useAuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Mail, Phone, Send, User } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BLUE = '#208AEF';
const GRAY = '#6B7280';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  text: string;
  isOwn: boolean;
  time: string;
}

interface MessageRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  trainer_id: string;
  content: string;
  created_at: string;
}

interface TrainerInfo {
  name: string;
  sport: string;
  initials: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#B5C9E4', '#C8DDB5', '#E4CDB5', '#D4B5E4', '#B5E4D4',
  '#E4B5C8', '#C8B5E4', '#E4E4B5',
];

function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || '?';
}

function mapMessage(row: MessageRow, userId: string): Message {
  return {
    id:    row.id,
    text:  row.content,
    isOwn: row.sender_id === userId,
    time:  new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
  };
}

export default function ChatScreen() {
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const listRef = useRef<FlatList>(null);

  const isTrainerMode = mode === 'trainer';

  const screenBg = isDarkMode ? '#111827' : '#FFFFFF';
  const headerBg = isDarkMode ? '#1F2937' : '#FFFFFF';
  const headerBorder = isDarkMode ? '#374151' : '#F3F4F6';
  const headerTextColor = isDarkMode ? '#FFFFFF' : '#111827';
  const headerSubColor = isDarkMode ? '#9CA3AF' : GRAY;
  const backIconColor = isDarkMode ? '#FFFFFF' : '#111827';
  const inputBarBg = isDarkMode ? '#1F2937' : '#FFFFFF';
  const inputBarBorder = isDarkMode ? '#374151' : '#F3F4F6';
  const inputBg = isDarkMode ? '#374151' : '#F3F4F6';
  const inputTextColor = isDarkMode ? '#FFFFFF' : '#111827';
  const receivedBubbleBg = isDarkMode ? '#374151' : '#F3F4F6';
  const receivedTextColor = isDarkMode ? '#FFFFFF' : '#111827';
  const sheetBg  = isDarkMode ? '#1F2937' : '#FFFFFF';
  const textSub  = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor = isDarkMode ? '#374151' : '#F3F4F6';

  const { currentUser } = useAuthContext();
  const userId = currentUser?.id ?? '';

  const [trainerInfo,    setTrainerInfo]    = useState<TrainerInfo | null>(null);
  const [messages,       setMessages]       = useState<Message[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [inputText,      setInputText]      = useState('');
  const [showClientInfo, setShowClientInfo] = useState(false);

  // Holds the confirmed trainer UUID from Supabase (may differ from route param for legacy nav)
  const trainerUUIDRef = useRef(id);

  const trainer = trainerInfo ?? { name: 'Trainer', sport: '', initials: '?' };
  const person  = isTrainerMode
    ? { name: 'Client', initials: '?', online: false }
    : { ...trainer, online: false };

  useEffect(() => {
    markConversationRead(id);
  }, [id]);

  useEffect(() => {
    const event = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(event, () => {
      listRef.current?.scrollToEnd({ animated: true });
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!userId) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function setup() {
      // Fetch trainer first — use the confirmed UUID from Supabase, not just the route param
      const { data: trainerData } = await supabase
        .from('trainers')
        .select('id, full_name, sports(name)')
        .eq('id', id)
        .single();

      const trainerUUID = (trainerData as unknown as { id: string } | null)?.id ?? id;
      trainerUUIDRef.current = trainerUUID;

      if (trainerData) {
        const raw   = (trainerData as unknown as { full_name: string; sports: { name: string } | { name: string }[] | null }).sports;
        const sport = Array.isArray(raw) ? (raw[0]?.name ?? '') : (raw?.name ?? '');
        const name  = (trainerData as unknown as { full_name: string }).full_name;
        setTrainerInfo({ name, sport, initials: getInitials(name) });
      }

      // Fetch messages scoped to the confirmed trainer UUID
      const { data: msgData } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq('trainer_id', trainerUUID)
        .order('created_at', { ascending: true });

      setMessages((msgData ?? []).map(row => mapMessage(row as MessageRow, userId)));
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);

      // Realtime subscription using confirmed trainer UUID
      channel = supabase
        .channel(`chat:${trainerUUID}:${userId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `trainer_id=eq.${trainerUUID}` },
          (payload) => {
            const row = payload.new as MessageRow;
            setMessages(prev => {
              if (prev.some(m => m.id === row.id)) return prev;
              return [...prev, mapMessage(row, userId)];
            });
            setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
          },
        )
        .subscribe();
    }

    setup();

    return () => { if (channel) supabase.removeChannel(channel); };
  }, [id, userId]);

  async function handleSend() {
    const text = inputText.trim();
    if (!text || !userId) return;
    const trainerUUID = trainerUUIDRef.current;
    setInputText('');
    console.log('[chat] inserting message:', { sender_id: userId, receiver_id: trainerUUID, trainer_id: trainerUUID, content: text });
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id:   userId,
        receiver_id: trainerUUID,
        trainer_id:  trainerUUID,
        content:     text,
      })
      .select('id, created_at')
      .single();

    if (error) { console.error('[chat] send error:', error.message); return; }

    // Append immediately; realtime deduplicates by id if the event arrives later
    const sent: Message = {
      id:    data.id,
      text,
      isOwn: true,
      time:  new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    };
    setMessages(prev => prev.some(m => m.id === sent.id) ? prev : [...prev, sent]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }

  return (
    <View style={[styles.wrapper, { backgroundColor: screenBg }]}>
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: screenBg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: headerBg, borderBottomColor: headerBorder }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={26} color={backIconColor} strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerTrainer}
          onPress={() => isTrainerMode ? setShowClientInfo(true) : router.push(`/trainer/${id}`)}
          activeOpacity={0.7}>
          <View style={[styles.headerAvatar, { backgroundColor: avatarColor(id) }]}>
            <Text style={styles.headerInitials}>{person.initials}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerName, { color: headerTextColor }]} numberOfLines={1}>{person.name}</Text>
            <View style={styles.headerSubRow}>
              {person.online && <View style={styles.onlineDot} />}
              <Text style={[styles.headerSub, { color: headerSubColor }]}>
                {person.online ? 'Active now' : (isTrainerMode ? 'Client' : trainer.sport)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {loading && (
        <ActivityIndicator style={{ marginTop: 32 }} color={BLUE} />
      )}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item, index }) => {
            const prev = messages[index - 1];
            const showAvatar = !item.isOwn && (index === 0 || messages[index - 1]?.isOwn);
            const isLastInGroup =
              index === messages.length - 1 || messages[index + 1]?.isOwn !== item.isOwn;

            return (
              <View style={[styles.bubbleRow, item.isOwn && styles.bubbleRowOwn]}>
                {/* Trainer avatar placeholder (keeps spacing aligned) */}
                {!item.isOwn && (
                  <View style={styles.bubbleAvatarSlot}>
                    {showAvatar && (
                      <View style={[styles.bubbleAvatar, { backgroundColor: avatarColor(id) }]}>
                        <Text style={styles.bubbleAvatarText}>{person.initials}</Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.bubbleCol}>
                  <View style={[
                    styles.bubble,
                    item.isOwn
                      ? styles.bubbleOwn
                      : [styles.bubbleOther, { backgroundColor: receivedBubbleBg }],
                  ]}>
                    <Text style={[
                      styles.bubbleText,
                      { color: item.isOwn ? '#FFFFFF' : receivedTextColor },
                    ]}>
                      {item.text}
                    </Text>
                  </View>
                  {isLastInGroup && (
                    <Text style={[styles.bubbleTime, item.isOwn && styles.bubbleTimeOwn]}>
                      {item.time}
                    </Text>
                  )}
                </View>
              </View>
            );
          }}
        />

      {/* Input bar */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 4, backgroundColor: inputBarBg, borderTopColor: inputBarBorder }]}>
        <TextInput
          style={[styles.input, { backgroundColor: inputBg, color: inputTextColor }]}
          placeholder="Message…"
          placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
          returnKeyType="default"
        />
        <Pressable
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}>
          <Send size={18} color="#FFFFFF" strokeWidth={2} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
      {/* Client info modal (trainer mode only) */}
      <Modal
        visible={showClientInfo}
        transparent
        animationType="slide"
        onRequestClose={() => setShowClientInfo(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowClientInfo(false)}>
          <Pressable style={[styles.infoSheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
            <View style={styles.sheetHandle} />

            {/* Avatar + name */}
            <View style={styles.infoHeader}>
              <View style={[styles.infoAvatar, { backgroundColor: avatarColor(id) }]}>
                <Text style={styles.infoInitials}>{person.initials}</Text>
              </View>
              <Text style={[styles.infoName, { color: headerTextColor }]}>{person.name}</Text>
            </View>

            {/* Contact rows */}
            <View style={[styles.infoCard, { borderColor: divColor }]}>
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}>
                  <Mail size={15} color={BLUE} strokeWidth={2} />
                </View>
                <View style={styles.infoText}>
                  <Text style={[styles.infoLabel, { color: textSub }]}>Email</Text>
                  <Text style={[styles.infoValue, { color: headerTextColor }]}>—</Text>
                </View>
              </View>
              <View style={[styles.infoDivider, { backgroundColor: divColor }]} />
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: isDarkMode ? '#052E16' : '#F0FDF4' }]}>
                  <Phone size={15} color="#22C55E" strokeWidth={2} />
                </View>
                <View style={styles.infoText}>
                  <Text style={[styles.infoLabel, { color: textSub }]}>Phone</Text>
                  <Text style={[styles.infoValue, { color: headerTextColor }]}>—</Text>
                </View>
              </View>
              <View style={[styles.infoDivider, { backgroundColor: divColor }]} />
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: isDarkMode ? '#2E1065' : '#EDE9FE' }]}>
                  <User size={15} color="#8B5CF6" strokeWidth={2} />
                </View>
                <View style={styles.infoText}>
                  <Text style={[styles.infoLabel, { color: textSub }]}>Member since</Text>
                  <Text style={[styles.infoValue, { color: headerTextColor }]}>—</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowClientInfo(false)}
              activeOpacity={0.7}>
              <Text style={[styles.closeBtnText, { color: textSub }]}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    padding: 4,
    flexShrink: 0,
  },
  headerTrainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  headerInitials: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  headerSub: {
    fontSize: 12,
    color: GRAY,
    fontWeight: '400',
  },

  // Message list
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 4,
  },

  // Bubble row
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 2,
  },
  bubbleRowOwn: {
    flexDirection: 'row-reverse',
  },
  bubbleAvatarSlot: {
    width: 28,
    flexShrink: 0,
    alignItems: 'center',
  },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleAvatarText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#374151',
  },
  bubbleCol: {
    maxWidth: '72%',
    gap: 3,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  bubbleOwn: {
    backgroundColor: BLUE,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 21,
  },
  bubbleTextOwn: {
    color: '#FFFFFF',
  },
  bubbleTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  bubbleTimeOwn: {
    textAlign: 'right',
    marginLeft: 0,
    marginRight: 4,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 6,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    fontSize: 15,
    color: '#111827',
    maxHeight: 120,
    lineHeight: 20,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },

  // Client info modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  infoSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 20,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 4,
  },
  infoHeader: {
    alignItems: 'center',
    gap: 10,
  },
  infoAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoInitials: {
    fontSize: 20,
    fontWeight: '800',
    color: '#374151',
  },
  infoName: {
    fontSize: 20,
    fontWeight: '700',
  },
  memberBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  memberBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoText: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  infoDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },
  closeBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: -4,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
