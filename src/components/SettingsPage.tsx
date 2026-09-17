import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  AlertTriangle,
  IndianRupee,
  Clock,
  Home,
  Phone,
  MapPin,
  CheckCircle2,
  X,
  Trash2,
} from 'lucide-react';
import type { PGData, PGSettings, RoomType } from '@/types';
import { updateSettings, resetPGData, resetOwnerAccount } from '@/lib/storage';

interface SettingsPageProps {
  data: PGData;
  setData: (d: PGData) => void;
  onOwnerReset: () => void;
}

const ROOM_TYPES: RoomType[] = ['single', 'double', 'triple', 'quad'];
const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  single: 'Single',
  double: 'Double',
  triple: 'Triple',
  quad: 'Quad',
};

export default function SettingsPage({ data, setData, onOwnerReset }: SettingsPageProps) {
  const [form, setForm] = useState<PGSettings>(data.settings);
  const [saved, setSaved] = useState(false);
  const [showResetPG, setShowResetPG] = useState(false);
  const [showResetOwner, setShowResetOwner] = useState(false);

  function handleSave() {
    const newData = updateSettings(data, form);
    setData(newData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleResetPG() {
    const fresh = resetPGData();
    setData(fresh);
    setForm(fresh.settings);
    setShowResetPG(false);
  }

  function handleResetOwner() {
    resetOwnerAccount();
    onOwnerReset();
  }

  const update = (field: keyof PGSettings, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updatePricing = (type: RoomType, value: string) =>
    setForm((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, [type]: Number(value) },
    }));

  const updateAdvance = (type: RoomType, value: string) =>
    setForm((prev) => ({
      ...prev,
      advanceRules: { ...prev.advanceRules, [type]: Number(value) },
    }));

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-gold-400" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl">PG Settings</h1>
          <p className="text-navy-300 text-sm">Configure your PG property details and pricing</p>
        </div>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* PG Info */}
        <Section title="PG Information" icon={Home}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="PG Name" icon={Home} value={form.pgName} onChange={(v) => update('pgName', v)} />
            <Input label="PG Contact" icon={Phone} value={form.pgContact} onChange={(v) => update('pgContact', v)} />
          </div>
          <Input label="PG Address" icon={MapPin} value={form.pgAddress} onChange={(v) => update('pgAddress', v)} />
        </Section>

        {/* Pricing */}
        <Section title="Room Pricing" icon={IndianRupee}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {ROOM_TYPES.map((type) => (
              <div key={type}>
                <label className="block text-sm text-navy-200 mb-1.5">{ROOM_TYPE_LABEL[type]} (per month)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                  <input
                    type="number"
                    value={form.pricing[type]}
                    onChange={(e) => updatePricing(type, e.target.value)}
                    className="w-full bg-navy-700 border border-navy-600 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Advance Rules */}
        <Section title="Advance Rules" icon={IndianRupee}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {ROOM_TYPES.map((type) => (
              <div key={type}>
                <label className="block text-sm text-navy-200 mb-1.5">{ROOM_TYPE_LABEL[type]} (one-time)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                  <input
                    type="number"
                    value={form.advanceRules[type]}
                    onChange={(e) => updateAdvance(type, e.target.value)}
                    className="w-full bg-navy-700 border border-navy-600 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Check-in / Check-out */}
        <Section title="Check-in / Check-out Rules" icon={Clock}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Check-in Time" value={form.checkInTime} onChange={(v) => update('checkInTime', v)} />
            <Input label="Check-out Time" value={form.checkOutTime} onChange={(v) => update('checkOutTime', v)} />
            <Input label="Notice Period" value={form.noticePeriod} onChange={(v) => update('noticePeriod', v)} />
          </div>
        </Section>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-400 text-navy-900 font-semibold hover:shadow-lg hover:shadow-gold-500/20 transition-all"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-emerald-400 text-sm animate-fade-in">
              <CheckCircle2 className="w-4 h-4" /> Settings saved successfully
            </span>
          )}
        </div>

        {/* Danger Zone */}
        <div className="border border-red-500/20 rounded-xl p-5 bg-red-500/5">
          <h3 className="font-display font-bold text-lg text-red-400 mb-1">Danger Zone</h3>
          <p className="text-navy-300 text-sm mb-4">These actions cannot be undone. Proceed with caution.</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-navy-800/50">
              <div>
                <p className="text-white font-medium text-sm">Reset PG Demo Data</p>
                <p className="text-navy-400 text-xs mt-0.5">Resets rooms, beds, residents, payments, and settings. Owner account is preserved.</p>
              </div>
              <button
                onClick={() => setShowResetPG(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" /> Reset PG Data
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-navy-800/50">
              <div>
                <p className="text-white font-medium text-sm">Reset Owner Account</p>
                <p className="text-navy-400 text-xs mt-0.5">Permanently deletes the owner account and logs you out. All PG data is also cleared.</p>
              </div>
              <button
                onClick={() => setShowResetOwner(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4" /> Reset Owner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Reset PG */}
      {showResetPG && (
        <ConfirmDialog
          title="Reset PG Demo Data?"
          message="This will permanently delete all rooms, beds, residents, payments, and settings data. Your owner account will NOT be affected. This cannot be undone."
          confirmLabel="Yes, Reset PG Data"
          onConfirm={handleResetPG}
          onClose={() => setShowResetPG(false)}
        />
      )}

      {/* Confirm Reset Owner */}
      {showResetOwner && (
        <ConfirmDialog
          title="Reset Owner Account?"
          message="This will permanently delete your owner account AND all PG data. You will be logged out and redirected to the login page. This cannot be undone."
          confirmLabel="Yes, Delete Everything"
          danger
          onConfirm={handleResetOwner}
          onClose={() => setShowResetOwner(false)}
        />
      )}
    </div>
  );
}

function Section(props: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="glass-dark rounded-xl border border-navy-700 p-5">
      <div className="flex items-center gap-2 mb-4">
        <props.icon className="w-5 h-5 text-gold-400" />
        <h2 className="font-display font-semibold text-lg text-white">{props.title}</h2>
      </div>
      {props.children}
    </div>
  );
}

function Input(props: { label: string; icon?: React.ComponentType<{ className?: string }>; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm text-navy-200 mb-1.5">{props.label}</label>
      <div className="relative">
        {props.icon && <props.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />}
        <input
          type="text"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          className={`w-full bg-navy-700 border border-navy-600 rounded-lg py-2.5 text-white text-sm focus:outline-none focus:border-gold-400 ${
            props.icon ? 'pl-9 pr-3' : 'px-3'
          }`}
        />
      </div>
    </div>
  );
}

function ConfirmDialog(props: {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={props.onClose}
    >
      <div
        className="w-full max-w-md bg-navy-800 rounded-2xl border border-navy-600 shadow-2xl animate-scale-in p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${props.danger ? 'bg-red-500/15' : 'bg-amber-500/15'}`}>
            <AlertTriangle className={`w-6 h-6 ${props.danger ? 'text-red-400' : 'text-amber-400'}`} />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">{props.title}</h3>
            <p className="text-navy-300 text-sm mt-1">{props.message}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={props.onClose}
            className="flex-1 py-3 rounded-xl bg-navy-700 text-navy-200 font-medium hover:bg-navy-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={props.onConfirm}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              props.danger
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-amber-500 text-navy-900 hover:bg-amber-400'
            }`}
          >
            {props.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
