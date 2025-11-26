<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 text-center">
        <p class="text-h6">
          Cadastro de Medicamentos
        </p>
      </div>
      <q-form class="col-md-7 col-xs-12 col-sm-12 q-gutter-y-md" @submit.prevent="handleSubmit">
        <q-input
          label="Nome"
          v-model="form.nome"
          :rules="[val => (val && val.length > 0) || 'É preciso inserir o nome!']"
        />

        <q-input
          label="Quantidade"
          v-model="form.quantidade"
          :rules="[val => (val && val.length > 0) || 'É preciso inserir a quantidade!']"
          type="number"
        />

        <q-input
          label="Fornecedor"
          v-model="form.fornecedor"
        />

        <q-input
          label="Prioridade"
          v-model="form.prioridade"
        />

        <q-editor
          label="Observações"
          v-model="form.observacoes"
          min-height="5rem"
        />

        <q-input
          label="Status"
          v-model="form.status"
        />

        <q-input
          label="Categoria"
          v-model="form.categoria"
        />

        <q-btn
          :label="isUpdate ? 'Atualizar' : 'Salvar'"
          color="primary"
          class="full-width"
          rounded
          type="submit"
        />

        <q-btn
          label="Cancelar"
          color="primary"
          class="full-width"
          rounded
          flat
          :to="{ name: 'estoqueMed'}"
        />

      </q-form>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useApi from 'src/composables/UseApi'
import useNotify from 'src/composables/UseNotify'

export default defineComponent({
  name: 'PageFormEstoqueMed',
  setup () {
    const table = 'estoqueMedicamentos'
    const router = useRouter()
    const route = useRoute()
    const { post, getById, update } = useApi()
    const { notifyError, notifySuccess } = useNotify()

    const isUpdate = computed(() => route.params.id)

    let estoqueMedicamentos = {}
    const form = ref({
      nome: '',
      quantidade: 0,
      fornecedor: '',
      prioridade: '',
      observacoes: '',
      status: '',
      categoria: ''
    })

    onMounted(() => {
      if (isUpdate.value) {
        handleGetEstoqueMedicamentos(isUpdate.value)
      }
    })

    const handleSubmit = async () => {
      try {
        if (isUpdate.value) {
          await update(table, form.value)
          notifySuccess('Medicamento atualizado com sucesso!')
        } else {
          await post(table, form.value)
          notifySuccess('Medicamento salvo com sucesso!')
        }
        // CORREÇÃO: Altera o nome da rota de redirecionamento para 'estoqueMed'
        router.push({ name: 'estoqueMed' })
      } catch (error) {
        notifyError(error.message)
      }
    }

    const handleGetEstoqueMedicamentos = async (id) => {
      try {
        estoqueMedicamentos = await getById(table, id)
        form.value = estoqueMedicamentos
      } catch (error) {
        notifyError(error.message)
      }
    }

    return {
      handleSubmit,
      form,
      isUpdate
    }
  }
})
</script>