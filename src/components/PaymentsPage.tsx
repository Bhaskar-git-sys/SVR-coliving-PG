import { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import type { PGData, Payment, PaymentStatus } from '@/types';
import { addPayment, generateId } from '@/lib/storage';

interface PaymentsPageProps {
  data: PGData;
  setData: (d: PGData) => void;
}

const STATUS_CONFIG: Record<PaymentStatus, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; label: string }> = {
  paid: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Paid' },
  pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Pending' },
  overdue: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Overdue' },
};

export default function PaymentsPage({ data, setData }: PaymentsPageProps) {
  const [filter, setFilter] = useState<'all' | PaymentStatus>('all');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(() => {
    let list = [...data.payments].reverse();
    if (filter !== 'all') list = list.filter((p) => p.status === filter);
    return list;
  }, [data.payments, filter]);

  const stats = useMemo(() => {
    const total = data.payments.reduce((s, p) => s + p.amount, 0);
    const paid = data.payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const pending = data.payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
    const overdue = data.payments.filter((p) => p.status === 'overdue').reduce((s, p) => s + p.amount, 0);
    return { total, paid, pending, overdue };
  }, [data.payments]);

  function handleAddPayment(payment: Omit<Payment, 'id'>) {
    const newData = addPayment(data, payment);
    setData(newData);
    setShowAdd(false);
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl">Payments</h1>
            <p className="text-navy-300 text-sm">Track rent payments and dues</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-400 text-navy-900 font-semibold text-sm hover:shadow-lg hover:shadow-gold-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Payment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Wallet} label="Total Collected" value={stats.total} color="gold" />
        <StatCard icon={CheckCircle2} label="Paid" value={stats.paid} color="emerald" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} color="amber" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdue} color="red" />
      </div>

      {/* Filters */}
      <div className="flex gap-1 bg-navy-800/50 border border-navy-600 rounded-xl p-1 mb-6 w-fit">
        {(['all', 'paid', 'pending', 'overdue'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === f ? 'bg-gold-400/15 text-gold-300' : 'text-navy-300 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <CreditCard className="w-12 h-12 text-navy-600 mx-auto mb-4" />
          <p className="text-navy-300 text-lg">No payments found</p>
          <p className="text-navy-400 text-sm mt-1">Click "Add Payment" to record a new payment.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((payment, idx) => {
            const cfg = STATUS_CONFIG[payment.status];
            return (
              <div
                key={payment.id}
                className={`glass-dark rounded-xl border p-4 flex items-center gap-4 animate-slide-up ${cfg.bg}`}
                style={{ animationDelay: `${idx * 40}ms`, opacity: 0 }}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                  <cfg.icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white truncate">{payment.residentName}</p>
                    <span className="text-navy-400 text-xs">•</span>
                    <span className="text-navy-300 text-sm">Room {payment.roomNumber}</span>
                  </div>
                  <div className="flex items-center gap-3 text-navy-300 text-xs mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(payment.date).toLocaleDateString('en-IN')}
                    </span>
                    <span>{payment.month}</span>
                    <span>•</span>
                    <span>{payment.method}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg flex items-center ${cfg.color}`}>
                    <IndianRupee className="w-4 h-4" />{payment.amount}
                  </p>
                  <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <AddPaymentModal
          data={data}
          onSubmit={handleAddPayment}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

function StatCard(props: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: 'gold' | 'emerald' | 'amber' | 'red';
}) {
  const colorMap = {
    gold: 'text-gold-400 bg-gold-400/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    red: 'text-red-400 bg-red-500/10',
  };

  return (
    <div className="glass-dark rounded-xl p-4 border border-navy-700">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[props.color]}`}>
          <props.icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-navy-300 text-xs">{props.label}</p>
          <p className="font-display font-bold text-xl text-white flex items-center">
            <IndianRupee className="w-4 h-4 text-navy-400" />{props.value.toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  );
}

function AddPaymentModal(props: {
  data: PGData;
  onSubmit: (p: Omit<Payment, 'id'>) => void;
  onClose: () => void;
}) {
  const activeResidents = props.data.residents.filter((r) => r.active);
  const [residentId, setResidentId] = useState(activeResidents[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!residentId) return setError('Please select a resident.');
    const amt = Number(amount);
    if (!amt || amt <= 0) return setError('Please enter a valid amount.');

    const resident = props.data.residents.find((r) => r.id === residentId);
    if (!resident) return setError('Resident not found.');

    const room = props.data.rooms.find((r) => r.id === resident.roomId);

    props.onSubmit({
      residentId,
      residentName: resident.name,
      roomNumber: room?.number || '',
      amount: amt,
      date: new Date().toISOString().slice(0, 10),
      status: 'paid',
      month: new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
      method,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={props.onClose}
    >
      <div
        className="w-full max-w-md bg-navy-800 rounded-2xl border border-navy-600 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-navy-800 border-b border-navy-700 p-5 flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-white">Add Payment</h2>
          <button onClick={props.onClose} className="w-9 h-9 rounded-lg bg-navy-700 hover:bg-navy-600 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-navy-200" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {activeResidents.length === 0 ? (
            <p className="text-navy-300 text-center py-8">No active residents. Add a resident first.</p>
          ) : (
            <>
              <div>
                <label className="block text-sm text-navy-200 mb-1.5">Resident</label>
                <select
                  value={residentId}
                  onChange={(e) => setResidentId(e.target.value)}
                  className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
                >
                  {activeResidents.map((r) => {
                    const room = props.data.rooms.find((rm) => rm.id === r.roomId);
                    return (
                      <option key={r.id} value={r.id}>
                        {r.name} — Room {room?.number} (Balance: {r.balance})
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm text-navy-200 mb-1.5">Amount</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-navy-700 border border-navy-600 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-navy-200 mb-1.5">Payment Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              {error && (
                <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</div>
              )}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={props.onClose} className="flex-1 py-3 rounded-xl bg-navy-700 text-navy-200 font-medium hover:bg-navy-600 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-gold-400 text-navy-900 font-semibold hover:shadow-lg hover:shadow-gold-500/20 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Record Payment
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
