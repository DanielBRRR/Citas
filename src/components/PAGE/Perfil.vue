<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const router = useRouter();
const profileData = ref({
  username: '',
  name: '',
  lastname: '',
  email: '',
  phone: '',
  date: '',
});
const isEditing = ref(false);

const apiUrl = 'http://127.0.0.1:5000/currentUser';

function redirectToLogin() {
  Swal.fire({
    icon: 'error',
    title: 'Sesión Expirada',
    text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  });
  router.push('/login');
}

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Valida formato DD/MM/YYYY
const isValidDate = (dateStr) => {
  const regex = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/;
  return regex.test(dateStr);
};

// Formatea fecha ISO a DD/MM/YYYY
const formatDateToDDMMYYYY = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (isNaN(date)) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getProfile = async () => {
  const token = localStorage.getItem('token');
  if (!token) return redirectToLogin();

  const res = await fetch(apiUrl, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (res.ok) {
    const data = await res.json();
    profileData.value = {
      ...data,
      date: formatDateToDDMMYYYY(data.date), // formateo aquí
    };
  } else if (res.status === 401) {
    redirectToLogin();
  }
};

onMounted(() => getProfile());

const saveProfile = async () => {
  const token = localStorage.getItem('token');
  if (!token) return redirectToLogin();

  if (!profileData.value.name.trim()) {
    Swal.fire('Error', 'El nombre no puede estar vacío', 'error');
    return;
  }

  if (!validateEmail(profileData.value.email)) {
    Swal.fire('Error', 'El email no es válido', 'error');
    return;
  }

  if (!isValidDate(profileData.value.date)) {
    Swal.fire('Error', 'La fecha debe tener el formato DD/MM/YYYY', 'error');
    return;
  }

  const payload = {
    name: profileData.value.name,
    lastname: profileData.value.lastname,
    email: profileData.value.email,
    phone: profileData.value.phone,
    date: profileData.value.date,
  };

  try {
    const res = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.msg || 'Error al guardar el perfil');
    }

    const updatedData = await res.json();
    profileData.value = {
      ...updatedData,
      date: formatDateToDDMMYYYY(updatedData.date), // formatear después de actualizar
    };

    Swal.fire('Éxito', 'Perfil guardado correctamente', 'success');
    isEditing.value = false;
  } catch (error) {
    Swal.fire('Error', error.message || 'No se pudo guardar el perfil', 'error');
  }
};

const editProfile = () => {
  isEditing.value = true;
};
</script>

<template>
  <div>
    <h2>Perfil de Usuario</h2>

    <div v-if="!isEditing">
      <p><b>Usuario:</b> {{ profileData.username }}</p>
      <p><b>Nombre:</b> {{ profileData.name }}</p>
      <p><b>Apellido:</b> {{ profileData.lastname }}</p>
      <p><b>Email:</b> {{ profileData.email }}</p>
      <p><b>Teléfono:</b> {{ profileData.phone }}</p>
      <p><b>Fecha:</b> {{ profileData.date }}</p>
    </div>

    <div v-else>
      <input v-model="profileData.name" placeholder="Nombre" />
      <input v-model="profileData.lastname" placeholder="Apellido" />
      <input v-model="profileData.email" placeholder="Email" />
      <input v-model="profileData.phone" placeholder="Teléfono" />
      <input v-model="profileData.date" placeholder="Fecha (DD/MM/YYYY)" />
    </div>

    <button v-if="!isEditing" @click="editProfile">Editar perfil</button>
    <button v-else @click="saveProfile">Guardar cambios</button>
  </div>
</template>
