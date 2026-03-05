import { db } from '../../../utils/db';
import { products, categories } from '../../../database/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async () => {
  const result = await db
    .select({
      id: products.id,
      title: products.name,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      image: products.image,
      images: products.images,
      stock: products.stock,
      category: categories.name,
      categoryId: products.categoryId,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(products.id);

  return result;
});
