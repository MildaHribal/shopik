import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const products = [
    { title: 'Stylové boty', category: 'Obuv', price: 1200, image: 'boty.png', slug: 'stylove-boty', stock: 10 },
    { title: 'Značkové boty', category: 'Obuv', price: 2500, image: 'boty2.png', slug: 'znackove-boty', stock: 5 },
    { title: 'Gate', category: 'Oblečení', price: 800, image: 'gate.png', slug: 'gate', stock: 20 },
    { title: 'Anime tričko', category: 'Oblečení', price: 600, image: 'anime.png', slug: 'anime-tricko', stock: 15 },
    { title: 'Tetovací rukáv', category: 'Doplňky', price: 450, image: 'tetko.png', slug: 'tetovaci-rukav', stock: 8 },
    { title: 'Pero', category: 'Kancelář', price: 120, image: 'pero.png', slug: 'pero', stock: 100 },
    { title: 'Dívka', category: 'Umění', price: 1500, image: 'devka.png', slug: 'divka', stock: 1 },
    { title: 'Bambusový kartáček', category: 'Hygiena', price: 50, image: 'bambus.png', slug: 'bambusovy-kartacek', stock: 50 },
    { title: 'Chameleón', category: 'Zvířata', price: 2000, image: 'chamik.png', slug: 'chameleon', stock: 2 },
    { title: 'Komiksový sešit', category: 'Knihy', price: 150, image: 'komiks.png', slug: 'komiksovy-sesit', stock: 30 },
    { title: 'Korálky', category: 'Šperky', price: 300, image: 'koralky.png', slug: 'koralky', stock: 40 },
    { title: 'Obraz', category: 'Umění', price: 5000, image: 'obrazek.png', slug: 'obraz', stock: 1 },
    { title: 'Mořská hvězdice', category: 'Dekorace', price: 250, image: 'hvezdice.png', slug: 'morska-hvezdice', stock: 12 },
    { title: 'Chobotnice', category: 'Hračky', price: 400, image: 'chobotnice.png', slug: 'chobotnice', stock: 25 },
    { title: 'Letní sandály', category: 'Obuv', price: 950, image: 'boty.png', slug: 'letni-sandaly', stock: 10 },
    { title: 'Sportovní tenisky', category: 'Obuv', price: 1800, image: 'boty2.png', slug: 'sportovni-tenisky', stock: 7 },
    { title: 'Džínové kraťasy', category: 'Oblečení', price: 700, image: 'gate.png', slug: 'dzinove-kratasy', stock: 18 },
    { title: 'Manga tričko', category: 'Oblečení', price: 550, image: 'anime.png', slug: 'manga-tricko', stock: 12 },
    { title: 'Luxusní pero', category: 'Kancelář', price: 500, image: 'pero.png', slug: 'luxusni-pero', stock: 5 },
    { title: 'Portrét', category: 'Umění', price: 2000, image: 'devka.png', slug: 'portret', stock: 1 },
    { title: 'Ekologický set', category: 'Hygiena', price: 150, image: 'bambus.png', slug: 'ekologicky-set', stock: 20 },
    { title: 'Plyšový chameleón', category: 'Hračky', price: 350, image: 'chamik.png', slug: 'plysovy-chameleon', stock: 15 },
    { title: 'Sběratelský komiks', category: 'Knihy', price: 500, image: 'komiks.png', slug: 'sberatelsky-komiks', stock: 3 },
    { title: 'Náhrdelník', category: 'Šperky', price: 450, image: 'koralky.png', slug: 'nahrdelnik', stock: 10 },
    { title: 'Abstraktní malba', category: 'Umění', price: 7500, image: 'obrazek.png', slug: 'abstraktni-malba', stock: 1 },
    { title: 'Dekorace do koupelny', category: 'Dekorace', price: 180, image: 'hvezdice.png', slug: 'dekorace-do-koupelny', stock: 8 },
    { title: 'Plyšová chobotnice', category: 'Hračky', price: 250, image: 'chobotnice.png', slug: 'plysova-chobotnice', stock: 20 },
]

async function main() {
  console.log(`Start seeding ...`)
  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        title: p.title,
        slug: p.slug,
        price: p.price,
        image: p.image,
        category: p.category,
        stock: p.stock,
        description: `Popis pro ${p.title}`,
      },
    })
    console.log(`Created product with id: ${product.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
