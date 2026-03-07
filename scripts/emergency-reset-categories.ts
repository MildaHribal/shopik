import 'dotenv/config';
import { db, queryClient } from '../server/utils/db';
import { categories, products, favorites, reviews, orderItems } from '../server/database/schema';

async function main() {
  console.log('PERFORMING FULL CATEGORY RESET...');
  try {
    // 1. Clear everything that depends on products
    await db.delete(favorites);
    await db.delete(reviews);
    await db.delete(orderItems);
    await db.delete(products);
    
    // 2. Clear all categories (recurse via several passes or just delete everything)
    // We do multiple passes for hierarchical categories if not on cascade delete
    await db.delete(categories); // If parentId has no cascade, this might fail if children exist.
    // Let's do it in reverse order of depth if possible, or just delete all children first.
    
    // Actually, a simple way to delete hierarchical data without cascade is to set children parentId to null first
    await db.update(categories).set({ parentId: null });
    await db.delete(categories);

    console.log('Database cleared of categories and products.');

    // 3. Restore clean structure
    const structure = [
      {
        name: 'MODA',
        children: [
          {
            name: 'Muzi',
            children: [{ name: 'kalhoty' }, { name: 'tricka' }, { name: 'mikiny' }]
          },
          {
            name: 'Zeny',
            children: [{ name: 'kalhoty' }, { name: 'tricka' }, { name: 'mikiny' }, { name: 'sukne' }, { name: 'tilka' }]
          }
        ]
      },
      {
        name: 'BIZUTERIE',
        children: [{ name: 'Naramky' }, { name: 'Nahrdelniky' }, { name: 'Prstýnky' }]
      },
      {
        name: 'DOPLNKY',
        children: [{ name: 'Klicenky' }, { name: 'samolepky' }]
      },
      { name: 'OBRAZY' },
      { name: 'OSTATNÍ' }
    ];

    function slugify(text: string) {
      return text.toString().toLowerCase().normalize('NFD').trim().replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
    }

    async function insertRecursive(items: any[], parentId: number | null = null, parentSlug: string = '') {
      for (const item of items) {
        const slugBase = slugify(item.name);
        const slug = parentSlug ? `${parentSlug}-${slugBase}` : slugBase;
        const [inserted] = await db.insert(categories).values({
          name: item.name,
          slug: slug,
          parentId: parentId
        }).returning();

        if (item.children && item.children.length > 0) {
          await insertRecursive(item.children, inserted.id, slug);
        }
      }
    }

    await insertRecursive(structure);
    console.log('Clean hierarchical categories restored.');

  } catch (error) {
    console.error('CRITICAL ERROR DURING RESET:', error);
  } finally {
    await queryClient.end();
    process.exit(0);
  }
}

main();
