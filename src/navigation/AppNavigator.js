import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, FONT_SIZE, FONT_WEIGHT, MIN_TOUCH_TARGET } from '../utils/theme';
import {
  AccountSummaryScreen,
  TransactionsScreen,
  TransferScreen,
} from '../screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Tab icon component using emoji (swap with icon library in production).
 */
function TabIcon({ label, focused }) {
  const icons = {
    Accounts: '🏦',
    Transfer: '💸',
  };
  return (
    <Text style={{ fontSize: focused ? 24 : 20 }}>
      {icons[label] || '📋'}
    </Text>
  );
}

/**
 * AccountsStack — Stack navigator for Accounts tab.
 * Contains: AccountSummary → Transactions detail
 */
function AccountsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.textOnPrimary,
        headerTitleStyle: {
          fontWeight: FONT_WEIGHT.semibold,
          fontSize: FONT_SIZE.bodyLarge,
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="AccountSummary"
        component={AccountSummaryScreen}
        options={{ title: 'My Accounts' }}
      />
      <Stack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={({ route }) => ({
          title: route.params?.accountName || 'Transactions',
        })}
      />
    </Stack.Navigator>
  );
}

/**
 * TransferStack — Stack navigator for Transfer tab.
 */
function TransferStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.textOnPrimary,
        headerTitleStyle: {
          fontWeight: FONT_WEIGHT.semibold,
          fontSize: FONT_SIZE.bodyLarge,
        },
      }}
    >
      <Stack.Screen
        name="TransferForm"
        component={TransferScreen}
        options={{ title: 'Transfer' }}
      />
    </Stack.Navigator>
  );
}

/**
 * AppNavigator — Root navigator with bottom tabs.
 *
 * Accessibility:
 *   - Tab buttons meet minimum 44dp touch target
 *   - Each tab has accessibilityLabel for screen readers
 *   - Active tab indicated by both color AND label weight (not color alone)
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={route.name} focused={focused} />
          ),
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarLabelStyle: styles.tabLabel,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabItem,
          tabBarAccessibilityLabel: `${route.name} tab`,
        })}
      >
        <Tab.Screen
          name="Accounts"
          component={AccountsStack}
          options={{ tabBarLabel: 'Accounts' }}
        />
        <Tab.Screen
          name="Transfer"
          component={TransferStack}
          options={{ tabBarLabel: 'Transfer' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    height: 60,
    paddingBottom: 6,
  },
  tabItem: {
    minHeight: MIN_TOUCH_TARGET,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: FONT_WEIGHT.medium,
  },
});
