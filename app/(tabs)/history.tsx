import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AskHistoryButton } from '@/components/AskHistoryButton';
import { AskHistorySheet } from '@/components/AskHistorySheet';
import { HistoryEmptyState } from '@/components/HistoryEmptyState';
import { HistoryFilterChips, type HistoryFilter } from '@/components/HistoryFilterChips';
import { HistoryList } from '@/components/HistoryList';
import { HistoryPrivacyNote } from '@/components/HistoryPrivacyNote';
import { HistorySearchBar } from '@/components/HistorySearchBar';
import { HistoryToolbar } from '@/components/HistoryToolbar';
import { HomeHeader } from '@/components/HomeHeader';
import { useHistorySearch } from '@/hooks/useHistorySearch';
import { useHistorySelection } from '@/hooks/useHistorySelection';
import { useTheme } from '@/hooks/useTheme';
import { useConverseStore } from '@/store/useConverseStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useMeetingStore } from '@/store/useMeetingStore';
import { TranslationEntry } from '@/types/translation';

// History: SQLite-backed list of past translations with mode filter chips,
// keyword + on-device semantic search, multi-select delete, and tap-to-reopen.
export default function History() {
  const colors = useTheme();
  const { filter: filterParam } = useLocalSearchParams<{ filter?: string }>();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [asking, setAsking] = useState(false);
  const { entries, load, remove, removeMany } = useHistoryStore();
  const sel = useHistorySelection();

  useEffect(() => {
    load();
  }, [load]);

  // Honor a per-page shortcut (e.g. Meeting → /history?filter=meeting).
  useEffect(() => {
    if (filterParam) setFilter(filterParam as HistoryFilter);
  }, [filterParam]);

  const filtered = useMemo(
    () => (filter === 'all' ? entries : entries.filter((e) => e.mode === filter)),
    [entries, filter]
  );
  const groups = useHistorySearch(filtered, query);
  const visibleIds = useMemo(() => filtered.map((e) => e.id), [filtered]);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => sel.selected.has(id));

  // Reopen a saved entry back in its own mode (Converse / Document / Meeting).
  // Align the active language pair so the reopened cards label the right
  // languages (Meeting carries its own per-segment languages).
  const openEntry = (entry: TranslationEntry) => {
    if (entry.mode === 'meeting') {
      useMeetingStore.getState().loadEntry(entry);
      router.push('/meeting');
      return;
    }
    useLanguageStore.setState({ sourceLang: entry.sourceLang, targetLang: entry.targetLang });
    if (entry.mode === 'document') {
      useDocumentStore.getState().loadEntry(entry);
      router.push('/document/result');
    } else {
      useConverseStore.getState().loadEntry(entry);
      router.push('/');
    }
  };

  const onPressEntry = (entry: TranslationEntry) =>
    sel.selecting ? sel.toggle(entry.id) : openEntry(entry);

  const confirmDelete = () => {
    const ids = [...sel.selected];
    if (ids.length === 0) return;
    Alert.alert(
      `Delete ${ids.length} ${ids.length === 1 ? 'entry' : 'entries'}?`,
      'This permanently removes the selected history from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (ids.length === 1) await remove(ids[0]);
            else await removeMany(ids);
            sel.reset();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={['top']}>
      <HomeHeader />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {entries.length > 0 ? (
          <View className="mt-1 mb-2">
            <AskHistoryButton onPress={() => setAsking(true)} />
          </View>
        ) : null}

        <View className="mb-1">
          <HistorySearchBar value={query} onChangeText={setQuery} />
        </View>

        <HistoryFilterChips value={filter} onChange={setFilter} />

        <HistoryToolbar
          selecting={sel.selecting}
          selectedCount={sel.selected.size}
          totalCount={filtered.length}
          allSelected={allSelected}
          onToggleSelecting={() => (sel.selecting ? sel.reset() : sel.setSelecting(true))}
          onSelectAll={() => (allSelected ? sel.selectAll([]) : sel.selectAll(visibleIds))}
          onDelete={confirmDelete}
        />

        {groups.length === 0 ? (
          <HistoryEmptyState searching={query.trim().length > 0} />
        ) : (
          <HistoryList
            groups={groups}
            selecting={sel.selecting}
            selectedIds={sel.selected}
            onPressEntry={onPressEntry}
            onLongPressEntry={(entry) => sel.begin(entry.id)}
          />
        )}

        {entries.length > 0 ? <HistoryPrivacyNote /> : null}
      </ScrollView>

      <AskHistorySheet
        visible={asking}
        onClose={() => setAsking(false)}
        onOpenSource={(entry) => {
          setAsking(false);
          openEntry(entry);
        }}
      />
    </SafeAreaView>
  );
}
