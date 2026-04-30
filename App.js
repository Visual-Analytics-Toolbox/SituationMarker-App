import { GameControllerProvider } from './utils/GameControllerContext';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Main from './screens/main';
import Settings from './screens/settings';
import Upload from './screens/upload';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <GameControllerProvider>
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen name="Home" component={Main} />
          <Tab.Screen name="Upload" component={Upload} />
          <Tab.Screen name="Settings" component={Settings} />
        </Tab.Navigator>
      </GameControllerProvider>
    </NavigationContainer>
  );
}