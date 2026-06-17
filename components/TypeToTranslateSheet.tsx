import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  visible: boolean;
  sourceLangName: string;
  onClose: () => void;
  onSubmit: (text: string) => void;
};

// Bottom sheet for typing a phrase to translate (Phase 1 input path).
export const TypeToTranslateSheet = ({ visible, sourceLangName, onClose, onSubmit }: Props) => {
  const colors = useTheme();
  const [text, setText] = useState('');

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: colors.bgPrimary,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 1,
              borderColor: colors.border,
            }}
            className="px-5 pt-3 pb-8"
          >
            <View className="items-center mb-4">
              <View
                style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }}
              />
            </View>

            <Text style={{ ...typography.label, color: colors.textMuted }}>
              {sourceLangName.toUpperCase()}
            </Text>

            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type something to translate…"
              placeholderTextColor={colors.textMuted}
              multiline
              autoFocus
              style={{
                ...typography.bodyLg,
                color: colors.textPrimary,
                minHeight: 96,
                textAlignVertical: 'top',
                marginTop: 8,
              }}
            />

            <TouchableOpacity
              onPress={submit}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Translate"
              style={{ backgroundColor: colors.accentBlue, borderRadius: 14, marginTop: 12 }}
              className="h-14 flex-row items-center justify-center gap-2"
            >
              <MaterialIcons name="translate" size={20} color="#ffffff" />
              <Text style={{ ...typography.h4, color: '#ffffff' }}>Translate</Text>
            </TouchableOpacity>

            <Text
              style={{ ...typography.caption, color: colors.textMuted }}
              className="text-center mt-3"
            >
              OFFLINE · ON DEVICE
            </Text>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};
