import { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  BedSingle,
  Calendar,
  IndianRupee,
  CheckCircle2,
  X,
  Edit2,
  LogOut,
  User as UserIcon,
  Home,
} from 'lucide-react';
import type { PGData, Resident } from '@/types';
import { updateResident, checkoutResident, validateEmail, validateMobile } from '@/lib/storage';
import { getPaymentMonitor } from '@/lib/paymentMonitoring';

interface ResidentsPageProps {
  data: PGData;
  setData: (d: PGData) => void;
}

export default function ResidentsPage({ data, setData }: ResidentsPageProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [editingResident, setEditingResident] = useState<Resident | null>(null);

  const filtered = useMemo(() => {
    let list = data.residents;
    if (filter === 'active') list = list.filter((r) => r.active);
    if (filter === 'inactive') list = list.filter((r) => !r.active);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.mobile.includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.userId.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data.residents, search, filter]);

  function handleCheckout(id: string) {
    const newData = checkoutResident(data, id);
    setData(newData);
  }

  function handleSave(updated: Resident) {
    const newData = updateResident(data, updated.id, updated);
    setData(newData);
    setEditingResident(null);
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-gold-400" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl">PG Residents</h1>
          <p className="text-navy-300 text-sm">{data.residents.filter((r) => r.active).length} active residents</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, mobile, email, or ID..."
            className="w-full bg-navy-800/50 border border-navy-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-navy-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
          />
        </div>
        <div className="flex gap-1 bg-navy-800/50 border border-navy-600 rounded-xl p-1">
          {(['active', 'all', 'inactive'] as const).map((f) => (
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
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-navy-600 mx-auto mb-4" />
          <p className="text-navy-300 text-lg">No residents found</p>
          <p className="text-navy-400 text-sm mt-1">Add residents from the Room Chart by clicking a room.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((resident, idx) => {
            const room = data.rooms.find((r) => r.id === resident.roomId);
            const bed = room?.beds.find((b) => b.id === resident.bedId);
            const payment = getPaymentMonitor(resident, data.payments);
            return (
              <div
                key={resident.id}
                className="glass-dark rounded-xl border border-navy-700 p-4 hover:border-gold-400/20 transition-all animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms`, opacity: 0 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      resident.active ? 'bg-gold-400/10' : 'bg-navy-700'
                    }`}>
                      <UserIcon className={`w-5 h-5 ${resident.active ? 'text-gold-400' : 'text-navy-400'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{resident.name}</p>
                      <p className="text-navy-300 text-xs">{resident.userId}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    resident.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-navy-700 text-navy-400'
                  }`}>
                    {resident.active ? 'Active' : 'Checked Out'}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-navy-200">
                    <Phone className="w-3.5 h-3.5 text-navy-400" />
                    {resident.mobile}
                  </div>
                  {resident.email && (
                    <div className="flex items-center gap-2 text-navy-200">
                      <Mail className="w-3.5 h-3.5 text-navy-400" />
                      <span className="truncate">{resident.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-navy-200">
                    <Home className="w-3.5 h-3.5 text-navy-400" />
                    Room {room?.number} • {bed?.label}
                  </div>
                  <div className="flex items-center gap-2 text-navy-200">
                    <Calendar className="w-3.5 h-3.5 text-navy-400" />
                    Since {new Date(resident.startDate).toLocaleDateString('en-IN')}
                  </div>
                </div>

                {/* Payment info */}
                <div className="mt-3 pt-3 border-t border-navy-700 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-navy-400 text-xs">Monthly Rent</p>
                    <p className="text-white text-sm font-semibold flex items-center justify-center">
                      <IndianRupee className="w-3 h-3" />{payment.rent}
                    </p>
                  </div>
                  <div>
                    <p className="text-navy-400 text-xs">Paid</p>
                    <p className="text-emerald-400 text-sm font-semibold flex items-center justify-center">
                      <IndianRupee className="w-3 h-3" />{payment.paid}
                    </p>
                  </div>
                  <div>
                    <p className="text-navy-400 text-xs">Balance</p>
                    <p className={`text-sm font-semibold flex items-center justify-center ${
                      payment.balance > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      <IndianRupee className="w-3 h-3" />{payment.balance}
                    </p>
                  </div>
                </div>

                <div className={`mt-2 text-center text-xs font-medium ${
                  payment.status === 'paid' ? 'text-emerald-400' :
                  payment.status === 'pending' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {payment.status.toUpperCase()}
                </div>

                {resident.active && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setEditingResident(resident)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-navy-700 text-navy-200 text-sm hover:bg-navy-600 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleCheckout(resident.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Check Out
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editingResident && (
        <EditResidentModal
          resident={editingResident}
          data={data}
          onSave={handleSave}
          onClose={() => setEditingResident(null)}
        />
      )}
    </div>
  );
}

function EditResidentModal(props: {
  resident: Resident;
  data: PGData;
  onSave: (r: Resident) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: props.resident.name,
    mobile: props.resident.mobile,
    email: props.resident.email,
    rent: props.resident.rent,
    advance: props.resident.advance,
    paid: props.resident.paid,
    startDate: props.resident.startDate,
    endDate: props.resident.endDate,
  });
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setError('Name is required.');
    if (!form.mobile.trim()) return setError('Mobile is required.');
    if (!validateMobile(form.mobile)) return setError('Invalid mobile number.');
    if (form.email && !validateEmail(form.email)) return setError('Invalid email address.');

    const balance = Number(form.rent) - Number(form.paid);
    const paymentStatus = balance <= 0 ? 'paid' : 'pending';

    props.onSave({
      ...props.resident,
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim().toLowerCase(),
      rent: Number(form.rent),
      advance: Number(form.advance),
      paid: Number(form.paid),
      balance,
      paymentStatus,
      startDate: form.startDate,
      endDate: form.endDate,
    });
  }

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={props.onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-navy-800 rounded-2xl border border-navy-600 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-navy-800 border-b border-navy-700 p-5 flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-white">Edit Resident</h2>
          <button onClick={props.onClose} className="w-9 h-9 rounded-lg bg-navy-700 hover:bg-navy-600 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-navy-200" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {props.resident.aadhaarVerified && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Aadhaar Verified
              </div>
              <p className="text-navy-300 text-xs mt-1">
                Aadhaar: {props.resident.aadhaarMasked}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Full Name" value={form.name} onChange={(v) => update('name', v)} required />
            <Input label="Mobile" value={form.mobile} onChange={(v) => update('mobile', v.replace(/\D/g, '').slice(0, 10))} required maxLength={10} inputMode="numeric" />
          </div>
          <Input label="Email" value={form.email} onChange={(v) => update('email', v)} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Rent" type="number" value={String(form.rent)} onChange={(v) => update('rent', v)} />
            <Input label="Advance" type="number" value={String(form.advance)} onChange={(v) => update('advance', v)} />
            <Input label="Paid" type="number" value={String(form.paid)} onChange={(v) => update('paid', v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={form.startDate} onChange={(v) => update('startDate', v)} />
            <Input label="End Date" type="date" value={form.endDate} onChange={(v) => update('endDate', v)} />
          </div>

          {error && (
            <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</div>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={props.onClose} className="flex-1 py-3 rounded-xl bg-navy-700 text-navy-200 font-medium hover:bg-navy-600 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3 rounded-xl bg-gold-400 text-navy-900 font-semibold hover:shadow-lg hover:shadow-gold-500/20 transition-all flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input(props: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; maxLength?: number; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'] }) {
  return (
    <div>
      <label className="block text-sm text-navy-200 mb-1.5">
        {props.label}
        {props.required && <span className="text-gold-400 ml-1">*</span>}
      </label>
      <input
        type={props.type || 'text'}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        maxLength={props.maxLength}
        inputMode={props.inputMode}
        className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
      />
    </div>
  );
}
