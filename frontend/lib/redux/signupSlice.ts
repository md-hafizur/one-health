import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

export interface SignupState {
  firstName: string;
  lastName: string;
  contactInfo: string;
  password: string;
  confirmPassword: string;
  applicationId: string | null;
  contact: string | null;
  contactType: string | null;
  verified: boolean;
}

const initialState: SignupState = {
  firstName: '',
  lastName: '',
  contactInfo: '',
  password: '',
  confirmPassword: '',
  applicationId: null,
  contact: null,
  contactType: null,
  verified: false,
};

const signupSlice = createSlice({
  name: 'signup',
  initialState,
  reducers: {
    setField: <K extends keyof SignupState>(state: SignupState, action: PayloadAction<{ field: K; value: SignupState[K] }>) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    setVerifiedStatus: (state, action: PayloadAction<boolean>) => {
      state.verified = action.payload;
    },
    setSignupState: (state, action: PayloadAction<SignupState>) => {
      return action.payload;
    },
    resetSignup: () => initialState,
  },
});

export const { setField, setVerifiedStatus, setSignupState, resetSignup } = signupSlice.actions;

export const selectSignup = (state: RootState) => state.signup;

export default signupSlice.reducer;