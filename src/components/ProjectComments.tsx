import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabase';
import { MessageSquare, Send } from 'lucide-react';

interface CommentItem {
  id: number;
  created_at: string;
  project_slug: string;
  name: string;
  comment: string;
}

interface ProjectCommentsProps {
  projectSlug: string;
}

export const ProjectComments: React.FC<ProjectCommentsProps> = ({ projectSlug }) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [name, setName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('project_comments')
        .select('*')
        .eq('project_slug', projectSlug)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setComments(data);
    } catch (err: any) {
      console.error('Chyba při načítání komentářů:', err.message);
    }
  };

  useEffect(() => {
    if (projectSlug) {
      fetchComments();
    }
  }, [projectSlug]);

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
        .from('project_comments')
        .insert([
          {
            project_slug: projectSlug,
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
        <h2 className="text-2xl font-bold text-white">Diskuze k projektu ({comments.length})</h2>
      </div>

      {/* Formulář pro nový komentář */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-xl border border-ink-500/40 bg-ink-800/60 p-4 sm:p-5">
        <div>
          <label className="block text-xs font-medium text-ink-200 mb-1">
            Vaše jméno či přezdívka
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Např. Martin z dílny"
            className="w-full rounded-lg border border-ink-500/50 bg-ink-900 px-3 py-2 text-sm text-white placeholder-ink-400 focus:border-accent-400 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-200 mb-1">
            Komentář nebo dotaz
          </label>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            placeholder="Napište svůj dotaz nebo poznatek k tomuto projektu..."
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

      {/* Výpis komentářů */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-ink-300 text-center py-4">
            Zatím zde nejsou žádné komentáře. Máte k projektu dotaz? Napište jako první!
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