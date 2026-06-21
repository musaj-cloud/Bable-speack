import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';
import { WARMUP_STEPS, type WarmupStep } from '@/lib/warmup';

type Props = {
  step: WarmupStep | 'done';
  percentage: number; // 0–100 for the active step
  onSkip: () => void;
};

const LABELS: Record<WarmupStep, string> = {
  speech: 'Speech recognition',
  translation: 'Translation engine',
  languages: 'Offline languages',
  voice: 'On-device voices',
};

// Full-screen "getting your offline models ready" state shown once, right after
// onboarding. Downloads run in lib/warmup; this reflects which step is in flight
// and its download percentage. A Skip lets the user proceed if a download stalls
// (models then load lazily on first use instead).
export const PreparingModels = ({ step, percentage, onSkip }: Props) => {
  const colors = useTheme();
  const activeIndex = step === 'done' ? WARMUP_STEPS.length : WARMUP_STEPS.indexOf(step);

  const row = (s: WarmupStep, i: number) => {
    const done = i < activeIndex;
    const active = i === activeIndex;
    return (
      <View key={s} className="gap-2">
        <View className="flex-row items-center gap-3">
          <View
            style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.bgCardInner }}
            className="items-center justify-center"
          >
            {done ? (
              <MaterialIcons name="check" size={18} color={colors.success} />
            ) : active ? (
              <ActivityIndicator size="small" color={colors.accentBlue} />
            ) : (
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textMuted }} />
            )}
          </View>
          <Text
            style={{
              ...typography.bodyMd,
              color: done || active ? colors.textPrimary : colors.textMuted,
            }}
            className="flex-1"
          >
            {LABELS[s]}
          </Text>
          {active && (
            <Text style={{ ...typography.mono, color: colors.accentBlue }}>{percentage}%</Text>
          )}
        </View>

        {/* Thin progress bar under the step currently downloading. */}
        {active && (
          <View
            style={{ height: 4, borderRadius: 2, backgroundColor: colors.bgCardInner }}
            className="ml-10 overflow-hidden"
          >
            <View
              style={{
                width: `${percentage}%`,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.accentBlue,
              }}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 px-6 justify-center gap-8">
      <View className="items-center gap-4">
        <View
          style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accentLight }}
          className="items-center justify-center"
        >
          <MaterialIcons name="cloud-download" size={36} color={colors.accentBlue} />
        </View>
        <Text style={{ ...typography.h2, color: colors.textPrimary }} className="text-center">
          Getting things ready
        </Text>
        <Text style={{ ...typography.bodyMd, color: colors.textSecondary }} className="text-center">
          Downloading your translation models once. After this, BabelSpeak works
          fully offline — no internet needed.
        </Text>
      </View>

      <View
        style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1, borderRadius: 16 }}
        className="p-5 gap-4"
      >
        {WARMUP_STEPS.map(row)}
      </View>

      <TouchableOpacity
        onPress={onSkip}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Skip for now"
        className="items-center py-2"
      >
        <Text style={{ ...typography.bodyMd, color: colors.textMuted }}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
};
