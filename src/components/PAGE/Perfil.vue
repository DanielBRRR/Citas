<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const router = useRouter();
const userProfileData = ref({
  username: '',
  name: '',
  lastname: '',
  email: '',
  phone: '',
  date: '',
});
const userIsEditing = ref(false);

const userApiUrl = 'http://127.0.0.1:5000/currentUser';

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

const isValidDate = (dateStr) => {
  const regex = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/;
  return regex.test(dateStr);
};

const formatDateToDDMMYYYY = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (isNaN(date)) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getUserProfile = async () => {
  const token = localStorage.getItem('token');
  if (!token) return redirectToLogin();

  const res = await fetch(userApiUrl, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (res.ok) {
    const data = await res.json();
    userProfileData.value = {
      ...data,
      date: formatDateToDDMMYYYY(data.date),
    };
  } else if (res.status === 401) {
    redirectToLogin();
  }
};

onMounted(() => getUserProfile());

const saveUserProfile = async () => {
  const token = localStorage.getItem('token');
  if (!token) return redirectToLogin();

  if (!userProfileData.value.name.trim()) {
    Swal.fire('Error', 'El nombre no puede estar vacío', 'error');
    return;
  }

  if (!validateEmail(userProfileData.value.email)) {
    Swal.fire('Error', 'El email no es válido', 'error');
    return;
  }

  if (!isValidDate(userProfileData.value.date)) {
    Swal.fire('Error', 'La fecha debe tener el formato DD/MM/YYYY', 'error');
    return;
  }

  const payload = {
    name: userProfileData.value.name,
    lastname: userProfileData.value.lastname,
    email: userProfileData.value.email,
    phone: userProfileData.value.phone,
    date: userProfileData.value.date,
  };

  try {
    const res = await fetch(userApiUrl, {
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
    userProfileData.value = {
      ...updatedData,
      date: formatDateToDDMMYYYY(updatedData.date),
    };

    Swal.fire('Éxito', 'Perfil guardado correctamente', 'success');
    userIsEditing.value = false;
  } catch (error) {
    Swal.fire('Error', error.message || 'No se pudo guardar el perfil', 'error');
  }
};

const editUserProfile = () => {
  userIsEditing.value = true;
};

const goBackToCitas = () => {
  router.push('/citas');
};
</script>

<template>
  <div class="perfil-container">
    <h2 class="perfil-title">Perfil de Usuario</h2>

    <div v-if="!userIsEditing" class="perfil-display">
      <p class="perfil-item"><b>Usuario:</b> {{ userProfileData.username }}</p>
      <p class="perfil-item"><b>Nombre:</b> {{ userProfileData.name }}</p>
      <p class="perfil-item"><b>Apellido:</b> {{ userProfileData.lastname }}</p>
      <p class="perfil-item"><b>Email:</b> {{ userProfileData.email }}</p>
      <p class="perfil-item"><b>Teléfono:</b> {{ userProfileData.phone }}</p>
      <p class="perfil-item"><b>Fecha:</b> {{ userProfileData.date }}</p>
    </div>

    <div v-else class="perfil-edit">
      <input v-model="userProfileData.name" class="perfil-input" placeholder="Nombre" />
      <input v-model="userProfileData.lastname" class="perfil-input" placeholder="Apellido" />
      <input v-model="userProfileData.email" class="perfil-input" placeholder="Email" />
      <input v-model="userProfileData.phone" class="perfil-input" placeholder="Teléfono" />
      <input v-model="userProfileData.date" class="perfil-input" placeholder="Fecha (DD/MM/YYYY)" />
    </div>

    <button
      v-if="!userIsEditing"
      @click="editUserProfile"
      class="perfil-button perfil-button-edit"
    >
      Editar perfil
    </button>
    <button
      v-else
      @click="saveUserProfile"
      class="perfil-button perfil-button-save"
    >
      Guardar cambios
    </button>

    <button
      @click="goBackToCitas"
      class="perfil-button perfil-button-back"
      type="button"
    >
      Volver a citas
    </button>
  </div>
</template>