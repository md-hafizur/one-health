import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

export interface AuthState {
  isAuthenticated: boolean;
  userRole: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  applicationId: string;
  contact: string | null;
  contactType: string | null;
  paymentMade: boolean; // Add paymentMade to the state
  allowLoginAccessWhileAuthenticated: boolean;
  isInitializing: boolean; // New state to track initialization
}

const initialState: AuthState = {
  isAuthenticated: false,
  userRole: null,
  firstName: null,
  lastName: null,
  phoneVerified: false,
  emailVerified: false,
  applicationId: "",
  contact: null,
  contactType: null,
  paymentMade: false, // Initialize paymentMade
  allowLoginAccessWhileAuthenticated: false,
  isInitializing: true, // Start with initializing true
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLogin: (
      state,
      action: PayloadAction<{
        role: string;
        firstName: string | null;
        lastName: string | null;
        phoneVerified: boolean;
        emailVerified: boolean;
        applicationId: string;
        contact: string | null;
        contactType: string | null;
        paymentMade: boolean; // Add paymentMade to the payload
      }>
    ) => {
      state.isAuthenticated = true;
      state.userRole = action.payload.role;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.phoneVerified = action.payload.phoneVerified;
      state.emailVerified = action.payload.emailVerified;
      state.applicationId = action.payload.applicationId;
      state.contact = action.payload.contact;
      state.contactType = action.payload.contactType;
      state.paymentMade = action.payload.paymentMade; // Set paymentMade
      state.allowLoginAccessWhileAuthenticated = false; // Allow access to login page while authenticated
      state.isInitializing = false; // Set to false on login
    },
    setLogout: (state) => {
      state.isAuthenticated = false;
      state.userRole = null;
      state.firstName = null;
      state.lastName = null;
      state.phoneVerified = false;
      state.emailVerified = false;
      state.applicationId = "";
      state.contact = null;
      state.contactType = null;
      state.paymentMade = false;
      state.allowLoginAccessWhileAuthenticated = false;
      state.isInitializing = false; // Set to false on logout

      // Clear relevant local storage items
      localStorage.removeItem("onehealth_application_id");
      localStorage.removeItem("onehealth_contact_type");
      localStorage.removeItem("onehealth_contact");
      localStorage.removeItem("onehealth_first_name");
      localStorage.removeItem("onehealth_last_name");
      localStorage.removeItem("reduxState"); // Clear the entire persisted Redux state
    },
    setAuthInitialized: (state) => {
      state.isInitializing = false;
    },
    setInitializing: (state, action: PayloadAction<boolean>) => {
      state.isInitializing = action.payload;
    },
    setAllowLoginAccess: (state, action: PayloadAction<boolean>) => {
      state.allowLoginAccessWhileAuthenticated = action.payload;
    },
    setPhoneVerified: (state, action: PayloadAction<boolean>) => {
      state.phoneVerified = action.payload;
    },
    setEmailVerified: (state, action: PayloadAction<boolean>) => {
      state.emailVerified = action.payload;
    },
  },
});

export const { setLogin, setLogout, setInitializing, setAuthInitialized, setAllowLoginAccess, setPhoneVerified, setEmailVerified } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;

export default authSlice.reducer;