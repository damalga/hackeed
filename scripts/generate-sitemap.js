// scripts/generate-sitemap.js
import { SitemapStream, streamToPromise } from 'sitemap'
import { Readable } from 'stream'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const baseUrl = 'https://hackeed.com'

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

// Páginas dinámicas (productos, categorías, etc.)
// TODO: En el futuro, cargar desde la base de datos
const dynamicPages = [
  // Ejemplo de cómo añadir productos cuando tengas páginas individuales:
  // {
  //   url: '/producto/flipper-zero',
  //   changefreq: 'weekly',
  //   priority: 0.8,
  //   lastmod: '2024-10-01',
  //   img: [
  //     {
  //       url: 'https://hackeed.com/images/flipper_zero/flipper-zero.jpg',
  //       title: 'Flipper Zero',
  //       caption: 'Flipper Zero - Multiherramienta de pentesting',
  //     }
  //   ]
  // },

  // Ejemplo de categorías (cuando las implementes):
  // { url: '/categoria/raspberry-pi', changefreq: 'weekly', priority: 0.7 },
  // { url: '/categoria/flipper-zero', changefreq: 'weekly', priority: 0.7 },
  // { url: '/categoria/hak5', changefreq: 'weekly', priority: 0.7 },
]

async function generateSitemap() {
  try {
    console.log('🗺️  Generando sitemap.xml...')

    // Combinar todas las páginas
    const allPages = [...staticPages, ...dynamicPages]

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

    console.log('✅ Sitemap generado exitosamente en /public/sitemap.xml')
    console.log(`📄 Total de URLs: ${allPages.length}`)
    console.log('\n📋 URLs incluidas:')
    allPages.forEach((page) => {
      console.log(`   - ${baseUrl}${page.url} (prioridad: ${page.priority})`)
    })
    console.log('')
  } catch (error) {
    console.error('❌ Error generando sitemap:', error)
    process.exit(1)
  }
}

// Ejecutar
generateSitemap()
