import { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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

const empty: FormState = { name: '', email: '', subject: '', message: '' };

export function ContactPage() {
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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

      <section className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Kontakt</h1>
          <p className="mt-2 max-w-2xl text-ink-100">
            Máš dotaz, nápad nebo chceš něco probrat? Můžeš mi napsat pomocí kontaktního formuláře.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Kontaktní údaje */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-ink-500/60 bg-ink-700/30 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Kontaktní údaje</h2>
              <ul className="space-y-4">
                <li>
                  <a
                    href="mailto:Elektro-MaM@email.cz"
                    className="flex items-center gap-3 text-sm text-ink-100 transition-colors hover:text-accent-400"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent-500/40 bg-accent-500/10">
                      <Mail className="h-5 w-5 text-accent-400" aria-hidden />
                    </div>
                    <div>
                      <div className="text-xs text-ink-300">E-mail</div>
                      <div>Elektro-MaM@email.cz</div>
                    </div>
                  </a>
                </li>
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

          {/* Formulář */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-ink-500/60 bg-ink-700/30 p-6 sm:p-8">
              <h2 className="mb-6 text-lg font-semibold text-white">Napiš mi zprávu</h2>

              {sent && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-circuit-green/40 bg-circuit-green/10 p-4">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-circuit-green" aria-hidden />
                  <p className="text-sm text-ink-100">
                    Děkuji za zprávu! Byla úspěšně odeslána. Ozvu se co nejdříve.
                  </p>
                </div>
              )}

              {serverError && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-circuit-red/40 bg-circuit-red/10 p-4">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-circuit-red" aria-hidden />
                  <p className="text-sm text-circuit-red">{serverError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Jméno */}
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink-100">
                      Jméno <span className="text-circuit-red">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={`input-field ${inputError('name')}`}
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
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-100">
                      E-mail <span className="text-circuit-red">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`input-field ${inputError('email')}`}
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
                </div>

                {/* Předmět */}
                <div>
                  <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-ink-100">
                    Předmět <span className="text-circuit-red">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className={`input-field ${inputError('subject')}`}
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
                  <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink-100">
                    Zpráva <span className="text-circuit-red">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    className={`input-field resize-none ${inputError('message')}`}
                    placeholder="Napiš svou zprávu (min. 10 znaků)..."
                  />
                  {errors.message && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-circuit-red">
                      <AlertCircle className="h-3 w-3" aria-hidden />
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full sm:w-auto disabled:opacity-50"
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