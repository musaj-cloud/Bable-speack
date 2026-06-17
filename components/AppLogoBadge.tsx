import { Image } from 'react-native';
import { images } from '@/constants/images';

// BabelSpeak brand mark (welcome screen). Transparent background — floats on
// whatever screen background is behind it, in both light and dark themes.
export const AppLogoBadge = () => {
  return <Image source={images.iconTransparent} style={{ width: 112, height: 112 }} resizeMode="contain" />;
};
