import { router, useLocalSearchParams } from 'expo-router';
import { markConversationRead } from '@/store/read-conversations';
import { useTheme } from '@/context/ThemeContext';
import { ChevronLeft, Mail, Phone, Send, User } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
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

interface Message {
  id: string;
  text: string;
  isOwn: boolean;
  time: string;
}

interface TrainerMeta {
  name: string;
  sport: string;
  initials: string;
  online: boolean;
}

interface ClientMeta {
  name: string;
  initials: string;
  email: string;
  phone: string;
  memberSince: string;
  online: boolean;
}

const CLIENT_META: Record<string, ClientMeta> = {
  '1': { name: 'Jonas Kazlauskas',  initials: 'JK', email: 'jonas.k@gmail.com',      phone: '+370 612 34567', memberSince: 'Mar 2025', online: true  },
  '2': { name: 'Marta Petraitytė',  initials: 'MP', email: 'marta.p@gmail.com',      phone: '+370 698 76543', memberSince: 'Jan 2026', online: true  },
  '3': { name: 'Tomas Butkus',      initials: 'TB', email: 'tomas.b@gmail.com',      phone: '+370 655 11223', memberSince: 'Apr 2025', online: false },
  '4': { name: 'Rasa Mockutė',      initials: 'RM', email: 'rasa.m@gmail.com',       phone: '+370 679 44556', memberSince: 'Feb 2026', online: false },
  '5': { name: 'Viktorija Paulė',   initials: 'VP', email: 'viktorija.p@gmail.com',  phone: '+370 620 98765', memberSince: 'Nov 2024', online: false },
  '6': { name: 'Eglė Jankutė',     initials: 'EJ', email: 'egle.j@gmail.com',       phone: '+370 647 33210', memberSince: 'May 2025', online: true  },
  '7': { name: 'Laurynas Grigas',   initials: 'LG', email: 'laurynas.g@gmail.com',   phone: '+370 601 87654', memberSince: 'Jun 2024', online: false },
  '8': { name: 'Kristina Vaitkutė', initials: 'KV', email: 'kristina.v@gmail.com',   phone: '+370 635 22109', memberSince: 'Aug 2025', online: false },
};

const TRAINER_META: Record<string, TrainerMeta> = {
  '1': { name: 'Rūta Kazlauskaitė', sport: 'Yoga', initials: 'RK', online: true },
  '2': { name: 'Mantas Petrauskas', sport: 'Football', initials: 'MP', online: false },
  '3': { name: 'Darius Paulauskas', sport: 'Boxing', initials: 'DP', online: true },
  '4': { name: 'Ingrida Vaitkutė', sport: 'Swimming', initials: 'IV', online: false },
  '5': { name: 'Aistė Mikalauskaitė', sport: 'Tennis', initials: 'AM', online: false },
  '6': { name: 'Erikas Butkus', sport: 'Running', initials: 'EB', online: false },
  '7': { name: 'Laura Stankevičiūtė', sport: 'CrossFit', initials: 'LS', online: true },
  '8': { name: 'Tomas Žukauskas', sport: 'Basketball', initials: 'TŽ', online: false },
};

const INITIAL_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: '1', text: 'Hi! Looking forward to our session on Thursday 🧘', isOwn: false, time: '09:20' },
    { id: '2', text: 'Me too! Should I bring anything specific?', isOwn: true, time: '09:31' },
    { id: '3', text: 'Just your yoga mat and comfortable clothes. Water bottle too — we\'ll be doing a 60-min flow.', isOwn: false, time: '09:33' },
    { id: '4', text: 'Perfect, I have all that. What time exactly?', isOwn: true, time: '09:35' },
    { id: '5', text: 'See you Thursday at 9am! Don\'t forget your mat 🧘', isOwn: false, time: '09:41' },
  ],
  '2': [
    { id: '1', text: 'Great work today on the drills! Your left foot is really improving.', isOwn: false, time: '17:10' },
    { id: '2', text: 'Thanks! I\'ve been practicing on my own too.', isOwn: true, time: '17:22' },
    { id: '3', text: 'It shows. Keep it up between sessions.', isOwn: false, time: '17:25' },
    { id: '4', text: 'Will do. Same time next week?', isOwn: true, time: '17:27' },
    { id: '5', text: 'Great session today. We\'ll work on passing drills next time.', isOwn: false, time: '17:30' },
  ],
  '3': [
    { id: '1', text: 'Hey, I wanted to check — are you okay with Tuesday\'s session as planned?', isOwn: false, time: '14:00' },
    { id: '2', text: 'Actually I have a conflict at 5pm. Can we shift?', isOwn: true, time: '14:14' },
    { id: '3', text: 'Of course! What works for you?', isOwn: false, time: '14:15' },
    { id: '4', text: '6pm would be perfect if you\'re free.', isOwn: true, time: '14:18' },
    { id: '5', text: 'Can you move Tuesday\'s session to 6pm instead?', isOwn: false, time: '14:20' },
  ],
};

function fallbackMessages(trainerId: string): Message[] {
  return [
    { id: '1', text: 'Welcome! I\'m looking forward to working with you.', isOwn: false, time: '10:00' },
    { id: '2', text: 'Thank you! When can we schedule our first session?', isOwn: true, time: '10:05' },
    { id: '3', text: 'I have availability Monday and Wednesday evenings, or Saturday morning.', isOwn: false, time: '10:07' },
    { id: '4', text: 'Saturday morning works great for me!', isOwn: true, time: '10:09' },
    { id: '5', text: 'Perfect — let\'s lock in Saturday at 10am. See you then! 👍', isOwn: false, time: '10:11' },
  ];
}

const AVATAR_COLORS = [
  '#B5C9E4', '#C8DDB5', '#E4CDB5', '#D4B5E4', '#B5E4D4',
  '#E4B5C8', '#C8B5E4', '#E4E4B5',
];

function avatarColor(id: string) {
  return AVATAR_COLORS[parseInt(id, 10) % AVATAR_COLORS.length];
}

function now(): string {
  const d = new Date();
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
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

  const trainer    = TRAINER_META[id] ?? { name: 'Trainer',  sport: '', initials: '?', online: false };
  const clientInfo = CLIENT_META[id]  ?? { name: 'Client', initials: '?', email: '', phone: '', memberSince: '', online: false };
  const person     = isTrainerMode ? clientInfo : trainer;

  const [messages,        setMessages]        = useState<Message[]>(INITIAL_MESSAGES[id] ?? fallbackMessages(id));
  const [inputText,       setInputText]       = useState('');
  const [showClientInfo,  setShowClientInfo]  = useState(false);

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

  function handleSend() {
    const text = inputText.trim();
    if (!text) return;
    const newMsg: Message = {
      id: String(Date.now()),
      text,
      isOwn: true,
      time: now(),
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
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
                {person.online ? 'Active now' : (isTrainerMode ? 'Client' : (trainer as TrainerMeta).sport)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Messages */}
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
                <Text style={styles.infoInitials}>{clientInfo.initials}</Text>
              </View>
              <Text style={[styles.infoName, { color: headerTextColor }]}>{clientInfo.name}</Text>
              <View style={[styles.memberBadge, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}>
                <Text style={[styles.memberBadgeText, { color: BLUE }]}>Member since {clientInfo.memberSince}</Text>
              </View>
            </View>

            {/* Contact rows */}
            <View style={[styles.infoCard, { borderColor: divColor }]}>
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}>
                  <Mail size={15} color={BLUE} strokeWidth={2} />
                </View>
                <View style={styles.infoText}>
                  <Text style={[styles.infoLabel, { color: textSub }]}>Email</Text>
                  <Text style={[styles.infoValue, { color: headerTextColor }]}>{clientInfo.email}</Text>
                </View>
              </View>
              <View style={[styles.infoDivider, { backgroundColor: divColor }]} />
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: isDarkMode ? '#052E16' : '#F0FDF4' }]}>
                  <Phone size={15} color="#22C55E" strokeWidth={2} />
                </View>
                <View style={styles.infoText}>
                  <Text style={[styles.infoLabel, { color: textSub }]}>Phone</Text>
                  <Text style={[styles.infoValue, { color: headerTextColor }]}>{clientInfo.phone}</Text>
                </View>
              </View>
              <View style={[styles.infoDivider, { backgroundColor: divColor }]} />
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: isDarkMode ? '#2E1065' : '#EDE9FE' }]}>
                  <User size={15} color="#8B5CF6" strokeWidth={2} />
                </View>
                <View style={styles.infoText}>
                  <Text style={[styles.infoLabel, { color: textSub }]}>Member since</Text>
                  <Text style={[styles.infoValue, { color: headerTextColor }]}>{clientInfo.memberSince}</Text>
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
