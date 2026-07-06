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
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const IMG = '/uploads/products';

type ProductSeed = {
  name: string;
  category: string;
  price: number;
  stock: number;
  shortDescription: string;
  description: string;
  images: string[];
};

const productSeed: ProductSeed[] = [
  {
    name: 'Oko v listu',
    category: 'Sochy',
    price: 890,
    stock: 1,
    shortDescription: 'Nástěnná soška z papírmašé — zelený list s hlídajícím okem.',
    description:
      'Ručně tvarovaná nástěnná soška z papírmašé, natřená sytě zelenou akrylovou barvou. Uprostřed dominuje malované oko — talisman, který ti hlídá pokoj. Originál, jeden kus. Rozměr cca 25 cm.',
    images: [
      `${IMG}/oko-v-listu-1.jpg`,
      `${IMG}/oko-v-listu-2.jpg`,
      `${IMG}/oko-v-listu-3.jpg`,
    ],
  },
  {
    name: 'Klíčenka Medúza z hlubin',
    category: 'Klíčenky',
    price: 350,
    stock: 1,
    shortDescription: 'Ruční klíčenka s malovanou medúzou, minerály a mušlí.',
    description:
      'Klíčenka poskládaná ručně: kresba medúzy zalitá v resinu, mléčné minerály, mušlička a stříbrné hvězdičky. Modré tóny — pro mořské duše. Originál, jeden kus.',
    images: [
      `${IMG}/meduza-klicenka-1.jpg`,
      `${IMG}/meduza-klicenka-2.jpg`,
    ],
  },
  {
    name: 'Klíčenka Hvězdný můr',
    category: 'Klíčenky',
    price: 350,
    stock: 1,
    shortDescription: 'Ruční klíčenka s kresbou noční můry, růžovými hvězdami a křídlem.',
    description:
      'Klíčenka s kresbou noční můry v resinu, růžovou pastelovou hvězdičkou, fialovým broušeným korálkem a andělským křídlem. Trochu snění, trochu tma. Originál, jeden kus.',
    images: [
      `${IMG}/hvezdny-mur-klicenka-1.jpg`,
      `${IMG}/hvezdny-mur-klicenka-2.jpg`,
    ],
  },
  {
    name: 'Ganja elfka — obraz',
    category: 'Obrazy',
    price: 1490,
    stock: 1,
    shortDescription: 'Malba růžovovlasé elfky s koláží a srdíčkem.',
    description:
      'Akrylová malba na plátně kombinovaná s koláží — růžovovlasá elfka na pozadí modré oblohy a rostlinného motivu. Sytá barevnost, komiksový styl. Originál, signováno.',
    images: [
      `${IMG}/ganja-elfka-1.jpg`,
    ],
  },
  {
    name: 'Duhový drak — obraz',
    category: 'Obrazy',
    price: 1290,
    stock: 1,
    shortDescription: 'Frilled dragon v duhových plamenech pod měsícem.',
    description:
      'Akrylová malba na plátně — límcový drak (frilled dragon) v duhových plamenech, pod měsícem a mezi hvězdami. Psychedelické barvy, hodně energie. Originál na napnutém plátně.',
    images: [
      `${IMG}/duhovy-drak-1.jpg`,
      `${IMG}/duhovy-drak-2.jpg`,
    ],
  },
  {
    name: 'Nazar set — houba a miska',
    category: 'Sochy',
    price: 1590,
    stock: 1,
    shortDescription: 'Ruční set: muchomůrka s očima a duhová miska s tureckým okem.',
    description:
      'Set dvou ručně modelovaných kousků z hmoty a akrylu: červená muchomůrka posetá zelenými očima + duhová miska s tureckými oky na zelené glazuře. Prodávané společně jako talisman-set. Originál, jeden kus.',
    images: [
      `${IMG}/nazar-set-1.jpg`,
      `${IMG}/nazar-set-2.jpg`,
      `${IMG}/nazar-set-3.jpg`,
      `${IMG}/nazar-set-4.jpg`,
      `${IMG}/nazar-set-5.jpg`,
    ],
  },
];

async function seed() {
  console.log('🌱 Seeding database...');

  console.log('🗑️  Clearing existing products & related data...');
  await db.delete(schema.favorites);
  await db.delete(schema.reviews);
  await db.delete(schema.orderItems);
  await db.delete(schema.orders);
  await db.delete(schema.products);
  await db.delete(schema.categories);

  const uniqueCategories = [...new Set(productSeed.map((p) => p.category))];
  const insertedCategories = await db
    .insert(schema.categories)
    .values(uniqueCategories.map((name) => ({ name, slug: slugify(name) })))
    .returning();
  const categoryMap = new Map(insertedCategories.map((c) => [c.name, c.id]));
  console.log(`  ✅ ${insertedCategories.length} categories`);

  const insertedProducts = await db
    .insert(schema.products)
    .values(
      productSeed.map((p) => ({
        name: p.name,
        slug: slugify(p.name),
        description: p.description,
        shortDescription: p.shortDescription,
        price: p.price,
        stock: p.stock,
        image: p.images[0],
        images: p.images,
        categoryId: categoryMap.get(p.category) ?? null,
      })),
    )
    .returning();
  console.log(`  ✅ ${insertedProducts.length} products`);

  console.log('🎉 Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
