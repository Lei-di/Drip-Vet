<template>
  <q-page padding class="home-page">
    <div class="welcome-text">
      <h1>Drip Vet</h1>
      <p>Sistema de Gerenciamento <br />para Clínica Veterinária</p>

      <ul class="action-links">
        <!-- Ajustei para rotas existentes -->
        <li @click="goTo('form-pet')" class="action-item">
          <div class="icon-circle">
            <q-icon name="pets" size="20px" />
          </div>
          <span class="action-label">Novo Pet</span>
        </li>
        <li @click="goTo('tutor')" class="action-item">
          <div class="icon-circle">
            <q-icon name="people" size="20px" />
          </div>
          <span class="action-label">Tutores</span>
        </li>
        <li @click="goTo('form-agendamento')" class="action-item">
          <div class="icon-circle">
            <q-icon name="calendar_today" size="20px" />
          </div>
          <span class="action-label">Novo Agendamento</span>
        </li>
        <li @click="goTo('agendamento')" class="action-item">
          <div class="icon-circle">
            <q-icon name="event_note" size="20px" />
          </div>
          <span class="action-label">Agenda</span>
        </li>
      </ul>
    </div>

    <!-- AGENDA DE HOJE -->
    <div class="agenda-container">
      <h2 class="agenda-title">Agenda de Hoje</h2>
      <p class="agenda-subtitle">Próximos atendimentos agendados</p>

      <div class="agenda-card" v-for="(item, index) in agenda" :key="index">
        <div class="agenda-icon">
          <q-icon name="pets" size="24px" />
        </div>
        <div class="agenda-info">
          <strong>{{ item.horario }} - {{ item.nome }}</strong>
          <p>Tutor: {{ item.tutor }}</p>
          <p>Consulta: {{ item.consulta }}</p>
        </div>
        <q-btn
          unelevated
          :color="botaoClicado[index] ? 'green-10' : 'white'"
          :text-color="botaoClicado[index] ? 'white' : 'black'"
          label="Ver Detalhes"
          size="sm"
          class="agenda-btn"
          @click="botaoClicado[index] = !botaoClicado[index]"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goTo(page) {
  router.push(`/app/${page}`)
}

const agenda = ref([
  { horario: '09:00', nome: 'Fredinho', tutor: 'Francyeli Bordinhão', consulta: 'Dra. Laura' },
  { horario: '11:30', nome: 'Filomena', tutor: 'Larissa Souza', consulta: 'Dra. Pietra' },
  { horario: '14:00', nome: 'Cacau', tutor: 'Matheus Lourenço', consulta: 'Dra. Francyeli' },
  { horario: '17:00', nome: 'Bob', tutor: 'Gabriella Nascimento', consulta: 'Dra. Nicolé' }
])

const botaoClicado = ref([]) // controla a cor de cada botão
</script>

<style scoped>
.home-page {
  display: flex;
  align-items: flex-start;
  padding-top: 80px;
  padding-left: 200px;
  padding-right: 80px;
  flex-wrap: wrap; 
  gap: 40px;
}

.welcome-text {
  max-width: 400px;
}

.welcome-text h1 {
  font-size: 4rem;
  margin: 0;
  font-weight: bold;
  color: black;
}

.welcome-text p {
  font-size: 1.5rem;
  margin-top: 0.5rem;
  color: black;
  font-weight: 600;
}

.action-links {
  list-style: none;
  padding-left: 0;
  margin-top: 1.5rem;
}

.action-links li {
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  transition: background-color 0.2s ease;
  padding: 6px 10px;
  border-radius: 6px;
}

.action-links li:hover {
  background-color: #a7f3d0;
}

.icon-circle {
  width: 32px;
  height: 32px;
  background-color: #14532d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  transition: background-color 0.2s ease;
}

.action-links li:hover .icon-circle {
  background-color: #86efac;
}

.icon-circle .q-icon {
  color: white;
  transition: color 0.2s ease;
}

.action-links li:hover .icon-circle .q-icon {
  color: #14532d;
}

.action-label {
  font-size: 1.3rem;
  color: black;
  user-select: none;
  transition: color 0.2s ease;
}

.action-links li:hover .action-label {
  color: #14532d;
}

/* ======== AGENDA DE HOJE ======== */

.agenda-container {
  background-color: #a0e2a9;
  padding: 24px;
  border-radius: 16px;
  max-width: 500px;
  flex: 1;
  min-width: 320px;
  margin-left: 60px;
}

.agenda-title {
  font-size: 1.8rem;
  color: black;
  margin-bottom: 4px;
  text-align: center;
  font-weight: bold;
}

.agenda-subtitle {
  color: black;
  margin-bottom: 20px;
  font-weight: 500;
  text-align: center;
}

.agenda-card {
  background-color: #82c993;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.agenda-icon {
  margin-right: 12px;
  margin-top: 4px;
  color: #14532d;
}

.agenda-info {
  flex: 1;
}

.agenda-info strong {
  color: #065f46;
  display: block;
  margin-bottom: 4px;
}

.agenda-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #07080a;
}

.agenda-btn {
  margin-left: 12px;
  white-space: nowrap;
}
</style>
