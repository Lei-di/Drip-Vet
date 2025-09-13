import { ref } from 'vue'
import useSupabase from 'boot/supabase'

// Exporta o user para uso global (importar no boot/supabase.js)
export const user = ref(null)

export default function useAuthUser() {
  const { supabase } = useSupabase()

  

  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    user.value = data.user
    return data.user
  }

  const loginWithSocialProvider = async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) throw error
    user.value = data.user
    return data.user
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
  }

  const isLoggedIn = () => {
    return !!user.value
  }

  const register = async ({ email, password, ...meta }) => {
    const { data, error } = await supabase.auth.signUp(
      { email, password },
      {
        data: meta,
        redirectTo: `${window.location.origin}/me?fromEmail=registrationConfirmation`
      }
    )
    if (error) throw error
    user.value = data.user
    return data.user
  }

  const update = async (data) => {
    const { data: updatedData, error } = await supabase.auth.updateUser(data)
    if (error) throw error
    user.value = updatedData.user
    return updatedData.user
  }

  const sendPasswordResetEmail = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  const resetPassword = async () => {
    throw new Error('resetPassword não implementado')
  }

  return {
    user,
    login,
    loginWithSocialProvider,
    isLoggedIn,
    logout,
    register,
    update,
    sendPasswordResetEmail,
    resetPassword
  }
}
