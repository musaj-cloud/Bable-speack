import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionBar } from '@/components/ActionBar';
import { CameraFrame } from '@/components/CameraFrame';
import { HomeHeader } from '@/components/HomeHeader';
import { LanguageBar } from '@/components/LanguageBar';
import { useTheme } from '@/hooks/useTheme';

// Document: photograph a sign/menu, then OCR + translate (capture UI; OCR is Phase 3).
export default function Document() {
  const colors = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={['top']}>
      <HomeHeader />

      <View className="flex-1 px-5 pt-2 pb-4">
        <LanguageBar middle="arrow" />

        <View className="flex-1 mt-4 mb-6">
          <CameraFrame />
        </View>

        <ActionBar
          left={{ icon: 'photo-library', label: 'Choose from gallery', onPress: () => {} }}
          center={{ icon: 'camera', label: 'Capture document', onPress: () => {} }}
          right={{ icon: 'flash-off', label: 'Toggle flash', onPress: () => {} }}
        />
      </View>
    </SafeAreaView>
  );
}
