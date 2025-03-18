<template>
  <div class="citas-container">
    <div class="header">
      <button @click="verPerfil" class="profile-button">Ver mi Perfil</button>
      <button @click="cerrarSesion" class="logout-button">Cerrar Sesión</button>
    </div>

    <p v-if="loading" class="loading-message">Cargando citas...</p>
    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

    <div class="calendar-container text-center py-5">
      <!-- Aquí va el calendario -->
      <FullCalendar :options="calendarOptions" />
    </div>

    <div v-if="!errorMsg && citas.length > 0">
      <Splide :options="splideOptions" aria-label="Mis citas">
        <SplideSlide v-for="(cita, index) in citas" :key="cita.id">
          <div class="cita-item">
            <p><strong>Centro:</strong> {{ cita.center }}</p>
            <p><strong>Fecha:</strong> {{ cita.date }}</p>
            <button @click="cancelarCita(cita)" class="cancel-button">Cancelar Cita</button>
          </div>
        </SplideSlide>
      </Splide>
    </div>

    <p v-if="!errorMsg && citas.length === 0">No tienes citas.</p>
    <p v-if="successMsg" class="success">{{ successMsg }}</p>

    <button @click="router.push('/crearcitas')" class="create-button">Crear Cita</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import '@splidejs/splide/dist/css/splide.min.css';

const router = useRouter();
const citas = ref([]);
const errorMsg = ref('');
const successMsg = ref('');
const loading = ref(false);

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  events: [],
  height: 1000,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek',
  },
  eventColor: '#87CEEB',
  eventBorderColor: '#4682B4',
});

const splideOptions = {
  type: 'slide',
  perPage: 2,
  perMove: 2,
  pagination: false,
  arrows: true,
  gap: '150px',
  width: '100%',
  autoplay: false,
};

const fetchCitas = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No estás autenticado. Por favor, inicia sesión primero.');
    }

    const response = await fetch('http://127.0.0.1:5000/date/getByUser', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) {
        redirectToLogin();
        return;
      }
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Error al cargar las citas');
    }

    const data = await response.json();
    citas.value = data;
    actualizarCalendario();
  } catch (error) {
    errorMsg.value = error.message;
    Swal.fire({ icon: 'error', title: 'Error', text: error.message });
  } finally {
    loading.value = false;
  }
};

const actualizarCalendario = () => {
  calendarOptions.value.events = citas.value.map(cita => ({
    title: cita.center,
    start: new Date(cita.date.split(' ')[0].split('/').reverse().join('-') + 'T' + cita.date.split(' ')[1]),
    extendedProps: cita,
  }));
};

const cancelarCita = async (cita) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No estás autenticado.');

    const response = await fetch('http://127.0.0.1:5000/date/delete', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ center: cita.center, date: cita.date }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        redirectToLogin();
        return;
      }
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Error al cancelar la cita');
    }

    successMsg.value = 'Cita cancelada con éxito';
    fetchCitas();
  } catch (error) {
    errorMsg.value = error.message;
    Swal.fire({ icon: 'error', title: 'Error', text: error.message });
  }
};

const redirectToLogin = () => {
  Swal.fire({ icon: 'error', title: 'Sesión Expirada', text: 'Tu sesión ha expirado.' });
  router.push('/login');
};

const cerrarSesion = () => {
  localStorage.removeItem('token');
  router.push('/');
};

const verPerfil = () => router.push('/verperfil');

onMounted(fetchCitas);
</script>
