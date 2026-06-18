<template>
  <div class="grupos-container">
    <div class="header-section">
      <h2>Grupos y Compartición</h2>
      <p class="subtitle">Crea grupos de colaboración e invita a otros usuarios para compartir tus viviendas</p>
    </div>

    <!-- Panel superior: Invitaciones pendientes y Crear grupo -->
    <div class="top-row">
      <!-- Panel de Invitaciones Recibidas -->
      <div class="card glass-card invitaciones-card">
        <h3>Invitaciones Recibidas</h3>
        <div v-if="invitaciones.length === 0" class="empty-state">
          <span class="empty-icon">✉️</span>
          <p>No tienes invitaciones pendientes</p>
        </div>
        <div v-else class="invitaciones-list">
          <div v-for="inv in invitaciones" :key="inv.idInvitacion" class="invitacion-item">
            <div class="inv-info">
              <span class="inv-group">{{ inv.nombreGrupo }}</span>
              <span class="inv-sender">Invitado por: <strong>{{ inv.nombreRemitente }}</strong></span>
            </div>
            <div class="inv-actions">
              <button class="btn btn-success btn-sm" @click="responderInvitacion(inv.idInvitacion, 'aceptar')">Aceptar</button>
              <button class="btn btn-danger btn-sm" @click="responderInvitacion(inv.idInvitacion, 'rechazar')">Rechazar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Crear Grupo Form -->
      <div class="card glass-card crear-grupo-card">
        <h3>Crear Nuevo Grupo</h3>
        <form @submit.prevent="crearGrupo" class="grupo-form">
          <div class="form-group">
            <label for="nuevoGrupoNombre">Nombre del Grupo</label>
            <input type="text" id="nuevoGrupoNombre" v-model="nuevoGrupoNombre" placeholder="Ej. Equipo de Instalaciones" required class="form-input" />
          </div>
          <div class="form-group">
            <label for="nuevoGrupoDesc">Descripción</label>
            <textarea id="nuevoGrupoDesc" v-model="nuevoGrupoDesc" placeholder="Detalles o propósito del grupo..." rows="2" class="form-input textarea"></textarea>
          </div>
          <button type="submit" :disabled="creandoGrupo" class="btn btn-primary btn-block">
            {{ creandoGrupo ? 'Creando...' : 'Crear Grupo' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Panel de Mis Grupos -->
    <div class="mis-grupos-section">
      <div class="mis-grupos-header">
        <h3>Mis Grupos ({{ grupos.length }})</h3>
        <button class="btn btn-secondary btn-sm" @click="cargarGrupos">🔄 Recargar</button>
      </div>

      <div v-if="loadingGrupos" class="state-message">
        <div class="spinner"></div>
        <p>Cargando tus grupos...</p>
      </div>

      <div v-else-if="grupos.length === 0" class="state-message empty">
        <p>📂</p>
        <p>Aún no perteneces a ningún grupo. ¡Crea uno arriba!</p>
      </div>

      <div v-else class="grupos-layout">
        <!-- Listado de Grupos -->
        <div class="grupos-list">
          <div 
            v-for="grp in grupos" 
            :key="grp.idGrupo" 
            class="grupo-item" 
            :class="{ active: grupoSeleccionado && grupoSeleccionado.idGrupo === grp.idGrupo }"
            @click="seleccionarGrupo(grp)"
          >
            <div class="grupo-avatar">
              {{ grp.nombre.substring(0, 2).toUpperCase() }}
            </div>
            <div class="grupo-text">
              <div class="grupo-title-row">
                <span class="grupo-name">{{ grp.nombre }}</span>
                <span class="badge" :class="grp.idOwner === usuarioLogueado.idUsuario ? 'badge-owner' : 'badge-member'">
                  {{ grp.idOwner === usuarioLogueado.idUsuario ? 'Propietario' : 'Miembro' }}
                </span>
              </div>
              <p class="grupo-desc" v-if="grp.descripcion">{{ grp.descripcion }}</p>
              <p class="grupo-desc" v-else><em>Sin descripción</em></p>
              <span class="grupo-meta">👥 {{ grp.memberCount }} miembros • Creado por: {{ grp.ownerName }}</span>
            </div>
          </div>
        </div>

        <!-- Detalle de Grupo Seleccionado -->
        <div class="grupo-detalle-panel glass-card card" v-if="grupoSeleccionado">
          <div class="detalle-header">
            <h4>{{ grupoSeleccionado.nombre }}</h4>
            <button 
              v-if="grupoSeleccionado.idOwner === usuarioLogueado.idUsuario" 
              class="btn btn-danger btn-xs" 
              @click="eliminarGrupo(grupoSeleccionado.idGrupo)"
            >
              🗑️ Eliminar Grupo
            </button>
            <button 
              v-else 
              class="btn btn-danger btn-xs" 
              @click="salirDeGrupo(grupoSeleccionado.idGrupo)"
            >
              🚪 Salir del Grupo
            </button>
          </div>

          <p class="detalle-desc">{{ grupoSeleccionado.descripcion || 'Sin descripción adicional.' }}</p>

          <!-- Listado de Miembros -->
          <div class="detalle-section">
            <h5>Miembros del Grupo</h5>
            <div v-if="loadingMiembros" class="mini-spinner-container">
              <div class="spinner mini"></div>
            </div>
            <div v-else class="miembros-list">
              <div v-for="mbr in miembros" :key="mbr.idUsuario" class="miembro-item">
                <div class="miembro-info">
                  <span class="miembro-name">{{ mbr.fullName }}</span>
                  <span class="miembro-email">{{ mbr.email }}</span>
                  <span class="miembro-company" v-if="mbr.empresa">🏢 {{ mbr.empresa }}</span>
                </div>
                <div class="miembro-role-col">
                  <span class="badge" :class="mbr.isOwner ? 'badge-owner' : 'badge-member'">
                    {{ mbr.isOwner ? 'Propietario' : 'Miembro' }}
                  </span>
                  <button 
                    v-if="grupoSeleccionado.idOwner === usuarioLogueado.idUsuario && !mbr.isOwner" 
                    class="btn-kick" 
                    title="Expulsar del grupo"
                    @click="expulsarMiembro(grupoSeleccionado.idGrupo, mbr.idUsuario, mbr.fullName)"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Compartir Viviendas Info -->
          <div class="detalle-section sharing-viviendas-section">
            <h5>Casas Compartidas con este Grupo</h5>
            <div class="viviendas-shared-list" v-if="viviendasCompartidas.length > 0">
              <div v-for="viv in viviendasCompartidas" :key="viv.idVivienda" class="shared-viv-item">
                <span class="viv-icon">🏠</span>
                <div class="viv-text">
                  <strong class="viv-name">{{ viv.nombre }}</strong>
                  <span class="viv-owner">Propietario: {{ viv.idDuenyo === usuarioLogueado.idUsuario ? 'Tú' : (viv.ownerName || 'Otro usuario') }}</span>
                </div>
              </div>
            </div>
            <div class="empty-state mini" v-else>
              <p>Ninguna vivienda está vinculada actualmente a este grupo.</p>
              <p class="hint" v-if="grupoSeleccionado.idOwner === usuarioLogueado.idUsuario">
                Edita tus viviendas en la pestaña "Mecanismos" y selecciona este grupo en la configuración para compartirlas.
              </p>
            </div>
          </div>

          <!-- Invitar Miembro Form (Sólo Propietario) -->
          <div class="detalle-section invitar-section" v-if="grupoSeleccionado.idOwner === usuarioLogueado.idUsuario">
            <h5>Invitar Usuario por Correo</h5>
            <form @submit.prevent="invitarMiembro" class="invitar-form">
              <input type="email" v-model="invitarEmail" placeholder="correo@ejemplo.com" required class="form-input" />
              <button type="submit" :disabled="invitando" class="btn btn-primary">
                {{ invitando ? 'Enviando...' : 'Invitar' }}
              </button>
            </form>
            <p v-if="invitadoExitoso" class="success-text">✔️ Invitación enviada con éxito.</p>
            <p v-if="invitadoError" class="error-text">⚠️ {{ invitadoError }}</p>
          </div>
        </div>

        <div class="grupo-detalle-panel glass-card card empty-detail" v-else>
          <span class="info-icon">💡</span>
          <p>Selecciona un grupo de la lista para ver sus miembros, invitar a otros usuarios o gestionar tu permanencia.</p>
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
    },
    usuarioLogueado: {
      type: Object,
      required: true
    },
    viviendas: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      grupos: [],
      invitaciones: [],
      grupoSeleccionado: null,
      miembros: [],
      
      nuevoGrupoNombre: "",
      nuevoGrupoDesc: "",
      creandoGrupo: false,
      
      invitarEmail: "",
      invitando: false,
      invitadoExitoso: false,
      invitadoError: "",
      
      loadingGrupos: true,
      loadingMiembros: false
    };
  },
  computed: {
    viviendasCompartidas() {
      if (!this.grupoSeleccionado) return [];
      return this.viviendas.filter(v => v.idGrupo === this.grupoSeleccionado.idGrupo);
    }
  },
  methods: {
    cargarGrupos() {
      this.loadingGrupos = true;
      fetch("http://localhost:3000/grupos/mis-grupos", {
        headers: {
          "Authorization": `Bearer ${this.token}`
        }
      })
      .then(res => {
        if (!res.ok) throw new Error("Error al obtener los grupos");
        return res.json();
      })
      .then(data => {
        this.grupos = data;
        this.loadingGrupos = false;

        // Mantener selección si existía
        if (this.grupoSeleccionado) {
          const actual = this.grupos.find(g => g.idGrupo === this.grupoSeleccionado.idGrupo);
          if (actual) {
            this.grupoSeleccionado = actual;
          } else {
            this.grupoSeleccionado = null;
          }
        }
      })
      .catch(err => {
        console.error(err);
        this.loadingGrupos = false;
      });
    },
    cargarInvitaciones() {
      fetch("http://localhost:3000/invitaciones/recibidas", {
        headers: {
          "Authorization": `Bearer ${this.token}`
        }
      })
      .then(res => {
        if (!res.ok) throw new Error("Error al obtener invitaciones");
        return res.json();
      })
      .then(data => {
        this.invitaciones = data;
      })
      .catch(err => console.error(err));
    },
    crearGrupo() {
      this.creandoGrupo = true;
      fetch("http://localhost:3000/grupos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`
        },
        body: JSON.stringify({
          nombre: this.nuevoGrupoNombre,
          descripcion: this.nuevoGrupoDesc
        })
      })
      .then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "No se pudo crear el grupo");
        }
        return res.json();
      })
      .then(() => {
        this.nuevoGrupoNombre = "";
        this.nuevoGrupoDesc = "";
        this.creandoGrupo = false;
        this.cargarGrupos();
        this.$emit("cargar-viviendas"); // Recargar por si afectara
      })
      .catch(err => {
        this.$emit("alertar", err.message);
        this.creandoGrupo = false;
      });
    },
    seleccionarGrupo(grupo) {
      this.grupoSeleccionado = grupo;
      this.cargarMiembros(grupo.idGrupo);
      this.invitadoExitoso = false;
      this.invitadoError = "";
      this.invitarEmail = "";
    },
    cargarMiembros(idGrupo) {
      this.loadingMiembros = true;
      fetch(`http://localhost:3000/grupos/${idGrupo}/miembros`, {
        headers: {
          "Authorization": `Bearer ${this.token}`
        }
      })
      .then(res => {
        if (!res.ok) throw new Error("Error al obtener los miembros");
        return res.json();
      })
      .then(data => {
        this.miembros = data;
        this.loadingMiembros = false;
      })
      .catch(err => {
        console.error(err);
        this.loadingMiembros = false;
      });
    },
    invitarMiembro() {
      this.invitando = true;
      this.invitadoExitoso = false;
      this.invitadoError = "";
      fetch(`http://localhost:3000/grupos/${this.grupoSeleccionado.idGrupo}/invitar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`
        },
        body: JSON.stringify({
          email: this.invitarEmail
        })
      })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al invitar al usuario");
        return data;
      })
      .then(() => {
        this.invitadoExitoso = true;
        this.invitarEmail = "";
        this.invitando = false;
      })
      .catch(err => {
        this.invitadoError = err.message;
        this.invitando = false;
      });
    },
    expulsarMiembro(idGrupo, idUsuario, name) {
      this.$emit("confirmar", {
        mensaje: `¿Estás seguro de que quieres expulsar a ${name} del grupo?`,
        callback: () => {
          fetch(`http://localhost:3000/grupos/${idGrupo}/miembros/${idUsuario}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${this.token}`
            }
          })
          .then(async res => {
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error(data.error || "No se pudo expulsar al miembro");
            }
            return res.json();
          })
          .then(() => {
            this.cargarMiembros(idGrupo);
            this.cargarGrupos();
          })
          .catch(err => this.$emit("alertar", err.message));
        }
      });
    },
    salirDeGrupo(idGrupo) {
      this.$emit("confirmar", {
        mensaje: "¿Estás seguro de que deseas salir de este grupo? Ya no tendrás acceso a sus viviendas.",
        callback: () => {
          fetch(`http://localhost:3000/grupos/${idGrupo}/miembros/${this.usuarioLogueado.idUsuario}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${this.token}`
            }
          })
          .then(async res => {
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error(data.error || "No se pudo salir del grupo");
            }
            return res.json();
          })
          .then(() => {
            this.grupoSeleccionado = null;
            this.cargarGrupos();
            this.$emit("cargar-viviendas");
          })
          .catch(err => this.$emit("alertar", err.message));
        }
      });
    },
    eliminarGrupo(idGrupo) {
      this.$emit("confirmar", {
        mensaje: "¿Estás seguro de que quieres eliminar este grupo permanentemente? Se eliminarán todas las invitaciones y asociaciones a viviendas.",
        callback: () => {
          fetch(`http://localhost:3000/grupos/${idGrupo}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${this.token}`
            }
          })
          .then(async res => {
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error(data.error || "No se pudo eliminar el grupo");
            }
            return res.json();
          })
          .then(() => {
            this.grupoSeleccionado = null;
            this.cargarGrupos();
            this.$emit("cargar-viviendas");
          })
          .catch(err => this.$emit("alertar", err.message));
        }
      });
    },
    responderInvitacion(idInvitacion, accion) {
      fetch(`http://localhost:3000/invitaciones/${idInvitacion}/responder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`
        },
        body: JSON.stringify({ accion })
      })
      .then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al responder la invitación");
        }
        return res.json();
      })
      .then(() => {
        this.cargarInvitaciones();
        this.cargarGrupos();
        this.$emit("cargar-viviendas");
      })
      .catch(err => this.$emit("alertar", err.message));
    }
  },
  mounted() {
    this.cargarGrupos();
    this.cargarInvitaciones();
  }
};
</script>

<style scoped>
.grupos-container {
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

/* Layout superior */
.top-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  text-align: left;
}

.card h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 15px 0;
  border-bottom: 2px solid rgba(0, 0, 0, 0.02);
  padding-bottom: 10px;
}

/* Formulario */
.grupo-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #4a5568;
}

.form-input {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.9rem;
  outline: none;
  background: #f7fafc;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: rgb(109, 180, 247);
  background: white;
  box-shadow: 0 0 8px rgba(109, 180, 247, 0.25);
}

.form-input.textarea {
  resize: vertical;
  font-family: inherit;
}

/* Botones */
.btn {
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, rgb(109, 180, 247) 0%, rgb(80, 150, 220) 100%);
  color: white;
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(109, 180, 247, 0.35);
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}
.btn-secondary:hover {
  background: #cbd5e0;
}

.btn-success {
  background: #48bb78;
  color: white;
}
.btn-success:hover {
  background: #38a169;
}

.btn-danger {
  background: #f56565;
  color: white;
}
.btn-danger:hover {
  background: #e53e3e;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}
.btn-xs {
  padding: 4px 8px;
  font-size: 0.75rem;
  border-radius: 6px;
}
.btn-block {
  width: 100%;
}

/* Invitaciones recibidas */
.invitaciones-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.invitacion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f7fafc;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.02);
}

.inv-info {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.inv-group {
  font-weight: 700;
  color: #2d3748;
  font-size: 0.95rem;
}

.inv-sender {
  font-size: 0.8rem;
  color: #718096;
}

.inv-actions {
  display: flex;
  gap: 6px;
}

.empty-state {
  text-align: center;
  padding: 30px 10px;
  color: #a0aec0;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 8px;
  display: block;
}

/* Sección Mis Grupos */
.mis-grupos-section {
  text-align: left;
  margin-top: 20px;
}

.mis-grupos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.mis-grupos-header h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

/* Layout Grupos */
.grupos-layout {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 20px;
  align-items: start;
}

.grupos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.grupo-item {
  background: white;
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.02);
}

.grupo-item:hover {
  transform: translateX(3px);
  border-color: rgba(109, 180, 247, 0.4);
}

.grupo-item.active {
  border-color: rgb(109, 180, 247);
  background: rgba(109, 180, 247, 0.03);
  box-shadow: 0 4px 15px rgba(109, 180, 247, 0.08);
}

.grupo-avatar {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #edf2f7;
  color: #4a5568;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

.grupo-item.active .grupo-avatar {
  background: rgb(109, 180, 247);
  color: white;
}

.grupo-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.grupo-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.grupo-name {
  font-weight: 700;
  color: #2d3748;
  font-size: 1rem;
}

.grupo-desc {
  font-size: 0.85rem;
  color: #718096;
  margin: 2px 0 4px 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.grupo-meta {
  font-size: 0.75rem;
  color: #a0aec0;
}

/* Insignias de roles */
.badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}
.badge-owner {
  background: #e6fffa;
  color: #234e52;
}
.badge-member {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid rgba(0,0,0,0.06);
}

/* Panel detalle */
.grupo-detalle-panel {
  background: white;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detalle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid rgba(0,0,0,0.02);
  padding-bottom: 12px;
}

.detalle-header h4 {
  font-size: 1.3rem;
  margin: 0;
  font-weight: 700;
  color: #1a202c;
}

.detalle-desc {
  font-size: 0.9rem;
  color: #4a5568;
  margin: 0;
  background: #f7fafc;
  padding: 12px;
  border-radius: 10px;
}

.detalle-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detalle-section h5 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #4a5568;
  margin: 0;
}

/* Miembros listado */
.miembros-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 180px;
  overflow-y: auto;
}

.miembro-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fcfcfc;
  border: 1px solid rgba(0,0,0,0.03);
  padding: 10px 12px;
  border-radius: 8px;
}

.miembro-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 0.85rem;
}

.miembro-name {
  font-weight: 600;
  color: #2d3748;
}

.miembro-email {
  color: #718096;
  font-size: 0.75rem;
}

.miembro-company {
  color: #a0aec0;
  font-size: 0.75rem;
  margin-top: 1px;
}

.miembro-role-col {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-kick {
  background: transparent;
  color: #a0aec0;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.15s;
  padding: 0 4px;
}

.btn-kick:hover {
  color: #e53e3e;
}

/* Compartir viviendas */
.viviendas-shared-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

.shared-viv-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.03);
}

.viv-icon {
  font-size: 1.1rem;
}

.viv-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 0.8rem;
}

.viv-name {
  color: #2d3748;
}

.viv-owner {
  color: #a0aec0;
  font-size: 0.7rem;
}

.empty-state.mini {
  background: #fcfcfc;
  border: 1px dashed rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 15px;
  color: #718096;
  font-size: 0.8rem;
}

.empty-state.mini p {
  margin: 0 0 4px 0;
}

.empty-state.mini p:last-child {
  margin: 0;
}

.hint {
  color: #a0aec0;
  font-size: 0.75rem;
}

/* Invitar form */
.invitar-form {
  display: flex;
  gap: 10px;
}

.invitar-form .form-input {
  flex: 1;
}

.success-text {
  color: #38a169;
  font-size: 0.8rem;
  margin: 4px 0 0 0;
  text-align: left;
}

.error-text {
  color: #e53e3e;
  font-size: 0.8rem;
  margin: 4px 0 0 0;
  text-align: left;
}

/* Detalle vacío */
.empty-detail {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #718096;
  padding: 40px;
  gap: 15px;
}

.info-icon {
  font-size: 2.5rem;
}

/* Mensajes de Estado */
.state-message {
  padding: 40px 10px;
  text-align: center;
  color: #718096;
  font-size: 0.95rem;
}

.state-message.empty p:first-child {
  font-size: 2rem;
  margin: 0 0 8px 0;
}

.mini-spinner-container {
  padding: 20px 0;
  display: flex;
  justify-content: center;
}

/* Spinner */
.spinner {
  border: 3px solid rgba(0, 0, 0, 0.05);
  border-top: 3px solid rgb(109, 180, 247);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 10px auto;
}

.spinner.mini {
  width: 18px;
  height: 18px;
  border-width: 2px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .top-row {
    grid-template-columns: 1fr;
  }
  .grupos-layout {
    grid-template-columns: 1fr;
  }
}
</style>
