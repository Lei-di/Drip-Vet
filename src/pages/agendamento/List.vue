<template>
  <q-page padding>
    <div class="row">
      <q-table
        :rows="agendamentos"
        :columns="columnsAgendamento"
        row-key="id"
        class="col-12"
        :loading="loading"
      >
        <template v-slot:top>
          <span class="text-h6">
            Agendamentos
          </span>
          <q-space />
          <q-btn
            v-if="$q.platform.is.desktop"
            label="Novo"
            color="primary"
            icon="mdi-plus"
            dense
            :to="{ name: 'form-agendamento' }"
          />
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="q-gutter-x-sm">
            <q-btn icon="mdi-pencil-outline" color="info" dense size="sm" @click="handleEdit(props.row)">
              <q-tooltip>
                Editar
              </q-tooltip>
            </q-btn>
            <q-btn icon="mdi-delete-outline" color="negative" dense size="sm" @click="handleRemoveAgendamento(props.row)">
              <q-tooltip>
                Remover
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
    >
      <q-btn
        v-if="$q.platform.is.mobile"
        fab
        icon="mdi-plus"
        color="primary"
        :to="{ name: 'form-agendamento' }"
      />
    </q-page-sticky>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import useApi from 'src/composables/UseApi'
import useNotify from 'src/composables/UseNotify'
import useAuthUser from 'src/composables/UseAuthUser'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { columnsAgendamento } from './table'

export default defineComponent({
  name: 'PageAgendamentoList',
  setup () {
    const agendamentos = ref([])
    const loading = ref(true)
    const router = useRouter()
    const $q = useQuasar()
    const { user } = useAuthUser()
    const table = 'agendamento'

    const { list, remove } = useApi()
    const { notifyError, notifySuccess } = useNotify()

    const handleListAgendamento = async () => {
      try {
        loading.value = true
        agendamentos.value = await list(table, user.value.id)
        loading.value = false
      } catch (error) {
        notifyError(error.message)
      }
    }

    const handleEdit = (agendamento) => {
      router.push({ name: 'form-agendamento', params: { id: agendamento.id } })
    }

    const handleRemoveAgendamento = async (agendamento) => {
      try {
        $q.dialog({
          title: 'Confirmar',
          message: `Deseja realmente remover o agendamento do dia ${agendamento.dataConsulta}, às ${agendamento.horaConsulta}?`,
          cancel: true,
          persistent: true
        }).onOk(async () => {
          await remove(table, agendamento.id)
          notifySuccess('Agendamento removido com sucesso!')
          handleListAgendamento()
        })
      } catch (error) {
        notifyError(error.message)
      }
    }

    onMounted(() => {
      handleListAgendamento()
    })

    return {
      columnsAgendamento,
      agendamentos,
      loading,
      handleEdit,
      handleRemoveAgendamento
    }
  }
})
</script>
