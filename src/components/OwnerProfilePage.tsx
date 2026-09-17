import { useState } from 'react';
import {
  UserCircle,
  Save,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Mail,
  Phone,
  Home,
  MapPin,
  User as UserIcon,
  KeyRound,
} from 'lucide-react';
import type { OwnerAccount } from '@/types';
import { updateOwnerAccount, validateEmail, validateMobile, validatePassword } from '@/lib/storage';

interface OwnerProfilePageProps {
  owner: OwnerAccount;
  setOwner: (o: OwnerAccount) => void;
}

export default function OwnerProfilePage({ owner, setOwner }: OwnerProfilePageProps) {
  const [form, setForm] = useState({
    name: owner.name,
    mobile: owner.mobile,
    email: owner.email,
    pgName: owner.pgName,
    pgAddress: owner.pgAddress,
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Password form
  const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, next: false, confirm: false });
  const [passError, setPassError] = useState('');
  const [passSaved, setPassSaved] = useState(false);

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Name is required.');
    if (!form.mobile.trim()) return setError('Mobile is required.');
    if (!validateMobile(form.mobile)) return setError('Invalid mobile number.');
    if (!form.email.trim()) return setError('Email is required.');
    if (!validateEmail(form.email)) return setError('Invalid email address.');

    const updated = updateOwnerAccount({
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim().toLowerCase(),
      pgName: form.pgName.trim(),
      pgAddress: form.pgAddress.trim(),
    });
    if (updated) {
      setOwner(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassError('');
    if (!passForm.current) return setPassError('Current password is required.');
    if (passForm.current !== owner.password) return setPassError('Current password is incorrect.');
    if (!validatePassword(passForm.next)) return setPassError('New password must be at least 6 characters.');
    if (passForm.next !== passForm.confirm) return setPassError('Passwords do not match.');

    const updated = updateOwnerAccount({ password: passForm.next });
    if (updated) {
      setOwner(updated);
      setPassForm({ current: '', next: '', confirm: '' });
      setPassSaved(true);
      setTimeout(() => setPassSaved(false), 2000);
    }
  }

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center">
          <UserCircle className="w-5 h-5 text-gold-400" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl">Owner Profile</h1>
          <p className="text-navy-300 text-sm">Manage your account and PG details</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Info */}
        <div className="glass-dark rounded-xl border border-navy-700 p-6">
          <h2 className="font-display font-semibold text-lg text-white mb-4">Account Information</h2>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center border-2 border-gold-400/30">
              <UserCircle className="w-8 h-8 text-gold-400" />
            </div>
            <div>
              <p className="font-semibold text-white text-lg">{owner.name}</p>
              <p className="text-navy-300 text-sm">{owner.pgName}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field icon={UserIcon} label="Owner Name" value={form.name} onChange={(v) => update('name', v)} />
              <Field icon={Phone} label="Mobile Number" value={form.mobile} onChange={(v) => update('mobile', v)} />
            </div>
            <Field icon={Mail} label="Email Address" value={form.email} onChange={(v) => update('email', v)} />
            <Field icon={Home} label="PG Name" value={form.pgName} onChange={(v) => update('pgName', v)} />
            <Field icon={MapPin} label="PG Address" value={form.pgAddress} onChange={(v) => update('pgAddress', v)} />

            {error && (
              <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-400 text-navy-900 font-semibold hover:shadow-lg hover:shadow-gold-500/20 transition-all"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-emerald-400 text-sm animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" /> Profile updated
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="glass-dark rounded-xl border border-navy-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-gold-400" />
            <h2 className="font-display font-semibold text-lg text-white">Change Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <PasswordField
              label="Current Password"
              value={passForm.current}
              onChange={(v) => setPassForm((prev) => ({ ...prev, current: v }))}
              show={showPass.current}
              onToggle={() => setShowPass((prev) => ({ ...prev, current: !prev.current }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PasswordField
                label="New Password"
                value={passForm.next}
                onChange={(v) => setPassForm((prev) => ({ ...prev, next: v }))}
                show={showPass.next}
                onToggle={() => setShowPass((prev) => ({ ...prev, next: !prev.next }))}
              />
              <PasswordField
                label="Confirm New Password"
                value={passForm.confirm}
                onChange={(v) => setPassForm((prev) => ({ ...prev, confirm: v }))}
                show={showPass.confirm}
                onToggle={() => setShowPass((prev) => ({ ...prev, confirm: !prev.confirm }))}
              />
            </div>

            {passError && (
              <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{passError}</div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-400 text-navy-900 font-semibold hover:shadow-lg hover:shadow-gold-500/20 transition-all"
              >
                <KeyRound className="w-4 h-4" /> Update Password
              </button>
              {passSaved && (
                <span className="flex items-center gap-1.5 text-emerald-400 text-sm animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" /> Password updated
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field(props: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-navy-200 mb-1.5">{props.label}</label>
      <div className="relative">
        <props.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
        <input
          type="text"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          className="w-full bg-navy-700 border border-navy-600 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
        />
      </div>
    </div>
  );
}

function PasswordField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="block text-sm text-navy-200 mb-1.5">{props.label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
        <input
          type={props.show ? 'text' : 'password'}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-navy-700 border border-navy-600 rounded-lg pl-9 pr-10 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
        />
        <button
          type="button"
          onClick={props.onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-gold-400 transition-colors"
        >
          {props.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
