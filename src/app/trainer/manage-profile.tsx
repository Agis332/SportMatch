import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { BadgeCheck, Camera, ChevronDown, ChevronLeft, Clock, Plus, Trash2, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Image,
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
import { useTrainerProfile } from '@/context/TrainerProfileContext';

const BLUE = '#208AEF';

const SPORTS = [
  'Football', 'Basketball', 'Tennis', 'Swimming', 'Boxing',
  'Yoga', 'CrossFit', 'Running', 'Martial Arts', 'Cycling',
  'Volleyball', 'Golf', 'Badminton', 'Table Tennis', 'Athletics',
  'Gymnastics', 'Dance', 'Pilates', 'Hockey', 'Rugby',
];

const SPORT_EMOJI: Record<string, string> = {
  Football: '⚽', Basketball: '🏀', Tennis: '🎾', Swimming: '🏊',
  Boxing: '🥊', Yoga: '🧘', CrossFit: '💪', Running: '🏃',
  'Martial Arts': '🥋', Cycling: '🚴', Volleyball: '🏐', Golf: '⛳',
  Badminton: '🏸', 'Table Tennis': '🏓', Athletics: '🏅',
  Gymnastics: '🤸', Dance: '💃', Pilates: '🧎', Hockey: '🏑', Rugby: '🏉',
};

const CITIES = [
  'Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys',
  'Alytus', 'Marijampolė', 'Mažeikiai', 'Jonava', 'Utena',
];

const EXPERIENCE_OPTIONS = ['< 1 year', '1–2 years', '3–5 years', '5–10 years', '10+ years'];

interface Certificate {
  id: string;
  name: string;
  uri: string;
  verified: boolean;
}

let certCounter = 0;
function newCertId() { return `cert_${++certCounter}`; }

// ─── Reusable field ───────────────────────────────────────────────────────────

function Field({
  label, value, onChangeText, placeholder, keyboardType, multiline,
  inputBg, textColor, borderColor,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder: string; keyboardType?: 'default' | 'phone-pad' | 'numeric' | 'email-address';
  multiline?: boolean; inputBg: string; textColor: string; borderColor: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: textColor }]}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, { backgroundColor: inputBg, color: textColor, borderColor },
          multiline && styles.fieldTextarea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#AAAAAA"
        keyboardType={keyboardType ?? 'default'}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        autoCapitalize={keyboardType === 'numeric' || keyboardType === 'email-address' ? 'none' : 'words'}
      />
    </View>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, textSub }: { title: string; textSub: string }) {
  return <Text style={[styles.sectionHeader, { color: textSub }]}>{title.toUpperCase()}</Text>;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ManageProfileScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  // Profile photo
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Basic info
  const [firstName,   setFirstName]   = useState('Augustinas');
  const [lastName,    setLastName]    = useState('Barkus');
  const [email,       setEmail]       = useState('augustinas.barkus@gmail.com');
  const [phone,       setPhone]       = useState('+370 612 34567');
  const [gender,      setGender]      = useState<'Male' | 'Female' | null>(null);
  const [dob,         setDob]         = useState('');
  const [bio,         setBio]         = useState('');
  const [experience,  setExperience]  = useState('3–5 years');
  const [rate,        setRate]        = useState('35');
  const [expOpen,     setExpOpen]     = useState(false);

  // Sports
  const [selectedSports,  setSelectedSports]  = useState<string[]>([]);
  const [showSportModal,  setShowSportModal]   = useState(false);
  const [sportSearch,     setSportSearch]      = useState('');

  // Training locations (from shared context)
  const { locations, addLocation: ctxAddLocation, removeLocation } = useTrainerProfile();
  const [showLocModal,  setShowLocModal]  = useState(false);
  const [draftCity,     setDraftCity]     = useState('Vilnius');
  const [draftAddress,  setDraftAddress]  = useState('');
  const [draftCityOpen, setDraftCityOpen] = useState(false);

  // Certificates
  const [certs, setCerts] = useState<Certificate[]>([
    { id: 'cert_0', name: 'UEFA C License', uri: '', verified: true },
  ]);

  // Colors
  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const inputBg     = isDarkMode ? '#1F2937' : '#F9FAFB';
  const borderColor = isDarkMode ? '#374151' : '#E5E7EB';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor    = isDarkMode ? '#374151' : '#F3F4F6';
  const chipBg      = isDarkMode ? '#374151' : '#F3F4F6';
  const sheetBg     = isDarkMode ? '#1F2937' : '#FFFFFF';

  // ── Image pickers ────────────────────────────────────────────────────────────

  async function pickAvatar() {
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

  async function pickCertificate() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      setCerts(prev => [...prev, {
        id: newCertId(),
        name: '',
        uri: result.assets[0].uri,
        verified: false,
      }]);
    }
  }

  // ── Sport picker ─────────────────────────────────────────────────────────────

  function selectSport(sport: string) {
    setSelectedSports([sport]);
    setShowSportModal(false);
    setSportSearch('');
  }

  const filteredSports = sportSearch.trim()
    ? SPORTS.filter(s => s.toLowerCase().includes(sportSearch.toLowerCase()))
    : SPORTS;

  // ── Certificate helpers ───────────────────────────────────────────────────────

  function updateCertName(id: string, name: string) {
    setCerts(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  }

  function deleteCert(id: string) {
    setCerts(prev => prev.filter(c => c.id !== id));
  }

  function addLocation() {
    if (!draftAddress.trim()) return;
    ctxAddLocation(draftCity, draftAddress);
    setDraftAddress('');
    setDraftCity('Vilnius');
    setShowLocModal(false);
  }

  function deleteLocation(id: string) {
    removeLocation(id);
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg, borderBottomColor: divColor }]}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Manage Profile</Text>
        <View style={styles.navBtn} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* ── Profile Photo ── */}
          <SectionHeader title="Profile Photo" textSub={textSub} />
          <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.photoRow}>
              <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8}>
                <View style={[styles.avatar, { backgroundColor: isDarkMode ? '#1E3A5F' : '#DBEAFE' }]}>
                  {avatarUri
                    ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                    : <Text style={styles.avatarInitials}>AB</Text>}
                </View>
                <View style={[styles.cameraBadge, { backgroundColor: BLUE }]}>
                  <Camera size={12} color="#FFFFFF" strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
              <View style={styles.photoInfo}>
                <Text style={[styles.photoHint, { color: textPrimary }]}>Tap to change photo</Text>
                <Text style={[styles.photoSub, { color: textSub }]}>JPG or PNG · Max 5 MB · Square crop</Text>
              </View>
            </View>
          </View>

          {/* ── Basic Info ── */}
          <SectionHeader title="Basic Info" textSub={textSub} />
          <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.formGrid}>
              <View style={styles.formRow}>
                <View style={styles.formHalf}>
                  <Field label="First Name" value={firstName} onChangeText={setFirstName}
                    placeholder="First name" inputBg={inputBg} textColor={textPrimary} borderColor={borderColor} />
                </View>
                <View style={styles.formHalf}>
                  <Field label="Last Name" value={lastName} onChangeText={setLastName}
                    placeholder="Last name" inputBg={inputBg} textColor={textPrimary} borderColor={borderColor} />
                </View>
              </View>
              <Field label="Email" value={email} onChangeText={setEmail}
                placeholder="email@example.com" keyboardType="email-address"
                inputBg={inputBg} textColor={textPrimary} borderColor={borderColor} />
              <Field label="Phone Number" value={phone} onChangeText={setPhone}
                placeholder="+370 600 00000" keyboardType="phone-pad"
                inputBg={inputBg} textColor={textPrimary} borderColor={borderColor} />
              <Field label="Date of Birth" value={dob} onChangeText={setDob}
                placeholder="DD/MM/YYYY" keyboardType="numeric"
                inputBg={inputBg} textColor={textPrimary} borderColor={borderColor} />
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: textPrimary }]}>Gender</Text>
                <View style={styles.genderRow}>
                  {(['Male', 'Female'] as const).map(g => {
                    const active = gender === g;
                    return (
                      <TouchableOpacity
                        key={g}
                        style={[styles.genderChip, { backgroundColor: active ? BLUE : chipBg }]}
                        onPress={() => setGender(g)}
                        activeOpacity={0.75}>
                        <Text style={[styles.genderChipText, { color: active ? '#FFFFFF' : textSub }]}>{g}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              <Field label="Bio" value={bio} onChangeText={setBio} multiline
                placeholder="Describe your experience, training style and specialisations…"
                inputBg={inputBg} textColor={textPrimary} borderColor={borderColor} />
              <View style={styles.formRow}>
                <View style={styles.formHalf}>
                  {/* Experience dropdown */}
                  <View style={styles.fieldWrap}>
                    <Text style={[styles.fieldLabel, { color: textPrimary }]}>Experience</Text>
                    <TouchableOpacity
                      style={[styles.dropdownBtn, { backgroundColor: inputBg, borderColor }]}
                      onPress={() => setExpOpen(true)}
                      activeOpacity={0.7}>
                      <Clock size={14} color={textSub} strokeWidth={2} />
                      <Text style={[styles.dropdownText, { color: textPrimary }]}>{experience}</Text>
                      <ChevronDown size={14} color={textSub} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.formHalf}>
                  <View style={styles.fieldWrap}>
                    <Text style={[styles.fieldLabel, { color: textPrimary }]}>Session Price (€)</Text>
                    <View style={[styles.rateRow, { backgroundColor: inputBg, borderColor }]}>
                      <Text style={[styles.rateCurrency, { color: textSub }]}>€</Text>
                      <TextInput
                        style={[styles.rateInput, { color: textPrimary }]}
                        value={rate}
                        onChangeText={v => setRate(v.replace(/[^0-9]/g, ''))}
                        placeholder="35"
                        placeholderTextColor="#AAAAAA"
                        keyboardType="numeric"
                      />
                      <Text style={[styles.rateUnit, { color: textSub }]}>/session</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* ── Sports ── */}
          <SectionHeader title="Sport" textSub={textSub} />
          <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <TouchableOpacity
              style={[styles.sportPickerRow, { borderColor }]}
              onPress={() => setShowSportModal(true)}
              activeOpacity={0.7}>
              {selectedSports[0] ? (
                <Text style={[styles.sportPickerValue, { color: textPrimary }]}>
                  {SPORT_EMOJI[selectedSports[0]]}{'  '}{selectedSports[0]}
                </Text>
              ) : (
                <Text style={[styles.sportPickerValue, { color: textSub }]}>Select sport…</Text>
              )}
              <ChevronDown size={16} color={textSub} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Sport picker modal */}
          <Modal
            visible={showSportModal}
            transparent
            animationType="slide"
            onRequestClose={() => { setShowSportModal(false); setSportSearch(''); }}>
            <Pressable
              style={styles.sportOverlay}
              onPress={() => { setShowSportModal(false); setSportSearch(''); }}>
              <Pressable style={[styles.sportSheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
                {/* Handle */}
                <View style={styles.sportHandle} />

                {/* Header */}
                <View style={[styles.sportSheetHeader, { borderBottomColor: borderColor }]}>
                  <Text style={[styles.sportSheetTitle, { color: textPrimary }]}>Select Sport</Text>
                  <TouchableOpacity
                    onPress={() => { setShowSportModal(false); setSportSearch(''); }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <X size={20} color={textSub} strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={[styles.sportSearch, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6', borderColor }]}>
                  <TextInput
                    style={[styles.sportSearchInput, { color: textPrimary }]}
                    value={sportSearch}
                    onChangeText={setSportSearch}
                    placeholder="Search sports…"
                    placeholderTextColor={textSub}
                    autoCorrect={false}
                  />
                  {sportSearch.length > 0 && (
                    <TouchableOpacity onPress={() => setSportSearch('')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <X size={15} color={textSub} strokeWidth={2} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* List */}
                <ScrollView
                  style={styles.sportList}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled">
                  {filteredSports.map((sport, i) => {
                    const selected = selectedSports[0] === sport;
                    return (
                      <View key={sport}>
                        {i > 0 && <View style={[styles.sportDivider, { backgroundColor: borderColor }]} />}
                        <TouchableOpacity
                          style={styles.sportListRow}
                          onPress={() => selectSport(sport)}
                          activeOpacity={0.6}>
                          <Text style={styles.sportListEmoji}>{SPORT_EMOJI[sport]}</Text>
                          <Text style={[styles.sportListName, { color: selected ? BLUE : textPrimary, fontWeight: selected ? '600' : '400' }]}>
                            {sport}
                          </Text>
                          {selected && (
                            <View style={styles.sportCheck}>
                              <Text style={styles.sportCheckMark}>✓</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                  {filteredSports.length === 0 && (
                    <Text style={[styles.sportNoResults, { color: textSub }]}>No sports found</Text>
                  )}
                </ScrollView>
              </Pressable>
            </Pressable>
          </Modal>

          {/* ── Training Locations ── */}
          <SectionHeader title="Training Locations" textSub={textSub} />
          <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            {locations.map(loc => (
              <View key={loc.id} style={[styles.locCard, { backgroundColor: isDarkMode ? '#374151' : '#F9FAFB', borderColor }]}>
                <View style={styles.locInfo}>
                  <Text style={[styles.locCity, { color: textPrimary }]}>{loc.city}</Text>
                  <Text style={[styles.locAddress, { color: textSub }]}>{loc.address}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => deleteLocation(loc.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}>
                  <X size={16} color="#EF4444" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.addLocBtn, { borderColor: BLUE + '60' }]}
              onPress={() => setShowLocModal(true)}
              activeOpacity={0.7}>
              <Plus size={15} color={BLUE} strokeWidth={2.5} />
              <Text style={[styles.addLocText, { color: BLUE }]}>Add Location</Text>
            </TouchableOpacity>
          </View>

          {/* ── Certifications ── */}
          <SectionHeader title="Certifications" textSub={textSub} />
          <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.cardHint, { color: textSub }]}>
              Upload photos of your certificates. Each will be reviewed by our team.
            </Text>
            {certs.length > 0 && (
              <View style={styles.certsGrid}>
                {certs.map((cert, index) => (
                  <View key={`cert-${cert.id}-${index}`} style={[styles.certCard, { backgroundColor: isDarkMode ? '#374151' : '#F9FAFB', borderColor }]}>
                    {/* Thumbnail */}
                    <View style={[styles.certThumb, { backgroundColor: isDarkMode ? '#4B5563' : '#E5E7EB' }]}>
                      {cert.uri
                        ? <Image source={{ uri: cert.uri }} style={styles.certThumbImage} />
                        : <BadgeCheck size={24} color={textSub} strokeWidth={1.5} />}
                    </View>
                    {/* Name input */}
                    <TextInput
                      style={[styles.certNameInput, { color: textPrimary, borderColor }]}
                      value={cert.name}
                      onChangeText={v => updateCertName(cert.id, v)}
                      placeholder="Certificate name"
                      placeholderTextColor="#AAAAAA"
                      autoCapitalize="words"
                    />
                    {/* Status badge */}
                    <View style={[styles.certBadge, {
                      backgroundColor: cert.verified
                        ? (isDarkMode ? '#052E16' : '#DCFCE7')
                        : (isDarkMode ? '#2D1A00' : '#FEF3C7'),
                    }]}>
                      {cert.verified
                        ? <BadgeCheck size={11} color="#16A34A" strokeWidth={2} />
                        : <Clock size={11} color="#D97706" strokeWidth={2} />}
                      <Text style={[styles.certBadgeText, { color: cert.verified ? '#16A34A' : '#D97706' }]}>
                        {cert.verified ? 'Verified' : 'Pending'}
                      </Text>
                    </View>
                    {/* Delete */}
                    <TouchableOpacity
                      style={styles.certDelete}
                      onPress={() => deleteCert(cert.id)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <X size={14} color={textSub} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={[styles.addCertBtn, { borderColor: BLUE + '60' }]}
              onPress={pickCertificate}
              activeOpacity={0.7}>
              <Plus size={16} color={BLUE} strokeWidth={2.5} />
              <Text style={[styles.addCertText, { color: BLUE }]}>Add Certificate</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12, backgroundColor: headerBg, borderTopColor: divColor }]}>
        <TouchableOpacity style={styles.saveBtn} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Experience picker */}
      {expOpen && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setExpOpen(false)}>
          <Pressable style={styles.overlayFill} onPress={() => setExpOpen(false)}>
            <Pressable style={[styles.sheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
              <View style={styles.sheetHandle} />
              <Text style={[styles.sheetTitle, { color: textPrimary }]}>Years of Experience</Text>
              {EXPERIENCE_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.sheetRow, experience === opt && { backgroundColor: BLUE + '18' }]}
                  onPress={() => { setExperience(opt); setExpOpen(false); }}
                  activeOpacity={0.7}>
                  <Text style={[styles.sheetRowText, { color: experience === opt ? BLUE : textPrimary },
                    experience === opt && { fontWeight: '700' }]}>
                    {opt}
                  </Text>
                  {experience === opt && (
                    <Text style={{ color: BLUE, fontSize: 15 }}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Add Location modal */}
      {showLocModal && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setShowLocModal(false)}>
          <Pressable style={styles.overlayFill} onPress={() => setShowLocModal(false)}>
            <Pressable style={[styles.sheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
              <View style={styles.sheetHandle} />
              <Text style={[styles.sheetTitle, { color: textPrimary }]}>Add Training Location</Text>

              {/* City selector */}
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: textPrimary }]}>City</Text>
                <TouchableOpacity
                  style={[styles.dropdownBtn, { backgroundColor: inputBg, borderColor }]}
                  onPress={() => setDraftCityOpen(v => !v)}
                  activeOpacity={0.7}>
                  <Text style={[styles.dropdownText, { color: textPrimary }]}>{draftCity}</Text>
                  <ChevronDown size={14} color={textSub} strokeWidth={2} />
                </TouchableOpacity>
                {draftCityOpen && (
                  <View style={[styles.inlineCityList, { backgroundColor: inputBg, borderColor }]}>
                    {CITIES.map(c => (
                      <TouchableOpacity
                        key={c}
                        style={[styles.inlineCityRow, draftCity === c && { backgroundColor: BLUE + '18' }]}
                        onPress={() => { setDraftCity(c); setDraftCityOpen(false); }}
                        activeOpacity={0.7}>
                        <Text style={[styles.sheetRowText, { color: draftCity === c ? BLUE : textPrimary },
                          draftCity === c && { fontWeight: '700' }]}>
                          {c}
                        </Text>
                        {draftCity === c && <Text style={{ color: BLUE }}>✓</Text>}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Address */}
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: textPrimary }]}>Address</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: inputBg, color: textPrimary, borderColor }]}
                  value={draftAddress}
                  onChangeText={setDraftAddress}
                  placeholder="e.g. Žalgirio g. 90"
                  placeholderTextColor="#AAAAAA"
                  autoCapitalize="words"
                />
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, !draftAddress.trim() && { backgroundColor: '#D1D5DB' }]}
                onPress={addLocation}
                disabled={!draftAddress.trim()}
                activeOpacity={0.85}>
                <Text style={styles.saveBtnText}>Add Location</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex:      { flex: 1 },

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
    padding: 16,
    gap: 14,
  },
  cardHint: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: -4,
  },

  // Photo
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photoInfo: {
    flex: 1,
    gap: 4,
  },
  photoHint: {
    fontSize: 14,
    fontWeight: '600',
  },
  photoSub: {
    fontSize: 12,
    lineHeight: 17,
  },

  // Form
  formGrid: {
    gap: 14,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formHalf: {
    flex: 1,
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  fieldTextarea: {
    minHeight: 100,
    paddingTop: 12,
  },

  // Dropdown
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
  },

  // Rate
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  rateCurrency: {
    fontSize: 16,
    fontWeight: '600',
  },
  rateInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  rateUnit: {
    fontSize: 14,
  },

  // Training locations
  locCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 12,
  },
  locInfo: {
    flex: 1,
    gap: 2,
  },
  locCity: {
    fontSize: 14,
    fontWeight: '600',
  },
  locAddress: {
    fontSize: 13,
  },
  addLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderStyle: 'dashed',
  },
  addLocText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inlineCityList: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
    maxHeight: 220,
  },
  inlineCityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  // Gender
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 12,
  },
  genderChipText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Sports
  // Sport picker row (inside card)
  sportPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
  },
  sportPickerValue: {
    fontSize: 15,
    flex: 1,
  },

  // Sport bottom sheet
  sportOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sportSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
  },
  sportHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  sportSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sportSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sportSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  sportSearchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  sportList: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sportListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 14,
  },
  sportListEmoji: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  sportListName: {
    flex: 1,
    fontSize: 15,
  },
  sportCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sportCheckMark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sportDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 42,
  },
  sportNoResults: {
    textAlign: 'center',
    paddingVertical: 24,
    fontSize: 14,
  },

  // Certifications
  certsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: -4,
  },
  certCard: {
    width: '47%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    gap: 8,
    position: 'relative',
  },
  certThumb: {
    height: 90,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  certThumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  certNameInput: {
    fontSize: 12,
    fontWeight: '500',
    borderBottomWidth: 1,
    paddingBottom: 4,
    paddingTop: 2,
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  certBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  certDelete: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderStyle: 'dashed',
  },
  addCertText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Bottom sheet picker
  overlayFill: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
  },
  sheetRowText: {
    fontSize: 15,
  },
});
