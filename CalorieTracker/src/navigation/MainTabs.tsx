import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ClipboardList, Target, User, Lightbulb } from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';
import DailyGoalsScreen from '../screens/DailyGoalsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SuggestScreen from '../screens/SuggestScreen';
import { MainTabParamList } from '../types/navigation';

type MainTabsProps = {
  onLogout: () => void;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs: React.FC<MainTabsProps> = ({ onLogout }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'Home':
              return <ClipboardList color={color} size={size} />;
            case 'DailyGoals':
              return <Target color={color} size={size} />;
            case 'Suggest':
              return <Lightbulb color={color} size={size} />;
            case 'Profile':
              return <User color={color} size={size} />;
            default:
              return <ClipboardList color={color} size={size} />;
          }
        },
      })}
    >
      <Tab.Screen name="Home" options={{ title: 'Entry' }}>
        {() => <HomeScreen onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen
        name="Suggest"
        component={SuggestScreen}
        options={{ title: 'Suggest' }}
      />
      <Tab.Screen
        name="DailyGoals"
        component={DailyGoalsScreen}
        options={{ title: 'Daily Goals' }}
      />
      <Tab.Screen name="Profile">
        {() => <ProfileScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default MainTabs;
