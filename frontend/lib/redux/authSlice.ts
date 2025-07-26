import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

export interface AuthState {
  isAuthenticated: boolean;
  userRole: string | null;
  roleName: string | null;
  page_permissions: any[];
  firstName: string | null;
  lastName: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  applicationId: string;
  contact: string | null;
  contactType: string | null;
  paymentMade: boolean; // Add paymentMade to the state
  allowLoginAccessWhileAuthenticated: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userRole: null,
  roleName: null,
  page_permissions: [],
  firstName: null,
  lastName: null,
  phoneVerified: false,
  emailVerified: false,
  applicationId: "",
  contact: null,
  contactType: null,
  paymentMade: false, // Initialize paymentMade
  allowLoginAccessWhileAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLogin: (
      state,
      action: PayloadAction<{
        role: string;
        roleName: string;
        page_permissions: any[];
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
      state.roleName = action.payload.roleName;
      state.page_permissions = action.payload.page_permissions;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.phoneVerified = action.payload.phoneVerified;
      state.emailVerified = action.payload.emailVerified;
      state.applicationId = action.payload.applicationId;
      state.contact = action.payload.contact;
      state.contactType = action.payload.contactType;
      state.paymentMade = action.payload.paymentMade; // Set paymentMade
      state.allowLoginAccessWhileAuthenticated = false; // Allow access to login page while authenticated
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

      // Clear relevant local storage items
      localStorage.removeItem("onehealth_application_id");
      localStorage.removeItem("onehealth_contact_type");
      localStorage.removeItem("onehealth_contact");
      localStorage.removeItem("onehealth_first_name");
      localStorage.removeItem("onehealth_last_name");
      localStorage.removeItem("reduxState"); // Clear the entire persisted Redux state
    },
    setAllowLoginAccess: (state, action: PayloadAction<boolean>) => {
      state.allowLoginAccessWhileAuthenticated = action.payload;
    },
    setPhoneVerified: (state, action: PayloadAction<boolean>) => {
      state.phoneVerified = action.payload;
    },
    setEmailVerified: (state, action: PayloadAction<boolean>) => {
      state.emailVerified = action.payload;
    }
  },
});

export const { setLogin, setLogout, setAllowLoginAccess, setPhoneVerified, setEmailVerified } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;

export default authSlice.reducer;