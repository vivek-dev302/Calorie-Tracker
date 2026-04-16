import { useEffect, useState } from 'react';
import { getToken, logout } from './services/authService';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import LoginScreen from './screens/LoginScreen';
import './config/googleAuth';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import MainTabs from './navigation/MainTabs';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      setIsAuthenticated(!!token);
      setCheckingAuth(false);
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (e) {
      console.warn('Google signOut failed (safe):', e);
    }

    await logout();
    setIsAuthenticated(false);
  };

  if (checkingAuth) return null;

  if (!isAuthenticated) {
    return (
      <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <MainTabs onLogout={handleLogout} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
