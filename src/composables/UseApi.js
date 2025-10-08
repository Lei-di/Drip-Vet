// src/composables/UseApi.js

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

  // --- FUNÇÃO LIST CORRIGIDA ---
  // Agora ela não exige mais o user_id e busca todos os registros da tabela.
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
    return data
  }

  // --- FUNÇÃO POST CORRIGIDA ---
  // Removemos a adição automática do user_id.
  const post = async (table, form) => {
    const { data, error } = await supabase
      .from(table)
      .insert(form) // Insere diretamente o formulário
      .select()

    if (error) {
      throw error
    }
    return data
  }

  const update = async (table, form) => {
    if (!form.id) {
      throw new Error('ID inválido para atualização')
    }
    const { data, error } = await supabase
      .from(table)
      .update({ ...form })
      .eq('id', form.id)
      .select()

    if (error) {
      throw error
    }
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
      $q.loading.show({ backgroundColor: 'dark' })
      try {
        const { data, error } = await supabase
          .from('config')
          .select('*')
          .eq('user_id', id)
        if (error) throw error
        if (data.length > 0) {
          brand.value = data[0]
          setBrand(brand.value.primary, brand.value.secondary)
        }
        return brand
      } catch (error) {
        console.error('Erro ao buscar a marca:', error.message)
      } finally {
        $q.loading.hide()
      }
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