import { router } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';
import { useTrainerStats } from '@/context/TrainerStatsContext';

const BLUE = '#208AEF';
const YEARS = [2024, 2025, 2026];

type Filter = 'all' | 'this_month' | 'total_sessions';

const BAR_WIDTH  = 44;
const BAR_GAP    = 10;
const BAR_MAX_H  = 140;

type ChartEntry = { month: string; amount: number };

const CHART_BY_YEAR: Record<number, ChartEntry[]> = {
  2024: [
    { month: 'Jan', amount: 0 },
    { month: 'Feb', amount: 0 },
    { month: 'Mar', amount: 0 },
    { month: 'Apr', amount: 0 },
    { month: 'May', amount: 0 },
    { month: 'Jun', amount: 0 },
    { month: 'Jul', amount: 0 },
    { month: 'Aug', amount: 0 },
    { month: 'Sep', amount: 0 },
    { month: 'Oct', amount: 0 },
    { month: 'Nov', amount: 0 },
    { month: 'Dec', amount: 0 },
  ],
  2025: [
    { month: 'Jan', amount: 0   },
    { month: 'Feb', amount: 0   },
    { month: 'Mar', amount: 0   },
    { month: 'Apr', amount: 0   },
    { month: 'May', amount: 0   },
    { month: 'Jun', amount: 0   },
    { month: 'Jul', amount: 0   },
    { month: 'Aug', amount: 0   },
    { month: 'Sep', amount: 80  },
    { month: 'Oct', amount: 120 },
    { month: 'Nov', amount: 160 },
    { month: 'Dec', amount: 140 },
  ],
  2026: [
    { month: 'Jan', amount: 0   },
    { month: 'Feb', amount: 0   },
    { month: 'Mar', amount: 0   },
    { month: 'Apr', amount: 180 },
    { month: 'May', amount: 240 },
    { month: 'Jun', amount: 320 },
    { month: 'Jul', amount: 0   },
    { month: 'Aug', amount: 0   },
    { month: 'Sep', amount: 0   },
    { month: 'Oct', amount: 0   },
    { month: 'Nov', amount: 0   },
    { month: 'Dec', amount: 0   },
  ],
};

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
  { id: '1', client: 'Jonas Kazlauskas', initials: 'JK', date: 'Today, 10:00',     type: 'Football · Individual', amount: 35, color: '#B5C9E4', month: 'this' },
  { id: '2', client: 'Tomas Butkus',     initials: 'TB', date: 'Today, 14:00',     type: 'Football · Group',      amount: 35, color: '#D4B5E4', month: 'this' },
  { id: '3', client: 'Rasa Mockutė',     initials: 'RM', date: 'Yesterday, 09:00', type: 'Football · Individual', amount: 35, color: '#B5E4D4', month: 'this' },
  { id: '4', client: 'Eglė Jankutė',     initials: 'EJ', date: 'Jun 24, 16:00',   type: 'Football · Individual', amount: 35, color: '#E4CDB5', month: 'this' },
  { id: '5', client: 'Andrius Stankus',  initials: 'AS', date: 'Jun 22, 11:00',   type: 'Football · Group',      amount: 35, color: '#E4B5C8', month: 'this' },
  { id: '6', client: 'Viktorija Paulė',  initials: 'VP', date: 'Jun 20, 09:00',   type: 'Football · Individual', amount: 35, color: '#C8B5E4', month: 'this' },
  { id: '7', client: 'Jonas Kazlauskas', initials: 'JK', date: 'May 30, 10:00',   type: 'Football · Individual', amount: 35, color: '#B5C9E4', month: 'last' },
  { id: '8', client: 'Laurynas Grigas',  initials: 'LG', date: 'May 26, 14:00',   type: 'Football · Individual', amount: 35, color: '#E4E4B5', month: 'last' },
];

export default function TrainerEarningsScreen() {
  const insets         = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const trainerStats   = useTrainerStats();

  const [filter,    setFilter]    = useState<Filter>('all');
  const [chartYear, setChartYear] = useState(2026);

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor    = isDarkMode ? '#374151' : '#F3F4F6';

  const filteredTx = TRANSACTIONS.filter(tx => {
    if (filter === 'this_month') return tx.month === 'this';
    return true;
  });

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

        {/* Balance card — read-only */}
        <View style={[styles.balanceCard, { backgroundColor: BLUE }]}>
          <Text style={styles.balanceLabel}>Available to withdraw</Text>
          <Text style={styles.balanceAmount}>€{trainerStats.available.toFixed(2)}</Text>
        </View>

        {/* Stats cards */}
        <View style={styles.statsRow}>
          {([
            { label: 'Available',    value: `€${trainerStats.available}`                    },
            { label: 'This Month',   value: `€${trainerStats.thisMonth}`                    },
            { label: 'Withdrawn',    value: `€${trainerStats.withdrawn}`                    },
            { label: 'Total Earned', value: `€${trainerStats.totalEarned.toLocaleString()}` },
          ] as const).map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: cardBg }]}>
              <Text style={[styles.statCardValue, { color: textPrimary }]}>{s.value}</Text>
              <Text style={[styles.statCardLabel, { color: textSub }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Monthly earnings chart */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Monthly Earnings</Text>
            <View style={styles.yearSelector}>
              <TouchableOpacity
                onPress={() => setChartYear(y => Math.max(YEARS[0], y - 1))}
                disabled={chartYear <= YEARS[0]}
                activeOpacity={0.6}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <ChevronLeft size={18} color={chartYear <= YEARS[0] ? (isDarkMode ? '#4B5563' : '#D1D5DB') : textPrimary} strokeWidth={2} />
              </TouchableOpacity>
              <Text style={[styles.yearLabel, { color: textPrimary }]}>{chartYear}</Text>
              <TouchableOpacity
                onPress={() => setChartYear(y => Math.min(YEARS[YEARS.length - 1], y + 1))}
                disabled={chartYear >= YEARS[YEARS.length - 1]}
                activeOpacity={0.6}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <ChevronRight size={18} color={chartYear >= YEARS[YEARS.length - 1] ? (isDarkMode ? '#4B5563' : '#D1D5DB') : textPrimary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          {(() => {
            const data   = CHART_BY_YEAR[chartYear];
            const maxAmt = Math.max(...data.map(d => d.amount), 1);
            const curIdx = chartYear === 2026 ? 5 : chartYear === 2025 ? 11 : -1;
            return (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chartScroll}>
                {data.map((d, i) => {
                  const isEmpty  = d.amount === 0;
                  const barH     = isEmpty ? 4 : Math.max(10, Math.round((d.amount / maxAmt) * BAR_MAX_H));
                  const isCur    = i === curIdx;
                  const barColor = isEmpty
                    ? (isDarkMode ? '#2D3748' : '#F3F4F6')
                    : isCur ? BLUE : (isDarkMode ? '#374151' : '#E5E7EB');
                  return (
                    <View key={d.month} style={[styles.chartBarCol, { width: BAR_WIDTH }]}>
                      {!isEmpty && (
                        <Text style={[styles.chartAmtLabel, { color: isCur ? BLUE : textSub }]}>
                          €{d.amount}
                        </Text>
                      )}
                      <View style={[styles.chartBar, { height: barH, backgroundColor: barColor }]} />
                      <Text style={[styles.chartLabel, { color: isCur ? BLUE : isEmpty ? (isDarkMode ? '#4B5563' : '#D1D5DB') : textSub }]}>
                        {d.month}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            );
          })()}
        </View>

        {/* Transactions */}
        <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Transactions</Text>

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
    paddingVertical: 20,
    gap: 6,
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
    letterSpacing: -0.5,
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

  // Section card
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
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  yearLabel: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'center',
  },
  chartScroll: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: BAR_GAP,
    paddingVertical: 4,
  },
  chartBarCol: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  chartAmtLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  chartBar: {
    width: '100%',
    borderRadius: 5,
  },
  chartLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
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
});
