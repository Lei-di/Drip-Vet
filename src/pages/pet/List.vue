<template>
  <q-page padding>
    <div class="row">
      <q-table
        :rows="pet"
        :columns="columnsPets"
        row-key="id"
        class="col-12"
        :loading="loading"
      >
        <template v-slot:top>
          <span class="text-h6">
            Pets
          </span>
          <q-space />
          <q-btn
            v-if="$q.platform.is.desktop"
            label="Novo"
            color="primary"
            icon="mdi-plus"
            dense
            :to="{ name: 'form-pet' }"
          />
        </template>
        <template v-slot:body-cell-img_url="props">
          <q-td :props="props">
            <q-avatar v-if="props.row.img_url">
              <img :src="props.row.img_url">
            </q-avatar>
            <q-avatar v-else color="grey" text-color="white" icon="mdi-image-off" />
          </q-td>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="q-gutter-x-sm">
            <q-btn icon="mdi-pencil-outline" color="info" dense size="sm" @click="handleEdit(props.row)">
              <q-tooltip>
                Editar
              </q-tooltip>
            </q-btn>
            <q-btn icon="mdi-delete-outline" color="negative" dense size="sm" @click="handleRemovePets(props.row)">
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
        :to="{ name: 'form-pet' }"
      />
    </q-page-sticky>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import useApi from 'src/composables/UseApi'
import useAuthUser from 'src/composables/UseAuthUser'
import useNotify from 'src/composables/UseNotify'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { columnsPets } from './table'

export default defineComponent({
  name: 'PagePetsList',
  setup () {
    const pet = ref([])
    const loading = ref(true)
    const router = useRouter()
    const table = 'pets'
    const $q = useQuasar()

    const { list, remove } = useApi()
    const { user } = useAuthUser()
    const { notifyError, notifySuccess } = useNotify()

    const handleListPets = async () => {
      try {
        loading.value = true
        pet.value = await list(table, user.value.id)
        loading.value = false
      } catch (error) {
        notifyError(error.message)
      }
    }

    const handleEdit = (pet) => {
      router.push({ name: 'form-pets', params: { id: pet.id } })
    }

    const handleRemovePets = async (pets) => {
      try {
        $q.dialog({
          title: 'Confirmar',
          message: `Deseja realmente remover ${pets.nome} ?`,
          cancel: true,
          persistent: true
        }).onOk(async () => {
          await remove(table, pets.id)
          notifySuccess('Pet removido com sucesso!')
          handleListPets()
        })
      } catch (error) {
        notifyError(error.message)
      }
    }

    onMounted(() => {
      handleListPets()
    })

    return {
      columnsPets,
      pet,
      loading,
      handleEdit,
      handleRemovePets
    }
  }
})
</script>
