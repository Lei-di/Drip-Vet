00<template>
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
    const table = 'tutores'
    const router = useRouter()
    const route = useRoute()
    const { post, getById, update } = useApi()
    const { notifyError, notifySuccess } = useNotify()

    const isUpdate = computed(() => route.params.id)

    let tutor = {}
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
          // Atualiza dados do tutor
          await update('tutores', form.value)

          // Se tem endereço, atualiza
          if (form.value.endereco_id) {
            await update('endereco', {
              id: form.value.endereco_id,
              rua: form.value.rua,
              numero: form.value.numero,
              bairro: form.value.bairro,
              cidade: form.value.cidade,
              estado: form.value.estado,
              cep: form.value.cep
            })
          }

          notifySuccess('Tutor atualizado com sucesso!')
        } else {
          // Cadastra o tutor
          const usuario = await post('tutores', {
            nome: form.value.nome,
            cpf: form.value.cpf,
            whatsapp: form.value.whatsapp.replace(/\D/g, ''),
            email: form.value.email,
            observacoes: form.value.observacoes
          })

          const usuarioId = usuario[0]?.id

          // Cadastra o endereço vinculado ao novo tutor
          await post('endereco', {
            rua: form.value.rua,
            numero: form.value.numero,
            bairro: form.value.bairro,
            cidade: form.value.cidade,
            estado: form.value.estado,
            cep: form.value.cep,
            tutor: usuarioId
          })

          notifySuccess('Tutor salvo com sucesso!')
        }

        router.push({ name: 'tutor' })
      } catch (error) {
        notifyError(error.message)
      }
    }

    const handleGetTutor = async (id) => {
      try {
        tutor = await getById(table, id)
        form.value = {
          ...tutor,
          rua: tutor.rua || '',
          numero: tutor.numero || '',
          bairro: tutor.bairro || '',
          cidade: tutor.cidade || '',
          estado: tutor.estado || '',
          cep: tutor.cep || ''
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