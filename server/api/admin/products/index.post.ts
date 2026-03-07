import { db } from '../../../utils/db';
import { products, categories } from '../../../database/schema';
import { eq } from 'drizzle-orm';

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.title || !body.price) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Název a cena jsou povinné',
    });
  }

  try {
    // Resolve category – prioritize categoryId if provided
    let categoryId: number | null = null;
    if (body.categoryId) {
      categoryId = Number(body.categoryId);
    } else if (body.category) {
      const existing = await db
        .select()
        .from(categories)
        .where(eq(categories.name, body.category));

      if (existing.length > 0) {
        categoryId = existing[0].id;
      } else {
        const [newCat] = await db
          .insert(categories)
          .values({ name: body.category, slug: slugify(body.category) })
          .returning();
        categoryId = newCat.id;
      }
    }

    // Generate a unique slug (append timestamp if collision)
    let slug = slugify(body.title);
    const existingSlug = await db.select().from(products).where(eq(products.slug, slug));
    if (existingSlug.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const [product] = await db
      .insert(products)
      .values({
        name: body.title,
        slug,
        description: body.description || '',
        price: Number(body.price),
        image: body.image || '',
        images: body.images || [],
        stock: Number(body.stock) || 0,
        categoryId,
      })
      .returning();

    return {
      ...product,
      title: product.name,
      category: body.category || null,
    };
  } catch (error: any) {
    console.error('Error creating product:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Chyba při vytváření produktu',
    });
  }
});
