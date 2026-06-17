import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

const APP_VERSION = '2.4.1';
const LICENSE_URL = 'https://www.apache.org/licenses/LICENSE-2.0';

// ABOUT section: app identity, version, and QVAC credit + license links.
export const SettingsAboutCard = () => {
  const colors = useTheme();

  const Link = ({ label, url }: { label: string; url: string }) => (
    <TouchableOpacity activeOpacity={0.7} onPress={() => Linking.openURL(url)}>
      <Text style={{ ...typography.label, color: colors.accentBlue, textDecorationLine: 'underline' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

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
          About
        </Text>
      </View>

      <View className="p-4 items-center">
        <Text style={{ ...typography.h3, color: colors.accentBlue }} className="mb-2">
          BabelSpeak
        </Text>
        <Text style={{ ...typography.label, color: colors.textSecondary }} className="font-normal">
          Version {APP_VERSION}
        </Text>
        <Text style={{ ...typography.label, color: colors.textSecondary, marginTop: 4 }} className="font-normal">
          Powered by QVAC SDK
        </Text>
        <View className="flex-row items-center gap-3 mt-4">
          <Link label="Apache 2.0 License" url={LICENSE_URL} />
          <Text style={{ color: colors.textSecondary }}>•</Text>
          <Link label="Credits" url="https://github.com/tetherto/qvac" />
        </View>
      </View>
    </View>
  );
};
