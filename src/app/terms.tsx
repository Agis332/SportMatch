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
    title: '1. Acceptance of Terms',
    body: 'By accessing or using SportMatch, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service. These terms apply to all users of the platform, including trainers and clients.',
  },
  {
    title: '2. Description of Service',
    body: 'SportMatch is a platform that connects individuals seeking fitness training with qualified sports coaches and personal trainers. We provide tools to discover trainers, view profiles and availability, make bookings, and process payments. SportMatch acts as an intermediary and does not directly provide training services.',
  },
  {
    title: '3. User Accounts',
    body: 'To use SportMatch you must create an account with accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must notify us immediately of any unauthorised use. We reserve the right to suspend or terminate accounts that violate these terms.',
  },
  {
    title: '4. Booking and Payments',
    body: 'Bookings made through SportMatch are subject to trainer availability and confirmation. Payments are processed securely through our third-party payment provider. By making a booking you authorise us to charge your selected payment method for the agreed session fee. All prices are shown inclusive of applicable taxes unless stated otherwise.',
  },
  {
    title: '5. Cancellation Policy',
    body: 'Cancellations made more than 24 hours before a scheduled session are eligible for a full refund. Cancellations within 24 hours may incur a cancellation fee of up to 50% of the session price. No-shows are non-refundable. Trainers may cancel sessions in exceptional circumstances; in such cases a full refund will be issued automatically.',
  },
  {
    title: '6. Trainer Responsibilities',
    body: 'Trainers on SportMatch must hold relevant qualifications and insurance as required by applicable law. They are responsible for providing safe, professional, and competent training services. Trainers must maintain accurate availability calendars, respond to booking requests promptly, and conduct sessions as agreed. Misrepresentation of qualifications is grounds for immediate removal from the platform.',
  },
  {
    title: '7. User Responsibilities',
    body: 'Users must not use SportMatch for any unlawful purpose or in a way that could harm, disable, or impair the service. You agree not to scrape, copy, or redistribute content without permission. You are responsible for your own health and fitness decisions and should consult a medical professional before beginning any new exercise programme. Harassment or abuse of trainers or other users will result in account termination.',
  },
  {
    title: '8. Privacy',
    body: 'Your use of SportMatch is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the service you consent to our collection and use of your personal data as described in the Privacy Policy. We take data protection seriously and comply with applicable data protection legislation including the GDPR.',
  },
  {
    title: '9. Limitation of Liability',
    body: 'SportMatch provides the platform on an "as is" basis without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service, including injuries sustained during training sessions. Our total liability shall not exceed the amount paid by you in the three months preceding the claim.',
  },
  {
    title: '10. Changes to Terms',
    body: 'We reserve the right to modify these Terms of Service at any time. We will notify users of significant changes via email or in-app notification. Continued use of SportMatch after changes are posted constitutes your acceptance of the updated terms. We encourage you to review these terms periodically.',
  },
];

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const bg          = isDarkMode ? '#111827' : '#FFFFFF';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const borderColor = isDarkMode ? '#1F2937' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const sectionBg   = isDarkMode ? '#1F2937' : '#F9FAFB';
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
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Terms of Service</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}>

        <Text style={[styles.lastUpdated, { color: textSub }]}>Last updated: 1 June 2026</Text>
        <Text style={[styles.intro, { color: textSub }]}>
          Please read these Terms of Service carefully before using the SportMatch application. These terms govern your access to and use of our services.
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
