<template>
  <div v-if="usuarioLogueado">
    <!-- Sidebar / Menú Lateral -->
    <div class="sidebar-overlay" :class="{ active: sidebarAbierto }" @click="sidebarAbierto = false"></div>
    <div class="sidebar" :class="{ active: sidebarAbierto }">
      <div class="sidebar-header">
        <h3>{{ viviendaSeleccionadaObj?.nombre || 'Vivienda' }}</h3>
        <button class="btn-close-sidebar" @click="sidebarAbierto = false">&times;</button>
      </div>
      <div class="sidebar-content" v-if="viviendaSeleccionadaObj">
        <div class="sidebar-section">
          <p class="sidebar-label">Plano de la vivienda:</p>
          <img v-if="viviendaSeleccionadaObj.plano" :src="viviendaSeleccionadaObj.plano" alt="Plano" class="sidebar-plano" />
          <p v-else class="sidebar-no-info">No hay plano disponible</p>
        </div>
        <div class="sidebar-section">
          <p class="sidebar-label">Info:</p>
          <p>Propietario: {{ viviendaSeleccionadaObj.idDuenyo === usuarioLogueado.idUsuario ? 'Tú' : (viviendaSeleccionadaObj.ownerName || 'Otro') }}</p>
        </div>
        <button v-if="viviendaSeleccionadaObj.idDuenyo === usuarioLogueado.idUsuario" class="btn-editar-sidebar" @click="abrirEditarVivienda(viviendaSeleccionadaObj); sidebarAbierto = false;">
          Editar Vivienda
        </button>
      </div>
    </div>

    <div id="tools">
      <button class="hamburger-btn" @click="sidebarAbierto = true" aria-label="Menú">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>
      <img src="./assets/logo.png" alt="Logo" width="50px" class="app-logo" />
      
      <template v-if="vistaActiva === 'mecanismos' || vistaActiva === 'presupuestos'">
        <select id="viviendas" name="viviendas" v-model="idViviendaSeleccionada" @change="CambiarViviendaSeleccionada()">
          <option v-if="viviendas.length === 0" :value="null">No hay viviendas</option>
          <option v-else v-for="vivienda in viviendas" :key="vivienda.idVivienda" :value="vivienda.idVivienda">
            {{ vivienda.nombre }}
          </option>
        </select>
        <img src="./assets/editarC.png" alt="Add" width="20px" id="addRoom" @click="popupViviendas = true"/>
      </template>

      <div class="nav-tabs">
        <button class="nav-tab" :class="{ active: vistaActiva === 'mecanismos' }" @click="vistaActiva = 'mecanismos'">
          Mecanismos
        </button>
        <button class="nav-tab" :class="{ active: vistaActiva === 'presupuestos' }" @click="vistaActiva = 'presupuestos'">
          Presupuestos
        </button>
        <button class="nav-tab" :class="{ active: vistaActiva === 'grupos' }" @click="vistaActiva = 'grupos'">
          Grupos
        </button>
      </div>
      
      <div class="app-actions">
        <button class="theme-toggle-btn" @click="toggleTheme" aria-label="Cambiar tema">
          <svg v-if="temaOscuro" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>

        <div class="user-panel">
        <div class="user-dropdown-container" ref="userDropdown">
          <button class="user-avatar-btn" @click="toggleDropdown" aria-label="Usuario">
            <div class="avatar-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="avatar-icon">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </button>
          
          <div v-if="dropdownAbierto" class="dropdown-menu">
            <div class="dropdown-header">
              <p class="dropdown-welcome">Conectado como</p>
              <p class="dropdown-name">{{ usuarioLogueado.fullName }}</p>
            </div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item btn-logout" @click="logout">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="logout-icon">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
    <main class="main-content">
      <PaginaPrincipal v-if="vistaActiva === 'mecanismos'" :idViviendaSeleccionada="idViviendaSeleccionada" :token="token" @confirmar="pedirConfirmacionEvent" @alertar="mostrarAlerta" />
      <PresupuestosView v-else-if="vistaActiva === 'presupuestos'" :idViviendaSeleccionada="idViviendaSeleccionada" :token="token" :viviendas="viviendas" @confirmar="pedirConfirmacionEvent" @alertar="mostrarAlerta" />
      <GruposView v-else-if="vistaActiva === 'grupos'" :token="token" :usuarioLogueado="usuarioLogueado" :viviendas="viviendas" @cargar-viviendas="cargarViviendas" @confirmar="pedirConfirmacionEvent" @alertar="mostrarAlerta" />
    </main>

    <!-- Popup 1: Administrar Viviendas -->
    <div id="blur-viviendas" :class="{ active: popupViviendas }">
      <div id="popup-viviendas">
        <div id="titulo-viviendas">Administrar Viviendas</div>
        <div class="popup-body-viviendas">
          <!-- Lista de viviendas -->
          <div class="viviendas-lista">
            <div v-if="viviendas.length === 0" class="viviendas-vacio">
              <p>Aún no tienes viviendas</p>
              <p class="viviendas-vacio-sub">Pulsa el botón de abajo para crear tu primera casa</p>
            </div>
            <div v-for="v in viviendas" :key="v.idVivienda" class="vivienda-item">
              <div class="vivienda-view-mode">
                <span class="vivienda-nombre">{{ v.nombre }}</span>
                <div class="vivienda-actions">
                  <img v-if="v.idDuenyo === usuarioLogueado.idUsuario" src="./assets/editarM.png" alt="Editar" width="12px" class="vivienda-action-icon" @click="abrirEditarVivienda(v)"/>
                  <img v-if="v.idDuenyo === usuarioLogueado.idUsuario" src="./assets/borrar.png" alt="Borrar" width="12px" class="vivienda-action-icon" @click="pedirConfirmacion('¿Estás seguro de que deseas eliminar esta vivienda? Se eliminarán todos sus mecanismos asociados.', () => eliminarVivienda(v.idVivienda))"/>
                  <span v-if="v.idDuenyo !== usuarioLogueado.idUsuario" class="vivienda-shared-badge">Compartida</span>
                </div>
              </div>
            </div>
          </div>
          <!-- Botón para añadir vivienda -->
          <button class="btn-abrir-crear" @click="abrirCrearVivienda">+ Añadir Nueva Vivienda</button>

          <div class="popup-viviendas-footer">
            <button id="btn-cerrar-viviendas" @click="popupViviendas = false">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Popup 2: Formulario de Vivienda (Crear o Editar con Plano) -->
    <div id="blur-form-vivienda" :class="{ active: popupFormVivienda }">
      <div id="popup-form-vivienda">
        <div id="titulo-form-vivienda">
          {{ editandoViviendaId ? 'Editar Vivienda' : 'Añadir Vivienda' }}
        </div>
        <div class="popup-body-form-vivienda">
          <p class="form-label">Nombre</p>
          <input type="text" placeholder="Ej. Casa de campo" v-model="nuevaViviendaNombre" class="form-input"/>
          
          <p class="form-label">Plano de la casa (Imagen)</p>
          <div class="upload-container">
            <input type="file" ref="planoInput" @change="onPlanoChange" accept="image/*" style="display: none;" />
            <button type="button" class="btn-upload" @click="$refs.planoInput.click()">
              Seleccionar Imagen
            </button>
            
            <div v-if="planoPreview" class="preview-container">
              <img :src="planoPreview" alt="Vista previa" class="image-preview" />
              <button type="button" class="btn-remove-image" @click="removePlano">×</button>
            </div>
            <span v-else class="sin-plano-msg"><br />Ningún plano seleccionado</span>
          </div>

          <p class="form-label">Compartir con Grupo</p>
          <select v-model="nuevaViviendaGrupoId" class="form-input" style="width: 100%; padding: 8px 12px; border-radius: 8px; margin-bottom: 15px; background: #f7fafc; border: 1px solid rgba(0,0,0,0.1);">
            <option :value="null">No compartir (Privado)</option>
            <option v-for="g in gruposPropiosYMiembro" :key="g.idGrupo" :value="g.idGrupo">
              {{ g.nombre }} ({{ g.idOwner === usuarioLogueado.idUsuario ? 'Propietario' : 'Miembro' }})
            </option>
          </select>

          <div class="popup-buttons-form">
            <button class="btn-cancelar-form" @click="cerrarFormVivienda">Cancelar</button>
            <button class="btn-guardar-form" :disabled="!nuevaViviendaNombre.trim()" @click="guardarVivienda">
              {{ editandoViviendaId ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Popup de Confirmación Genérico -->
    <div id="blur-confirm" :class="{ active: popupConfirm }">
      <div id="popup-confirm" style="background-color: var(--popup-bg); border: 1px solid var(--card-border);">
        <div id="titulo-confirm">Confirmar acción</div>
        <div class="popup-body-confirm">
          <p class="confirm-msg" style="color: var(--text-color);">{{ confirmMsg }}</p>
          <div class="popup-buttons-confirm">
            <button class="btn-cancelar-confirm" @click="popupConfirm = false">Cancelar</button>
            <button class="btn-confirmar" @click="ejecutarConfirmacion">Confirmar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Popup de Alerta Genérico -->
    <div id="blur-alert" :class="{ active: popupAlert }">
      <div id="popup-alert" style="background-color: var(--popup-bg); border: 1px solid var(--card-border);">
        <div id="titulo-alert">Aviso</div>
        <div class="popup-body-alert">
          <p class="alert-msg" style="color: var(--text-color);">{{ alertMsg }}</p>
          <div class="popup-buttons-alert">
            <button class="btn-confirmar" style="background-color: rgb(100, 98, 194); width: 100%; border: none; outline: none; border-radius: 8px;" @click="popupAlert = false">Aceptar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <LoginView @login-success="onLoginSuccess" />
  </div>
</template>

<script>
import PaginaPrincipal from './views/PaginaPrincipal.vue'
import LoginView from './views/LoginView.vue'
import GruposView from './views/GruposView.vue'
import PresupuestosView from './views/PresupuestosView.vue'

export default {
  components: {
    PaginaPrincipal,
    LoginView,
    GruposView,
    PresupuestosView
  },
  data() {
    const savedUser = localStorage.getItem("user");
    return {
      token: localStorage.getItem("token") || "",
      sidebarAbierto: false,
      usuarioLogueado: savedUser ? JSON.parse(savedUser) : null,
      viviendas: [],
      popupViviendas: false,
      popupFormVivienda: false,
      popupConfirm: false,
      confirmMsg: "",
      confirmCallback: null,
      popupAlert: false,
      alertMsg: "",
      nuevaViviendaNombre: "",
      nuevaViviendaPlano: "",
      planoPreview: "",
      editandoViviendaId: null,
      idViviendaSeleccionada: Number(localStorage.getItem('idViviendaSeleccionada')) || null,
      dropdownAbierto: false,
      vistaActiva: "mecanismos",
      nuevaViviendaGrupoId: null,
      gruposPropiosYMiembro: [],
      temaOscuro: localStorage.getItem("temaOscuro") === "true"
    };
  },
  computed: {
    viviendaSeleccionadaObj() {
      return this.viviendas.find(v => v.idVivienda === this.idViviendaSeleccionada);
    }
  },
  methods: {
    cargarViviendas() {
      if (!this.token) return;
      this.cargarGruposVivienda();
      fetch(`${window.API_URL}/viviendas`, {
        headers: {
          "Authorization": `Bearer ${this.token}`
        }
      })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          this.logout();
          throw new Error("Sesión expirada");
        }
        return res.json();
      })
      .then(data => {
        this.viviendas = data;
        if (this.viviendas.length > 0) {
          const index = this.viviendas.findIndex(v => v.idVivienda === this.idViviendaSeleccionada);
          if (index === -1) {
            this.idViviendaSeleccionada = this.viviendas[0].idVivienda;
            this.CambiarViviendaSeleccionada();
          }
        } else {
          this.idViviendaSeleccionada = null;
        }
      })
      .catch(err => {
        console.error("Error al cargar viviendas:", err);
      });
    },
    cargarGruposVivienda() {
      if (!this.token) return;
      fetch(`${window.API_URL}/grupos/mis-grupos`, {
        headers: {
          "Authorization": `Bearer ${this.token}`
        }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(data => {
        this.gruposPropiosYMiembro = data;
      })
      .catch(() => {});
    },
    onLoginSuccess(data) {
      this.token = data.token;
      this.usuarioLogueado = data.user;
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      this.cargarViviendas();
    },
    logout() {
      this.token = "";
      this.usuarioLogueado = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.viviendas = [];
      this.idViviendaSeleccionada = null;
    },
    CambiarViviendaSeleccionada() {
      localStorage.setItem('idViviendaSeleccionada', this.idViviendaSeleccionada);
    },
    abrirCrearVivienda() {
      this.editandoViviendaId = null;
      this.nuevaViviendaNombre = "";
      this.nuevaViviendaPlano = "";
      this.planoPreview = "";
      this.nuevaViviendaGrupoId = null;
      this.popupFormVivienda = true;
    },
    abrirEditarVivienda(vivienda) {
      this.editandoViviendaId = vivienda.idVivienda;
      this.nuevaViviendaNombre = vivienda.nombre;
      this.nuevaViviendaPlano = vivienda.plano || "";
      this.planoPreview = vivienda.plano || "";
      this.nuevaViviendaGrupoId = vivienda.idGrupo || null;
      this.popupFormVivienda = true;
    },
    cerrarFormVivienda() {
      this.popupFormVivienda = false;
      this.editandoViviendaId = null;
      this.nuevaViviendaNombre = "";
      this.nuevaViviendaPlano = "";
      this.planoPreview = "";
      this.nuevaViviendaGrupoId = null;
    },
    onPlanoChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        this.nuevaViviendaPlano = event.target.result;
        this.planoPreview = event.target.result;
      };
      reader.readAsDataURL(file);
    },
    removePlano() {
      this.nuevaViviendaPlano = "";
      this.planoPreview = "";
      if (this.$refs.planoInput) {
        this.$refs.planoInput.value = "";
      }
    },
    guardarVivienda() {
      if (!this.nuevaViviendaNombre.trim()) return;
      
      const payload = {
        nombre: this.nuevaViviendaNombre.trim(),
        plano: this.nuevaViviendaPlano || null,
        idGrupo: this.nuevaViviendaGrupoId || null
      };

      const url = this.editandoViviendaId 
        ? `${window.API_URL}/viviendas/${this.editandoViviendaId}`
        : `${window.API_URL}/viviendas`;

      const method = this.editandoViviendaId ? "PATCH" : "POST";

      fetch(url, {
        method: method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`
        },
        body: JSON.stringify(payload)
      })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error en servidor al procesar la vivienda");
        return data;
      })
      .then(data => {
        if (this.editandoViviendaId) {
          const idx = this.viviendas.findIndex(v => v.idVivienda === this.editandoViviendaId);
          if (idx !== -1) {
            this.viviendas[idx].nombre = data.nombre;
            this.viviendas[idx].plano = data.plano;
            this.viviendas[idx].idGrupo = data.idGrupo;
          }
        } else {
          this.viviendas.push(data);
          if (this.viviendas.length === 1) {
            this.idViviendaSeleccionada = data.idVivienda;
            this.CambiarViviendaSeleccionada();
          }
        }
        this.cerrarFormVivienda();
      })
      .catch(err => this.mostrarAlerta("Error al guardar vivienda: " + err.message));
    },
    pedirConfirmacion(msg, callback) {
      this.confirmMsg = msg;
      this.confirmCallback = callback;
      this.popupConfirm = true;
    },
    pedirConfirmacionEvent({ mensaje, callback }) {
      this.pedirConfirmacion(mensaje, callback);
    },
    mostrarAlerta(msg) {
      this.alertMsg = msg;
      this.popupAlert = true;
    },
    ejecutarConfirmacion() {
      this.popupConfirm = false;
      if (this.confirmCallback) {
        this.confirmCallback();
        this.confirmCallback = null;
      }
    },
    eliminarVivienda(id) {
      fetch(`${window.API_URL}/viviendas/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${this.token}`
        }
      })
      .then(res => {
        if (!res.ok) throw new Error("Error en servidor al eliminar la vivienda");
        return res.json();
      })
      .then(() => {
        this.viviendas = this.viviendas.filter(v => v.idVivienda !== id);
        if (this.idViviendaSeleccionada === id) {
          if (this.viviendas.length > 0) {
            this.idViviendaSeleccionada = this.viviendas[0].idVivienda;
          } else {
            this.idViviendaSeleccionada = null;
          }
          this.CambiarViviendaSeleccionada();
        }
      })
      .catch(err => this.mostrarAlerta("Error al eliminar vivienda: " + err.message));
    },
    toggleDropdown(event) {
      event.stopPropagation();
      this.dropdownAbierto = !this.dropdownAbierto;
    },
    closeDropdownOutside(event) {
      const container = this.$refs.userDropdown;
      if (container && !container.contains(event.target)) {
        this.dropdownAbierto = false;
      }
    },
    toggleTheme() {
      this.temaOscuro = !this.temaOscuro;
      localStorage.setItem("temaOscuro", this.temaOscuro);
      this.aplicarTema();
    },
    aplicarTema() {
      if (this.temaOscuro) {
        document.body.classList.add("dark-theme");
      } else {
        document.body.classList.remove("dark-theme");
      }
    }
  },
  mounted() {
    this.aplicarTema();
    if (this.token) {
      this.cargarViviendas();
    }
    document.addEventListener("click", this.closeDropdownOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.closeDropdownOutside);
  }
};
</script>

<style>
p {
  margin: 0;
}
:root {
  --bg-gradient: linear-gradient(158deg, rgba(240, 245, 255, 1) 0%, rgba(203, 202, 221, 1) 100%);
  --text-color: #2c3e50;
  --card-bg: white;
  --card-border: rgba(0, 0, 0, 0.05);
  --card-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  --input-bg: #fcfdfd;
  --input-border: rgba(0, 0, 0, 0.12);
  --footer-bg: rgba(239, 240, 253, 0.8);
  --popup-bg: white;
  --text-secondary: #718096;
  --dropdown-bg: rgba(255, 255, 255, 0.9);
  --dropdown-border: rgba(255, 255, 255, 0.5);
  --dropdown-hover: rgba(0, 0, 0, 0.04);
  --tools-gradient: linear-gradient(158deg, rgba(171, 202, 255, 1) 0%, rgba(100, 98, 194, 1) 100%);
}

body.dark-theme {
  --bg-gradient: linear-gradient(158deg, rgba(30, 32, 45, 1) 0%, rgba(16, 16, 24, 1) 100%);
  --text-color: #e2e8f0;
  --card-bg: #2d3748;
  --card-border: rgba(255, 255, 255, 0.08);
  --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  --input-bg: #1a202c;
  --input-border: #4a5568;
  --footer-bg: rgba(26, 32, 44, 0.85);
  --popup-bg: #2d3748;
  --text-secondary: #a0aec0;
  --dropdown-bg: rgba(45, 55, 72, 0.95);
  --dropdown-border: rgba(255, 255, 255, 0.1);
  --dropdown-hover: rgba(255, 255, 255, 0.08);
  --tools-gradient: linear-gradient(158deg, rgba(48, 55, 99, 1) 0%, rgba(24, 25, 41, 1) 100%);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--text-color);
}
body {
  margin: 0;
  padding: 0;
  background: var(--bg-gradient);
  min-height: 100vh;
}
#tools {
  background: var(--tools-gradient);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.nav-tabs {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.nav-tab {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  color: white;
  padding: 6px 16px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.nav-tab:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.nav-tab.active {
  background: white;
  color: rgb(100, 98, 194);
  border-color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

#viviendas {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 16px;
  width: 200px;
  background: linear-gradient(158deg, rgba(240, 245, 255, 1) 0%, rgba(203, 202, 221, 1) 100%);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.user-panel {
  position: relative;
}

.user-dropdown-container {
  position: relative;
}

.user-avatar-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.user-avatar-btn:hover {
  transform: scale(1.05);
}

.user-avatar-btn:active {
  transform: scale(0.95);
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.user-avatar-btn:hover .avatar-circle {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
}

.avatar-icon {
  width: 20px;
  height: 20px;
  color: white;
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 220px;
  background: var(--dropdown-bg);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid var(--dropdown-border);
  border-radius: 16px;
  box-shadow: var(--card-shadow);
  padding: 8px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  animation: dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: top right;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dropdown-header {
  padding: 12px 16px 8px 16px;
  text-align: left;
}

.dropdown-welcome {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: 4px;
}

.dropdown-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-color);
  word-break: break-all;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--dropdown-border);
  margin: 6px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  border-radius: 10px;
  text-align: left;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
  color: var(--text-color);
}

.dropdown-item:hover {
  background-color: var(--dropdown-hover);
}

.dropdown-item.btn-logout {
  color: #e53e3e;
  border: none;
  background: none;
}

.dropdown-item.btn-logout:hover {
  background-color: rgba(229, 62, 62, 0.08);
  color: #c53030;
  transform: none;
}

.logout-icon {
  width: 16px;
  height: 16px;
}

#addRoom {
  cursor: pointer;
}

.theme-toggle-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  color: white;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.theme-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.theme-icon {
  width: 20px;
  height: 20px;
  color: white;
}

/* POPUP VIVIENDAS */
#blur-viviendas {
  position: fixed;
  background-color: rgba(255, 255, 255, 0.182);
  backdrop-filter: blur(10px);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 100;
  display: none;
}

#blur-viviendas.active {
  display: block;
}

#popup-viviendas {
  position: fixed;
  background-color: var(--popup-bg);
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 20px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);
  width: 380px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
}

#titulo-viviendas {
  background-color: rgb(138, 191, 240);
  padding: 20px;
  color: white;
  font-size: 1.35rem;
  font-weight: 700;
  text-align: center;
}

.popup-body-viviendas {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.viviendas-lista {
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid var(--input-border);
  border-radius: 10px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: var(--input-bg);
}

.vivienda-item {
  padding: 10px 12px;
  border-radius: 8px;
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.vivienda-view-mode {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vivienda-nombre {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.95rem;
}

.vivienda-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.vivienda-shared-badge {
  font-size: 0.7rem;
  font-weight: 600;
  background: #ebf8ff;
  color: #2b6cb0;
  padding: 2px 8px;
  border-radius: 6px;
}

.vivienda-action-icon {
  cursor: pointer;
  opacity: 0.65;
  transition: all 0.2s;
  padding: 4px;
  border-radius: 4px;
}

.vivienda-action-icon:hover {
  opacity: 1;
  background-color: rgba(0,0,0,0.05);
}

.popup-viviendas-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

#btn-cerrar-viviendas {
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

#btn-cerrar-viviendas:hover {
  background-color: #e5e7eb;
}

/* POPUP FORM VIVIENDA */
#blur-form-vivienda {
  position: fixed;
  background-color: rgba(255, 255, 255, 0.182);
  backdrop-filter: blur(10px);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 110;
  display: none;
}

#blur-form-vivienda.active {
  display: block;
}

#popup-form-vivienda {
  position: fixed;
  background-color: var(--popup-bg);
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 20px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);
  width: 380px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
}

#titulo-form-vivienda {
  background-color: rgb(138, 191, 240);
  padding: 20px;
  color: white;
  font-size: 1.35rem;
  font-weight: 700;
  text-align: center;
}

.popup-body-form-vivienda {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.95rem;
  text-align: left;
  margin: 0;
}

.form-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: rgb(138, 191, 240);
  box-shadow: 0 0 0 3px rgba(138, 191, 240, 0.25);
}

.btn-abrir-crear {
  background-color: #dff5e3;
  color: #2d8a4e;
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.15s;
  text-align: center;
  font-size: 0.95rem;
}

.btn-abrir-crear:hover {
  background-color: #c3eacc;
  transform: scale(1.02);
}

.popup-buttons-form {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 15px;
}

.btn-cancelar-form {
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancelar-form:hover {
  background-color: #e5e7eb;
}

.btn-guardar-form {
  background-color: rgb(109, 180, 247);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-guardar-form:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.sin-plano-msg {
  font-size: 0.85rem;
  color: #888;
  font-style: italic;
}

.upload-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
}

.btn-upload {
  background: linear-gradient(135deg, rgb(109, 180, 247), rgb(74, 151, 237));
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(109, 180, 247, 0.3);
  transition: all 0.2s ease;
}

.btn-upload:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(109, 180, 247, 0.45);
}

.preview-container {
  position: relative;
  display: inline-block;
  margin-top: 8px;
  border-radius: 12px;
  overflow: visible;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.image-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}

.btn-remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: #ef4444;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: background-color 0.2s;
  padding: 0;
  line-height: 1;
}

.btn-remove-image:hover {
  background-color: #dc2626;
}

/* EMPTY VIVIENDAS */
.viviendas-vacio {
  text-align: center;
  padding: 20px 12px;
  color: #718096;
}

.viviendas-vacio p:first-child {
  font-size: 2rem;
  margin: 0 0 8px 0;
}

.viviendas-vacio p:nth-child(2) {
  font-weight: 700;
  color: #4a5568;
  font-size: 1rem;
  margin: 0 0 4px 0;
}

.viviendas-vacio-sub {
  font-size: 0.85rem;
  color: #a0aec0;
  margin: 0;
}

/* POPUP CONFIRMACIÓN & ALERTA */
#blur-confirm, #blur-alert {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(6px);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 200;
  display: none;
}

#blur-confirm.active, #blur-alert.active {
  display: block;
}

#popup-confirm, #popup-alert {
  position: fixed;
  background-color: white;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 0, 0, 0.08);
  width: 380px;
  overflow: hidden;
}

#titulo-confirm, #titulo-alert {
  padding: 16px 20px;
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
  text-align: center;
}

#titulo-confirm {
  background-color: #f59e0b;
}

#titulo-alert {
  background-color: rgb(100, 98, 194);
}

.popup-body-confirm, .popup-body-alert {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.confirm-msg, .alert-msg {
  font-size: 0.95rem;
  color: #4a5568;
  line-height: 1.5;
  text-align: center;
  margin: 0;
}

.popup-buttons-confirm, .popup-buttons-alert {
  display: flex;
  gap: 12px;
}

.btn-cancelar-confirm {
  flex: 1;
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancelar-confirm:hover {
  background-color: #e5e7eb;
}

.btn-confirmar {
  flex: 1;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-confirmar:hover {
  background-color: #dc2626;
}

/* ===== MOBILE RESPONSIVE ===== */
@media (max-width: 640px) {
  #tools {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto;
    gap: 10px 8px;
    padding: 10px 14px;
    align-items: center;
  }


  .nav-tab {
    padding: 6px 10px;
    font-size: 0.78rem;
  }

  .theme-toggle-btn {
    width: 36px;
    height: 36px;
    min-width: 36px;
  }

  .user-panel {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
  }

  .app-actions {
    grid-column: 3;
    grid-row: 1;
    display: flex;
    gap: 8px;
    align-items: center;
    justify-self: end;
  }

  .app-logo {
    width: 36px;
    height: auto;
    grid-column: 1;
    grid-row: 1;
    justify-self: start;
  }

  .nav-tabs {
    grid-column: 2;
    grid-row: 1;
    justify-self: stretch;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    width: 100%;
    margin: 0;
  }

  .hamburger-btn {
    grid-column: 1;
    grid-row: 2;
    width: 32px;
    height: 32px;
    padding: 5px;
    justify-self: start;
  }

  #viviendas {
    grid-column: 2;
    grid-row: 2;
    width: 100%;
    min-width: 0;
    font-size: 14px;
    padding: 6px 10px;
  }

  #addRoom {
    grid-column: 3;
    grid-row: 2;
    width: 32px !important;
    height: 32px;
    justify-self: end;
  }

  #popup-viviendas,
  #popup-form-vivienda,
  #popup-confirm,
  #popup-alert {
    width: calc(100% - 32px);
    max-width: 380px;
  }

  .popup-body-viviendas,
  .popup-body-form-vivienda {
    padding: 16px;
  }

  #titulo-viviendas,
  #titulo-form-vivienda,
  #titulo-confirm,
  #titulo-alert {
    padding: 16px;
    font-size: 1.15rem;
  }
}

/* SIDEBAR CSS */
.sidebar-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
}
.sidebar-overlay.active {
  opacity: 1;
  visibility: visible;
}
.sidebar {
  position: fixed;
  top: 0; left: -320px;
  width: 300px;
  max-width: 80%;
  height: 100vh;
  background-color: var(--bg-color);
  z-index: 1001;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  transition: left 0.3s ease;
  display: flex;
  flex-direction: column;
}
.sidebar.active {
  left: 0;
}
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: var(--tools-gradient);
  color: white;
}
.sidebar-header h3 {
  margin: 0;
  font-size: 1.2rem;
}
.btn-close-sidebar {
  background: none; border: none; color: white; font-size: 2rem; cursor: pointer;
  line-height: 1;
}
.sidebar-content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}
.sidebar-section {
  margin-bottom: 20px;
}
.sidebar-label {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 8px;
}
.sidebar-plano {
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--card-border);
}
.sidebar-no-info {
  color: #888;
  font-style: italic;
  font-size: 0.9rem;
}
.btn-editar-sidebar {
  width: 100%;
  padding: 12px;
  background: var(--tools-gradient);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 20px;
}
.hamburger-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
}

</style>
