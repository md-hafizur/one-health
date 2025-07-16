import { configureStore } from '@reduxjs/toolkit';
import signupReducer from './signupSlice';
import authReducer from './authSlice';

// Function to load state from localStorage
export const loadState = () => {
  try {
    const serializedSignupState = localStorage.getItem('signupState');
    const serializedAuthState = localStorage.getItem('authState');
    if (serializedSignupState === null && serializedAuthState === null) {
      return undefined;
    }
    return {
      signup: serializedSignupState ? JSON.parse(serializedSignupState) : undefined,
      auth: serializedAuthState ? JSON.parse(serializedAuthState) : undefined,
    };
  } catch (e) {
    console.warn("Could not load state from localStorage", e);
    return undefined;
  }
};

export const saveState = (state: RootState) => {
  try {
    const serializedSignupState = JSON.stringify(state.signup);
    localStorage.setItem('signupState', serializedSignupState);
    const serializedAuthState = JSON.stringify(state.auth);
    localStorage.setItem('authState', serializedAuthState);
  } catch (e) {
    console.warn("Could not save state to localStorage", e);
  }
};

export const makeStore = () => {
  const preloadedState = loadState();
  return configureStore({
    reducer: {
      signup: signupReducer,
      auth: authReducer,
    },
    preloadedState,
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
