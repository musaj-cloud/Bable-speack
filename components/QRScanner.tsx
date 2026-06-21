import { MaterialIcons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  onScanned: (data: string) => void;
  onCancel: () => void;
};

// Full-screen QR scanner for joining a Live Conversation. Reuses expo-camera
// (already used by Document mode) — no extra native module. Fires onScanned once.
export const QRScanner = ({ onScanned, onCancel }: Props) => {
  const colors = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const handled = useRef(false);

  if (!permission?.granted) {
    return (
      <View
        style={{ flex: 1, backgroundColor: colors.bgPrimary }}
        className="items-center justify-center px-8 gap-4"
      >
        <MaterialIcons name="qr-code-scanner" size={44} color={colors.textMuted} />
        <Text style={{ ...typography.bodyMd, color: colors.textSecondary, textAlign: 'center' }}>
          Allow camera access to scan the other phone’s pairing code.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          activeOpacity={0.85}
          style={{ backgroundColor: colors.accentBlue, borderRadius: 12 }}
          className="px-5 py-3"
        >
          <Text style={{ ...typography.label, color: '#ffffff' }}>GRANT ACCESS</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel} className="px-5 py-3">
          <Text style={{ ...typography.label, color: colors.textMuted }}>CANCEL</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={({ data }) => {
          if (handled.current || !data) return;
          handled.current = true;
          onScanned(data);
        }}
      />

      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        className="items-center justify-center"
      >
        <View style={{ width: 240, height: 240, borderColor: '#ffffff', borderWidth: 3, borderRadius: 24 }} />
        <Text style={{ ...typography.label, color: '#ffffff', marginTop: 16 }}>
          SCAN THE PAIRING CODE
        </Text>
      </View>

      <TouchableOpacity
        onPress={onCancel}
        accessibilityLabel="Cancel scan"
        style={{ position: 'absolute', top: 16, left: 16, width: 44, height: 44, borderRadius: 99, backgroundColor: 'rgba(0,0,0,0.5)' }}
        className="items-center justify-center"
      >
        <MaterialIcons name="close" size={26} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};
