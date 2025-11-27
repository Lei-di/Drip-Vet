<template>
  <q-card class="card-dashboard">
    <q-card-section class="row items-center q-pb-none">
      <div class="col-auto">
        <q-icon :name="icon" size="2.5rem" color="primary" />
      </div>
      <div class="col text-right">
        <div class="text-h6 text-weight-bold">{{ count }}</div>
        <div class="text-caption text-grey-7">{{ label }}</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import useSupabase from 'src/boot/supabase'
import useAuthUser from 'src/composables/UseAuthUser'

export default defineComponent({
  name: 'CardDashboard',
  props: {
    table: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { supabase } = useSupabase()
    const { user } = useAuthUser()
    const count = ref(0)
    const loading = ref(true)

    const loadCount = async () => {
      // Não tenta carregar se não houver usuário autenticado
      if (!user.value) {
        loading.value = false
        count.value = 0
        return
      }

      try {
        loading.value = true

        // Mapeia os nomes das tabelas para os nomes corretos no banco
        const tableMap = {
          tutores: 'tutores',
          pets: 'pets',
          agendamentos: 'agendamento',
          estoque: 'estoqueMedicamentos',
          usuarios: 'usuarios',
        }

        const tableName = tableMap[props.table] || props.table

        // Busca a contagem de registros
        const { count: totalCount, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })

        if (error) {
          // Se for erro de autenticação ou 400, não tenta novamente
          if (
            error.code === 'PGRST301' ||
            error.status === 400 ||
            error.message?.includes('JWT') ||
            error.message?.includes('token') ||
            error.message?.includes('refresh_token')
          ) {
            console.warn(`Erro ao buscar contagem de ${tableName}:`, error.message)
            count.value = 0
            loading.value = false
            return
          }
          console.warn(`Erro ao buscar contagem de ${tableName}:`, error)
          count.value = 0
        } else {
          count.value = totalCount || 0
        }
      } catch (error) {
        // Trata erros de rede ou outros erros
        if (
          error.message?.includes('refresh_token') ||
          error.message?.includes('Invalid Refresh Token') ||
          error.status === 400
        ) {
          console.warn('Erro de autenticação ao carregar contagem')
          count.value = 0
          loading.value = false
          return
        }
        console.warn('Erro ao carregar contagem:', error)
        count.value = 0
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadCount()
    })

    return {
      count,
      loading,
    }
  },
})
</script>

<style scoped>
.card-dashboard {
  min-height: 100px;
  transition: transform 0.2s;
}

.card-dashboard:hover {
  transform: translateY(-2px);
}
</style>
