import { router } from 'expo-router';
import { ChevronLeft, Heart, MapPin, Star } from 'lucide-react-native';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';

const PINK = '#F43F5E';

const SAVED_CLIENTS = [
  {
    id: '1',
    initials: 'JK',
    color: '#B5C9E4',
    name: 'Jonas Kazlauskas',
    city: 'Vilnius',
    memberSince: 'Jan 2024',
    sport: '⚽ Football',
  },
  {
    id: '2',
    initials: 'MP',
    color: '#C8DDB5',
    name: 'Marta Petraitytė',
    city: 'Vilnius',
    memberSince: 'Mar 2024',
    sport: '🏃 Running',
  },
  {
    id: '3',
    initials: 'RV',
    color: '#D4B5E4',
    name: 'Rasa Vaitkutė',
    city: 'Kaunas',
    memberSince: 'Feb 2024',
    sport: '💪 CrossFit',
  },
  {
    id: '4',
    initials: 'TK',
    color: '#E4CDB5',
    name: 'Tomas Klimavičius',
    city: 'Vilnius',
    memberSince: 'May 2024',
    sport: '⚽ Football',
  },
  {
    id: '5',
    initials: 'EJ',
    color: '#B5E4D4',
    name: 'Eglė Jankauskaitė',
    city: 'Klaipėda',
    memberSince: 'Jun 2024',
    sport: '🏊 Swimming',
  },
  {
    id: '6',
    initials: 'AK',
    color: '#E4B5C8',
    name: 'Andrius Kazlauskas',
    city: 'Vilnius',
    memberSince: 'Aug 2024',
    sport: '🎾 Tennis',
  },
];

export default function SavedByClientsScreen() {
  const insets         = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor    = isDarkMode ? '#374151' : '#F3F4F6';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* Header */}
      <View style={[styles.header, {
        paddingTop: insets.top + 8,
        backgroundColor: headerBg,
        borderBottomColor: borderColor,
      }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={22} color={PINK} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Heart size={16} color={PINK} fill={PINK} />
          <Text style={[styles.headerTitle, { color: textPrimary }]}>Saved by Clients</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>

        {/* Count banner */}
        <View style={[styles.countBanner, { backgroundColor: isDarkMode ? '#1F2937' : '#FFF1F2', borderColor: isDarkMode ? '#374151' : '#FFE4E6' }]}>
          <Text style={[styles.countText, { color: PINK }]}>
            {SAVED_CLIENTS.length} clients saved your profile
          </Text>
        </View>

        {/* Client list */}
        <View style={[styles.listCard, { backgroundColor: cardBg, borderColor }]}>
          {SAVED_CLIENTS.map((client, i) => (
            <View key={client.id}>
              <View style={styles.clientRow}>
                <View style={[styles.avatar, { backgroundColor: client.color }]}>
                  <Text style={styles.initials}>{client.initials}</Text>
                </View>
                <View style={styles.clientInfo}>
                  <Text style={[styles.clientName, { color: textPrimary }]}>{client.name}</Text>
                  <View style={styles.metaRow}>
                    <MapPin size={12} color={textSub} strokeWidth={2} />
                    <Text style={[styles.metaText, { color: textSub }]}>{client.city}</Text>
                    <Text style={[styles.metaDot, { color: textSub }]}>·</Text>
                    <Text style={[styles.metaText, { color: textSub }]}>Since {client.memberSince}</Text>
                  </View>
                  <Text style={[styles.sport, { color: textSub }]}>{client.sport}</Text>
                </View>
                <Heart size={16} color={PINK} fill={PINK} style={styles.heartIcon} />
              </View>
              {i < SAVED_CLIENTS.length - 1 && (
                <View style={[styles.divider, { backgroundColor: divColor }]} />
              )}
            </View>
          ))}
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
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },

  scroll: {
    padding: 16,
    gap: 12,
  },

  countBanner: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
  },

  listCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  initials: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  clientInfo: {
    flex: 1,
    gap: 4,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  metaDot: {
    fontSize: 12,
  },
  sport: {
    fontSize: 12,
  },
  heartIcon: {
    flexShrink: 0,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
});
