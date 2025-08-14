<template>
  <q-layout view="lHh Lpr lFf">
    <q-header style="background-color: #357a44;">
      <q-toolbar>
        <!-- Título removido daqui -->
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, onMounted } from 'vue'
import useApi from 'src/composables/UseApi'

export default defineComponent({
  name: 'LoginLayout',

  setup () {
    const { getBrand } = useApi()
    onMounted(() => {
      getBrand()
    })
    return {}
  }
})
</script>
