<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';

const users = ref([]);
const token = localStorage.getItem('token');
const currentRole = localStorage.getItem('role')?.toLowerCase();

const apiUrl = 'http://127.0.0.1:5000';

const getUsers = async () => {
  try {
    const res = await fetch(`${apiUrl}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Error al cargar usuarios');
    users.value = await res.json();
  } catch (err) {
    Swal.fire('Error', err.message, 'error');
  }
};

const changeRole = async (username, newRole) => {
  const confirm = await Swal.fire({
    title: `¿Cambiar rol de ${username}?`,
    text: `¿Estás seguro de cambiar el rol a "${newRole}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cambiar',
    cancelButtonText: 'Cancelar'
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch(`${apiUrl}/users/${username}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role: newRole })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.msg || 'No se pudo cambiar el rol');
    }

    await getUsers();
    Swal.fire('Éxito', `Rol actualizado a ${newRole}`, 'success');
  } catch (err) {
    Swal.fire('Error', err.message, 'error');
  }
};

onMounted(() => {
  if (currentRole === 'admin') getUsers();
});
</script>

<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4 text-center">Gestión de Usuarios</h2>

    <div v-if="currentRole !== 'admin'" class="text-red-500 text-center">
      No tienes permisos para ver esta sección.
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full table-auto border border-gray-300 shadow rounded-lg">
        <thead class="bg-blue-100">
          <tr>
            <th class="p-3 text-left">Usuario</th>
            <th class="p-3 text-left">Rol</th>
            <th class="p-3 text-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.username" class="border-t">
            <td class="p-3">{{ user.username }}</td>
            <td class="p-3 capitalize">{{ user.role }}</td>
            <td class="p-3 text-center">
              <select
                v-model="user.role"
                @change="changeRole(user.username, user.role)"
                class="border px-2 py-1 rounded-md"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>


