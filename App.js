import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import InventoryScreen from './screens/InventoryScreen';
import CalculationsScreen from './screens/CalculationsScreen';
import SchemasScreen from './screens/SchemasScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#1E1E1E" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#1E1E1E',
            borderTopWidth: 1,
            borderTopColor: '#2C2C2C',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: '#64B5F6',
          tabBarInactiveTintColor: '#546E7A',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Inventário') {
              iconName = focused ? 'cube' : 'cube-outline';
            } else if (route.name === 'Cálculos') {
              iconName = focused ? 'calculator' : 'calculator-outline';
            } else if (route.name === 'Esquemas') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Inventário" component={InventoryScreen} />
        <Tab.Screen name="Cálculos" component={CalculationsScreen} />
        <Tab.Screen name="Esquemas" component={SchemasScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
