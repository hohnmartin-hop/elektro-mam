import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabase';
import { MessageSquare, Send } from 'lucide-react';

interface RecipeCommentItem {
  id: number;
  created_at: string;
  recipe_slug: string;
  name: string;
  comment: string;
}

interface RecipeCommentsProps {
  recipeSlug: string;
}

export const RecipeComments: React.FC<RecipeCommentsProps> = ({ recipeSlug }) => {
  const [comments, setComments] = useState<RecipeCommentItem[]>([]);
  const [name, setName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe_comments')
        .select('*')
        .eq('recipe_slug', recipeSlug)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setComments(data);
    } catch (err: any) {
      console.error('Chyba při načítání komentářů receptu:', err.message);
    }
  };

  useEffect(() => {
    if (recipeSlug) {
      fetchComments();
    }
  }, [recipeSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !commentText.trim()) {
      setErrorMsg('Vyplňte prosím jméno i komentář.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase
        .from('recipe_comments')
        .insert([
          {
            recipe_slug: recipeSlug,
            name: name.trim(),
            comment: commentText.trim(),
          },
        ]);

      if (error) throw error;

      setName('');
      setCommentText('');
      setSuccessMsg('Komentář byl úspěšně přidán.');
      fetchComments();
    } catch (err: any) {
      setErrorMsg('Nepodařilo se přidat komentář: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-12 rounded-2xl border border-ink-500/60 bg-ink-700/30 p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-accent-400" aria-hidden />
        <h2 className="text-2xl font-bold text-white">Diskuze k receptu ({comments.length})</h2>
      </div>

      {/* Formulář */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-xl border border-ink-500/40 bg-ink-800/60 p-4 sm:p-5">
        <div>
          <label className="block text-xs font-medium text-ink-200 mb-1">
            Vaše jméno či přezdívka
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Např. Kuchař z dílny"
            className="w-full rounded-lg border border-ink-500/50 bg-ink-900 px-3 py-2 text-sm text-white placeholder-ink-400 focus:border-accent-400 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-200 mb-1">
            Komentář nebo tip k receptu
          </label>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            placeholder="Napište svůj postřeh, úpravu receptu nebo hodnocení chuti..."
            className="w-full rounded-lg border border-ink-500/50 bg-ink-900 px-3 py-2 text-sm text-white placeholder-ink-400 focus:border-accent-400 focus:outline-none resize-none"
            required
          />
        </div>

        {errorMsg && <p className="text-xs text-circuit-red">{errorMsg}</p>}
        {successMsg && <p className="text-xs text-circuit-green">{successMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-accent-400 disabled:opacity-50 cursor-pointer"
        >
          <Send className="h-4 w-4" />
          {loading ? 'Odesílám...' : 'Přidat komentář'}
        </button>
      </form>

      {/* Seznam komentářů */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-ink-300 text-center py-4">
            Zatím zde nejsou žádné komentáře. Vyzkoušeli jste recept? Podělte se o výsledek!
          </p>
        ) : (
          comments.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-ink-500/30 bg-ink-800/40 p-4 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-semibold text-white text-sm">{item.name}</span>
                <span className="text-xs text-ink-400">
                  {new Date(item.created_at).toLocaleDateString('cs-CZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-sm text-ink-100 leading-relaxed break-words whitespace-pre-line">
                {item.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
};