import 'dotenv/config';
import { db, queryClient } from '../server/utils/db';
import { categories, products } from '../server/database/schema';
import { inArray, notInArray } from 'drizzle-orm';

async function main() {
  const badNames = [
    'Obuv', 'Oblečení', 'Kancelář', 'Umění', 'Hygiena', 
    'Zvířata', 'Knihy', 'Šperky', 'Dekorace', 'Hračky'
  ];

  console.log('Cleaning up categories: ' + badNames.join(', '));

  try {
    // 1. Find categories to delete
    const toDelete = await db.select().from(categories).where(inArray(categories.name, badNames));
    const ids = toDelete.map(c => c.id);

    if (ids.length === 0) {
      console.log('No matching categories found to delete.');
      return;
    }

    console.log(`Found ${ids.length} categories to delete. Checking for products...`);

    // 2. Clear products referencing these categories (or set to null, but user said "smaz vsechny" earlier so let's just clear these products)
    const delProducts = await db.delete(products).where(inArray(products.categoryId, ids)).returning();
    console.log(`Deleted ${delProducts.length} products associated with these categories.`);

    // 3. Delete categories
    const delCats = await db.delete(categories).where(inArray(categories.id, ids)).returning();
    console.log(`Deleted ${delCats.length} categories.`);

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await queryClient.end();
    process.exit(0);
  }
}

main();
