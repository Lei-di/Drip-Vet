// src/pages/tutor/Form.vue

<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 text-center">
        <p class="text-h6">
          Cadastro de Tutor
        </p>
      </div>
      <q-form class="col-md-7 col-xs-12 col-sm-12 q-gutter-y-md" @submit.prevent="handleSubmit">
        <q-input
          label="Nome"
          v-model="form.nome"
          :rules="[val => (val && val.length > 0) || 'É preciso inserir um nome!']"
        />

        <q-input
          label="CPF"
          v-model="form.cpf"
          mask="###.###.###-##"
          hint="Ex: 123.456.789-00"
          :rules="[val => (val && val.length > 0) || 'É preciso inserir um CPF!']"
        />

        <q-input
          label="WhatsApp"
          v-model="form.whatsapp"
          mask="(##) #####-####"
          hint="Ex: (67) 91234-5678"
          :rules="[val => (val && val.length > 0) || 'É preciso inserir um WhatsApp!']"
        />

        <q-input
          label="E-mail"
          v-model="form.email"
          type="email"
          hint="Ex: nome@dominio.com"
          :rules="[val => (val && val.length > 0) || 'É preciso inserir um e-mail!',
            val => /.+@.+\..+/.test(val) || 'E-mail inválido'
          ]"
        />

        <q-editor
          label="Observações"
          v-model="form.observacoes"
          min-height="5rem"
        />

        <q-input
          label="Rua"
          v-model="form.rua"
        />

        <q-input
          label="Número"
          v-model="form.numero"
          type="number"
        />

        <q-input
          label="Bairro"
          v-model="form.bairro"
        />

        <q-input
          label="Cidade"
          v-model="form.cidade"
        />

        <q-input
          label="Estado"
          v-model="form.estado"
        />

        <q-input
          label="CEP"
          v-model="form.cep"
          mask="#####-###"
          hint="Ex: 79800-123"
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
          :to="{ name: 'tutor'}"
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
  name: 'PageFormTutor',
  setup () {
    const router = useRouter()
    const route = useRoute()
    const { post, getById, update } = useApi()
    const { notifyError, notifySuccess } = useNotify()

    const isUpdate = computed(() => route.params.id)

    const form = ref({
      nome: '',
      cpf: '',
      whatsapp: '',
      email: '',
      observacoes: '',
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    })

    onMounted(() => {
      if (isUpdate.value) {
        handleGetTutor(isUpdate.value)
      }
    })

    const handleSubmit = async () => {
      try {
        if (isUpdate.value) {
          // Separa os dados para cada tabela
          const tutorData = {
            nome: form.value.nome,
            cpf: form.value.cpf,
            whatsapp: form.value.whatsapp.replace(/\D/g, ''),
            email: form.value.email,
            observacoes: form.value.observacoes
          }
          const enderecoData = {
            rua: form.value.rua,
            numero: form.value.numero,
            bairro: form.value.bairro,
            cidade: form.value.cidade,
            estado: form.value.estado,
            cep: form.value.cep
          }
          
          // Atualiza as duas tabelas separadamente
          await update('tutores', tutorData, 'id', isUpdate.value)
          await update('endereco', enderecoData, 'tutor_id', isUpdate.value)

          notifySuccess('Tutor atualizado com sucesso!')
          router.push({ name: 'tutor' })
        } else {
          // Lógica para criar novo tutor
          const tutorData = {
            nome: form.value.nome,
            cpf: form.value.cpf,
            whatsapp: form.value.whatsapp.replace(/\D/g, ''),
            email: form.value.email,
            observacoes: form.value.observacoes
          }

          const novoTutor = await post('tutores', tutorData)

          if (novoTutor && novoTutor.length > 0) {
            const tutorId = novoTutor[0].id
            const enderecoData = {
              rua: form.value.rua,
              numero: form.value.numero,
              bairro: form.value.bairro,
              cidade: form.value.cidade,
              estado: form.value.estado,
              cep: form.value.cep,
              id: tutorId
            }
            await post('endereco', enderecoData)
            notifySuccess('Tutor salvo com sucesso!')
            router.push({ name: 'tutor' })
          } else {
            throw new Error('Não foi possível criar o novo tutor.')
          }
        }
      } catch (error) {
        notifyError(error.message)
      }
    }

    const handleGetTutor = async (id) => {
      try {
        const response = await getById('tutores', id)
        form.value = response
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