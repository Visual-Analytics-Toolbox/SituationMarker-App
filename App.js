import { GameControllerProvider } from './utils/GameControllerContext';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Main from './screens/main';
import Settings from './screens/settings';
import Upload from './screens/upload';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <GameControllerProvider>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#333',
            },
            tabBarActiveTintColor: '#ffffff',
            tabBarInactiveTintColor: '#888888',
            
            // 3. Add Native Icons
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Upload') {
                iconName = focused ? 'cloud-upload' : 'cloud-upload-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              }

              // Return the icon component
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={Main} />
          <Tab.Screen name="Upload" component={Upload} />
          <Tab.Screen name="Settings" component={Settings} />
        </Tab.Navigator>
      </GameControllerProvider>
    </NavigationContainer>
  );
}