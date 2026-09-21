import { useState, useEffect } from 'react';
import { Mail, MapPin, Send, CheckCircle2, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
import { Seo } from '@/components/Seo';

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface Errors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

interface FireflyData {
  id: number;
  size: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
  x: number;
  y: number;
}

const empty: FormState = { name: '', email: '', subject: '', message: '' };

export function ContactPage() {
  // Stavy lampy a animací
  const [isOn, setIsOn] = useState(false);
  const [hintHidden, setHintHidden] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [fireflies, setFireflies] = useState<FireflyData[]>([]);

  // Původní stavy formuláře a odesílání
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const contactEmail = 'Elektro-MaM@email.cz';

  // Generování pozic světlušek výhradně uvnitř světelného kužele
  useEffect(() => {
    const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const dots: FireflyData[] = [];
    for (let i = 0; i < 14; i++) {
      // Výška v kuželu (v procentech shora)
      const top = random(20, 85);
      
      // Geometrie kuželu: nahoře je úzký (40-60 %), dole široký (15-85 %)
      const spread = (top / 100) * 35; // čím níže, tím širší rozptyl
      const minLeft = Math.max(10, 50 - spread);
      const maxLeft = Math.min(90, 50 + spread);
      const left = random(Math.round(minLeft), Math.round(maxLeft));

      dots.push({
        id: i,
        size: random(3, 5),
        left,
        top,
        duration: Number((Math.random() * 2 + 2.5).toFixed(1)),
        delay: Number((Math.random() * 1.5).toFixed(1)),
        x: random(-14, 14), // Jemný pohyb, aby nevyletěly z kužele
        y: random(-18, 18),
      });
    }
    setFireflies(dots);
  }, []);

  const copyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.warn('Nepodařilo se zkopírovat e-mail do schránky');
    }
  };

  const handlePullCord = () => {
    setHintHidden(true);
    setIsPulling(true);
    setTimeout(() => setIsPulling(false), 150);
    setIsOn((prev) => !prev);
  };

  const validate = (): boolean => {
    const e: Errors = {};

    if (!form.name.trim()) e.name = 'Jméno je povinné.';
    if (!form.email.trim()) {
      e.email = 'E-mail je povinný.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Zadej platný e-mail.';
    }
    if (!form.subject.trim()) e.subject = 'Předmět je povinný.';
    if (!form.message.trim()) {
      e.message = 'Zpráva je povinná.';
    } else if (form.message.trim().length < 10) {
      e.message = 'Zpráva musí mít alespoň 10 znaků.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOn) return;
    setServerError(null);

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: 'b3b9b5b7-273c-495c-a912-b2beeb2808da',
          name: form.name,
          email: form.email,
          subject: `[Elektro MaM] ${form.subject}`,
          message: form.message,
          from_name: 'Web Elektro MaM',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSent(true);
        setForm(empty);
      } else {
        setServerError(data.message || 'Odeslání se nezdařilo. Zkus to prosím znovu.');
      }
    } catch {
      setServerError('Došlo k chybě spojení. Zkontroluj připojení k internetu.');
    } finally {
      setLoading(false);
    }
  };

  const inputError = (field: keyof Errors) =>
    errors[field]
      ? 'border-circuit-red focus:border-circuit-red focus:ring-circuit-red'
      : '';

  return (
    <>
      <Seo
        title="Kontakt – Elektro MaM"
        description="Máš dotaz, nápad nebo chceš něco probrat? Napiš mi přes kontaktní formulář."
      />

      <style>{`
        @keyframes fly {
          0% { opacity: 0.15; transform: translate(0, 0); }
          50% { opacity: 0.95; }
          100% { opacity: 0.25; transform: translate(var(--tw-fly-x, 15px), var(--tw-fly-y, -15px)); }
        }
        @keyframes cordGlow {
          0%, 100% { box-shadow: 0 2px 6px rgba(0,0,0,0.6); }
          50% { box-shadow: 0 0 16px 5px rgba(245, 176, 65, 0.85); }
        }
        @keyframes hintPulse {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-3px); opacity: 0.8; }
        }
        .animate-cord-glow {
          animation: cordGlow 2s infinite;
        }
        .animate-hint-pulse {
          animation: hintPulse 2s infinite;
        }
        .light-cone {
          clip-path: polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%);
        }
      `}</style>

      <section className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Kontakt</h1>
          <p className="mt-2 max-w-2xl text-ink-100">
            Máš dotaz, nápad nebo chceš něco probrat? Můžeš mi napsat pomocí kontaktního formuláře.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* LEVÁ ČÁST: Původní kontaktní údaje (čisté bez tipu) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-ink-500/60 bg-ink-700/30 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Kontaktní údaje</h2>
              <ul className="space-y-4">
                {/* Položka E-mail */}
                <li className="relative flex items-center justify-between gap-3 text-sm text-ink-100">
                  <a
                    href={`mailto:${contactEmail}`}
                    className="flex items-center gap-3 transition-colors hover:text-accent-400"
                    title="Otevřít v poštovním programu"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent-500/40 bg-accent-500/10">
                      <Mail className="h-5 w-5 text-accent-400" aria-hidden />
                    </div>
                    <div>
                      <div className="text-xs text-ink-300">E-mail</div>
                      <div className="font-mono text-sm">{contactEmail}</div>
                    </div>
                  </a>

                  {/* Tlačítko pro zkopírování do schránky */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={copyEmailToClipboard}
                      className="group flex h-9 w-9 items-center justify-center rounded-lg border border-ink-500/60 bg-ink-800/60 text-ink-300 transition-all hover:border-accent-500/60 hover:bg-ink-700 hover:text-accent-400"
                      aria-label="Zkopírovat e-mail do schránky"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-circuit-green" aria-hidden />
                      ) : (
                        <Copy className="h-4 w-4 transition-transform group-hover:scale-110" aria-hidden />
                      )}
                    </button>

                    {copied && (
                      <div className="absolute -top-10 right-0 z-20 whitespace-nowrap rounded-md border border-circuit-green/40 bg-ink-900 px-2.5 py-1 text-xs font-medium text-circuit-green shadow-lg animate-fade-in-up">
                        Zkopírováno do schránky!
                      </div>
                    )}
                  </div>
                </li>

                {/* Položka Adresa */}
                <li className="flex items-center gap-3 text-sm text-ink-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent-500/40 bg-accent-500/10">
                    <MapPin className="h-5 w-5 text-accent-400" aria-hidden />
                  </div>
                  <div>
                    <div className="text-xs text-ink-300">Adresa</div>
                    <div>Ostrava</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* PRAVÁ ČÁST: Scéna s lampou a formulářem */}
          <div className="lg:col-span-8 relative bg-[#121317] border border-ink-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 min-h-[580px]">
            
            {/* SEKCE LAMPA */}
            <div className="relative w-52 sm:w-60 h-[440px] flex flex-col items-center justify-end z-10 shrink-0 select-none">
              
              {/* Kužel světla – světlušky jsou uzavřeny POUZE v něm */}
              <div
                className={`light-cone absolute top-[110px] left-1/2 -translate-x-1/2 w-[480px] sm:w-[560px] h-[400px] pointer-events-none transition-opacity duration-500 z-0 overflow-hidden ${
                  isOn ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255, 210, 85, 0.32) 0%, rgba(255, 200, 80, 0.08) 55%, transparent 100%)',
                }}
              >
                {/* Létající světlušky UVNITŘ kužele */}
                {isOn && fireflies.map((f) => (
                  <span
                    key={f.id}
                    className="absolute rounded-full bg-[#ffd055] shadow-[0_0_7px_#ffd055]"
                    style={{
                      width: `${f.size}px`,
                      height: `${f.size}px`,
                      left: `${f.left}%`,
                      top: `${f.top}%`,
                      // @ts-ignore
                      '--tw-fly-x': `${f.x}px`,
                      '--tw-fly-y': `${f.y}px`,
                      animation: `fly ${f.duration}s ease-in-out infinite alternate`,
                      animationDelay: `${f.delay}s`,
                    }}
                  />
                ))}
              </div>

              {/* Stínítko */}
              <div className="absolute top-[30px] w-36 h-[72px] bg-[#23272f] rounded-t-full border border-[#363c48] shadow-[inset_0_2px_5px_rgba(255,255,255,0.05)] z-10">
                {/* Žárovka */}
                <div
                  className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-5 rounded-full transition-all duration-300 z-10 ${
                    isOn
                      ? 'bg-white shadow-[0_0_26px_9px_rgba(255,220,120,0.95)]'
                      : 'bg-[#333842]'
                  }`}
                />

                {/* Šňůrka */}
                <div
                  onClick={handlePullCord}
                  className={`absolute top-full left-[78%] w-[2px] h-24 bg-[#7a8291] cursor-pointer z-20 origin-top transition-transform duration-150 group ${
                    isPulling ? 'scale-y-125' : ''
                  }`}
                  title="Zatáhni pro rozsvícení/zhasnutí"
                >
                  <div
                    className={`absolute bottom-0 -left-[5px] w-3 h-5 bg-[#f5b041] rounded shadow-md group-hover:brightness-125 transition ${
                      !isOn ? 'animate-cord-glow' : ''
                    }`}
                  />

                  {!isOn && !hintHidden && (
                    <div className="cord-hint animate-hint-pulse absolute left-6 -bottom-1 bg-[#f5b041] text-[#121317] px-2.5 py-1 rounded text-xs font-bold whitespace-nowrap shadow pointer-events-none">
                      Zatáhni!
                      <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#f5b041]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Tyč a podstavec */}
              <div className="w-2 h-[310px] bg-[#23272f] rounded-sm z-0" />
              <div className="w-40 h-3.5 bg-[#23272f] rounded-t-lg border-b-2 border-[#101216] z-0" />
            </div>

            {/* FORMULÁŘ */}
            <div
              className={`relative w-full max-w-md p-6 rounded-2xl border transition-all duration-500 z-10 ${
                isOn
                  ? 'opacity-100 translate-y-0 pointer-events-auto bg-[#1a1d24]/90 backdrop-blur-md border-white/10 shadow-2xl'
                  : 'opacity-20 translate-y-3 pointer-events-none bg-white/[0.03] backdrop-blur-[2px] border-white/5 shadow-none'
              }`}
            >
              <h2
                className={`text-xl font-bold mb-4 transition-colors duration-500 ${
                  isOn ? 'text-white' : 'text-white/50'
                }`}
              >
                Napiš mi zprávu
              </h2>

              {sent && (
                <div className="mb-4 flex items-start gap-3 rounded-lg border border-circuit-green/40 bg-circuit-green/10 p-3.5">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-circuit-green" aria-hidden />
                  <p className="text-sm text-ink-100">
                    Děkuji za zprávu! Byla úspěšně odeslána. Ozvu se co nejdříve.
                  </p>
                </div>
              )}

              {serverError && (
                <div className="mb-4 flex items-start gap-3 rounded-lg border border-circuit-red/40 bg-circuit-red/10 p-3.5">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-circuit-red" aria-hidden />
                  <p className="text-sm text-circuit-red">{serverError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Jméno */}
                <div>
                  <label
                    htmlFor="name"
                    className={`block text-xs uppercase font-semibold tracking-wider mb-1 transition-colors ${
                      isOn ? 'text-ink-200' : 'text-ink-400'
                    }`}
                  >
                    Jméno <span className="text-circuit-red">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    disabled={!isOn}
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-xl text-sm outline-none transition-all ${
                      isOn
                        ? 'bg-[#14161b] border border-ink-500/60 text-white placeholder-ink-400 focus:border-accent-400'
                        : 'bg-ink-800/40 border border-ink-600/40 text-ink-400 placeholder-ink-500'
                    } ${inputError('name')}`}
                    placeholder="Tvé jméno"
                    autoComplete="name"
                  />
                  {errors.name && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-circuit-red">
                      <AlertCircle className="h-3 w-3" aria-hidden />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* E-mail */}
                <div>
                  <label
                    htmlFor="email"
                    className={`block text-xs uppercase font-semibold tracking-wider mb-1 transition-colors ${
                      isOn ? 'text-ink-200' : 'text-ink-400'
                    }`}
                  >
                    E-mail <span className="text-circuit-red">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    disabled={!isOn}
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-xl text-sm outline-none transition-all ${
                      isOn
                        ? 'bg-[#14161b] border border-ink-500/60 text-white placeholder-ink-400 focus:border-accent-400'
                        : 'bg-ink-800/40 border border-ink-600/40 text-ink-400 placeholder-ink-500'
                    } ${inputError('email')}`}
                    placeholder="tvuj@email.cz"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-circuit-red">
                      <AlertCircle className="h-3 w-3" aria-hidden />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Předmět */}
                <div>
                  <label
                    htmlFor="subject"
                    className={`block text-xs uppercase font-semibold tracking-wider mb-1 transition-colors ${
                      isOn ? 'text-ink-200' : 'text-ink-400'
                    }`}
                  >
                    Předmět <span className="text-circuit-red">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    disabled={!isOn}
                    value={form.subject}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-xl text-sm outline-none transition-all ${
                      isOn
                        ? 'bg-[#14161b] border border-ink-500/60 text-white placeholder-ink-400 focus:border-accent-400'
                        : 'bg-ink-800/40 border border-ink-600/40 text-ink-400 placeholder-ink-500'
                    } ${inputError('subject')}`}
                    placeholder="O čem chceš mluvit?"
                  />
                  {errors.subject && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-circuit-red">
                      <AlertCircle className="h-3 w-3" aria-hidden />
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Zpráva */}
                <div>
                  <label
                    htmlFor="message"
                    className={`block text-xs uppercase font-semibold tracking-wider mb-1 transition-colors ${
                      isOn ? 'text-ink-200' : 'text-ink-400'
                    }`}
                  >
                    Zpráva <span className="text-circuit-red">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    disabled={!isOn}
                    value={form.message}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-xl text-sm outline-none resize-none transition-all ${
                      isOn
                        ? 'bg-[#14161b] border border-ink-500/60 text-white placeholder-ink-400 focus:border-accent-400'
                        : 'bg-ink-800/40 border border-ink-600/40 text-ink-400 placeholder-ink-500'
                    } ${inputError('message')}`}
                    placeholder="Napiš svou zprávu (min. 10 znaků)..."
                  />
                  {errors.message && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-circuit-red">
                      <AlertCircle className="h-3 w-3" aria-hidden />
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Odesílací tlačítko */}
                <button
                  type="submit"
                  disabled={!isOn || loading}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    isOn
                      ? 'bg-[#ffd055] text-neutral-950 hover:bg-[#ffe082] active:scale-[0.98] cursor-pointer'
                      : 'bg-[#ffd055]/20 text-neutral-950/30 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Odesílám...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" aria-hidden />
                      Odeslat zprávu
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}