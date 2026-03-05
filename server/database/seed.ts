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

// ── Helper ──────────────────────────────────────────────────────────────────────
function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ── Seed Data ───────────────────────────────────────────────────────────────────
const productData = [
  { name: 'Stylové boty',         category: 'Obuv',      price: 1200, image: 'boty.png',       stock: 12 },
  { name: 'Značkové boty',        category: 'Obuv',      price: 2500, image: 'boty2.png',      stock: 8  },
  { name: 'Gate',                  category: 'Oblečení',  price: 800,  image: 'gate.png',       stock: 15 },
  { name: 'Anime tričko',         category: 'Oblečení',  price: 600,  image: 'anime.png',      stock: 20 },
  { name: 'Tetovací rukáv',       category: 'Doplňky',   price: 450,  image: 'tetko.png',      stock: 30 },
  { name: 'Pero',                 category: 'Kancelář',  price: 120,  image: 'pero.png',       stock: 50 },
  { name: 'Dívka',                category: 'Umění',     price: 1500, image: 'devka.png',      stock: 3  },
  { name: 'Bambusový kartáček',   category: 'Hygiena',   price: 50,   image: 'bambus.png',     stock: 40 },
  { name: 'Chameleón',            category: 'Zvířata',   price: 2000, image: 'chamik.png',     stock: 2  },
  { name: 'Komiksový sešit',      category: 'Knihy',     price: 150,  image: 'komiks.png',     stock: 25 },
  { name: 'Korálky',              category: 'Šperky',    price: 300,  image: 'koralky.png',    stock: 18 },
  { name: 'Obraz',                category: 'Umění',     price: 5000, image: 'obrazek.png',    stock: 1  },
  { name: 'Mořská hvězdice',      category: 'Dekorace',  price: 250,  image: 'hvezdice.png',   stock: 10 },
  { name: 'Chobotnice',           category: 'Hračky',    price: 400,  image: 'chobotnice.png', stock: 14 },
  { name: 'Letní sandály',        category: 'Obuv',      price: 950,  image: 'boty.png',       stock: 9  },
  { name: 'Sportovní tenisky',    category: 'Obuv',      price: 1800, image: 'boty2.png',      stock: 6  },
  { name: 'Džínové kraťasy',      category: 'Oblečení',  price: 700,  image: 'gate.png',       stock: 22 },
  { name: 'Manga tričko',         category: 'Oblečení',  price: 550,  image: 'anime.png',      stock: 17 },
  { name: 'Luxusní pero',         category: 'Kancelář',  price: 500,  image: 'pero.png',       stock: 35 },
  { name: 'Portrét',              category: 'Umění',     price: 2000, image: 'devka.png',      stock: 2  },
  { name: 'Ekologický set',       category: 'Hygiena',   price: 150,  image: 'bambus.png',     stock: 28 },
  { name: 'Plyšový chameleón',    category: 'Hračky',    price: 350,  image: 'chamik.png',     stock: 11 },
  { name: 'Sběratelský komiks',   category: 'Knihy',     price: 500,  image: 'komiks.png',     stock: 7  },
  { name: 'Náhrdelník',           category: 'Šperky',    price: 450,  image: 'koralky.png',    stock: 13 },
  { name: 'Abstraktní malba',     category: 'Umění',     price: 7500, image: 'obrazek.png',    stock: 1  },
  { name: 'Dekorace do koupelny', category: 'Dekorace',  price: 180,  image: 'hvezdice.png',   stock: 19 },
  { name: 'Plyšová chobotnice',   category: 'Hračky',    price: 250,  image: 'chobotnice.png', stock: 16 },
];

const orderData = [
  {
    customerName: 'Jan Novák',
    customerEmail: 'jan.novak@email.cz',
    shippingAddress: 'Vodičkova 12, Praha 1, 110 00',
    totalPrice: 2100,
    status: 'paid',
    paymentStatus: 'paid',
    items: [
      { title: 'Stylové boty', price: 1200, quantity: 1, image: 'boty.png' },
      { title: 'Tetovací rukáv', price: 450, quantity: 2, image: 'tetko.png' },
    ],
  },
  {
    customerName: 'Petra Svobodová',
    customerEmail: 'petra.s@seznam.cz',
    shippingAddress: 'Masarykova 45, Brno, 602 00',
    totalPrice: 1500,
    status: 'pending',
    paymentStatus: 'unpaid',
    items: [
      { title: 'Dívka', price: 1500, quantity: 1, image: 'devka.png' },
    ],
  },
  {
    customerName: 'Tomáš Dvořák',
    customerEmail: 'tomas.dvorak@gmail.com',
    shippingAddress: 'Nádražní 8, Ostrava, 702 00',
    totalPrice: 3150,
    status: 'shipped',
    paymentStatus: 'paid',
    items: [
      { title: 'Chameleón', price: 2000, quantity: 1, image: 'chamik.png' },
      { title: 'Korálky', price: 300, quantity: 3, image: 'koralky.png' },
      { title: 'Bambusový kartáček', price: 50, quantity: 5, image: 'bambus.png' },
    ],
  },
  {
    customerName: 'Marie Králová',
    customerEmail: 'marie.k@post.cz',
    shippingAddress: 'Žižkova 23, Plzeň, 301 00',
    totalPrice: 2200,
    status: 'delivered',
    paymentStatus: 'paid',
    items: [
      { title: 'Gate', price: 800, quantity: 2, image: 'gate.png' },
      { title: 'Anime tričko', price: 600, quantity: 1, image: 'anime.png' },
    ],
  },
  {
    customerName: 'Lukáš Procházka',
    customerEmail: 'lukas.p@email.cz',
    shippingAddress: 'Hlavní 1, Olomouc, 779 00',
    totalPrice: 5000,
    status: 'cancelled',
    paymentStatus: 'refunded',
    items: [
      { title: 'Obraz', price: 5000, quantity: 1, image: 'obrazek.png' },
    ],
  },
];

// ── Main ────────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Seeding database...');

  // 1) Extract unique categories and insert
  const uniqueCategories = [...new Set(productData.map((p) => p.category))];
  const insertedCategories = await db
    .insert(schema.categories)
    .values(uniqueCategories.map((name) => ({ name, slug: slugify(name) })))
    .onConflictDoNothing()
    .returning();

  // Build a lookup map
  const allCategories = insertedCategories.length > 0
    ? insertedCategories
    : await db.select().from(schema.categories);
  const categoryMap = new Map(allCategories.map((c) => [c.name, c.id]));
  console.log(`  ✅ ${allCategories.length} categories`);

  // 2) Insert products
  const insertedProducts = await db
    .insert(schema.products)
    .values(
      productData.map((p) => ({
        name: p.name,
        slug: slugify(p.name),
        description: `Popis pro ${p.name}`,
        price: p.price,
        stock: p.stock,
        image: p.image,
        images: [p.image],
        categoryId: categoryMap.get(p.category) ?? null,
      })),
    )
    .onConflictDoNothing()
    .returning();
  console.log(`  ✅ ${insertedProducts.length} products`);

  // Build product name → id lookup for order items
  const allProducts = insertedProducts.length > 0
    ? insertedProducts
    : await db.select().from(schema.products);
  const productMap = new Map(allProducts.map((p) => [p.name, p.id]));

  // 3) Insert orders + order items
  for (const o of orderData) {
    const [order] = await db
      .insert(schema.orders)
      .values({
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        shippingAddress: o.shippingAddress,
        totalPrice: o.totalPrice,
        status: o.status,
        paymentStatus: o.paymentStatus,
      })
      .returning();

    await db.insert(schema.orderItems).values(
      o.items.map((item) => ({
        orderId: order.id,
        productId: productMap.get(item.title) ?? null,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
    );
  }
  console.log(`  ✅ ${orderData.length} orders with items`);

  console.log('🎉 Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
