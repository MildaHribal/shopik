import { products as localProducts } from '../../../app/data/products'

export default defineEventHandler(async (event) => {
  const products = localProducts.map((p, index) => ({
    id: index + 1,
    title: p.name,
    slug: p.name.toLowerCase().replace(/ /g, '-'),
    description: `Popis pro ${p.name}`,
    price: p.price,
    image: p.image,
    stock: 10,
    category: p.category,
    createdAt: new Date(),
    updatedAt: new Date()
  }))

  return products
})
