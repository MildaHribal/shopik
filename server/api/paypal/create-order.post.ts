import { db } from '../../utils/db';
import { products } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { createPaypalOrder, paypalConfigured } from '../../utils/paypal';
import { SHIPPING_FEE } from '../../utils/createOrder';

/**
 * Create a PayPal order for the current cart. Prices are recomputed server-side
 * from the DB (the client total is never trusted). Returns the PayPal order id
 * for the JS SDK to approve. The internal order is only created AFTER a
 * successful capture (see capture-order.post.ts).
 */
export default defineEventHandler(async (event) => {
  if (!paypalConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Platba kartou není momentálně dostupná.' });
  }

  const body = await readBody(event);
  const items = body?.items;
  if (!items?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Košík je prázdný' });
  }

  let total = 0;
  for (const item of items) {
    const [product] = await db.select().from(products).where(eq(products.id, Number(item.id))).limit(1);
    if (!product) {
      throw createError({ statusCode: 404, statusMessage: `Produkt s ID ${item.id} nenalezen` });
    }
    total += product.price * (item.quantity || 1);
  }
  total += SHIPPING_FEE; // card is prepaid → shipping only, no COD surcharge

  if (total <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Neplatná částka objednávky' });
  }

  const order = await createPaypalOrder(total, { description: 'Objednávka — Tynky Bordel' });
  return { id: order.id };
});
