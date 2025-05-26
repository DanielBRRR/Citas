<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const router = useRouter();

// Variables para registro
const username = ref('');
const password = ref('');
const name = ref('');
const lastname = ref('');
const email = ref('');
const phone = ref('');
const date = ref('');
const role = ref('user'); // Valor por defecto

// Variables para login (puedes usar las mismas username y password)
const loginUsername = ref('');
const loginPassword = ref('');

// Función registro
const register = async () => {
  try {
    const formattedDate = new Date(date.value).toLocaleDateString('en-GB');

    const response = await fetch('http://127.0.0.1:5000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        lastname: lastname.value,
        email: email.value,
        phone: phone.value,
        username: username.value,
        password: password.value,
        date: formattedDate,
        role: role.value,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: data.msg,
        timer: 2000,
        showConfirmButton: false,
      });
      setTimeout(() => router.push('/login'), 2000);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error en el registro',
        text: data.msg || 'Ocurrió un problema',
      });
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo completar el registro',
    });
  }
};

// Función login
const login = async () => {
  try {
    const response = await fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: loginUsername.value,
        password: loginPassword.value,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Guardar token JWT en localStorage
      localStorage.setItem('token', data.access_token);

      Swal.fire({
        icon: 'success',
        title: 'Login exitoso',
        timer: 1500,
        showConfirmButton: false,
      });

      router.push('/dashboard'); // Cambia a la ruta que quieras para usuarios logueados
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.msg || 'Credenciales incorrectas',
      });
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo completar el login',
    });
  }
};

const goToLogin = () => {
  router.push('/login');
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<template>
  <div>
    <!-- Registro -->
    <div class="register-container" style="margin-bottom: 50px;">
      <div class="register-box">
        <h2>Registro</h2>
        <div class="input-group">
          <input v-model="username" placeholder="Usuario" />
          <input v-model="password" type="password" placeholder="Contraseña" />
          <input v-model="name" placeholder="Nombre" />
          <input v-model="lastname" placeholder="Apellido" />
          <input v-model="email" type="email" placeholder="Correo" />
          <input v-model="phone" placeholder="Teléfono" />
          <input v-model="date" type="date" placeholder="Fecha de nacimiento" />
        </div>

        <div class="role-selector">
          <label>Rol:</label>
          <button
            :class="{ 'selected-role': role === 'user' }"
            @click="role = 'user'"
          >
            Usuario
          </button>
          <button
            :class="{ 'selected-role': role === 'admin' }"
            @click="role = 'admin'"
          >
            Administrador
          </button>
        </div>

        <button @click="register">Registrarse</button>
        <p class="login-link">
          ¿Ya tienes cuenta? <a href="#" @click.prevent="goToLogin">Inicia sesión</a>
        </p>
      </div>
    </div>

    <!-- Login -->
    <div class="login-container">
      <div class="login-box">
        <h2>Iniciar sesión</h2>
        <input v-model="loginUsername" placeholder="Usuario" />
        <input v-model="loginPassword" type="password" placeholder="Contraseña" />
        <button @click="login">Entrar</button>
        <p class="register-link">
          ¿No tienes cuenta? <a href="#" @click.prevent="goToRegister">Regístrate</a>
        </p>
      </div>
    </div>
  </div>
</template>