<template>
  <div class="planificador-container">
    <div class="board-header">
      <h2>Mi Planificador</h2>
      
      <div class="board-controls">
        <div class="control-group">
          <button class="btn-control" :class="{ active: layoutMode === 'scroll' }" @click="layoutMode = 'scroll'" title="Desplazamiento horizontal (Kanban)">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="6" height="18" rx="1" ry="1"></rect>
              <rect x="11" y="3" width="6" height="18" rx="1" ry="1"></rect>
              <path d="M22 12l-3-3v6z"></path>
            </svg>
          </button>
          <button class="btn-control" :class="{ active: layoutMode === 'grid' }" @click="layoutMode = 'grid'" title="Cuadrícula (Multifila)">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" ry="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1" ry="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1" ry="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1" ry="1"></rect>
            </svg>
          </button>
        </div>
        <div class="control-group">
          <button class="btn-control text-control" :class="{ active: listSize === 'small' }" @click="listSize = 'small'" title="Columnas Pequeñas">S</button>
          <button class="btn-control text-control" :class="{ active: listSize === 'medium' }" @click="listSize = 'medium'" title="Columnas Medianas">M</button>
          <button class="btn-control text-control" :class="{ active: listSize === 'large' }" @click="listSize = 'large'" title="Columnas Grandes">L</button>
        </div>
        <button class="btn-primary btn-add-lista" @click="mostrarModalNuevaLista = true">+ Añadir Lista</button>
      </div>
    </div>

    <div class="board-canvas" :class="{ 'layout-grid': layoutMode === 'grid' }">
      <draggable 
        v-model="listas" 
        class="board"
        :class="[`layout-${layoutMode}`, `size-${listSize}`]"
        group="listas" 
        item-key="idLista" 
        handle=".lista-header"
        @end="onListDragEnd"
        :animation="200"
      >
        <template #item="{ element: lista }">
          <div class="lista" :style="lista.color ? { backgroundColor: `${lista.color}33`, borderColor: lista.color } : {}">
            <div class="lista-header">
              <h3 class="lista-titulo">{{ lista.nombre }}</h3>
              <div class="lista-actions">
                <button class="btn-icon btn-small" @click="abrirEditarLista(lista)" title="Editar lista">✎</button>
                <button class="btn-icon btn-small" @click="pedirConfirmacionBorrarLista(lista)" title="Eliminar lista">×</button>
              </div>
            </div>
            
            <div class="lista-cards">
              <draggable 
                v-model="lista.tareas" 
                group="tareas" 
                item-key="idTarea"
                :animation="200"
                class="cards-container"
                @change="(evt) => onTaskDragChange(evt, lista.idLista)"
              >
                <template #item="{ element: tarea }">
                  <div class="card" @click="abrirEditarTarea(tarea, lista.idLista)" 
                       :style="tarea.color ? { backgroundColor: `${tarea.color}22`, borderColor: tarea.color } : {}">
                    <div class="card-titulo">{{ tarea.titulo }}</div>
                    <div v-if="tarea.descripcion" class="card-badges">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
                    </div>
                  </div>
                </template>
              </draggable>
            </div>

            <div class="lista-footer">
              <button class="btn-add-card" @click="abrirNuevaTarea(lista.idLista)">+ Añadir tarjeta</button>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <!-- Modales -->
    <div id="blur-modal" :class="{ active: mostrarModalNuevaLista || mostrarModalEditarLista || mostrarModalTarea }">
      <!-- Modal Nueva Lista -->
      <div v-if="mostrarModalNuevaLista" class="modal-content">
        <h3>Añadir Lista</h3>
        <p class="form-label">Nombre</p>
        <input type="text" v-model="nuevaListaNombre" placeholder="Nombre de la lista..." class="form-input" @keyup.enter="guardarNuevaLista" />
        <p class="form-label">Color (Opcional)</p>
        <div class="color-picker">
          <div v-for="c in coloresDisponibles" :key="c.hex" 
               class="color-dot" 
               :class="{ selected: nuevaListaColor === c.hex, none: !c.hex }" 
               :style="{ backgroundColor: c.hex || 'transparent' }"
               :title="c.nombre"
               @click="nuevaListaColor = c.hex"></div>
        </div>
        <div class="modal-buttons">
          <button class="btn-cancelar" @click="mostrarModalNuevaLista = false">Cancelar</button>
          <button class="btn-guardar" :disabled="!nuevaListaNombre.trim()" @click="guardarNuevaLista">Guardar</button>
        </div>
      </div>

      <!-- Modal Editar Lista -->
      <div v-if="mostrarModalEditarLista" class="modal-content">
        <h3>Editar Lista</h3>
        <p class="form-label">Nombre</p>
        <input type="text" v-model="formLista.nombre" placeholder="Nombre de la lista..." class="form-input" @keyup.enter="guardarListaEditada" />
        <p class="form-label">Color</p>
        <div class="color-picker">
          <div v-for="c in coloresDisponibles" :key="c.hex" 
               class="color-dot" 
               :class="{ selected: formLista.color === c.hex, none: !c.hex }" 
               :style="{ backgroundColor: c.hex || 'transparent' }"
               :title="c.nombre"
               @click="formLista.color = c.hex"></div>
        </div>
        <div class="modal-buttons">
          <button class="btn-cancelar" @click="mostrarModalEditarLista = false">Cancelar</button>
          <button class="btn-guardar" :disabled="!formLista.nombre.trim()" @click="guardarListaEditada">Guardar</button>
        </div>
      </div>

      <!-- Modal Tarea -->
      <div v-if="mostrarModalTarea" class="modal-content modal-large">
        <h3>{{ tareaEditando ? 'Editar Tarjeta' : 'Añadir Tarjeta' }}</h3>
        <p class="form-label">Título</p>
        <input type="text" v-model="formTarea.titulo" placeholder="Título de la tarea..." class="form-input" />
        <p class="form-label">Descripción</p>
        <textarea v-model="formTarea.descripcion" placeholder="Añade una descripción más detallada..." class="form-textarea"></textarea>
        
        <p class="form-label">Etiqueta de Color (Rol)</p>
        <div class="color-picker">
          <div v-for="c in coloresDisponibles" :key="c.hex" 
               class="color-dot" 
               :class="{ selected: formTarea.color === c.hex, none: !c.hex }" 
               :style="{ backgroundColor: c.hex || 'transparent' }"
               :title="c.nombre"
               @click="formTarea.color = c.hex"></div>
        </div>
        
        <div class="modal-buttons-spread">
          <button v-if="tareaEditando" class="btn-danger" @click="borrarTarea">Borrar Tarjeta</button>
          <div v-else></div>
          <div class="modal-actions">
            <button class="btn-cancelar" @click="cerrarModalTarea">Cancelar</button>
            <button class="btn-guardar" :disabled="!formTarea.titulo.trim()" @click="guardarTarea">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";

export default {
  name: "PlanificadorView",
  components: {
    draggable
  },
  props: {
    token: String
  },
  emits: ["confirmar", "alertar"],
  data() {
    return {
      coloresDisponibles: [
        { hex: "", nombre: "Ninguno" },
        { hex: "#ef4444", nombre: "Rojo" },
        { hex: "#f97316", nombre: "Naranja" },
        { hex: "#eab308", nombre: "Amarillo" },
        { hex: "#22c55e", nombre: "Verde" },
        { hex: "#3b82f6", nombre: "Azul" },
        { hex: "#a855f7", nombre: "Morado" },
        { hex: "#ec4899", nombre: "Rosa" },
        { hex: "#9ca3af", nombre: "Gris" }
      ],
      idTablero: null,
      listas: [],
      mostrarModalNuevaLista: false,
      nuevaListaNombre: "",
      nuevaListaColor: "",
      
      mostrarModalEditarLista: false,
      listaEditando: null,
      formLista: { nombre: "", color: "" },
      
      mostrarModalTarea: false,
      tareaEditando: null,
      idListaSeleccionada: null,
      formTarea: {
        titulo: "",
        descripcion: "",
        color: ""
      },
      layoutMode: 'scroll',
      listSize: 'medium'
    };
  },
  mounted() {
    this.cargarTablero();
  },
  methods: {
    async cargarTablero() {
      try {
        const resTableros = await fetch(`${window.API_URL}/tableros`, {
          headers: { "Authorization": `Bearer ${this.token}` }
        });
        const tableros = await resTableros.json();
        
        if (tableros.length === 0) {
          // Crear un tablero por defecto
          const resCrear = await fetch(`${window.API_URL}/tableros`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${this.token}` },
            body: JSON.stringify({ nombre: "Mi Planificador" })
          });
          const nuevoTablero = await resCrear.json();
          this.idTablero = nuevoTablero.idTablero;
        } else {
          this.idTablero = tableros[0].idTablero;
        }
        await this.cargarListasYTareas();
      } catch (err) {
        console.error("Error cargando tablero:", err);
      }
    },
    async cargarListasYTareas() {
      if (!this.idTablero) return;
      try {
        const resListas = await fetch(`${window.API_URL}/listas/${this.idTablero}`, {
          headers: { "Authorization": `Bearer ${this.token}` }
        });
        const listasData = await resListas.json();
        
        const resTareas = await fetch(`${window.API_URL}/tareas/${this.idTablero}`, {
          headers: { "Authorization": `Bearer ${this.token}` }
        });
        const tareasData = await resTareas.json();

        // Mapear tareas a sus listas
        this.listas = listasData.map(l => ({
          ...l,
          tareas: tareasData.filter(t => t.idLista === l.idLista).sort((a, b) => a.orden - b.orden)
        })).sort((a, b) => a.orden - b.orden);
      } catch (err) {
        console.error("Error cargando listas y tareas:", err);
      }
    },
    async guardarNuevaLista() {
      if (!this.nuevaListaNombre.trim()) return;
      try {
        const res = await fetch(`${window.API_URL}/listas`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${this.token}` },
          body: JSON.stringify({
            nombre: this.nuevaListaNombre,
            idTablero: this.idTablero,
            orden: this.listas.length,
            color: this.nuevaListaColor
          })
        });
        if (!res.ok) {
          const errData = await res.json();
          this.$emit("alertar", "Error del servidor: " + (errData.error || "Desconocido"));
          return;
        }
        const nuevaLista = await res.json();
        console.log("Nueva lista creada:", nuevaLista);
        nuevaLista.tareas = [];
        this.listas = [...this.listas, nuevaLista];
        this.nuevaListaNombre = "";
        this.nuevaListaColor = "";
        this.mostrarModalNuevaLista = false;
      } catch (err) {
        this.$emit("alertar", "Error al crear lista");
      }
    },
    abrirEditarLista(lista) {
      this.listaEditando = lista.idLista;
      this.formLista.nombre = lista.nombre;
      this.formLista.color = lista.color || "";
      this.mostrarModalEditarLista = true;
    },
    async guardarListaEditada() {
      if (!this.formLista.nombre.trim()) return;
      try {
        const res = await fetch(`${window.API_URL}/listas/${this.listaEditando}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${this.token}` },
          body: JSON.stringify(this.formLista)
        });
        if (!res.ok) {
          this.$emit("alertar", "Error al actualizar lista");
          return;
        }
        const l = this.listas.find(x => x.idLista === this.listaEditando);
        if (l) {
          l.nombre = this.formLista.nombre;
          l.color = this.formLista.color;
        }
        this.mostrarModalEditarLista = false;
      } catch (err) {
        this.$emit("alertar", "Error de red al actualizar lista");
      }
    },
    pedirConfirmacionBorrarLista(lista) {
      this.$emit("confirmar", {
        mensaje: `¿Estás seguro de que deseas eliminar la lista "${lista.nombre}" y todas sus tareas?`,
        callback: async () => {
          this.$emit("alertar", "Borrado de listas aún no implementado en backend. Por favor elimina las tareas primero.");
        }
      });
    },
    abrirNuevaTarea(idLista) {
      this.idListaSeleccionada = idLista;
      this.tareaEditando = null;
      this.formTarea.titulo = "";
      this.formTarea.descripcion = "";
      this.formTarea.color = "";
      this.mostrarModalTarea = true;
    },
    abrirEditarTarea(tarea, idLista) {
      this.idListaSeleccionada = idLista;
      this.tareaEditando = tarea.idTarea;
      this.formTarea.titulo = tarea.titulo;
      this.formTarea.descripcion = tarea.descripcion;
      this.formTarea.color = tarea.color || "";
      this.mostrarModalTarea = true;
    },
    cerrarModalTarea() {
      this.mostrarModalTarea = false;
      this.tareaEditando = null;
    },
    async guardarTarea() {
      const listaObj = this.listas.find(l => l.idLista === this.idListaSeleccionada);
      if (!listaObj) return;

      try {
        if (this.tareaEditando) {
          // Editar
          await fetch(`${window.API_URL}/tareas/${this.tareaEditando}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${this.token}` },
            body: JSON.stringify(this.formTarea)
          });
          const t = listaObj.tareas.find(tx => tx.idTarea === this.tareaEditando);
          if (t) {
            t.titulo = this.formTarea.titulo;
            t.descripcion = this.formTarea.descripcion;
            t.color = this.formTarea.color;
          }
        } else {
          // Crear
          const res = await fetch(`${window.API_URL}/tareas`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${this.token}` },
            body: JSON.stringify({
              ...this.formTarea,
              idLista: this.idListaSeleccionada,
              orden: listaObj.tareas.length
            })
          });
          if (!res.ok) {
             const errData = await res.json();
             this.$emit("alertar", "Error del servidor: " + (errData.error || "Desconocido"));
             return;
          }
          const nuevaTarea = await res.json();
          console.log("Nueva tarea creada:", nuevaTarea);
          listaObj.tareas = [...listaObj.tareas, nuevaTarea];
        }
        this.cerrarModalTarea();
      } catch (err) {
        this.$emit("alertar", "Error guardando tarea");
      }
    },
    async borrarTarea() {
      if (!this.tareaEditando) return;
      this.$emit("confirmar", {
        mensaje: "¿Seguro que quieres borrar esta tarea?",
        callback: async () => {
          try {
            await fetch(`${window.API_URL}/tareas/${this.tareaEditando}`, {
              method: "DELETE",
              headers: { "Authorization": `Bearer ${this.token}` }
            });
            const listaObj = this.listas.find(l => l.idLista === this.idListaSeleccionada);
            if (listaObj) {
              listaObj.tareas = listaObj.tareas.filter(t => t.idTarea !== this.tareaEditando);
            }
            this.cerrarModalTarea();
          } catch (err) {
            this.$emit("alertar", "Error borrando tarea");
          }
        }
      });
    },
    onListDragEnd() {
      // Actualizar órdenes de listas
      // Nota: Requiere endpoint en el backend para patch lista, omitido por simplicidad inicial,
      // el orden se mantiene solo en front de momento a menos que recargues.
    },
    async onTaskDragChange(evt, newIdLista) {
      if (evt.added) {
        const idTarea = evt.added.element.idTarea;
        const newIndex = evt.added.newIndex;
        // La tarea cambió de lista
        try {
          await fetch(`${window.API_URL}/tareas/${idTarea}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${this.token}` },
            body: JSON.stringify({ idLista: newIdLista, orden: newIndex })
          });
        } catch (e) {
          console.error(e);
        }
      } else if (evt.moved) {
        const idTarea = evt.moved.element.idTarea;
        const newIndex = evt.moved.newIndex;
        // La tarea cambió de orden dentro de la misma lista
        try {
          await fetch(`${window.API_URL}/tareas/${idTarea}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${this.token}` },
            body: JSON.stringify({ orden: newIndex })
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
};
</script>

<style scoped>
.planificador-container {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  background-color: transparent;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.board-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  white-space: nowrap;
}

.board-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  gap: 4px;
  background-color: var(--input-bg);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid var(--card-border);
}

.btn-control {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, color 0.2s;
}

.text-control {
  font-weight: 700;
  width: 30px;
  height: 30px;
  padding: 0;
}

.btn-control.active {
  background-color: rgb(100, 98, 194);
  color: white;
}

.btn-add-lista {
  white-space: nowrap;
}

.board-canvas {
  flex-grow: 1;
  padding: 0 16px 16px;
  overflow-x: auto;
  overflow-y: hidden;
}

.board-canvas.layout-grid {
  overflow-y: auto;
  overflow-x: hidden;
}

.board {
  display: flex;
  height: 100%;
  align-items: flex-start;
  gap: 16px;
}

.board.layout-grid {
  flex-wrap: wrap;
  justify-content: flex-start;
  height: max-content;
}

.lista {
  background-color: var(--input-bg);
  border-radius: 12px;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: var(--card-shadow);
}

.board.size-small .lista {
  width: 240px;
  min-width: 240px;
}
.board.size-medium .lista {
  width: 320px;
  min-width: 320px;
}
.board.size-large .lista {
  width: 420px;
  min-width: 420px;
}

.lista-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: grab;
  border-bottom: 1px solid var(--card-border);
}

.lista-header:active {
  cursor: grabbing;
}

.lista-titulo {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
}

.lista-cards {
  padding: 12px 12px 0;
  flex-grow: 1;
  overflow-y: auto;
}

.cards-container {
  min-height: 10px;
}

.card {
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid var(--card-border);
  transition: transform 0.15s, box-shadow 0.15s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.card-titulo {
  font-size: 0.95rem;
  color: var(--text-color);
  word-wrap: break-word;
}

.card-badges {
  margin-top: 8px;
  color: var(--text-secondary);
}

.lista-footer {
  padding: 12px;
}

.btn-add-card {
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
}

.btn-add-card:hover {
  background-color: rgba(0,0,0,0.05);
}

.lista-actions {
  display: flex;
  gap: 4px;
}

.btn-small {
  font-size: 1rem;
  padding: 2px 6px;
}

.btn-primary {
  background: rgb(100, 98, 194);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-icon {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: var(--text-secondary);
  cursor: pointer;
}

#blur-modal {
  position: fixed;
  background-color: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 100;
  display: none;
  justify-content: center;
  align-items: center;
}

#blur-modal.active {
  display: flex;
}

.modal-content {
  background-color: var(--popup-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 24px;
  width: 320px;
  box-shadow: var(--card-shadow);
}

.modal-large {
  width: 450px;
}

.modal-content h3 {
  margin-top: 0;
  color: var(--text-color);
  margin-bottom: 20px;
}

.form-label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 6px;
  text-align: left;
}

.form-input, .form-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--input-border);
  background-color: var(--input-bg);
  color: var(--text-color);
  margin-bottom: 16px;
  font-family: inherit;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.color-picker {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.color-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.15s, border-color 0.15s;
}

.color-dot:hover {
  transform: scale(1.1);
}

.color-dot.selected {
  border-color: #4b5563;
  transform: scale(1.1);
}

.color-dot.none {
  border: 2px dashed #9ca3af;
}

.color-dot.none.selected {
  border-color: #4b5563;
}

.card-color-label {
  height: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  width: 40px;
}

.modal-buttons-spread {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn-cancelar {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
  cursor: pointer;
}

.btn-guardar {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  background-color: rgb(109, 180, 247);
  color: white;
  border: none;
  cursor: pointer;
}

.btn-danger {
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  background-color: #fee2e2;
  color: #ef4444;
  border: none;
  cursor: pointer;
}

body.dark-theme .btn-cancelar {
  background-color: #374151;
  color: #d1d5db;
}

body.dark-theme .btn-danger {
  background-color: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}
</style>
