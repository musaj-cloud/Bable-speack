import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';
import { ModeCard as ModeCardData } from '@/data/modeCards';

type Props = {
  card: ModeCardData;
  onPress: () => void;
};

// A large tappable translation-mode card: icon chip + optional badge + title + copy.
export const ModeCard = ({ card, onPress }: Props) => {
  const colors = useTheme();
  const isConverse = card.mode === 'converse';

  // Converse gets the solid accent chip; Document/Meeting get a neutral chip.
  const chipBg = isConverse ? colors.accentBlue : colors.bgCardInner;
  const chipIcon = isConverse ? '#ffffff' : colors.textPrimary;
  const badgeColor = card.badgeVariant === 'live' ? colors.accentBlue : colors.textSecondary;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: colors.bgCard,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 24,
        padding: 20,
        minHeight: 200,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
      className="justify-between"
    >
      <View className="flex-row items-start justify-between">
        <View
          style={{ width: 56, height: 56, borderRadius: 99, backgroundColor: chipBg }}
          className="items-center justify-center"
        >
          <MaterialIcons name={card.icon} size={28} color={chipIcon} />
        </View>

        {card.badge ? (
          <View
            style={{ backgroundColor: colors.bgCardInner, borderRadius: 99 }}
            className="px-3 py-1"
          >
            <Text style={{ ...typography.label, color: badgeColor }}>{card.badge}</Text>
          </View>
        ) : null}
      </View>

      <View className="mt-6 gap-1">
        <Text style={{ ...typography.h3, color: colors.textPrimary }}>{card.title}</Text>
        <Text style={{ ...typography.bodyLg, color: colors.textSecondary }}>
          {card.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
