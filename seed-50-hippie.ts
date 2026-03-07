import 'dotenv/config';
import { db, queryClient } from './server/utils/db';
import { products, categories } from './server/database/schema';
import { eq } from 'drizzle-orm';

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const catMap = {
  'Moda': ['Pončo', 'Kalhoty zvonáče', 'Tričko', 'Kardigan', 'Šátek', 'Svetr', 'Košile', 'Kabátek', 'Šaty', 'Sukně'],
  'Bizuterie': ['Náhrdelník', 'Náramek', 'Prsten', 'Náušnice', 'Přívěsek', 'Korále', 'Amulet', 'Talisman', 'Brož'],
  'Doplnky': ['Batoh z konopí', 'Lapač snů', 'Taška přes rameno', 'Klobouk', 'Čelenka', 'Pásek', 'Vykuřovadlo', 'Zvonkohra', 'Šála'],
  'Obrazy': ['Plátno Mandaly', 'Obraz Buddhy', 'Kresba Stromu života', 'Malba na hedvábí', 'Yantra poster', 'Obraz lotosu', 'Tapiserie slunce', 'Květ života'],
  'Ostatni': ['Tibetská mísa', 'Sada krystalů', 'Esenciální olej', 'Vonné tyčinky', 'Orgónitová pyramida', 'Solná lampa', 'Tarotové karty', 'Zpívající miska', 'Bílá šalvěj']
};

const prefixes = [
  'Magický', 'Duchovní', 'Hippie', 'Etno', 'Šamanský', 'Čakrový', 'Přírodní', 
  'Barevný', 'Posvátný', 'Tibetský', 'Indický', 'Nepálský', 'Boho', 'Vesmírný', 'Meditativní'
];

const adjectives = [
  'harmonie', 's vesmírnou energií', 'plný lásky', 'pro vnitřní mír', 'z udržitelných zdrojů', 
  'ručně dělaný', 'požehnaný', 'z dalekého východu', 's motivem slunce', 'v barvách aury'
];

async function main() {
  console.log('Fetching all categories...');
  const allCats = await db.select().from(categories);
  
  const dbCats = [];
  const catNames = Object.keys(catMap);
  
  for (const name of catNames) {
    const slug = slugify(name);
    let cat = allCats.find(c => c.slug === slug);
    
    if (!cat) {
      console.log(`Creating category: ${name}`);
      const inserted = await db.insert(categories).values({
        name,
        slug
      }).returning();
      cat = inserted[0];
    }
    dbCats.push(cat);
  }

  const itemsToInsert = [];
  
  for (let i = 1; i <= 50; i++) {
    const randomCatName = catNames[Math.floor(Math.random() * catNames.length)];
    const catId = dbCats.find(c => c.slug === slugify(randomCatName))!.id;
    
    const possibleItems = catMap[randomCatName as keyof typeof catMap];
    const itemType = possibleItems[Math.floor(Math.random() * possibleItems.length)];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    
    const name = `${prefix} ${itemType.toLowerCase()}`;
    
    itemsToInsert.push({
      name: name,
      slug: slugify(`${name}-${i}-${Date.now().toString().slice(-4)}`),
      description: `Ponořte se do pohody. Tento ${itemType.toLowerCase()} je přesně to, co vaše cesta potřebuje. ${adjective.charAt(0).toUpperCase() + adjective.slice(1)}.`,
      shortDescription: `Krásný ${itemType.toLowerCase()} v etno stylu.`,
      price: Math.floor(Math.random() * 2000) + 150,
      stock: Math.floor(Math.random() * 50) + 1,
      image: `https://loremflickr.com/600/600/hippie,boho?random=${i}`,
      categoryId: catId,
    });
  }

  console.log('Inserting 50 products...');
  await db.insert(products).values(itemsToInsert);
  
  console.log(`Successfully seeded 50 ethno/hippie products!`);
  
  await queryClient.end();
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
