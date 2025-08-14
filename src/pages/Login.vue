<template>
  <q-page
    class="flex flex-center column"
    style="background-color: #357a44; min-height: 100vh;"
  >
    <div
      class="text-center"
      style="color: white; font-size: 60px; font-weight: bold; margin-bottom: 5px;"
    >
      Drip Vet
    </div>

    <q-card
      class="q-pa-lg"
      style="width: 400px; max-width: 90%; background-color: #1b5e20;"
    >
      <q-card-section>
        <q-input
          v-model="email"
          label="E-mail"
          type="email"
          outlined
          autocomplete="email"
          class="white-input"
        />
        <q-input
          v-model="password"
          label="Senha"
          type="password"
          outlined
          class="q-mt-md white-input"
          autocomplete="current-password"
          @keyup.enter="doLogin"
        />
        <q-btn
          label="Entrar"
          class="q-mt-md full-width white-btn"
          :loading="loading"
          @click="doLogin"
          unelevated
          style="background-color: #2196F3 !important; color: white !important;"
        />
        <q-btn
          label="Cadastrar"
          color="positive"
          class="q-mt-sm full-width"
          :loading="loading"
          @click="doRegister"
        />
      </q-card-section>

      <q-card-actions align="center">
        <div v-if="errorMessage" class="text-negative">{{ errorMessage }}</div>
        <div v-if="successMessage" class="text-positive">{{ successMessage }}</div>
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useAuthUser from 'src/composables/UseAuthUser'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const router = useRouter()

const { login, register } = useAuthUser()

async function doLogin() {
  if (!email.value || !password.value) {
    errorMessage.value = 'Por favor, preencha e-mail e senha'
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await login({ email: email.value, password: password.value })
    router.push('/app/home')  // redireciona para home após login
  } catch {
    errorMessage.value = 'E-mail ou senha inválidos'
  } finally {
    loading.value = false
  }
}

async function doRegister() {
  if (!email.value || !password.value) {
    errorMessage.value = 'Por favor, preencha e-mail e senha para cadastro'
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await register({ email: email.value, password: password.value })
    successMessage.value = 'Usuário cadastrado com sucesso! Agora clique em Entrar.'
  } catch (err) {
    errorMessage.value = 'Erro no cadastro: ' + err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.white-input >>> .q-field__control {
  background-color: white !important;
  color: black !important;
}

.white-btn {
  background-color: white !important;
  color: black !important;
  font-weight: bold;
}
</style>
