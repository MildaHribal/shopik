import { pgTable, serial, text, doublePrecision, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── Categories ──────────────────────────────────────────────────────────────────
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Products ────────────────────────────────────────────────────────────────────
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  shortDescription: text('short_description'),
  price: doublePrecision('price').notNull(),
  stock: integer('stock').notNull().default(0),
  image: text('image'),
  images: jsonb('images').$type<string[]>().default([]),
  categoryId: integer('category_id').references(() => categories.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ── Orders ──────────────────────────────────────────────────────────────────────
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: text('user_id'), // Reference to neonAuthId
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  totalPrice: doublePrecision('total_price').notNull(),
  status: text('status').notNull().default('pending'),           // pending | paid | shipped | delivered | cancelled
  paymentStatus: text('payment_status').notNull().default('unpaid'), // unpaid | paid | refunded
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ── Order Items ─────────────────────────────────────────────────────────────────
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => products.id),
  title: text('title').notNull(),
  price: doublePrecision('price').notNull(),
  quantity: integer('quantity').notNull().default(1),
  image: text('image'),
});

// ── Users ───────────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  neonAuthId: text('neon_auth_id').unique(),
  phone: text('phone'),
  street: text('street'),
  city: text('city'),
  zip: text('zip'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ── Reviews ─────────────────────────────────────────────────────────────────────
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(), // neonAuthId
  userName: text('user_name').notNull(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Favorites ───────────────────────────────────────────────────────────────────
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // neonAuthId
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Relations ───────────────────────────────────────────────────────────────────
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  user: one(users, {
    fields: [orders.userId],
    references: [users.neonAuthId],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  reviews: many(reviews),
  favorites: many(favorites),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.neonAuthId],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  product: one(products, {
    fields: [favorites.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [favorites.userId],
    references: [users.neonAuthId],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  reviews: many(reviews),
  favorites: many(favorites),
}));