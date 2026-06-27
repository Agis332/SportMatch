import { router } from 'expo-router';
import { ChevronLeft, Heart, Mail, MapPin, Phone, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';

const BLUE = '#208AEF';
const PINK = '#F43F5E';

interface Client {
  id: string;
  initials: string;
  color: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  memberSince: string;
  sport: string;
}

const SAVED_CLIENTS: Client[] = [
  {
    id: '1',
    initials: 'JK',
    color: '#B5C9E4',
    name: 'Jonas Kazlauskas',
    email: 'jonas.k@gmail.com',
    phone: '+370 612 34567',
    city: 'Vilnius',
    memberSince: 'Jan 2024',
    sport: '⚽ Football',
  },
  {
    id: '2',
    initials: 'MP',
    color: '#C8DDB5',
    name: 'Marta Petraitytė',
    email: 'marta.p@gmail.com',
    phone: '+370 698 76543',
    city: 'Vilnius',
    memberSince: 'Mar 2024',
    sport: '🏃 Running',
  },
  {
    id: '3',
    initials: 'RV',
    color: '#D4B5E4',
    name: 'Rasa Vaitkutė',
    email: 'rasa.v@gmail.com',
    phone: '+370 655 11223',
    city: 'Kaunas',
    memberSince: 'Feb 2024',
    sport: '💪 CrossFit',
  },
  {
    id: '4',
    initials: 'TK',
    color: '#E4CDB5',
    name: 'Tomas Klimavičius',
    email: 'tomas.k@gmail.com',
    phone: '+370 677 88990',
    city: 'Vilnius',
    memberSince: 'May 2024',
    sport: '⚽ Football',
  },
  {
    id: '5',
    initials: 'EJ',
    color: '#B5E4D4',
    name: 'Eglė Jankauskaitė',
    email: 'egle.j@gmail.com',
    phone: '+370 640 55667',
    city: 'Klaipėda',
    memberSince: 'Jun 2024',
    sport: '🏊 Swimming',
  },
  {
    id: '6',
    initials: 'AK',
    color: '#E4B5C8',
    name: 'Andrius Kazlauskas',
    email: 'andrius.k@gmail.com',
    phone: '+370 623 99001',
    city: 'Vilnius',
    memberSince: 'Aug 2024',
    sport: '🎾 Tennis',
  },
];

export default function SavedByClientsScreen() {
  const insets         = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const [selected, setSelected] = useState<Client | null>(null);

  const bg          = isDarkMode ? '#111827' : '#F3F4F6';
  const headerBg    = isDarkMode ? '#111827' : '#FFFFFF';
  const cardBg      = isDarkMode ? '#1F2937' : '#FFFFFF';
  const sheetBg     = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor = isDarkMode ? '#374151' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub     = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divColor    = isDarkMode ? '#374151' : '#F3F4F6';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={22} color={textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Heart size={18} color="#EF4444" fill="#EF4444" />
          <Text style={styles.headerCount}>{SAVED_CLIENTS.length}</Text>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>Saved by Clients</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>

        {/* Client list */}
        <View style={[styles.listCard, { backgroundColor: cardBg, borderColor }]}>
          {SAVED_CLIENTS.map((client, i) => (
            <View key={client.id}>
              <TouchableOpacity
                style={styles.clientRow}
                onPress={() => setSelected(client)}
                activeOpacity={0.7}>
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
              </TouchableOpacity>
              {i < SAVED_CLIENTS.length - 1 && (
                <View style={[styles.divider, { backgroundColor: divColor }]} />
              )}
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Client detail modal */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.overlay} onPress={() => setSelected(null)}>
          <Pressable style={[styles.sheet, { backgroundColor: sheetBg }]} onPress={() => {}}>

            {/* Close button */}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)} activeOpacity={0.7}>
              <X size={20} color={textSub} strokeWidth={2} />
            </TouchableOpacity>

            {selected && (
              <>
                {/* Avatar */}
                <View style={[styles.modalAvatar, { backgroundColor: selected.color }]}>
                  <Text style={styles.modalInitials}>{selected.initials}</Text>
                </View>

                {/* Name */}
                <Text style={[styles.modalName, { color: textPrimary }]}>{selected.name}</Text>

                {/* Sport */}
                <Text style={[styles.modalSport, { color: textSub }]}>{selected.sport}</Text>

                {/* Info rows */}
                <View style={[styles.infoBox, { borderColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                  <InfoRow icon={<Mail size={15} color={BLUE} strokeWidth={2} />} label="Email" value={selected.email} textPrimary={textPrimary} textSub={textSub} divColor={divColor} />
                  <InfoRow icon={<Phone size={15} color={BLUE} strokeWidth={2} />} label="Phone" value={selected.phone} textPrimary={textPrimary} textSub={textSub} divColor={divColor} />
                  <InfoRow icon={<MapPin size={15} color={BLUE} strokeWidth={2} />} label="City" value={selected.city} textPrimary={textPrimary} textSub={textSub} divColor={divColor} />
                  <InfoRow icon={<Heart size={15} color={PINK} fill={PINK} strokeWidth={2} />} label="Member since" value={selected.memberSince} textPrimary={textPrimary} textSub={textSub} divColor={divColor} last />
                </View>

                {/* Send Message */}
                <TouchableOpacity
                  style={styles.msgBtn}
                  onPress={() => {
                    setSelected(null);
                    router.push(`/trainer-mode/chat?clientId=${selected.id}&clientName=${encodeURIComponent(selected.name)}&initials=${selected.initials}&color=${encodeURIComponent(selected.color)}` as never);
                  }}
                  activeOpacity={0.85}>
                  <Text style={styles.msgBtnText}>Send Message</Text>
                </TouchableOpacity>
              </>
            )}

          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}

function InfoRow({
  icon, label, value, textPrimary, textSub, divColor, last = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  textPrimary: string;
  textSub: string;
  divColor: string;
  last?: boolean;
}) {
  return (
    <>
      <View style={styles.infoRow}>
        <View style={styles.infoIconWrap}>{icon}</View>
        <View style={styles.infoText}>
          <Text style={[styles.infoLabel, { color: textSub }]}>{label}</Text>
          <Text style={[styles.infoValue, { color: textPrimary }]}>{value}</Text>
        </View>
      </View>
      {!last && <View style={[styles.divider, { backgroundColor: divColor }]} />}
    </>
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
  headerCount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#EF4444',
  },

  scroll: {
    padding: 16,
    gap: 14,
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

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 4,
  },

  modalAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalInitials: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
  },
  modalName: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalSport: {
    fontSize: 14,
    marginBottom: 4,
  },

  infoBox: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  infoIconWrap: {
    width: 24,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    gap: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  msgBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  msgBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
