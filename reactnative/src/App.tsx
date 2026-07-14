import React, { useState, useCallback } from 'react';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import TransferScreen from './screens/TransferScreen';
import MovementsScreen from './screens/MovementsScreen';
import { api } from './services/api';

type Screen = 'login' | 'home' | 'transfer' | 'movements';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('login');
  const [props, setProps] = useState<Record<string, any>>({});

  const navigate = useCallback((newScreen: Screen, data?: Record<string, any>) => {
    setProps(data || {});
    setScreen(newScreen);
  }, []);

  const handleEvent = useCallback(async (event: string, data?: Record<string, any>) => {
    switch (event) {
      case 'LOGIN_SUCCESS': {
        const { sessionId, token, userId, name, phone } = data || {};
        navigate('home', { userId, name, phone, token });
        break;
      }
      case 'LOGOUT':
        navigate('login', {});
        break;
      case 'OPEN_TRANSFER':
        navigate('transfer', { ...props, ...(data || {}) });
        break;
      case 'OPEN_MOVEMENTS':
        navigate('movements', { ...props, ...(data || {}) });
        break;
      case 'BACK':
        navigate('home', { ...props, ...(data || {}) });
        break;
      case 'TRANSFER_SUCCESS':
        navigate('home', { ...props, ...(data || {}) });
        break;
      case 'SESSION_EXPIRED':
        navigate('login', {});
        break;
    }
  }, [navigate, props]);

  (globalThis as any).__devBridge = { navigate, handleEvent, api };

  switch (screen) {
    case 'login':
      return <LoginScreen theme={undefined} />;
    case 'home':
      return <HomeScreen {...props} theme={undefined} />;
    case 'transfer':
      return <TransferScreen {...props} theme={undefined} />;
    case 'movements':
      return <MovementsScreen {...props} theme={undefined} />;
    default:
      return <LoginScreen theme={undefined} />;
  }
};

export default App;