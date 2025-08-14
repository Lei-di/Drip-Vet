<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 text-center">
        <p class="text-h6">
          Agendamento
        </p>
      </div>
      <q-form class="col-md-7 col-xs-12 col-sm-12 q-gutter-y-md" @submit.prevent="handleSubmit">
        <q-input
          label="Nome do Tutor"
          v-model="form.tutor"
          :rules="[val => (val && val.length > 0) || 'É preciso inserir um nome!']"
        />

        <q-input
          label="Nome do PET"
          v-model="form.pet"
          :rules="[val => (val && val.length > 0) || 'É preciso inserir um nome!']"
        />

        <q-select
          v-model="form.vet"
          :options="optionsUsuarios"
          label="Veterinário"
          option-value="id"
          option-label="name"
          map-options
          emit-value
          :rules="[val => !!val || 'É preciso inserir um veterinário!']"
        />

        <q-input
          label="Data da consulta"
          v-model="form.dataConsulta"
          mask="####-##-##"
          hint="Formato: AAAA-MM-DD"
        />

        <q-input
          label="Horário da consulta"
          v-model="form.horaConsulta"
          mask="##:##"
          hint="Formato: HH:MM"
        />

        <q-input
          label="Tipo da consulta"
          v-model="form.tipoConsulta"
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
          :to="{ name: 'agendamento'}"
        />

      </q-form>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from 'src/boot/supabase'
import useApi from 'src/composables/UseApi'
import useNotify from 'src/composables/UseNotify'

export default defineComponent({
  name: 'PageFormAgendamento',
  setup () {
    const table = 'agendamento'
    const router = useRouter()
    const route = useRoute()
    const { post, getById, update } = useApi()
    const { notifyError, notifySuccess } = useNotify()

    const isUpdate = computed(() => route.params.id)

    let agendamento = {}
    const form = ref({
      tutor: '',
      pet: '',
      vet: '',
      dataConsulta: '',
      horaConsulta: '',
      tipoConsulta: '',
      observacoes: ''
    })

    const optionsUsuarios = ref([])

    const fetchVeterinarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome')
        .eq('tipoUsuario', 'veterinario')

      if (error) throw error

      optionsUsuarios.value = data
    } catch (error) {
      notifyError(error.message)
    }
  }

    onMounted(() => {
      if (isUpdate.value) {
        handleGetAgendamento(isUpdate.value)
      }
      fetchVeterinarios()
    })

    const handleSubmit = async () => {
      try {
        if (isUpdate.value) {
          await update(table, form.value)
          notifySuccess('Agendamento atualizado com sucesso!')
        } else {
          await post(table, form.value)
          notifySuccess('Agendamento salvo com sucesso!')
        }
        router.push({ name: 'agendamento' })
      } catch (error) {
        notifyError(error.message)
      }
    }

    const handleGetAgendamento = async (id) => {
      try {
        agendamento = await getById(table, id)
        form.value = agendamento
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
