import { router } from 'expo-router';
import { Check, ChevronLeft, CreditCard, Lock, Trash2, X } from 'lucide-react-native';
import { useState } from 'react';
import {
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

const BLUE = '#208AEF';

interface PaymentMethod {
  id: string;
  network: 'visa' | 'mastercard';
  last4: string;
  expiry: string;
  name: string;
  isDefault: boolean;
}

const INITIAL_CARDS: PaymentMethod[] = [
  { id: '1', network: 'visa',       last4: '4242', expiry: '12/27', name: 'Augustinas Barkus', isDefault: true  },
  { id: '2', network: 'mastercard', last4: '8888', expiry: '09/26', name: 'Augustinas Barkus', isDefault: false },
];

const NETWORK_CONFIG = {
  visa:       { label: 'Visa',       emoji: '💳', color: '#1A1F71', bg: '#EEF0FF' },
  mastercard: { label: 'Mastercard', emoji: '💳', color: '#EB001B', bg: '#FFF0F0' },
};

// ─── Card component ───────────────────────────────────────────────────────────

function PaymentCard({ card, isDarkMode, onDelete, onSetDefault }: {
  card: PaymentMethod;
  isDarkMode: boolean;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const cardBorder  = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const net         = NETWORK_CONFIG[card.network];

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      {/* Top row: network + default badge */}
      <View style={styles.cardTop}>
        <View style={[styles.networkBadge, { backgroundColor: isDarkMode ? '#374151' : net.bg }]}>
          <Text style={styles.networkEmoji}>{net.emoji}</Text>
          <Text style={[styles.networkLabel, { color: isDarkMode ? textPrimary : net.color }]}>
            {net.label}
          </Text>
        </View>
        <View style={styles.cardTopRight}>
          {card.isDefault && (
            <View style={styles.defaultBadge}>
              <Check size={11} color="#16A34A" strokeWidth={3} />
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}>
            <Trash2 size={17} color={isDarkMode ? '#6B7280' : '#9CA3AF'} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Card number */}
      <Text style={[styles.cardNumber, { color: textPrimary }]}>
        •••• •••• •••• {card.last4}
      </Text>

      {/* Bottom row: name + expiry */}
      <View style={styles.cardBottom}>
        <View>
          <Text style={[styles.cardMeta, { color: textSub }]}>Cardholder</Text>
          <Text style={[styles.cardMetaValue, { color: textPrimary }]}>{card.name}</Text>
        </View>
        <View style={styles.cardBottomRight}>
          <Text style={[styles.cardMeta, { color: textSub }]}>Expires</Text>
          <Text style={[styles.cardMetaValue, { color: textPrimary }]}>{card.expiry}</Text>
        </View>
      </View>

      {/* Set default link */}
      {!card.isDefault && (
        <TouchableOpacity onPress={onSetDefault} activeOpacity={0.7} style={styles.setDefaultBtn}>
          <Text style={styles.setDefaultText}>Set as default</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Add card modal ───────────────────────────────────────────────────────────

// ─── Delete confirm modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({ card, isDarkMode, onCancel, onConfirm }: {
  card: PaymentMethod;
  isDarkMode: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const sheetBg     = isDarkMode ? '#1F2937' : '#FFFFFF';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const cancelBg    = isDarkMode ? '#374151' : '#F3F4F6';
  const cancelText  = isDarkMode ? '#FFFFFF' : '#111827';
  const net         = NETWORK_CONFIG[card.network];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={[styles.deleteSheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
          <View style={styles.sheetHandle} />

          {/* Card info */}
          <View style={styles.deleteCardInfo}>
            <View style={[styles.networkBadge, { backgroundColor: isDarkMode ? '#374151' : net.bg }]}>
              <Text style={styles.networkEmoji}>{net.emoji}</Text>
              <Text style={[styles.networkLabel, { color: isDarkMode ? textPrimary : net.color }]}>
                {net.label}
              </Text>
            </View>
            <Text style={[styles.deleteCardNumber, { color: textPrimary }]}>
              •••• •••• •••• {card.last4}
            </Text>
            <Text style={[styles.deleteCardName, { color: textSub }]}>{card.name}</Text>
          </View>

          {/* Warning */}
          <View style={styles.warningRow}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={[styles.warningText, { color: textSub }]}>
              This action cannot be undone.
            </Text>
          </View>

          {/* Buttons */}
          <TouchableOpacity style={styles.removeBtn} onPress={onConfirm} activeOpacity={0.85}>
            <Text style={styles.removeBtnText}>Remove Card</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cancelSheetBtn, { backgroundColor: cancelBg }]}
            onPress={onCancel}
            activeOpacity={0.8}>
            <Text style={[styles.cancelSheetBtnText, { color: cancelText }]}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Add card modal ───────────────────────────────────────────────────────────

function AddCardModal({ isDarkMode, onClose, onSave }: {
  isDarkMode: boolean;
  onClose: () => void;
  onSave: (card: Omit<PaymentMethod, 'id' | 'isDefault'>) => void;
}) {
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const sheetBg     = isDarkMode ? '#1F2937' : '#FFFFFF';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const inputBg     = isDarkMode ? '#374151' : '#F9FAFB';
  const inputBorder = isDarkMode ? '#4B5563' : '#E5E7EB';

  function formatNumber(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  }

  function formatExpiry(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  const canSave = number.replace(/\s/g, '').length === 16 && expiry.length === 5 && cvv.length >= 3 && name.trim().length > 0;

  const last4 = number.replace(/\s/g, '').slice(-4);
  const network = number.startsWith('5') ? 'mastercard' : 'visa';

  function handleSave() {
    onSave({ network, last4, expiry, name: name.trim() });
    onClose();
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.overlayBg} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: sheetBg }]}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: textPrimary }]}>Add New Card</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={textSub} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Card Number */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: textPrimary }]}>Card Number</Text>
            <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor: inputBorder }]}>
              <CreditCard size={17} color="#9CA3AF" strokeWidth={2} />
              <TextInput
                style={[styles.input, { color: textPrimary }]}
                value={number}
                onChangeText={v => setNumber(formatNumber(v))}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#AAAAAA"
                keyboardType="number-pad"
                maxLength={19}
              />
            </View>
          </View>

          {/* Expiry + CVV */}
          <View style={styles.fieldRow}>
            <View style={[styles.fieldWrap, styles.fieldHalf]}>
              <Text style={[styles.fieldLabel, { color: textPrimary }]}>Expiry (MM/YY)</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }]}
                value={expiry}
                onChangeText={v => setExpiry(formatExpiry(v))}
                placeholder="MM/YY"
                placeholderTextColor="#AAAAAA"
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
            <View style={[styles.fieldWrap, styles.fieldHalf]}>
              <Text style={[styles.fieldLabel, { color: textPrimary }]}>CVV</Text>
              <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                <Lock size={15} color="#9CA3AF" strokeWidth={2} />
                <TextInput
                  style={[styles.input, { color: textPrimary }]}
                  value={cvv}
                  onChangeText={v => setCvv(v.replace(/\D/g, '').slice(0, 4))}
                  placeholder="•••"
                  placeholderTextColor="#AAAAAA"
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={4}
                />
              </View>
            </View>
          </View>

          {/* Cardholder Name */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: textPrimary }]}>Cardholder Name</Text>
            <TextInput
              style={[styles.fieldInput, { backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }]}
              value={name}
              onChangeText={setName}
              placeholder="Name as on card"
              placeholderTextColor="#AAAAAA"
              autoCapitalize="words"
            />
          </View>

          {/* Security note */}
          <View style={styles.securityRow}>
            <Lock size={13} color={textSub} strokeWidth={2} />
            <Text style={[styles.securityText, { color: textSub }]}>
              Your card details are encrypted and secure.
            </Text>
          </View>

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!canSave}
            activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Save Card</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PaymentMethodsScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const [cards, setCards] = useState<PaymentMethod[]>(INITIAL_CARDS);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const borderColor = isDarkMode ? '#1F2937' : '#F3F4F6';
  const walletBg    = isDarkMode ? '#1F2937' : '#FFFFFF';
  const walletBorder = isDarkMode ? '#374151' : '#E5E7EB';

  function deleteCard(id: string) {
    const card = cards.find(c => c.id === id);
    if (card) setDeleteTarget(card);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setCards(prev => {
      const next = prev.filter(c => c.id !== deleteTarget.id);
      if (next.length > 0 && !next.some(c => c.isDefault)) {
        next[0] = { ...next[0], isDefault: true };
      }
      return next;
    });
    setDeleteTarget(null);
  }

  function setDefault(id: string) {
    setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
  }

  function addCard(card: Omit<PaymentMethod, 'id' | 'isDefault'>) {
    setCards(prev => [...prev, { ...card, id: String(Date.now()), isDefault: prev.length === 0 }]);
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
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Payment Methods</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>

        {/* Saved cards */}
        {cards.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textSub }]}>Saved Cards</Text>
            <View style={styles.cardList}>
              {cards.map(card => (
                <PaymentCard
                  key={card.id}
                  card={card}
                  isDarkMode={isDarkMode}
                  onDelete={() => deleteCard(card.id)}
                  onSetDefault={() => setDefault(card.id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Digital wallets */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textSub }]}>Digital Wallets</Text>
          <View style={styles.cardList}>
            <TouchableOpacity
              style={[styles.walletBtn, { backgroundColor: walletBg, borderColor: walletBorder }]}
              activeOpacity={0.8}>
              <Text style={styles.walletEmoji}>🍎</Text>
              <Text style={[styles.walletLabel, { color: textPrimary }]}>Apple Pay</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.walletBtn, { backgroundColor: walletBg, borderColor: walletBorder }]}
              activeOpacity={0.8}>
              <Text style={styles.walletEmoji}>🇬</Text>
              <Text style={[styles.walletLabel, { color: textPrimary }]}>Google Pay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add card button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowModal(true)}
            activeOpacity={0.85}>
            <CreditCard size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.addBtnText}>+ Add New Card</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {deleteTarget && (
        <DeleteConfirmModal
          card={deleteTarget}
          isDarkMode={isDarkMode}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
      {showModal && (
        <AddCardModal
          isDarkMode={isDarkMode}
          onClose={() => setShowModal(false)}
          onSave={addCard}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
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

  // Scroll
  scroll: {
    padding: 20,
    gap: 24,
  },

  // Section
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    paddingHorizontal: 4,
  },
  cardList: {
    gap: 12,
  },

  // Payment card
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  networkEmoji: {
    fontSize: 15,
  },
  networkLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardBottomRight: {
    alignItems: 'flex-end',
  },
  cardMeta: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardMetaValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  setDefaultBtn: {
    alignSelf: 'flex-start',
    marginTop: -4,
  },
  setDefaultText: {
    fontSize: 13,
    fontWeight: '600',
    color: BLUE,
  },

  // Wallet buttons
  walletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  walletEmoji: {
    fontSize: 22,
  },
  walletLabel: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Add card button
  addBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Modal
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 16,
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
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Form
  fieldWrap: {
    gap: 7,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldHalf: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  fieldInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },

  // Security note
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -4,
  },
  securityText: {
    fontSize: 12,
    flex: 1,
  },

  // Delete confirm modal
  deleteSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  deleteCardInfo: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  deleteCardNumber: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  deleteCardName: {
    fontSize: 13,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  warningIcon: {
    fontSize: 15,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  removeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelSheetBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelSheetBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Save button
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
