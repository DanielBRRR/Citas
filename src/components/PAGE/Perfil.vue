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
  role: 'user',
  date: '',  // agregado por si quieres usarlo
});
const isEditing = ref(false);
const loggedUserRole = localStorage.getItem('role')?.toLowerCase() || 'user';

const apiUrl = 'http://127.0.0.1:5000/currentUser';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

const redirectToLogin = () => {
  Swal.fire({
    icon: 'error',
    title: 'Sesión Expirada',
    text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  });
  router.push('/login');
};

const validateEmail = (email) => {
  // Validación simple de email
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getProfile = async () => {
  const token = localStorage.getItem('token');
  if (!token) return redirectToLogin();

  const res = await fetch(apiUrl, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (res.ok) {
    const data = await res.json();
    profileData.value = { ...data, role: (data.role || 'user').toLowerCase() };
  } else if (res.status === 401) redirectToLogin();
};

onMounted(() => getProfile());

// Función mini login admin con Swal para confirmar cambio de rol
async function adminLoginCheck() {
  const { value: formValues } = await Swal.fire({
    title: 'Confirmar admin para cambiar rol',
    html:
      '<input id="swal-username" class="swal2-input" placeholder="Usuario">' +
      '<input id="swal-password" type="password" class="swal2-input" placeholder="Contraseña">',
    focusConfirm: false,
    preConfirm: () => {
      return {
        username: document.getElementById('swal-username').value,
        password: document.getElementById('swal-password').value,
      };
    },
  });

  if (!formValues) return false;

  try {
    const res = await fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formValues),
    });

    if (!res.ok) {
      Swal.showValidationMessage('Usuario o contraseña incorrectos');
      return false;
    }

    const data = await res.json();
    const decoded = parseJwt(data.access_token);

    if (!decoded || decoded.role.toLowerCase() !== 'admin') {
      Swal.showValidationMessage('Debe ser administrador para continuar');
      return false;
    }

    // Guardamos token y rol admin temporal
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('role', 'admin');

    return true;

  } catch {
    Swal.showValidationMessage('Error en la conexión');
    return false;
  }
}

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

  // Si el rol ha cambiado y usuario actual NO es admin, pedimos login admin para confirmar
  if (profileData.value.role !== loggedUserRole && loggedUserRole !== 'admin') {
    const confirmed = await adminLoginCheck();
    if (!confirmed) return;
  }

  // Construir payload con solo campos permitidos
  const payload = {
    name: profileData.value.name,
    lastname: profileData.value.lastname,
    email: profileData.value.email,
    phone: profileData.value.phone,
    date: profileData.value.date, // si usas fecha, sino lo puedes quitar
    role: profileData.value.role,
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

    if (res.status === 403) {
      Swal.fire('Error', 'No tienes permisos para cambiar el rol', 'error');
      return;
    }

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.msg || 'Error al guardar el perfil');
    }

    const updatedData = await res.json();
    profileData.value = { ...updatedData, role: (updatedData.role || 'user').toLowerCase() };

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
      <p><b>Rol:</b> {{ profileData.role }}</p>
    </div>

    <div v-else>
      <input v-model="profileData.name" placeholder="Nombre" />
      <input v-model="profileData.lastname" placeholder="Apellido" />
      <input v-model="profileData.email" placeholder="Email" />
      <input v-model="profileData.phone" placeholder="Teléfono" />
      <input v-model="profileData.date" placeholder="Fecha (DD/MM/YYYY)" />
      <select v-model="profileData.role">
        <option value="user">Usuario</option>
        <option value="admin">Administrador</option>
      </select>
    </div>

    <button v-if="!isEditing" @click="editProfile">Editar perfil</button>
    <button v-else @click="saveProfile">Guardar cambios</button>
  </div>
</template>
