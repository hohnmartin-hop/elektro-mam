import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Seo } from '@/components/Seo';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage('Nesprávný e-mail nebo heslo.');
      } else {
        // Po úspěšném přihlášení přesměrujeme do adminu
        navigate('/admin');
      }
    } catch (err) {
      setErrorMessage('Došlo k neočekávané chybě při přihlašování.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title="Přihlášení do administrace – Elektro MaM" description="Přihlášení správce" />

      <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4 py-12">
        <div className="w-full rounded-2xl border border-ink-500/60 bg-ink-800/50 p-8 shadow-xl backdrop-blur-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-circuit-amber/40 bg-circuit-amber/10 text-circuit-amber">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-white">Administrace</h1>
            <p className="mt-1 text-sm text-ink-300">Přihlas se pro správu obsahu</p>
          </div>

          {errorMessage && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-200">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tvuj@email.cz"
                  className="w-full rounded-lg border border-ink-500/60 bg-ink-900/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-ink-500 focus:border-circuit-amber focus:outline-none focus:ring-1 focus:ring-circuit-amber"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-200">Heslo</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-ink-500/60 bg-ink-900/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-ink-500 focus:border-circuit-amber focus:outline-none focus:ring-1 focus:ring-circuit-amber"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-circuit-amber/40 bg-circuit-amber/10 py-2.5 text-sm font-semibold text-circuit-amber transition-all duration-200 hover:bg-circuit-amber/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Přihlašuji...
                </>
              ) : (
                'Přihlásit se'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}