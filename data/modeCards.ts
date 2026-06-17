// data/modeCards.ts
// Metadata for the three translation mode cards on the home screen.
import { MaterialIcons } from '@expo/vector-icons';
import { Href } from 'expo-router';
import { Mode } from '@/types/translation';

export type ModeCard = {
  mode: Mode;
  route: Href; // tab route to open when tapped
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  badge?: string; // "LIVE" | "BETA"
  badgeVariant?: 'live' | 'beta';
};

export const MODE_CARDS: ModeCard[] = [
  {
    mode: 'converse',
    route: '/(tabs)',
    icon: 'mic',
    title: 'Converse',
    description: 'Real-time two-way voice translation for natural conversations.',
    badge: 'LIVE',
    badgeVariant: 'live',
  },
  {
    mode: 'document',
    route: '/(tabs)/document',
    icon: 'photo-camera',
    title: 'Document',
    description: 'Instantly translate menus, signs, and documents using your camera.',
  },
  {
    mode: 'meeting',
    route: '/(tabs)/meeting',
    icon: 'graphic-eq',
    title: 'Meeting',
    description: 'Continuous translation and transcription for group discussions.',
    badge: 'BETA',
    badgeVariant: 'beta',
  },
];
