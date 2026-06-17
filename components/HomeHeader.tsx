import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { images } from '@/constants/images';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

// Top app bar for the home screen: logo · BabelSpeak (centered) · settings.
export const HomeHeader = () => {
  const colors = useTheme();

  return (
    <View
      style={{ backgroundColor: colors.bgPrimary }}
      className="h-16 px-5 flex-row items-center justify-between"
    >
      <View style={{ width: 40, height: 40 }} className="items-center justify-center">
        <Image
          source={images.iconTransparent}
          style={{ width: 40, height: 40 }}
          resizeMode="contain"
          accessibilityLabel="BabelSpeak logo"
        />
      </View>

      <Text style={{ ...typography.h3, color: colors.accentBlue }}>BabelSpeak</Text>

      <TouchableOpacity
        accessibilityLabel="Settings"
        onPress={() => router.push('/(tabs)/settings')}
        style={{ width: 40, height: 40, borderRadius: 99 }}
        className="items-center justify-center"
      >
        <MaterialIcons name="settings" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};
