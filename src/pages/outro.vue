<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-lg shadow-2" style="width: 400px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">Login</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="email" label="E-mail" type="email" filled class="q-mb-md" />
        <q-input v-model="senha" label="Senha" type="password" filled class="q-mb-md" />
        <q-btn label="Entrar" color="primary" @click="fazerLogin" class="full-width" />
      </q-card-section>

      <q-card-section v-if="erro" class="text-negative">
        {{ erro }}
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
defineOptions({
  name: 'LoginPage'
})

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from 'src/services/loginService' // fornecido pela Pessoa A

const email = ref('')
const senha = ref('')
const erro = ref('')
const router = useRouter()

async function fazerLogin() {
  erro.value = ''
  const { error } = await login(email.value, senha.value)

  if (error) {
    erro.value = 'E-mail ou senha inválidos'
  } else {
    router.push('/home')
  }
}
</script>
