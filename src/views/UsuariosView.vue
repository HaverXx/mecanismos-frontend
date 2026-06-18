<template>
  <div class="usuarios-container">
    <div class="header-section">
      <h2>Listado de Usuarios</h2>
      <p class="subtitle">Busca y filtra a los usuarios registrados en el sistema</p>
    </div>

    <!-- Buscador -->
    <div class="search-box">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input type="text" v-model="filtro" placeholder="Buscar por nombre, email o empresa..." class="search-input" />
    </div>

    <!-- Lista de Usuarios -->
    <div v-if="loading" class="state-message">
      <div class="spinner"></div>
      <p>Cargando usuarios...</p>
    </div>

    <div v-else-if="error" class="state-message error">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="usuariosFiltrados.length === 0" class="state-message empty">
      <p>No se encontraron resultados</p>
      <p>No se encontraron usuarios que coincidan con la búsqueda.</p>
    </div>

    <div v-else class="usuarios-grid">
      <div v-for="user in usuariosFiltrados" :key="user.idUsuario" class="user-card">
        <div class="user-avatar">
          {{ obtenerIniciales(user.fullName) }}
        </div>
        <div class="user-info">
          <h3 class="user-fullname">{{ user.fullName }}</h3>
          <p class="user-email">{{ user.email }}</p>
          <span v-if="user.empresa" class="user-badge">{{ user.empresa }}</span>
          <span v-else class="user-badge none">Sin empresa</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    token: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      usuarios: [],
      filtro: "",
      loading: true,
      error: ""
    };
  },
  computed: {
    usuariosFiltrados() {
      const q = this.filtro.toLowerCase().trim();
      if (!q) return this.usuarios;
      return this.usuarios.filter(u => 
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.empresa && u.empresa.toLowerCase().includes(q))
      );
    }
  },
  methods: {
    cargarUsuarios() {
      this.loading = true;
      this.error = "";
      fetch("http://localhost:3000/usuarios", {
        headers: {
          "Authorization": `Bearer ${this.token}`
        }
      })
      .then(res => {
        if (!res.ok) throw new Error("Error al obtener los usuarios del servidor");
        return res.json();
      })
      .then(data => {
        this.usuarios = data;
        this.loading = false;
      })
      .catch(err => {
        this.error = err.message;
        this.loading = false;
      });
    },
    obtenerIniciales(name) {
      if (!name) return "U";
      const parts = name.trim().split(" ");
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
  },
  mounted() {
    this.cargarUsuarios();
  }
};
</script>

<style scoped>
.usuarios-container {
  max-width: 1000px;
  margin: 30px auto;
  padding: 0 20px;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.header-section {
  text-align: left;
  margin-bottom: 25px;
}

.header-section h2 {
  font-size: 1.8rem;
  color: #1a202c;
  margin: 0 0 6px 0;
  font-weight: 700;
}

.subtitle {
  color: #718096;
  font-size: 0.95rem;
  margin: 0;
}

/* Buscador */
.search-box {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 10px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  margin-bottom: 30px;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: rgb(109, 180, 247);
  box-shadow: 0 4px 20px rgba(109, 180, 247, 0.15);
}

.search-icon {
  color: #a0aec0;
  margin-right: 12px;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 1rem;
  width: 100%;
  color: #2c3e50;
}

/* Grid de Usuarios */
.usuarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 50px;
}

.user-card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.07);
  border-color: rgba(109, 180, 247, 0.3);
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(171, 202, 255, 0.6) 0%, rgba(100, 98, 194, 0.6) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 4px 10px rgba(100, 98, 194, 0.2);
}

.user-info {
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  overflow: hidden;
}

.user-fullname {
  font-size: 1.05rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100%;
}

.user-email {
  font-size: 0.85rem;
  color: #718096;
  margin: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100%;
}

.user-badge {
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #ebf8ff;
  color: #2b6cb0;
  padding: 2px 8px;
  border-radius: 6px;
  margin-top: 4px;
}

.user-badge.none {
  background-color: #f7fafc;
  color: #a0aec0;
}

/* Mensajes de Estado */
.state-message {
  padding: 50px 20px;
  text-align: center;
  color: #718096;
  font-size: 1.05rem;
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.04);
}

.state-message.empty p:first-child {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
}

.state-message.error {
  color: #e53e3e;
}

/* Spinner */
.spinner {
  border: 3px solid rgba(0, 0, 0, 0.05);
  border-top: 3px solid rgb(109, 180, 247);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 15px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .usuarios-grid {
    grid-template-columns: 1fr;
  }
}
</style>
