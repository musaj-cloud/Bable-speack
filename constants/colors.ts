// constants/colors.ts
// Official BabelSpeak color tokens — light + dark. Never hardcode hex in components.
// Light is the source-of-truth design (Material 3, from the onboarding mockup).
// Dark is derived to stay Material-3-consistent with the same blue primary.

export const lightColors = {
  // Backgrounds
  bgPrimary: '#faf8ff', // M3 surface/background — main screen
  bgAlt: '#f3f3fe', // M3 surface-container-low — alt background
  bgCard: '#ffffff', // M3 surface-container-lowest — white cards
  bgCardInner: '#ededf9', // M3 surface-container — inner/nested card

  // Borders
  border: '#e1e2ed', // M3 surface-variant — card borders + dividers

  // Accents
  accentBlue: '#004ac6', // M3 primary — buttons, active elements
  accentLight: '#2563eb', // M3 primary-container — brighter blue highlight

  // Status
  success: '#059669', // Green — offline-ready badge, checkmarks
  warningRed: '#ba1a1a', // M3 error — recording, stop button, errors
  warningAmber: '#d97706', // Amber — processing, search highlights

  // Icon chips (M3 "fixed" colors — constant across light/dark)
  iconChipBlue: '#d3e4fe', // Mic chip bg (tertiary-fixed)
  iconChipBlueText: '#0b1c30', // Mic icon (on-tertiary-fixed)
  iconChipGray: '#e3e2df', // Camera chip bg (secondary-fixed)
  iconChipGrayText: '#1b1c1a', // Camera icon (on-secondary-fixed)
  iconChipLavender: '#dbe1ff', // Meeting chip bg (primary-fixed)
  iconChipLavenderText: '#00174b', // Meeting icon (on-primary-fixed)

  // Text
  textPrimary: '#191b23', // M3 on-surface — main text
  textSecondary: '#434655', // M3 on-surface-variant — muted/subtitle text
  textMuted: '#737686', // M3 outline — placeholders, inactive

  // Tab bar
  tabActive: '#191b23', // on-surface
  tabInactive: '#737686', // outline
  tabDot: '#004ac6', // primary
};

export const darkColors: typeof lightColors = {
  // Backgrounds
  bgPrimary: '#111319', // M3 dark surface — main screen
  bgAlt: '#0c0e14', // Darker surface — alt background
  bgCard: '#1d1f27', // M3 surface-container — card background
  bgCardInner: '#282a32', // M3 surface-container-high — inner/nested card

  // Borders
  border: '#434655', // M3 dark outline-variant — borders + dividers

  // Accents
  accentBlue: '#3b82f6', // Brighter primary — legible on dark, buttons
  accentLight: '#b4c5ff', // M3 inverse-primary — subtle blue highlights

  // Status
  success: '#34d399', // Green — offline-ready badge, checkmarks
  warningRed: '#ffb4ab', // M3 dark error — recording, stop button, errors
  warningAmber: '#fbbf24', // Amber — processing, search highlights

  // Icon chips (M3 "fixed" colors — identical to light by design)
  iconChipBlue: '#d3e4fe', // Mic chip bg (tertiary-fixed)
  iconChipBlueText: '#0b1c30', // Mic icon (on-tertiary-fixed)
  iconChipGray: '#e3e2df', // Camera chip bg (secondary-fixed)
  iconChipGrayText: '#1b1c1a', // Camera icon (on-secondary-fixed)
  iconChipLavender: '#dbe1ff', // Meeting chip bg (primary-fixed)
  iconChipLavenderText: '#00174b', // Meeting icon (on-primary-fixed)

  // Text
  textPrimary: '#e3e1ec', // M3 dark on-surface — main text
  textSecondary: '#c3c6d7', // M3 dark on-surface-variant — muted/subtitle text
  textMuted: '#8d909f', // M3 dark outline — placeholders, inactive

  // Tab bar
  tabActive: '#e3e1ec',
  tabInactive: '#8d909f',
  tabDot: '#b4c5ff',
};

export type ColorTokens = typeof lightColors;
