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
});
const errorMsg = ref('');
const successMsg = ref('');
const isEditing = ref(false);  // Estado para determinar si estamos en modo edición

// API URL
const apiUrl = 'http://127.0.0.1:5000/profile';

// Función para manejar redirección al login si el token ha expirado
const redirectToLogin = () => {
  Swal.fire({
    icon: 'error',
    title: 'Sesión Expirada',
    text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  });
  router.push('/login');
};

// Función para obtener el perfil
const getProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      errorMsg.value = 'No estás autenticado. Por favor inicia sesión.';
      redirectToLogin();
      return;
    }

    console.log('Token:', token);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Respuesta status:', response.status);

    if (response.ok) {
      const data = await response.json();
      profileData.value = {
        username: data.username,
        name: data.name,
        lastname: data.lastname,
        email: data.email,
        phone: data.phone,
      };
    } else if (response.status === 401) {
      redirectToLogin();
    } else if (response.status === 422) {
      const errorData = await response.json();
      errorMsg.value = errorData.msg || 'Error de entidad no procesable (422)';
      console.error('422 Detalles:', errorData);
    } else {
      const errorData = await response.json();
      errorMsg.value = errorData.msg || 'Error al obtener el perfil';
    }
  } catch (error) {
    errorMsg.value = 'Error al obtener el perfil';
    console.error(error);
  }
};


// Función para guardar los cambios en el perfil
const saveProfile = async () => {
  try {
    const response = await fetch('http://127.0.0.1:5000/currentUser', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        name: profileData.value.name,
        lastname: profileData.value.lastname,
        email: profileData.value.email,
        phone: profileData.value.phone
      }),
    });

    if (response.ok) {
      const data = await response.json();
      profileData.value = {
        username: data.username,
        name: data.name,
        lastname: data.lastname,
        email: data.email,
        phone: data.phone,
      };
      isEditing.value = false;
      successMsg.value = 'Perfil actualizado correctamente';

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Perfil actualizado correctamente',
      });

      // Vuelve a cargar los datos actualizados después de guardar
      getProfile(); // Esto actualizará la vista con los datos más recientes

      // Redirigir a la página de citas
      router.push('/citas');

    } else if (response.status === 401) {
      // Token expirado o no válido
      redirectToLogin();
    } else {
      const errorData = await response.json();
      errorMsg.value = errorData.msg || 'Error al guardar los cambios';
    }
  } catch (error) {
    errorMsg.value = 'Error al guardar los cambios';
  }
};

// Activar el modo de edición
const editProfile = () => {
  isEditing.value = true;
};

// Redirigir al inicio
const goHome = () => {
  router.push('/citas');
};

onMounted(() => {
  getProfile();
});
</script>

<template>
  <div class="profile-container">
    <div class="profile-box">
      <h2>Perfil de Usuario</h2>

      <!-- Mensajes de éxito o error -->
      <div v-if="errorMsg" class="alert alert-error">
        <i class="fa-solid fa-triangle-exclamation"></i> {{ errorMsg }}
      </div>
      <div v-if="successMsg" class="alert alert-success">
        <i class="fa-solid fa-check-circle"></i> {{ successMsg }}
      </div>

      <div v-else>
        <!-- Vista de perfil cuando no estamos editando -->
        <div class="profile-info" v-if="!isEditing">
          <div class="profile-item">
            <strong>Usuario:</strong>
            <span>{{ profileData.username }}</span>
          </div>
          <div class="profile-item">
            <strong>Nombre:</strong>
            <span>{{ profileData.name }}</span>
          </div>
          <div class="profile-item">
            <strong>Apellido:</strong>
            <span>{{ profileData.lastname }}</span>
          </div>
          <div class="profile-item">
            <strong>Correo:</strong>
            <span>{{ profileData.email }}</span>
          </div>
          <div class="profile-item">
            <strong>Teléfono:</strong>
            <span>{{ profileData.phone }}</span>
          </div>
        </div>

        <!-- Formulario de edición -->
        <div v-if="isEditing">
          <div class="profile-item">
            <label for="name">Nombre:</label>
            <input v-model="profileData.name" id="name" type="text" placeholder="Nombre" />
          </div>
          <div class="profile-item">
            <label for="lastname">Apellido:</label>
            <input v-model="profileData.lastname" id="lastname" type="text" placeholder="Apellido" />
          </div>
          <div class="profile-item">
            <label for="email">Correo:</label>
            <input v-model="profileData.email" id="email" type="email" placeholder="Correo electrónico" />
          </div>
          <div class="profile-item">
            <label for="phone">Teléfono:</label>
            <input v-model="profileData.phone" id="phone" type="text" placeholder="Teléfono" />
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="buttons">
          <button v-if="!isEditing" @click="editProfile">
            <i class="fa-solid fa-pen-to-square"></i> Editar perfil
          </button>
          <button v-if="isEditing" @click="saveProfile">
            <i class="fa-solid fa-save"></i> Guardar cambios
          </button>
          <button @click="goHome">
            <i class="fa-solid fa-house"></i> Volver al inicio
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
