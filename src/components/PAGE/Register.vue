<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const router = useRouter();

const username = ref('');
const password = ref('');
const name = ref('');
const lastname = ref('');
const email = ref('');
const phone = ref('');
const date = ref('');

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

const goToLogin = () => {
  router.push('/login');
};
</script>

<template>
  <div class="register-container">
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
      <button @click="register">Registrarse</button>
      <p class="login-link">¿Ya tienes cuenta? <a href="#" @click="goToLogin">Inicia sesión</a></p>
    </div>
  </div>
</template>

