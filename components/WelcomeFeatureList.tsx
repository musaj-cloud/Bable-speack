import { View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { FeatureRow } from './FeatureRow';

// Card listing the three core BabelSpeak modes (welcome screen).
export const WelcomeFeatureList = () => {
  const colors = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.bgCard,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
      className="p-4 gap-3"
    >
      <FeatureRow
        icon="mic"
        chipBg={colors.iconChipBlue}
        chipText={colors.iconChipBlueText}
        label="Speak and hear translations"
      />
      <View style={{ height: 1, backgroundColor: colors.border }} />
      <FeatureRow
        icon="photo-camera"
        chipBg={colors.iconChipGray}
        chipText={colors.iconChipGrayText}
        label="Translate photos of text"
      />
      <View style={{ height: 1, backgroundColor: colors.border }} />
      <FeatureRow
        icon="graphic-eq"
        chipBg={colors.iconChipLavender}
        chipText={colors.iconChipLavenderText}
        label={'Transcribe and translate\nmeetings'}
      />
      <View style={{ height: 1, backgroundColor: colors.border }} />
      <FeatureRow
        icon="wifi-tethering"
        chipBg={colors.iconChipBlue}
        chipText={colors.iconChipBlueText}
        label={'Live chat across phones,\npeer-to-peer'}
      />
    </View>
  );
};
