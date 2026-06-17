import { MaterialIcons } from '@expo/vector-icons';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

export type PickerOption<T extends string | number> = { label: string; value: T };

type Props<T extends string | number> = {
  visible: boolean;
  title: string;
  options: PickerOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
};

// Bottom-sheet list of single-choice options. Generic over the value type so it
// serves both the speech-speed (number) and theme (string) pickers.
export const OptionPickerModal = <T extends string | number>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: Props<T>) => {
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

          {options.map((option) => {
            const isSelected = option.value === selected;
            return (
              <TouchableOpacity
                key={String(option.value)}
                activeOpacity={0.7}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
                style={{ minHeight: 52 }}
                className="flex-row items-center justify-between px-2"
              >
                <Text
                  style={{
                    ...typography.bodyLg,
                    color: isSelected ? colors.accentBlue : colors.textPrimary,
                  }}
                >
                  {option.label}
                </Text>
                {isSelected && <MaterialIcons name="check" size={22} color={colors.accentBlue} />}
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
};
