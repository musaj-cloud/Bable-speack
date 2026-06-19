import { useEffect, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LiveTurnBubble } from '@/components/LiveTurnBubble';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';
import type { P2PTurn } from '@/store/useP2PStore';

// Scrollable conversation log; auto-scrolls to the newest turn. Shows a friendly
// prompt while waiting for the first thing to be said.
export const LiveTranscript = ({ turns }: { turns: P2PTurn[] }) => {
  const colors = useTheme();
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    if (turns.length) ref.current?.scrollToEnd({ animated: true });
  }, [turns.length]);

  if (!turns.length) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text style={{ ...typography.bodyMd, color: colors.textMuted }} className="text-center">
          You are connected. Tap the mic and start speaking — your words arrive on
          the other phone translated and spoken aloud.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={ref}
      className="flex-1"
      contentContainerStyle={{ gap: 12, paddingVertical: 12 }}
      showsVerticalScrollIndicator={false}
    >
      {turns.map((turn) => (
        <LiveTurnBubble key={turn.id} turn={turn} />
      ))}
    </ScrollView>
  );
};
