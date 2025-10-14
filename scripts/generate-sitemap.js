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
    console.log('Cargando productos desde la base de datos...')
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
    console.warn('⚠️  No se pudieron cargar productos desde la BD:', error.message)
    console.warn('   Se generará sitemap solo con páginas estáticas')
    return []
  }
}

async function generateSitemap() {
  try {
    console.log('🗺️  Generando sitemap.xml...')

    // Cargar páginas dinámicas de productos
    const productPages = await loadProductPages()
    console.log(`✓ ${productPages.length} productos cargados`)

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

    console.log('\n✅ Sitemap generado exitosamente en /public/sitemap.xml')
    console.log(`📊 Total de URLs: ${allPages.length}`)
    console.log(`   - Páginas estáticas: ${staticPages.length}`)
    console.log(`   - Páginas de productos: ${productPages.length}`)
    console.log('\n📝 URLs incluidas:')
    allPages.forEach((page) => {
      console.log(`   ${baseUrl}${page.url} (prioridad: ${page.priority})`)
    })
    console.log('')
  } catch (error) {
    console.error('❌ Error generando sitemap:', error)
    process.exit(1)
  }
}

// Ejecutar
generateSitemap()
