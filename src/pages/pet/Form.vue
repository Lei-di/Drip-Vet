<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 text-center">
        <p class="text-h6">
          Cadastro de PET
        </p>
      </div>
      <q-form class="col-md-7 col-xs-12 col-sm-12 q-gutter-y-md" @submit.prevent="handleSubmit">

        <q-input
          label="Foto de perfil"
          stack-label
          v-model="imgUrl"
          type="file"
          accept="image/*"
        />

       <q-input
          label="Nome"
          v-model="form.nome"
          :rules="[val => (val && val.length > 0) || 'É preciso inserir um nome!']"
        />

        <q-input
          label="Tutor"
          v-model="form.tutor"
          :rules="[val => (val && val.length > 0) || 'É preciso inserir um tutor!']"
        />

        <q-input
          label="Raça"
          v-model="form.raca"
        />

        <q-input
          label="Sexo"
          v-model="form.sexo"
        />

        <q-input
          label="Data de Nascimento"
          v-model="form.dataNasc"
        />

        <q-input
          label="Idade"
          v-model="form.idade"
          type="number"
        />

        <q-input
          label="Peso"
          v-model="form.peso"
          type="number"
        />

        <q-input
          label="Cor"
          v-model="form.cor"
        />

        <q-input
          label="Chip"
          v-model="form.chip"
        />

        <q-editor
          label="Saúde"
          v-model="form.saude"
          min-height="5rem"
        />

        <q-editor
          label="Observações"
          v-model="form.observacoes"
          min-height="5rem"
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
          :to="{ name: 'pet'}"
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
  name: 'PageFormPets',
  setup () {
    const table = 'pets'
    const router = useRouter()
    const route = useRoute()
    const { post, getById, update, uploadImg } = useApi()
    const { notifyError, notifySuccess } = useNotify()

    const isUpdate = computed(() => route.params.id)

    let pet = {}
    const form = ref({
      nome: '',
      observacoes: '',
      saude: '',
      raca: '',
      sexo: '',
      dataNasc:'',
      cor:'',
      chip: '',
      idade: 0,
      peso: '',
      tutor: '',
      imgURL: ''
    })
    const img = ref([])

    onMounted(() => {
      // handleListPets()
      if (isUpdate.value) {
        handleGetPets(isUpdate.value)
      }
    })

    const handleSubmit = async () => {
      try {
        if (img.value.length > 0) {
          const img_url = await uploadImg(img.value[0], 'pets')
          form.value.imgURL = img_url
        }
        if (isUpdate.value) {
          await update(table, form.value)
          notifySuccess('PET atualizado com sucesso!')
        } else {
          await post(table, form.value)
          notifySuccess('PET salvo com sucesso!')
        }
        router.push({ name: 'pets' })
      } catch (error) {
        notifyError(error.message)
      }
    }

    const handleGetPets = async (id) => {
      try {
        pet = await getById(table, id)
        form.value = pet
      } catch (error) {
        notifyError(error.message)
      }
    }

    return {
      handleSubmit,
      form,
      isUpdate,
      img
    }
  }
})
</script>
