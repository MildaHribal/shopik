import { db } from './db';
import { orders, orderItems, products } from '../database/schema';
import { eq } from 'drizzle-orm';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Czech / international phone: digits, optional +, spaces, dashes, parens; ≥ 9 digits.
const phoneRegex = /^\+?[\d\s()\-]{9,20}$/;

// Cash-on-delivery surcharge — matches the client-side value shown in checkout.
export const COD_FEE = 60;
// Flat shipping — matches SHIPPING_PRICE shown in checkout. Charged on every order
// (previously it was displayed but never added to the charged total).
export const SHIPPING_FEE = 79;

export const VALID_PAYMENT_METHODS = new Set(['cash', 'bank-transfer', 'card']);

// Randomized, non-sequential identifiers so IDs don't leak order volume and the
// variable symbol isn't guessable. Order number is 8 digits; VS is 10 (SPAYD max).
const randDigits = (len: number) => {
  let out = String(1 + Math.floor(Math.random() * 9)); // no leading zero
  for (let i = 1; i < len; i++) out += Math.floor(Math.random() * 10);
  return out;
};

const shippingLabels: Record<string, string> = {
  'zasilkovna': 'Zásilkovna',
  'ceska-posta': 'Česká pošta',
  'balikovna': 'Balíkovna',
  'osobni': 'Osobní vyzvednutí',
  'packeta-zbox': 'Zásilkovna Z-BOX',
};

export type OrderItemData = {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  image: string | null;
};

/**
 * Validate a checkout body, re-price it against the DB, and persist the order +
 * items with a randomized order number. Shared by the bank-transfer/COD flow
 * (/api/orders) and the PayPal capture flow so both stay in sync.
 *
 * Prices are ALWAYS recomputed server-side from the DB — the client total is
 * never trusted.
 */
export async function persistOrder(
  body: any,
  opts: { userId?: string | null; paymentStatus?: 'unpaid' | 'paid' } = {},
): Promise<{ order: typeof orders.$inferSelect; items: OrderItemData[]; totalPrice: number }> {
  const {
    customerName, customerEmail, phone, street, city, zip,
    paymentMethod, shippingMethod, packetaBranchId, packetaBranchName, items,
  } = body;

  if (!customerName || !customerEmail || !paymentMethod || !items?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Všechna povinná pole musí být vyplněna' });
  }
  if (!emailRegex.test(customerEmail)) {
    throw createError({ statusCode: 400, statusMessage: 'Zadaný email nemá správný formát' });
  }
  if (!phone || !phoneRegex.test(String(phone).trim())) {
    throw createError({ statusCode: 400, statusMessage: 'Zadejte platné telefonní číslo' });
  }
  if (!VALID_PAYMENT_METHODS.has(paymentMethod)) {
    throw createError({ statusCode: 400, statusMessage: 'Neplatná platební metoda' });
  }

  const shippingLabel = shippingLabels[shippingMethod] || shippingMethod || 'Neuvedeno';
  const shippingAddress = [
    packetaBranchName || null,
    street || null,
    [zip, city].filter(Boolean).join(' ') || null,
    phone ? `Tel: ${phone}` : null,
    `Doprava: ${shippingLabel}`,
  ].filter(Boolean).join(' | ');

  // Re-price against DB.
  let totalPrice = 0;
  const orderItemsData: OrderItemData[] = [];
  for (const item of items) {
    const [product] = await db.select().from(products).where(eq(products.id, Number(item.id))).limit(1);
    if (!product) {
      throw createError({ statusCode: 404, statusMessage: `Produkt s ID ${item.id} nenalezen` });
    }
    const quantity = item.quantity || 1;
    totalPrice += product.price * quantity;
    orderItemsData.push({
      productId: product.id, title: product.name, price: product.price, quantity, image: product.image,
    });
  }

  // Flat shipping on every order + cash-on-delivery surcharge for COD only.
  totalPrice += SHIPPING_FEE;
  if (paymentMethod === 'cash') totalPrice += COD_FEE;

  const paymentStatus = opts.paymentStatus ?? 'unpaid';

  // Insert with a randomized order number; retry on the (rare) unique collision.
  let newOrder: typeof orders.$inferSelect | undefined;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      [newOrder] = await db.insert(orders).values({
        orderNumber: randDigits(8),
        variableSymbol: randDigits(10),
        customerName,
        customerEmail,
        customerPhone: phone ?? null,
        shippingAddress,
        shippingMethod: shippingMethod ?? null,
        paymentMethod: paymentMethod ?? null,
        packetaBranchId: packetaBranchId ?? null,
        packetaBranchName: packetaBranchName ?? null,
        totalPrice,
        status: 'pending',
        paymentStatus,
        userId: opts.userId ?? undefined,
      }).returning();
      break;
    } catch (err: any) {
      if (err?.code === '23505' && attempt < 4) continue; // duplicate order_number
      throw err;
    }
  }
  if (!newOrder) {
    throw createError({ statusCode: 500, statusMessage: 'Objednávku se nepodařilo vytvořit' });
  }

  for (const item of orderItemsData) {
    await db.insert(orderItems).values({
      orderId: newOrder.id,
      productId: item.productId,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    });
  }

  return { order: newOrder, items: orderItemsData, totalPrice };
}
