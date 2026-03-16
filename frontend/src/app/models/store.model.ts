export interface StoreLoginRequest {
  storeId: string;
  password: string;
  deviceInfo?: string;
}

export interface StoreLoginResponse {
  role: 'STORE_OWNER' | 'CREATOR';
  storeName: string;
  storeId: string;
  sessionToken: string | null;
  token: string | null;
}

export interface KioskSession {
  sessionToken: string;
  storeName: string;
  storeId: string;
  expiresAt?: number;
}

export interface CreatorUser {
  token: string;
  storeId: string;
  storeName: string;
}

export interface StoreSessionDTO {
  id: number;
  deviceInfo: string;
  lastActive: string;
  createdAt: string;
}

export interface StoreDTO {
  id: number;
  storeId: string;
  storeName: string;
  role: string;
  deviceLimit: number;
  active: boolean;
  activeSessions: number;
  devices: StoreSessionDTO[];
}

export interface CreateStoreRequest {
  storeName: string;
  storeId: string;
  password: string;
  deviceLimit: number;
  role: string;
}
