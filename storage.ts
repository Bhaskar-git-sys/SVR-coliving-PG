import type {
  OwnerAccount,
  OwnerSession,
  PGData,
  Room,
  Resident,
  Payment,
  PaymentStatus,
  PGSettings,
  Bed,
  RoomType,
} from '@/types';

const STORAGE_KEYS = {
  ownerAccount: 'svr_ownerAccount',
  ownerSession: 'svr_ownerSession',
  pgData: 'svr_pgData',
};

const ROOMS_PER_FLOOR = 8;
const FLOORS = 6;

export function getRoomTypeCapacity(type: RoomType): number {
  switch (type) {
    case 'single': return 1;
    case 'double': return 2;
    case 'triple': return 3;
  }
}

function generateBeds(type: RoomType, roomNumber: string): Bed[] {
  const capacity = getRoomTypeCapacity(type);
  const beds: Bed[] = [];
  for (let i = 0; i < capacity; i++) {
    beds.push({
      id: `${roomNumber}-B${i + 1}`,
      label: `Bed ${i + 1}`,
      occupied: false,
      residentId: null,
    });
  }
  return beds;
}

function generateRooms(): Room[] {
  const rooms: Room[] = [];
  const types: RoomType[] = ['single', 'double', 'double', 'triple', 'triple', 'double', 'triple', 'double'];
  for (let floor = 1; floor <= FLOORS; floor++) {
    for (let i = 1; i <= ROOMS_PER_FLOOR; i++) {
      const number = `${floor}${String(i).padStart(2, '0')}`;
      const type = types[i - 1];
      rooms.push({
        id: `room-${number}`,
        number,
        floor,
        type,
        beds: generateBeds(type, number),
      });
    }
  }
  return rooms;
}

function defaultSettings(): PGSettings {
  return {
    pgName: 'SVR Co-Living PG',
    pgContact: '+91 98765 43210',
    pgAddress: '123 MG Road, Koramangala, Bengaluru, Karnataka 560034',
    pricing: { single: 15000, double: 10000, triple: 8000 },
    advanceRules: { single: 30000, double: 20000, triple: 16000 },
    checkInTime: '12:00 PM',
    checkOutTime: '11:00 AM',
    noticePeriod: '30 days',
  };
}

export function createDefaultPGData(): PGData {
  return {
    rooms: generateRooms(),
    residents: [],
    payments: [],
    settings: defaultSettings(),
  };
}

function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// Owner Account
export function getOwnerAccount(): OwnerAccount | null {
  const data = safeParse<OwnerAccount | null>(STORAGE_KEYS.ownerAccount, null);
  return data;
}

export function saveOwnerAccount(account: OwnerAccount): void {
  localStorage.setItem(STORAGE_KEYS.ownerAccount, JSON.stringify(account));
}

export function updateOwnerAccount(updates: Partial<OwnerAccount>): OwnerAccount | null {
  const current = getOwnerAccount();
  if (!current) return null;
  const updated = { ...current, ...updates };
  saveOwnerAccount(updated);
  return updated;
}

// Owner Session
export function getOwnerSession(): OwnerSession {
  return safeParse<OwnerSession>(STORAGE_KEYS.ownerSession, { loggedIn: false, loginTime: '' });
}

export function setOwnerSession(loggedIn: boolean): void {
  const session: OwnerSession = {
    loggedIn,
    loginTime: loggedIn ? new Date().toISOString() : '',
  };
  localStorage.setItem(STORAGE_KEYS.ownerSession, JSON.stringify(session));
}

export function clearOwnerSession(): void {
  localStorage.removeItem(STORAGE_KEYS.ownerSession);
}

// PG Data
export function getPGData(): PGData {
  const data = safeParse<PGData | null>(STORAGE_KEYS.pgData, null);
  if (!data) {
    const fresh = createDefaultPGData();
    savePGData(fresh);
    return fresh;
  }
  // Ensure rooms exist
  if (!data.rooms || data.rooms.length === 0) {
    data.rooms = generateRooms();
  }
  if (!data.settings) {
    data.settings = defaultSettings();
  }
  return data;
}

export function savePGData(data: PGData): void {
  localStorage.setItem(STORAGE_KEYS.pgData, JSON.stringify(data));
}

export function resetPGData(): PGData {
  const fresh = createDefaultPGData();
  savePGData(fresh);
  return fresh;
}

export function resetOwnerAccount(): void {
  localStorage.removeItem(STORAGE_KEYS.ownerAccount);
  localStorage.removeItem(STORAGE_KEYS.ownerSession);
}

// Validation helpers
export function validateEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

export function validateMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile.replace(/\s/g, '').slice(0, 10)) && mobile.replace(/\s/g, '').length === 10;
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

// Resident helpers
export function generateUserId(): string {
  return `SVR${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0')}`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getRoomStatus(room: Room): 'available' | 'partial' | 'full' {
  const occupied = room.beds.filter((b) => b.occupied).length;
  const total = room.beds.length;
  if (occupied === 0) return 'available';
  if (occupied === total) return 'full';
  return 'partial';
}

export function getVacantBeds(room: Room): Bed[] {
  return room.beds.filter((b) => !b.occupied);
}

export function addResident(
  data: PGData,
  resident: Omit<Resident, 'id' | 'userId' | 'balance' | 'paymentStatus' | 'active'>
): { data: PGData; resident: Resident } {
  const id = generateId();
  const userId = generateUserId();
  const balance = resident.rent - resident.paid;
  const paymentStatus = balance <= 0 ? 'paid' : 'pending';

  const newResident: Resident = {
    ...resident,
    id,
    userId,
    balance,
    paymentStatus,
    active: true,
  };

  // Mark bed as occupied
  const rooms = data.rooms.map((r) => {
    if (r.id === resident.roomId) {
      return {
        ...r,
        beds: r.beds.map((b) =>
          b.id === resident.bedId
            ? { ...b, occupied: true, residentId: id }
            : b
        ),
      };
    }
    return r;
  });

  const residents = [...data.residents, newResident];

  // Create initial payment record
  const room = data.rooms.find((r) => r.id === resident.roomId);
  const payment: Payment = {
    id: generateId(),
    residentId: id,
    residentName: resident.name,
    roomNumber: room?.number ?? '',
    amount: resident.rent,
    date: new Date().toISOString().slice(0, 10),
    status: paymentStatus,
    month: new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
    method: 'Cash',
  };

  const payments = [...data.payments, payment];
  const updatedData = { ...data, rooms, residents, payments };
  savePGData(updatedData);
  return { data: updatedData, resident: newResident };
}

export function updateResident(
  data: PGData,
  id: string,
  updates: Partial<Resident>
): PGData {
  const residents = data.residents.map((r) =>
    r.id === id ? { ...r, ...updates } : r
  );
  const updatedData = { ...data, residents };
  savePGData(updatedData);
  return updatedData;
}

export function moveResident(
  data: PGData,
  id: string,
  newRoomId: string,
  newBedId: string
): PGData {
  const resident = data.residents.find((r) => r.id === id);
  if (!resident) return data;

  // Free old bed
  let rooms = data.rooms.map((r) => {
    if (r.id === resident.roomId) {
      return {
        ...r,
        beds: r.beds.map((b) =>
          b.id === resident.bedId
            ? { ...b, occupied: false, residentId: null }
            : b
        ),
      };
    }
    return r;
  });

  // Occupy new bed
  rooms = rooms.map((r) => {
    if (r.id === newRoomId) {
      return {
        ...r,
        beds: r.beds.map((b) =>
          b.id === newBedId
            ? { ...b, occupied: true, residentId: id }
            : b
        ),
      };
    }
    return r;
  });

  const newRoom = rooms.find((r) => r.id === newRoomId);
  const residents = data.residents.map((r) =>
    r.id === id
      ? { ...r, roomId: newRoomId, bedId: newBedId, roomNumber: newRoom?.number }
      : r
  );

  const updatedData = { ...data, rooms, residents };
  savePGData(updatedData);
  return updatedData;
}

export function checkoutResident(data: PGData, id: string): PGData {
  const resident = data.residents.find((r) => r.id === id);
  if (!resident) return data;

  const rooms = data.rooms.map((r) => {
    if (r.id === resident.roomId) {
      return {
        ...r,
        beds: r.beds.map((b) =>
          b.id === resident.bedId
            ? { ...b, occupied: false, residentId: null }
            : b
        ),
      };
    }
    return r;
  });

  const residents = data.residents.map((r) =>
    r.id === id ? { ...r, active: false, endDate: new Date().toISOString().slice(0, 10) } : r
  );

  const updatedData = { ...data, rooms, residents };
  savePGData(updatedData);
  return updatedData;
}

export function addPayment(
  data: PGData,
  payment: Omit<Payment, 'id'>
): PGData {
  const newPayment: Payment = { ...payment, id: generateId() };
  const payments = [...data.payments, newPayment];

  // Update resident balance
  const residents = data.residents.map((r) => {
    if (r.id === payment.residentId) {
      const newPaid = r.paid + payment.amount;
      const newBalance = r.rent - newPaid;
      return {
        ...r,
        paid: newPaid,
        balance: newBalance,
        paymentStatus: (newBalance <= 0 ? 'paid' : 'pending') as PaymentStatus,
      };
    }
    return r;
  });

  const updatedData = { ...data, payments, residents };
  savePGData(updatedData);
  return updatedData;
}

export function updateRoomType(
  data: PGData,
  roomId: string,
  type: RoomType
): PGData {
  const rooms = data.rooms.map((r) => {
    if (r.id === roomId) {
      const occupiedBeds = r.beds.filter((b) => b.occupied);
      const newCapacity = getRoomTypeCapacity(type);
      // If reducing capacity below occupied, don't allow
      if (occupiedBeds.length > newCapacity) return r;

      const newBeds: Bed[] = [];
      for (let i = 0; i < newCapacity; i++) {
        if (r.beds[i]) {
          newBeds.push(r.beds[i]);
        } else {
          newBeds.push({
            id: `${r.number}-B${i + 1}`,
            label: `Bed ${i + 1}`,
            occupied: false,
            residentId: null,
          });
        }
      }
      return { ...r, type, beds: newBeds };
    }
    return r;
  });

  const updatedData = { ...data, rooms };
  savePGData(updatedData);
  return updatedData;
}

export function updateSettings(
  data: PGData,
  settings: Partial<PGSettings>
): PGData {
  const updatedData = { ...data, settings: { ...data.settings, ...settings } };
  savePGData(updatedData);
  return updatedData;
}

export { STORAGE_KEYS };
