import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  // 'row' = BACK + CONTINUE side by side. 'stacked' = CONTINUE on top
  // (full width), BACK as a transparent text button below (Ready screen).
  layout?: 'row' | 'stacked';
};

export const OnboardingFooter = ({
  onBack,
  onContinue,
  continueLabel = 'CONTINUE',
  layout = 'row',
}: Props) => {
  const colors = useTheme();

  const continueButton = (
    <TouchableOpacity
      onPress={onContinue}
      activeOpacity={0.85}
      accessibilityRole="button"
      style={{
        backgroundColor: colors.accentBlue,
        borderRadius: 16,
        minHeight: 52,
        flex: layout === 'row' ? (onBack ? 2 : 1) : undefined,
      }}
      className="flex-row items-center justify-center gap-2 px-6"
    >
      <Text style={{ ...typography.label, color: '#ffffff' }}>{continueLabel}</Text>
      <MaterialIcons name="arrow-forward" size={16} color="#ffffff" />
    </TouchableOpacity>
  );

  if (layout === 'stacked') {
    return (
      <View className="gap-2">
        {continueButton}
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            style={{ borderRadius: 16, minHeight: 52 }}
            className="items-center justify-center px-6"
          >
            <Text style={{ ...typography.label, color: colors.textSecondary }}>BACK</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View className="flex-row gap-3">
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          style={{
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 16,
            minHeight: 52,
          }}
          className="flex-1 items-center justify-center px-6"
        >
          <Text style={{ ...typography.label, color: colors.textPrimary }}>BACK</Text>
        </TouchableOpacity>
      )}
      {continueButton}
    </View>
  );
};
