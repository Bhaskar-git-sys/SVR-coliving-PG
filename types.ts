export type RoomType = 'single' | 'double' | 'triple';
export type RoomStatus = 'available' | 'partial' | 'full';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';

export interface OwnerAccount {
  name: string;
  email: string;
  mobile: string;
  password: string;
  pgName: string;
  pgAddress: string;
}

export interface OwnerSession {
  loggedIn: boolean;
  loginTime: string;
}

export interface Bed {
  id: string;
  label: string;
  occupied: boolean;
  residentId: string | null;
}

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: RoomType;
  beds: Bed[];
}

export interface Resident {
  id: string;
  userId: string;
  name: string;
  mobile: string;
  email: string;
  roomId: string;
  bedId: string;
  startDate: string;
  endDate: string;
  rent: number;
  advance: number;
  paid: number;
  balance: number;
  paymentStatus: PaymentStatus;
  active: boolean;
  aadhaarVerified?: boolean;
  aadhaarMasked?: string;
  aadhaarVerificationRef?: string;
  aadhaarVerifiedAt?: string;
  aadhaarDob?: string;
  aadhaarGender?: string;
  aadhaarAddress?: string;
}

export interface Payment {
  id: string;
  residentId: string;
  residentName: string;
  roomNumber: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  month: string;
  method: string;
}

export interface PGSettings {
  pgName: string;
  pgContact: string;
  pgAddress: string;
  pricing: {
    single: number;
    double: number;
    triple: number;
  };
  advanceRules: {
    single: number;
    double: number;
    triple: number;
  };
  checkInTime: string;
  checkOutTime: string;
  noticePeriod: string;
}

export interface PGData {
  rooms: Room[];
  residents: Resident[];
  payments: Payment[];
  settings: PGSettings;
}

export type Page = 'rooms' | 'residents' | 'payments' | 'settings' | 'profile';
