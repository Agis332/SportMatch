import { router } from 'expo-router';
import { ArrowUpRight, ChevronLeft } from 'lucide-react-native';
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
const BAR_MAX_H = 100;

type Filter = 'all' | 'this_month' | 'total_sessions';

const CHART_DATA = [
  { month: 'Jan', amount: 180 },
  { month: 'Feb', amount: 210 },
  { month: 'Mar', amount: 290 },
  { month: 'Apr', amount: 340 },
  { month: 'May', amount: 480 },
  { month: 'Jun', amount: 320 },
];
const CHART_MAX = Math.max(...CHART_DATA.map(d => d.amount));

type TxMonth = 'this' | 'last';

interface Transaction {
  id: string;
  client: string;
  initials: string;
  date: string;
  type: string;
  amount: number;
  color: string;
  month: TxMonth;
}

const TRANSACTIONS: Transaction[] = [
  { id: '1',  client: 'Jonas Kazlauskas', initials: 'JK', date: 'Today, 10:00',     type: 'Football · Individual', amount: 35, color: '#B5C9E4', month: 'this' },
  { id: '2',  client: 'Marta Petraitytė', initials: 'MP', date: 'Today, 14:00',     type: 'Running · Individual',  amount: 30, color: '#C8DDB5', month: 'this' },
  { id: '3',  client: 'Eglė Jankutė',     initials: 'EJ', date: 'Yesterday, 09:00', type: 'Football · Individual', amount: 35, color: '#E4CDB5', month: 'this' },
  { id: '4',  client: 'Tomas Butkus',     initials: 'TB', date: 'Jun 24, 16:00',    type: 'CrossFit · Group',      amount: 20, color: '#D4B5E4', month: 'this' },
  { id: '5',  client: 'Rasa Mockutė',     initials: 'RM', date: 'Jun 22, 11:00',    type: 'Football · Individual', amount: 35, color: '#B5E4D4', month: 'this' },
  { id: '6',  client: 'Andrius Stankus',  initials: 'AS', date: 'Jun 20, 09:00',    type: 'Running · Individual',  amount: 30, color: '#E4B5C8', month: 'this' },
  { id: '7',  client: 'Viktorija Paulė',  initials: 'VP', date: 'Jun 18, 17:00',    type: 'Football · Individual', amount: 35, color: '#C8B5E4', month: 'this' },
  { id: '8',  client: 'Laurynas Grigas',  initials: 'LG', date: 'Jun 15, 10:00',    type: 'CrossFit · Individual', amount: 35, color: '#E4E4B5', month: 'this' },
  { id: '9',  client: 'Jonas Kazlauskas', initials: 'JK', date: 'May 28, 10:00',    type: 'Football · Individual', amount: 35, color: '#B5C9E4', month: 'last' },
  { id: '10', client: 'Marta Petraitytė', initials: 'MP', date: 'May 24, 14:00',    type: 'Running · Individual',  amount: 30, color: '#C8DDB5', month: 'last' },
  { id: '11', client: 'Eglė Jankutė',     initials: 'EJ', date: 'May 20, 09:00',    type: 'Football · Individual', amount: 35, color: '#E4CDB5', month: 'last' },
  { id: '12', client: 'Tomas Butkus',     initials: 'TB', date: 'May 18, 16:00',    type: 'CrossFit · Group',      amount: 20, color: '#D4B5E4', month: 'last' },
  { id: '13', client: 'Rasa Mockutė',     initials: 'RM', date: 'May 15, 11:00',    type: 'Football · Individual', amount: 35, color: '#B5E4D4', month: 'last' },
  { id: '14', client: 'Andrius Stankus',  initials: 'AS', date: 'May 10, 09:00',    type: 'Running · Individual',  amount: 30, color: '#E4B5C8', month: 'last' },
];

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',            label: 'All Earnings'   },
  { key: 'this_month',     label: 'This Month'     },
  { key: 'total_sessions', label: 'Total Sessions' },
];

const INITIAL_CARDS = [
  { id: 'c1', brand: 'Visa',       last4: '4242', expiry: '08/26' },
  { id: 'c2', brand: 'Mastercard', last4: '5555', expiry: '12/25' },
  { id: 'c3', brand: 'Visa',       last4: '1234', expiry: '03/27' },
];

export default function TrainerEarningsScreen() {
  const insets         = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const [filter,        setFilter]        = useState<Filter>('all');
  const [showWithdraw,  setShowWithdraw]  = useState(false);
  const [withdrawDone,  setWithdrawDone]  = useState(false);
  const [withdrawAmt,   setWithdrawAmt]   = useState('');
  const [payMethod,     setPayMethod]     = useState<'card' | 'iban'>('card');
  const [ibanValue,      setIbanValue]      = useState('');
  const [accountHolder,  setAccountHolder]  = useState('');
  const [selectedCardId, setSelectedCardId] = useState('c1');
  const [savedCards,     setSavedCards]     = useState(INITIAL_CARDS);
  const [showAddCard,    setShowAddCard]    = useState(false);
  const [newCardNumber,  setNewCardNumber]  = useState('');
  const [newExpiry,      setNewExpiry]      = useState('');
  const [newCvv,         setNewCvv]         = useState('');
  const [newCardHolder,  setNewCardHolder]  = useState('');

  const AVAILABLE = 280;
  const amountNum  = parseFloat(withdrawAmt.replace(',', '.')) || 0;
  const amountOver = amountNum > AVAILABLE;
  const canConfirm = amountNum > 0 && !amountOver && (
    payMethod === 'card' || (ibanValue.trim().length > 0 && accountHolder.trim().length > 0)
  );

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor    = isDarkMode ? '#374151' : '#F3F4F6';
  const sheetBg     = isDarkMode ? '#1F2937' : '#FFFFFF';
  const inputBg     = isDarkMode ? '#111827' : '#F9FAFB';

  const filteredTx = TRANSACTIONS.filter(tx => {
    if (filter === 'this_month') return tx.month === 'this';
    return true;
  });

  function handleWithdraw() {
    setWithdrawDone(true);
    setTimeout(() => {
      setShowWithdraw(false);
      setWithdrawDone(false);
      setWithdrawAmt('');
      setIbanValue('');
      setAccountHolder('');
      setPayMethod('card');
      setSelectedCardId('c1');
    }, 2000);
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Earnings</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>

        {/* Balance card */}
        <View style={[styles.balanceCard, { backgroundColor: BLUE }]}>
          <Text style={styles.balanceLabel}>Available to withdraw</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>€280.00</Text>
            <TouchableOpacity
              style={styles.withdrawBtn}
              onPress={() => setShowWithdraw(true)}
              activeOpacity={0.85}>
              <ArrowUpRight size={15} color={BLUE} strokeWidth={2.5} />
              <Text style={[styles.withdrawBtnText, { color: BLUE }]}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats cards — single row */}
        <View style={styles.statsRow}>
          {([
            { label: 'Available',    value: '€280'   },
            { label: 'This Month',   value: '€320'   },
            { label: 'Withdrawn',    value: '€920'   },
            { label: 'Total Earned', value: '€1,240' },
          ] as const).map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: cardBg }]}>
              <Text style={[styles.statCardValue, { color: textPrimary }]}>{s.value}</Text>
              <Text style={[styles.statCardLabel, { color: textSub }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Monthly earnings chart */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Monthly Earnings</Text>
          <View style={styles.chartBars}>
            {CHART_DATA.map((d, i) => {
              const barH  = Math.max(4, Math.round((d.amount / CHART_MAX) * BAR_MAX_H));
              const isCur = i === CHART_DATA.length - 1;
              return (
                <View key={d.month} style={styles.chartBarCol}>
                  <View style={[styles.chartBar, {
                    height:          barH,
                    backgroundColor: isCur ? BLUE : isDarkMode ? '#374151' : '#E5E7EB',
                    borderRadius:    isCur ? 6 : 4,
                  }]} />
                </View>
              );
            })}
          </View>
          <View style={styles.chartLabels}>
            {CHART_DATA.map((d, i) => {
              const isCur = i === CHART_DATA.length - 1;
              return (
                <Text key={d.month} style={[styles.chartLabel, { color: isCur ? BLUE : textSub }]}>
                  {d.month}
                </Text>
              );
            })}
          </View>
        </View>

        {/* Transactions */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Transactions</Text>

          {/* Rows */}
          {filteredTx.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: textSub }]}>No transactions</Text>
            </View>
          ) : (
            filteredTx.map((tx, i) => (
              <View key={tx.id}>
                <View style={styles.txRow}>
                  <View style={[styles.txAvatar, { backgroundColor: tx.color }]}>
                    <Text style={styles.txInitials}>{tx.initials}</Text>
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={[styles.txClient, { color: textPrimary }]}>{tx.client}</Text>
                    <Text style={[styles.txMeta, { color: textSub }]}>{tx.date}</Text>
                    <Text style={[styles.txType, { color: textSub }]}>{tx.type}</Text>
                  </View>
                  <Text style={styles.txAmount}>+€{tx.amount}</Text>
                </View>
                {i < filteredTx.length - 1 && (
                  <View style={[styles.rowDivider, { backgroundColor: divColor }]} />
                )}
              </View>
            ))
          )}
        </View>

      </ScrollView>

      {/* Withdraw modal */}
      <Modal
        visible={showWithdraw}
        transparent
        animationType="fade"
        onRequestClose={() => !withdrawDone && setShowWithdraw(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => !withdrawDone && setShowWithdraw(false)} />
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

                {/* Amount input */}
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

                {/* Payment method — saved cards */}
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

                  {/* Add new card */}
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
                            setNewExpiry(digits.length > 2 ? `${digits.slice(0,2)}/${digits.slice(2)}` : digits);
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
                            const newId = `c${Date.now()}`;
                            const newCard = { id: newId, brand, last4: newCardNumber.slice(-4), expiry: newExpiry };
                            setSavedCards(prev => [...prev, newCard]);
                            setSelectedCardId(newId);
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

                {/* Payment method — IBAN */}
                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: textSub }]}>Bank transfer (IBAN)</Text>
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
                      <Text style={[styles.methodTitle, { color: textPrimary }]}>Enter bank account</Text>
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
                  onPress={() => setShowWithdraw(false)}
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
    gap: 12,
  },

  // Balance card
  balanceCard: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 4,
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '500',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
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

  // Stats cards
  statsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statCardLabel: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 13,
  },

  // Section
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },

  // Chart
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: BAR_MAX_H,
    gap: 6,
  },
  chartBarCol: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
  },
  chartLabels: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 6,
  },
  chartLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
  },

  // Filter tabs
  tabs: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    gap: 2,
    marginTop: -2,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
  },
  tabTextActive: {
    fontWeight: '600',
  },

  // Transactions
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
  },
  txAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  txInitials: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  txInfo: {
    flex: 1,
    gap: 2,
  },
  txClient: {
    fontSize: 14,
    fontWeight: '600',
  },
  txMeta: {
    fontSize: 12,
  },
  txType: {
    fontSize: 12,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#22C55E',
    flexShrink: 0,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
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
