import {
  Bell,
  Check,
  ChevronRight,
  FileText,
  Globe,
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
import { type Language, useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
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
  icon: Icon, label, value, onPress, colors,
}: {
  icon: IconComponent;
  label: string;
  value?: string;
  onPress?: () => void;
  colors: Theme;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
      <View style={[styles.rowIcon, { backgroundColor: colors.iconBg }]}>
        <Icon size={17} color={BLUE} strokeWidth={2} />
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
  icon: Icon, label, value, onChange, colors,
}: {
  icon: IconComponent;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  colors: Theme;
}) {
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: colors.iconBg }]}>
        <Icon size={17} color={BLUE} strokeWidth={2} />
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

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'lt', label: 'Lietuvių' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const colors = isDarkMode ? DARK : LIGHT;
  const [langOpen, setLangOpen] = useState(false);

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
        <View style={[styles.avatar, { backgroundColor: colors.avatarBg, borderColor: colors.avatarBorder }]}>
          <Text style={styles.avatarInitials}>AB</Text>
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>Augustinas Barkus</Text>
        <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>augustinas@example.com</Text>
        <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
          <Text style={styles.editBtnText}>{t.settings.editProfile}</Text>
        </TouchableOpacity>
      </View>

      {/* Account */}
      <Section title={t.settings.sections.account} colors={colors}>
        <SettingsRow icon={User} label={t.settings.rows.profile} colors={colors} />
        <Divider colors={colors} />
        <SettingsRow icon={Bell} label={t.settings.rows.notifications} colors={colors} />
        <Divider colors={colors} />
        <SettingsRow icon={Shield} label={t.settings.rows.privacy} colors={colors} />
      </Section>

      {/* Preferences */}
      <Section title={t.settings.sections.preferences} colors={colors}>
        {/* Language row — inline dropdown */}
        <TouchableOpacity style={styles.row} onPress={() => setLangOpen(v => !v)} activeOpacity={0.6}>
          <View style={[styles.rowIcon, { backgroundColor: colors.iconBg }]}>
            <Globe size={17} color={BLUE} strokeWidth={2} />
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
        <SettingsRow icon={MapPin} label={t.settings.rows.location} colors={colors} />
        <Divider colors={colors} />
        <ToggleRow
          icon={Moon}
          label={t.settings.rows.darkMode}
          value={isDarkMode}
          onChange={toggleDarkMode}
          colors={colors}
        />
      </Section>

      {/* Support */}
      <Section title={t.settings.sections.support} colors={colors}>
        <SettingsRow icon={LifeBuoy} label={t.settings.rows.helpCenter} colors={colors} />
        <Divider colors={colors} />
        <SettingsRow icon={Star} label={t.settings.rows.rateApp} colors={colors} />
        <Divider colors={colors} />
        <SettingsRow icon={Mail} label={t.settings.rows.contactUs} colors={colors} />
      </Section>

      {/* About */}
      <Section title={t.settings.sections.about} colors={colors}>
        <SettingsRow icon={Info} label={t.settings.rows.version} value="1.0.0" colors={colors} />
        <Divider colors={colors} />
        <SettingsRow icon={FileText} label={t.settings.rows.termsOfService} colors={colors} />
        <Divider colors={colors} />
        <SettingsRow icon={Shield} label={t.settings.rows.privacyPolicy} colors={colors} />
      </Section>

      {/* Log Out */}
      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: colors.logoutBg, borderColor: colors.logoutBorder }]}
        activeOpacity={0.8}>
        <LogOut size={18} color="#EF4444" strokeWidth={2} />
        <Text style={styles.logoutText}>{t.settings.logOut}</Text>
      </TouchableOpacity>

    </ScrollView>
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: '700',
    color: BLUE,
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
  editBtn: {
    marginTop: 14,
    paddingHorizontal: 24,
    paddingVertical: 9,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: BLUE,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: BLUE,
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
