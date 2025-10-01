// src/composables/usePageMeta.js
import { useHead } from '@vueuse/head'

/**
 * Composable para gestionar meta tags SEO de forma dinámica
 *
 * @param {Object} meta - Configuración de meta tags
 * @param {string} meta.title - Título de la página
 * @param {string} meta.description - Descripción de la página
 * @param {string} meta.keywords - Keywords separadas por comas
 * @param {string} meta.image - URL de la imagen para OG
 * @param {string} meta.url - URL canónica de la página
 * @param {string} meta.type - Tipo de contenido OG (website, article, product)
 * @param {string} meta.robots - Directivas para robots (index, follow)
 *
 * @example
 * usePageMeta({
 *   title: 'Mi Página - Hackeed',
 *   description: 'Descripción de mi página',
 *   keywords: 'keyword1, keyword2, keyword3',
 *   url: 'https://hackeed.com/mi-pagina'
 * })
 */
export function usePageMeta(meta = {}) {
  const baseUrl = import.meta.env.VITE_BASE_URL || 'https://hackeed.com'
  const siteName = import.meta.env.VITE_SITE_NAME || 'Hackeed'

  // Meta tags por defecto
  const defaultMeta = {
    title: `${siteName} - Tienda de Hardware Hacking en España | Flipper Zero, Raspberry Pi`,
    description:
      'Tienda online especializada en hardware hacking y tecnología. Compra Flipper Zero, Raspberry Pi, Hak5, RTL-SDR y herramientas de pentesting. Envíos rápidos en 24-48h desde España.',
    image: `${baseUrl}/images/og-default.jpg`,
    url: baseUrl,
    type: 'website',
    keywords:
      'tienda hacking, flipper zero españa, raspberry pi, hak5, hardware pentesting, herramientas ciberseguridad, gadgets tecnología',
    robots: 'index, follow',
  }

  // Combinar meta proporcionada con defaults
  const finalMeta = { ...defaultMeta, ...meta }

  // Construir título completo
  const fullTitle = finalMeta.titleTemplate
    ? finalMeta.titleTemplate.replace('%s', finalMeta.title)
    : finalMeta.title

  // Aplicar meta tags usando @vueuse/head
  useHead({
    title: fullTitle,
    meta: [
      // Basic SEO
      { name: 'description', content: finalMeta.description },
      { name: 'keywords', content: finalMeta.keywords },
      { name: 'author', content: siteName },
      { name: 'robots', content: finalMeta.robots },

      // Open Graph (Facebook, LinkedIn, WhatsApp)
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: finalMeta.description },
      { property: 'og:image', content: finalMeta.image },
      { property: 'og:url', content: finalMeta.url },
      { property: 'og:type', content: finalMeta.type },
      { property: 'og:site_name', content: siteName },
      { property: 'og:locale', content: 'es_ES' },

      // Twitter Cards
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: finalMeta.description },
      { name: 'twitter:image', content: finalMeta.image },
      // { name: 'twitter:site', content: '@hackeed_es' }, // Descomentar cuando tengas Twitter

      // Additional meta tags
      { name: 'theme-color', content: '#000000' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [
      // Canonical URL
      { rel: 'canonical', href: finalMeta.url },
    ],
  })
}
