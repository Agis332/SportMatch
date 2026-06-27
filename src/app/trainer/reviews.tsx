import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, MessageSquare } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';

const BLUE  = '#208AEF';
const AMBER = '#F59E0B';

type Filter = 'all' | '5' | '4' | '3below';

interface Review {
  id: string;
  client: string;
  initials: string;
  color: string;
  rating: number;
  date: string;
  comment: string;
  sessionType: 'Individual' | 'Group';
  sport: string;
  reply?: string;
}

const RATING_BREAKDOWN = [
  { stars: 5, pct: 70 },
  { stars: 4, pct: 20 },
  { stars: 3, pct: 8  },
  { stars: 2, pct: 2  },
  { stars: 1, pct: 0  },
];

const REVIEWS: Review[] = [
  {
    id: '1',
    client: 'Jonas Kazlauskas',
    initials: 'JK',
    color: '#B5C9E4',
    rating: 5,
    date: 'Jun 24, 2026',
    comment: 'Excellent session! Very professional and knowledgeable. Really helped me improve my technique significantly.',
    sessionType: 'Individual',
    sport: 'Football',
    reply: 'Thank you Jonas! It was a pleasure working with you. See you at the next session!',
  },
  {
    id: '2',
    client: 'Marta Petraitytė',
    initials: 'MP',
    color: '#C8DDB5',
    rating: 5,
    date: 'Jun 20, 2026',
    comment: "Best personal trainer I've had. Very motivating and creates a great training plan tailored to my goals.",
    sessionType: 'Individual',
    sport: 'Running',
  },
  {
    id: '3',
    client: 'Eglė Jankutė',
    initials: 'EJ',
    color: '#E4CDB5',
    rating: 4,
    date: 'Jun 15, 2026',
    comment: 'Great session overall. Would appreciate a bit more time on technique explanation between drills.',
    sessionType: 'Group',
    sport: 'CrossFit',
  },
  {
    id: '4',
    client: 'Tomas Butkus',
    initials: 'TB',
    color: '#D4B5E4',
    rating: 5,
    date: 'Jun 10, 2026',
    comment: 'Amazing trainer! Very patient and always adapts the session to my current fitness level. Highly recommend.',
    sessionType: 'Individual',
    sport: 'Football',
    reply: "Appreciate it Tomas, you're making great progress! Keep it up.",
  },
  {
    id: '5',
    client: 'Rasa Mockutė',
    initials: 'RM',
    color: '#B5E4D4',
    rating: 4,
    date: 'Jun 5, 2026',
    comment: 'Sessions are well structured and progressively challenging. Noticed real improvement after just a few weeks.',
    sessionType: 'Individual',
    sport: 'Running',
  },
  {
    id: '6',
    client: 'Andrius Stankus',
    initials: 'AS',
    color: '#E4B5C8',
    rating: 3,
    date: 'May 28, 2026',
    comment: 'Sessions are decent but sometimes hard to get detailed feedback on specific areas to improve.',
    sessionType: 'Group',
    sport: 'Football',
  },
  {
    id: '7',
    client: 'Viktorija Paulė',
    initials: 'VP',
    color: '#C8B5E4',
    rating: 5,
    date: 'May 20, 2026',
    comment: "Absolutely fantastic trainer. The progress I've made in 2 months is incredible. Recommend to everyone.",
    sessionType: 'Individual',
    sport: 'CrossFit',
  },
  {
    id: '8',
    client: 'Laurynas Grigas',
    initials: 'LG',
    color: '#E4E4B5',
    rating: 4,
    date: 'May 15, 2026',
    comment: 'Very professional. Punctual, well-prepared, and gives clear instructions throughout every session.',
    sessionType: 'Individual',
    sport: 'Running',
  },
  {
    id: '9',
    client: 'Kristina Vaitkutė',
    initials: 'KV',
    color: '#B5D4E4',
    rating: 5,
    date: 'May 8, 2026',
    comment: 'Really knows how to motivate you and push limits in a healthy, safe way. Brilliant trainer.',
    sessionType: 'Individual',
    sport: 'Football',
  },
  {
    id: '10',
    client: 'Darius Paulauskas',
    initials: 'DP',
    color: '#E4B5B5',
    rating: 2,
    date: 'Apr 30, 2026',
    comment: 'Session felt a bit rushed. Expected more personalized attention given it was booked as individual.',
    sessionType: 'Group',
    sport: 'CrossFit',
  },
];

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',    label: 'All'   },
  { key: '5',      label: '5 ★'  },
  { key: '4',      label: '4 ★'  },
  { key: '3below', label: '≤ 3 ★' },
];

function Stars({ rating, size, emptyColor }: { rating: number; size: number; emptyColor: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={{ fontSize: size, color: i <= rating ? AMBER : emptyColor }}>★</Text>
      ))}
    </View>
  );
}

export default function TrainerReviewsScreen() {
  const insets         = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const { clientId }   = useLocalSearchParams<{ clientId?: string }>();

  const [filter,       setFilter]       = useState<Filter>('all');
  const [replyTarget,  setReplyTarget]  = useState<string | null>(null);
  const [replyText,    setReplyText]    = useState('');
  const [replies,      setReplies]      = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    REVIEWS.forEach(r => { if (r.reply) init[r.id] = r.reply; });
    return init;
  });

  const scrollRef    = useRef<ScrollView>(null);
  const cardYPos     = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!clientId) return;
    const timer = setTimeout(() => {
      const y = cardYPos.current[clientId];
      if (y !== undefined) scrollRef.current?.scrollTo({ y, animated: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [clientId]);

  const bg            = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg      = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg        = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor   = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary   = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub       = isDarkMode ? '#9CA3AF' : '#6B7280';
  const sheetBg       = isDarkMode ? '#1F2937' : '#FFFFFF';
  const inputBg       = isDarkMode ? '#111827' : '#F9FAFB';
  const emptyStarColor = isDarkMode ? '#374151' : '#E5E7EB';
  const replyBg       = isDarkMode ? '#111827' : '#F9FAFB';
  const barBg         = isDarkMode ? '#374151' : '#F3F4F6';
  const badgeBg       = isDarkMode ? '#374151' : '#F3F4F6';

  const filteredReviews = REVIEWS.filter(r => {
    if (filter === '5')      return r.rating === 5;
    if (filter === '4')      return r.rating === 4;
    if (filter === '3below') return r.rating <= 3;
    return true;
  });

  const targetReview = REVIEWS.find(r => r.id === replyTarget);

  function openReply(id: string) {
    setReplyTarget(id);
    setReplyText(replies[id] ?? '');
  }

  function handleSendReply() {
    if (!replyTarget || !replyText.trim()) return;
    setReplies(prev => ({ ...prev, [replyTarget]: replyText.trim() }));
    setReplyTarget(null);
    setReplyText('');
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>My Reviews</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>

        {/* Rating summary card */}
        <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.summaryLeft}>
            <Text style={[styles.bigRating, { color: textPrimary }]}>4.8</Text>
            <Stars rating={5} size={20} emptyColor={emptyStarColor} />
            <Text style={[styles.reviewCount, { color: textSub }]}>24 reviews</Text>
          </View>
          <View style={styles.summaryRight}>
            {RATING_BREAKDOWN.map(b => (
              <View key={b.stars} style={styles.breakdownRow}>
                <Text style={[styles.breakdownStar, { color: textSub }]}>{b.stars}★</Text>
                <View style={[styles.barBg, { backgroundColor: barBg }]}>
                  {b.pct > 0 && (
                    <View style={[styles.barFill, { width: `${b.pct}%` as any, backgroundColor: AMBER }]} />
                  )}
                </View>
                <Text style={[styles.breakdownPct, { color: textSub }]}>{b.pct}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Filter tabs */}
        <View style={[styles.tabs, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.tab, filter === f.key && { backgroundColor: cardBg }]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.7}>
              <Text style={[
                styles.tabText,
                { color: filter === f.key ? textPrimary : textSub },
                filter === f.key && styles.tabTextActive,
              ]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reviews */}
        {filteredReviews.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.emptyText, { color: textSub }]}>No reviews for this filter</Text>
          </View>
        ) : (
          filteredReviews.map(r => {
            const hasReply    = !!replies[r.id];
            const isHighlight = r.id === clientId;
            return (
              <View
                key={r.id}
                onLayout={e => { cardYPos.current[r.id] = e.nativeEvent.layout.y; }}
                style={[
                  styles.reviewCard,
                  { backgroundColor: cardBg, borderColor },
                  isHighlight && styles.reviewCardHighlight,
                ]}>

                {/* Header */}
                <View style={styles.reviewHeader}>
                  <View style={[styles.avatar, { backgroundColor: r.color }]}>
                    <Text style={styles.avatarText}>{r.initials}</Text>
                  </View>
                  <View style={styles.reviewMeta}>
                    <Text style={[styles.clientName, { color: textPrimary }]}>{r.client}</Text>
                    <View style={styles.ratingDateRow}>
                      <Stars rating={r.rating} size={12} emptyColor={emptyStarColor} />
                      <Text style={[styles.reviewDate, { color: textSub }]}>{r.date}</Text>
                    </View>
                  </View>
                  <View style={[styles.sessionBadge, { backgroundColor: badgeBg }]}>
                    <Text style={[styles.sessionBadgeText, { color: textSub }]}>{r.sessionType}</Text>
                  </View>
                </View>

                {/* Comment */}
                <Text style={[styles.comment, { color: textPrimary }]}>{r.comment}</Text>

                {/* Reply */}
                {hasReply && (
                  <View style={[styles.replyBox, { backgroundColor: replyBg, borderLeftColor: BLUE }]}>
                    <Text style={[styles.replyLabel, { color: BLUE }]}>Your reply</Text>
                    <Text style={[styles.replyText, { color: textSub }]}>{replies[r.id]}</Text>
                  </View>
                )}

                {/* Reply button */}
                <TouchableOpacity
                  style={styles.replyBtn}
                  onPress={() => openReply(r.id)}
                  activeOpacity={0.7}>
                  <MessageSquare size={13} color={BLUE} strokeWidth={2} />
                  <Text style={[styles.replyBtnText, { color: BLUE }]}>
                    {hasReply ? 'Edit reply' : 'Reply'}
                  </Text>
                </TouchableOpacity>

              </View>
            );
          })
        )}

      </ScrollView>

      {/* Reply modal */}
      <Modal
        visible={!!replyTarget}
        transparent
        animationType="slide"
        onRequestClose={() => setReplyTarget(null)}>
        <Pressable style={styles.overlay} onPress={() => setReplyTarget(null)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.overlayKAV}>
            <Pressable style={[styles.sheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
              <View style={styles.sheetHandle} />
              <Text style={[styles.sheetTitle, { color: textPrimary }]}>Reply to Review</Text>

              {targetReview && (
                <View style={[styles.quoteBox, { backgroundColor: isDarkMode ? '#111827' : '#F3F4F6' }]}>
                  <Text style={[styles.quoteClient, { color: textPrimary }]}>{targetReview.client}</Text>
                  <Text style={[styles.quoteComment, { color: textSub }]} numberOfLines={2}>
                    {targetReview.comment}
                  </Text>
                </View>
              )}

              <TextInput
                style={[styles.replyInput, {
                  backgroundColor: inputBg,
                  color:           textPrimary,
                  borderColor:     isDarkMode ? '#374151' : '#E5E7EB',
                }]}
                value={replyText}
                onChangeText={setReplyText}
                placeholder="Write your reply…"
                placeholderTextColor={isDarkMode ? '#4B5563' : '#9CA3AF'}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoFocus
              />

              <TouchableOpacity
                style={[styles.sendBtn, !replyText.trim() && styles.sendBtnDisabled]}
                onPress={handleSendReply}
                disabled={!replyText.trim()}
                activeOpacity={0.85}>
                <Text style={styles.sendBtnText}>Send Reply</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}
                onPress={() => setReplyTarget(null)}
                activeOpacity={0.7}>
                <Text style={[styles.cancelBtnText, { color: textSub }]}>Cancel</Text>
              </TouchableOpacity>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navBtn: {
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },

  scroll: {
    padding: 16,
    gap: 12,
  },

  // Summary card
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  summaryLeft: {
    alignItems: 'center',
    gap: 6,
    width: 76,
  },
  bigRating: {
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 50,
  },
  reviewCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryRight: {
    flex: 1,
    gap: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breakdownStar: {
    fontSize: 11,
    fontWeight: '500',
    width: 20,
    textAlign: 'right',
  },
  barBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownPct: {
    fontSize: 11,
    width: 28,
    textAlign: 'right',
  },

  // Filter tabs
  tabs: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
  },
  tabTextActive: {
    fontWeight: '600',
  },

  // Review card
  reviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  reviewCardHighlight: {
    borderColor: BLUE,
    borderWidth: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  reviewMeta: {
    flex: 1,
    gap: 4,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewDate: {
    fontSize: 12,
  },
  sessionBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 0,
  },
  sessionBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  comment: {
    fontSize: 14,
    lineHeight: 21,
  },

  // Reply box
  replyBox: {
    borderLeftWidth: 3,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  replyLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  replyText: {
    fontSize: 13,
    lineHeight: 19,
  },

  // Reply button
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
  },
  replyBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Empty
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 36,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  overlayKAV: {
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 16,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  quoteBox: {
    borderRadius: 10,
    padding: 12,
    gap: 3,
  },
  quoteClient: {
    fontSize: 13,
    fontWeight: '600',
  },
  quoteComment: {
    fontSize: 13,
    lineHeight: 18,
  },
  replyInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 110,
    marginTop: -4,
  },
  sendBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: -4,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
