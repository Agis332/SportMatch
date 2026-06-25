import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';

const SECTIONS = [
  {
    title: 'Data We Collect',
    body: 'We collect information you provide directly when creating an account, such as your name, email address, phone number, and profile photo. We also collect booking and payment data, usage data including pages visited and features used, device information such as OS version and device model, and location data if you grant permission. We collect only the data necessary to provide and improve the SportMatch service.',
  },
  {
    title: 'How We Use Your Data',
    body: 'We use your personal data to create and manage your account, process bookings and payments, connect you with trainers that match your preferences, send booking confirmations, reminders, and service notifications, improve and personalise your experience on the platform, and comply with legal obligations. We do not use your data for automated decision-making that produces legal effects without human oversight.',
  },
  {
    title: 'Data Sharing',
    body: 'We share your data with trainers you book sessions with, to the extent necessary to fulfil the booking. We use trusted third-party service providers for payment processing (Stripe), cloud hosting, analytics, and customer support. These providers are contractually obligated to protect your data and may not use it for their own purposes. We do not sell your personal data to third parties. We may disclose data if required by law or to protect our legal rights.',
  },
  {
    title: 'Cookies and Tracking',
    body: 'SportMatch uses cookies and similar tracking technologies to maintain your session, remember your preferences, and analyse how the service is used. Analytics cookies help us understand which features are most useful. You can control cookie preferences through your device settings. Disabling certain cookies may affect the functionality of the application. We do not use third-party advertising cookies.',
  },
  {
    title: 'Data Security',
    body: 'We implement industry-standard security measures to protect your personal data, including TLS encryption for data in transit, AES-256 encryption for sensitive data at rest, regular security audits and penetration testing, and strict access controls limiting who can access personal data. While we take reasonable precautions, no method of transmission over the internet is completely secure. We will notify you promptly in the event of a data breach affecting your personal information.',
  },
  {
    title: 'Your Rights',
    body: 'Under applicable data protection law you have the right to access the personal data we hold about you, correct inaccurate or incomplete data, request deletion of your data ("right to be forgotten"), restrict or object to certain processing activities, receive your data in a portable format, and withdraw consent at any time where processing is based on consent. To exercise any of these rights, contact us at privacy@sportmatch.app. We will respond within 30 days.',
  },
  {
    title: 'Contact Us',
    body: 'If you have any questions, concerns, or complaints about this Privacy Policy or our data practices, please contact our Data Protection Officer at:\n\nSportMatch UAB\nGedimino pr. 1, Vilnius, Lithuania\nprivacy@sportmatch.app\n\nYou also have the right to lodge a complaint with the Lithuanian State Data Protection Inspectorate (vdai.lrv.lt) if you believe your rights have been violated.',
  },
];

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const bg            = isDarkMode ? '#111827' : '#FFFFFF';
  const headerBg      = isDarkMode ? '#111827' : '#FFFFFF';
  const borderColor   = isDarkMode ? '#1F2937' : '#F3F4F6';
  const textPrimary   = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub       = isDarkMode ? '#9CA3AF' : '#6B7280';
  const sectionBg     = isDarkMode ? '#1F2937' : '#F9FAFB';
  const sectionBorder = isDarkMode ? '#374151' : '#F3F4F6';

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
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Privacy Policy</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}>

        <Text style={[styles.lastUpdated, { color: textSub }]}>Last updated: 1 June 2026</Text>
        <Text style={[styles.intro, { color: textSub }]}>
          This Privacy Policy explains how SportMatch collects, uses, and protects your personal information when you use our application and services.
        </Text>

        {SECTIONS.map((section, i) => (
          <View key={i} style={[styles.section, { backgroundColor: sectionBg, borderColor: sectionBorder }]}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>{section.title}</Text>
            <Text style={[styles.sectionBody, { color: textSub }]}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
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

  scroll: {
    padding: 20,
    gap: 12,
  },
  lastUpdated: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  intro: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
  },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
  },
});
