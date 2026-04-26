import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LogIn, 
  Mail, 
  Lock, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  Zap,
  Globe,
  KeyRound,
  ArrowLeft,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useGoogleLogin } from '@react-oauth/google';
import { QRCodeSVG } from 'qrcode.react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, verifyTwoFactor, googleLogin } = useUser();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 2FA State
  const [twoFactorStep, setTwoFactorStep] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [totpCode, setTotpCode] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef([]);

  // Redirect after login
  const from = location.state?.from?.pathname || "/";

  // Auto-focus first TOTP input when 2FA step is shown
  useEffect(() => {
    if (twoFactorStep && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [twoFactorStep]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else if (result.twoFactorRequired) {
      // Transition to 2FA step
      setTwoFactorStep(true);
      setTwoFactorSetup(result.twoFactorSetup || false);
      setQrCodeUrl(result.qrCodeUrl || '');
      setTempToken(result.tempToken);
      setIsLoading(false);
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  const handleTotpChange = (index, value) => {
    // Only allow numeric input
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...totpCode];
    newCode[index] = value;
    setTotpCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleTotpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !totpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleTotpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newCode = [...totpCode];
      for (let i = 0; i < 6; i++) {
        newCode[i] = pasted[i] || '';
      }
      setTotpCode(newCode);
      const nextEmpty = Math.min(pasted.length, 5);
      inputRefs.current[nextEmpty]?.focus();
    }
  };

  const handleVerify2FA = async () => {
    const code = totpCode.join('');
    if (code.length !== 6) {
      setError('Please enter a complete 6-digit code.');
      return;
    }

    setVerifying(true);
    setError('');

    const result = await verifyTwoFactor(tempToken, code);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
      setTotpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setVerifying(false);
    }
  };

  const handleBack = () => {
    setTwoFactorStep(false);
    setTwoFactorSetup(false);
    setQrCodeUrl('');
    setTempToken('');
    setTotpCode(['', '', '', '', '', '']);
    setError('');
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError('');
      const result = await googleLogin(tokenResponse.access_token);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message);
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Google Login was unsuccessful');
    }
  });

  const quickSelect = (e, p) => {
    setEmail(e);
    setPassword(p);
  };

  // ── 2FA Verification Screen ──────────────────────────────────────────
  if (twoFactorStep) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: '#11212D' }}>
        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(28, 79, 120, 0.15)' }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)' }} />
        </div>

        <div 
          className="w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden relative z-10 border"
          style={{ backgroundColor: '#11212D', borderColor: '#253745' }}
        >
          <div className="p-10 md:p-12">
            {/* Back Button */}
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 mb-8 text-sm font-bold transition-colors group"
              style={{ color: '#4A5C6A' }}
              onMouseEnter={e => e.currentTarget.style.color = '#CCD0CF'}
              onMouseLeave={e => e.currentTarget.style.color = '#4A5C6A'}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to login
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg" style={{ backgroundColor: 'rgba(28, 79, 120, 0.2)', border: '1px solid rgba(28, 79, 120, 0.3)' }}>
                <ShieldCheck className="w-8 h-8" style={{ color: '#1c4f78' }} />
              </div>
              <h1 className="text-2xl font-black mb-2" style={{ color: '#CCD0CF' }}>
                {twoFactorSetup ? 'Set Up Two-Factor Auth' : 'Two-Factor Verification'}
              </h1>
              <p className="text-sm font-medium" style={{ color: '#9BA8AB' }}>
                {twoFactorSetup 
                  ? 'Scan the QR code with your authenticator app to secure your account' 
                  : 'Enter the 6-digit code from your authenticator app'}
              </p>
            </div>

            {/* QR Code for First-Time Setup */}
            {twoFactorSetup && qrCodeUrl && (
              <div className="mb-8">
                <div className="rounded-3xl p-6 flex flex-col items-center" style={{ backgroundColor: '#06141B', border: '1px solid #253745' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Smartphone className="w-4 h-4" style={{ color: '#10b981' }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#10b981' }}>Scan with Authenticator</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-inner">
                    <QRCodeSVG 
                      value={qrCodeUrl} 
                      size={180} 
                      level="H"
                      includeMargin={false}
                      bgColor="#ffffff"
                      fgColor="#06141B"
                    />
                  </div>
                  <p className="text-[11px] mt-4 text-center leading-relaxed max-w-xs" style={{ color: '#4A5C6A' }}>
                    Use <span className="font-bold" style={{ color: '#9BA8AB' }}>Google Authenticator</span>, <span className="font-bold" style={{ color: '#9BA8AB' }}>Authy</span>, or any TOTP app to scan this code
                  </p>
                </div>
              </div>
            )}

            {/* 6-Digit Code Input */}
            <div className="mb-6">
              <label className="block text-center text-[11px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#4A5C6A' }}>
                <KeyRound className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                Enter verification code
              </label>
              <div className="flex justify-center gap-3" onPaste={handleTotpPaste}>
                {totpCode.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleTotpChange(i, e.target.value)}
                    onKeyDown={(e) => handleTotpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-black rounded-xl border outline-none transition-all"
                    style={{ 
                      backgroundColor: '#06141B', 
                      borderColor: digit ? '#1c4f78' : '#253745', 
                      color: '#CCD0CF',
                      boxShadow: digit ? '0 0 0 3px rgba(28, 79, 120, 0.15)' : 'none'
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#1c4f78'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(28, 79, 120, 0.15)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = digit ? '#1c4f78' : '#253745'; e.currentTarget.style.boxShadow = digit ? '0 0 0 3px rgba(28, 79, 120, 0.15)' : 'none'; }}
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl border mb-6 animate-shake" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
              </div>
            )}

            {/* Verify Button */}
            <button 
              onClick={handleVerify2FA}
              disabled={verifying || totpCode.join('').length !== 6}
              className="w-full py-4 flex items-center justify-center gap-3 text-sm font-bold shadow-xl rounded-2xl h-14 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#1c4f78', color: '#CCD0CF' }}
            >
              {verifying ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Verify & Sign In
                </>
              )}
            </button>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#4A5C6A' }}>
                Code refreshes every 30 seconds
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.4em] text-center w-full" style={{ color: '#4A5C6A' }}>
          &copy; 2026 SmartCampus Hub &bull; Secured with 2FA
        </div>
      </div>
    );
  }

  // ── Normal Login Screen ──────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: '#11212D' }}>
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(28, 79, 120, 0.1)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }} />
      </div>

      <div 
        className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 rounded-[40px] shadow-2xl overflow-hidden relative z-10 border" 
        style={{ backgroundColor: '#11212D', borderColor: '#253745' }}
      >
        
        {/* Left Side: Branding & Visuals */}
        <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden" style={{ backgroundColor: '#06141B' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#1c4f78]/10 to-[#10b981]/10" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1c4f78' }}>
                <Globe className="text-[#CCD0CF] w-6 h-6" />
              </div>
              <span className="text-xl font-black tracking-tight uppercase" style={{ color: '#CCD0CF' }}>SmartCampus Hub</span>
            </div>

            <h2 className="text-5xl font-black leading-tight mb-6" style={{ color: '#CCD0CF' }}>
               Streamlining <br />
               <span style={{ color: '#1c4f78' }}>Campus Operations</span> <br />
               with Intelligence.
            </h2>
            <p className="text-lg font-medium leading-relaxed max-w-md" style={{ color: '#9BA8AB' }}>
              A centralized platform for facility management, incident reporting, and real-time notifications.
            </p>
          </div>

          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 flex items-center justify-center text-xs font-bold overflow-hidden shadow-lg" style={{ borderColor: '#06141B', backgroundColor: '#253745' }}>
                    <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold" style={{ color: '#10b981' }}>Join 2,000+ active campus members</p>
            </div>
          </div>
          
          {/* Abstract Grid Pattern */}
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-5 pointer-events-none translate-x-1/4 translate-y-1/4">
             <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #CCD0CF 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-10 md:p-16 flex flex-col justify-center" style={{ backgroundColor: '#11212D' }}>
          <div className="max-w-md mx-auto w-full">
            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl font-black mb-3" style={{ color: '#CCD0CF' }}>Welcome Back</h1>
              <p className="font-bold uppercase tracking-widest text-[10px]" style={{ color: '#4A5C6A' }}>Access your user or staff portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] ml-2" style={{ color: '#4A5C6A' }}>Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A5C6A] group-focus-within:text-[#1c4f78] transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@smartcampus.com"
                    className="w-full pl-12 pr-6 py-4 rounded-2xl outline-none transition-all font-bold border"
                    style={{ backgroundColor: '#06141B', borderColor: '#253745', color: '#CCD0CF' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#1c4f78'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(28, 79, 120, 0.1)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#253745'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: '#4A5C6A' }}>Password</label>
                  <a href="#" className="text-[10px] font-bold uppercase tracking-wider transition-colors" style={{ color: '#1c4f78' }} onMouseEnter={e => e.currentTarget.style.color = '#CCD0CF'} onMouseLeave={e => e.currentTarget.style.color = '#1c4f78'}>Forgot?</a>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A5C6A] group-focus-within:text-[#1c4f78] transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-6 py-4 rounded-2xl outline-none transition-all font-bold border"
                    style={{ backgroundColor: '#06141B', borderColor: '#253745', color: '#CCD0CF' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#1c4f78'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(28, 79, 120, 0.1)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#253745'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl border animate-shake" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4.5 flex items-center justify-center gap-3 text-sm font-bold shadow-xl group rounded-2xl h-14"
                style={{ backgroundColor: '#1c4f78', color: '#CCD0CF' }}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    Sign In to Hub
                  </>
                )}
              </button>

              <div className="relative my-6 flex items-center">
                 <div className="flex-grow border-t" style={{ borderColor: '#253745' }}></div>
                 <span className="flex-shrink-0 mx-4 text-[10px] font-bold uppercase tracking-widest text-[#4A5C6A]">Or</span>
                 <div className="flex-grow border-t" style={{ borderColor: '#253745' }}></div>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={isLoading}
                className="w-full py-4.5 flex items-center justify-center gap-3 text-sm font-bold shadow-xl rounded-2xl h-14 border transition-colors hover:opacity-90"
                style={{ backgroundColor: '#ffffff', color: '#333333', borderColor: '#e5e7eb' }}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Sign in with Google
              </button>
            </form>

            <div className="mt-12">
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: '#253745' }}></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 font-bold uppercase tracking-[0.3em]" style={{ backgroundColor: '#11212D', color: '#4A5C6A' }}>Demo Accounts</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button 
                  type="button"
                  onClick={() => quickSelect('admin@smartcampus.com', 'password123')}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all group"
                  style={{ backgroundColor: '#253745', borderColor: '#4A5C6A' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#1c4f78'; e.currentTarget.style.backgroundColor = '#1c4f7820'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#4A5C6A'; e.currentTarget.style.backgroundColor = '#253745'; }}
                >
                  <ShieldCheck className="w-4 h-4 text-primary-500" />
                  <span className="text-[10px] font-black uppercase tracking-tighter" style={{ color: '#CCD0CF' }}>Admin</span>
                </button>
                <button 
                  type="button"
                  onClick={() => quickSelect('tech@smartcampus.com', 'password123')}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all group"
                  style={{ backgroundColor: '#253745', borderColor: '#4A5C6A' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#fbbf24'; e.currentTarget.style.backgroundColor = '#fbbf2410'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#4A5C6A'; e.currentTarget.style.backgroundColor = '#253745'; }}
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-tighter" style={{ color: '#CCD0CF' }}>Tech</span>
                </button>
                <button 
                  type="button"
                  onClick={() => quickSelect('student@smartcampus.com', 'password123')}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all group"
                  style={{ backgroundColor: '#253745', borderColor: '#4A5C6A' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.backgroundColor = '#10b98110'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#4A5C6A'; e.currentTarget.style.backgroundColor = '#253745'; }}
                >
                  <LogIn className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-tighter" style={{ color: '#CCD0CF' }}>User</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.4em] text-center w-full" style={{ color: '#4A5C6A' }}>
        &copy; 2026 SmartCampus Hub &bull; All Systems Operational
      </div>
    </div>
  );
};

export default LoginPage;
