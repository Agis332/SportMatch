import { router } from 'expo-router';
import {
  ArrowDownToLine,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Tag,
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
import { useWallet } from '@/context/WalletContext';

const BLUE = '#208AEF';
const AVAILABLE = 280;

export default function FinancesScreen() {
  const insets         = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const { cards: savedCards, bankAccounts, addCard } = useWallet();

  const [showWithdraw,   setShowWithdraw]   = useState(false);
  const [withdrawDone,   setWithdrawDone]   = useState(false);
  const [withdrawAmt,    setWithdrawAmt]    = useState('');
  const [payMethod,      setPayMethod]      = useState<'card' | 'bank' | 'iban'>('card');
  const [ibanValue,      setIbanValue]      = useState('');
  const [accountHolder,  setAccountHolder]  = useState('');
  const [selectedCardId, setSelectedCardId] = useState(() => savedCards[0]?.id ?? '');
  const [selectedBankId, setSelectedBankId] = useState(() => bankAccounts[0]?.id ?? '');
  const [showAddCard,    setShowAddCard]    = useState(false);
  const [newCardNumber,  setNewCardNumber]  = useState('');
  const [newExpiry,      setNewExpiry]      = useState('');
  const [newCvv,         setNewCvv]         = useState('');
  const [newCardHolder,  setNewCardHolder]  = useState('');

  const amountNum  = parseFloat(withdrawAmt.replace(',', '.')) || 0;
  const amountOver = amountNum > AVAILABLE;
  const canConfirm = amountNum > 0 && !amountOver && (
    payMethod === 'card' ||
    payMethod === 'bank' ||
    (payMethod === 'iban' && ibanValue.trim().length > 0 && accountHolder.trim().length > 0)
  );

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const borderColor = isDarkMode ? '#1F2937' : '#F3F4F6';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const cardBorder  = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor    = isDarkMode ? '#374151' : '#F3F4F6';
  const chevron     = isDarkMode ? '#6B7280' : '#D1D5DB';
  const statBorder  = isDarkMode ? '#374151' : '#E5E7EB';
  const sheetBg     = isDarkMode ? '#1F2937' : '#FFFFFF';
  const inputBg     = isDarkMode ? '#111827' : '#F9FAFB';

  const QUICK_STATS = [
    { label: 'This Month', value: '€320' },
    { label: 'Sessions',   value: '28'   },
    { label: 'Avg/Session', value: '€44' },
  ];

  const NAV_CARDS = [
    {
      icon: BarChart2,
      iconColor: '#0D9488',
      iconBg: isDarkMode ? '#042F2E' : '#F0FDFA',
      label: 'Earnings & Transactions',
      description: 'View detailed history',
      onPress: () => router.navigate('/trainer/earnings' as never),
    },
    {
      icon: CreditCard,
      iconColor: '#8B5CF6',
      iconBg: isDarkMode ? '#2E1065' : '#EDE9FE',
      label: 'Payment Methods',
      description: 'Manage cards & bank accounts',
      onPress: () => router.navigate('/trainer-mode/wallet' as never),
    },
    {
      icon: Tag,
      iconColor: BLUE,
      iconBg: isDarkMode ? '#1E3A5F' : '#EFF6FF',
      label: 'Session Pricing',
      description: 'Set your rates',
      onPress: () => router.navigate('/trainer-mode/session-settings' as never),
    },
  ];

  function handleWithdraw() {
    setWithdrawDone(true);
    setTimeout(() => {
      setShowWithdraw(false);
      setWithdrawDone(false);
      setWithdrawAmt('');
      setIbanValue('');
      setAccountHolder('');
      setPayMethod('card');
      setSelectedCardId(savedCards[0]?.id ?? '');
      setSelectedBankId(bankAccounts[0]?.id ?? '');
    }, 2000);
  }

  function closeModal() {
    if (withdrawDone) return;
    setShowWithdraw(false);
    setWithdrawAmt('');
    setIbanValue('');
    setAccountHolder('');
    setPayMethod('card');
    setShowAddCard(false);
    setNewCardNumber(''); setNewExpiry(''); setNewCvv(''); setNewCardHolder('');
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
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Finances</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}>

        {/* Balance overview card */}
        <View style={[styles.balanceCard, { backgroundColor: BLUE }]}>
          <View style={styles.balanceTop}>
            <Text style={styles.balanceLabel}>Total Earned</Text>
            <Text style={styles.balanceAmount}>€1,240</Text>
          </View>
          <View style={[styles.balanceDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          <View style={styles.balanceBottom}>
            <View>
              <Text style={styles.withdrawLabel}>Available to withdraw</Text>
              <Text style={styles.withdrawAmount}>€{AVAILABLE}</Text>
            </View>
            <TouchableOpacity
              style={styles.withdrawBtn}
              onPress={() => setShowWithdraw(true)}
              activeOpacity={0.85}>
              <ArrowDownToLine size={14} color={BLUE} strokeWidth={2.5} />
              <Text style={[styles.withdrawBtnText, { color: BLUE }]}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick stats strip */}
        <View style={[styles.statsStrip, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {QUICK_STATS.map((s, i) => (
            <View
              key={s.label}
              style={[
                styles.statItem,
                i < QUICK_STATS.length - 1 && { borderRightWidth: 1, borderRightColor: statBorder },
              ]}>
              <Text style={[styles.statValue, { color: textPrimary }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: textSub }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Navigation cards */}
        <View style={[styles.navCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {NAV_CARDS.map((item, i) => {
            const Icon = item.icon;
            return (
              <View key={item.label}>
                <TouchableOpacity
                  style={styles.navRow}
                  onPress={item.onPress}
                  activeOpacity={0.7}>
                  <View style={[styles.navIcon, { backgroundColor: item.iconBg }]}>
                    <Icon size={18} color={item.iconColor} strokeWidth={2} />
                  </View>
                  <View style={styles.navBody}>
                    <Text style={[styles.navLabel, { color: textPrimary }]}>{item.label}</Text>
                    <Text style={[styles.navDescription, { color: textSub }]}>{item.description}</Text>
                  </View>
                  <ChevronRight size={18} color={chevron} strokeWidth={2} />
                </TouchableOpacity>
                {i < NAV_CARDS.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: divColor }]} />
                )}
              </View>
            );
          })}
        </View>

      </ScrollView>

      {/* Withdraw modal */}
      <Modal
        visible={showWithdraw}
        transparent
        animationType="fade"
        onRequestClose={closeModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
          <Pressable style={[styles.sheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.sheetScroll}>

              {withdrawDone ? (
                <View style={styles.withdrawSuccess}>
                  <View style={styles.withdrawSuccessIcon}>
                    <Text style={styles.withdrawSuccessCheck}>✓</Text>
                  </View>
                  <Text style={[styles.withdrawSuccessTitle, { color: textPrimary }]}>
                    Withdrawal Initiated
                  </Text>
                  <Text style={[styles.withdrawSuccessSub, { color: textSub }]}>
                    €{withdrawAmt} will arrive within 1–2 business days.
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={[styles.sheetTitle, { color: textPrimary }]}>Withdraw Funds</Text>

                  {/* Amount */}
                  <View style={styles.fieldWrap}>
                    <View style={styles.fieldLabelRow}>
                      <Text style={[styles.fieldLabel, { color: textSub }]}>Amount</Text>
                      <Text style={[styles.fieldHint, { color: textSub }]}>Max €{AVAILABLE}</Text>
                    </View>
                    <View style={[styles.amountInputWrap, {
                      backgroundColor: inputBg,
                      borderColor: amountOver ? '#DC2626' : isDarkMode ? '#374151' : '#E5E7EB',
                    }]}>
                      <Text style={[styles.amountPrefix, { color: amountOver ? '#DC2626' : textPrimary }]}>€</Text>
                      <TextInput
                        style={[styles.amountInput, { color: amountOver ? '#DC2626' : textPrimary }]}
                        value={withdrawAmt}
                        onChangeText={setWithdrawAmt}
                        placeholder="0"
                        placeholderTextColor={isDarkMode ? '#4B5563' : '#9CA3AF'}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    {amountOver && (
                      <Text style={styles.amountError}>Exceeds available balance of €{AVAILABLE}</Text>
                    )}
                  </View>

                  {/* Saved cards */}
                  <View style={styles.fieldWrap}>
                    <Text style={[styles.fieldLabel, { color: textSub }]}>Saved cards</Text>
                    {savedCards.map(card => {
                      const sel = payMethod === 'card' && selectedCardId === card.id;
                      return (
                        <TouchableOpacity
                          key={card.id}
                          style={[styles.methodRow, {
                            backgroundColor: inputBg,
                            borderColor: sel ? BLUE : isDarkMode ? '#374151' : '#E5E7EB',
                          }]}
                          onPress={() => { setPayMethod('card'); setSelectedCardId(card.id); setShowAddCard(false); }}
                          activeOpacity={0.75}>
                          <View style={[styles.radio, { borderColor: sel ? BLUE : isDarkMode ? '#4B5563' : '#D1D5DB' }]}>
                            {sel && <View style={styles.radioDot} />}
                          </View>
                          <View style={styles.cardBadge}>
                            <Text style={styles.cardBadgeText}>{card.brand.slice(0, 2).toUpperCase()}</Text>
                          </View>
                          <View style={styles.methodInfo}>
                            <Text style={[styles.methodTitle, { color: textPrimary }]}>{card.brand} •••• {card.last4}</Text>
                            <Text style={[styles.methodSub, { color: textSub }]}>Expires {card.expiry}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}

                    {!showAddCard ? (
                      <TouchableOpacity
                        style={[styles.addCardBtn, { borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}
                        onPress={() => setShowAddCard(true)}
                        activeOpacity={0.7}>
                        <Text style={[styles.addCardBtnText, { color: BLUE }]}>+ Add New Card</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.addCardForm, { borderColor: BLUE, backgroundColor: inputBg }]}>
                        <Text style={[styles.addCardFormTitle, { color: textPrimary }]}>New Card</Text>
                        <TextInput
                          style={[styles.fieldInput, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', color: textPrimary, borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}
                          value={newCardHolder}
                          onChangeText={setNewCardHolder}
                          placeholder="Cardholder name"
                          placeholderTextColor={isDarkMode ? '#4B5563' : '#9CA3AF'}
                          autoCorrect={false}
                        />
                        <TextInput
                          style={[styles.fieldInput, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', color: textPrimary, borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}
                          value={newCardNumber}
                          onChangeText={v => setNewCardNumber(v.replace(/\D/g, '').slice(0, 16))}
                          placeholder="Card number"
                          placeholderTextColor={isDarkMode ? '#4B5563' : '#9CA3AF'}
                          keyboardType="number-pad"
                        />
                        <View style={styles.addCardRow}>
                          <TextInput
                            style={[styles.fieldInput, styles.addCardHalf, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', color: textPrimary, borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}
                            value={newExpiry}
                            onChangeText={v => {
                              const digits = v.replace(/\D/g, '').slice(0, 4);
                              setNewExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
                            }}
                            placeholder="MM/YY"
                            placeholderTextColor={isDarkMode ? '#4B5563' : '#9CA3AF'}
                            keyboardType="number-pad"
                          />
                          <TextInput
                            style={[styles.fieldInput, styles.addCardHalf, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', color: textPrimary, borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}
                            value={newCvv}
                            onChangeText={v => setNewCvv(v.replace(/\D/g, '').slice(0, 4))}
                            placeholder="CVV"
                            placeholderTextColor={isDarkMode ? '#4B5563' : '#9CA3AF'}
                            keyboardType="number-pad"
                            secureTextEntry
                          />
                        </View>
                        <View style={styles.addCardActions}>
                          <TouchableOpacity
                            style={[styles.addCardCancel, { borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}
                            onPress={() => { setShowAddCard(false); setNewCardNumber(''); setNewExpiry(''); setNewCvv(''); setNewCardHolder(''); }}
                            activeOpacity={0.7}>
                            <Text style={[styles.addCardCancelText, { color: textSub }]}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.addCardSave, {
                              opacity: newCardNumber.length === 16 && newExpiry.length === 5 && newCvv.length >= 3 && newCardHolder.trim().length > 0 ? 1 : 0.4,
                            }]}
                            onPress={() => {
                              if (newCardNumber.length < 16 || newExpiry.length < 5 || newCvv.length < 3 || !newCardHolder.trim()) return;
                              const brand = newCardNumber.startsWith('5') ? 'Mastercard' : 'Visa';
                              const added = addCard({ brand, last4: newCardNumber.slice(-4), expiry: newExpiry });
                              setSelectedCardId(added.id);
                              setPayMethod('card');
                              setShowAddCard(false);
                              setNewCardNumber(''); setNewExpiry(''); setNewCvv(''); setNewCardHolder('');
                            }}
                            activeOpacity={0.85}>
                            <Text style={styles.addCardSaveText}>Add Card</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Saved bank accounts */}
                  {bankAccounts.length > 0 && (
                    <View style={styles.fieldWrap}>
                      <Text style={[styles.fieldLabel, { color: textSub }]}>Bank accounts</Text>
                      {bankAccounts.map(acc => {
                        const sel = payMethod === 'bank' && selectedBankId === acc.id;
                        return (
                          <TouchableOpacity
                            key={acc.id}
                            style={[styles.methodRow, {
                              backgroundColor: inputBg,
                              borderColor: sel ? BLUE : isDarkMode ? '#374151' : '#E5E7EB',
                            }]}
                            onPress={() => { setPayMethod('bank'); setSelectedBankId(acc.id); }}
                            activeOpacity={0.75}>
                            <View style={[styles.radio, { borderColor: sel ? BLUE : isDarkMode ? '#4B5563' : '#D1D5DB' }]}>
                              {sel && <View style={styles.radioDot} />}
                            </View>
                            <View style={styles.methodInfo}>
                              <Text style={[styles.methodTitle, { color: textPrimary }]}>{acc.holder}</Text>
                              <Text style={[styles.methodSub, { color: textSub }]}>{acc.maskedIban}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {/* Manual IBAN */}
                  <View style={styles.fieldWrap}>
                    <Text style={[styles.fieldLabel, { color: textSub }]}>New bank transfer</Text>
                    <TouchableOpacity
                      style={[styles.methodRow, {
                        backgroundColor: inputBg,
                        borderColor: payMethod === 'iban' ? BLUE : isDarkMode ? '#374151' : '#E5E7EB',
                      }]}
                      onPress={() => setPayMethod('iban')}
                      activeOpacity={0.75}>
                      <View style={[styles.radio, { borderColor: payMethod === 'iban' ? BLUE : isDarkMode ? '#4B5563' : '#D1D5DB' }]}>
                        {payMethod === 'iban' && <View style={styles.radioDot} />}
                      </View>
                      <View style={styles.methodInfo}>
                        <Text style={[styles.methodTitle, { color: textPrimary }]}>Enter IBAN manually</Text>
                        <Text style={[styles.methodSub, { color: textSub }]}>1–2 business days</Text>
                      </View>
                    </TouchableOpacity>

                    {payMethod === 'iban' && (
                      <>
                        <TextInput
                          style={[styles.fieldInput, {
                            backgroundColor: inputBg,
                            color: textPrimary,
                            borderColor: isDarkMode ? '#374151' : '#E5E7EB',
                          }]}
                          value={accountHolder}
                          onChangeText={setAccountHolder}
                          placeholder="Account holder name"
                          placeholderTextColor={isDarkMode ? '#4B5563' : '#9CA3AF'}
                          autoCorrect={false}
                        />
                        <TextInput
                          style={[styles.fieldInput, {
                            backgroundColor: inputBg,
                            color: textPrimary,
                            borderColor: isDarkMode ? '#374151' : '#E5E7EB',
                          }]}
                          value={ibanValue}
                          onChangeText={setIbanValue}
                          placeholder="LT00 0000 0000 0000 0000"
                          placeholderTextColor={isDarkMode ? '#4B5563' : '#9CA3AF'}
                          autoCapitalize="characters"
                          autoCorrect={false}
                        />
                      </>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
                    onPress={handleWithdraw}
                    disabled={!canConfirm}
                    activeOpacity={0.85}>
                    <Text style={styles.confirmBtnText}>Confirm Withdrawal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.cancelSheetBtn, { borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}
                    onPress={closeModal}
                    activeOpacity={0.7}>
                    <Text style={[styles.cancelSheetBtnText, { color: textSub }]}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
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
    gap: 12,
  },

  // Balance card
  balanceCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  balanceTop: {
    padding: 20,
    gap: 4,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.72)',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  balanceDivider: {
    height: StyleSheet.hairlineWidth,
  },
  balanceBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  withdrawLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.72)',
    marginBottom: 2,
  },
  withdrawAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  withdrawBtnText: {
    fontSize: 14,
    fontWeight: '700',
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
    gap: 3,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Nav cards
  navCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  navIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  navBody: {
    flex: 1,
    gap: 2,
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  navDescription: {
    fontSize: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 70,
  },

  // Withdraw modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    borderRadius: 24,
    overflow: 'hidden',
    maxHeight: '85%',
  },
  sheetScroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    gap: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  fieldWrap: {
    gap: 8,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  fieldHint: {
    fontSize: 12,
  },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  amountPrefix: {
    fontSize: 18,
    fontWeight: '700',
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    padding: 0,
  },
  amountError: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: -2,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BLUE,
  },
  methodInfo: {
    flex: 1,
    gap: 2,
  },
  cardBadge: {
    width: 32,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  cardBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  methodSub: {
    fontSize: 12,
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  confirmBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  addCardBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  addCardBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addCardForm: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  addCardFormTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  addCardRow: {
    flexDirection: 'row',
    gap: 10,
  },
  addCardHalf: {
    flex: 1,
  },
  addCardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  addCardCancel: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addCardCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addCardSave: {
    flex: 2,
    backgroundColor: BLUE,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addCardSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelSheetBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: -4,
  },
  cancelSheetBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Withdraw success state
  withdrawSuccess: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  withdrawSuccessIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawSuccessCheck: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  withdrawSuccessTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  withdrawSuccessSub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
