import { useState, useEffect, useRef } from 'react';
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Heart,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Seo } from '@/components/Seo';

type EntryType = 'prani' | 'pochvala' | 'stiznost';

interface GuestbookEntry {
  id: number;
  created_at: string;
  name: string;
  message: string;
  type: EntryType;
}

const MIN_SUBMIT_TIME_MS = 3000; // Minimální čas 3 sekundy od načtení formuláře

export function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<EntryType>('prani');

  // Honeypot pole pro boty (musí zůstat prázdné)
  const [honeypot, setHoneypot] = useState('');

  // Časová značka načtení formuláře pro ochranu proti rychlým botům
  const formMountTimeRef = useRef<number>(Date.now());

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('guestbook')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setEntries(data || []);
    } catch (err) {
      console.error('Chyba při načítání záznamů:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Ochrana: Honeypot (pokud bot vyplnil skryté pole, tiše ukončíme)
    if (honeypot.trim() !== '') {
      setSuccess(true);
      setName('');
      setMessage('');
      setHoneypot('');
      return;
    }

    // 2. Ochrana: Časový limit (pokud je odesláno dříve než za 3 sekundy)
    const timeElapsed = Date.now() - formMountTimeRef.current;
    if (timeElapsed < MIN_SUBMIT_TIME_MS) {
      setError('Formulář byl odeslán příliš rychle. Počkej prosím chvilku a zkus to znovu.');
      return;
    }

    // 3. Ochrana: Validace vstupů a odstranění mezer
    const cleanName = name.trim();
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      setError('Zpráva nesmí být prázdná.');
      return;
    }

    if (cleanName.length > 50) {
      setError('Jméno může mít maximálně 50 znaků.');
      return;
    }

    if (cleanMessage.length > 1000) {
      setError('Zpráva může mít maximálně 1000 znaků.');
      return;
    }

    setSubmitting(true);

    try {
      // Skutečný INSERT do Supabase odpovídající struktuře tabulky
      const { error: insertError } = await supabase.from('guestbook').insert({
        name: cleanName || 'Anonym',
        message: cleanMessage,
        type: type,
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setName('');
      setMessage('');
      setHoneypot('');
      formMountTimeRef.current = Date.now();
      await fetchEntries();
    } catch (err: any) {
      console.error('Chyba při odesílání:', err);
      setError(err?.message || 'Nepodařilo se odeslat zprávu. Zkus to prosím znovu.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeBadge = (entryType: EntryType) => {
    switch (entryType) {
      case 'prani':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-sky-400">
            <Lightbulb className="w-3.5 h-3.5" /> Přání / Nápad
          </span>
        );
      case 'pochvala':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
            <Heart className="w-3.5 h-3.5" /> Pochvala
          </span>
        );
      case 'stiznost':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" /> Stížnost / Chyba
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Seo
        title="Kniha přání a stížností – Elektro MaM"
        description="Máte nápad na zlepšení, líbí se vám web, nebo jste našli chybu? Napište mi vzkaz!"
      />

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hlavička */}
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Kniha přání a stížností
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
            Máte nápad na zlepšení, líbí se vám web, nebo jste našli chybu? Napište mi vzkaz!
          </p>
        </div>

        {/* Formulář */}
        <div className="mx-auto mb-12 max-w-xl rounded-2xl border border-neutral-800 bg-[#0f141c]/90 p-6 sm:p-8 shadow-2xl">
          {success && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
              <p className="text-sm font-medium text-emerald-300">
                Vzkaz byl úspěšně přidán! Děkuji za zpětnou vazbu.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-400" />
              <p className="text-sm text-rose-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* HONEYPOT POLE PRO BOTY */}
            <div
              style={{
                position: 'absolute',
                opacity: 0,
                top: 0,
                left: 0,
                height: 0,
                width: 0,
                zIndex: -1,
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
              aria-hidden="true"
            >
              <label htmlFor="website_url">Nevyplňujte toto pole</label>
              <input
                type="text"
                id="website_url"
                name="website_url"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* Jméno */}
            <div>
              <label htmlFor="guestbook-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Vaše jméno či přezdívka
              </label>
              <input
                type="text"
                id="guestbook-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                disabled={submitting}
                placeholder="Např. Martin z dílny"
                className="w-full rounded-xl border border-neutral-800 bg-[#090d14] px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
              />
            </div>

            {/* Typ příspěvku */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Typ příspěvku
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setType('prani')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    type === 'prani'
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                      : 'border-neutral-800 bg-[#090d14] text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  Přání / Nápad
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setType('pochvala')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    type === 'pochvala'
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                      : 'border-neutral-800 bg-[#090d14] text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  Pochvala
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setType('stiznost')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    type === 'stiznost'
                      ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                      : 'border-neutral-800 bg-[#090d14] text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Stížnost / Chyba
                </button>
              </div>
            </div>

            {/* Vzkaz */}
            <div>
              <div className="mb-1.5 flex justify-between items-center">
                <label htmlFor="guestbook-message" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Vzkaz *
                </label>
                <span className="text-[11px] text-neutral-500">
                  {message.length} / 1000
                </span>
              </div>
              <textarea
                id="guestbook-message"
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
                disabled={submitting}
                placeholder="Napište svůj vzkaz..."
                className="w-full resize-none rounded-xl border border-neutral-800 bg-[#090d14] px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
              />
            </div>

            {/* Odesílací tlačítko */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] py-2.5 px-4 font-semibold text-neutral-950 text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Odesílám...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Přidat vzkaz
                </>
              )}
            </button>
          </form>
        </div>

        {/* Seznam záznamů */}
        <div className="mx-auto max-w-2xl space-y-4">
          <h2 className="text-lg font-bold text-white">
            Záznamy ({entries.length})
          </h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-xl border border-neutral-800 bg-[#0f141c]/50 p-8 text-center text-sm text-neutral-400">
              Zatím zde nejsou žádné vzkazy.
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-neutral-800 bg-[#0f141c]/70 p-5 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-sm text-white">{entry.name}</span>
                    {getTypeBadge(entry.type)}
                  </div>
                  <span className="text-xs text-neutral-500">
                    {formatDate(entry.created_at)}
                  </span>
                </div>
                <p className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
                  {entry.message}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}