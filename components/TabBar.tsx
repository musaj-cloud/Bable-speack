import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TabBarView } from '@/components/TabBarView';

// Tab navigator bottom bar: maps navigation state onto the shared TabBarView.
export const TabBar = ({ state, navigation }: BottomTabBarProps) => {
  const items = state.routes
    .map((route, index) => ({ route, index }))
    .filter(({ route }) => route.name !== 'settings')
    .map(({ route, index }) => {
    const focused = state.index === index;
    return {
      key: route.key,
      name: route.name,
      focused,
      onPress: () => {
        const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
        if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
      },
    };
  });

  return <TabBarView items={items} />;
};
