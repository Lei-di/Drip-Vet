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

      <q-card>
        <q-separator />
        <q-card-section>
          <div class="text-subtitle1">Endereço</div>
          <div>{{ tutor.endereco?.rua }}, {{ tutor.endereco?.numero }}</div>
          <div>{{ tutor.endereco?.bairro }} - {{ tutor.endereco?.cidade }} / {{ tutor.endereco?.estado }}</div>
          <div>CEP: {{ tutor.endereco?.cep }}</div>
        </q-card-section>
      </q-card>

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
import useSupabase from "../../../../../../Programas/VET/DripVetNick/src/boot/supabase.js";

export default defineComponent({
  name: 'PageTutorList',
  setup () {
    const { supabase } = useSupabase()
    const tutor = ref([])
    const loading = ref(true)
    const router = useRouter()
    const $q = useQuasar()
    const { user } = useAuthUser()
    const table = 'tutores'

    const { remove } = useApi()
    const { notifyError, notifySuccess } = useNotify()

    const handleListTutor = async () => {
      loading.value = true
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
      loading.value = false
    if (error) {
      notifyError(error.message)
    } else {
      tutor.value = data[0]
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
      tutor,
      loading,
      handleEdit,
      handleRemoveTutor
    }
  }
})
</script>
