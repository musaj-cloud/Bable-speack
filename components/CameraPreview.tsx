import { MaterialIcons } from '@expo/vector-icons';
import { RefObject } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { CameraView, type PermissionResponse } from 'expo-camera';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  camRef: RefObject<CameraView | null>;
  torch: boolean;
  permission: PermissionResponse | null;
  onRequestPermission: () => void;
};

// Dark camera-viewport surface (media area, theme-independent like a video feed).
const BRACKET = 28;
const BRACKET_W = 3;

// Live document-capture viewport: the real camera feed framed with accent
// corner brackets. Falls back to a permission prompt until access is granted.
export const CameraPreview = ({ camRef, torch, permission, onRequestPermission }: Props) => {
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
        }}
      />
    );
  };

  if (!permission?.granted) {
    return (
      <View
        style={{ flex: 1, borderRadius: 24, backgroundColor: colors.bgCardInner }}
        className="items-center justify-center px-8"
      >
        <MaterialIcons name="photo-camera" size={44} color={colors.textMuted} />
        <Text
          style={{ ...typography.bodyMd, color: colors.textSecondary, textAlign: 'center' }}
          className="mt-3 mb-4"
        >
          Allow camera access to read and translate text on device.
        </Text>
        <TouchableOpacity
          onPress={onRequestPermission}
          activeOpacity={0.85}
          style={{ backgroundColor: colors.accentBlue, borderRadius: 12 }}
          className="px-5 py-3"
        >
          <Text style={{ ...typography.label, color: '#ffffff' }}>GRANT ACCESS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, borderRadius: 24, overflow: 'hidden' }}>
      <CameraView ref={camRef} style={{ flex: 1 }} facing="back" enableTorch={torch} />
      {corner('tl')}
      {corner('tr')}
      {corner('bl')}
      {corner('br')}
    </View>
  );
};
