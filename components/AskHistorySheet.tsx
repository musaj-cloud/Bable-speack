import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { typography } from '@/constants/typography';
import { AskHistoryAnswer } from '@/components/AskHistoryAnswer';
import { useAskHistory } from '@/hooks/useAskHistory';
import { useTheme } from '@/hooks/useTheme';
import { TranslationEntry } from '@/types/translation';

type Props = {
  visible: boolean;
  onClose: () => void;
  onOpenSource: (entry: TranslationEntry) => void;
};

// Bottom sheet for "Ask Your History": a question box on top of History that
// runs the on-device RAG pipeline and shows a grounded answer + source entries.
export const AskHistorySheet = ({ visible, onClose, onOpenSource }: Props) => {
  const colors = useTheme();
  const [text, setText] = useState('');
  const { status, result, ask, reset } = useAskHistory();

  // Start each session clean when the sheet opens.
  useEffect(() => {
    if (visible) {
      setText('');
      reset();
    }
    // reset is stable enough for this; only the open transition matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    ask(trimmed);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
      >
        <KeyboardAvoidingView behavior="padding">
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: colors.bgPrimary,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 1,
              borderColor: colors.border,
              maxHeight: '85%',
            }}
            className="px-5 pt-3 pb-8"
          >
            <View className="items-center mb-4">
              <View
                style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }}
              />
            </View>

            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="auto-awesome" size={18} color={colors.accentBlue} />
              <Text style={{ ...typography.h4, color: colors.textPrimary }}>
                Ask your history
              </Text>
            </View>

            <View
              style={{
                backgroundColor: colors.bgCard,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 16,
                paddingHorizontal: 12,
              }}
              className="flex-row items-center gap-2"
            >
              <TextInput
                value={text}
                onChangeText={setText}
                onSubmitEditing={submit}
                placeholder="e.g. what did that hospital sign say?"
                placeholderTextColor={colors.textMuted}
                returnKeyType="search"
                autoFocus
                style={{
                  ...typography.bodyMd,
                  flex: 1,
                  color: colors.textPrimary,
                  paddingVertical: 14,
                }}
              />
              <TouchableOpacity
                onPress={submit}
                disabled={status === 'thinking'}
                accessibilityRole="button"
                accessibilityLabel="Ask"
                style={{
                  backgroundColor: colors.accentBlue,
                  borderRadius: 12,
                  opacity: status === 'thinking' ? 0.5 : 1,
                }}
                className="h-9 w-9 items-center justify-center"
              >
                <MaterialIcons name="arrow-upward" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="mt-3"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <AskHistoryAnswer
                status={status}
                answer={result?.answer ?? null}
                sources={result?.sources ?? []}
                onOpenSource={onOpenSource}
              />
            </ScrollView>

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
