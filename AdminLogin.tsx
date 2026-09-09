import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, 
  Sparkles, CheckCircle2, HelpCircle, ChevronDown, ChevronUp, AlertCircle, ArrowLeft
} from 'lucide-react';
import { loginWithEmail, createAdminAccount, auth } from '../lib/firebase';
import { User } from 'firebase/auth';

interface AdminLoginProps {
  onLoginSuccess: (user: User) => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToStore
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both admin email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isRegisterMode) {
        const user = await createAdminAccount(email.trim(), password.trim());
        onLoginSuccess(user);
      } else {
        const user = await loginWithEmail(email.trim(), password.trim());
        onLoginSuccess(user);
      }
    } catch (err: any) {
      console.error('Admin Auth Error:', err);
      const code = err.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setError('Invalid credentials or user does not exist. Check your email/password or create an admin account below.');
      } else if (code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is not yet enabled in your Firebase Console. Follow the First-Time Setup instructions below.');
        setShowSetupGuide(true);
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@store.com');
    setPassword('Admin@12345');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAF3F4] via-[#FCF9F9] to-white">
      <div className="max-w-md w-full space-y-6">
        
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToStore}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-[#8E3B52] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Storefront</span>
          </button>
          <span className="text-[11px] uppercase tracking-widest text-stone-400 font-semibold">
            Style &amp; Shelf Admin
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-rose-100 p-6 sm:p-8 relative overflow-hidden">
          {/* Top Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8E3B52] via-[#B85D75] to-[#8E3B52]" />

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-[#8E3B52] flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-stone-900">
              {isRegisterMode ? 'Create Admin Account' : 'Admin Portal Login'}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              {isRegisterMode 
                ? 'Register a new administrator for Style & Shelf catalog' 
                : 'Sign in with your administrator credentials to manage products'}
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Authentication Notice</p>
                <p className="mt-0.5 text-rose-700 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <input
                  id="admin-email-input"
                  type="email"
                  required
                  placeholder="e.g. admin@store.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF6F6] border border-rose-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8E3B52]/20 focus:border-[#8E3B52] transition-colors"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={fillDemoAdmin}
                  className="text-[11px] text-[#8E3B52] hover:underline font-semibold"
                >
                  Use sample credentials
                </button>
              </div>
              <div className="relative">
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="e.g. Admin@12345"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FAF6F6] border border-rose-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8E3B52]/20 focus:border-[#8E3B52] transition-colors"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="admin-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#8E3B52] hover:bg-[#783145] active:bg-[#632737] text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>{loading ? 'Authenticating...' : isRegisterMode ? 'Create Admin & Sign In' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="mt-5 pt-4 border-t border-rose-100 flex items-center justify-between text-xs text-stone-500">
            <span>{isRegisterMode ? 'Already created an account?' : 'Need to create an admin account?'}</span>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError(null);
              }}
              className="font-semibold text-[#8E3B52] hover:underline cursor-pointer ml-2"
            >
              {isRegisterMode ? 'Sign In' : 'Register Admin'}
            </button>
          </div>
        </div>

        {/* Step 2: First-Time Firebase Console Setup Collapsible Box */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs">
          <button
            type="button"
            onClick={() => setShowSetupGuide(!showSetupGuide)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-[#8E3B52]" />
              <span>First-Time Setup (Firebase Console Guide)</span>
            </div>
            {showSetupGuide ? (
              <ChevronUp className="w-4 h-4 text-stone-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-400" />
            )}
          </button>

          {showSetupGuide && (
            <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-600 space-y-3 leading-relaxed animate-in fade-in">
              <p className="font-semibold text-stone-900">
                Because this store uses Firebase Authentication:
              </p>
              
              <ol className="list-decimal list-inside space-y-2 text-stone-600">
                <li>
                  <strong className="text-stone-800">Open Firebase Console</strong> and select your project (<code className="bg-stone-100 px-1.5 py-0.5 rounded text-[11px] font-mono">styleandshelf</code>).
                </li>
                <li>
                  Go to <strong className="text-stone-800">Authentication</strong> (in left sidebar) → Click <strong>Get Started</strong> (if not already started).
                </li>
                <li>
                  Click the <strong className="text-stone-800">Sign-in method</strong> tab → Select <strong>Email/Password</strong> → Toggle <strong>Enable</strong> to ON → Click <strong>Save</strong>.
                </li>
                <li>
                  Click the <strong className="text-stone-800">Users</strong> tab → Click <strong>Add user</strong>:
                  <div className="mt-1.5 ml-4 p-2 bg-[#FAF6F6] rounded-lg border border-rose-100 font-mono text-[11px] text-stone-700">
                    <div>Email: <span className="font-bold text-[#8E3B52]">admin@store.com</span></div>
                    <div>Password: <span className="font-bold text-[#8E3B52]">Admin@12345</span></div>
                  </div>
                </li>
                <li>
                  Return to this page, enter your admin email and password, and sign in!
                </li>
              </ol>

              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Tip: You can also use the "Register Admin" button above to create the user directly.</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
