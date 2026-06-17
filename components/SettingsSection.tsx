import { Children, Fragment, ReactNode } from 'react';
import { Text, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

// Titled settings card: header bar + rows separated by hairline dividers.
export const SettingsSection = ({ title, children }: { title: string; children: ReactNode }) => {
  const colors = useTheme();
  const rows = Children.toArray(children);

  return (
    <View
      style={{
        backgroundColor: colors.bgCard,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 4 },
        elevation: 1,
      }}
    >
      <View
        style={{ backgroundColor: colors.bgAlt, borderBottomColor: colors.border, borderBottomWidth: 1 }}
        className="px-4 py-3"
      >
        <Text style={{ ...typography.label, color: colors.accentBlue }} className="uppercase">
          {title}
        </Text>
      </View>

      <View>
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 && <View style={{ height: 1, backgroundColor: colors.border }} />}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
};
