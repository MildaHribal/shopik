import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema });

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ── Test Products using images from /public/test-images/ ─────────────────────
const testProducts = [
  {
    name: 'Neonové Anime Tričko',
    category: 'Oblečení',
    price: 649,
    stock: 22,
    image: 'test-images/anime.png',
    images: ['test-images/anime.png'],
    description: 'Zářivě barevné tričko s potiskem inspirovaným japonskou anime kulturou. Vyrobeno z prémiové bavlny, omyvatelné na 30 °C. Dostupné ve velikostech S–XXL.',
    shortDescription: 'Anime tričko z prémiové bavlny, unisex střih.',
  },
  {
    name: 'Bambusový Ekosad',
    category: 'Hygiena',
    price: 299,
    stock: 45,
    image: 'test-images/bambus.png',
    images: ['test-images/bambus.png'],
    description: 'Ekologická sada bambusových produktů pro každodenní hygienu. Obsahuje kartáček na zuby, žiletku a hřeben – vše ze 100% přírodního bambusu. Šetrné k přírodě i vaší peněžence.',
    shortDescription: 'Ekologická sada z bambusu – zero waste řešení.',
  },
  {
    name: 'Retro Kožené Boty',
    category: 'Obuv',
    price: 1890,
    stock: 10,
    image: 'test-images/boty.png',
    images: ['test-images/boty.png'],
    description: 'Klasické kožené boty s retro designem. Pevná podrážka, pohodlná stélka a trvanlivá kůže zaručují, že vám vydrží roky. Velikosti 38–46.',
    shortDescription: 'Klasické retro boty z pravé kůže.',
  },
  {
    name: 'Sportovní Tenisky Pro',
    category: 'Obuv',
    price: 2390,
    stock: 8,
    image: 'test-images/boty2.png',
    images: ['test-images/boty2.png'],
    description: 'Lehké sportovní tenisky s inovativní tlumicí technologií. Prodyšná síťovina a anatomická stélka jsou ideální pro jogging, gym i každodenní nošení. Velikosti 37–47.',
    shortDescription: 'Lehké tenisky s tlumicí technologií.',
  },
  {
    name: 'Živý Jemenský Chameleón',
    category: 'Zvířata',
    price: 3500,
    stock: 3,
    image: 'test-images/chamik.png',
    images: ['test-images/chamik.png'],
    description: 'Úžasný jemenský chameleón (Chamaeleo calyptratus), odchovaný v zajetí. Dodáváme s certifikátem původu, startovacím teráriem a podrobným průvodcem péče. Minimální věk kupujícího: 18 let.',
    shortDescription: 'Jemenský chameleón s certifikátem a teráriem.',
  },
  {
    name: 'Plyšová Chobotnice Duha',
    category: 'Hračky',
    price: 349,
    stock: 30,
    image: 'test-images/chobotnice.png',
    images: ['test-images/chobotnice.png'],
    description: 'Roztomilá plyšová chobotnice v pastelových duhových barvách. Měkká výplň, bezpečná pro děti od 3 let. Ideální dárek i dekorace do pokoje. Rozměry: 40 × 30 cm.',
    shortDescription: 'Měkká duhová plyšová chobotnice, 40 cm.',
  },
  {
    name: 'Portrét Dívky – Originál',
    category: 'Umění',
    price: 4200,
    stock: 1,
    image: 'test-images/devka.png',
    images: ['test-images/devka.png'],
    description: 'Originální olejomalba na plátně s portrétem tajemné dívky v impresionistickém stylu. Rozměry: 60 × 80 cm. Opatřeno certifikátem pravosti a podpisem autora. Dodáváme v ochranném obalu.',
    shortDescription: 'Originální olejomalba, 60×80 cm, certifikát.',
  },
  {
    name: 'Gate – Limitovaná Edice',
    category: 'Oblečení',
    price: 990,
    stock: 7,
    image: 'test-images/gate.png',
    images: ['test-images/gate.png'],
    description: 'Limitovaná streetwear kolekce Gate s grafickým potiskem inspirovaným kybernetickou estetikou. Oversized střih z těžké bavlny 320 g/m². Pouze 50 kusů na světě.',
    shortDescription: 'Limitovaná streetwear kolekce, heavy cotton.',
  },
  {
    name: 'Magická Houba – Dekorace',
    category: 'Dekorace',
    price: 220,
    stock: 25,
    image: 'test-images/houba.png',
    images: ['test-images/houba.png'],
    description: 'Roztomilá keramická dekorace ve tvaru muchomůrky s ručně malovanými detaily. Ideální do bytu, na polici nebo jako dárek pro milovníky přírody a fantazie. Výška: 12 cm.',
    shortDescription: 'Ruční keramická dekorace – muchomůrka, 12 cm.',
  },
  {
    name: 'Mořská Hvězdice – Sběratelská',
    category: 'Dekorace',
    price: 380,
    stock: 12,
    image: 'test-images/hvezdice.png',
    images: ['test-images/hvezdice.png'],
    description: 'Přírodní sušená mořská hvězdice upravená pro dekorativní účely. Každý kus je jedinečný tvarem i barvou. Vhodná jako dekorace do koupelny, obývacího pokoje nebo jako dárek. Průměr: cca 15 cm.',
    shortDescription: 'Přírodní sušená mořská hvězdice, ~15 cm.',
  },
  {
    name: 'Manga Komiks – Speciální Vydání',
    category: 'Knihy',
    price: 490,
    stock: 18,
    image: 'test-images/komiks.png',
    images: ['test-images/komiks.png'],
    description: 'Speciální vydání oblíbené manga série s exkluzivní vazbou a bonusovými kapitolami. 320 stran plných akce, humoru a nečekaných zvratů. Ideální pro sběratele i nové fanoušky.',
    shortDescription: 'Manga speciál, 320 stran, exkluzivní vazba.',
  },
  {
    name: 'Korálkový Náhrdelník – Boho',
    category: 'Šperky',
    price: 599,
    stock: 20,
    image: 'test-images/koralky.png',
    images: ['test-images/koralky.png'],
    description: 'Ručně vyráběný boho náhrdelník z přírodních korálků – achát, tyrkys a dřevěné perle. Délka 60 cm s možností zkrácení. Každý kus je originál. Dodáváme v dárkové krabičce.',
    shortDescription: 'Ručně vyráběný boho náhrdelník z přírodních korálků.',
  },
  {
    name: 'Abstraktní Obraz Cosmos',
    category: 'Umění',
    price: 6800,
    stock: 1,
    image: 'test-images/obrazek.png',
    images: ['test-images/obrazek.png'],
    description: 'Velkoformátová abstraktní malba akrylem inspirovaná hlubokým vesmírem. Teplé purpurové, modré a zlaté tóny створují na plátně hypnotický efekt. Rozměry: 100 × 120 cm. Rámováno.',
    shortDescription: 'Akrylová malba vesmír, 100×120 cm, rámovaná.',
  },
  {
    name: 'Kaligrafické Luxusní Pero',
    category: 'Kancelář',
    price: 780,
    stock: 15,
    image: 'test-images/pero.png',
    images: ['test-images/pero.png'],
    description: 'Plnicí pero pro kaligrafii a každodenní psaní. Tělo z leštěného kovu, zlatý hrot 0,7 mm. Součástí balení je inkoust a čisticí set. Ideální dárek pro milovníky psaní.',
    shortDescription: 'Plnicí pero z kovu, zlatý hrot, 0.7 mm.',
  },
  {
    name: 'Tetovací Rukáv Tribal',
    category: 'Doplňky',
    price: 399,
    stock: 35,
    image: 'test-images/tetko.png',
    images: ['test-images/tetko.png'],
    description: 'Elastický tetovací rukáv s tribálním vzorem, který si jednoduše nasadíte. Ideální pro festivaly, cosplay nebo jen pro styl. Unisex, univerzální velikost. Pratelné, barvy nevyblédnou.',
    shortDescription: 'Elastický tribální tetovací rukáv, unisex.',
  },
  {
    name: 'Mira – Originální Fotografie',
    category: 'Umění',
    price: 1200,
    stock: 5,
    image: 'test-images/mira.jpg',
    images: ['test-images/mira.jpg'],
    description: 'Limitovaná série uměleckých fotografií ženského portrétu v minimalistickém stylu. Tisk na fotopapíru Hahnemühle, formát A3, číslovaná edice 1/5 až 5/5. Dodáváme s certifikátem.',
    shortDescription: 'Umělecká fotografie, A3, číslovaná edice 1–5.',
  },
];

async function seedTestProducts() {
  console.log('🌱 Seeding test products...');

  // Ensure categories exist
  const uniqueCategories = [...new Set(testProducts.map(p => p.category))];
  await db
    .insert(schema.categories)
    .values(uniqueCategories.map(name => ({ name, slug: slugify(name) })))
    .onConflictDoNothing();

  const allCategories = await db.select().from(schema.categories);
  const categoryMap = new Map(allCategories.map(c => [c.name, c.id]));
  console.log(`  ✅ Categories ready (${allCategories.length} total)`);

  // Insert products
  let count = 0;
  for (const p of testProducts) {
    const slug = slugify(p.name);
    const inserted = await db
      .insert(schema.products)
      .values({
        name: p.name,
        slug,
        description: p.description,
        shortDescription: p.shortDescription,
        price: p.price,
        stock: p.stock,
        image: p.image,
        images: p.images,
        categoryId: categoryMap.get(p.category) ?? null,
      })
      .onConflictDoNothing()
      .returning();

    if (inserted.length > 0) {
      count++;
      console.log(`  + ${p.name} (${p.category}) — ${p.price} Kč`);
    } else {
      console.log(`  ~ ${p.name} — přeskočeno (slug již existuje)`);
    }
  }

  console.log(`\n🎉 Hotovo! Vloženo ${count} nových produktů.`);
  process.exit(0);
}

seedTestProducts().catch(err => {
  console.error('❌ Seed selhal:', err);
  process.exit(1);
});
