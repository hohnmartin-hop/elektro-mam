import type { Recipe } from '@/types';

export const recipes: Recipe[] = [
  {
    slug: 'cesnekova-sul',
    title: 'Domácí česneková sůl',
    shortDescription:
      'Legendární česneková sůl z Ostravy – dokonalé koření na maso, brambory i pečivo.',
    image:
      'https://images.pexels.com/photos/28224321/pexels-photo-28224321.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    imageAlt: 'Stroužek česneku na vrstvě soli',
    date: '2026-08-01',
    intro:
      'Moje domácí česneková sůl je prý legendární – alespoň to říkají rodina a přátelé. Recept je jednoduchý, ale výsledek je neuvěřitelný. Hodí se na grilované maso, brambory, pečivo i do polévek.',
    ingredients: [
      { name: 'Hrubá mořská sůl', amount: '200 g' },
      { name: 'Česnek (čerstvý)', amount: '5–6 stroužků' },
      { name: 'Sušený tymián', amount: '1 lžička' },
      { name: 'Sušený rozmarýn', amount: '1/2 lžičky' },
      { name: 'Černý pepř mletý', amount: '1/2 lžičky' },
    ],
    steps: [
      {
        body: 'Oloupej stroužky česneku a rozmělj je v hmoždíři na pastu. Můžeš použít i lis, ale v hmoždíři se uvolní více chuti.',
      },
      {
        body: 'Přidej hrubou mořskou sůl k česnekové pastě a důkladně promíchej. Sůl začne absorbovat vlhkost z česneku.',
      },
      {
        body: 'Přidej sušený tymián, rozmarýn a černý pepř. Všechno důkladně promíchej.',
      },
      {
        body: 'Rozlož směs na pečící papír a nech sušit při pokojové teplotě 24–48 hodin. Můžeš ji i sušit v troubě při 50°C s mírně pootevřenými dvířky po dobu 2–3 hodin.',
      },
      {
        body: 'Po usušení přesuň do skleněné nádoby s těsným víčkem. Skladuj na chladném a suchém místě. Výdržnost je 3–6 měsíců.',
      },
    ],
    notes:
      'Pro extra pikantní verzi přidej špetku chilli vloček. Pro jemnější chuť použij jemnější sůl.',
    servings: '200 g',
    prepTime: '10 minut + sušení 24 h',
  },
  {
    slug: 'udene-klobasky',
    title: 'Uzené klobásky z udírny',
    shortDescription:
      'Tradiční české klobásky uzené za studena s dřevěným uzeným aroma a zlatavou barvou.',
    image:
      'https://images.pexels.com/photos/6769760/pexels-photo-6769760.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    imageAlt: 'Grilované klobásy a uzeniny na roštu',
    date: '2026-07-05',
    intro:
      'Když zrovna nepájím, sedím u udírny a hlídám klobásy. Tady je můj osvědčený recept na domácí uzené klobásky, které dělám každé léto.',
    ingredients: [
      { name: 'Vepřové maso (plec)', amount: '1 kg' },
      { name: 'Vepřové sádlo', amount: '200 g' },
      { name: 'Solný nálev (nitritovaná sůl)', amount: '22 g' },
      { name: 'Mletý černý pepř', amount: '1 lžička' },
      { name: 'Mletý nové koření', amount: '1/2 lžičky' },
      { name: 'Česnek granulovaný', amount: '1 lžička' },
      { name: 'Střeva (ovčí nebo vepřová)', amount: 'dle potřeby' },
    ],
    steps: [
      {
        body: 'Maso a sádlo nakrájej na kostky cca 2–3 cm. Smíchej se solí, pepřem, novým kořením a česnekem. Nech v chladu 24 hodin proležet.',
      },
      {
        body: 'Několik hodin před náplní namoč střeva do vlažné vody, aby změkla a dala se snadno navléct na stříkačku.',
      },
      {
        body: 'Naplň střeva masovou směsí pomocí klobásové stříkačky. Dělej klobásky dlouhé cca 15 cm, provážej nebo spiráluj.',
      },
      {
        body: 'Klobásky pověz do udírny a udři za studena při 50–60°C po dobu 4–6 hodin. Použij bukové nebo dřevěné hobliny.',
      },
      {
        body: 'Po uzení klobásky nech zchladnout a ulož do chladu. Nech odležet minimálně 24 hodin před konzumací.',
      },
    ],
    notes:
      'Teplota v udírně nesmí překročit 60°C – jinak se klobásky upečou místo uzení. Dbej na to, aby dřevo nehořelo, jen tlelo.',
    servings: 'cca 10 klobásek',
    prepTime: '30 minut + odležení 24 h + uzení 4–6 h',
  },
  {
    slug: 'rybar-pstruh-na-morech',
    title: 'Pstruh na másle s bylinkami',
    shortDescription:
      'Jednoduchý recept na čerstvě uloveného pstruha – klasika pro rybáře od vody.',
    image:
      'https://images.pexels.com/photos/39278090/pexels-photo-39278090.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    imageAlt: 'Muž rybařící u klidného jezera s prutem',
    date: '2026-06-20',
    intro:
      'Když mám štěstí u vody, připravím si čerstvého pstruha přímo na břehu. Recept je jednoduchý – čerstvá ryba, máslo, bylinky a trocha citronu.',
    ingredients: [
      { name: 'Pstruh (celý, vykuchaný)', amount: '1 ks (cca 400 g)' },
      { name: 'Máslo', amount: '50 g' },
      { name: 'Citron', amount: '1/2 ks' },
      { name: 'Čerstvý tymián', amount: 'snítka' },
      { name: 'Čerstvý rozmarýn', amount: 'snítka' },
      { name: 'Sůl a pepř', amount: 'dle chuti' },
      { name: 'Olivový olej', amount: '1 lžíce' },
    ],
    steps: [
      {
        body: 'Pstruha očisti, osuš papírovým ubrouskem. Zvenku i zevnitř osol a opepři. Do břicha vlož snítky tymiánu a rozmarýnu.',
      },
      {
        body: 'Rozpal pánev nebo gril s trochou olivového oleje. Polož pstruha na pánev a opeč z jedné strany 4–5 minut, dokud kůže nezezlátne.',
      },
      {
        body: 'Otoč a opeč z druhé strany další 3–4 minuty. Během opékání přidej máslo a lžící polévej rybu máslem.',
      },
      {
        body: 'Na konci vymačkaj na rybu šťávu z půlky citronu. Podávej s čerstvým chlebem a plátkem citronu.',
      },
    ],
    notes:
      'Pozor, aby ses nepřepekl – pstruh je rychle hotový. Maso má být u kosti jemně růžové, ne bílé suché.',
    servings: '1 porce',
    prepTime: '15 minut',
  },
];
