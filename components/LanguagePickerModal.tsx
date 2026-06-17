import { MaterialIcons } from '@expo/vector-icons';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { LANGUAGES } from '@/data/languages';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  visible: boolean;
  title: string;
  selectedCode: string;
  disabledCode?: string; // prevent picking the same language as the other side
  onSelect: (code: string) => void;
  onClose: () => void;
};

// Bottom-sheet style language list. Custom-built to avoid new dependencies.
export const LanguagePickerModal = ({
  visible,
  title,
  selectedCode,
  disabledCode,
  onSelect,
  onClose,
}: Props) => {
  const colors = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.bgPrimary,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: 28,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          className="px-5 pt-4"
        >
          <View
            style={{ backgroundColor: colors.border }}
            className="self-center w-10 h-1 rounded-full mb-4"
          />
          <Text style={{ ...typography.h4, color: colors.textPrimary }} className="mb-3">
            {title}
          </Text>

          {LANGUAGES.map((lang) => {
            const selected = lang.code === selectedCode;
            const disabled = lang.code === disabledCode;
            return (
              <TouchableOpacity
                key={lang.code}
                activeOpacity={0.7}
                disabled={disabled}
                onPress={() => {
                  onSelect(lang.code);
                  onClose();
                }}
                style={{ minHeight: 52, opacity: disabled ? 0.35 : 1 }}
                className="flex-row items-center justify-between px-2"
              >
                <Text
                  style={{
                    ...typography.bodyLg,
                    color: selected ? colors.accentBlue : colors.textPrimary,
                  }}
                >
                  {lang.name}
                </Text>
                {selected && (
                  <MaterialIcons name="check" size={22} color={colors.accentBlue} />
                )}
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
};
