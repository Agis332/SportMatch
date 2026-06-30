import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, CreditCard, Smartphone } from 'lucide-react-native';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';

const TEAL = '#0D9488';
const BLUE = '#208AEF';

export default function VerifyIdentityScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const bg           = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg     = isDarkMode ? '#111827' : '#FFFFFF';
  const borderColor  = isDarkMode ? '#1F2937' : '#F3F4F6';
  const cardBg       = isDarkMode ? '#1F2937' : '#FFFFFF';
  const cardBorder   = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary  = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub      = isDarkMode ? '#9CA3AF' : '#6B7280';
  const dividerColor = isDarkMode ? '#374151' : '#F3F4F6';

  function handleOption(method: 'Smart ID' | 'Mobile ID') {
    Alert.alert(
      method,
      'Coming soon — will connect to Dokobit API.',
      [{ text: 'OK' }],
    );
  }

  function SectionHeader({ title }: { title: string }) {
    return (
      <Text style={[styles.sectionHeader, { color: textSub }]}>{title.toUpperCase()}</Text>
    );
  }

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
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Verify Identity</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}>

        <Text style={[styles.description, { color: textSub }]}>
          We require authentication to ensure security. We do not store sensitive personal
          authentication data — authentication is performed by Dokobit.
        </Text>

        <SectionHeader title="Identity Verification" />

        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>

          {/* Smart ID */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => handleOption('Smart ID')}
            activeOpacity={0.7}>
            <View style={[styles.rowIcon, { backgroundColor: isDarkMode ? '#042F2E' : '#F0FDFA' }]}>
              <CreditCard size={17} color={TEAL} strokeWidth={2} />
            </View>
            <View style={styles.rowBody}>
              <Text style={[styles.rowLabel, { color: textPrimary }]}>Smart ID</Text>
              <Text style={[styles.rowSub, { color: textSub }]}>Verify your identity via Smart ID</Text>
            </View>
            <ChevronRight size={18} color={textSub} strokeWidth={2} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Mobile ID */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => handleOption('Mobile ID')}
            activeOpacity={0.7}>
            <View style={[styles.rowIcon, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}>
              <Smartphone size={17} color={BLUE} strokeWidth={2} />
            </View>
            <View style={styles.rowBody}>
              <Text style={[styles.rowLabel, { color: textPrimary }]}>Mobile ID</Text>
              <Text style={[styles.rowSub, { color: textSub }]}>Verify your identity via Mobile ID</Text>
            </View>
            <ChevronRight size={18} color={textSub} strokeWidth={2} />
          </TouchableOpacity>

        </View>

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
    padding: 16,
    gap: 8,
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 4,
    marginBottom: 4,
  },

  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.7,
    paddingHorizontal: 4,
    marginTop: 8,
    marginBottom: 4,
  },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  rowSub: {
    fontSize: 12,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
