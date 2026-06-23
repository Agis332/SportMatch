import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Camera, Check, ChevronDown, ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';

const BLUE = '#208AEF';

const CITIES = [
  'Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys',
  'Alytus', 'Marijampolė', 'Mažeikiai', 'Jonava', 'Utena',
];

const GENDERS = ['Male', 'Female', 'Other'] as const;
type Gender = typeof GENDERS[number];

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label, value, onChangeText, placeholder, keyboardType, multiline,
  inputBg, textColor, borderColor,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  multiline?: boolean;
  inputBg: string;
  textColor: string;
  borderColor: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: textColor }]}>{label}</Text>
      <TextInput
        style={[
          styles.fieldInput,
          { backgroundColor: inputBg, color: textColor, borderColor },
          multiline && styles.fieldTextarea,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#AAAAAA"
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('Augustinas');
  const [lastName, setLastName] = useState('Barkus');
  const [email, setEmail] = useState('augustinas@example.com');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [city, setCity] = useState('Vilnius');
  const [cityOpen, setCityOpen] = useState(false);
  const [bio, setBio] = useState('');

  const bg          = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#F9FAFB';
  const inputBg     = isDarkMode ? '#1F2937' : '#F9FAFB';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = isDarkMode ? '#374151' : '#E5E7EB';
  const avatarBg    = isDarkMode ? '#1E3A5F' : '#DBEAFE';
  const divider     = isDarkMode ? '#374151' : '#F3F4F6';

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
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Edit Profile</Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
          onScrollBeginDrag={() => setCityOpen(false)}>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
                  {avatarUri
                    ? <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                    : <Text style={styles.avatarInitials}>AB</Text>}
                </View>
              </TouchableOpacity>
              <View style={styles.cameraBadge}>
                <Camera size={13} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </View>
            <Text style={[styles.avatarHint, { color: textSub }]}>Tap to change photo</Text>
          </View>

          {/* Name row */}
          <View style={styles.formSection}>
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Field
                  label="First Name" value={firstName} onChangeText={setFirstName}
                  placeholder="First name" inputBg={inputBg} textColor={textPrimary} borderColor={borderColor}
                />
              </View>
              <View style={styles.halfField}>
                <Field
                  label="Last Name" value={lastName} onChangeText={setLastName}
                  placeholder="Last name" inputBg={inputBg} textColor={textPrimary} borderColor={borderColor}
                />
              </View>
            </View>

            <Field
              label="Email" value={email} onChangeText={setEmail}
              placeholder="your@email.com" keyboardType="email-address"
              inputBg={inputBg} textColor={textPrimary} borderColor={borderColor}
            />

            <Field
              label="Phone Number" value={phone} onChangeText={setPhone}
              placeholder="+370 600 00000" keyboardType="phone-pad"
              inputBg={inputBg} textColor={textPrimary} borderColor={borderColor}
            />

            <Field
              label="Date of Birth" value={dob} onChangeText={setDob}
              placeholder="DD/MM/YYYY"
              inputBg={inputBg} textColor={textPrimary} borderColor={borderColor}
            />

            {/* Gender */}
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: textPrimary }]}>Gender</Text>
              <View style={styles.genderRow}>
                {GENDERS.map(g => {
                  const active = gender === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.genderChip,
                        { borderColor: active ? BLUE : borderColor, backgroundColor: active ? BLUE : inputBg },
                      ]}
                      onPress={() => setGender(g)}
                      activeOpacity={0.75}>
                      <Text style={[styles.genderChipText, { color: active ? '#FFFFFF' : textSub }]}>{g}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* City dropdown */}
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: textPrimary }]}>City</Text>
              <TouchableOpacity
                style={[styles.fieldInput, styles.dropdownTrigger, { backgroundColor: inputBg, borderColor }]}
                onPress={() => setCityOpen(v => !v)}
                activeOpacity={0.7}>
                <Text style={[styles.dropdownValue, { color: textPrimary }]}>{city}</Text>
                <ChevronDown
                  size={16}
                  color={textSub}
                  strokeWidth={2}
                  style={{ transform: [{ rotate: cityOpen ? '180deg' : '0deg' }] }}
                />
              </TouchableOpacity>
              {cityOpen && (
                <View style={[styles.dropdown, { backgroundColor: cardBg, borderColor }]}>
                  {CITIES.map((c, i) => (
                    <View key={c}>
                      <TouchableOpacity
                        style={styles.dropdownOption}
                        onPress={() => { setCity(c); setCityOpen(false); }}
                        activeOpacity={0.6}>
                        <Text style={[styles.dropdownOptionText, { color: city === c ? BLUE : textPrimary },
                          city === c && { fontWeight: '600' }]}>
                          {c}
                        </Text>
                        {city === c && <Check size={15} color={BLUE} strokeWidth={2.5} />}
                      </TouchableOpacity>
                      {i < CITIES.length - 1 && (
                        <View style={[styles.dropdownDivider, { backgroundColor: divider }]} />
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Bio */}
            <Field
              label="Bio" value={bio} onChangeText={setBio}
              placeholder="Tell trainers a bit about yourself, your goals, experience…"
              multiline inputBg={inputBg} textColor={textPrimary} borderColor={borderColor}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12, borderTopColor: borderColor, backgroundColor: bg }]}>
        <TouchableOpacity style={styles.saveBtn} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
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
    paddingTop: 8,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 10,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarInitials: {
    fontSize: 30,
    fontWeight: '700',
    color: BLUE,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  avatarHint: {
    fontSize: 13,
  },

  // Form
  formSection: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 8,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  fieldWrap: {
    gap: 7,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  fieldTextarea: {
    minHeight: 100,
    paddingTop: 13,
  },

  // Gender
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  genderChipText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // City dropdown
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValue: {
    fontSize: 15,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: -4,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  dropdownOptionText: {
    fontSize: 15,
  },
  dropdownDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
