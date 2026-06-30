import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  Bell,
  CalendarClock,
  Camera,
  Check,
  ChevronRight,
  Wallet,
  Dumbbell,
  Edit3,
  FileText,
  Globe,
  Info,
  LifeBuoy,
  LogOut,
  Mail,
  MapPin,
  Moon,
  Shield,
  Sliders,
  Smartphone,
  Star,
  Users,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContactModal } from '@/components/contact-modal';
import { RateModal } from '@/components/rate-modal';
import { type Language, useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useTrainerStats } from '@/context/TrainerStatsContext';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'lt', label: 'Lietuvių' },
];

const BLUE = '#208AEF';

const CLIENT_FEATURES = [
  'Browse and book trainers near you',
  'Manage and track your bookings',
  'Chat directly with your trainers',
  'Leave reviews and track your progress',
];

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

export default function TrainerProfileScreen() {
  const insets         = useSafeAreaInsets();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const trainerStats   = useTrainerStats();
  const { language, setLanguage } = useLanguage();

  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [avatarUri,       setAvatarUri]       = useState<string | null>(null);
  const [showRating,      setShowRating]      = useState(false);
  const [showContact,     setShowContact]     = useState(false);
  const [langOpen,        setLangOpen]        = useState(false);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  }

  const bg             = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg       = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg         = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor    = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary    = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub        = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor       = isDarkMode ? '#374151' : '#F3F4F6';
  const switchTrackOff = isDarkMode ? '#374151' : '#E5E7EB';
  const chevronColor   = isDarkMode ? '#6B7280' : '#D1D5DB';
  const logoutBg       = isDarkMode ? '#2D1515' : '#FEF2F2';
  const logoutBorder   = isDarkMode ? '#7F1D1D' : '#FECACA';
  const switchBg       = isDarkMode ? '#1A2535' : '#F0F6FF';
  const switchBorder   = isDarkMode ? '#2D3F5A' : '#DBEAFE';

  function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: textSub }]}>{title}</Text>
        <View style={[styles.card, { backgroundColor: cardBg }]}>{children}</View>
      </View>
    );
  }

  function Divider() {
    return <View style={[styles.divider, { backgroundColor: divColor }]} />;
  }

  function NavRow({
    icon: Icon, iconColor, iconBg, label, value, onPress,
  }: {
    icon: IconComponent; iconColor: string; iconBg: string;
    label: string; value?: string; onPress?: () => void;
  }) {
    return (
      <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
        <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
          <Icon size={16} color={iconColor} strokeWidth={2} />
        </View>
        <Text style={[styles.rowLabel, { color: textPrimary, flex: 1 }]}>{label}</Text>
        <View style={styles.rowRight}>
          {value && <Text style={[styles.rowValue, { color: textSub }]}>{value}</Text>}
          <ChevronRight size={16} color={chevronColor} strokeWidth={2} />
        </View>
      </TouchableOpacity>
    );
  }

  function ToggleRow({
    icon: Icon, iconColor, iconBg, label, value, onChange,
  }: {
    icon: IconComponent; iconColor: string; iconBg: string;
    label: string; value: boolean; onChange: (v: boolean) => void;
  }) {
    return (
      <View style={styles.row}>
        <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
          <Icon size={16} color={iconColor} strokeWidth={2} />
        </View>
        <Text style={[styles.rowLabel, { color: textPrimary, flex: 1 }]}>{label}</Text>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: switchTrackOff, true: BLUE }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={switchTrackOff}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <Dumbbell size={18} color={BLUE} strokeWidth={2} />
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>

        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrap}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
              <View style={[styles.avatar, { backgroundColor: isDarkMode ? '#1E3A5F' : '#DBEAFE', borderColor: isDarkMode ? '#374151' : '#FFFFFF' }]}>
                {avatarUri
                  ? <Image source={{ uri: avatarUri }} style={styles.avatarPhoto} />
                  : <Text style={styles.avatarInitials}>MP</Text>}
              </View>
            </TouchableOpacity>
            <View style={styles.cameraBadge}>
              <Camera size={11} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </View>
          <Text style={[styles.profileName, { color: textPrimary }]}>Mantas Petrauskas</Text>
          <Text style={[styles.profileEmail, { color: textSub }]}>mantas@example.com</Text>
        </View>

        {/* Stats strip */}
        <View style={[styles.statsStrip, { backgroundColor: cardBg, borderColor }]}>
          {[
            { value: String(trainerStats.totalClients), label: 'Clients' },
            { value: String(trainerStats.rating),       label: 'Rating'  },
            { value: '€1,240',                          label: 'Earned'  },
          ].map((s, i, arr) => (
            <View key={s.label} style={[styles.statItem, i < arr.length - 1 && { borderRightWidth: 1, borderRightColor: divColor }]}>
              <Text style={[styles.statValue, { color: textPrimary }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: textSub }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Account */}
        <Section title="ACCOUNT">
          <NavRow
            icon={Edit3}
            iconColor={BLUE}
            iconBg={isDarkMode ? '#1E3A5F' : '#EFF6FF'}
            label="Edit Profile"
            onPress={() => router.push('/trainer/manage-profile' as never)}
          />
          <Divider />
          <NavRow
            icon={Star}
            iconColor="#D97706"
            iconBg={isDarkMode ? '#451A03' : '#FFFBEB'}
            label="My Reviews"
            onPress={() => router.push('/trainer/reviews' as never)}
          />
          <Divider />
          <NavRow
            icon={Users}
            iconColor="#16A34A"
            iconBg={isDarkMode ? '#052E16' : '#F0FDF4'}
            label="Client Sessions"
            onPress={() => router.push('/trainer-mode/sessions' as never)}
          />
          <Divider />
          <NavRow
            icon={Shield}
            iconColor="#DC2626"
            iconBg={isDarkMode ? '#450A0A' : '#FEF2F2'}
            label="Security"
            onPress={() => router.push('/security' as never)}
          />
          <Divider />
          <NavRow
            icon={Smartphone}
            iconColor="#208AEF"
            iconBg={isDarkMode ? '#1E3A5F' : '#EFF6FF'}
            label="Verify Identity"
            onPress={() => router.push('/trainer/verify-identity' as never)}
          />
          <Divider />
          <NavRow
            icon={Wallet}
            iconColor="#8B5CF6"
            iconBg={isDarkMode ? '#2E1065' : '#EDE9FE'}
            label="Finances"
            onPress={() => router.push('/trainer-mode/finances' as never)}
          />
        </Section>

        {/* Availability & Bookings */}
        <Section title="AVAILABILITY & BOOKINGS">
          <NavRow
            icon={CalendarClock}
            iconColor="#8B5CF6"
            iconBg={isDarkMode ? '#2E1065' : '#EDE9FE'}
            label="Set Availability"
            onPress={() => router.push('/trainer/availability' as never)}
          />
          <Divider />
          <NavRow
            icon={Sliders}
            iconColor="#0D9488"
            iconBg={isDarkMode ? '#042F2E' : '#F0FDFA'}
            label="Session Settings"
            onPress={() => router.push('/trainer-mode/session-settings' as never)}
          />
        </Section>

        {/* Preferences */}
        <Section title="PREFERENCES">
          <NavRow
            icon={Bell}
            iconColor="#F59E0B"
            iconBg={isDarkMode ? '#451A03' : '#FFFBEB'}
            label="Notifications"
            onPress={() => router.push('/trainer-mode/notification-settings' as never)}
          />
          <Divider />
          <TouchableOpacity style={styles.row} onPress={() => setLangOpen(v => !v)} activeOpacity={0.6}>
            <View style={[styles.rowIcon, { backgroundColor: isDarkMode ? '#052E16' : '#F0FDF4' }]}>
              <Globe size={16} color="#22C55E" strokeWidth={2} />
            </View>
            <Text style={[styles.rowLabel, { color: textPrimary, flex: 1 }]}>Language</Text>
            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, { color: textSub }]}>
                {LANGUAGES.find(l => l.code === language)?.label}
              </Text>
              <ChevronRight
                size={16}
                color={chevronColor}
                strokeWidth={2}
                style={{ transform: [{ rotate: langOpen ? '90deg' : '0deg' }] }}
              />
            </View>
          </TouchableOpacity>
          {langOpen && (
            <View style={[styles.langDropdown, { borderTopColor: divColor }]}>
              {LANGUAGES.map((lang, i) => (
                <View key={lang.code}>
                  <TouchableOpacity
                    style={styles.langOption}
                    onPress={() => { setLanguage(lang.code); setLangOpen(false); }}
                    activeOpacity={0.6}>
                    <Text style={[styles.langOptionText,
                      { color: language === lang.code ? BLUE : textPrimary },
                      language === lang.code && { fontWeight: '600' }]}>
                      {lang.label}
                    </Text>
                    {language === lang.code && (
                      <Check size={16} color={BLUE} strokeWidth={2.5} />
                    )}
                  </TouchableOpacity>
                  {i < LANGUAGES.length - 1 && (
                    <View style={[styles.langOptionDivider, { backgroundColor: divColor }]} />
                  )}
                </View>
              ))}
            </View>
          )}
          <Divider />
          <NavRow
            icon={MapPin}
            iconColor="#0D9488"
            iconBg={isDarkMode ? '#042F2E' : '#F0FDFA'}
            label="Location"
            onPress={() => router.push('/location' as never)}
          />
          <Divider />
          <ToggleRow
            icon={Moon}
            iconColor="#7C3AED"
            iconBg={isDarkMode ? '#2E1065' : '#F5F3FF'}
            label="Dark Mode"
            value={isDarkMode}
            onChange={toggleDarkMode}
          />
        </Section>

        {/* Support */}
        <Section title="SUPPORT">
          <NavRow
            icon={LifeBuoy}
            iconColor="#EA580C"
            iconBg={isDarkMode ? '#431407' : '#FFF7ED'}
            label="Help Center"
            onPress={() => router.push('/help-center' as never)}
          />
          <Divider />
          <NavRow
            icon={Star}
            iconColor="#D97706"
            iconBg={isDarkMode ? '#2D1A00' : '#FFFBEB'}
            label="Rate App"
            onPress={() => setShowRating(true)}
          />
          <Divider />
          <NavRow
            icon={Mail}
            iconColor={BLUE}
            iconBg={isDarkMode ? '#1E3A5F' : '#EFF6FF'}
            label="Contact Us"
            onPress={() => setShowContact(true)}
          />
        </Section>

        {/* About */}
        <Section title="ABOUT">
          <NavRow
            icon={Info}
            iconColor="#6B7280"
            iconBg={isDarkMode ? '#374151' : '#F3F4F6'}
            label="Version"
            value="1.0.0"
          />
          <Divider />
          <NavRow
            icon={FileText}
            iconColor="#4F46E5"
            iconBg={isDarkMode ? '#1E1B4B' : '#EEF2FF'}
            label="Terms of Service"
            onPress={() => router.push('/terms' as never)}
          />
          <Divider />
          <NavRow
            icon={Shield}
            iconColor="#DC2626"
            iconBg={isDarkMode ? '#450A0A' : '#FEF2F2'}
            label="Privacy Policy"
            onPress={() => router.push('/privacy' as never)}
          />
        </Section>

        {/* Switch to Client Mode */}
        <TouchableOpacity
          style={[styles.switchModeBtn, { backgroundColor: switchBg, borderColor: switchBorder }]}
          onPress={() => setShowSwitchModal(true)}
          activeOpacity={0.7}>
          <Dumbbell size={18} color={BLUE} strokeWidth={2} />
          <Text style={[styles.switchModeText, { color: BLUE }]}>Switch to Client Mode</Text>
        </TouchableOpacity>

        {/* Switch to Client Mode confirmation sheet */}
        <Modal
          visible={showSwitchModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSwitchModal(false)}>
          <Pressable style={styles.switchOverlay} onPress={() => setShowSwitchModal(false)}>
            <Pressable style={[styles.switchSheet, { backgroundColor: cardBg }]} onPress={() => {}}>
              <View style={styles.switchHandle} />

              <Text style={[styles.switchTitle, { color: textPrimary }]}>Switch to Client Mode</Text>
              <Text style={[styles.switchDesc, { color: textSub }]}>
                You will be switched back to the client view. You can return to Trainer Mode anytime from Settings.
              </Text>

              <View style={[styles.switchFeatureList, { backgroundColor: isDarkMode ? '#374151' : '#F9FAFB', borderColor: isDarkMode ? '#4B5563' : '#F3F4F6' }]}>
                {CLIENT_FEATURES.map((f, i) => (
                  <View key={i} style={styles.switchFeatureRow}>
                    <Check size={16} color={BLUE} strokeWidth={2.5} />
                    <Text style={[styles.switchFeatureText, { color: textPrimary }]}>{f}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.switchConfirmBtn}
                onPress={() => router.replace('/(tabs)' as never)}
                activeOpacity={0.85}>
                <Text style={styles.switchConfirmText}>Switch to Client Mode</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.switchCancelBtn, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}
                onPress={() => setShowSwitchModal(false)}
                activeOpacity={0.7}>
                <Text style={[styles.switchCancelText, { color: textSub }]}>Cancel</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Log Out */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: logoutBg, borderColor: logoutBorder }]}
          onPress={() => router.replace('/(tabs)' as never)}
          activeOpacity={0.8}>
          <LogOut size={18} color="#EF4444" strokeWidth={2} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {showRating && (
        <RateModal isDarkMode={isDarkMode} onClose={() => setShowRating(false)} />
      )}
      {showContact && (
        <ContactModal isDarkMode={isDarkMode} onClose={() => setShowContact(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },

  scroll: {
    padding: 16,
    gap: 8,
  },

  // Profile card
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: '700',
    color: BLUE,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 2,
  },

  // Stats strip
  statsStrip: {
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },

  // Section wrapper
  section: {
    gap: 8,
    marginTop: 8,
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    paddingHorizontal: 4,
  },

  // Card
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 14,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: 14,
  },

  // Divider (indented to align with text)
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 62,
  },

  // Bottom buttons
  // Switch to Client Mode bottom sheet
  switchOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  switchSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 14,
    alignItems: 'center',
  },
  switchHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginBottom: 4,
  },
  switchTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  switchDesc: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  switchFeatureList: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  switchFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchFeatureText: {
    fontSize: 14,
    flex: 1,
  },
  switchConfirmBtn: {
    width: '100%',
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  switchConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  switchCancelBtn: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  switchCancelText: {
    fontSize: 15,
    fontWeight: '500',
  },

  switchModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 4,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  switchModeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },

  langDropdown: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 62,
  },
  langOptionText: {
    fontSize: 15,
    fontWeight: '400',
  },
  langOptionDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 62,
  },
});
