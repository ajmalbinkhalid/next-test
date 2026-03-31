export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface UserProfile {
  id?: string | number;
  name: string;
  email: string;
  mobile: string;
  qualification: string;
  profileImage?: string | null;
}

export interface AuthSession {
  tokens: AuthTokens | null;
  user: UserProfile | null;
  mobile: string | null;
}

export interface SendOtpPayload {
  mobile: string;
}

export interface VerifyOtpPayload {
  mobile: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  login: boolean;
  message: string;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

export interface CreateProfilePayload {
  mobile: string;
  name: string;
  email: string;
  qualification: string;
  profileImage: File;
}

export interface CreateProfileResponse {
  success: boolean;
  access_token: string;
  refresh_token: string;
  message: string;
  user: UserProfile;
}

export type AuthStatus =
  | "loading"
  | "unauthenticated"
  | "otp-sent"
  | "needs-profile"
  | "authenticated";

export interface AuthContextValue {
  status: AuthStatus;
  isReady: boolean;
  user: UserProfile | null;
  mobile: string | null;
  tokens: AuthTokens | null;
  sendOtp: (payload: SendOtpPayload) => Promise<{ message: string }>;
  verifyOtp: (
    payload: VerifyOtpPayload,
  ) => Promise<{ login: boolean; message: string }>;
  createProfile: (
    payload: Omit<CreateProfilePayload, "mobile">,
  ) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  refreshFromStorage: () => void;
}
