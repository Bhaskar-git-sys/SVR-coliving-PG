import { useState } from 'react';
import { Lock, User, Eye, EyeOff, ArrowRight, Building2, ShieldCheck } from 'lucide-react';
import { authenticate } from '@/lib/auth';
import logo from '../assets/svr-logo.jpeg';

export default function AuthPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  function submit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    if (!authenticate(username, password)) { setError('Invalid username or password.'); return; }
    onLogin();
  }
  return <div className="min-h-screen bg-navy-900 text-white flex flex-col lg:flex-row">
    <section className="relative lg:w-1/2 min-h-[300px] lg:min-h-screen overflow-hidden bg-navy-800 p-8 lg:p-16 flex flex-col justify-between">
      <img src={logo} alt="" aria-hidden="true" className="absolute -right-20 top-1/2 w-[min(80vw,46rem)] -translate-y-1/2 opacity-20 mix-blend-screen pointer-events-none" />
      <div className="relative z-10 flex items-center gap-3"><img src={logo} alt="SVR Co-Living PG" className="w-14 h-14 rounded-xl object-contain bg-black/20 p-1" /><div><b className="font-display text-xl">SVR</b><p className="text-gold-400 text-[10px] uppercase tracking-wider">Co-Living PG</p></div></div>
      <div className="relative z-10"><h1 className="font-display font-bold text-4xl lg:text-5xl leading-tight mb-4">SVR <span className="gradient-gold">Co-Living</span><br/>PG Management</h1><p className="text-navy-200 text-lg max-w-md">Manage rooms, residents, payments, and revenue from one elegant dashboard.</p><div className="mt-8 flex gap-4"><span className="glass rounded-xl px-4 py-2.5 flex gap-2 text-sm"><Building2 className="w-4 h-4 text-gold-400"/>48 Rooms</span><span className="glass rounded-xl px-4 py-2.5 flex gap-2 text-sm"><ShieldCheck className="w-4 h-4 text-gold-400"/>Secure access</span></div></div>
      <p className="relative z-10 text-navy-300 text-sm">PG Owner Management System</p>
    </section>
    <section className="lg:w-1/2 flex items-center justify-center p-6 lg:p-16"><form onSubmit={submit} className="w-full max-w-md space-y-5"><div className="mb-8"><div className="inline-flex gap-2 px-3 py-1.5 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-300 text-xs"><Lock className="w-3 h-3"/> Secure Login</div><h2 className="font-display font-bold text-3xl mt-4">Welcome back</h2><p className="text-navy-300 text-sm mt-2">Sign in to continue to SVR Co-Living PG</p></div><label className="block text-sm text-navy-100">Username<div className="relative mt-2"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300"/><input autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} className="w-full bg-navy-800/50 border border-navy-600 rounded-xl pl-12 pr-4 py-3.5 text-white" placeholder="Enter username"/></div></label><label className="block text-sm text-navy-100">Password<div className="relative mt-2"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300"/><input autoComplete="current-password" type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-navy-800/50 border border-navy-600 rounded-xl pl-12 pr-12 py-3.5 text-white" placeholder="Enter password"/><button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-300">{showPassword?<EyeOff className="w-5 h-5"/>:<Eye className="w-5 h-5"/>}</button></div></label>{error&&<p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}<button className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-navy-900 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2">Login <ArrowRight className="w-4 h-4"/></button></form></section>
  </div>;
}
