import { router } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Laptop,
  Lock,
  Shield,
  Smartphone,
  Trash2,
  X,
} from 'lucide-react-native';
import { useState } from 'react';
import {
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

import { useTheme } from '@/context/ThemeContext';

const BLUE = '#208AEF';

const LOGIN_ACTIVITY = [
  {
    id: '1',
    device: 'iPhone 15 Pro',
    DeviceIcon: Smartphone,
    location: 'Vilnius, Lithuania',
    time: 'Active now',
    current: true,
  },
  {
    id: '2',
    device: 'MacBook Pro',
    DeviceIcon: Laptop,
    location: 'Vilnius, Lithuania',
    time: 'Yesterday, 21:34',
    current: false,
  },
  {
    id: '3',
    device: 'iPhone 15 Pro',
    DeviceIcon: Smartphone,
    location: 'Kaunas, Lithuania',
    time: '20 Jun, 14:22',
    current: false,
  },
];

// ─── Delete Account Modal ─────────────────────────────────────────────────────

const DELETE_REASONS = [
  'Too expensive',
  'Found another app',
  'Not using it enough',
  'Privacy concerns',
  'Other',
];

const WHAT_WILL_BE_LOST = [
  'All upcoming and past bookings',
  'Your entire message history',
  'Saved payment methods',
  'Trainer reviews and ratings',
  'Profile data and preferences',
];

function DeleteAccountModal({ isDarkMode, onClose }: { isDarkMode: boolean; onClose: () => void }) {
  const [step,        setStep]        = useState<1 | 2 | 3 | 'done'>(1);
  const [reason,      setReason]      = useState('');
  const [otherText,   setOtherText]   = useState('');
  const [password,    setPassword]    = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const sheetBg     = isDarkMode ? '#1F2937' : '#FFFFFF';
  const textColor   = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const inputBg     = isDarkMode ? '#374151' : '#F9FAFB';
  const inputBorder = isDarkMode ? '#4B5563' : '#E5E7EB';
  const chipBg      = isDarkMode ? '#374151' : '#F3F4F6';
  const selectedBg  = isDarkMode ? '#1E3A5F' : '#EFF6FF';

  function handleClose() {
    setStep(1); setReason(''); setOtherText(''); setPassword(''); setShowPassword(false);
    onClose();
  }

  const canContinueStep2 = reason !== '' && (reason !== 'Other' || otherText.trim().length > 0);

  // ── Step 1: Warning ──────────────────────────────────────────────────────────
  if (step === 1) return (
    <Modal visible transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={[styles.sheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
          <View style={styles.sheetHandle} />
          <View style={styles.deleteWarningIcon}>
            <Trash2 size={28} color="#EF4444" strokeWidth={2} />
          </View>
          <Text style={[styles.sheetTitle, { color: textColor, textAlign: 'center' }]}>
            Delete Your Account?
          </Text>
          <Text style={[styles.sheetSub, { color: textSub, textAlign: 'center' }]}>
            This action is permanent and cannot be undone. You will lose:
          </Text>
          <View style={[styles.lossList, { backgroundColor: isDarkMode ? '#374151' : '#FEF2F2', borderColor: '#FCA5A5' }]}>
            {WHAT_WILL_BE_LOST.map((item, i) => (
              <View key={i} style={styles.lossItem}>
                <View style={styles.lossBullet} />
                <Text style={[styles.lossText, { color: isDarkMode ? '#FCA5A5' : '#B91C1C' }]}>{item}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.continueDeleteBtn}
            onPress={() => setStep(2)}
            activeOpacity={0.85}>
            <Text style={styles.continueDeleteBtnText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClose} activeOpacity={0.7} style={styles.cancelTextBtn}>
            <Text style={[styles.cancelTextBtnText, { color: textSub }]}>Keep my account</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );

  // ── Step 2: Reason ───────────────────────────────────────────────────────────
  if (step === 2) return (
    <Modal visible transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={[styles.sheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={() => setStep(1)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <ChevronLeft size={22} color={textSub} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={[styles.sheetTitle, { color: textColor }]}>Why are you leaving?</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={textSub} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.sheetSub, { color: textSub }]}>
            Your feedback helps us improve SportMatch.
          </Text>
          <View style={styles.reasonList}>
            {DELETE_REASONS.map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.reasonRow, { backgroundColor: reason === r ? selectedBg : chipBg }]}
                onPress={() => setReason(r)}
                activeOpacity={0.7}>
                <Text style={[styles.reasonText, { color: reason === r ? '#208AEF' : textColor }]}>{r}</Text>
                {reason === r && (
                  <View style={styles.reasonCheck}>
                    <Text style={styles.reasonCheckMark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          {reason === 'Other' && (
            <TextInput
              style={[styles.otherInput, { backgroundColor: inputBg, borderColor: inputBorder, color: textColor }]}
              value={otherText}
              onChangeText={setOtherText}
              placeholder="Please describe your reason…"
              placeholderTextColor="#AAAAAA"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              autoFocus
            />
          )}
          <TouchableOpacity
            style={[styles.continueDeleteBtn, !canContinueStep2 && styles.continueDeleteBtnDisabled]}
            onPress={() => canContinueStep2 && setStep(3)}
            activeOpacity={0.85}>
            <Text style={styles.continueDeleteBtnText}>Continue</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );

  // ── Step 3: Password confirmation ────────────────────────────────────────────
  if (step === 3) return (
    <Modal visible transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={[styles.sheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={() => setStep(2)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <ChevronLeft size={22} color={textSub} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={[styles.sheetTitle, { color: textColor }]}>Confirm Deletion</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={textSub} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.sheetSub, { color: textSub }]}>
            Enter your current password to permanently delete your account. This cannot be undone.
          </Text>
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: textColor }]}>Current Password</Text>
            <View style={[styles.passwordInputRow, { backgroundColor: inputBg, borderColor: inputBorder }]}>
              <TextInput
                style={[styles.passwordInput, { color: textColor }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                placeholder="Enter your password"
                placeholderTextColor="#AAAAAA"
                autoFocus
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                {showPassword
                  ? <EyeOff size={18} color={textSub} strokeWidth={2} />
                  : <Eye    size={18} color={textSub} strokeWidth={2} />}
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.redBtn, password.trim().length === 0 && styles.continueDeleteBtnDisabled]}
            onPress={() => { if (password.trim().length > 0) setStep('done'); }}
            activeOpacity={0.85}>
            <Text style={styles.continueDeleteBtnText}>Confirm & Delete Account</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );

  // ── Done ─────────────────────────────────────────────────────────────────────
  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => {}}>
      <View style={[styles.doneScreen, { backgroundColor: sheetBg }]}>
        <View style={styles.doneIcon}>
          <Text style={styles.doneIconText}>✓</Text>
        </View>
        <Text style={[styles.doneTitle, { color: textColor }]}>Account Deleted</Text>
        <Text style={[styles.doneSub, { color: textSub }]}>
          Your account has been permanently deleted. All your data has been removed from our servers.
        </Text>
        <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/')} activeOpacity={0.85}>
          <Text style={styles.doneBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────

function ChangePasswordModal({ isDarkMode, onClose }: { isDarkMode: boolean; onClose: () => void }) {
  const [current,  setCurrent]  = useState('');
  const [next,     setNext]     = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext,    setShowNext]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const sheetBg    = isDarkMode ? '#1F2937' : '#FFFFFF';
  const textColor  = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub    = isDarkMode ? '#9CA3AF' : '#6B7280';
  const inputBg    = isDarkMode ? '#374151' : '#F9FAFB';
  const inputBorder = isDarkMode ? '#4B5563' : '#E5E7EB';

  const canSave = current.length > 0 && next.length >= 8 && next === confirm;

  function handleSave() {
    onClose();
    // password saved
  }

  function PasswordField({
    label, value, onChange, show, onToggle,
  }: {
    label: string; value: string; onChange: (v: string) => void;
    show: boolean; onToggle: () => void;
  }) {
    return (
      <View style={styles.fieldWrap}>
        <Text style={[styles.fieldLabel, { color: textColor }]}>{label}</Text>
        <View style={[styles.passwordInputRow, { backgroundColor: inputBg, borderColor: inputBorder }]}>
          <TextInput
            style={[styles.passwordInput, { color: textColor }]}
            value={value}
            onChangeText={onChange}
            secureTextEntry={!show}
            autoCapitalize="none"
            placeholder="••••••••"
            placeholderTextColor="#AAAAAA"
          />
          <TouchableOpacity onPress={onToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            {show
              ? <EyeOff size={18} color={textSub} strokeWidth={2} />
              : <Eye    size={18} color={textSub} strokeWidth={2} />}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: textColor }]}>Change Password</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={textSub} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <PasswordField label="Current Password" value={current} onChange={setCurrent}
            show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />
          <PasswordField label="New Password" value={next} onChange={setNext}
            show={showNext} onToggle={() => setShowNext(v => !v)} />
          {next.length > 0 && next.length < 8 && (
            <Text style={styles.passwordHint}>Password must be at least 8 characters</Text>
          )}
          <PasswordField label="Confirm New Password" value={confirm} onChange={setConfirm}
            show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
          {confirm.length > 0 && next !== confirm && (
            <Text style={styles.passwordHint}>Passwords do not match</Text>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!canSave}
            activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Save Password</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SecurityScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const [twoFA,             setTwoFA]             = useState(false);
  const [googleConnected,   setGoogleConnected]   = useState(true);
  const [appleConnected,    setAppleConnected]    = useState(false);
  const [showPwModal,       setShowPwModal]       = useState(false);
  const [showDeleteModal,   setShowDeleteModal]   = useState(false);

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const cardBorder  = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const borderColor = isDarkMode ? '#1F2937' : '#F3F4F6';
  const dividerColor = isDarkMode ? '#374151' : '#F3F4F6';
  const switchOff   = isDarkMode ? '#374151' : '#E5E7EB';

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
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Security</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}>

        {/* ── Password ── */}
        <SectionHeader title="Password" />
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <TouchableOpacity style={styles.row} onPress={() => setShowPwModal(true)} activeOpacity={0.7}>
            <View style={[styles.rowIcon, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}>
              <Lock size={17} color={BLUE} strokeWidth={2} />
            </View>
            <View style={styles.rowBody}>
              <Text style={[styles.rowLabel, { color: textPrimary }]}>Change Password</Text>
              <Text style={[styles.rowSub, { color: textSub }]}>Last changed: June 2026</Text>
            </View>
            <ChevronRight size={18} color={textSub} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* ── Two-Factor Authentication ── */}
        <SectionHeader title="Two-Factor Authentication" />
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: isDarkMode ? '#14532D' : '#F0FDF4' }]}>
              <Shield size={17} color="#22C55E" strokeWidth={2} />
            </View>
            <View style={styles.rowBody}>
              <Text style={[styles.rowLabel, { color: textPrimary }]}>Two-Factor Authentication</Text>
              <Text style={[styles.rowSub, { color: textSub }]}>Add extra security to your account</Text>
            </View>
            <Switch
              value={twoFA}
              onValueChange={setTwoFA}
              trackColor={{ false: switchOff, true: BLUE }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={switchOff}
            />
          </View>
          {twoFA && (
            <>
              <View style={[styles.divider, { backgroundColor: dividerColor }]} />
              <View style={styles.twoFANote}>
                <Text style={[styles.twoFANoteText, { color: textSub }]}>
                  You will be asked for a verification code each time you log in. We recommend using an authenticator app.
                </Text>
              </View>
            </>
          )}
        </View>

        {/* ── Login Activity ── */}
        <SectionHeader title="Login Activity" />
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {LOGIN_ACTIVITY.map((item, i) => {
            const Icon = item.DeviceIcon;
            return (
              <View key={item.id}>
                <View style={styles.loginRow}>
                  <View style={[styles.loginIcon, {
                    backgroundColor: item.current
                      ? (isDarkMode ? '#14532D' : '#F0FDF4')
                      : (isDarkMode ? '#374151' : '#F3F4F6'),
                  }]}>
                    <Icon size={16} color={item.current ? '#22C55E' : textSub} strokeWidth={2} />
                  </View>
                  <View style={styles.loginInfo}>
                    <View style={styles.loginTopRow}>
                      <Text style={[styles.loginDevice, { color: textPrimary }]}>{item.device}</Text>
                      {item.current && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>Current</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.loginLocation, { color: textSub }]}>{item.location}</Text>
                    <Text style={[styles.loginTime, { color: item.current ? '#22C55E' : textSub }]}>
                      {item.time}
                    </Text>
                  </View>
                </View>
                {i < LOGIN_ACTIVITY.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: dividerColor, marginHorizontal: 16 }]} />
                )}
              </View>
            );
          })}
        </View>

        {/* ── Connected Accounts ── */}
        <SectionHeader title="Connected Accounts" />
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {/* Google */}
          <View style={styles.row}>
            <View style={[styles.connectedLogo, { backgroundColor: '#FEF2F2' }]}>
              <Text style={styles.connectedLogoText}>G</Text>
            </View>
            <View style={styles.rowBody}>
              <Text style={[styles.rowLabel, { color: textPrimary }]}>Google</Text>
              <Text style={[styles.rowSub, { color: googleConnected ? '#22C55E' : textSub }]}>
                {googleConnected ? 'Connected' : 'Not connected'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.connectedBtn, { borderColor: googleConnected ? '#EF444430' : BLUE + '30' }]}
              onPress={() => setGoogleConnected(v => !v)}
              activeOpacity={0.7}>
              <Text style={[styles.connectedBtnText, { color: googleConnected ? '#EF4444' : BLUE }]}>
                {googleConnected ? 'Disconnect' : 'Connect'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Apple */}
          <View style={styles.row}>
            <View style={[styles.connectedLogo, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
              <Text style={[styles.connectedLogoText, { color: isDarkMode ? '#FFFFFF' : '#111827' }]}>
              </Text>
            </View>
            <View style={styles.rowBody}>
              <Text style={[styles.rowLabel, { color: textPrimary }]}>Apple</Text>
              <Text style={[styles.rowSub, { color: appleConnected ? '#22C55E' : textSub }]}>
                {appleConnected ? 'Connected' : 'Not connected'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.connectedBtn, { borderColor: appleConnected ? '#EF444430' : BLUE + '30' }]}
              onPress={() => setAppleConnected(v => !v)}
              activeOpacity={0.7}>
              <Text style={[styles.connectedBtnText, { color: appleConnected ? '#EF4444' : BLUE }]}>
                {appleConnected ? 'Disconnect' : 'Connect'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Danger Zone ── */}
        <SectionHeader title="Danger Zone" />
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.dangerZoneContent}>
            <Text style={[styles.dangerZoneDesc, { color: textSub }]}>
              Once you delete your account, there is no going back. All your data will be permanently removed.
            </Text>
            <TouchableOpacity
              style={[styles.smallDeleteBtn, { borderColor: isDarkMode ? '#4B5563' : '#E5E7EB' }]}
              onPress={() => setShowDeleteModal(true)}
              activeOpacity={0.7}>
              <Text style={[styles.smallDeleteBtnText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {showPwModal && (
        <ChangePasswordModal isDarkMode={isDarkMode} onClose={() => setShowPwModal(false)} />
      )}
      {showDeleteModal && (
        <DeleteAccountModal isDarkMode={isDarkMode} onClose={() => setShowDeleteModal(false)} />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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

  // 2FA note
  twoFANote: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  twoFANoteText: {
    fontSize: 13,
    lineHeight: 19,
  },

  // Login activity
  loginRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  loginIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  loginInfo: {
    flex: 1,
    gap: 2,
  },
  loginTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginDevice: {
    fontSize: 14,
    fontWeight: '600',
  },
  currentBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  loginLocation: {
    fontSize: 13,
  },
  loginTime: {
    fontSize: 12,
  },

  // Connected accounts
  connectedLogo: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  connectedLogoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  connectedBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexShrink: 0,
  },
  connectedBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Danger zone
  // Danger zone
  dangerZoneContent: {
    padding: 16,
    gap: 14,
    alignItems: 'flex-start',
  },
  dangerZoneDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  smallDeleteBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  smallDeleteBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Delete account modal
  deleteWarningIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  lossList: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  lossItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lossBullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    flexShrink: 0,
  },
  lossText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  continueDeleteBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  continueDeleteBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueDeleteBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelTextBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  cancelTextBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reasonList: {
    gap: 8,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  reasonText: {
    fontSize: 15,
  },
  reasonCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#208AEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasonCheckMark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  otherInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 80,
  },
  redBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  doneScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  doneIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  doneIconText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  doneTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  doneSub: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  doneBtn: {
    backgroundColor: '#208AEF',
    borderRadius: 14,
    paddingHorizontal: 40,
    paddingVertical: 14,
    marginTop: 8,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Change password modal
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
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sheetSub: {
    fontSize: 14,
    lineHeight: 20,
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  passwordInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  passwordHint: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: -6,
  },
  saveBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
