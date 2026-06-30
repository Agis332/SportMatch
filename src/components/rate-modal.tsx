import { Star } from 'lucide-react-native';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export function RateModal({ isDarkMode, onClose }: { isDarkMode: boolean; onClose: () => void }) {
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
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={[s.sheet, { backgroundColor: sheetBg }]} onPress={() => {}}>

          {submitted ? (
            <View style={s.thanksWrap}>
              <Text style={s.thanksEmoji}>🎉</Text>
              <Text style={[s.thanksTitle, { color: textPrimary }]}>Thank you!</Text>
              <Text style={[s.thanksSub, { color: textSub }]}>
                Your feedback helps us improve SportMatch.
              </Text>
            </View>
          ) : (
            <>
              <View style={s.logoMark}>
                <Text style={s.logoMarkText}>S</Text>
              </View>
              <Text style={[s.logoTitle, { color: textPrimary }]}>SportMatch</Text>
              <Text style={[s.subtitle, { color: textSub }]}>Enjoying SportMatch?</Text>

              <View style={s.starsRow}>
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

              <TextInput
                style={[s.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }]}
                value={feedback}
                onChangeText={setFeedback}
                placeholder="Any feedback? (optional)"
                placeholderTextColor="#AAAAAA"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[s.submitBtn, rating === 0 && s.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={rating === 0}
                activeOpacity={0.85}>
                <Text style={s.submitBtnText}>Submit Rating</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Text style={[s.laterText, { color: textSub }]}>Maybe Later</Text>
              </TouchableOpacity>
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
