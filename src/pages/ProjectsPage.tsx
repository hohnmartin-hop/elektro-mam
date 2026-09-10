import { useState, useMemo, useEffect } from 'react';
import { FolderKanban } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { ProjectCard } from '@/components/ProjectCard';
import { projects as initialProjects, categories } from '@/data/projects';
import { supabase } from '@/supabase';
import type { Project, ProjectCategory } from '@/types';

type Filter = 'Vše' | ProjectCategory;

export function ProjectsPage() {
  const [filter, setFilter] = useState<Filter>('Vše');
  const [projectList, setProjectList] = useState<Project[]>(initialProjects);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          console.error('Chyba při stahování projektů ze Supabase:', error.message);
          return;
        }

        if (data && data.length > 0) {
          setProjectList(data as Project[]);
        }
      } catch (err) {
        console.error('Neočekávaná chyba při načítání projektů:', err);
      }
    }

    fetchProjects();
  }, []);

  const filtered = useMemo(() => {
    const sorted = [...projectList].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    if (filter === 'Vše') return sorted;
    return sorted.filter((p) => p.category === filter);
  }, [filter, projectList]);

  const filters: Filter[] = ['Vše', ...categories];

  return (
    <>
      <Seo
        title="Projekty – Elektro MaM"
        description="Elektronické projekty: ESP32, Arduino, napájecí zdroje, opravy, DIY, 3D tisk a mikroelektronika."
      />

      <section className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent-500/40 bg-accent-500/10">
            <FolderKanban className="h-6 w-6 text-accent-400" aria-hidden />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Elektronické projekty</h1>
            <p className="mt-1 text-ink-200">Katalog projektů z mé dílny a z internetu.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`chip transition-all ${
                filter === f
                  ? 'border-accent-500 bg-accent-500/15 text-accent-300'
                  : 'border-ink-500 bg-ink-700/40 text-ink-200 hover:border-accent-500/50 hover:text-ink-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-ink-500/60 bg-ink-700/30 p-12 text-center">
            <p className="text-ink-200">
              V kategorii <span className="font-semibold text-white">{filter}</span> zatím nejsou žádné projekty.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
