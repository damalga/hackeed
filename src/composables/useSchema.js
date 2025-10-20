// src/composables/useSchema.js
import { useHead } from '@vueuse/head'

/**
 * Composable para añadir Structured Data (Schema.org JSON-LD)
 *
 * @param {Object|Array} schema - Objeto o array de objetos Schema.org
 *
 * @example
 * // Organization Schema
 * useSchema({
 *   '@context': 'https://schema.org',
 *   '@type': 'Organization',
 *   name: 'Hackeed',
 *   url: 'https://hackeed.com'
 * })
 *
 * @example
 * // Múltiples schemas
 * useSchema([
 *   { '@context': 'https://schema.org', '@type': 'Organization', ... },
 *   { '@context': 'https://schema.org', '@type': 'WebSite', ... }
 * ])
 */
export function useSchema(schema) {
  if (!schema) {
    console.warn('useSchema: No schema provided')
    return
  }

  // Convertir a array si es un solo objeto
  const schemas = Array.isArray(schema) ? schema : [schema]

  // Crear scripts para cada schema
  const scripts = schemas.map((schemaObj) => ({
    type: 'application/ld+json',
    children: JSON.stringify(schemaObj, null, 2),
  }))

  useHead({
    script: scripts,
  })
}
