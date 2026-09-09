import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { MessageSquare, Send, ThumbsUp, AlertCircle, Heart } from 'lucide-react';

interface GuestbookEntry {
  id: number;
  created_at: string;
  name: string;
  message: string;
  type: string;
}

export const Guestbook: React.FC = () => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('prani');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Načtení vzkazů z databáze Supabase
  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('guestbook')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setEntries(data);
    } catch (err: any) {
      console.error('Chyba při načítání:', err.message);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Odeslání nového vzkazu do Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setErrorMsg('Vyplňte prosím jméno i vzkaz.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase
        .from('guestbook')
        .insert([{ name: name.trim(), message: message.trim(), type }]);

      if (error) throw error;

      setName('');
      setMessage('');
      setSuccessMsg('Díky za zprávu! Vzkaz byl úspěšně přidán.');
      fetchEntries(); // Obnovení seznamu zpráv
    } catch (err: any) {
      setErrorMsg('Nepodařilo se odeslat vzkaz: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBadge = (entryType: string) => {
    switch (entryType) {
      case 'pochvala':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Heart className="w-3 h-3" /> Pochvala
          </span>
        );
      case 'stiznost':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" /> Stížnost / Chyba
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ThumbsUp className="w-3 h-3" /> Přání / Nápad
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Hlavička stránky */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 mb-2">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Kniha přání a ztížností
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Máte nápad na zlepšení, líbí se vám web, nebo jste našli chybu? Napište mi vzkaz!
          </p>
        </div>

        {/* Formulář */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Vaše jméno či přezdívka
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Např. Martin z dílny"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Typ příspěvku
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setType('prani')}
                  className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl border transition-all ${
                    type === 'prani'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Přání / Nápad
                </button>
                <button
                  type="button"
                  onClick={() => setType('pochvala')}
                  className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl border transition-all ${
                    type === 'pochvala'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Pochvala
                </button>
                <button
                  type="button"
                  onClick={() => setType('stiznost')}
                  className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl border transition-all ${
                    type === 'stiznost'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Stížnost / Chyba
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Vzkaz
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Napište svůj vzkaz..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm resize-none"
                required
              />
            </div>

            {errorMsg && <p className="text-rose-400 text-sm">{errorMsg}</p>}
            {successMsg && <p className="text-emerald-400 text-sm">{successMsg}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl transition-colors shadow-lg shadow-cyan-500/20 text-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Odesílám...' : 'Přidat vzkaz'}
            </button>
          </form>
        </div>

        {/* Seznam uložených vzkazů */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-200">
            Záznamy ({entries.length})
          </h2>

          {entries.length === 0 ? (
            <div className="text-center py-8 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400 text-sm">
              Zatím tu není žádný vzkaz. Buďte první, kdo zanechá stopu!
            </div>
          ) : (
            entries.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{item.name}</span>
                    {getBadge(item.type)}
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleDateString('cs-CZ', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed break-words">
                  {item.message}
                </p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};