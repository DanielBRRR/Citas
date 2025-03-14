<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import '@splidejs/splide/dist/css/splide.min.css'; // Importar estilos de Splide

const router = useRouter();
const citas = ref([]);
const errorMsg = ref('');
const successMsg = ref('');
const loading = ref(false);

// Función para redirigir al login si el token ha expirado
const redirectToLogin = () => {
  Swal.fire({
    icon: 'error',
    title: 'Sesión Expirada',
    text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  });
  router.push('/login');
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
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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

    // Verificar si el usuario acaba de iniciar sesión y evitar alerta innecesaria
    if (localStorage.getItem('justLoggedIn')) {
      localStorage.removeItem('justLoggedIn'); // Eliminar flag para futuras cargas
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Citas cargadas',
        text: 'Las citas se han cargado correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });
    }

  } catch (error) {
    errorMsg.value = error.message || 'Hubo un error al obtener las citas';
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'Hubo un error al obtener las citas',
    });
  } finally {
    loading.value = false;
  }
};

const cancelarCita = async (cita) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No estás autenticado. Por favor, inicia sesión primero.');
    }

    const response = await fetch('http://127.0.0.1:5000/date/delete', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        center: cita.center,
        date: cita.date,
      }),
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

    Swal.fire({
      icon: 'success',
      title: 'Cita cancelada',
      text: 'La cita ha sido cancelada correctamente.',
      timer: 2000,
      showConfirmButton: false,
    });

  } catch (error) {
    errorMsg.value = error.message || 'Hubo un error al cancelar la cita';
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'Hubo un error al cancelar la cita',
    });
  }
};

const cerrarSesion = () => {
  localStorage.removeItem('token');
  router.push('/');
};

const verPerfil = () => {
  router.push('/verperfil');
};

// Cargar citas al montar el componente
onMounted(fetchCitas);
</script>

<template>
  <div class="citas-container">
    <div class="header">
      <button @click="verPerfil" class="profile-button">Ver mi Perfil</button>
      <button @click="cerrarSesion" class="logout-button">Cerrar Sesión</button>
    </div>

    <p v-if="loading" class="loading-message">Cargando citas...</p>
    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

    <div v-if="!errorMsg && citas.length > 0">
      <Splide :options="{ 
        type: 'slide', 
        perPage: 2, 
        perMove: 2, 
        pagination: false, 
        arrows: true,
        gap: '15px',
        width: '100%',
        autoplay: false 
      }" aria-label="Mis citas">
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
