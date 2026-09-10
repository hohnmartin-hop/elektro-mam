import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { AdminRecipes } from '../components/admin/AdminRecipes';
import { AdminProjects } from '../components/admin/AdminProjects';

interface GuestbookEntry {
  id: number;
  created_at: string;
  name: string;
  message: string;
  type: string;
}

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'recipes' | 'guestbook'>('projects');

  const fetchEntries = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase
        .from('guestbook')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setEntries(data || []);
      }
    } catch {
      setErrorMsg('Chyba při stahování vzkazů.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login');
          return;
        }
      } catch {
        navigate('/login');
        return;
      } finally {
        setIsCheckingAuth(false);
      }

      fetchEntries();
    };

    checkSession();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (err: any) {
      alert('Chyba při odhlašování: ' + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Opravdu chceš tento vzkaz smazat?')) return;

    try {
      const { error } = await supabase
        .from('guestbook')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      alert('Chyba při mazání: ' + err.message);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-neutral-500 text-sm">Ověřuji přihlášení...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Horní lišta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Administrace webu</h1>
            <p className="text-sm text-neutral-400 mt-1">Správa projektů, receptů a vzkazů návštěvníků</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-neutral-700 cursor-pointer self-start sm:self-auto"
          >
            Odhlásit se
          </button>
        </div>

        {/* Přepínání sekcí */}
        <div className="flex flex-wrap gap-3 my-6">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-sky-500 text-neutral-950 font-bold'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Projekty
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'recipes'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Recepty
          </button>
          <button
            onClick={() => setActiveTab('guestbook')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'guestbook'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Kniha přání ({entries.length})
          </button>
        </div>

        {/* Obsah záložky Projekty */}
        {activeTab === 'projects' && (
          <AdminProjects />
        )}

        {/* Obsah záložky Recepty */}
        {activeTab === 'recipes' && (
          <AdminRecipes />
        )}

        {/* Obsah záložky Kniha přání */}
        {activeTab === 'guestbook' && (
          <div className="space-y-4">
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {errorMsg}
              </div>
            )}

            {loading ? (
              <div className="p-8 text-center text-neutral-500 text-sm">Načítám vzkazy z databáze...</div>
            ) : entries.length === 0 ? (
              <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-400 text-sm">
                V knize přání zatím nejsou žádné vzkazy.
              </div>
            ) : (
              <div className="grid gap-4">
                {entries.map(entry => (
                  <div
                    key={entry.id}
                    className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{entry.name}</span>
                        <span className="text-xs text-neutral-500">
                          {new Date(entry.created_at).toLocaleDateString('cs-CZ', {
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400">
                          {entry.type}
                        </span>
                      </div>
                      <p className="text-neutral-300 text-sm whitespace-pre-wrap">{entry.message}</p>
                    </div>

                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
                    >
                      Smazat
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
