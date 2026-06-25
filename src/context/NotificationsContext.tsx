import { Bell, Calendar, Check, CreditCard, MessageCircle, Star } from 'lucide-react-native';
import { createContext, useContext, useMemo, useState } from 'react';

export type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

export interface Notification {
  id: string;
  icon: IconComponent;
  iconColor: string;
  iconBg: string;
  iconBgDark: string;
  title: string;
  description: string;
  body: string;
  time: string;
  datetime: string;
  action: string;
  read: boolean;
  group: 'today' | 'earlier';
}

interface NotificationsContextValue {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  markAsRead: () => {},
  markAllAsRead: () => {},
  unreadCount: 0,
});

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    icon: Calendar,
    iconColor: '#16A34A',
    iconBg: '#DCFCE7',
    iconBgDark: '#052E16',
    title: 'Booking Confirmed',
    description: 'Your session with Mantas Petrauskas on Tue, 24 Jun at 10:00 AM is confirmed.',
    body: 'Your session has been successfully confirmed. Here are the details:\n\nSport: Football\nTrainer: Mantas Petrauskas\nDate: Tuesday, 24 June 2026\nTime: 10:00 – 11:00 AM\nLocation: Olympic Sports Centre, Vilnius\nDuration: 60 minutes\nPrice: €35',
    time: '09:39',
    datetime: 'Thu, 25 Jun 2026 · 09:39',
    action: 'View Booking',
    read: false,
    group: 'today',
  },
  {
    id: '2',
    icon: MessageCircle,
    iconColor: '#208AEF',
    iconBg: '#EFF6FF',
    iconBgDark: '#1E3A5F',
    title: 'New Message',
    description: 'Rūta Kazlauskaitė: "See you Thursday at 9am! Don\'t forget your mat 🧘"',
    body: 'Rūta Kazlauskaitė sent you a new message.\n\n"See you Thursday at 9am! Don\'t forget your mat 🧘"\n\nTap Reply to respond to Rūta directly.',
    time: '09:26',
    datetime: 'Thu, 25 Jun 2026 · 09:26',
    action: 'Reply',
    read: false,
    group: 'today',
  },
  {
    id: '3',
    icon: Bell,
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
    iconBgDark: '#2D1A00',
    title: 'Session in 1 Hour',
    description: 'Reminder: your Boxing session with Darius Paulauskas starts at 6:00 PM today.',
    body: 'Your Boxing session is starting in about 1 hour. Please make sure you\'re ready and on time.\n\nSport: Boxing\nTrainer: Darius Paulauskas\nDate: Thursday, 25 June 2026\nTime: 6:00 – 7:00 PM\nLocation: Boxing Academy, Vilnius\nDuration: 60 minutes\nPrice: €40',
    time: '08:54',
    datetime: 'Thu, 25 Jun 2026 · 08:54',
    action: 'View Booking',
    read: false,
    group: 'today',
  },
  {
    id: '4',
    icon: Check,
    iconColor: '#16A34A',
    iconBg: '#DCFCE7',
    iconBgDark: '#052E16',
    title: 'Request Accepted',
    description: 'Rūta Kazlauskaitė accepted your session request for Thu, 26 Jun.',
    body: 'Great news! Rūta Kazlauskaitė has accepted your booking request.\n\nSport: Yoga\nDate: Thursday, 26 June 2026\nTime: 9:00 AM\nLocation: Studio Amber, Vilnius\nDuration: 60 minutes\nPrice: €45\n\nYour slot is now confirmed. You\'ll receive a reminder before the session.',
    time: '06:41',
    datetime: 'Thu, 25 Jun 2026 · 06:41',
    action: 'View Booking',
    read: true,
    group: 'today',
  },
  {
    id: '5',
    icon: Star,
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
    iconBgDark: '#2D1A00',
    title: 'Leave a Review',
    description: 'How was your session with Mantas Petrauskas on Wed, 11 Jun? Share your feedback.',
    body: 'You recently completed a Football session with Mantas Petrauskas on Wednesday, 11 June 2026.\n\nYour review helps other users make better decisions and motivates trainers to keep delivering great sessions.\n\nReviews take about 2 minutes to complete.',
    time: 'Tue 14:30',
    datetime: 'Tue, 24 Jun 2026 · 14:30',
    action: 'Write Review',
    read: false,
    group: 'earlier',
  },
  {
    id: '6',
    icon: CreditCard,
    iconColor: '#16A34A',
    iconBg: '#DCFCE7',
    iconBgDark: '#052E16',
    title: 'Payment Successful',
    description: '€45 payment for your Yoga session with Rūta Kazlauskaitė was processed successfully.',
    body: 'Your payment was processed successfully.\n\nAmount: €45\nSession: Yoga with Rūta Kazlauskaitė\nDate: Monday, 16 June 2026\nPayment method: Visa •••• 4242\nTransaction ID: TXN-20260616-4242\n\nA receipt has been sent to your email address.',
    time: 'Mon 10:15',
    datetime: 'Mon, 23 Jun 2026 · 10:15',
    action: 'View Receipt',
    read: true,
    group: 'earlier',
  },
  {
    id: '7',
    icon: MessageCircle,
    iconColor: '#208AEF',
    iconBg: '#EFF6FF',
    iconBgDark: '#1E3A5F',
    title: 'New Message',
    description: 'Darius Paulauskas: "Can you move Tuesday\'s session to 6pm instead?"',
    body: 'Darius Paulauskas sent you a new message.\n\n"Can you move Tuesday\'s session to 6pm instead?"\n\nTap Reply to respond to Darius directly.',
    time: 'Mon 08:30',
    datetime: 'Mon, 23 Jun 2026 · 08:30',
    action: 'Reply',
    read: true,
    group: 'earlier',
  },
  {
    id: '8',
    icon: Star,
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
    iconBgDark: '#2D1A00',
    title: 'Leave a Review',
    description: 'How was your Yoga session with Rūta Kazlauskaitė on Mon, 16 Jun? Let us know!',
    body: 'You recently completed a Yoga session with Rūta Kazlauskaitė on Monday, 16 June 2026.\n\nYour review helps other users discover great trainers and motivates instructors to continue their excellent work.\n\nReviews take about 2 minutes to complete.',
    time: 'Sun 19:45',
    datetime: 'Sun, 22 Jun 2026 · 19:45',
    action: 'Write Review',
    read: true,
    group: 'earlier',
  },
];

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications],
  );

  function markAsRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  function markAllAsRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  return (
    <NotificationsContext.Provider value={{ notifications, markAsRead, markAllAsRead, unreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
