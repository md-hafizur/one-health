import { configureStore } from '@reduxjs/toolkit';
import signupReducer, { SignupState } from './signupSlice';
import authReducer, { AuthState } from './authSlice';

// Function to load state from localStorage
export const loadState = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    const serializedState = localStorage.getItem('reduxState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (e) {
    console.warn("Could not load state from localStorage", e);
    return undefined;
  }
};

export const saveState = (state: any) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('reduxState', serializedState);
  } catch (e) {
    console.warn("Could not save state to localStorage", e);
  }
};

export const makeStore = () => {
  const preloadedState = loadState();
  const store = configureStore({
    reducer: {
      signup: signupReducer,
      auth: authReducer,
    },
    preloadedState,
  });

  store.subscribe(() => {
    saveState(store.getState());
  });

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = AppStore['dispatch'];
''
