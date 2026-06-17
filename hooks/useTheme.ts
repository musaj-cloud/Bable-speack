// hooks/useTheme.ts
// Returns the active color token object based on the user's theme preference.
import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from '@/constants/colors';
import { useThemeStore } from '@/store/useThemeStore';

export const useTheme = () => {
  const systemScheme = useColorScheme();
  const { preference } = useThemeStore();
  const scheme = preference === 'system' ? systemScheme : preference;
  return scheme === 'dark' ? darkColors : lightColors;
};
