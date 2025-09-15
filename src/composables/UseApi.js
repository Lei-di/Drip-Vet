import useSupabase from 'src/boot/supabase'
import useAuthUser from './UseAuthUser'
import { v4 as uuidv4 } from 'uuid'
import { useRoute } from 'vue-router'
import useBrand from 'src/composables/UseBrand'
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const brand = ref({
  primary: '',
  secondary: '',
  name: '',
  phone: '',
  paralax_url: ''
})

export default function useApi () {
  const { supabase } = useSupabase()
  const { user } = useAuthUser()
  const route = useRoute()
  const { setBrand } = useBrand()
  const $q = useQuasar()

  const list = async (table) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
    if (error) throw error
    return data
  }

  const fetchCount = async (table, userId) => {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
    if (error) throw error
    return {
      data,
      count
    }
  }

  const getById = async (table, id) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error

    // Se for a tabela tutores, buscar endereço separadamente
    if (table === 'tutores' && data.endereco) {
      try {
        const { data: enderecoData } = await supabase
          .from('endereco')
          .select('*')
          .eq('id', data.endereco)
          .single()

        if (enderecoData) {
          return {
            ...data,
            endereco_id: enderecoData.id,
            rua: enderecoData.rua,
            numero: enderecoData.numero,
            bairro: enderecoData.bairro,
            cidade: enderecoData.cidade,
            estado: enderecoData.estado,
            cep: enderecoData.cep
          }
        }
      } catch (enderecoError) {
        console.warn('Erro ao buscar endereço:', enderecoError)
      }
    }

    return data
  }

  const post = async (table, form) => {
    const { data, error } = await supabase
      .from(table)
      .insert([form])
    if (error) throw error
    return data
  }

  const update = async (table, form) => {
    // Verificar se o ID existe e é válido
    if (!form.id || form.id === 'null' || form.id === null) {
      throw new Error('ID inválido para atualização')
    }

    const { data, error } = await supabase
      .from(table)
      .update({ ...form })
      .eq('id', form.id)
    if (error) throw error
    return data
  }

  const remove = async (table, id) => {
    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    if (error) throw error
    return data
  }

  const uploadImg = async (file, storage) => {
    const fileName = uuidv4()
    const { error } = supabase
      .storage
      .from(storage)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    const publicUrl = await getUrlPublic(fileName, storage)
    if (error) throw error
    return publicUrl
  }

  const getUrlPublic = async (fileName, storage) => {
    const { publicURL, error } = supabase
      .storage
      .from(storage)
      .getPublicUrl(fileName)
    if (error) throw error
    return publicURL
  }

  const getBrand = async () => {
    const id = route.params.id || user?.value?.id
    if (id) {
      $q.loading.show({
        backgroundColor: 'dark'
      })
      const { data, error } = await supabase
        .from('config')
        .select('*')
        .eq('user_id', id)
      if (error) throw error
      if (data.length > 0) {
        brand.value = data[0]
        setBrand(brand.value.primary, brand.value.secondary)
      }
      $q.loading.hide()
      return brand
    }
  }

  return {
    list,
    fetchCount,
    getById,
    post,
    update,
    remove,
    uploadImg,
    getBrand,
    brand
  }
}