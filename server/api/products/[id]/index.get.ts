// import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required',
    })
  }

  // const product = await prisma.product.findUnique({
  //   where: {
  //     id: parseInt(id),
  //   },
  // })

  const products = [
    {
      id: 1,
      title: 'Korálky',
      slug: 'koralky',
      description: 'Krásné barevné korálky',
      price: 150,
      image: 'koralky.png',
      stock: 10,
      category: 'Bižuterie',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      title: 'Komiks',
      slug: 'komiks',
      description: 'Napínavý komiks',
      price: 299,
      image: 'komiks.png',
      stock: 5,
      category: 'Knihy',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      title: 'Obraz',
      slug: 'obraz',
      description: 'Originální malba',
      price: 1500,
      image: 'obrazek.png',
      stock: 1,
      category: 'Umění',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 4,
      title: 'Boty',
      slug: 'boty',
      description: 'Pohodlné boty na procházky',
      price: 1200,
      image: 'boty.png',
      stock: 8,
      category: 'Oblečení',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 5,
      title: 'Bambus',
      slug: 'bambus',
      description: 'Dekorativní bambus',
      price: 450,
      image: 'bambus.png',
      stock: 15,
      category: 'Rostliny',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  const product = products.find(p => p.id === parseInt(id))

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found',
    })
  }

  return product
})
