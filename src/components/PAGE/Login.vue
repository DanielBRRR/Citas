<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const router = useRouter();
const username = ref('');
const password = ref('');

// Función para decodificar el token JWT y extraer el payload
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

const login = async () => {
  try {
    const response = await fetch('http://127.0.0.1:5000/login', {  // Cambiado a 127.0.0.1
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Usuario o contraseña incorrectos');
    }

    const data = await response.json();
    console.log('Token recibido:', data.access_token);

    localStorage.setItem('token', data.access_token);

    const decoded = parseJwt(data.access_token);
    console.log('JWT decodificado:', decoded);

    if (decoded && decoded.role) {
      localStorage.setItem('role', decoded.role);
    } else {
      localStorage.setItem('role', 'user');
    }

    localStorage.setItem('justLoggedIn', 'true');

    Swal.fire({
      title: '¡Bienvenido!',
      text: 'Inicio de sesión exitoso',
      icon: 'success',
      confirmButtonColor: '#037BC0',
    });

    router.push('/citas');
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error.message,
      icon: 'error',
      confirmButtonColor: '#d33',
    });
  }
};


const goToRegister = () => {
  router.push('/');
};
</script>

<template>
  <div class="container">
    <div class="login-box">
      <h2>Iniciar Sesión</h2>
      <div class="input-group">
        <input v-model="username" placeholder="Usuario" />
        <input v-model="password" type="password" placeholder="Contraseña" />
      </div>
      <button class="button" @click="login">Entrar</button>
      <p class="register-link">
        ¿No tienes cuenta? <span @click="goToRegister">Regístrate aquí</span>
      </p>
    </div>
  </div>
</template>
