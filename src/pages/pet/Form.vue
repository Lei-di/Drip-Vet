<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 text-center">
        <p class="text-h6">Cadastro de PET</p>
      </div>
      <q-form class="col-md-7 col-xs-12 col-sm-12 q-gutter-y-md" @submit.prevent="handleSubmit">
        <q-file
          outlined
          v-model="img"
          label="Foto de perfil"
          accept=".png,.jpg,.jpeg,.PNG,.JPG,.JPEG"
          @rejected="onRejected"
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
          :rules="[(val) => (val && val.length > 0) || 'É preciso inserir um nome!']"
        />

        <q-select
          label="Tutor"
          v-model="form.tutor"
          :options="filteredTutores"
          option-label="nome"
          option-value="id"
          map-options
          emit-value
          use-input
          input-debounce="0"
          @filter="filterTutores"
          clearable
          :rules="[(val) => !!val || 'É preciso selecionar um tutor!']"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> Nenhum tutor encontrado </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-input label="Raça" v-model="form.raca" />

        <div>
          <div class="q-mb-xs text-body2">Sexo</div>
          <div class="row q-gutter-xs">
            <q-btn
              :color="form.sexo === 'Macho' ? 'primary' : 'grey-4'"
              :text-color="form.sexo === 'Macho' ? 'white' : 'dark'"
              label="Macho"
              @click="form.sexo = 'Macho'"
              size="sm"
              rounded
              style="min-width: 100px"
            />
            <q-btn
              :color="form.sexo === 'Fêmea' ? 'pink' : 'grey-4'"
              :text-color="form.sexo === 'Fêmea' ? 'white' : 'dark'"
              label="Fêmea"
              @click="form.sexo = 'Fêmea'"
              size="sm"
              rounded
              style="min-width: 100px"
            />
          </div>
        </div>

        <q-input
          label="Data de Nascimento"
          v-model="form.dataNasc"
          mask="##/##/####"
          placeholder="DD/MM/AAAA"
          @update:model-value="calcularIdade"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  v-model="form.dataNasc"
                  mask="DD/MM/YYYY"
                  @update:model-value="calcularIdade"
                >
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
          :model-value="form.idade !== null && form.idade !== undefined ? form.idade : ''"
          readonly
          hint="Calculada automaticamente"
        />

        <q-input label="Peso" v-model="form.peso" type="number" step="0.1" suffix="kg" />

        <q-input label="Cor" v-model="form.cor" />

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
          :to="{ name: 'pet' }"
        />
      </q-form>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useApi from 'src/composables/UseApi'
import useNotify from 'src/composables/UseNotify'
import { date } from 'quasar'

export default defineComponent({
  name: 'PageFormPets',
  setup() {
    const table = 'pets'
    const router = useRouter()
    const route = useRoute()
    const { post, getById, update, uploadImg, list } = useApi()
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
      tutor: null,
      imgUrl: '',
    })
    const img = ref(null)

    const optionsChip = [
      { label: 'Sim', value: 'Sim' },
      { label: 'Não', value: 'Não' },
    ]

    const optionsTutores = ref([])
    const filteredTutores = ref([])
    const idadeEmMeses = ref(null) // Armazena a idade em meses para salvar no banco

    const filterTutores = (val, update) => {
      if (val === '') {
        update(() => {
          filteredTutores.value = optionsTutores.value
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        filteredTutores.value = optionsTutores.value.filter(
          (tutor) => tutor.nome.toLowerCase().indexOf(needle) > -1,
        )
      })
    }

    const onRejected = () => {
      notifyError('Apenas arquivos PNG e JPG são permitidos!')
    }

    const calcularIdade = () => {
      if (!form.value.dataNasc) {
        form.value.idade = null
        return
      }

      try {
        // Remove espaços e caracteres extras
        const dataLimpa = form.value.dataNasc.trim()

        // Verifica se a data tem o formato correto (DD/MM/YYYY)
        if (!dataLimpa || dataLimpa.length < 10) {
          form.value.idade = null
          return
        }

        // Extrai a data do formato DD/MM/YYYY
        const dataNasc = date.extractDate(dataLimpa, 'DD/MM/YYYY')

        if (!dataNasc || isNaN(dataNasc.getTime())) {
          form.value.idade = null
          return
        }

        // Data atual
        const hoje = new Date()

        // Calcula a diferença em anos e meses
        let anos = hoje.getFullYear() - dataNasc.getFullYear()
        let meses = hoje.getMonth() - dataNasc.getMonth()
        const diaAtual = hoje.getDate()
        const diaNasc = dataNasc.getDate()

        // Ajusta se ainda não fez aniversário no mês atual
        if (meses < 0 || (meses === 0 && diaAtual < diaNasc)) {
          anos--
          meses += 12
        }

        // Ajusta meses se o dia ainda não chegou
        if (diaAtual < diaNasc) {
          meses--
          if (meses < 0) {
            meses += 12
            anos--
          }
        }

        // Garante que não seja negativa
        if (anos < 0) {
          form.value.idade = '0 meses'
          return
        }

        // Calcula idade total em meses para salvar no banco
        idadeEmMeses.value = anos * 12 + meses

        // Formata a idade com anos e meses para exibição
        if (anos === 0 && meses === 0) {
          form.value.idade = '0 meses'
        } else if (anos === 0) {
          form.value.idade = meses === 1 ? '1 mês' : `${meses} meses`
        } else if (meses === 0) {
          form.value.idade = anos === 1 ? '1 ano' : `${anos} anos`
        } else {
          const anosTexto = anos === 1 ? '1 ano' : `${anos} anos`
          const mesesTexto = meses === 1 ? '1 mês' : `${meses} meses`
          form.value.idade = `${anosTexto} e ${mesesTexto}`
        }
      } catch (error) {
        console.error('Erro ao calcular idade:', error)
        form.value.idade = null
      }
    }

    const handleListTutores = async () => {
      try {
        const tutores = await list('tutores')
        optionsTutores.value = tutores || []
        filteredTutores.value = tutores || []
      } catch (error) {
        notifyError('Erro ao carregar tutores: ' + error.message)
      }
    }

    // Watcher para calcular idade automaticamente quando a data mudar
    watch(
      () => form.value.dataNasc,
      (newValue) => {
        if (newValue) {
          calcularIdade()
        }
      },
    )

    onMounted(() => {
      handleListTutores()
      if (isUpdate.value) {
        handleGetPets(isUpdate.value)
      }
    })

    const handleSubmit = async () => {
      try {
        if (img.value) {
          // Valida o tipo de arquivo
          const fileName = img.value.name.toLowerCase()
          const allowedExtensions = ['.png', '.jpg', '.jpeg']
          const fileExtension = fileName.substring(fileName.lastIndexOf('.'))

          if (!allowedExtensions.includes(fileExtension)) {
            notifyError('Apenas arquivos PNG e JPG são permitidos!')
            return
          }

          const imgUrl = await uploadImg(img.value, 'pets')
          form.value.imgUrl = imgUrl
        }

        // Copia dados e remove campo 'saude' se existir
        const dataParaEnvio = { ...form.value }
        delete dataParaEnvio.saude

        // Converte idade formatada para número (meses) para salvar no banco
        if (idadeEmMeses.value !== null) {
          dataParaEnvio.idade = idadeEmMeses.value
        }

        // Converte chip de string para boolean
        if (dataParaEnvio.chip !== undefined && dataParaEnvio.chip !== null) {
          dataParaEnvio.chip = dataParaEnvio.chip === 'Sim' || dataParaEnvio.chip === true
        }

        // Garante que tutor seja um número (bigint)
        if (dataParaEnvio.tutor) {
          dataParaEnvio.tutor = parseInt(dataParaEnvio.tutor)
        }

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
        // Converte chip de boolean para string
        if (pet.chip !== undefined && pet.chip !== null) {
          pet.chip = pet.chip === true ? 'Sim' : 'Não'
        }
        form.value = pet
        // Calcula a idade automaticamente ao carregar
        if (pet.dataNasc) {
          calcularIdade()
        }
      } catch (error) {
        notifyError(error.message)
      }
    }

    return {
      handleSubmit,
      form,
      isUpdate,
      img,
      optionsChip,
      filteredTutores,
      filterTutores,
      onRejected,
    }
  },
})
</script>
