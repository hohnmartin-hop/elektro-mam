const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env', 'utf8');
const getVal = (k) => (env.split('\n').find(l => l.startsWith(k + '=')) || '').split('=')[1]?.trim();
const url = getVal('VITE_SUPABASE_URL');
const key = getVal('VITE_SUPABASE_ANON_KEY');

const sb = createClient(url, key);

async function run() {
  const email = 'martin.hohn@seznam.cz';
  const password = 'Hopicek151518';

  console.log('Přihlašuji do Supabase...');
  const { error: authErr } = await sb.auth.signInWithPassword({ email, password });
  if (authErr) {
    console.error('Chyba přihlášení:', authErr.message);
    process.exit(1);
  }
  console.log('Přihlášení v pořádku.');

  try {
    const content = fs.readFileSync('src/data/recipes.ts', 'utf8');
    const match = content.match(/export const recipes: Recipe\[\] = (\[[\s\S]*?\]);/);
    if (!match) {
      console.error('Nenalezeno pole receptů v src/data/recipes.ts');
      process.exit(1);
    }

    const recipes = eval(match[1]);
    console.log(`Načteno ${recipes.length} receptů z lokálního souboru.`);
    console.log('Nahrávám do tabulky recipes v Supabase...');

    const { error: upsertErr } = await sb.from('recipes').upsert(recipes);
    if (upsertErr) {
      console.error('Chyba při nahrávání:', upsertErr.message);
      process.exit(1);
    }

    console.log('Všechny recepty byly úspěšně nahrány!');
  } catch (err) {
    console.error('Neočekávaná chyba:', err.message);
    process.exit(1);
  }
}

run();
