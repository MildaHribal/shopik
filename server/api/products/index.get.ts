import { db } from '../../utils/db';
import { products, categories } from '../../database/schema';
import { eq, ilike, or, sql, desc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const search = typeof query.search === 'string' ? query.search.trim() : '';

  let whereClause = undefined;
  if (search) {
    whereClause = or(
      ilike(products.name, `%${search}%`),
      ilike(products.description, `%${search}%`)
    );
  }

  let queryBuilder = db
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
    .where(whereClause)
    .$dynamic();

  if (query.random === 'true') {
    queryBuilder = queryBuilder.orderBy(sql`RANDOM()`);
  } else {
    queryBuilder = queryBuilder.orderBy(desc(products.id));
  }

  if (query.limit && !isNaN(Number(query.limit))) {
    queryBuilder = queryBuilder.limit(Number(query.limit));
  }

  return await queryBuilder;
});
