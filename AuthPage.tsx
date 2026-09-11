import { useState, useEffect } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Building2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Home,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

import logo from '../assets/svr-logo.jpeg';

import {
  getOwnerAccount,
  saveOwnerAccount,
  setOwnerSession,
  validateEmail,
  validateMobile,
  validatePassword,
} from '@/lib/storage';

import type { OwnerAccount } from '@/types';

interface AuthPageProps {
  onLogin: () => void;
}

type Mode = 'login' | 'register' | 'success';

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login form
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register form
  const [reg, setReg] = useState({
    name: '',
    mobile: '',
    email: '',
    pgName: '',
    pgAddress: '',
    password: '',
    confirm: '',
  });

  useEffect(() => {
    setError('');
    setSuccessMsg('');
  }, [mode]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!loginId.trim() || !loginPass.trim()) {
      setError('Please enter your credentials.');
      return;
    }

    const account = getOwnerAccount();

    if (!account) {
      setError(
        'No owner account found. Please create an owner account first.'
      );
      return;
    }

    const idMatch =
      loginId.trim().toLowerCase() === account.email.toLowerCase() ||
      loginId.replace(/\s/g, '') === account.mobile;

    if (!idMatch || loginPass !== account.password) {
      setError(
        'Invalid owner credentials. Please check your email/mobile and password.'
      );
      return;
    }

    setOwnerSession(true);
    onLogin();
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!reg.name.trim()) {
      return setError('Owner name is required.');
    }

    if (!reg.mobile.trim()) {
      return setError('Mobile number is required.');
    }

    if (!validateMobile(reg.mobile)) {
      return setError(
        'Please enter a valid 10-digit Indian mobile number.'
      );
    }

    if (!reg.email.trim()) {
      return setError('Email address is required.');
    }

    if (!validateEmail(reg.email)) {
      return setError('Please enter a valid email address.');
    }

    if (!reg.pgName.trim()) {
      return setError('PG name is required.');
    }

    if (!reg.pgAddress.trim()) {
      return setError('PG address is required.');
    }

    if (!reg.password) {
      return setError('Password is required.');
    }

    if (!validatePassword(reg.password)) {
      return setError(
        'Password must be at least 6 characters long.'
      );
    }

    if (reg.password !== reg.confirm) {
      return setError('Passwords do not match.');
    }

    const account: OwnerAccount = {
      name: reg.name.trim(),
      email: reg.email.trim().toLowerCase(),
      mobile: reg.mobile.replace(/\s/g, ''),
      password: reg.password,
      pgName: reg.pgName.trim(),
      pgAddress: reg.pgAddress.trim(),
    };

    saveOwnerAccount(account);
    setSuccessMsg('Owner account created successfully.');
    setMode('success');
  }

  return (
    <div className="min-h-screen bg-navy-900 text-white flex flex-col lg:flex-row">

      {/* =====================================================
          LEFT: BRAND VISUAL
      ====================================================== */}
      <div className="relative lg:w-1/2 min-h-[300px] lg:min-h-screen overflow-hidden bg-navy-800 flex flex-col justify-between p-8 lg:p-16">

        {/* Phoenix atmosphere */}
        <img
          src={logo}
          alt=""
          aria-hidden="true"
          className="absolute -right-20 top-1/2 z-[3] w-[min(80vw,46rem)] -translate-y-1/2 opacity-20 mix-blend-screen pointer-events-none"
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 z-[2] opacity-95"
          style={{
            background:
              'radial-gradient(ellipse at 78% 35%, rgba(245,104,22,0.18) 0%, transparent 44%), radial-gradient(ellipse at 25% 85%, rgba(207,24,17,0.14) 0%, transparent 48%), linear-gradient(135deg, #0a101a 0%, #20120f 54%, #32130d 100%)',
          }}
        />

        {/* Building illustration */}
        <BuildingIllustrration />

        {/* =================================================
            SVR BRAND LOGO
        ================================================== */}
        <div className="relative z-10 animate-slide-up">

          <div className="flex items-center gap-3 mb-2">

            {/* SVR Phoenix Logo */}
            <div className="w-14 h-14 rounded-xl bg-black/20 border border-gold-400/20 flex items-center justify-center overflow-hidden shadow-lg shadow-gold-500/20">

              <img
                src={logo}
                alt="SVR Co-Living PG Logo"
                className="w-full h-full object-contain p-1"
              />

            </div>

            {/* Brand Name */}
            <div>
              <span className="font-display font-bold text-xl tracking-tight">
                SVR
              </span>

              <p className="text-gold-400 text-[10px] font-semibold tracking-wider uppercase">
                Co-Living PG
              </p>
            </div>

          </div>

        </div>

        {/* =================================================
            BRAND CONTENT
        ================================================== */}
        <div className="relative z-10 animate-slide-up delay-200">

          <h1 className="font-display font-bold text-4xl lg:text-5xl leading-tight mb-4">
            SVR{' '}
            <span className="gradient-gold">
              Co-Living
            </span>
            <br />
            PG Management
          </h1>

          <p className="text-navy-200 text-lg max-w-md leading-relaxed">
            Manage your entire PG from one place. Track rooms,
            beds, residents, and payments — all in one elegant
            dashboard built for PG owners.
          </p>

          {/* Features */}
          <div className="mt-8 flex flex-wrap gap-4">

            {[
              {
                icon: Home,
                label: '48 Rooms',
              },
              {
                icon: Building2,
                label: '6 Floors',
              },
              {
                icon: ShieldCheck,
                label: 'Owner Access',
              },
            ].map((item) => (

              <div
                key={item.label}
                className="glass rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-navy-100"
              >

                <item.icon className="w-4 h-4 text-gold-400" />

                {item.label}

              </div>

            ))}

          </div>

        </div>

        {/* Footer */}
        <div className="relative z-10 text-navy-300 text-sm animate-fade-in delay-400">

          <p>
            PG Owner Management System
          </p>

        </div>

      </div>

      {/* =====================================================
          RIGHT: AUTH FORMS
      ====================================================== */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-16 bg-navy-900">

        <div className="w-full max-w-md">

          {mode === 'success' ? (

            <SuccessView
              message={successMsg}
              onContinue={() => {
                setMode('login');
                setLoginId('');
                setLoginPass('');
              }}
            />

          ) : mode === 'login' ? (

            <LoginForm
              loginId={loginId}
              setLoginId={setLoginId}
              loginPass={loginPass}
              setLoginPass={setLoginPass}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              error={error}
              onSubmit={handleLogin}
              onRegister={() => setMode('register')}
            />

          ) : (

            <RegisterForm
              reg={reg}
              setReg={setReg}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirm={showConfirm}
              setShowConfirm={setShowConfirm}
              error={error}
              onSubmit={handleRegister}
              onBack={() => setMode('login')}
            />

          )}

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   BUILDING ILLUSTRATION
========================================================= */

function BuildingIllustrration() {
  return (
    <div className="absolute right-0 bottom-0 opacity-30 pointer-events-none">

      <svg
        width="400"
        height="500"
        viewBox="0 0 400 500"
        fill="none"
        className="animate-float"
      >

        {/* Main building */}
        <rect
          x="80"
          y="80"
          width="240"
          height="380"
          rx="4"
          fill="#0f2944"
          stroke="#c8a45c"
          strokeWidth="1.5"
          opacity="0.6"
        />

        {/* Side building */}
        <rect
          x="320"
          y="180"
          width="60"
          height="280"
          rx="3"
          fill="#0a1628"
          stroke="#c8a45c"
          strokeWidth="1"
          opacity="0.4"
        />

        {/* Windows grid - main building */}
        {Array.from({ length: 10 }).map((_, row) =>
          Array.from({ length: 6 }).map((_, col) => {

            const lit = Math.random() > 0.5;

            return (
              <rect
                key={`${row}-${col}`}
                x={100 + col * 34}
                y={100 + row * 34}
                width={20}
                height={22}
                rx={2}
                fill={lit ? '#c8a45c' : '#1e4d8b'}
                opacity={lit ? 0.4 : 0.2}
              />
            );

          })
        )}

        {/* Side building windows */}
        {Array.from({ length: 8 }).map((_, row) =>
          Array.from({ length: 2 }).map((_, col) => (

            <rect
              key={`side-${row}-${col}`}
              x={332 + col * 22}
              y={200 + row * 32}
              width={12}
              height={18}
              rx={1.5}
              fill="#1e4d8b"
              opacity={0.2}
            />

          ))
        )}

        {/* Ground */}
        <rect
          x="0"
          y="460"
          width="400"
          height="40"
          fill="#0a1628"
        />

        {/* Door */}
        <rect
          x="180"
          y="420"
          width="40"
          height="40"
          rx="2"
          fill="#c8a45c"
          opacity="0.3"
        />

      </svg>

    </div>
  );
}


/* =========================================================
   SUCCESS VIEW
========================================================= */

function SuccessView({
  message,
  onContinue,
}: {
  message: string;
  onContinue: () => void;
}) {
  return (
    <div className="text-center animate-scale-in">

      <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">

        <CheckCircle2 className="w-10 h-10 text-green-400" />

      </div>

      <h2 className="font-display font-bold text-2xl text-white mb-3">
        Success!
      </h2>

      <p className="text-navy-200 mb-8">
        {message}
      </p>

      <button
        onClick={onContinue}
        className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-navy-900 font-semibold py-3.5 rounded-xl hover:shadow-lg hover:shadow-gold-500/30 transition-all flex items-center justify-center gap-2"
      >

        Continue to Login

        <ArrowRight className="w-4 h-4" />

      </button>

    </div>
  );
}


/* =========================================================
   LOGIN FORM
========================================================= */

function LoginForm(props: {
  loginId: string;
  setLoginId: (v: string) => void;
  loginPass: string;
  setLoginPass: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  onRegister: () => void;
}) {

  const [forgotMsg, setForgotMsg] = useState(false);

  return (
    <div className="animate-slide-up">

      {/* Login heading */}
      <div className="mb-8">

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-300 text-xs font-medium mb-4">

          <Lock className="w-3 h-3" />

          Secure Owner Access

        </div>

        <h2 className="font-display font-bold text-3xl text-white mb-2">
          Owner Login
        </h2>

        <p className="text-navy-300 text-sm">
          Sign in to manage your PG property
        </p>

      </div>

      {/* Login Form */}
      <form
        onSubmit={props.onSubmit}
        className="space-y-5"
      >

        {/* Email / Mobile */}
        <div>

          <label className="block text-sm font-medium text-navy-100 mb-2">
            Email or Mobile Number
          </label>

          <div className="relative">

            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300" />

            <input
              type="text"
              value={props.loginId}
              onChange={(e) =>
                props.setLoginId(e.target.value)
              }
              placeholder="you@example.com or 9876543210"
              className="w-full bg-navy-800/50 border border-navy-600 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-navy-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
            />

          </div>

        </div>

        {/* Password */}
        <div>

          <label className="block text-sm font-medium text-navy-100 mb-2">
            Password
          </label>

          <div className="relative">

            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300" />

            <input
              type={
                props.showPassword
                  ? 'text'
                  : 'password'
              }
              value={props.loginPass}
              onChange={(e) =>
                props.setLoginPass(e.target.value)
              }
              placeholder="Enter your password"
              className="w-full bg-navy-800/50 border border-navy-600 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-navy-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
            />

            <button
              type="button"
              onClick={() =>
                props.setShowPassword(
                  !props.showPassword
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-300 hover:text-gold-400 transition-colors"
            >

              {props.showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}

            </button>

          </div>

        </div>

        {/* Forgot Password */}
        <div className="flex justify-end">

          <button
            type="button"
            onClick={() => setForgotMsg(true)}
            className="text-sm text-gold-400 hover:text-gold-300 transition-colors"
          >
            Forgot Password?
          </button>

        </div>

        {/* Forgot Password Message */}
        {forgotMsg && (
          <div className="flex items-start gap-2 text-sm text-navy-200 bg-navy-700/40 rounded-lg p-3 animate-fade-in">

            <AlertCircle className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />

            <span>
              Password recovery is not connected in this demo.
              Please use the demo owner account or reset the demo data.
            </span>

          </div>
        )}

        {/* Login Error */}
        {props.error && (
          <div className="flex items-start gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3 animate-fade-in">

            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />

            <span>
              {props.error}
            </span>

          </div>
        )}

        {/* Login Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-navy-900 font-semibold py-3.5 rounded-xl hover:shadow-lg hover:shadow-gold-500/30 transition-all flex items-center justify-center gap-2 group"
        >

          Login

          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />

        </button>

      </form>

      {/* Create Owner Account */}
      <div className="mt-8 pt-6 border-t border-navy-700 text-center">

        <p className="text-navy-300 text-sm">

          New Owner?{' '}

          <button
            onClick={props.onRegister}
            className="text-gold-400 hover:text-gold-300 font-semibold transition-colors"
          >
            Create Owner Account
          </button>

        </p>

      </div>

    </div>
  );
}


/* =========================================================
   REGISTER FORM
========================================================= */

function RegisterForm(props: {
  reg: {
    name: string;
    mobile: string;
    email: string;
    pgName: string;
    pgAddress: string;
    password: string;
    confirm: string;
  };

  setReg: React.Dispatch<
    React.SetStateAction<{
      name: string;
      mobile: string;
      email: string;
      pgName: string;
      pgAddress: string;
      password: string;
      confirm: string;
    }>
  >;

  showPassword: boolean;
  setShowPassword: (v: boolean) => void;

  showConfirm: boolean;
  setShowConfirm: (v: boolean) => void;

  error: string;

  onSubmit: (e: React.FormEvent) => void;

  onBack: () => void;
}) {

  const { reg, setReg } = props;

  const update = (
    field: keyof typeof reg,
    value: string
  ) =>
    setReg((prev) => ({
      ...prev,
      [field]: value,
    }));

  return (
    <div className="animate-slide-in-right">

      {/* Register Header */}
      <div className="mb-6">

        <button
          onClick={props.onBack}
          className="flex items-center gap-2 text-navy-300 hover:text-gold-400 transition-colors text-sm mb-4"
        >

          <ArrowLeft className="w-4 h-4" />

          Back to Login

        </button>

        <h2 className="font-display font-bold text-3xl text-white mb-2">
          Create Owner Account
        </h2>

        <p className="text-navy-300 text-sm">
          Register as the PG owner to get started
        </p>

      </div>

      {/* Section title */}
      <div className="mb-5">

        <h3 className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-3">
          PG Owner Details
        </h3>

      </div>

      {/* Register Form */}
      <form
        onSubmit={props.onSubmit}
        className="space-y-4"
      >

        {/* Owner Name */}
        <Field
          icon={User}
          label="Owner Name"
          value={reg.name}
          onChange={(v) => update('name', v)}
          placeholder="John Doe"
          required
        />

        {/* Mobile */}
        <Field
          icon={Phone}
          label="Mobile Number"
          value={reg.mobile}
          onChange={(v) => update('mobile', v.replace(/\D/g, '').slice(0, 10))}
          placeholder="9876543210"
          maxLength={10}
          inputMode="numeric"
          required
        />

        {/* Email */}
        <Field
          icon={Mail}
          label="Email Address"
          value={reg.email}
          onChange={(v) => update('email', v)}
          placeholder="you@example.com"
          required
        />

        {/* PG Name */}
        <Field
          icon={Home}
          label="PG Name"
          value={reg.pgName}
          onChange={(v) => update('pgName', v)}
          placeholder="SVR Co-Living PG"
          required
        />

        {/* PG Address */}
        <Field
          icon={MapPin}
          label="PG Address"
          value={reg.pgAddress}
          onChange={(v) => update('pgAddress', v)}
          placeholder="123 MG Road, Bengaluru"
          required
        />

        {/* Password */}
        <div>

          <label className="block text-sm font-medium text-navy-100 mb-2">
            Password
          </label>

          <div className="relative">

            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300" />

            <input
              type={
                props.showPassword
                  ? 'text'
                  : 'password'
              }
              value={reg.password}
              onChange={(e) =>
                update('password', e.target.value)
              }
              placeholder="At least 6 characters"
              className="w-full bg-navy-800/50 border border-navy-600 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-navy-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
            />

            <button
              type="button"
              onClick={() =>
                props.setShowPassword(
                  !props.showPassword
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-300 hover:text-gold-400 transition-colors"
            >

              {props.showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}

            </button>

          </div>

        </div>

        {/* Confirm Password */}
        <div>

          <label className="block text-sm font-medium text-navy-100 mb-2">
            Confirm Password
          </label>

          <div className="relative">

            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300" />

            <input
              type={
                props.showConfirm
                  ? 'text'
                  : 'password'
              }
              value={reg.confirm}
              onChange={(e) =>
                update('confirm', e.target.value)
              }
              placeholder="Re-enter password"
              className="w-full bg-navy-800/50 border border-navy-600 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-navy-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
            />

            <button
              type="button"
              onClick={() =>
                props.setShowConfirm(
                  !props.showConfirm
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-300 hover:text-gold-400 transition-colors"
            >

              {props.showConfirm ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}

            </button>

          </div>

        </div>

        {/* Error */}
        {props.error && (
          <div className="flex items-start gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3 animate-fade-in">

            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />

            <span>
              {props.error}
            </span>

          </div>
        )}

        {/* Create Account */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-navy-900 font-semibold py-3.5 rounded-xl hover:shadow-lg hover:shadow-gold-500/30 transition-all flex items-center justify-center gap-2"
        >

          Create Owner Account

          <CheckCircle2 className="w-4 h-4" />

        </button>

      </form>

    </div>
  );
}


/* =========================================================
   REUSABLE FIELD
========================================================= */

function Field(props: {
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

      <label className="block text-sm font-medium text-navy-100 mb-2">

        {props.label}

        {props.required && (
          <span className="text-gold-400 ml-1">
            *
          </span>
        )}

      </label>

      <div className="relative">

        <props.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300" />

        <input
          type="text"
          value={props.value}
          onChange={(e) =>
            props.onChange(e.target.value)
          }
          maxLength={props.maxLength}
          inputMode={props.inputMode}
          placeholder={props.placeholder}
          className="w-full bg-navy-800/50 border border-navy-600 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-navy-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
        />

      </div>

    </div>
  );
}