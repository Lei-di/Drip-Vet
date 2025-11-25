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
    // Lógica específica para trazer endereço junto com o tutor
    if (table === 'tutores') {
      const { data, error } = await supabase
        .from(table)
        .select(`*, endereco ( id, rua, numero, bairro, cidade, estado, cep )`)
        .eq('id', id)
        .single()
      if (error) throw error

      const usuario = {
        ...data,
        endereco_id: data.endereco?.id,
        rua: data.endereco?.rua,
        numero: data.endereco?.numero,
        bairro: data.endereco?.bairro,
        cidade: data.endereco?.cidade,
        estado: data.endereco?.estado,
        cep: data.endereco?.cep
      }
      return usuario
    }

    // Padrão para outras tabelas
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  }

  const post = async (table, form) => {
    const { data, error } = await supabase
      .from(table)
      .insert([
        {
          ...form,
          user_id: user.value.id
        }
      ])
      .select() // Importante retornar os dados inseridos
    if (error) throw error
    return data
  }

  const update = async (table, form) => {
    const { data, error } = await supabase
      .from(table)
      .update({ ...form })
      .match({ id: form.id })
    if (error) throw error
    return data
  }

  const remove = async (table, id) => {
    const { data, error } = await supabase
      .from(table)
      .delete()
      .match({ id })
    if (error) throw error
    return data
  }

  const uploadImg = async (file, storage) => {
    const fileName = uuidv4()
    const { error } = await supabase
      .storage
      .from(storage)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    if (error) throw error
    const publicUrl = await getUrlPublic(fileName, storage)
    return publicUrl
  }

  const getUrlPublic = async (fileName, storage) => {
    const { data, error } = supabase
      .storage
      .from(storage)
      .getPublicUrl(fileName)
    if (error) throw error
    return data.publicUrl
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