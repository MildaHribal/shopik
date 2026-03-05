import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { eq } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }

const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema });

// Images from public/test-images/
const I = (f: string) => `test-images/${f}`;

// Map: slug → images array (primary + extra)
const updates: { slug: string; images: string[] }[] = [
  {
    slug: 'neonove-anime-tricko',
    images: [I('anime.png'), I('gate.png'), I('tetko.png')],
  },
  {
    slug: 'bambusovy-ekosad',
    images: [I('bambus.png'), I('houba.png'), I('koralky.png')],
  },
  {
    slug: 'retro-kozene-boty',
    images: [I('boty.png'), I('boty2.png'), I('gate.png')],
  },
  {
    slug: 'sportovni-tenisky-pro',
    images: [I('boty2.png'), I('boty.png'), I('tetko.png')],
  },
  {
    slug: 'ivy-jemensky-hameleon',   // fallback – try both slugs
    images: [I('chamik.png'), I('chobotnice.png'), I('hvezdice.png')],
  },
  {
    slug: 'zivy-jemensky-hameleon',
    images: [I('chamik.png'), I('chobotnice.png'), I('hvezdice.png')],
  },
  {
    slug: 'plysova-chobotnice-duha',
    images: [I('chobotnice.png'), I('chamik.png'), I('houba.png')],
  },
  {
    slug: 'portret-divky-original',
    images: [I('devka.png'), I('mira.jpg'), I('obrazek.png')],
  },
  {
    slug: 'gate-limitovana-edice',
    images: [I('gate.png'), I('anime.png'), I('tetko.png')],
  },
  {
    slug: 'magicka-houba-dekorace',
    images: [I('houba.png'), I('hvezdice.png'), I('koralky.png')],
  },
  {
    slug: 'morska-hvezdice-sberatelska',
    images: [I('hvezdice.png'), I('chobotnice.png'), I('houba.png')],
  },
  {
    slug: 'manga-komiks-specialni-vydani',
    images: [I('komiks.png'), I('anime.png'), I('gate.png')],
  },
  {
    slug: 'koralkovy-nahrdelnik-boho',
    images: [I('koralky.png'), I('devka.png'), I('mira.jpg')],
  },
  {
    slug: 'abstraktni-obraz-cosmos',
    images: [I('obrazek.png'), I('devka.png'), I('mira.jpg')],
  },
  {
    slug: 'kaligraficke-luxusni-pero',
    images: [I('pero.png'), I('komiks.png'), I('bambus.png')],
  },
  {
    slug: 'tetovaci-rukav-tribal',
    images: [I('tetko.png'), I('anime.png'), I('gate.png')],
  },
  {
    slug: 'mira-originalni-fotografie',
    images: [I('mira.jpg'), I('devka.png'), I('obrazek.png')],
  },
];

async function updateImages() {
  console.log('🖼️  Updating product images...\n');

  let updated = 0;
  let skipped = 0;

  for (const { slug, images } of updates) {
    const result = await db
      .update(schema.products)
      .set({
        images,
        image: images[0],      // keep primary image in sync
        updatedAt: new Date(),
      })
      .where(eq(schema.products.slug, slug))
      .returning({ id: schema.products.id, name: schema.products.name });

    if (result.length > 0) {
      console.log(`  ✅ ${result[0].name} — ${images.length} obrázky`);
      updated++;
    } else {
      // Try a fuzzy-like approach: log skip (duplicate slugs handled above)
      skipped++;
    }
  }

  console.log(`\n🎉 Hotovo! Aktualizováno: ${updated}, přeskočeno (slug nenalezen): ${skipped}`);
  process.exit(0);
}

updateImages().catch(err => {
  console.error('❌ Chyba:', err);
  process.exit(1);
});
