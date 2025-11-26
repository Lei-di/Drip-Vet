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
        
        <q-input
          label="Data da Última Entrada"
          v-model="form.dataEntrada"
          mask="##/##/####"
          hint="Formato: DD/MM/AAAA"
        />
        
        <q-input
          label="Data da Última Saída"
          v-model="form.dataSaida"
          mask="##/##/####"
          hint="Formato: DD/MM/AAAA"
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
      categoria: '',
      dataEntrada: '', 
      dataSaida: ''
    })
    
    // Helper para converter DD/MM/AAAA para YYYY-MM-DD (formato do banco)
    const convertDateToDBFormat = (dateString) => {
      if (!dateString || dateString.length < 10) return null
      const parts = dateString.split('/')
      // Espera DD/MM/YYYY
      if (parts.length === 3 && parts[2].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}` // YYYY-MM-DD
      }
      return dateString
    }

    // Helper para converter YYYY-MM-DD (formato do banco) para DD/MM/AAAA
    const convertDateToBRFormat = (dateString) => {
      if (!dateString || dateString.length < 10) return ''
      // Espera YYYY-MM-DD
      const parts = dateString.substring(0, 10).split('-')
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}` // DD/MM/YYYY
      }
      return dateString
    }


    onMounted(() => {
      if (isUpdate.value) {
        handleGetEstoqueMedicamentos(isUpdate.value)
      }
    })

    const handleSubmit = async () => {
      try {
        const dataToSubmit = { ...form.value }

        // Converte as datas para o formato do banco (YYYY-MM-DD) antes de enviar
        if (dataToSubmit.dataEntrada) {
          dataToSubmit.dataEntrada = convertDateToDBFormat(dataToSubmit.dataEntrada)
        }
        if (dataToSubmit.dataSaida) {
          dataToSubmit.dataSaida = convertDateToDBFormat(dataToSubmit.dataSaida)
        }
        
        if (isUpdate.value) {
          await update(table, dataToSubmit)
          notifySuccess('Medicamento atualizado com sucesso!')
        } else {
          await post(table, dataToSubmit)
          notifySuccess('Medicamento salvo com sucesso!')
        }
        router.push({ name: 'estoqueMed' })
      } catch (error) {
        notifyError(error.message)
      }
    }

    const handleGetEstoqueMedicamentos = async (id) => {
      try {
        estoqueMedicamentos = await getById(table, id)
        
        // Converte as datas do banco (YYYY-MM-DD) para o formato BR (DD/MM/AAAA) ao carregar
        form.value = {
          ...estoqueMedicamentos,
          dataEntrada: convertDateToBRFormat(estoqueMedicamentos.dataEntrada),
          dataSaida: convertDateToBRFormat(estoqueMedicamentos.dataSaida)
        }
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