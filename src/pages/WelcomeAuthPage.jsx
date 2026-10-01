import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Heart, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Building, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Languages, 
  RefreshCw,
  Shield,
  KeyRound,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import DocCareLogo from '../components/DocCareLogo';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import RomanUrduInputAssist from '../components/RomanUrduInputAssist';

export default function WelcomeAuthPage({ initialView = 'welcome', initialRole = null, onAuthSuccess }) {
  const { login, register, loginWithGoogle, forgotPassword, resetPassword } = useAuth();
  const { lang, toggleLang, isRTL } = useLanguage();

  // Screen State: 'welcome' | 'doctor-login' | 'patient-login' | 'doctor-register' | 'patient-register' | 'forgot-password' | 'reset-password'
  const [view, setView] = useState(() => {
    if (initialView === 'login' && initialRole === 'doctor') return 'doctor-login';
    if (initialView === 'login' && initialRole === 'patient') return 'patient-login';
    if (initialView === 'register' && initialRole === 'doctor') return 'doctor-register';
    if (initialView === 'register' && initialRole === 'patient') return 'patient-register';
    return initialView || 'welcome';
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Form Fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [fullNameUrdu, setFullNameUrdu] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [city, setCity] = useState('Lahore');
  const [specialty, setSpecialty] = useState('General Physician & Consultant');
  const [pmdcNumber, setPmdcNumber] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const isDoctorMode = view.startsWith('doctor');
  const isPatientMode = view.startsWith('patient');

  // Handle URL hash or history changes
  const navigateTo = (newView, role = null) => {
    setError(null);
    setMessage(null);
    setView(newView);
    if (newView === 'doctor-login') {
      window.history.pushState({}, '', '/login/doctor');
    } else if (newView === 'patient-login') {
      window.history.pushState({}, '', '/login/patient');
    } else if (newView === 'welcome') {
      window.history.pushState({}, '', '/');
    }
  };

  // Quick Demo Auto-Fill
  const handleQuickDemoFill = (roleType) => {
    setError(null);
    setMessage(null);
    if (roleType === 'doctor') {
      setIdentifier('dr.ayesha@doccare.pk');
      setPassword('doctor123');
    } else {
      setIdentifier('patient@doccare.pk');
      setPassword('patient123');
    }
  };

  // Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const role = isDoctorMode ? 'doctor' : 'patient';
    const res = await login({
      identifier: identifier.trim(),
      password,
      role
    });

    setLoading(false);
    if (res.success) {
      setMessage(`Welcome back, ${res.user.name}! Accessing ${role === 'doctor' ? 'Doctor Portal' : 'Patient Portal'}...`);
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(role, res.user);
      }, 500);
    } else {
      setError(res.error || 'Invalid credentials. Please verify your email and password.');
    }
  };

  // Registration Submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const role = isDoctorMode ? 'doctor' : 'patient';
    const payload = {
      role,
      name: fullName.trim(),
      nameUrdu: fullNameUrdu.trim(),
      email: identifier.trim(),
      phone: mobileNumber.trim(),
      password,
      city,
      ...(role === 'doctor' ? {
        specialization: specialty,
        pmdcNumber: pmdcNumber.trim(),
        clinicName: clinicName.trim()
      } : {})
    };

    const res = await register(payload);
    setLoading(false);

    if (res.success) {
      setMessage(`${role === 'doctor' ? 'Doctor practice' : 'Patient account'} registered successfully!`);
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(role, res.user);
      }, 600);
    } else {
      setError(res.error || 'Registration failed. Please check your information.');
    }
  };

  // Google OAuth Simulation
  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    const role = isDoctorMode ? 'doctor' : 'patient';
    const mockEmail = role === 'doctor' 
      ? `dr.google.${Date.now().toString().slice(-4)}@gmail.com` 
      : `patient.google.${Date.now().toString().slice(-4)}@gmail.com`;
    const mockName = role === 'doctor' ? 'Dr. Tariq Google' : 'Zubair Google';

    const res = await loginWithGoogle({
      googleId: `google-uid-${Date.now()}`,
      email: mockEmail,
      name: mockName,
      avatar: role === 'doctor'
        ? "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400"
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(mockName)}`,
      role,
      extraData: {
        city: 'Lahore',
        phone: '+92 300 9876543',
        specialization: 'Consultant Specialist',
        clinicName: 'DocCare Clinical Practice'
      }
    });

    setLoading(false);
    if (res.success) {
      setMessage(`Authenticated with Google as ${res.user.name}! Accessing portal...`);
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(role, res.user);
      }, 500);
    } else {
      setError(res.error || 'Google authentication failed.');
    }
  };

  // Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const res = await forgotPassword({
      email: resetEmail.trim(),
      role: isDoctorMode ? 'doctor' : 'patient'
    });

    setLoading(false);
    if (res.success) {
      setMessage(res.message || 'Password reset link sent to your email.');
      if (res.demoResetToken) {
        setResetToken(res.demoResetToken);
        setView(isDoctorMode ? 'doctor-reset' : 'patient-reset');
      }
    } else {
      setError(res.error || 'Unable to find an account with that email.');
    }
  };

  // Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const res = await resetPassword({
      email: resetEmail.trim(),
      token: resetToken.trim(),
      newPassword,
      role: isDoctorMode ? 'doctor' : 'patient'
    });

    setLoading(false);
    if (res.success) {
      setMessage('Password updated successfully! You can now log in.');
      setTimeout(() => {
        setView(isDoctorMode ? 'doctor-login' : 'patient-login');
      }, 1000);
    } else {
      setError(res.error || 'Failed to reset password. Please verify your token.');
    }
  };

  return (
    <div 
      dir={isRTL ? "rtl" : "ltr"}
      className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between relative transition-colors ${
        isRTL ? 'urdu-text' : 'font-sans'
      }`}
    >
      {/* Background Soft Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Simple Utility Bar (Language Switcher) */}
      <header className="w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <DocCareLogo variant="compact" size="sm" showTagline={false} animated={true} />
        </div>

        <button
          onClick={toggleLang}
          className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-xs"
          title="Switch English / اردو"
        >
          <Languages className="w-3.5 h-3.5 text-teal-600" />
          <span>{lang === 'en' ? 'اردو' : 'English'}</span>
        </button>
      </header>

      {/* Main Centered Authentication Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 relative z-10 w-full">
        <div className="w-full max-w-md">

          {/* ================================================= */}
          {/* SCREEN 1: CLEAN WELCOME SELECTION                 */}
          {/* ================================================= */}
          {view === 'welcome' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 sm:p-10 shadow-xl border border-slate-200/80 dark:border-slate-800 text-center space-y-6 animate-fade-in">
              
              {/* Logo & Headline */}
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900/60 shadow-xs mb-1">
                  <DocCareLogo variant="icon" size="lg" animated={true} />
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Welcome to DocCare
                </h1>
                
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs leading-relaxed">
                  "Your Practice. Your Patients. One Simple Record."
                </p>
              </div>

              {/* Selection Prompt */}
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  {isRTL ? "جاری رکھنے کا طریقہ منتخب کریں:" : "Choose how you want to continue:"}
                </p>

                {/* 2 Big Primary Login Options */}
                <div className="space-y-3.5">
                  {/* Doctor Login Button */}
                  <button
                    onClick={() => navigateTo('doctor-login')}
                    className="w-full min-h-[52px] py-3.5 px-5 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-extrabold text-sm sm:text-base shadow-md transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-500/40 flex items-center justify-center">
                        <Stethoscope className="w-4 h-4 text-white" />
                      </div>
                      <span>{isRTL ? "ڈاکٹر لاگ اِن" : "Doctor Login"}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-teal-200 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {/* Patient Login Button */}
                  <button
                    onClick={() => navigateTo('patient-login')}
                    className="w-full min-h-[52px] py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-extrabold text-sm sm:text-base shadow-md transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/40 flex items-center justify-center">
                        <Heart className="w-4 h-4 text-white fill-white" />
                      </div>
                      <span>{isRTL ? "مریض لاگ اِن" : "Patient Login"}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Minimal Medical Security Assurance */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>Encrypted & Compliant Medical Platform</span>
              </div>

            </div>
          )}

          {/* ================================================= */}
          {/* SCREEN 2: DOCTOR / PATIENT LOGIN                  */}
          {/* ================================================= */}
          {(view === 'doctor-login' || view === 'patient-login') && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 sm:p-9 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-5 animate-fade-in">
              
              {/* Top Row: Back button & Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateTo('welcome')}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                  <span>{isRTL ? "واپس" : "Back"}</span>
                </button>

                <div className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 uppercase tracking-wider ${
                  isDoctorMode 
                    ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800' 
                    : 'bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
                }`}>
                  {isDoctorMode ? <Stethoscope className="w-3.5 h-3.5 text-teal-600" /> : <Heart className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />}
                  <span>{isDoctorMode ? 'Doctor Portal' : 'Patient Portal'}</span>
                </div>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {isDoctorMode ? (isRTL ? "ڈاکٹر لاگ اِن" : "Doctor Login") : (isRTL ? "مریض لاگ اِن" : "Patient Login")}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {isDoctorMode 
                    ? (isRTL ? "اپنے کلینکل پریکٹس ڈیش بورڈ میں داخل ہوں۔" : "Sign in to manage prescriptions, patients & clinic practice.")
                    : (isRTL ? "ڈاکٹر تلاش کریں اور اپنی اپائنٹمنٹس کا جائزہ لیں۔" : "Sign in to find doctors, schedule visits & manage bookings.")}
                </p>
              </div>

              {/* Quick Demo Credentials Autofill Pill */}
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium">
                  {isDoctorMode ? "Demo: dr.ayesha@doccare.pk" : "Demo: patient@doccare.pk"}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill(isDoctorMode ? 'doctor' : 'patient')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 font-bold text-[11px] shadow-xs border border-slate-200 dark:border-slate-700 hover:bg-teal-50 transition-colors"
                >
                  Auto-Fill
                </button>
              </div>

              {/* Notifications */}
              {error && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-800 dark:text-rose-200 flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-900 text-xs font-semibold text-teal-800 dark:text-teal-200 flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRTL ? "ای میل یا فون نمبر" : "Email or Phone"}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder={isDoctorMode ? "doctor@doccare.pk" : "patient@doccare.pk"}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isRTL ? "پاس ورڈ" : "Password"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setView('forgot-password')}
                      className="text-[11px] font-bold text-teal-600 hover:text-teal-700 hover:underline"
                    >
                      {isRTL ? "پاس ورڈ بھول گئے؟" : "Forgot Password?"}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full min-h-[48px] py-3 rounded-2xl font-extrabold text-xs sm:text-sm text-white shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                    isDoctorMode 
                      ? 'bg-teal-600 hover:bg-teal-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{isRTL ? "لاگ اِن کریں" : "Login"}</span>
                      <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
              </form>

              {/* Google OAuth Option */}
              <div className="space-y-3 pt-2">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                  <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase">
                    {isRTL ? "یا" : "Or"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full min-h-[46px] py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isRTL ? "گوگل کے ذریعے جاری رکھیں" : "Continue with Google"}</span>
                </button>
              </div>

              {/* Switch to Register */}
              <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                <span>{isRTL ? "اکاؤنٹ نہیں ہے؟ " : "Don't have an account? "}</span>
                <button
                  type="button"
                  onClick={() => navigateTo(isDoctorMode ? 'doctor-register' : 'patient-register')}
                  className="font-bold text-teal-600 hover:text-teal-700 hover:underline"
                >
                  {isDoctorMode ? (isRTL ? "ڈاکٹر اکاؤنٹ بنائیں" : "Create Doctor Account") : (isRTL ? "مریض اکاؤنٹ بنائیں" : "Create Patient Account")}
                </button>
              </div>

            </div>
          )}

          {/* ================================================= */}
          {/* SCREEN 3: DOCTOR / PATIENT REGISTRATION           */}
          {/* ================================================= */}
          {(view === 'doctor-register' || view === 'patient-register') && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 sm:p-9 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-5 animate-fade-in">
              
              {/* Back to Login */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateTo(isDoctorMode ? 'doctor-login' : 'patient-login')}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                  <span>{isRTL ? "لاگ اِن پر واپس" : "Back to Login"}</span>
                </button>

                <span className="text-[11px] font-bold text-teal-600 uppercase">
                  {isDoctorMode ? "Doctor Registration" : "Patient Registration"}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {isDoctorMode ? (isRTL ? "نیا ڈاکٹر اکاؤنٹ بنائیں" : "Create Doctor Account") : (isRTL ? "نیا مریض اکاؤنٹ بنائیں" : "Create Patient Account")}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isDoctorMode 
                    ? "Register your clinical practice to start prescribing & managing appointments." 
                    : "Register to book appointments and consult verified specialists."}
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 text-xs font-semibold text-teal-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRTL ? "مکمل نام" : "Full Name"} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isDoctorMode ? "Dr. Muhammad Tariq" : "Kamran Ali"}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-semibold"
                  />
                  <RomanUrduInputAssist
                    value={fullName}
                    onApply={(val) => setFullNameUrdu(val)}
                    isUrduMode={isRTL}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="user@doccare.pk"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0300-1234567"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono font-semibold"
                    />
                  </div>
                </div>

                {isDoctorMode && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          PMDC Registration # *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 54892-P"
                          value={pmdcNumber}
                          onChange={(e) => setPmdcNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Clinic / Hospital Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Tariq Medical Center"
                          value={clinicName}
                          onChange={(e) => setClinicName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Specialty / Designation *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Consultant Cardiologist & Physician"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-semibold"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full min-h-[48px] py-3 rounded-2xl font-extrabold text-xs sm:text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                    isDoctorMode ? 'bg-teal-600 hover:bg-teal-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Complete Registration"}
                </button>
              </form>

            </div>
          )}

          {/* ================================================= */}
          {/* SCREEN 4: FORGOT PASSWORD                         */}
          {/* ================================================= */}
          {view === 'forgot-password' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 sm:p-9 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
              <button
                onClick={() => navigateTo('welcome')}
                className="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Reset Password
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your account email to receive a secure password recovery code.
                </p>
              </div>

              {error && <div className="p-3 rounded-2xl bg-rose-50 text-rose-800 text-xs font-semibold">{error}</div>}
              {message && <div className="p-3 rounded-2xl bg-teal-50 text-teal-800 text-xs font-semibold">{message}</div>}

              <form onSubmit={handleForgotPassword} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Account Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@doccare.pk"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[46px] py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Send Reset Code"}
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* Minimal Clean Footer */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-4 text-center text-xs text-slate-400 font-medium relative z-10">
        DocCare Pakistan • Healthcare Practice & Patient Discovery Platform
      </footer>
    </div>
  );
}
