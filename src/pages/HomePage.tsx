import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, CircuitBoard, Wrench, Printer, Zap } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { ProjectCard } from '@/components/ProjectCard';
import { projects } from '@/data/projects';

const infoBlocks = [
  {
    icon: CircuitBoard,
    title: 'Elektronika',
    text: 'Schémata, obvody, součástky a praktické zapojení.',
    color: 'text-accent-400',
  },
  {
    icon: Cpu,
    title: 'Mikrokontroléry',
    text: 'ESP32, Arduino a další mikrokontroléry.',
    color: 'text-circuit-green',
  },
  {
    icon: Wrench,
    title: 'DIY projekty',
    text: 'Vlastní konstrukce, opravy, úpravy a experimenty.',
    color: 'text-circuit-amber',
  },
  {
    icon: Printer,
    title: '3D tisk',
    text: 'Modelování součástek, krabiček a mechanických dílů pro elektroniku.',
    color: 'text-circuit-green',
  },
];

const featuredProjects = [...projects]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 3);

export function HomePage() {
  return (
    <>
      <Seo
        title="Elektro MaM – Elektronická laboratoř"
        description="Osobní databáze schémat, součástek a bastlení. Projekty s ESP32, Arduinem, napájecími zdroji, opravami elektroniky a 3D tiskem."
      />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pcb-dots absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-content px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="max-w-3xl">
            <div className="animate-fade-in flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/5 px-4 py-1.5 text-xs font-medium text-accent-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
              </span>
              Osobní digitální dílna · Ostrava
            </div>

            <h1 className="animate-fade-in-up mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              ELEKTRO <span className="text-gradient">MaM</span>
            </h1>

            <p className="animate-fade-in-up mt-6 max-w-2xl text-lg leading-relaxed text-ink-100 sm:text-xl">
              Místo pro elektroniku, mikroelektroniku, bastlení a všechny projekty,
              které by byla škoda zapomenout.
            </p>

            <div className="animate-fade-in-up mt-8 flex flex-wrap gap-4">
              <Link to="/projekty" className="btn-primary">
                Prohlédnout projekty
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/o-mne" className="btn-secondary">
                O mně
              </Link>
            </div>

            {/* Stats */}
            <div className="animate-fade-in-up mt-12 flex flex-wrap gap-8">
              <div>
                <div className="font-mono text-2xl font-bold text-accent-400">{projects.length}</div>
                <div className="text-xs text-ink-300">Projektů</div>
              </div>
              <div className="h-10 w-px bg-ink-500" />
              <div>
                <div className="font-mono text-2xl font-bold text-accent-400">∞</div>
                <div className="text-xs text-ink-300">Nápadů</div>
              </div>
              <div className="h-10 w-px bg-ink-500" />
              <div>
                <div className="font-mono text-2xl font-bold text-accent-400">24/7</div>
                <div className="text-xs text-ink-300">Bastlení</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO TEXT */}
      <section className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-ink-500/60 bg-ink-700/30 p-6 sm:p-10">
          <div className="mb-6 flex items-center gap-3">
            <Zap className="h-6 w-6 text-accent-400" aria-hidden />
            <h2 className="text-2xl font-bold text-white">Vítej v mé osobní databázi</h2>
          </div>
          <div className="space-y-4 text-ink-100 leading-relaxed">
            <p>
              Vítej v mé osobní databázi schémat, součástek a bastlení. Tento web slouží jako
              můj osobní deník, katalog projektů a digitální šuplík plný elektroniky.
            </p>
            <p>
              Najdeš tu elektronické obvody a zařízení, které jsem navrhl a vytvořil sám, ale také
              spoustu zajímavých projektů, které pocházejí z internetu od známých i neznámých autorů.
            </p>
            <p>
              Zkrátka všechno, co mě zaujalo, co jsem si postavil, opravil, upravil nebo co podle mě
              stojí za to uchovat. Od jednoduchých zapojení až po mikrokontroléry, napájecí zdroje,
              opravy elektroniky, ESP32 a další bastlířské projekty. 🛠️⚡
            </p>
          </div>
        </div>
      </section>

      {/* INFO BLOCKS */}
      <section className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="section-title mb-10 text-center">Co tu najdeš</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {infoBlocks.map((block) => (
            <div
              key={block.title}
              className="card group p-6 text-center animate-fade-in-up"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-ink-500 bg-ink-800 transition-colors group-hover:border-accent-500/50">
                <block.icon className={`h-7 w-7 ${block.color}`} aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-white">{block.title}</h3>
              <p className="mt-2 text-sm text-ink-200">{block.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LATEST PROJECTS */}
      <section className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="section-title">Nejnovější projekty</h2>
            <p className="mt-2 text-ink-200">To nejčerstvější z dílny.</p>
          </div>
          <Link
            to="/projekty"
            className="hidden items-center gap-1 text-sm font-medium text-accent-400 hover:text-accent-300 sm:flex"
          >
            Všechny projekty
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link to="/projekty" className="btn-secondary">
            Všechny projekty
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
