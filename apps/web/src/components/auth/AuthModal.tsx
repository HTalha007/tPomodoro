import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const isSubmitting = isLoggingIn || isRegistering;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ email, password });
      }
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Giriş işlemi sırasında bir hata oluştu.';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const handleFillTestUser = (testEmail: string) => {
    setMode('login');
    setEmail(testEmail);
    setPassword('Password123!');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink-primary/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-md bg-surface-elevation rounded-xl border border-border-subtle shadow-xl p-space-xl flex flex-col gap-space-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-tertiary hover:text-ink-primary transition-colors p-1 rounded-lg"
          title="Kapat"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Modal Header */}
        <div className="flex flex-col gap-1 text-center">
          <span className="font-code text-label-sm uppercase tracking-widest text-ink-tertiary">
            Protokol Doğrulama
          </span>
          <h2 className="font-headline text-headline-lg text-ink-primary font-semibold">
            {mode === 'login' ? 'Oturum Aç' : 'Hesap Oluştur'}
          </h2>
          <p className="font-body text-body-md text-ink-secondary">
            Kredili dakikalarınızı ve serinizi güvenle saklayın.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 p-1 bg-surface-container-low rounded-lg border border-border-subtle/50 gap-1 text-center font-label-md text-label-md">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-1.5 rounded-md transition-all ${
              mode === 'login'
                ? 'bg-surface-elevation text-ink-primary font-semibold shadow-sm'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`py-1.5 rounded-md transition-all ${
              mode === 'register'
                ? 'bg-surface-elevation text-ink-primary font-semibold shadow-sm'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            Kayıt Ol
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-error-surface text-error-text rounded-lg border border-error/20 font-label-sm text-label-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-ink-secondary">
              E-Posta Adresi
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="adiniz@example.com"
              className="h-10 px-3 rounded-lg border border-border-subtle bg-canvas-base text-ink-primary placeholder-ink-tertiary font-body text-body-md focus:outline-none focus:border-accent-focus focus:ring-1 focus:ring-accent-focus transition-all"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-ink-secondary">
              Şifre (En az 8 karakter)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 px-3 rounded-lg border border-border-subtle bg-canvas-base text-ink-primary placeholder-ink-tertiary font-body text-body-md focus:outline-none focus:border-accent-focus focus:ring-1 focus:ring-accent-focus transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 mt-2 bg-accent-rest hover:bg-accent-hover text-accent-ink font-label-md text-label-md font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>İşleniyor...</span>
            ) : mode === 'login' ? (
              <>
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Giriş Yap</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  person_add
                </span>
                <span>Hesap Aç</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Test Seed Fill Buttons */}
        <div className="pt-3 border-t border-border-subtle/50 flex flex-col gap-1.5 text-center">
          <span className="font-code text-[11px] text-ink-tertiary uppercase">
            Hızlı Test Doldurma
          </span>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleFillTestUser('kerem@example.com')}
              className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-ink-secondary text-[11px] font-code transition-colors"
            >
              @kerem
            </button>
            <button
              type="button"
              onClick={() => handleFillTestUser('zeynep@example.com')}
              className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-ink-secondary text-[11px] font-code transition-colors"
            >
              @zeynep
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
