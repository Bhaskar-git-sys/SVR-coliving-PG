import { useState, useEffect } from 'react';
import {
  X,
  BedSingle,
  UserPlus,
  Users,
  Settings2,
  Check,
  Calendar,
  IndianRupee,
  Phone,
  Mail,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  LoaderCircle,
} from 'lucide-react';
import type { PGData, Room, Resident, RoomType } from '@/types';
import type { AadhaarVerificationDetails } from '@/lib/aadhaarService';
import {
  getRoomStatus,
  getVacantBeds,
  getRoomTypeCapacity,
  addResident,
  updateRoomType,
  moveResident,
  checkoutResident,
  validateEmail,
  validateMobile,
} from '@/lib/storage';
import {
  formatAadhaar,
  getKycStatus,
  isValidAadhaar,
  maskAadhaar,
  normalizeAadhaar,
  startAadhaarVerification,
  verifyAadhaarOtp,
} from '@/lib/aadhaarService';

interface RoomDetailModalProps {
  room: Room;
  data: PGData;
  setData: (d: PGData) => void;
  onClose: () => void;
}

type Tab = 'overview' | 'addResident';

const ROOM_TYPES: RoomType[] = ['single', 'double', 'triple'];
const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  single: 'Single',
  double: 'Double',
  triple: 'Triple',
};

export default function RoomDetailModal({ room, data, setData, onClose }: RoomDetailModalProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const [showEditType, setShowEditType] = useState(false);
  const [moveResidentId, setMoveResidentId] = useState<string | null>(null);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const status = getRoomStatus(room);
  const vacantBeds = getVacantBeds(room);
  const occupiedCount = room.beds.length - vacantBeds.length;
  const pricing = data.settings.pricing[room.type];

  const residentsInRoom = data.residents.filter(
    (r) => r.roomId === room.id && r.active
  );

  function handleAddResident(formData: Omit<Resident, 'id' | 'userId' | 'balance' | 'paymentStatus' | 'active'>) {
    const { data: newData } = addResident(data, formData);
    setData(newData);
    setTab('overview');
  }

  function handleRoomTypeChange(type: RoomType) {
    const newData = updateRoomType(data, room.id, type);
    setData(newData);
    setShowEditType(false);
  }

  function handleMoveResident(newRoomId: string, newBedId: string) {
    if (!moveResidentId) return;
    const newData = moveResident(data, moveResidentId, newRoomId, newBedId);
    setData(newData);
    setMoveResidentId(null);
  }

  function handleCheckout(id: string) {
    const newData = checkoutResident(data, id);
    setData(newData);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-navy-800 rounded-2xl border border-navy-600 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-navy-800 border-b border-navy-700 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center">
              <BedSingle className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl text-white">Room {room.number}</h2>
              <p className="text-navy-300 text-sm">
                Floor {room.floor} • {ROOM_TYPE_LABEL[room.type]} • {occupiedCount}/{room.beds.length} beds occupied
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-navy-700 hover:bg-navy-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-navy-200" />
          </button>
        </div>

        {/* Status badge */}
        <div className="px-5 pt-5">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
            status === 'partial' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
            'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              status === 'available' ? 'bg-emerald-500' :
              status === 'partial' ? 'bg-amber-500' : 'bg-red-500'
            }`} />
            {status === 'available' ? 'Available' : status === 'partial' ? 'Partially Occupied' : 'Fully Occupied'}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-4 flex gap-1 border-b border-navy-700">
          <TabButton active={tab === 'overview'} onClick={() => setTab('overview')}>
            <Users className="w-4 h-4" /> Overview
          </TabButton>
          {vacantBeds.length > 0 && (
            <TabButton active={tab === 'addResident'} onClick={() => setTab('addResident')}>
              <UserPlus className="w-4 h-4" /> Add Resident
            </TabButton>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {tab === 'overview' && (
            <OverviewTab
              room={room}
              data={data}
              residentsInRoom={residentsInRoom}
              showEditType={showEditType}
              setShowEditType={setShowEditType}
              onRoomTypeChange={handleRoomTypeChange}
              onCheckout={handleCheckout}
              moveResidentId={moveResidentId}
              setMoveResidentId={setMoveResidentId}
              onMoveResident={handleMoveResident}
            />
          )}
          {tab === 'addResident' && vacantBeds.length > 0 && (
            <AddResidentForm
              room={room}
              vacantBeds={vacantBeds}
              pricing={pricing}
              advance={data.settings.advanceRules[room.type]}
              existingResidents={data.residents}
              onSubmit={handleAddResident}
              onCancel={() => setTab('overview')}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton(props: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={props.onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
        props.active
          ? 'text-gold-400 border-gold-400'
          : 'text-navy-300 border-transparent hover:text-white'
      }`}
    >
      {props.children}
    </button>
  );
}

function OverviewTab(props: {
  room: Room;
  data: PGData;
  residentsInRoom: Resident[];
  showEditType: boolean;
  setShowEditType: (v: boolean) => void;
  onRoomTypeChange: (t: RoomType) => void;
  onCheckout: (id: string) => void;
  moveResidentId: string | null;
  setMoveResidentId: (id: string | null) => void;
  onMoveResident: (roomId: string, bedId: string) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Room type editor */}
      <div className="bg-navy-700/30 rounded-xl p-4 border border-navy-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-navy-200 text-sm font-medium">Room Type</span>
          <button
            onClick={() => props.setShowEditType(!props.showEditType)}
            className="text-gold-400 hover:text-gold-300 text-sm flex items-center gap-1.5 transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
            {props.showEditType ? 'Done' : 'Change'}
          </button>
        </div>
        {props.showEditType ? (
          <div className="flex flex-wrap gap-2">
            {ROOM_TYPES.map((t) => {
              const capacity = getRoomTypeCapacity(t);
              const occupied = props.room.beds.filter((b) => b.occupied).length;
              const disabled = occupied > capacity;
              return (
                <button
                  key={t}
                  disabled={disabled}
                  onClick={() => props.onRoomTypeChange(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    props.room.type === t
                      ? 'bg-gold-400 text-navy-900'
                      : disabled
                      ? 'bg-navy-700/30 text-navy-500 cursor-not-allowed'
                      : 'bg-navy-700/50 text-navy-200 hover:bg-navy-600'
                  }`}
                >
                  {ROOM_TYPE_LABEL[t]} ({capacity})
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-white font-semibold">
            {ROOM_TYPE_LABEL[props.room.type]} — {props.room.beds.length} beds
          </p>
        )}
      </div>

      {/* Beds list */}
      <div>
        <h3 className="text-sm font-bold text-navy-200 uppercase tracking-wider mb-3">Beds</h3>
        <div className="space-y-2">
          {props.room.beds.map((bed) => {
            const resident = props.data.residents.find(
              (r) => r.id === bed.residentId && r.active
            );
            return (
              <div
                key={bed.id}
                className={`rounded-xl p-3 border flex items-center gap-3 ${
                  bed.occupied
                    ? 'bg-navy-700/30 border-navy-600'
                    : 'bg-emerald-500/5 border-emerald-500/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  bed.occupied ? 'bg-navy-600' : 'bg-emerald-500/10'
                }`}>
                  <BedSingle className={`w-5 h-5 ${bed.occupied ? 'text-navy-200' : 'text-emerald-400'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{bed.label}</p>
                  {resident ? (
                    <p className="text-navy-300 text-xs">{resident.name} • {resident.userId}</p>
                  ) : (
                    <p className="text-emerald-400 text-xs">Vacant</p>
                  )}
                </div>
                {resident && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => props.setMoveResidentId(resident.id)}
                      className="text-xs text-gold-400 hover:text-gold-300 px-2 py-1 rounded transition-colors"
                    >
                      Move
                    </button>
                    <button
                      onClick={() => props.onCheckout(resident.id)}
                      className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded transition-colors"
                    >
                      Check Out
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Move resident modal */}
      {props.moveResidentId && (
        <MoveResidentModal
          data={props.data}
          currentRoomId={props.room.id}
          onClose={() => props.setMoveResidentId(null)}
          onMove={props.onMoveResident}
        />
      )}
    </div>
  );
}

function MoveResidentModal(props: {
  data: PGData;
  currentRoomId: string;
  onClose: () => void;
  onMove: (roomId: string, bedId: string) => void;
}) {
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedBed, setSelectedBed] = useState<string>('');

  const availableRooms = props.data.rooms.filter(
    (r) => r.id !== props.currentRoomId && getVacantBeds(r).length > 0
  );

  const currentRoom = selectedRoom
    ? props.data.rooms.find((r) => r.id === selectedRoom)
    : null;
  const vacantInSelected = currentRoom ? getVacantBeds(currentRoom) : [];

  return (
    <div className="bg-navy-900/80 rounded-xl p-4 border border-navy-600 animate-scale-in">
      <h4 className="font-semibold text-white mb-3">Move Resident To</h4>
      <div className="space-y-3">
        <div>
          <label className="text-sm text-navy-200 mb-1.5 block">Select Room</label>
          <select
            value={selectedRoom}
            onChange={(e) => {
              setSelectedRoom(e.target.value);
              setSelectedBed('');
            }}
            className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
          >
            <option value="">Choose a room...</option>
            {availableRooms.map((r) => (
              <option key={r.id} value={r.id}>
                Room {r.number} (Floor {r.floor}) — {getVacantBeds(r).length} vacant
              </option>
            ))}
          </select>
        </div>
        {vacantInSelected.length > 0 && (
          <div>
            <label className="text-sm text-navy-200 mb-1.5 block">Select Bed</label>
            <select
              value={selectedBed}
              onChange={(e) => setSelectedBed(e.target.value)}
              className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
            >
              <option value="">Choose a bed...</option>
              {vacantInSelected.map((b) => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={props.onClose}
            className="flex-1 py-2.5 rounded-lg bg-navy-700 text-navy-200 text-sm font-medium hover:bg-navy-600 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!selectedRoom || !selectedBed}
            onClick={() => props.onMove(selectedRoom, selectedBed)}
            className="flex-1 py-2.5 rounded-lg bg-gold-400 text-navy-900 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold-500/20 transition-all flex items-center justify-center gap-2"
          >
            Move <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AddResidentForm(props: {
  room: Room;
  vacantBeds: { id: string; label: string }[];
  pricing: number;
  advance: number;
  existingResidents: Resident[];
  onSubmit: (data: Omit<Resident, 'id' | 'userId' | 'balance' | 'paymentStatus' | 'active'>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    bedId: props.vacantBeds[0]?.id || '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    rent: props.pricing,
    advance: props.advance,
    paid: 0,
  });
  const [error, setError] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [consent, setConsent] = useState(false);
  const [challengeId, setChallengeId] = useState('');
  const [otp, setOtp] = useState('');
  const [verification, setVerification] = useState<AadhaarVerificationDetails | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedNameEdited, setVerifiedNameEdited] = useState(false);

  const kycStatus = getKycStatus();

  async function handleStartVerification() {
    setError('');
    const normalized = normalizeAadhaar(aadhaar);
    if (!isValidAadhaar(normalized)) return setError('Please enter a valid Aadhaar number.');
    if (!consent) return setError('Please provide consent before Aadhaar verification.');

    setIsVerifying(true);
    try {
      const challenge = await startAadhaarVerification(normalized);
      setChallengeId(challenge.challengeId);
      setAadhaar(challenge.maskedAadhaar);
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : 'Aadhaar verification failed.');
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleVerifyOtp() {
    setError('');
    setIsVerifying(true);
    try {
      const details = await verifyAadhaarOtp(challengeId, otp);
      setVerification(details);
      setForm((prev) => ({ ...prev, name: details.name }));
      setVerifiedNameEdited(false);
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : 'Aadhaar verification failed.');
    } finally {
      setIsVerifying(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setError('Resident name is required.');
    if (!form.mobile.trim()) return setError('Mobile number is required.');
    if (!validateMobile(form.mobile)) return setError('Please enter a valid 10-digit mobile number.');
    if (form.email && !validateEmail(form.email)) return setError('Please enter a valid email address.');
    if (!form.bedId) return setError('Please select a bed.');
    if (form.paid < 0) return setError('Paid amount cannot be negative.');
    if (aadhaar && !verification) return setError('Please complete Aadhaar verification or clear the Aadhaar field.');
    if (verification && props.existingResidents.some((resident) => resident.aadhaarVerificationRef === verification.verificationRef)) {
      return setError('This Aadhaar is already associated with an existing resident.');
    }

    props.onSubmit({
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim().toLowerCase(),
      roomId: props.room.id,
      bedId: form.bedId,
      startDate: form.startDate,
      endDate: form.endDate || '',
      rent: Number(form.rent),
      advance: Number(form.advance),
      paid: Number(form.paid),
      ...(verification && {
        aadhaarVerified: true,
        aadhaarMasked: verification.maskedAadhaar,
        aadhaarVerificationRef: verification.verificationRef,
        aadhaarVerifiedAt: verification.verifiedAt,
        aadhaarDob: verification.dateOfBirth,
        aadhaarGender: verification.gender,
        aadhaarAddress: verification.address,
      }),
    });
  }

  const update = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-gold-400/20 bg-gold-400/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gold-400" />
          <h3 className="text-sm font-semibold text-white">Resident KYC Verification</h3>
          <span className="ml-auto text-[10px] uppercase tracking-wider text-navy-300">Optional</span>
        </div>
        {kycStatus === 'development-mock' && (
          <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
            DEVELOPMENT ONLY: synthetic mock provider enabled. Use OTP 123456. This is not Aadhaar verification.
          </p>
        )}
        {kycStatus === 'unavailable' && (
          <p className="text-xs text-navy-300 bg-navy-700/50 rounded-lg p-2">
            Aadhaar verification is unavailable until an authorized KYC provider is configured.
          </p>
        )}
        {!verification ? (
          <>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={aadhaar}
                onChange={(e) => {
                  setAadhaar(formatAadhaar(e.target.value));
                  setChallengeId('');
                }}
                placeholder="XXXX XXXX XXXX"
                inputMode="numeric"
                maxLength={14}
                disabled={Boolean(challengeId) || kycStatus === 'unavailable'}
                className="flex-1 bg-navy-700 border border-navy-600 rounded-lg px-3 py-2.5 text-white text-sm tracking-wider placeholder-navy-500 focus:outline-none focus:border-gold-400 disabled:opacity-60"
                aria-label="Aadhaar number"
              />
              {!challengeId ? (
                <button
                  type="button"
                  onClick={handleStartVerification}
                  disabled={isVerifying || kycStatus === 'unavailable'}
                  className="px-4 py-2.5 rounded-lg bg-gold-400 text-navy-900 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isVerifying && <LoaderCircle className="w-4 h-4 animate-spin" />}
                  Verify Aadhaar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setChallengeId(''); setAadhaar(''); setOtp(''); }}
                  className="px-4 py-2.5 rounded-lg bg-navy-700 text-navy-200 text-sm font-medium"
                >
                  Change
                </button>
              )}
            </div>
            {!challengeId && (
              <label className="flex items-start gap-2 text-xs text-navy-300">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-amber-400" />
                I consent to Aadhaar/e-KYC verification by the configured authorized provider.
              </label>
            )}
            {challengeId && (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  inputMode="numeric"
                  maxLength={6}
                  className="flex-1 bg-navy-700 border border-navy-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
                />
                <button type="button" onClick={handleVerifyOtp} disabled={isVerifying} className="px-4 py-2.5 rounded-lg bg-gold-400 text-navy-900 text-sm font-semibold disabled:opacity-50">
                  Verify OTP
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <ShieldCheck className="w-4 h-4" /> Aadhaar Verified
              <span className="text-navy-300 text-xs font-normal ml-auto">{maskAadhaar(verification.maskedAadhaar)}</span>
            </div>
            {verification.provider === 'development-mock' && <p className="text-xs text-amber-300">Development mock result only.</p>}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-navy-200">
              <span>Name: {verification.name}</span>
              {verification.dateOfBirth && <span>DOB: {verification.dateOfBirth}</span>}
              {verification.gender && <span>Gender: {verification.gender}</span>}
            </div>
            {verification.address && <p className="text-xs text-navy-300">Address: {verification.address}</p>}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FormField
            icon={UserIcon}
            label="Full Name"
            value={form.name}
            onChange={(v) => { setVerifiedNameEdited(Boolean(verification && v !== verification.name)); update('name', v); }}
            placeholder="John Doe"
            required
          />
          {verifiedNameEdited && <p className="text-xs text-amber-300 mt-1">Modified after Aadhaar verification.</p>}
        </div>
        <FormField icon={Phone} label="Mobile" value={form.mobile} onChange={(v) => update('mobile', v.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" required maxLength={10} inputMode="numeric" />
      </div>
      <FormField icon={Mail} label="Email (optional)" value={form.email} onChange={(v) => update('email', v)} placeholder="john@example.com" />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-navy-200 mb-1.5">Select Bed</label>
          <select
            value={form.bedId}
            onChange={(e) => update('bedId', e.target.value)}
            className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
          >
            {props.vacantBeds.map((b) => (
              <option key={b.id} value={b.id}>{b.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-navy-200 mb-1.5">PG Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => update('startDate', e.target.value)}
              className="w-full bg-navy-700 border border-navy-600 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-navy-200 mb-1.5">Monthly Rent</label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="number"
              value={form.rent}
              onChange={(e) => update('rent', e.target.value)}
              className="w-full bg-navy-700 border border-navy-600 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-navy-200 mb-1.5">Advance</label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="number"
              value={form.advance}
              onChange={(e) => update('advance', e.target.value)}
              className="w-full bg-navy-700 border border-navy-600 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-navy-200 mb-1.5">Amount Paid</label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="number"
              value={form.paid}
              onChange={(e) => update('paid', e.target.value)}
              className="w-full bg-navy-700 border border-navy-600 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={props.onCancel}
          className="flex-1 py-3 rounded-xl bg-navy-700 text-navy-200 font-medium hover:bg-navy-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 rounded-xl bg-gold-400 text-navy-900 font-semibold hover:shadow-lg hover:shadow-gold-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          Add Resident
        </button>
      </div>
    </form>
  );
}

function FormField(props: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <div>
      <label className="block text-sm text-navy-200 mb-1.5">
        {props.label}
        {props.required && <span className="text-gold-400 ml-1">*</span>}
      </label>
      <div className="relative">
        <props.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
        <input
          type="text"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          maxLength={props.maxLength}
          inputMode={props.inputMode}
          placeholder={props.placeholder}
          className="w-full bg-navy-700 border border-navy-600 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm placeholder-navy-500 focus:outline-none focus:border-gold-400"
        />
      </div>
    </div>
  );
}
