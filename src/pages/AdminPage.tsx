import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { AdminRecipes } from '../components/admin/AdminRecipes';
import { AdminProjects } from '../components/admin/AdminProjects';

interface GuestbookEntry {
  id: number;
  created_at: string;
  name: string;
  message: string;
  type: string;
  reply?: string | null;
  replied_at?: string | null;
}

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'recipes' | 'guestbook' | 'comments'>('projects');
  interface UnifiedComment {
  id: number;
  created_at: string;
  name: string;
  comment: string;
  slug: string;
  type: 'project' | 'recipe';
  is_read: boolean;
}

  const [allComments, setAllComments] = useState<UnifiedComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentFilter, setCommentFilter] = useState<'all' | 'unread'>('unread');
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    const fetchAllComments = async () => {
    setLoadingComments(true);
    try {
      const [projRes, recRes] = await Promise.all([
        supabase.from('project_comments').select('*').order('created_at', { ascending: false }),
        supabase.from('recipe_comments').select('*').order('created_at', { ascending: false })
      ]);

      const projComments: UnifiedComment[] = (projRes.data || []).map((c: any) => ({
        id: c.id,
        created_at: c.created_at,
        name: c.name,
        comment: c.comment,
        slug: c.project_slug,
        type: 'project' as const,
        is_read: Boolean(c.is_read)
      }));

      const recComments: UnifiedComment[] = (recRes.data || []).map((c: any) => ({
        id: c.id,
        created_at: c.created_at,
        name: c.name,
        comment: c.comment,
        slug: c.recipe_slug,
        type: 'recipe' as const,
        is_read: Boolean(c.is_read)
      }));

      const merged = [...projComments, ...recComments].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setAllComments(merged);
    } catch (err: any) {
      console.error('Chyba načítání komentářů:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleRead = async (item: UnifiedComment) => {
    const table = item.type === 'project' ? 'project_comments' : 'recipe_comments';
    const nextStatus = !item.is_read;
    try {
      const { error } = await supabase.from(table).update({ is_read: nextStatus }).eq('id', item.id);
      if (error) throw error;
      setAllComments(prev => prev.map(c => c.id === item.id && c.type === item.type ? { ...c, is_read: nextStatus } : c));
    } catch (err: any) {
      alert('Nepodařilo se změnit stav: ' + err.message);
    }
  };

  const handleDeleteComment = async (item: UnifiedComment) => {
    if (!window.confirm('Opravdu chcete smazat tento komentář?')) return;
    const table = item.type === 'project' ? 'project_comments' : 'recipe_comments';
    try {
      const { error } = await supabase.from(table).delete().eq('id', item.id);
      if (error) throw error;
      setAllComments(prev => prev.filter(c => !(c.id === item.id && c.type === item.type)));
    } catch (err: any) {
      alert('Nepodařilo se smazat komentář: ' + err.message);
    }
  };

  const handleStartReply = (entry: GuestbookEntry) => {
    setReplyingId(entry.id);
    setReplyText(entry.reply || "");
  };

  const handleCancelReply = () => {
    setReplyingId(null);
    setReplyText("");
  };

  const handleSaveReply = async (id: number) => {
    setIsSubmittingReply(true);
    try {
      const { error } = await supabase
        .from("guestbook")
        .update({
          reply: replyText.trim() ? replyText.trim() : null,
          replied_at: replyText.trim() ? new Date().toISOString() : null,
        })
        .eq("id", id);

      if (error) {
        alert("Chyba při ukládání odpovědi: " + error.message);
      } else {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === id
              ? {
                  ...e,
                  reply: replyText.trim() ? replyText.trim() : null,
                  replied_at: replyText.trim() ? new Date().toISOString() : null,
                }
              : e
          )
        );
        handleCancelReply();
      }
    } catch {
      alert("Nepodařilo se uložit odpověď.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

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
      fetchAllComments();
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
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'comments'
                ? 'bg-purple-500 text-neutral-950 font-bold'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Komentáře
            {allComments.filter(c => !c.is_read).length > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-rose-500 text-white font-bold animate-pulse">
                {allComments.filter(c => !c.is_read).length}
              </span>
            )}
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

        {/* Správa komentářů v diskuzích */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCommentFilter('unread')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                    commentFilter === 'unread'
                      ? 'bg-purple-500 text-neutral-950 font-bold'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Pouze nepřečtené ({allComments.filter(c => !c.is_read).length})
                </button>
                <button
                  onClick={() => setCommentFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                    commentFilter === 'all'
                      ? 'bg-purple-500 text-neutral-950 font-bold'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Všechny komentáře ({allComments.length})
                </button>
              </div>

              <button
                onClick={fetchAllComments}
                disabled={loadingComments}
                className="text-xs text-neutral-400 hover:text-white transition cursor-pointer"
              >
                {loadingComments ? 'Načítám...' : 'Obnovit seznam'}
              </button>
            </div>

            {loadingComments ? (
              <div className="p-12 text-center text-sm text-neutral-400">Načítám komentáře...</div>
            ) : allComments.filter(c => commentFilter === 'all' || !c.is_read).length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-neutral-800 bg-neutral-900/40 text-neutral-400">
                {commentFilter === 'unread' ? 'Žádné nové nepřečtené komentáře.' : 'Zatím nebyly vloženy žádné komentáře.'}
              </div>
            ) : (
              <div className="grid gap-4">
                {allComments
                  .filter(c => commentFilter === 'all' || !c.is_read)
                  .map(item => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className={`p-5 rounded-2xl border transition ${
                        !item.is_read
                          ? 'bg-neutral-900/90 border-purple-500/40 shadow-lg shadow-purple-500/5'
                          : 'bg-neutral-900/40 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            item.type === 'project' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}>
                            {item.type === 'project' ? 'Projekt' : 'Recept'}
                          </span>
                          <span className="text-xs font-semibold text-neutral-300">
                            Článek: <span className="text-white font-mono">{item.slug}</span>
                          </span>
                          {!item.is_read && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                              NOVÉ
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-neutral-500">
                          {new Date(item.created_at).toLocaleDateString('cs-CZ', {
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <div className="mb-4">
                        <span className="font-semibold text-sm text-neutral-200">{item.name}</span>
                        <p className="mt-1 text-sm text-neutral-300 whitespace-pre-wrap bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/80">
                          {item.comment}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800/80">
                        <a
                          href={`/${item.type === 'project' ? 'projekty' : 'recepty'}/${item.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition"
                        >
                          Přejít do diskuze / Odpovědět ↗
                        </a>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleRead(item)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              item.is_read
                                ? 'bg-neutral-800 text-neutral-400 hover:text-white'
                                : 'bg-purple-600 hover:bg-purple-500 text-white'
                            }`}
                          >
                            {item.is_read ? 'Označit jako nepřečtené' : 'Označit jako přečtené'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteComment(item)}
                            className="px-3 py-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-900/40 text-xs transition cursor-pointer"
                          >
                            Smazat
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

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
                    className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
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

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartReply(entry)}
                          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          {entry.reply ? "Upravit odpověď" : "Odpovědět"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          Smazat
                        </button>
                      </div>
                    </div>

                    {/* Formulář pro odpověď */}
                    {replyingId === entry.id && (
                      <div className="pt-3 border-t border-neutral-800 space-y-3">
                        <label className="block text-xs font-semibold text-neutral-400">
                          Odpověď administrátora na tento vzkaz:
                        </label>
                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Napiš odpověď..."
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500/50"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isSubmittingReply}
                            onClick={() => handleSaveReply(entry.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-neutral-950 font-semibold hover:bg-amber-400 transition text-xs disabled:opacity-50"
                          >
                            {isSubmittingReply ? "Ukládám..." : "Uložit odpověď"}
                          </button>
                          <button
                            type="button"
                            disabled={isSubmittingReply}
                            onClick={handleCancelReply}
                            className="px-3.5 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white transition text-xs"
                          >
                            Zrušit
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Zobrazení existující odpovědi, pokud se zrovna needituje */}
                    {entry.reply && replyingId !== entry.id && (
                      <div className="pt-3 border-t border-neutral-800/80 bg-neutral-950/40 -mx-5 -mb-5 p-4 rounded-b-2xl border-l-2 border-l-amber-500/80">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-amber-400">Reakce administrátora</span>
                          {entry.replied_at && (
                            <span className="text-[11px] text-neutral-500">
                              {new Date(entry.replied_at).toLocaleDateString('cs-CZ', {
                                day: 'numeric',
                                month: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-300 whitespace-pre-wrap">{entry.reply}</p>
                      </div>
                    )}
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
