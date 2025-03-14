<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const router = useRouter();
const center = ref('');
const date = ref('');
const errorMsg = ref('');
const successMsg = ref('');

// Lista de centros disponibles
const centers = [
  { name: 'Centro de Salud Madrid Norte', address: 'Calle de la Salud, 123, Madrid' },
  { name: 'Centro Médico Madrid Sur', address: 'Avenida de la Medicina, 456, Madrid' }
];

// Función para convertir la fecha al formato esperado por el servidor
const formatDate = (date) => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  
  // Retorna la fecha con el formato correcto: dd/mm/yyyy hh:00:00
  return `${day}/${month}/${year} ${hours}:00:00`;
};

// Función para redirigir al login si el token ha expirado
const redirectToLogin = () => {
  Swal.fire({
    icon: 'error',
    title: 'Sesión Expirada',
    text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  });
  router.push('/login');
};

// Función para crear una nueva cita
const createCita = async () => {
  try {
    const token = localStorage.getItem('token');  // Obtener el token del localStorage

    if (!token) {
      throw new Error('No estás autenticado. Por favor, inicia sesión primero.');
    }

    // Convertir la fecha en el formato correcto
    const formattedDate = formatDate(date.value);

    const response = await fetch('http://localhost:5000/date/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,  // Enviar el token en el encabezado Authorization
      },
      body: JSON.stringify({
        center: center.value,
        date: formattedDate,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado o no válido
        redirectToLogin();
        return;
      }
      const errorData = await response.json();  // Obtener los detalles del error
      throw new Error(errorData.msg || 'Error al crear la cita');
    }

    const data = await response.json();
    successMsg.value = data.msg;
    errorMsg.value = '';

    setTimeout(() => router.push('/citas'), 2000); // Redirigir a la página de citas después de 2 segundos
  } catch (error) {
    errorMsg.value = error.message || 'Hubo un error';
    successMsg.value = '';
  }
};

// Función para volver al inicio
const goToHome = () => {
  router.push('/citas'); // Redirigir a la página principal
};
</script>

<template>
  <div class="create-cita-container">
    <h2>Crear Cita</h2>
    <div>
      <select v-model="center">
        <option value="" disabled>Seleccione un centro de salud</option>
        <option v-for="c in centers" :key="c.name" :value="c.name">{{ c.name }}</option>
      </select>
      <input v-model="date" type="datetime-local" placeholder="Fecha y Hora" />
      <button @click="createCita">Crear Cita</button>
    </div>
    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    <p v-if="successMsg" class="success">{{ successMsg }}</p>
    <button class="back-home-btn" @click="goToHome">Volver a inicio</button>
  </div>
</template>
