<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 text-center">
        <p class="text-h6">
          Cadastro de PET
        </p>
      </div>
      <q-form class="col-md-7 col-xs-12 col-sm-12 q-gutter-y-md" @submit.prevent="handleSubmit">

        <q-file
          outlined
          v-model="img"
          label="Foto de perfil"
          accept="image/*"
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
          <template v-slot:append v-if="img">
            <q-icon name="close" @click.stop="img = null" class="cursor-pointer" />
          </template>
        </q-file>

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
          mask="##/##/####"
          placeholder="DD/MM/AAAA"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="form.dataNasc" mask="DD/MM/YYYY">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Fechar" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <q-input
          label="Idade"
          v-model="form.idade"
          type="number"
        />

        <q-input
          label="Peso"
          v-model="form.peso"
          type="number"
          step="0.1"
          suffix="kg"
        />

        <q-input
          label="Cor"
          v-model="form.cor"
        />

        <q-select
          label="Possui Chip?"
          v-model="form.chip"
          :options="optionsChip"
          map-options
          emit-value
        />

        <q-editor
          label="Observações"
          v-model="form.observacoes"
          min-height="5rem"
          placeholder="Observações gerais sobre o pet"
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
import { date } from 'quasar'

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
      raca: '',
      sexo: '',
      dataNasc: '',
      cor: '',
      chip: '',
      idade: null,
      peso: null,
      tutor: '',
      img_url: ''
    })
    const img = ref(null)

    const optionsChip = [
      { label: 'Sim', value: 'Sim' },
      { label: 'Não', value: 'Não' }
    ]

    onMounted(() => {
      if (isUpdate.value) {
        handleGetPets(isUpdate.value)
      }
    })

    const handleSubmit = async () => {
      try {
        if (img.value) {
          const imgUrl = await uploadImg(img.value, 'pets')
          form.value.img_url = imgUrl
        }

        // Copia dados e remove campo 'saude' se existir
        const dataParaEnvio = { ...form.value }
        delete dataParaEnvio.saude

        // Converte data BR (DD/MM/AAAA) para formato do banco (AAAA-MM-DD)
        if (dataParaEnvio.dataNasc) {
          const dataObjeto = date.extractDate(dataParaEnvio.dataNasc, 'DD/MM/YYYY')
          if (dataObjeto) {
             dataParaEnvio.dataNasc = date.formatDate(dataObjeto, 'YYYY-MM-DD')
          }
        }

        if (isUpdate.value) {
          await update(table, dataParaEnvio)
          notifySuccess('PET atualizado com sucesso!')
        } else {
          await post(table, dataParaEnvio)
          notifySuccess('PET salvo com sucesso!')
        }
        router.push({ name: 'pet' })
      } catch (error) {
        console.error(error)
        if (error.message && error.message.includes('bucket not found')) {
          notifyError('Erro: Bucket de imagens "pets" não encontrado no Supabase.')
        } else {
          notifyError(error.message)
        }
      }
    }

    const handleGetPets = async (id) => {
      try {
        pet = await getById(table, id)
        // Converte data do banco para formato BR ao editar
        if (pet.dataNasc) {
          pet.dataNasc = date.formatDate(pet.dataNasc, 'DD/MM/YYYY')
        }
        form.value = pet
      } catch (error) {
        notifyError(error.message)
      }
    }

    return {
      handleSubmit,
      form,
      isUpdate,
      img,
      optionsChip
    }
  }
})
</script>