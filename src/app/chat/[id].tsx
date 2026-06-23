import { router, useLocalSearchParams } from 'expo-router';
import { markConversationRead } from '@/store/read-conversations';
import { useTheme } from '@/context/ThemeContext';
import { ChevronLeft, Send } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
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
    { id: '1', text: 'Hi! Looking forward to our session on Thursday 🧘', isOwn: false, time: '9:20 AM' },
    { id: '2', text: 'Me too! Should I bring anything specific?', isOwn: true, time: '9:31 AM' },
    { id: '3', text: 'Just your yoga mat and comfortable clothes. Water bottle too — we\'ll be doing a 60-min flow.', isOwn: false, time: '9:33 AM' },
    { id: '4', text: 'Perfect, I have all that. What time exactly?', isOwn: true, time: '9:35 AM' },
    { id: '5', text: 'See you Thursday at 9am! Don\'t forget your mat 🧘', isOwn: false, time: '9:41 AM' },
  ],
  '2': [
    { id: '1', text: 'Great work today on the drills! Your left foot is really improving.', isOwn: false, time: '5:10 PM' },
    { id: '2', text: 'Thanks! I\'ve been practicing on my own too.', isOwn: true, time: '5:22 PM' },
    { id: '3', text: 'It shows. Keep it up between sessions.', isOwn: false, time: '5:25 PM' },
    { id: '4', text: 'Will do. Same time next week?', isOwn: true, time: '5:27 PM' },
    { id: '5', text: 'Great session today. We\'ll work on passing drills next time.', isOwn: false, time: '5:30 PM' },
  ],
  '3': [
    { id: '1', text: 'Hey, I wanted to check — are you okay with Tuesday\'s session as planned?', isOwn: false, time: '2:00 PM' },
    { id: '2', text: 'Actually I have a conflict at 5pm. Can we shift?', isOwn: true, time: '2:14 PM' },
    { id: '3', text: 'Of course! What works for you?', isOwn: false, time: '2:15 PM' },
    { id: '4', text: '6pm would be perfect if you\'re free.', isOwn: true, time: '2:18 PM' },
    { id: '5', text: 'Can you move Tuesday\'s session to 6pm instead?', isOwn: false, time: '2:20 PM' },
  ],
};

function fallbackMessages(trainerId: string): Message[] {
  return [
    { id: '1', text: 'Welcome! I\'m looking forward to working with you.', isOwn: false, time: '10:00 AM' },
    { id: '2', text: 'Thank you! When can we schedule our first session?', isOwn: true, time: '10:05 AM' },
    { id: '3', text: 'I have availability Monday and Wednesday evenings, or Saturday morning.', isOwn: false, time: '10:07 AM' },
    { id: '4', text: 'Saturday morning works great for me!', isOwn: true, time: '10:09 AM' },
    { id: '5', text: 'Perfect — let\'s lock in Saturday at 10am. See you then! 👍', isOwn: false, time: '10:11 AM' },
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
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m} ${ampm}`;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const listRef = useRef<FlatList>(null);

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

  const trainer = TRAINER_META[id] ?? {
    name: 'Trainer',
    sport: '',
    initials: '?',
    online: false,
  };

  const [messages, setMessages] = useState<Message[]>(
    INITIAL_MESSAGES[id] ?? fallbackMessages(id),
  );
  const [inputText, setInputText] = useState('');

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
          onPress={() => router.push(`/trainer/${id}`)}
          activeOpacity={0.7}>
          <View style={[styles.headerAvatar, { backgroundColor: avatarColor(id) }]}>
            <Text style={styles.headerInitials}>{trainer.initials}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerName, { color: headerTextColor }]} numberOfLines={1}>{trainer.name}</Text>
            <View style={styles.headerSubRow}>
              {trainer.online && <View style={styles.onlineDot} />}
              <Text style={[styles.headerSub, { color: headerSubColor }]}>
                {trainer.online ? 'Active now' : trainer.sport}
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
                        <Text style={styles.bubbleAvatarText}>{trainer.initials}</Text>
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
});
