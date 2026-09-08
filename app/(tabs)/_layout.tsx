import React from 'react';
import { Tabs } from 'expo-router';
import { CustomBottomNav } from '../../src/components/navigation/CustomBottomNav';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomBottomNav {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="inbox" options={{ title: 'Inbox' }} />
      <Tabs.Screen name="find" options={{ title: 'Find' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
    </Tabs>
  );
}
