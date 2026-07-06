import { db } from '../../utils/db';
import { orders, orderItems, products } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { getOptionalSession } from '../../utils/session';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  let userId: string | null = null;
  const session = await getOptionalSession(event)
  userId = session?.user?.id ?? null

  // Validate required fields
  const {
    customerName,
    customerEmail,
    phone,
    street,
    city,
    zip,
    paymentMethod,
    shippingMethod,
    packetaBranchId,
    packetaBranchName,
    items,
  } = body;

  if (!customerName || !customerEmail || !street || !city || !zip || !paymentMethod || !items?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Všechna povinná pole musí být vyplněna',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    throw createError({ statusCode: 400, statusMessage: 'Zadaný email nemá správný formát' });
  }

  const shippingLabels: Record<string, string> = {
    'zasilkovna': 'Zásilkovna',
    'ceska-posta': 'Česká pošta',
    'balikovna': 'Balíkovna',
    'osobni': 'Osobní vyzvednutí',
  };

  // Build shipping address string
  const shippingLabel = shippingLabels[shippingMethod] || shippingMethod || 'Neuvedeno';
  const shippingAddress = `${street}, ${zip} ${city}${phone ? ` | Tel: ${phone}` : ''} | Doprava: ${shippingLabel}`;

  // Calculate total price from items
  let totalPrice = 0;
  const orderItemsData: Array<{
    productId: number;
    title: string;
    price: number;
    quantity: number;
    image: string | null;
  }> = [];

  for (const item of items) {
    // Fetch product from DB to verify price
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, Number(item.id)))
      .limit(1);

    if (!product) {
      throw createError({
        statusCode: 404,
        statusMessage: `Produkt s ID ${item.id} nenalezen`,
      });
    }

    const quantity = item.quantity || 1;
    totalPrice += product.price * quantity;

    orderItemsData.push({
      productId: product.id,
      title: product.name,
      price: product.price,
      quantity,
      image: product.image,
    });
  }

  // Card payments never go through this endpoint (they use create-checkout-session).
  // Bank transfer and cash-on-delivery are unpaid until manual confirmation.
  const paymentStatus = 'unpaid';
  const status = 'pending';

  // Create order
  const [newOrder] = await db
    .insert(orders)
    .values({
      customerName,
      customerEmail,
      customerPhone: phone ?? null,
      shippingAddress,
      shippingMethod: shippingMethod ?? null,
      paymentMethod: paymentMethod ?? null,
      packetaBranchId: packetaBranchId ?? null,
      packetaBranchName: packetaBranchName ?? null,
      totalPrice,
      status,
      paymentStatus,
      userId: userId ?? undefined,
    })
    .returning();

  // Create order items
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

  return {
    success: true,
    orderId: newOrder.id,
    paymentMethod,
  };
});
