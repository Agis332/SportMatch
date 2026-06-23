import { router } from 'expo-router';
import { ChevronDown, ChevronLeft, Mail, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContactModal } from '@/components/contact-modal';
import { useTheme } from '@/context/ThemeContext';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSection {
  id: string;
  title: string;
  emoji: string;
  items: FaqItem[];
}

const FAQ: FaqSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    emoji: '🚀',
    items: [
      {
        q: 'How to book a session?',
        a: 'Browse trainers on the home screen, tap a trainer card to view their profile, then tap "Book Session". Select your preferred date, time, and session type, fill in your details, and confirm. You\'ll receive a confirmation notification once the trainer accepts.',
      },
      {
        q: 'How to find a trainer?',
        a: 'Use the home screen to browse trainers by city. Filter by sport using the chips at the top. You can also search by trainer name or sport using the search button. Tap any trainer card to view their full profile, reviews, and availability.',
      },
      {
        q: 'How to cancel a booking?',
        a: 'Go to Settings → My Bookings, find the booking you want to cancel under the Upcoming tab, and tap "Cancel". Cancellations made more than 24 hours before the session are fully refunded. Late cancellations may incur a fee per the trainer\'s policy.',
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    emoji: '💳',
    items: [
      {
        q: 'What payment methods are accepted?',
        a: 'SportMatch accepts Visa and Mastercard credit/debit cards, Apple Pay, and Google Pay. You can manage your saved payment methods in Settings → Payment Methods.',
      },
      {
        q: 'How to get a refund?',
        a: 'Refunds are processed automatically when you cancel a booking within the eligible window. Refunds typically appear on your statement within 3–5 business days. For disputes or issues, contact our support team via Settings → Contact Us.',
      },
      {
        q: 'When am I charged?',
        a: 'Your payment method is charged immediately when you confirm a booking. For pending bookings, the charge is placed as an authorisation hold and only captured once the trainer accepts your request.',
      },
    ],
  },
  {
    id: 'trainers',
    title: 'Trainers',
    emoji: '🏋️',
    items: [
      {
        q: 'How are trainers verified?',
        a: 'Verified trainers (shown with a green badge ✅) have submitted proof of professional qualifications, identity documents, and insurance. Our team reviews each application before granting verified status. Verification ensures you\'re training with qualified professionals.',
      },
      {
        q: 'How to become a trainer?',
        a: 'Trainer applications are coming soon. If you\'re a certified fitness professional interested in listing your services on SportMatch, please contact us at trainers@sportmatch.lt and we\'ll get in touch when applications open.',
      },
      {
        q: 'How to leave a review?',
        a: 'After a completed session, you\'ll receive a notification prompting you to leave a review. You can also go to Settings → My Bookings, find the session under the Past tab, and tap "Leave Review". Reviews help other users find great trainers.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    emoji: '👤',
    items: [
      {
        q: 'How to change my password?',
        a: 'Go to Settings → Edit Profile and scroll to the Security section. Tap "Change Password", enter your current password followed by your new password twice, and tap Save. For forgotten passwords, use "Forgot Password?" on the login screen.',
      },
      {
        q: 'How to delete my account?',
        a: 'Account deletion is permanent and cannot be undone. To delete your account, contact our support team at support@sportmatch.lt with the subject "Delete Account". We\'ll process your request within 7 business days and confirm by email.',
      },
      {
        q: 'How to update my profile?',
        a: 'Go to Settings → Edit Profile to update your name, email, phone number, date of birth, city, and bio. Tap your profile photo to change it. Tap "Save Changes" when done. Your updated profile is visible to trainers you book with.',
      },
    ],
  },
];

// ─── Accordion item ───────────────────────────────────────────────────────────

function FaqRow({ item, isDarkMode }: { item: FaqItem; isDarkMode: boolean }) {
  const [open, setOpen] = useState(false);

  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divider     = isDarkMode ? '#374151' : '#F3F4F6';
  const answerBg    = isDarkMode ? '#111827' : '#F9FAFB';

  return (
    <View>
      <TouchableOpacity
        style={styles.faqRow}
        onPress={() => setOpen(v => !v)}
        activeOpacity={0.7}>
        <Text style={[styles.faqQuestion, { color: textPrimary }]}>{item.q}</Text>
        <ChevronDown
          size={18}
          color={textSub}
          strokeWidth={2}
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>
      {open && (
        <View style={[styles.faqAnswer, { backgroundColor: answerBg, borderTopColor: divider }]}>
          <Text style={[styles.faqAnswerText, { color: textSub }]}>{item.a}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HelpCenterScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const [query, setQuery] = useState('');
  const [showContact, setShowContact] = useState(false);

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const cardBorder  = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = isDarkMode ? '#1F2937' : '#F3F4F6';
  const searchBg    = isDarkMode ? '#1F2937' : '#F3F4F6';
  const divider     = isDarkMode ? '#374151' : '#F3F4F6';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ;
    return FAQ.map(section => ({
      ...section,
      items: section.items.filter(
        item => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
      ),
    })).filter(s => s.items.length > 0);
  }, [query]);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Help Center</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Search */}
        <View style={[styles.searchBar, { backgroundColor: searchBg }]}>
          <Search size={16} color={textSub} strokeWidth={2} />
          <TextInput
            style={[styles.searchInput, { color: textPrimary }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search questions…"
            placeholderTextColor={textSub}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {/* FAQ sections */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>No results found</Text>
            <Text style={[styles.emptySub, { color: textSub }]}>
              Try different keywords or browse the categories below.
            </Text>
          </View>
        ) : (
          filtered.map(section => (
            <View key={section.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionEmoji}>{section.emoji}</Text>
                <Text style={[styles.sectionTitle, { color: textPrimary }]}>{section.title}</Text>
              </View>
              <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                {section.items.map((item, i) => (
                  <View key={item.q}>
                    <FaqRow item={item} isDarkMode={isDarkMode} />
                    {i < section.items.length - 1 && (
                      <View style={[styles.itemDivider, { backgroundColor: divider }]} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))
        )}

        {/* Still need help? */}
        <View style={[styles.helpCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.helpTitle, { color: textPrimary }]}>Still need help?</Text>
          <Text style={[styles.helpSub, { color: textSub }]}>
            Our support team is here for you Mon–Fri, 9AM–6PM.
          </Text>
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => setShowContact(true)}
            activeOpacity={0.85}>
            <Mail size={16} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.contactBtnText}>Contact Us</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {showContact && (
        <ContactModal isDarkMode={isDarkMode} onClose={() => setShowContact(false)} />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
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

  // Scroll
  scroll: {
    padding: 16,
    gap: 20,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },

  // Section
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  sectionEmoji: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  // FAQ row
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 22,
  },
  itemDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 10,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 4,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },

  // Still need help
  helpCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  helpSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#208AEF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 4,
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
