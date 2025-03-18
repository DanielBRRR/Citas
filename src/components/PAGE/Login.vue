<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const router = useRouter();
const username = ref('');
const password = ref('');

const login = async () => {
  try {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value }),
    });

    if (!response.ok) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    const data = await response.json();
    localStorage.setItem('token', data.access_token);
    
    // Marcar que el usuario acaba de iniciar sesión
    localStorage.setItem('justLoggedIn', 'true');

    // Alerta de éxito
    Swal.fire({
      title: '¡Bienvenido!',
      text: 'Inicio de sesión exitoso',
      icon: 'success',
      confirmButtonColor: '#037BC0',
    });

    router.push('/citas');
  } catch (error) {
    // Alerta de error
    Swal.fire({
      title: 'Error',
      text: error.message || 'Hubo un problema al iniciar sesión',
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
