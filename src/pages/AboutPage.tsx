import {
  Cpu,
  CircuitBoard,
  Printer,
  Flame,
  Fish,
  Home,
  Wrench,
  Heart,
} from 'lucide-react';
import { Seo } from '@/components/Seo';

const sections = [
  {
    icon: CircuitBoard,
    title: 'Elektronika',
    text: 'Schémata, obvody, součástky – od jednoduchých zapojení po komplexní systémy.',
    image:
      'https://images.pexels.com/photos/159220/printed-circuit-board-print-plate-via-macro-159220.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    imageAlt: 'Detailní záběr plošného spoje s mikročipy',
  },
  {
    icon: Cpu,
    title: 'Mikrokontroléry',
    text: 'ESP32, Arduino a další – aktuálně svádím epické bitvy s ESP32.',
    image:
      'https://images.pexels.com/photos/35652456/pexels-photo-35652456.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    imageAlt: 'Mikrokontrolér s šroubovákem na tmavém pozadí',
  },
  {
    icon: Printer,
    title: '3D tisk',
    text: 'Navrhuji vlastní díly a krabičky na míru pro elektronické projekty.',
    image:
      'https://images.pexels.com/photos/30720501/pexels-photo-30720501.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    imageAlt: '3D tiskárna při výrobě plastového dílu',
  },
  {
    icon: Flame,
    title: 'Laser',
    text: 'Gravírování a řezání laserem – od panelů po ozdobné předměty.',
    image:
      'https://images.pexels.com/photos/7254428/pexels-photo-7254428.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    imageAlt: 'Laserová gravírovací stroj při práci',
  },
];

const hobbies = [
  { icon: Fish, label: 'Rybaření', text: 'Relax s prutem u vody.' },
  { icon: Home, label: 'Zahrada', text: 'Domácí česneková sůl je legendární!' },
  { icon: Flame, label: 'Uzení', text: 'Hlídám klobásky u udírny.' },
  { icon: Heart, label: 'Vaření', text: 'Šéfkuchař pro Peťulu a syna Marka.' },
];

export function AboutPage() {
  return (
    <>
      <Seo
        title="O mně – Elektro MaM"
        description="Martin z Ostravy – bastlíř, nadšenec do elektroniky a krotitel hardwaru. ESP32, 3D tisk, laser, rybaření a vaření."
      />

      <section className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="rounded-2xl border border-ink-500/60 bg-ink-700/30 p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Kdo jsem</h1>
          <div className="mt-6 space-y-4 text-ink-100 leading-relaxed">
            <p>Ahoj! 👋</p>
            <p>
              Jmenuju se Martin a jsem hrdý bastlíř, nadšenec do elektroniky a krotitel hardwaru
              z Ostravy. ⚙️🔌
            </p>
            <p>
              Ve volném čase se nejraději hrabu v mikrokontrolérech – momentálně svádím epické
              bitvy s ESP32 🧠 – křísím k životu řídící jednotky elektrických koloběžek 🛴 nebo
              opravuju napájecí zdroje.
            </p>
            <p>
              Vedle pájení mě hodně chytlo také{' '}
              <strong className="text-white">3D modelování a 3D tisk</strong> 🖨️, kde si navrhuju
              vlastní díly a krabičky na míru. Baví mě také{' '}
              <strong className="text-white">gravírování a řezání laserem</strong>.
            </p>
            <p>
              Když zrovna nesedím v dílně, najdeš mě relaxovat s prutem u vody 🎣, na zahradě – moje
              domácí česneková sůl je legendární! 🧄✨ – nebo u udírny, kde bedlivě hlídám
              klobásky. 🌭💨
            </p>
            <p>
              A když zrovna nepájím, nelovím, neudím a nesázím? V tu chvíli se měním v šéfkuchaře
              👨‍🍳 pro svého úžasného syna Marka a mou nejlepší přítelkyni Peťulu. ❤️
            </p>
            <p>
              A světe div se – moje kuchařské experimenty jsou prý tak dobré, že je občas Peťula
              dokonce i sní! 😂🍽️
            </p>
            <p>
              Tenhle web jsem si vytvořil především jako svůj digitální šuplík 🗂️. Chci mít všechna
              svoje schémata, projekty, nápady, poznámky a zajímavosti na jednom místě, abych je
              nemusel lovit po počítači, discích, papírech a kdo ví kde ještě.
            </p>
            <p>
              A když už to mám všechno pohromadě, proč se o to nepodělit i s ostatními bastlíři? ⚡
            </p>
          </div>
        </div>

        {/* Activity sections */}
        <div className="mt-12 space-y-6">
          <h2 className="section-title">Co dělám</h2>
          {sections.map((s) => (
            <div
              key={s.title}
              className="card group grid overflow-hidden md:grid-cols-2"
            >
              <div className="relative aspect-video overflow-hidden md:aspect-auto">
                <img
                  src={s.image}
                  alt={s.imageAlt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent-500/40 bg-accent-500/10">
                    <s.icon className="h-5 w-5 text-accent-400" aria-hidden />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{s.title}</h3>
                </div>
                <p className="text-ink-100 leading-relaxed">{s.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* My workshop */}
        <div className="mt-12 rounded-2xl border border-ink-500/60 bg-ink-700/30 p-6 sm:p-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent-500/40 bg-accent-500/10">
              <Wrench className="h-5 w-5 text-accent-400" aria-hidden />
            </div>
            <h2 className="text-2xl font-bold text-white">Moje dílna</h2>
          </div>
          <p className="text-ink-100 leading-relaxed">
            Moje dílna je malé království v Ostravě, kde se potkává páječka, 3D tiskárna, laser a
            hromada součástek. Místo, kde vznikají projekty, které fungují (většinou na druhý
            pokus). Každý bastlíř ví, že organizace dílny je nekonečný proces – já organizuju,
            než se mi dostane další zásilka součástek a všechno se zase promění v chaos.
          </p>
        </div>

        {/* Hobbies */}
        <div className="mt-12">
          <h2 className="section-title mb-8">Co mě baví</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {hobbies.map((h) => (
              <div
                key={h.label}
                className="card group flex flex-col items-center p-6 text-center animate-fade-in-up"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-ink-500 bg-ink-800 transition-colors group-hover:border-accent-500/50">
                  <h.icon className="h-7 w-7 text-accent-400" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-white">{h.label}</h3>
                <p className="mt-2 text-sm text-ink-200">{h.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
