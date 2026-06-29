import { router } from 'expo-router';
import {
  ArrowUpRight,
  CheckCircle,
  ChevronLeft,
  Clock,
  CreditCard,
  Landmark,
  Trash2,
  X,
} from 'lucide-react-native';
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

type PayoutStatus = 'completed' | 'pending';

interface SavedCard   { id: string; brand: string; last4: string; expiry: string }
interface BankAccount { id: string; holder: string; maskedIban: string; bankName: string }
interface Payout      { id: string; date: string; amount: string; method: string; status: PayoutStatus }

const INITIAL_CARDS: SavedCard[] = [
  { id: 'c1', brand: 'Visa',       last4: '4242', expiry: '08/26' },
  { id: 'c2', brand: 'Mastercard', last4: '8888', expiry: '11/25' },
];

const INITIAL_ACCOUNTS: BankAccount[] = [
  { id: 'b1', holder: 'Mantas Petrauskas', maskedIban: 'LT•• •••• •••• •••• 4412', bankName: 'Swedbank' },
];

const PAYOUTS: Payout[] = [
  { id: 'p1', date: 'Jun 27, 2026', amount: '€140.00', method: 'Visa •••• 4242',       status: 'completed' },
  { id: 'p2', date: 'Jun 15, 2026', amount: '€95.00',  method: 'Mastercard •••• 8888', status: 'completed' },
  { id: 'p3', date: 'Jun 01, 2026', amount: '€210.00', method: 'LT•• ···· 4412',       status: 'completed' },
  { id: 'p4', date: 'May 20, 2026', amount: '€175.00', method: 'Visa •••• 4242',       status: 'completed' },
  { id: 'p5', date: 'May 08, 2026', amount: '€60.00',  method: 'Mastercard •••• 8888', status: 'pending'   },
];

export default function WalletScreen() {
  const insets         = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const [cards,    setCards]    = useState<SavedCard[]>(INITIAL_CARDS);
  const [accounts, setAccounts] = useState<BankAccount[]>(INITIAL_ACCOUNTS);

  // Add card modal
  const [showCardModal,  setShowCardModal]  = useState(false);
  const [newCardNumber,  setNewCardNumber]  = useState('');
  const [newExpiry,      setNewExpiry]      = useState('');
  const [newCvv,         setNewCvv]         = useState('');
  const [newCardHolder,  setNewCardHolder]  = useState('');

  // Delete confirmation sheet
  type DeleteTarget = { type: 'card'; id: string; title: string; subtitle: string }
                    | { type: 'account'; id: string; title: string; subtitle: string };
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Add bank account modal
  const [showBankModal,  setShowBankModal]  = useState(false);
  const [newHolder,      setNewHolder]      = useState('');
  const [newIban,        setNewIban]        = useState('');
  const [newBankName,    setNewBankName]    = useState('');

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor    = isDarkMode ? '#374151' : '#F3F4F6';
  const inputBg     = isDarkMode ? '#111827' : '#F9FAFB';
  const inputBorder = isDarkMode ? '#374151' : '#E5E7EB';
  const sheetBg     = isDarkMode ? '#1F2937' : '#FFFFFF';
  const phColor     = isDarkMode ? '#4B5563' : '#9CA3AF';

  const canAddCard    = newCardNumber.length === 16 && newExpiry.length === 5 && newCvv.length >= 3 && newCardHolder.trim().length > 0;
  const canAddAccount = newHolder.trim().length > 0 && newIban.trim().length > 4;

  function closeCardModal() {
    setShowCardModal(false);
    setNewCardNumber(''); setNewExpiry(''); setNewCvv(''); setNewCardHolder('');
  }

  function closeBankModal() {
    setShowBankModal(false);
    setNewHolder(''); setNewIban(''); setNewBankName('');
  }

  function handleAddCard() {
    if (!canAddCard) return;
    const brand = newCardNumber.startsWith('5') ? 'Mastercard' : 'Visa';
    setCards(prev => [...prev, {
      id:     `c${Date.now()}`,
      brand,
      last4:  newCardNumber.slice(-4),
      expiry: newExpiry,
    }]);
    closeCardModal();
  }

  function handleAddAccount() {
    if (!canAddAccount) return;
    const raw    = newIban.replace(/\s/g, '');
    const masked = raw.length > 4
      ? raw.slice(0, 2) + '•• •••• •••• •••• ' + raw.slice(-4)
      : newIban;
    setAccounts(prev => [...prev, {
      id:         `b${Date.now()}`,
      holder:     newHolder.trim(),
      maskedIban: masked,
      bankName:   '',
    }]);
    closeBankModal();
  }

  function deleteCard(card: SavedCard) {
    setDeleteTarget({ type: 'card', id: card.id, title: `${card.brand} •••• ${card.last4}`, subtitle: `Expires ${card.expiry}` });
  }

  function deleteAccount(acc: BankAccount) {
    setDeleteTarget({ type: 'account', id: acc.id, title: acc.holder, subtitle: acc.maskedIban });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'card') {
      setCards(prev => prev.filter(c => c.id !== deleteTarget.id));
    } else {
      setAccounts(prev => prev.filter(a => a.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} activeOpacity={0.7}>
          <ChevronLeft size={22} color={BLUE} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>My Wallet</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>

        {/* Balance overview */}
        <View style={[styles.balanceCard, { backgroundColor: BLUE }]}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>€1,240.00</Text>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.availableLabel}>Available</Text>
              <Text style={styles.availableAmount}>€280.00</Text>
            </View>
            <TouchableOpacity
              style={styles.withdrawBtn}
              onPress={() => router.push('/trainer/earnings' as never)}
              activeOpacity={0.85}>
              <ArrowUpRight size={14} color={BLUE} strokeWidth={2.5} />
              <Text style={[styles.withdrawBtnText, { color: BLUE }]}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={[styles.sectionLabel, { color: textSub }]}>PAYMENT METHODS</Text>
        <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          {cards.length === 0 && (
            <Text style={[styles.emptyText, { color: textSub }]}>No saved cards</Text>
          )}
          {cards.map((card, i) => (
            <View key={card.id}>
              <View style={styles.methodRow}>
                <View style={[styles.cardBadge, { backgroundColor: card.brand === 'Visa' ? '#1A1F71' : '#EB001B' }]}>
                  <Text style={styles.cardBadgeText}>{card.brand.slice(0, 2).toUpperCase()}</Text>
                </View>
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodTitle, { color: textPrimary }]}>{card.brand} •••• {card.last4}</Text>
                  <Text style={[styles.methodSub, { color: textSub }]}>Expires {card.expiry}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteCard(card)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
                  <Trash2 size={16} color={isDarkMode ? '#6B7280' : '#9CA3AF'} strokeWidth={2} />
                </TouchableOpacity>
              </View>
              {i < cards.length - 1 && <View style={[styles.divider, { backgroundColor: divColor }]} />}
            </View>
          ))}
          {cards.length > 0 && <View style={[styles.divider, { backgroundColor: divColor }]} />}
          <TouchableOpacity style={styles.addRow} onPress={() => setShowCardModal(true)} activeOpacity={0.7}>
            <CreditCard size={16} color={BLUE} strokeWidth={2} />
            <Text style={[styles.addRowText, { color: BLUE }]}>+ Add New Card</Text>
          </TouchableOpacity>
        </View>

        {/* Bank Accounts */}
        <Text style={[styles.sectionLabel, { color: textSub }]}>BANK ACCOUNTS</Text>
        <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          {accounts.length === 0 && (
            <Text style={[styles.emptyText, { color: textSub }]}>No saved bank accounts</Text>
          )}
          {accounts.map((acc, i) => (
            <View key={acc.id}>
              <View style={styles.methodRow}>
                <View style={[styles.bankBadge, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}>
                  <Landmark size={15} color={BLUE} strokeWidth={2} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodTitle, { color: textPrimary }]}>{acc.holder}</Text>
                  <Text style={[styles.methodSub, { color: textSub }]}>{acc.maskedIban}</Text>
                  <Text style={[styles.methodSub, { color: textSub }]}>{acc.bankName}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteAccount(acc)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
                  <Trash2 size={16} color={isDarkMode ? '#6B7280' : '#9CA3AF'} strokeWidth={2} />
                </TouchableOpacity>
              </View>
              {i < accounts.length - 1 && <View style={[styles.divider, { backgroundColor: divColor }]} />}
            </View>
          ))}
          {accounts.length > 0 && <View style={[styles.divider, { backgroundColor: divColor }]} />}
          <TouchableOpacity style={styles.addRow} onPress={() => setShowBankModal(true)} activeOpacity={0.7}>
            <Landmark size={16} color={BLUE} strokeWidth={2} />
            <Text style={[styles.addRowText, { color: BLUE }]}>+ Add Bank Account</Text>
          </TouchableOpacity>
        </View>

        {/* Payout History */}
        <Text style={[styles.sectionLabel, { color: textSub }]}>PAYOUT HISTORY</Text>
        <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          {PAYOUTS.map((p, i) => (
            <View key={p.id}>
              <View style={styles.payoutRow}>
                <View style={[styles.payoutIcon, {
                  backgroundColor: p.status === 'completed'
                    ? (isDarkMode ? '#052E16' : '#F0FDF4')
                    : (isDarkMode ? '#451A03' : '#FFFBEB'),
                }]}>
                  {p.status === 'completed'
                    ? <CheckCircle size={15} color="#22C55E" strokeWidth={2} />
                    : <Clock       size={15} color="#F59E0B" strokeWidth={2} />}
                </View>
                <View style={styles.payoutInfo}>
                  <Text style={[styles.payoutAmount, { color: textPrimary }]}>{p.amount}</Text>
                  <Text style={[styles.payoutMeta, { color: textSub }]}>{p.method}</Text>
                  <Text style={[styles.payoutMeta, { color: textSub }]}>{p.date}</Text>
                </View>
                <View style={[styles.statusBadge, {
                  backgroundColor: p.status === 'completed'
                    ? (isDarkMode ? '#052E16' : '#DCFCE7')
                    : (isDarkMode ? '#451A03' : '#FEF9C3'),
                }]}>
                  <Text style={[styles.statusText, { color: p.status === 'completed' ? '#16A34A' : '#D97706' }]}>
                    {p.status === 'completed' ? 'Completed' : 'Pending'}
                  </Text>
                </View>
              </View>
              {i < PAYOUTS.length - 1 && <View style={[styles.divider, { backgroundColor: divColor }]} />}
            </View>
          ))}
        </View>

      </ScrollView>

      {/* ── Delete Confirmation Sheet ──────────────────────────────────── */}
      <Modal visible={!!deleteTarget} transparent animationType="slide" onRequestClose={() => setDeleteTarget(null)}>
        <Pressable style={styles.deleteOverlay} onPress={() => setDeleteTarget(null)}>
          <Pressable style={[styles.deleteSheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
            <View style={styles.deleteHandle} />
            {deleteTarget && (
              <>
                <View style={[styles.deleteItemCard, { backgroundColor: isDarkMode ? '#111827' : '#F9FAFB', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                  <Text style={[styles.deleteItemTitle, { color: textPrimary }]}>{deleteTarget.title}</Text>
                  <Text style={[styles.deleteItemSub,   { color: textSub    }]}>{deleteTarget.subtitle}</Text>
                </View>
                <Text style={[styles.deleteWarning, { color: textSub }]}>This action cannot be undone.</Text>
                <TouchableOpacity style={styles.deleteRemoveBtn} onPress={confirmDelete} activeOpacity={0.85}>
                  <Text style={styles.deleteRemoveBtnText}>Remove</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteCancelBtn, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}
                  onPress={() => setDeleteTarget(null)}
                  activeOpacity={0.7}>
                  <Text style={[styles.deleteCancelBtnText, { color: textPrimary }]}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Add Card Modal ─────────────────────────────────────────────── */}
      <Modal visible={showCardModal} transparent animationType="fade" onRequestClose={closeCardModal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeCardModal} />
          <Pressable style={[styles.modal, { backgroundColor: sheetBg }]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textPrimary }]}>Add New Card</Text>
              <TouchableOpacity onPress={closeCardModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
                <X size={20} color={textSub} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: textSub }]}>Cardholder Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }]}
              value={newCardHolder}
              onChangeText={setNewCardHolder}
              placeholder="Full name on card"
              placeholderTextColor={phColor}
              autoCorrect={false}
            />

            <Text style={[styles.fieldLabel, { color: textSub }]}>Card Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }]}
              value={newCardNumber}
              onChangeText={v => setNewCardNumber(v.replace(/\D/g, '').slice(0, 16))}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={phColor}
              keyboardType="number-pad"
            />

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={[styles.fieldLabel, { color: textSub }]}>Expiry</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }]}
                  value={newExpiry}
                  onChangeText={v => {
                    const d = v.replace(/\D/g, '').slice(0, 4);
                    setNewExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                  }}
                  placeholder="MM/YY"
                  placeholderTextColor={phColor}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={[styles.fieldLabel, { color: textSub }]}>CVV</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }]}
                  value={newCvv}
                  onChangeText={v => setNewCvv(v.replace(/\D/g, '').slice(0, 4))}
                  placeholder="•••"
                  placeholderTextColor={phColor}
                  keyboardType="number-pad"
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, !canAddCard && styles.submitBtnDisabled]}
              onPress={handleAddCard}
              disabled={!canAddCard}
              activeOpacity={0.85}>
              <Text style={styles.submitBtnText}>Add Card</Text>
            </TouchableOpacity>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Add Bank Account Modal ─────────────────────────────────────── */}
      <Modal visible={showBankModal} transparent animationType="fade" onRequestClose={closeBankModal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeBankModal} />
          <Pressable style={[styles.modal, { backgroundColor: sheetBg }]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textPrimary }]}>Add Bank Account</Text>
              <TouchableOpacity onPress={closeBankModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
                <X size={20} color={textSub} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: textSub }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }]}
              value={newHolder}
              onChangeText={setNewHolder}
              placeholder="First and Last Name"
              placeholderTextColor={phColor}
              autoCorrect={false}
            />

            <Text style={[styles.fieldLabel, { color: textSub }]}>IBAN Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }]}
              value={newIban}
              onChangeText={setNewIban}
              placeholder="LT00 0000 0000 0000 0000"
              placeholderTextColor={phColor}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[styles.submitBtn, !canAddAccount && styles.submitBtnDisabled]}
              onPress={handleAddAccount}
              disabled={!canAddAccount}
              activeOpacity={0.85}>
              <Text style={styles.submitBtnText}>Add Account</Text>
            </TouchableOpacity>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
  },

  scroll: {
    padding: 16,
    gap: 12,
  },

  balanceCard: {
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginTop: -6,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  availableLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },
  availableAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 1,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  withdrawBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.7,
    paddingHorizontal: 4,
    marginBottom: -2,
  },

  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },

  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  cardBadge: {
    width: 36,
    height: 24,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  cardBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  bankBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  methodInfo: {
    flex: 1,
    gap: 2,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  methodSub: {
    fontSize: 12,
  },

  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  addRowText: {
    fontSize: 14,
    fontWeight: '600',
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },

  emptyText: {
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  payoutIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  payoutInfo: {
    flex: 1,
    gap: 2,
  },
  payoutAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  payoutMeta: {
    fontSize: 12,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Modals
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    borderRadius: 24,
    padding: 24,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: -4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputHalf: {
    flex: 1,
    gap: 12,
  },
  submitBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Delete confirmation sheet
  deleteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  deleteSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 14,
  },
  deleteHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 6,
  },
  deleteItemCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 3,
  },
  deleteItemTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteItemSub: {
    fontSize: 13,
  },
  deleteWarning: {
    fontSize: 13,
    textAlign: 'center',
  },
  deleteRemoveBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  deleteRemoveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteCancelBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  deleteCancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
