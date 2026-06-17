import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

const ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  index: 'forum',
  document: 'description',
  meeting: 'groups',
  history: 'history',
  settings: 'settings',
};

const LABELS: Record<string, string> = {
  index: 'Converse',
  document: 'Document',
  meeting: 'Meeting',
  history: 'History',
  settings: 'Settings',
};

export type TabItem = { key: string; name: string; focused: boolean; onPress: () => void };

// Presentational 5-tab bottom bar shared by the tab navigator and the home hub:
// accent pill + icon + small label for the active tab.
export const TabBarView = ({ items }: { items: TabItem[] }) => {
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: colors.bgPrimary,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        paddingBottom: Math.max(insets.bottom, 12) + 6,
        paddingTop: 10,
      }}
      className="flex-row items-start justify-around px-2"
    >
      {items.map((item) => {
        const color = item.focused ? colors.tabActive : colors.tabInactive;
        const tint = item.focused ? '#ffffff' : color;

        return (
          <TouchableOpacity
            key={item.key}
            accessibilityRole="button"
            accessibilityState={item.focused ? { selected: true } : {}}
            onPress={item.onPress}
            className="flex-1 items-center"
          >
            <View
              style={{
                backgroundColor: item.focused ? colors.accentBlue : 'transparent',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 6,
              }}
              className="items-center gap-1"
            >
              <MaterialIcons name={ICONS[item.name] ?? 'circle'} size={24} color={tint} />
              <Text style={{ ...typography.tab, fontSize: 10, letterSpacing: 0.3, color: tint }}>
                {LABELS[item.name] ?? item.name}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
