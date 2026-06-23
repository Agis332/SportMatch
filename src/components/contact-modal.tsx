import { Check, ChevronRight, Mail, Phone, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const SUBJECTS = ['General', 'Bug Report', 'Billing', 'Feature Request', 'Other'] as const;
type Subject = typeof SUBJECTS[number];

export function ContactModal({ isDarkMode, onClose }: {
  isDarkMode: boolean;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState<Subject>('General');
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const sheetBg     = isDarkMode ? '#1F2937' : '#FFFFFF';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const inputBg     = isDarkMode ? '#374151' : '#F9FAFB';
  const inputBorder = isDarkMode ? '#4B5563' : '#E5E7EB';
  const dividerCol  = isDarkMode ? '#374151' : '#F3F4F6';
  const rowBg       = isDarkMode ? '#374151' : '#F9FAFB';
  const dropdownBg  = isDarkMode ? '#2D3748' : '#FFFFFF';

  function handleSend() {
    if (!message.trim()) return;
    setSent(true);
    setTimeout(onClose, 1800);
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={[s.sheet, { backgroundColor: sheetBg }]} onPress={() => setSubjectOpen(false)}>
          <View style={s.sheetHandle} />

          <View style={s.header}>
            <Text style={[s.title, { color: textPrimary }]}>Contact Us</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={textSub} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {sent ? (
            <View style={s.sentWrap}>
              <Text style={s.sentEmoji}>✉️</Text>
              <Text style={[s.sentTitle, { color: textPrimary }]}>Message Sent!</Text>
              <Text style={[s.sentSub, { color: textSub }]}>
                We'll get back to you within 24 hours.
              </Text>
            </View>
          ) : (
            <>
              {/* Contact options */}
              <View style={[s.optionsCard, { backgroundColor: rowBg, borderColor: isDarkMode ? '#4B5563' : '#E5E7EB' }]}>
                <TouchableOpacity
                  style={s.optionRow}
                  onPress={() => Linking.openURL('mailto:support@sportmatch.lt')}
                  activeOpacity={0.7}>
                  <View style={[s.optionIcon, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}>
                    <Mail size={18} color="#208AEF" strokeWidth={2} />
                  </View>
                  <View style={s.optionText}>
                    <Text style={[s.optionTitle, { color: textPrimary }]}>Email Us</Text>
                    <Text style={[s.optionSub, { color: textSub }]}>support@sportmatch.lt</Text>
                  </View>
                  <ChevronRight size={16} color={isDarkMode ? '#4B5563' : '#D1D5DB'} strokeWidth={2} />
                </TouchableOpacity>

                <View style={[s.optionDivider, { backgroundColor: dividerCol }]} />

                <TouchableOpacity
                  style={s.optionRow}
                  onPress={() => Linking.openURL('tel:+37060000000')}
                  activeOpacity={0.7}>
                  <View style={[s.optionIcon, { backgroundColor: isDarkMode ? '#052E16' : '#F0FDF4' }]}>
                    <Phone size={18} color="#22C55E" strokeWidth={2} />
                  </View>
                  <View style={s.optionText}>
                    <Text style={[s.optionTitle, { color: textPrimary }]}>Call Us</Text>
                    <Text style={[s.optionSub, { color: textSub }]}>+370 600 00000</Text>
                  </View>
                  <ChevronRight size={16} color={isDarkMode ? '#4B5563' : '#D1D5DB'} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={s.form}>
                <View style={s.fieldWrap}>
                  <Text style={[s.fieldLabel, { color: textPrimary }]}>Subject</Text>
                  <TouchableOpacity
                    style={[s.dropdownBtn, { backgroundColor: inputBg, borderColor: inputBorder }]}
                    onPress={() => setSubjectOpen(v => !v)}
                    activeOpacity={0.7}>
                    <Text style={[s.dropdownValue, { color: textPrimary }]}>{subject}</Text>
                    <ChevronRight
                      size={16} color={textSub} strokeWidth={2}
                      style={{ transform: [{ rotate: subjectOpen ? '90deg' : '0deg' }] }}
                    />
                  </TouchableOpacity>
                  {subjectOpen && (
                    <View style={[s.dropdown, { backgroundColor: dropdownBg, borderColor: inputBorder }]}>
                      {SUBJECTS.map((sub, i) => (
                        <View key={sub}>
                          <TouchableOpacity
                            style={s.dropdownOption}
                            onPress={() => { setSubject(sub); setSubjectOpen(false); }}
                            activeOpacity={0.6}>
                            <Text style={[s.dropdownOptionText,
                              { color: subject === sub ? '#208AEF' : textPrimary },
                              subject === sub && { fontWeight: '600' }]}>
                              {sub}
                            </Text>
                            {subject === sub && <Check size={14} color="#208AEF" strokeWidth={2.5} />}
                          </TouchableOpacity>
                          {i < SUBJECTS.length - 1 && (
                            <View style={[s.dropdownDivider, { backgroundColor: dividerCol }]} />
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <View style={s.fieldWrap}>
                  <Text style={[s.fieldLabel, { color: textPrimary }]}>Message</Text>
                  <TextInput
                    style={[s.textarea, { backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }]}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="How can we help you?"
                    placeholderTextColor="#AAAAAA"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    onFocus={() => setSubjectOpen(false)}
                  />
                </View>

                <TouchableOpacity
                  style={[s.sendBtn, !message.trim() && s.sendBtnDisabled]}
                  onPress={handleSend}
                  disabled={!message.trim()}
                  activeOpacity={0.85}>
                  <Text style={s.sendBtnText}>Send Message</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
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
    maxHeight: '90%',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: '700' },
  optionsCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  optionText: { flex: 1, gap: 2 },
  optionTitle: { fontSize: 14, fontWeight: '600' },
  optionSub: { fontSize: 12 },
  optionDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 14 },
  form: { gap: 14, marginBottom: 8 },
  fieldWrap: { gap: 7 },
  fieldLabel: { fontSize: 13, fontWeight: '600' },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  dropdownValue: { fontSize: 15 },
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
    paddingVertical: 12,
  },
  dropdownOptionText: { fontSize: 14 },
  dropdownDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 14 },
  textarea: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    minHeight: 110,
  },
  sendBtn: {
    backgroundColor: '#208AEF',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#D1D5DB' },
  sendBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  sentWrap: { alignItems: 'center', gap: 10, paddingVertical: 32 },
  sentEmoji: { fontSize: 48 },
  sentTitle: { fontSize: 20, fontWeight: '700' },
  sentSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
