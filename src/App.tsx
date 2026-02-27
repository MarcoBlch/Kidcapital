import { AnimatePresence } from 'framer-motion';
import { useUIStore } from './store/uiStore';
import SplashScreen from './screens/SplashScreen';
import SetupScreen from './screens/SetupScreen';
import GameScreen from './screens/GameScreen';
import EndScreen from './screens/EndScreen';
import './index.css';

function App() {
  const currentScreen = useUIStore((s) => s.currentScreen);

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
