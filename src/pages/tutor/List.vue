<template>
  <q-page padding>
    <div class="row">
      <q-table
        :rows="tutores"
        :columns="columnsTutor"
        row-key="id"
        class="col-12"
        :loading="loading"
      >
        <template v-slot:top>
          <span class="text-h6">
            Tutores
          </span>
          <q-space />
          <q-btn
            v-if="$q.platform.is.desktop"
            label="Novo"
            color="primary"
            icon="mdi-plus"
            dense
            :to="{ name: 'form-tutor' }"
          />
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="q-gutter-x-sm">
            <q-btn icon="mdi-pencil-outline" color="info" dense size="sm" @click="handleEdit(props.row)">
              <q-tooltip>
                Editar
              </q-tooltip>
            </q-btn>
            <q-btn icon="mdi-delete-outline" color="negative" dense size="sm" @click="handleRemoveTutor(props.row)">
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
        :to="{ name: 'form-tutor' }"
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
import { columnsTutor } from './table'
import useSupabase from 'src/boot/supabase'

export default defineComponent({
  name: 'PageTutorList',
  setup () {
    const { supabase } = useSupabase()
    const tutores = ref([])
    const loading = ref(true)
    const router = useRouter()
    const $q = useQuasar()
    const { user } = useAuthUser()
    const table = 'tutores'

    const { remove } = useApi()
    const { notifyError, notifySuccess } = useNotify()

    const handleListTutor = async () => {
      loading.value = true
      try {
        const { data, error } = await supabase
          .from('tutores')
          .select(`
            *,
            endereco (
              rua,
              numero,
              bairro,
              cidade,
              estado,
              cep
            )
          `)
          .eq('user_id', user.value.id)
        
        if (error) {
          notifyError(error.message)
        } else {
          tutores.value = data || []
        }
      } catch (error) {
        notifyError(error.message)
      } finally {
        loading.value = false
      }
    }

    const handleEdit = (tutores) => {
      router.push({ name: 'form-tutor', params: { id: tutores.id } })
    }

    const handleRemoveTutor = async (tutores) => {
      try {
        $q.dialog({
          title: 'Confirmação',
          message: `Deseja realmente remover ${tutores.nome} ?`,
          cancel: true,
          persistent: true
        }).onOk(async () => {
          await remove(table, tutores.id)
          notifySuccess('Tutor removido com sucesso!')
          handleListTutor()
        })
      } catch (error) {
        notifyError(error.message)
      }
    }

    onMounted(() => {
      handleListTutor()
    })

    return {
      columnsTutor,
      tutores,
      loading,
      handleEdit,
      handleRemoveTutor
    }
  }
})
</script>