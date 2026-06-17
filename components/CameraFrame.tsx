import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  hint?: string;
};

// Dark camera-viewport surface (media area, theme-independent like a video feed).
const VIEWPORT_BG = '#1b1c1a';
const BRACKET = 28;
const BRACKET_W = 3;

// Document capture frame: dark viewport with accent corner brackets + scan hint.
// Real expo-camera preview is wired in Phase 3; this is the framing UI.
export const CameraFrame = ({ hint = 'Align text within frame' }: Props) => {
  const colors = useTheme();

  const corner = (pos: 'tl' | 'tr' | 'bl' | 'br') => {
    const top = pos === 'tl' || pos === 'tr';
    const left = pos === 'tl' || pos === 'bl';
    return (
      <View
        style={{
          position: 'absolute',
          width: BRACKET,
          height: BRACKET,
          [top ? 'top' : 'bottom']: 14,
          [left ? 'left' : 'right']: 14,
          [top ? 'borderTopWidth' : 'borderBottomWidth']: BRACKET_W,
          [left ? 'borderLeftWidth' : 'borderRightWidth']: BRACKET_W,
          borderColor: colors.accentLight,
          borderTopLeftRadius: pos === 'tl' ? 8 : 0,
          borderTopRightRadius: pos === 'tr' ? 8 : 0,
          borderBottomLeftRadius: pos === 'bl' ? 8 : 0,
          borderBottomRightRadius: pos === 'br' ? 8 : 0,
        }}
      />
    );
  };

  return (
    <View
      style={{ flex: 1, borderRadius: 24, overflow: 'hidden', backgroundColor: VIEWPORT_BG }}
      className="items-center justify-center"
    >
      {corner('tl')}
      {corner('tr')}
      {corner('bl')}
      {corner('br')}

      <MaterialIcons name="document-scanner" size={44} color="rgba(255,255,255,0.85)" />
      <Text style={{ ...typography.h4, color: '#ffffff' }} className="mt-3">
        {hint}
      </Text>
    </View>
  );
};
