import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HistoryEntryCard } from '@/components/HistoryEntryCard';
import { HistoryPrivacyNote } from '@/components/HistoryPrivacyNote';
import { HistorySearchBar } from '@/components/HistorySearchBar';
import { HomeHeader } from '@/components/HomeHeader';
import { typography } from '@/constants/typography';
import { HISTORY_GROUPS } from '@/data/historyDemo';
import { useTheme } from '@/hooks/useTheme';

// History: searchable list of past translations grouped by day. SQLite + semantic
// search land in Phase 4 — for now this renders demo entries.
export default function History() {
  const colors = useTheme();
  const [query, setQuery] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={['top']}>
      <HomeHeader />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-1 mb-1">
          <HistorySearchBar value={query} onChangeText={setQuery} />
        </View>

        {HISTORY_GROUPS.map((group) => (
          <View key={group.label} className="mb-1">
            <Text
              style={{ ...typography.label, color: colors.textSecondary }}
              className="uppercase mt-4 mb-2"
            >
              {group.label}
            </Text>
            <View className="gap-3">
              {group.items.map((item) => (
                <HistoryEntryCard key={item.id} item={item} />
              ))}
            </View>
          </View>
        ))}

        <HistoryPrivacyNote />
      </ScrollView>
    </SafeAreaView>
  );
}
