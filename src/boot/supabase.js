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

// Cria o cliente
const supabase = createClient(supabaseUrl, supabaseKey)

// Mantém o estado global do usuário atualizado
supabase.auth.onAuthStateChange((event, session) => {
  user.value = session?.user || null
})

export default function useSupabase() {
  return { supabase }
}
