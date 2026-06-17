import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  langName: string;
  text: string;
  variant: 'source' | 'target';
  onSpeak?: () => void;
  showWaveform?: boolean;
};

// Heights for the static speech-wave visualization on the source card.
const WAVE_BARS = [16, 24, 12, 20, 10];

// Translation card: white "source" card or accent "target" card with speaker.
export const TranslationCard = ({ langName, text, variant, onSpeak, showWaveform }: Props) => {
  const colors = useTheme();
  const isTarget = variant === 'target';

  const bg = isTarget ? colors.accentBlue : colors.bgCard;
  const labelColor = isTarget ? 'rgba(255,255,255,0.7)' : colors.textMuted;
  const textColor = isTarget ? '#ffffff' : colors.textPrimary;

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
      className="p-5"
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text style={{ ...typography.label, color: labelColor }}>{langName}</Text>
        {isTarget && onSpeak && (
          <TouchableOpacity
            onPress={onSpeak}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Play translation"
            style={{ width: 32, height: 32, borderRadius: 16 }}
            className="items-center justify-center"
          >
            <MaterialIcons name="volume-up" size={22} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={{ ...typography.h3, fontSize: 24, lineHeight: 32, color: textColor }}>
        {text}
      </Text>

      {showWaveform && (
        <View className="flex-row items-end gap-1 mt-4 h-6">
          {WAVE_BARS.map((h, i) => (
            <View
              key={i}
              style={{
                width: 4,
                height: h,
                borderRadius: 2,
                backgroundColor: colors.accentBlue,
                opacity: 0.5,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
};
