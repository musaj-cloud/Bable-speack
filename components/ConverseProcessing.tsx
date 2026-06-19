import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, Text, View } from 'react-native';
import { PulseRings } from '@/components/PulseRings';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  listening?: boolean; // recording = warm red ring; otherwise a spinner
};

// Centered status shown while the voice pipeline is running (listening /
// transcribing), in place of the empty state or translation cards.
export const ConverseProcessing = ({ icon, label, listening }: Props) => {
  const colors = useTheme();
  const tint = listening ? colors.warningRed : colors.accentBlue;

  return (
    <View className="items-center justify-center gap-5">
      <View style={{ width: 96, height: 96 }} className="items-center justify-center">
        {/* Sound-wave ripples emanate from the mic while recording. */}
        {listening && <PulseRings size={96} color={colors.warningRed} />}
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: colors.bgCardInner,
            borderWidth: listening ? 2 : 0,
            borderColor: tint,
          }}
          className="items-center justify-center"
        >
          <MaterialIcons name={icon} size={40} color={tint} />
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        {!listening && <ActivityIndicator color={colors.accentBlue} />}
        <Text style={{ ...typography.h4, color: colors.textSecondary }}>{label}</Text>
      </View>
    </View>
  );
};
