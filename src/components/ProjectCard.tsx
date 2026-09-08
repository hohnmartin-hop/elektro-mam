import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import type { Project } from '@/types';

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

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to={`/projekty/${project.slug}`}
      className="card group flex flex-col overflow-hidden animate-fade-in-up"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={project.image}
          alt={project.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 to-transparent" />
        <span
          className={`chip absolute left-3 top-3 ${categoryColors[project.category] ?? categoryColors.Ostatní}`}
        >
          {project.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-accent-400">
          {project.title}
        </h3>
        <p className="mt-2 flex-1 text-sm text-ink-200">{project.shortDescription}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-ink-300">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            {new Date(project.date).toLocaleDateString('cs-CZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-accent-400 transition-transform group-hover:translate-x-1">
            Zobrazit
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
