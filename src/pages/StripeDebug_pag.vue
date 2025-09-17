<template>
  <div class="stripe-page light-bg">
    <div class="stripe-container">
      <h1>🔧 Debug de Configuración Stripe</h1>

      <!-- Estado de Configuración -->
      <div class="stripe-section">
        <h2>📋 Variables de Entorno</h2>
        <div class="config-grid">
          <div class="config-item" :class="stripeKeyStatus.class">
            <strong>VITE_STRIPE_PUBLISHABLE_KEY:</strong>
            <span v-if="stripeKey">{{ stripeKey.substring(0, 12) }}...</span>
            <span v-else>❌ No configurada</span>
          </div>

          <div class="config-item">
            <strong>VITE_APP_URL:</strong>
            <span>{{ appUrl }}</span>
          </div>

          <div class="config-item">
            <strong>NODE_ENV:</strong>
            <span>{{ nodeEnv }}</span>
          </div>
        </div>
      </div>

      <!-- Test de Conexión -->
      <div class="stripe-section">
        <h2>🔌 Test de Conexión</h2>
        <div class="test-controls">
          <button @click="testStripeInit" :disabled="testing" class="test-btn">
            <span v-if="testing">Testing...</span>
            <span v-else>Test Stripe Init</span>
          </button>

          <button @click="testAPI" :disabled="testing" class="test-btn">
            <span v-if="testing">Testing...</span>
            <span v-else>Test API Functions</span>
          </button>

          <button @click="clearResults" class="test-btn secondary">Limpiar Resultados</button>
        </div>
      </div>

      <!-- Resultados -->
      <div v-if="results.length > 0" class="stripe-section">
        <h2>📊 Resultados</h2>
        <div class="results-list">
          <div
            v-for="(result, index) in results"
            :key="index"
            class="result-item"
            :class="result.type"
          >
            <div class="result-time">{{ result.time }}</div>
            <div class="result-message">{{ result.message }}</div>
            <pre v-if="result.data" class="result-data">{{ result.data }}</pre>
          </div>
        </div>
      </div>

      <!-- Instrucciones -->
      <div class="stripe-section">
        <h2>📝 Instrucciones de Configuración</h2>
        <div class="instructions">
          <ol>
            <li>
              <strong>Obtener claves de Stripe:</strong>
              <ul>
                <li>
                  Ve a
                  <a href="https://dashboard.stripe.com/test/apikeys" target="_blank"
                    >Stripe Dashboard</a
                  >
                </li>
                <li>Copia tu "Publishable key" (comienza con <code>pk_test_</code>)</li>
                <li>Copia tu "Secret key" (comienza con <code>sk_test_</code>)</li>
              </ul>
            </li>
            <li>
              <strong>Configurar variables de entorno:</strong>
              <pre class="code-block">
# En tu archivo .env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_aqui
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
VITE_APP_URL=http://localhost:8888</pre
              >
            </li>
            <li>
              <strong>Reiniciar el servidor:</strong>
              <pre class="code-block">npm run dev:nl</pre>
            </li>
            <li>
              <strong>Configurar webhooks (para producción):</strong>
              <ul>
                <li>
                  Ve a
                  <a href="https://dashboard.stripe.com/test/webhooks" target="_blank"
                    >Stripe Webhooks</a
                  >
                </li>
                <li>
                  Crea endpoint:
                  <code>https://tu-dominio.netlify.app/.netlify/functions/stripe-webhook</code>
                </li>
                <li>
                  Selecciona eventos: <code>checkout.session.completed</code>,
                  <code>payment_intent.succeeded</code>
                </li>
              </ul>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { loadStripe } from '@stripe/stripe-js'

export default {
  name: 'StripeDebug',
  setup() {
    const testing = ref(false)
    const results = ref([])

    // Variables de entorno
    const stripeKey = computed(() => import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
    const appUrl = computed(() => import.meta.env.VITE_APP_URL || 'http://localhost:8888')
    const nodeEnv = computed(() => import.meta.env.NODE_ENV || 'development')

    // Estado de la clave de Stripe
    const stripeKeyStatus = computed(() => {
      if (!stripeKey.value) {
        return { class: 'error', message: 'No configurada' }
      }
      if (!stripeKey.value.startsWith('pk_')) {
        return { class: 'error', message: 'Formato inválido' }
      }
      return { class: 'success', message: 'Configurada correctamente' }
    })

    // Agregar resultado
    const addResult = (message, type = 'info', data = null) => {
      results.value.push({
        time: new Date().toLocaleTimeString(),
        message,
        type,
        data: data ? JSON.stringify(data, null, 2) : null,
      })
    }

    // Test de inicialización de Stripe
    const testStripeInit = async () => {
      testing.value = true

      try {
        addResult('Iniciando test de Stripe...', 'info')

        if (!stripeKey.value) {
          throw new Error('VITE_STRIPE_PUBLISHABLE_KEY no está configurada')
        }

        addResult(`Clave encontrada: ${stripeKey.value.substring(0, 12)}...`, 'success')

        const stripe = await loadStripe(stripeKey.value)

        if (stripe) {
          addResult('✅ Stripe inicializado correctamente', 'success')
          addResult('Stripe instance creada', 'success', {
            stripeVersion: stripe._apiVersion || 'unknown',
            stripeAccount: stripe.stripeAccount || 'default',
          })
        } else {
          throw new Error('loadStripe retornó null')
        }
      } catch (error) {
        addResult(`❌ Error: ${error.message}`, 'error')
        console.error('Error testing Stripe:', error)
      } finally {
        testing.value = false
      }
    }

    // Test de API functions
    const testAPI = async () => {
      testing.value = true

      try {
        addResult('Testing API functions...', 'info')

        // Test de función test-checkout
        const testData = {
          items: [
            {
              id: 1,
              name: 'Test Product',
              price: 29.99,
              quantity: 1,
            },
          ],
          customerEmail: 'test@example.com',
        }

        addResult('Enviando request a test-checkout...', 'info')

        const response = await fetch('/.netlify/functions/stripe_checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData),
        })

        const result = await response.json()

        if (response.ok) {
          addResult('✅ API test exitoso', 'success')
          addResult('Respuesta de la API:', 'success', result)
        } else {
          addResult(`❌ API error: ${result.error || result.message}`, 'error', result)
        }
      } catch (error) {
        addResult(`❌ Error de red: ${error.message}`, 'error')
        console.error('Error testing API:', error)
      } finally {
        testing.value = false
      }
    }

    // Limpiar resultados
    const clearResults = () => {
      results.value = []
    }

    // Verificar configuración al montar
    onMounted(() => {
      addResult('Página de debug cargada', 'info')

      if (stripeKeyStatus.value.class === 'success') {
        addResult('✅ Configuración de Stripe válida', 'success')
      } else {
        addResult('⚠️ Problemas de configuración detectados', 'warning')
      }
    })

    return {
      testing,
      results,
      stripeKey,
      appUrl,
      nodeEnv,
      stripeKeyStatus,
      testStripeInit,
      testAPI,
      clearResults,
      addResult,
    }
  },
}
</script>
