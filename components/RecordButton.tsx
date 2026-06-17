import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  recording: boolean;
  onPress: () => void;
};

// Large circular record/stop control with a soft glow.
export const RecordButton = ({ recording, onPress }: Props) => {
  const colors = useTheme();
  const tint = recording ? colors.warningRed : colors.accentBlue;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={recording ? 'Stop recording' : 'Start recording'}
      style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: tint,
        shadowColor: tint,
        shadowOpacity: 0.4,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      }}
      className="items-center justify-center"
    >
      <MaterialIcons name={recording ? 'stop' : 'mic'} size={36} color="#ffffff" />
    </TouchableOpacity>
  );
};
