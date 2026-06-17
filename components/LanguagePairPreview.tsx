import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { typography } from '@/constants/typography';
import { getLanguageName } from '@/data/languages';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  sourceCode: string;
  targetCode: string;
};

// "English → French" confirmation pill.
export const LanguagePairPreview = ({ sourceCode, targetCode }: Props) => {
  const colors = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.bgAlt,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 12,
      }}
      className="flex-row items-center justify-center gap-3 px-4 py-4"
    >
      <Text style={{ ...typography.label, color: colors.textPrimary }}>
        {getLanguageName(sourceCode)}
      </Text>
      <MaterialIcons name="arrow-forward" size={16} color={colors.textSecondary} />
      <Text style={{ ...typography.label, color: colors.accentBlue }}>
        {getLanguageName(targetCode)}
      </Text>
    </View>
  );
};
