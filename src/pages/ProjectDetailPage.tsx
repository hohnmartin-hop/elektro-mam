import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Tag,
  Target,
  Wrench,
  ListChecks,
  Code2,
  StickyNote,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { Seo } from '@/components/Seo';
import { projects as localProjects } from '@/data/projects';
import { ProjectComments } from '@/components/ProjectComments';
import { supabase } from '../supabase';
import { Project } from '../types';

const categoryColors: Record<string, string> = {
  ESP32: 'border-accent-500/40 bg-accent-500/10 text-accent-300',
  Arduino: 'border-circuit-green/40 bg-circuit-green/10 text-circuit-green',
  Napájení: 'border-circuit-amber/40 bg-circuit-amber/10 text-circuit-amber',
  Mikroelektronika: 'border-accent-500/40 bg-accent-500/10 text-accent-300',
  Opravy: 'border-circuit-red/40 bg-circuit-red/10 text-circuit-red',
  DIY: 'border-purple-400/40 bg-purple-400/10 text-purple-300',
  '3D tisk': 'border-circuit-green/40 bg-circuit-green/10 text-circuit-green',
  Ostatní: 'border-ink-400/40 bg-ink-700/40 text-ink-100',
};

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadProject() {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error) {
          console.error('Chyba při načítání ze Supabase:', error.message);
        }

        if (data) {
          setProject(data as Project);
        } else {
          const local = localProjects.find((p) => p.slug === slug);
          if (local) {
            setProject(local);
          } else {
            setNotFound(true);
          }
        }
      } catch (err) {
        console.error('Neočekávaná chyba při načítání projektu:', err);
        const local = localProjects.find((p) => p.slug === slug);
        if (local) {
          setProject(local);
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-content px-4 py-24 text-center text-ink-300">
        <p className="text-sm">Načítám projekt...</p>
      </div>
    );
  }

  if (notFound || !project) {
    return <Navigate to="/projekty" replace />;
  }

  const categoryBadgeClass =
    categoryColors[project.category] ?? categoryColors.Ostatní;

  return (
    <>
      <Seo
        title={`${project.title} – Elektro MaM`}
        description={project.shortDescription}
      />

      <article className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          to="/projekty"
          className="mb-6 inline-flex items-center gap-2 text-sm text-ink-200 transition-colors hover:text-accent-400"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Zpět na projekty
        </Link>

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className={`chip ${categoryBadgeClass}`}>
            <Tag className="mr-1 h-3 w-3" aria-hidden />
            {project.category}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-ink-300">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            {new Date(project.date).toLocaleDateString('cs-CZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{project.title}</h1>
        <p className="mt-4 max-w-3xl text-lg text-ink-100">{project.shortDescription}</p>

        {/* Hero image */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-ink-500/60">
          <img
            src={project.image}
            alt={project.imageAlt || project.title}
            className="w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Content grid */}
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Purpose */}
            {project.purpose && (
              <section className="rounded-2xl border border-ink-500/60 bg-ink-700/30 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent-400" aria-hidden />
                  <h2 className="text-xl font-semibold text-white">Účel projektu</h2>
                </div>
                <p className="text-ink-100 leading-relaxed">{project.purpose}</p>
              </section>
            )}

            {/* Description */}
            {/* Description */}
            {project.description && (
              <section className="rounded-2xl border border-ink-500/60 bg-ink-700/30 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-accent-400" aria-hidden />
                  <h2 className="text-xl font-semibold text-white">Popis</h2>
                </div>
                <div 
                  className="text-ink-100 leading-relaxed space-y-4 [&>img]:rounded-xl [&>img]:max-h-96 [&>img]:mx-auto [&>img]:my-4 [&>img]:border [&>img]:border-ink-500/40"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              </section>
            )}

            {/* Steps */}
            {project.steps && project.steps.length > 0 && (
              <section className="rounded-2xl border border-ink-500/60 bg-ink-700/30 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-accent-400" aria-hidden />
                  <h2 className="text-xl font-semibold text-white">Postup</h2>
                </div>
                <ol className="space-y-4">
                  {project.steps.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-accent-500/40 bg-accent-500/10 font-mono text-sm font-bold text-accent-400">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{step.title}</h3>
                        <p className="mt-1 text-sm text-ink-100 leading-relaxed">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Code */}
            {project.code && (
              <section className="overflow-hidden rounded-2xl border border-ink-500/60">
                <div className="flex items-center gap-2 border-b border-ink-500/60 bg-ink-700/50 px-6 py-3">
                  <Code2 className="h-5 w-5 text-accent-400" aria-hidden />
                  <h2 className="text-sm font-semibold text-white">Zdrojový kód</h2>
                </div>
                <pre className="overflow-x-auto bg-ink-950 p-6">
                  <code className="font-mono text-xs leading-relaxed text-accent-300">
                    {project.code}
                  </code>
                </pre>
              </section>
            )}

            {/* Notes */}
            {project.notes && (
              <section className="rounded-2xl border border-circuit-amber/30 bg-circuit-amber/5 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <StickyNote className="h-5 w-5 text-circuit-amber" aria-hidden />
                  <h2 className="text-xl font-semibold text-white">Poznámky</h2>
                </div>
                <p className="text-ink-100 leading-relaxed">{project.notes}</p>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Components */}
            {project.components && project.components.length > 0 && (
              <section className="rounded-2xl border border-ink-500/60 bg-ink-700/30 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-accent-400" aria-hidden />
                  <h2 className="text-lg font-semibold text-white">Součástky</h2>
                </div>
                <ul className="space-y-2">
                  {project.components.map((c, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between border-b border-ink-500/30 pb-2 text-sm last:border-0"
                    >
                      <span className="text-ink-100">{c.name}</span>
                      <span className="font-mono text-xs text-accent-400">{c.qty}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Links */}
            {project.links && project.links.length > 0 && (
              <section className="rounded-2xl border border-ink-500/60 bg-ink-700/30 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">Odkazy</h2>
                <ul className="space-y-3">
                  {project.links.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-accent-400 transition-colors hover:text-accent-300"
                      >
                        <ExternalLink className="h-4 w-4 flex-shrink-0" aria-hidden />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {/* Komentáře a diskuze k danému projektu */}
        <ProjectComments projectSlug={project.slug} />
      </article>
    </>
  );
}