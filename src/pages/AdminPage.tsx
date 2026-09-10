import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

interface GuestbookEntry {
  id: number;
  created_at: string;
  name: string;
  message: string;
  type: string;
}

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'guestbook' | 'projects'>('guestbook');

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
    fetchEntries();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Opravdu chceš tento vzkaz smazat?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('guestbook')
        .delete()
        .eq('id', id);

      if (error) {
        alert(`Chyba při mazání: ${error.message}`);
      } else {
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
      }
    } catch {
      alert('Došlo k neočekávané chybě při mazání.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 sm:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Horní lišta */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-neutral-800">
          <div>
            <h1 className="text-2xl font-bold text-amber-500">Administrace Elektro MaM</h1>
            <p className="text-sm text-neutral-400 mt-1">Správa obsahu a vzkazů návštěvníků</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-neutral-700 cursor-pointer"
          >
            Odhlásit se
          </button>
        </div>

        {/* Přepínání sekcí */}
        <div className="flex gap-3 my-6">
          <button
            onClick={() => setActiveTab('guestbook')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'guestbook'
                ? 'bg-amber-500 text-neutral-950'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Kniha přání ({entries.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-amber-500 text-neutral-950'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Správa projektů a receptů
          </button>
        </div>

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
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-white">{entry.name}</span>
                        {entry.type && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {entry.type}
                          </span>
                        )}
                        <span className="text-xs text-neutral-500">
                          {new Date(entry.created_at).toLocaleString('cs-CZ')}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-300 whitespace-pre-wrap">{entry.message}</p>
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

        {/* Záložka pro projekty / recepty */}
        {activeTab === 'projects' && (
          <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-2xl text-center text-neutral-400 text-sm">
            Tuto sekci připravíme v dalším kroku.
          </div>
        )}
      </div>
    </div>
  );
};
