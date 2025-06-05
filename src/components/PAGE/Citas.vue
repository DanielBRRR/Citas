
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
import { jwtDecode } from 'jwt-decode';


const router = useRouter();
const citas = ref([]);
const errorMsg = ref('');
const successMsg = ref('');
const loading = ref(false);
const role = ref('');

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  events: [],
  height: 500,
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

    const decoded = jwtDecode(token);
    role.value = decoded.role || '';

    // Elegimos el endpoint según el rol
    const endpoint = role.value === 'admin' 
      ? 'http://127.0.0.1:5000/dates'          // para admin: todas las citas
      : 'http://127.0.0.1:5000/date/getByUser'; // para usuario: solo sus citas

    const response = await fetch(endpoint, {
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

    // Ajustamos la fecha para que termine en "00:00" como espera el backend
    // Si ya tienes la fecha en 'dd/mm/yyyy HH:mm:ss' pero el backend espera 'HH:00:00'
    // Podemos convertir el tiempo a la hora exacta y minutos y segundos a 00
    // Asumiendo que cita.date ya viene en 'dd/mm/yyyy HH:mm:ss' o similar
    let [datePart, timePart] = cita.date.split(' ');
    let hour = timePart.split(':')[0];
    let formattedDate = `${datePart} ${hour}:00:00`;

    const response = await fetch('http://127.0.0.1:5000/date/cancel', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ center: cita.center, date: formattedDate }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        redirectToLogin();
        return;
      }
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Error al cancelar la cita');
    }

    const result = await response.json();
    successMsg.value = result.msg || 'Cita actualizada con éxito';
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
const verUsuarios =() =>router.push('/listado');

onMounted(fetchCitas);
</script>
<template>
<div class="header flex flex-wrap items-center justify-center gap-4 mb-8">
  <button @click="verPerfil" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800">Ver mi Perfil</button>
  <button v-if="role === 'admin'" @click="verUsuarios" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800">Ver usuarios</button>
  <button @click="router.push('/crearcitas')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800">Crear Cita</button>
  <button @click="cerrarSesion" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800">Cerrar Sesión</button>
</div>

  <div class="citas-container">



    <p v-if="loading" class="loading-message">Cargando citas...</p>
    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

    <div class="calendar-container text-center py-5">
      <FullCalendar :options="calendarOptions" />
    </div>

    <div v-if="!errorMsg && citas.length > 0">
      <Splide :options="splideOptions" aria-label="Mis citas">
        <SplideSlide v-for="(cita, index) in citas" :key="cita.id">
          <div class="cita-item">
            <p><strong>Centro:</strong> {{ cita.center }}</p>
            <p><strong>Fecha:</strong> {{ cita.date }}</p>
            <button
              v-if="role === 'admin'"
              @click="cancelarCita(cita)"
              class="cancel-button"
            >
              Cancelar Cita
            </button>
          </div>
        </SplideSlide>
      </Splide>
    </div>

    <p v-if="!errorMsg && citas.length === 0">No tienes citas.</p>
    <p v-if="successMsg" class="success">{{ successMsg }}</p>
  </div>
</template>
