import { Notification } from '@/context/NotificationsContext';
import { useTheme } from '@/context/ThemeContext';
import { X } from 'lucide-react-native';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Props {
  notif: Notification;
  onClose: () => void;
}

export function NotificationDetailModal({ notif, onClose }: Props) {
  const { isDarkMode } = useTheme();
  const Icon = notif.icon;

  const overlay    = 'rgba(0,0,0,0.5)';
  const cardBg     = isDarkMode ? '#1F2937' : '#FFFFFF';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#111827';
  const textSub    = isDarkMode ? '#9CA3AF' : '#6B7280';
  const divider    = isDarkMode ? '#374151' : '#F3F4F6';
  const iconBg     = isDarkMode ? notif.iconBgDark : notif.iconBg;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: overlay }]} onPress={onClose}>
        <Pressable style={[styles.card, { backgroundColor: cardBg }]} onPress={() => {}}>

          {/* Close */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={20} color={textSub} strokeWidth={2} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
            <Icon size={30} color={notif.iconColor} strokeWidth={2} />
          </View>

          {/* Title + datetime */}
          <Text style={[styles.title, { color: textPrimary }]}>{notif.title}</Text>
          <Text style={[styles.datetime, { color: textSub }]}>{notif.datetime}</Text>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: divider }]} />

          {/* Description */}
          <Text style={[styles.description, { color: textSub }]}>{notif.description}</Text>

          {/* Action button */}
          <TouchableOpacity style={styles.actionBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.actionBtnText}>{notif.action}</Text>
          </TouchableOpacity>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 28,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  datetime: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    marginBottom: 20,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    width: '100%',
    marginBottom: 4,
  },
  actionBtn: {
    marginTop: 24,
    backgroundColor: '#208AEF',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
