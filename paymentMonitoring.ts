import type { Payment, PaymentStatus, Resident, Room } from '@/types';

export interface PaymentMonitor {
  rent: number;
  paid: number;
  balance: number;
  status: PaymentStatus;
}

function isCurrentMonthPayment(payment: Payment, today: Date): boolean {
  const paymentDate = new Date(`${payment.date}T00:00:00`);
  const dateMatches =
    !Number.isNaN(paymentDate.getTime()) &&
    paymentDate.getFullYear() === today.getFullYear() &&
    paymentDate.getMonth() === today.getMonth();
  const monthMatches = payment.month === today.toLocaleString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  return dateMatches || monthMatches;
}

export function getPaymentMonitor(
  resident: Resident,
  payments: Payment[],
  today = new Date()
): PaymentMonitor {
  const paid = payments
    .filter((payment) => payment.residentId === resident.id && isCurrentMonthPayment(payment, today))
    .reduce((total, payment) => total + payment.amount, 0);
  const balance = Math.max(0, resident.rent - paid);

  if (balance === 0 && resident.rent > 0) {
    return { rent: resident.rent, paid, balance, status: 'paid' };
  }

  const startDate = new Date(`${resident.startDate}T00:00:00`);
  const dueDay = Number.isNaN(startDate.getTime()) ? null : startDate.getDate();
  const overdue = dueDay !== null && today.getDate() > dueDay;

  return {
    rent: resident.rent,
    paid,
    balance,
    status: overdue ? 'overdue' : 'pending',
  };
}

export function getRoomPaymentStatus(
  room: Room,
  residents: Resident[],
  payments: Payment[]
): PaymentStatus | null {
  const occupiedResidents = room.beds
    .filter((bed) => bed.occupied && bed.residentId)
    .map((bed) => residents.find((resident) => resident.id === bed.residentId))
    .filter((resident): resident is Resident => Boolean(resident && resident.active));

  if (occupiedResidents.length === 0) return null;

  const statuses = occupiedResidents.map((resident) => getPaymentMonitor(resident, payments).status);
  if (statuses.includes('overdue')) return 'overdue';
  if (statuses.includes('pending')) return 'pending';
  return 'paid';
}