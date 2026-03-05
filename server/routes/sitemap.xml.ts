import { db } from '../utils/db'
import { products } from '../database/schema'

function xmlEscape(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const origin = url.origin

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  const rows = await db
    .select({
      slug: products.slug,
      updatedAt: products.updatedAt,
    })
    .from(products)

  const baseUrls = [
    { loc: `${origin}/`, changefreq: 'daily', priority: '1.0', lastmod: undefined as string | undefined },
    { loc: `${origin}/product`, changefreq: 'daily', priority: '0.8', lastmod: undefined as string | undefined },
  ]

  const productUrls = rows
    .filter(r => !!r.slug)
    .map(r => ({
      loc: `${origin}/product/${r.slug}`,
      lastmod: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined,
      changefreq: 'weekly',
      priority: '0.6',
    }))

  const all = [...baseUrls, ...productUrls]

  const body = all.map(u => {
    const parts = [
      `<loc>${xmlEscape(u.loc)}</loc>`,
      u.lastmod ? `<lastmod>${xmlEscape(u.lastmod)}</lastmod>` : null,
      u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : null,
      u.priority ? `<priority>${u.priority}</priority>` : null,
    ].filter(Boolean)
    return `<url>${parts.join('')}</url>`
  }).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`
})

