import { db } from '../../utils/db';
import { orders, orderItems, products } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { getOptionalSession } from '../../utils/session';
import { sendOrderStatusEmail, type BankTransferBlock } from '../../utils/email';
import { buildSpayd, getBankAccount, spaydToDataUrl } from '../../utils/spayd';

const VALID_PAYMENT_METHODS = new Set(['cash', 'bank-transfer', 'card']);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Czech / international phone: digits, optional +, spaces, dashes, parens; ≥ 9 digits.
const phoneRegex = /^\+?[\d\s()\-]{9,20}$/;

// Cash-on-delivery surcharge — matches the client-side value displayed in checkout.
const COD_FEE = 60;

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  let userId: string | null = null;
  const session = await getOptionalSession(event);
  userId = session?.user?.id ?? null;

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

  if (!customerName || !customerEmail || !paymentMethod || !items?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Všechna povinná pole musí být vyplněna',
    });
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

  const shippingLabels: Record<string, string> = {
    'zasilkovna': 'Zásilkovna',
    'ceska-posta': 'Česká pošta',
    'balikovna': 'Balíkovna',
    'osobni': 'Osobní vyzvednutí',
    'packeta-zbox': 'Zásilkovna Z-BOX',
  };

  const shippingLabel = shippingLabels[shippingMethod] || shippingMethod || 'Neuvedeno';
  const addressParts = [
    packetaBranchName || null,
    street || null,
    [zip, city].filter(Boolean).join(' ') || null,
    phone ? `Tel: ${phone}` : null,
    `Doprava: ${shippingLabel}`,
  ].filter(Boolean);
  const shippingAddress = addressParts.join(' | ');

  // Verify prices against DB, compute total.
  let totalPrice = 0;
  const orderItemsData: Array<{
    productId: number;
    title: string;
    price: number;
    quantity: number;
    image: string | null;
  }> = [];

  for (const item of items) {
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

  // Add cash-on-delivery surcharge on top of item subtotal.
  if (paymentMethod === 'cash') {
    totalPrice += COD_FEE;
  }

  const paymentStatus = 'unpaid';
  const status = 'pending';

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

  // Bank transfer: generate SPAYD + QR + bank info to return + include in email.
  let bank: BankTransferBlock | undefined;
  if (paymentMethod === 'bank-transfer') {
    const { iban } = getBankAccount();
    if (iban) {
      const spayd = buildSpayd({
        amount: totalPrice,
        variableSymbol: newOrder.id,
        message: `Objednavka ${newOrder.id}`,
      });
      const qrDataUrl = await spaydToDataUrl(spayd);
      bank = {
        iban,
        amount: totalPrice,
        variableSymbol: newOrder.id,
        qrDataUrl,
      };
    }
  }

  // Fire-and-forget confirmation email so we don't hang the response on SMTP.
  sendOrderStatusEmail(
    {
      id: newOrder.id,
      customerName: newOrder.customerName,
      customerEmail: newOrder.customerEmail,
      totalPrice: newOrder.totalPrice,
      shippingAddress: newOrder.shippingAddress,
      items: orderItemsData.map((i) => ({ title: i.title, quantity: i.quantity, price: i.price })),
    },
    'created',
    bank,
  ).catch((err) => console.error('[orders] created email failed:', err));

  return {
    success: true,
    orderId: newOrder.id,
    paymentMethod,
    // Only echo bank details for bank-transfer so the client can render the QR immediately.
    bank: bank
      ? {
          iban: bank.iban,
          holder: getBankAccount().holder,
          amount: bank.amount,
          variableSymbol: bank.variableSymbol,
          qrDataUrl: bank.qrDataUrl,
        }
      : null,
  };
});
