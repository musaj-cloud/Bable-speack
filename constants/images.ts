// Centralized image imports. Never import asset files directly in screens/components.
import icon from '@/assets/images/icon.png';
import iconTransparent from '@/assets/images/icon-transparent.png';
import logoLockup from '@/assets/images/logo-lockup.png';

export const images = {
  icon, // square brand mark with dark background (use for opaque contexts)
  iconTransparent, // bubbles only, transparent background (use in-app)
  logoLockup, // full lockup: icon + "BabelSpeak" + tagline
};
