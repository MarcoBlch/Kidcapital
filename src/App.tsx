import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useUIStore } from './store/uiStore';
import { useSupabaseStore } from './store/supabaseStore';
import { initRevenueCat } from './lib/revenuecat';
import SplashScreen from './screens/SplashScreen';
import SetupScreen from './screens/SetupScreen';
import GameScreen from './screens/GameScreen';
import EndScreen from './screens/EndScreen';
import './index.css';

function App() {
  const currentScreen = useUIStore((s) => s.currentScreen);
  const initializeSession = useSupabaseStore(s => s.initializeSession);

  // Sign in anonymously on app startup and initialize payments
  useEffect(() => {
    initializeSession();
    initRevenueCat();
  }, [initializeSession]);

  return (
    <AnimatePresence mode="wait">
      {currentScreen === 'splash' && <SplashScreen key="splash" />}
      {currentScreen === 'setup' && <SetupScreen key="setup" />}
      {currentScreen === 'game' && <GameScreen key="game" />}
      {currentScreen === 'end' && <EndScreen key="end" />}
    </AnimatePresence>
  );
}

export default App;
