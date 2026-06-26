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

export default function TrainerEarningsScreen() {
  const insets         = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const [filter,        setFilter]        = useState<Filter>('all');
  const [showWithdraw,  setShowWithdraw]  = useState(false);
  const [bankAccount,   setBankAccount]   = useState('');
  const [withdrawDone,  setWithdrawDone]  = useState(false);

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
      setBankAccount('');
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
          <Text style={styles.balanceAmount}>€1,240.00</Text>
          <TouchableOpacity
            style={styles.withdrawBtn}
            onPress={() => setShowWithdraw(true)}
            activeOpacity={0.85}>
            <ArrowUpRight size={15} color={BLUE} strokeWidth={2.5} />
            <Text style={[styles.withdrawBtnText, { color: BLUE }]}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        {/* Stats cards */}
        <View style={styles.statsRow}>
          {([
            { label: 'All Earnings',    value: '€111,240' },
            { label: 'This Month',      value: '€3,620'   },
            { label: 'Total Sessions',  value: '28'        },
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
        animationType="slide"
        onRequestClose={() => setShowWithdraw(false)}>
        <Pressable style={styles.overlay} onPress={() => !withdrawDone && setShowWithdraw(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.overlayKAV}>
            <Pressable style={[styles.sheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
              <View style={styles.sheetHandle} />

              {withdrawDone ? (
                <View style={styles.withdrawSuccess}>
                  <View style={styles.withdrawSuccessIcon}>
                    <Text style={styles.withdrawSuccessCheck}>✓</Text>
                  </View>
                  <Text style={[styles.withdrawSuccessTitle, { color: textPrimary }]}>
                    Withdrawal Initiated
                  </Text>
                  <Text style={[styles.withdrawSuccessSub, { color: textSub }]}>
                    €1,240.00 will arrive within 1–2 business days.
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={[styles.sheetTitle, { color: textPrimary }]}>Withdraw Funds</Text>

                  <View style={[styles.withdrawAmountCard, {
                    backgroundColor: isDarkMode ? '#111827' : '#F0F7FF',
                    borderColor: BLUE + '40',
                  }]}>
                    <Text style={[styles.withdrawAmountLabel, { color: textSub }]}>Amount</Text>
                    <Text style={[styles.withdrawAmountValue, { color: BLUE }]}>€1,240.00</Text>
                  </View>

                  <View style={styles.fieldWrap}>
                    <Text style={[styles.fieldLabel, { color: textSub }]}>Bank account (IBAN)</Text>
                    <TextInput
                      style={[styles.fieldInput, {
                        backgroundColor: inputBg,
                        color:           textPrimary,
                        borderColor:     isDarkMode ? '#374151' : '#E5E7EB',
                      }]}
                      value={bankAccount}
                      onChangeText={setBankAccount}
                      placeholder="LT00 0000 0000 0000 0000"
                      placeholderTextColor={isDarkMode ? '#4B5563' : '#9CA3AF'}
                      autoCapitalize="characters"
                      autoCorrect={false}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.confirmBtn, !bankAccount.trim() && styles.confirmBtnDisabled]}
                    onPress={handleWithdraw}
                    disabled={!bankAccount.trim()}
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
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
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
    padding: 22,
    gap: 6,
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginTop: 2,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  withdrawBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Stats cards
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
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
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
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
    justifyContent: 'flex-end',
  },
  overlayKAV: {
    justifyContent: 'flex-end',
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
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  withdrawAmountCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 3,
  },
  withdrawAmountLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  withdrawAmountValue: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  fieldWrap: {
    gap: 8,
    marginTop: -2,
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
    letterSpacing: 0.5,
  },
  confirmBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
