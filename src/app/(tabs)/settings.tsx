import {
  Bell,
  Calendar,
  Camera,
  Check,
  ChevronRight,
  CreditCard,
  Dumbbell,
  FileText,
  Globe,
  Heart,
  Info,
  LifeBuoy,
  LogOut,
  Mail,
  MapPin,
  Moon,
  Shield,
  Star,
  User,
} from 'lucide-react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ContactModal } from '@/components/contact-modal';
import { type Language, useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BLUE = '#208AEF';

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

interface Theme {
  bg: string;
  card: string;
  text: string;
  textSecondary: string;
  iconBg: string;
  avatarBg: string;
  avatarBorder: string;
  divider: string;
  chevron: string;
  switchTrackOff: string;
  logoutBg: string;
  logoutBorder: string;
}

const LIGHT: Theme = {
  bg: '#F3F4F6',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  iconBg: '#EFF6FF',
  avatarBg: '#DBEAFE',
  avatarBorder: '#FFFFFF',
  divider: '#F3F4F6',
  chevron: '#D1D5DB',
  switchTrackOff: '#E5E7EB',
  logoutBg: '#FEF2F2',
  logoutBorder: '#FECACA',
};

const DARK: Theme = {
  bg: '#111827',
  card: '#1F2937',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  iconBg: '#1E3A5F',
  avatarBg: '#1E3A5F',
  avatarBorder: '#374151',
  divider: '#374151',
  chevron: '#6B7280',
  switchTrackOff: '#374151',
  logoutBg: '#2D1515',
  logoutBorder: '#7F1D1D',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SettingsRow({
  icon: Icon, label, value, onPress, colors, iconColor, rowIconBg,
}: {
  icon: IconComponent;
  label: string;
  value?: string;
  onPress?: () => void;
  colors: Theme;
  iconColor?: string;
  rowIconBg?: string;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
      <View style={[styles.rowIcon, { backgroundColor: rowIconBg ?? colors.iconBg }]}>
        <Icon size={17} color={iconColor ?? BLUE} strokeWidth={2} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{value}</Text> : null}
        <ChevronRight size={16} color={colors.chevron} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
}

function ToggleRow({
  icon: Icon, label, value, onChange, colors, iconColor, rowIconBg,
}: {
  icon: IconComponent;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  colors: Theme;
  iconColor?: string;
  rowIconBg?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: rowIconBg ?? colors.iconBg }]}>
        <Icon size={17} color={iconColor ?? BLUE} strokeWidth={2} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.switchTrackOff, true: BLUE }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={colors.switchTrackOff}
      />
    </View>
  );
}

function Section({
  title, children, colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: Theme;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>{children}</View>
    </View>
  );
}

function Divider({ colors }: { colors: Theme }) {
  return <View style={[styles.divider, { backgroundColor: colors.divider }]} />;
}

// ─── Screen ──────────────────────────────────────────────────────────────────

// ─── Rate app modal ───────────────────────────────────────────────────────────

function RateModal({ isDarkMode, onClose }: { isDarkMode: boolean; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const sheetBg     = isDarkMode ? '#1F2937' : '#FFFFFF';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const inputBg     = isDarkMode ? '#374151' : '#F9FAFB';
  const inputBorder = isDarkMode ? '#4B5563' : '#E5E7EB';

  function handleSubmit() {
    setSubmitted(true);
    setTimeout(onClose, 1800);
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={rateStyles.overlay} onPress={onClose}>
        <Pressable style={[rateStyles.sheet, { backgroundColor: sheetBg }]} onPress={() => {}}>

          {submitted ? (
            /* Thank you state */
            <View style={rateStyles.thanksWrap}>
              <Text style={rateStyles.thanksEmoji}>🎉</Text>
              <Text style={[rateStyles.thanksTitle, { color: textPrimary }]}>Thank you!</Text>
              <Text style={[rateStyles.thanksSub, { color: textSub }]}>
                Your feedback helps us improve SportMatch.
              </Text>
            </View>
          ) : (
            <>
              {/* Logo */}
              <View style={rateStyles.logoMark}>
                <Text style={rateStyles.logoMarkText}>S</Text>
              </View>
              <Text style={[rateStyles.logoTitle, { color: textPrimary }]}>SportMatch</Text>
              <Text style={[rateStyles.subtitle, { color: textSub }]}>Enjoying SportMatch?</Text>

              {/* Stars */}
              <View style={rateStyles.starsRow}>
                {[1, 2, 3, 4, 5].map(n => (
                  <TouchableOpacity key={n} onPress={() => setRating(n)} activeOpacity={0.7}>
                    <Star
                      size={40}
                      color="#F59E0B"
                      fill={n <= rating ? '#F59E0B' : 'transparent'}
                      strokeWidth={n <= rating ? 0 : 1.5}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Feedback */}
              <TextInput
                style={[rateStyles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }]}
                value={feedback}
                onChangeText={setFeedback}
                placeholder="Any feedback? (optional)"
                placeholderTextColor="#AAAAAA"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* Submit */}
              <TouchableOpacity
                style={[rateStyles.submitBtn, rating === 0 && rateStyles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={rating === 0}
                activeOpacity={0.85}>
                <Text style={rateStyles.submitBtnText}>Submit Rating</Text>
              </TouchableOpacity>

              {/* Maybe later */}
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Text style={[rateStyles.laterText, { color: textSub }]}>Maybe Later</Text>
              </TouchableOpacity>
            </>
          )}

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const rateStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  sheet: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#208AEF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  logoMarkText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: -4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    marginTop: -6,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 14,
    minHeight: 80,
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#208AEF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  laterText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: -4,
  },
  thanksWrap: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  thanksEmoji: {
    fontSize: 48,
  },
  thanksTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  thanksSub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

// ─────────────────────────────────────────────────────────────────────────────

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'lt', label: 'Lietuvių' },
];

// ─── Trainer mode modal ───────────────────────────────────────────────────────

const TRAINER_FEATURES = [
  'Set your availability and working hours',
  'Accept and manage session bookings',
  'Manage your client relationships',
  'Track earnings and payment history',
];

function TrainerModeModal({ isDarkMode, onClose }: { isDarkMode: boolean; onClose: () => void }) {
  const sheetBg    = isDarkMode ? '#1F2937' : '#FFFFFF';
  const textColor  = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub    = isDarkMode ? '#9CA3AF' : '#6B7280';
  const featureBg  = isDarkMode ? '#374151' : '#F9FAFB';
  const featureBorder = isDarkMode ? '#4B5563' : '#F3F4F6';

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={tmStyles.overlay} onPress={onClose}>
        <Pressable style={[tmStyles.sheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
          <View style={tmStyles.handle} />

          {/* Icon + title */}
          <View style={tmStyles.iconWrap}>
            <Dumbbell size={28} color="#EA580C" strokeWidth={2} />
          </View>
          <Text style={[tmStyles.title, { color: textColor }]}>Switch to Trainer Mode</Text>
          <Text style={[tmStyles.sub, { color: textSub }]}>
            Manage your training sessions, clients and schedule — all in one place.
          </Text>

          {/* Feature list */}
          <View style={[tmStyles.featureList, { backgroundColor: featureBg, borderColor: featureBorder }]}>
            {TRAINER_FEATURES.map((f, i) => (
              <View key={i} style={tmStyles.featureRow}>
                <View style={tmStyles.featureDot} />
                <Text style={[tmStyles.featureText, { color: textColor }]}>{f}</Text>
              </View>
            ))}
          </View>

          {/* Buttons */}
          <TouchableOpacity
            style={tmStyles.primaryBtn}
            onPress={() => { onClose(); router.push('/trainer/dashboard'); }}
            activeOpacity={0.85}>
            <Text style={tmStyles.primaryBtnText}>Switch to Trainer Mode</Text>
          </TouchableOpacity>
          <TouchableOpacity style={tmStyles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={[tmStyles.cancelBtnText, { color: textSub }]}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const tmStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 14,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginBottom: 4,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
  featureList: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EA580C',
    flexShrink: 0,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#208AEF',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 6,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '500',
  },
});

// ─────────────────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const colors = isDarkMode ? DARK : LIGHT;
  const [langOpen, setLangOpen] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

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

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
      ]}
      showsVerticalScrollIndicator={false}
      onScrollBeginDrag={() => setLangOpen(false)}>

      {/* Profile */}
      <View style={styles.profile}>
        <View style={styles.avatarWrap}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            <View style={[styles.avatar, { backgroundColor: colors.avatarBg, borderColor: colors.avatarBorder }]}>
              {avatarUri
                ? <Image source={{ uri: avatarUri }} style={styles.avatarPhoto} />
                : <Text style={styles.avatarInitials}>AB</Text>}
            </View>
          </TouchableOpacity>
          <View style={styles.cameraBadge}>
            <Camera size={11} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>Augustinas Barkus</Text>
        <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>augustinas@example.com</Text>
      </View>

      {/* Account */}
      <Section title={t.settings.sections.account} colors={colors}>
        <SettingsRow
          icon={User} label={t.settings.rows.editProfile}
          onPress={() => router.push('/edit-profile')}
          iconColor="#208AEF" rowIconBg={isDarkMode ? '#1E3A5F' : '#EFF6FF'}
          colors={colors} />
        <Divider colors={colors} />
        <SettingsRow
          icon={Heart} label={t.settings.rows.savedTrainers}
          onPress={() => router.push('/favorites')}
          iconColor="#EF4444" rowIconBg={isDarkMode ? '#450A0A' : '#FEF2F2'}
          colors={colors} />
        <Divider colors={colors} />
        <SettingsRow
          icon={Calendar} label={t.settings.rows.myBookings}
          onPress={() => router.push('/bookings')}
          iconColor="#22C55E" rowIconBg={isDarkMode ? '#052E16' : '#F0FDF4'}
          colors={colors} />
        <Divider colors={colors} />
        <SettingsRow
          icon={CreditCard} label={t.settings.rows.paymentMethods}
          onPress={() => router.push('/payment-methods')}
          iconColor="#8B5CF6" rowIconBg={isDarkMode ? '#2E1065' : '#EDE9FE'}
          colors={colors} />
        <Divider colors={colors} />
        <SettingsRow
          icon={Bell} label={t.settings.rows.notifications}
          onPress={() => router.push('/notifications')}
          iconColor="#F59E0B" rowIconBg={isDarkMode ? '#451A03' : '#FFFBEB'}
          colors={colors} />
        <Divider colors={colors} />
        <SettingsRow
          icon={Dumbbell} label="Switch to Trainer Mode"
          onPress={() => setShowTrainerModal(true)}
          iconColor="#EA580C" rowIconBg={isDarkMode ? '#431407' : '#FFF7ED'}
          colors={colors} />
      </Section>

      {/* Preferences */}
      <Section title={t.settings.sections.preferences} colors={colors}>
        {/* Language row — inline dropdown */}
        <TouchableOpacity style={styles.row} onPress={() => setLangOpen(v => !v)} activeOpacity={0.6}>
          <View style={[styles.rowIcon, { backgroundColor: isDarkMode ? '#052E16' : '#F0FDF4' }]}>
            <Globe size={17} color="#22C55E" strokeWidth={2} />
          </View>
          <Text style={[styles.rowLabel, { color: colors.text }]}>{t.settings.rows.language}</Text>
          <View style={styles.rowRight}>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
              {LANGUAGES.find(l => l.code === language)?.label}
            </Text>
            <ChevronRight
              size={16}
              color={colors.chevron}
              strokeWidth={2}
              style={{ transform: [{ rotate: langOpen ? '90deg' : '0deg' }] }}
            />
          </View>
        </TouchableOpacity>
        {langOpen && (
          <View style={[styles.langDropdown, { borderTopColor: colors.divider }]}>
            {LANGUAGES.map((lang, i) => (
              <View key={lang.code}>
                <TouchableOpacity
                  style={styles.langOption}
                  onPress={() => { setLanguage(lang.code); setLangOpen(false); }}
                  activeOpacity={0.6}>
                  <Text style={[styles.langOptionText, { color: language === lang.code ? BLUE : colors.text },
                    language === lang.code && { fontWeight: '600' }]}>
                    {lang.label}
                  </Text>
                  {language === lang.code && (
                    <Check size={16} color={BLUE} strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
                {i < LANGUAGES.length - 1 && (
                  <View style={[styles.langOptionDivider, { backgroundColor: colors.divider }]} />
                )}
              </View>
            ))}
          </View>
        )}
        <Divider colors={colors} />
        <SettingsRow icon={MapPin} label={t.settings.rows.location}
          onPress={() => router.push('/location')}
          iconColor="#0D9488" rowIconBg={isDarkMode ? '#042F2E' : '#F0FDFA'}
          colors={colors} />
        <Divider colors={colors} />
        <ToggleRow
          icon={Moon}
          label={t.settings.rows.darkMode}
          value={isDarkMode}
          onChange={toggleDarkMode}
          iconColor="#7C3AED" rowIconBg={isDarkMode ? '#2E1065' : '#F5F3FF'}
          colors={colors}
        />
      </Section>

      {/* Support */}
      <Section title={t.settings.sections.support} colors={colors}>
        <SettingsRow
          icon={Shield} label="Security"
          onPress={() => router.push('/security')}
          iconColor="#208AEF" rowIconBg={isDarkMode ? '#1E3A5F' : '#EFF6FF'}
          colors={colors} />
        <Divider colors={colors} />
        <SettingsRow icon={LifeBuoy} label={t.settings.rows.helpCenter}
          onPress={() => router.push('/help-center')}
          iconColor="#EA580C" rowIconBg={isDarkMode ? '#431407' : '#FFF7ED'}
          colors={colors} />
        <Divider colors={colors} />
        <SettingsRow icon={Star} label={t.settings.rows.rateApp} onPress={() => setShowRating(true)}
          iconColor="#D97706" rowIconBg={isDarkMode ? '#2D1A00' : '#FFFBEB'}
          colors={colors} />
        <Divider colors={colors} />
        <SettingsRow icon={Mail} label={t.settings.rows.contactUs} onPress={() => setShowContact(true)}
          iconColor="#208AEF" rowIconBg={isDarkMode ? '#1E3A5F' : '#EFF6FF'}
          colors={colors} />
      </Section>

      {/* About */}
      <Section title={t.settings.sections.about} colors={colors}>
        <SettingsRow icon={Info} label={t.settings.rows.version} value="1.0.0"
          iconColor="#6B7280" rowIconBg={isDarkMode ? '#1F2937' : '#F3F4F6'}
          colors={colors} />
        <Divider colors={colors} />
        <SettingsRow icon={FileText} label={t.settings.rows.termsOfService}
          iconColor="#4F46E5" rowIconBg={isDarkMode ? '#1E1B4B' : '#EEF2FF'}
          colors={colors} onPress={() => router.push('/terms')} />
        <Divider colors={colors} />
        <SettingsRow icon={Shield} label={t.settings.rows.privacyPolicy}
          iconColor="#DC2626" rowIconBg={isDarkMode ? '#450A0A' : '#FEF2F2'}
          colors={colors} onPress={() => router.push('/privacy')} />
      </Section>

      {/* Log Out */}
      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: colors.logoutBg, borderColor: colors.logoutBorder }]}
        activeOpacity={0.8}>
        <LogOut size={18} color="#EF4444" strokeWidth={2} />
        <Text style={styles.logoutText}>{t.settings.logOut}</Text>
      </TouchableOpacity>

    </ScrollView>

    {showRating && (
      <RateModal isDarkMode={isDarkMode} onClose={() => setShowRating(false)} />
    )}
    {showContact && (
      <ContactModal isDarkMode={isDarkMode} onClose={() => setShowContact(false)} />
    )}
    {showTrainerModal && (
      <TrainerModeModal isDarkMode={isDarkMode} onClose={() => setShowTrainerModal(false)} />
    )}
    </View>
  );
}

// ─── Styles (layout only — no colors here) ───────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 8,
  },

  // Profile
  profile: {
    alignItems: 'center',
    paddingVertical: 24,
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
    fontWeight: '400',
    marginTop: 2,
  },
  // Section
  section: {
    gap: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    flex: 1,
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
    fontWeight: '400',
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 62,
  },

  // Log Out
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },

  // Language inline dropdown
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
