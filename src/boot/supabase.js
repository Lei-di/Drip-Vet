import { createClient } from '@supabase/supabase-js'
import { user } from 'src/composables/UseAuthUser'

// Lê variáveis do .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

// Log para debug (ajuda a saber se estão sendo lidas)
console.log('🔍 Supabase URL:', supabaseUrl || 'NÃO DEFINIDA')
console.log('🔍 Supabase Key:', supabaseKey ? 'Carregada' : 'NÃO DEFINIDA')

// Validação para evitar erros silenciosos
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis de ambiente do Supabase não foram carregadas.')
  console.error('Verifique se o arquivo .env está na raiz do projeto e contém:')
  console.error('VITE_SUPABASE_URL e VITE_SUPABASE_KEY')
  throw new Error('Configuração do Supabase ausente')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token'
  }
})

// Flag para evitar tentativas repetidas de refresh quando há erro
let refreshErrorOccurred = false

// Inicializa a sessão atual
supabase.auth.getSession().then(({ data: { session }, error }) => {
  if (error) {
    // Se houver erro ao buscar sessão (ex: refresh token inválido), limpa a sessão
    console.warn('⚠️ Erro ao buscar sessão:', error.message)
    if (error.message?.includes('refresh_token') || error.message?.includes('Invalid Refresh Token')) {
      refreshErrorOccurred = true
      // Limpa tokens inválidos do localStorage
      try {
        localStorage.removeItem('supabase.auth.token')
      } catch (e) {
        // Ignora erros ao limpar localStorage
      }
      // Limpa sessão no Supabase
      supabase.auth.signOut().catch(() => {
        // Ignora erros ao fazer signOut
      })
      user.value = null
    }
  } else {
    refreshErrorOccurred = false
    user.value = session?.user || null
  }
})

// Monitora mudanças no estado de autenticação
supabase.auth.onAuthStateChange(async (event, session) => {
  try {
    // Se já houve erro de refresh, ignora eventos de refresh
    if (refreshErrorOccurred && event === 'TOKEN_REFRESHED') {
      return
    }

    // Trata erros de refresh token
    if (event === 'TOKEN_REFRESHED') {
      refreshErrorOccurred = false
      user.value = session?.user || null
    } else if (event === 'SIGNED_OUT') {
      refreshErrorOccurred = false
      user.value = null
    } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
      refreshErrorOccurred = false
      user.value = session?.user || null
    } else {
      user.value = session?.user || null
    }
  } catch (error) {
    // Se houver erro ao processar mudança de estado, limpa a sessão
    if (error.message?.includes('refresh_token') || error.message?.includes('Invalid Refresh Token')) {
      console.warn('⚠️ Token inválido detectado, limpando sessão')
      refreshErrorOccurred = true
      user.value = null
      try {
        localStorage.removeItem('supabase.auth.token')
      } catch (e) {
        // Ignora erros ao limpar localStorage
      }
      await supabase.auth.signOut().catch(() => {
        // Ignora erros ao fazer signOut
      })
    }
  }
})

export default function useSupabase() {
  return { supabase }
}

export { supabase }
