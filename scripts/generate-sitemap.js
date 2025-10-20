// scripts/generate-sitemap.js
import { SitemapStream, streamToPromise } from 'sitemap'
import { Readable } from 'stream'
import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { neon } from '@netlify/neon'
import dotenv from 'dotenv'
import { getProductSlug } from '../src/utils/helpers.js'

// Cargar variables de entorno
dotenv.config()

const baseUrl = 'https://hackeed.com'
const sql = neon(process.env.DATABASE_URL)

// Páginas estáticas del sitio
const staticPages = [
  {
    url: '/',
    changefreq: 'daily',
    priority: 1.0,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/shop',
    changefreq: 'daily',
    priority: 0.9,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/about',
    changefreq: 'monthly',
    priority: 0.5,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/contact',
    changefreq: 'monthly',
    priority: 0.5,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/sfaq',
    changefreq: 'weekly',
    priority: 0.6,
    lastmod: new Date().toISOString(),
  },
]

// Cargar productos desde la base de datos
async function loadProductPages() {
  try {
    console.log('Sitemap: Loading products from database')
    const products = await sql`
      SELECT id, name, updated_at
      FROM products
      WHERE active = true
      ORDER BY id
    `

    return products.map((product) => ({
      url: `/product/${getProductSlug(product)}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: product.updated_at || new Date().toISOString(),
    }))
  } catch (error) {
    console.warn('Sitemap: Could not load products from database:', error.message)
    console.warn('Sitemap: Generating sitemap with static pages only')
    return []
  }
}

async function generateSitemap() {
  try {
    console.log('Sitemap: Generating sitemap.xml')

    // Cargar páginas dinámicas de productos
    const productPages = await loadProductPages()
    console.log(`Sitemap: Loaded ${productPages.length} products`)

    // Combinar todas las páginas
    const allPages = [...staticPages, ...productPages]

    // Crear stream de sitemap
    const stream = new SitemapStream({ hostname: baseUrl })

    // Generar XML
    let xmlString = await streamToPromise(Readable.from(allPages).pipe(stream)).then((data) =>
      data.toString()
    )

    // Formatear XML para mejor legibilidad
    xmlString = xmlString
      .replace(/></g, '>\n<')
      .replace(/<url>/g, '\n  <url>')
      .replace(/<\/urlset>/g, '\n</urlset>')
      .replace(/(<loc>)/g, '\n    $1')
      .replace(/(<lastmod>)/g, '\n    $1')
      .replace(/(<changefreq>)/g, '\n    $1')
      .replace(/(<priority>)/g, '\n    $1')
      .replace(/<\/url>/g, '\n  </url>')

    // Guardar en public/
    const outputPath = resolve('./public/sitemap.xml')
    writeFileSync(outputPath, xmlString)

    console.log('\nSitemap: Generated successfully at /public/sitemap.xml')
    console.log(`Sitemap: Total URLs: ${allPages.length}`)
    console.log(`Sitemap: Static pages: ${staticPages.length}`)
    console.log(`Sitemap: Product pages: ${productPages.length}`)
    console.log('\nSitemap: URLs included:')
    allPages.forEach((page) => {
      console.log(`  ${baseUrl}${page.url} (priority: ${page.priority})`)
    })
    console.log('')
  } catch (error) {
    console.error('Sitemap: Generation error:', error)
    process.exit(1)
  }
}

// Ejecutar
generateSitemap()
