<template>
  <div class="presupuestos-container">
    <!-- Si no hay vivienda seleccionada -->
    <div v-if="!idViviendaSeleccionada" class="no-selection-card">
      <div class="empty-icon">📂</div>
      <h2>Selecciona una vivienda para gestionar sus presupuestos</h2>
      <p>Utiliza el selector en la barra superior para elegir una casa existente.</p>
    </div>

    <!-- Si hay vivienda y estamos en vista LISTADO -->
    <div v-else-if="!editandoPresupuesto" class="presupuestos-lista-seccion">
      <div class="seccion-header">
        <h2>Presupuestos de la Vivienda</h2>
        <button class="btn-primary" @click="abrirNuevoPresupuestoPopup">
          <span class="btn-icon">+</span> Nuevo Presupuesto
        </button>
      </div>

      <!-- Lista de presupuestos -->
      <div v-if="presupuestos.length === 0" class="empty-state">
        <div class="empty-icon">📄</div>
        <h3>No hay presupuestos creados para esta vivienda</h3>
        <p>Los presupuestos te permiten clonar los mecanismos de tu casa y personalizar los precios para tus clientes.</p>
        <button class="btn-secondary" @click="abrirNuevoPresupuestoPopup">Crear primer presupuesto</button>
      </div>

      <div v-else class="presupuestos-grid">
        <div v-for="p in presupuestos" :key="p.idPresupuesto" class="presupuesto-card">
          <div class="card-status-badge" :class="p.estado.toLowerCase()">
            {{ p.estado }}
          </div>
          <div class="card-header">
            <h3>{{ p.nombre }}</h3>
            <span class="card-date">{{ p.fecha || 'Sin fecha' }}</span>
          </div>
          <div class="card-body">
            <p><strong>Cliente:</strong> {{ p.clienteNombre || 'Sin especificar' }}</p>
            <p><strong>Dirección:</strong> {{ p.clienteDireccion || 'Sin especificar' }}</p>
            <div class="totals-line">
              <span class="total-label">Total Aprox:</span>
              <span class="total-value">{{ calcularTotalPresupuestoGeneral(p).toFixed(2) }}€</span>
            </div>
          </div>
          <div class="card-footer">
            <button class="btn-card-edit" @click="cargarDetallePresupuesto(p.idPresupuesto)">
              Editar
            </button>
            <button class="btn-card-pdf" @click="descargarPDFDirecto(p.idPresupuesto)">
              PDF
            </button>
            <button class="btn-card-delete" @click="eliminarPresupuesto(p.idPresupuesto)">
              Borrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Si hay vivienda y estamos en vista EDICIÓN DETALLADA -->
    <div v-else class="presupuesto-editor-seccion">
      <div class="editor-header">
        <button class="btn-back" @click="volverAlListado">
          ← Volver a presupuestos
        </button>
        <div class="editor-header-details">
          <h2>Editando Presupuesto: {{ editandoPresupuesto.nombre }}</h2>
          <span class="status-badge" :class="editandoPresupuesto.estado.toLowerCase()">{{ editandoPresupuesto.estado }}</span>
        </div>
        <div class="editor-actions">
          <button class="btn-secondary" @click="guardarCambiosPresupuesto">
            Guardar Cambios
          </button>
          <button class="btn-primary" @click="generarPDF(editandoPresupuesto)">
            Descargar PDF
          </button>
        </div>
      </div>

      <!-- Formulario Cabecera -->
      <div class="editor-form-card">
        <h3>Datos Generales del Presupuesto</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Nombre del Presupuesto</label>
            <input type="text" v-model="editandoPresupuesto.nombre" placeholder="Ej. Presupuesto Inicial" />
          </div>
          <div class="form-group">
            <label>Fecha</label>
            <input type="date" v-model="editandoPresupuesto.fecha" />
          </div>
          <div class="form-group">
            <label>Cliente (Nombre)</label>
            <input type="text" v-model="editandoPresupuesto.clienteNombre" placeholder="Ej. Juan Pérez" />
          </div>
          <div class="form-group">
            <label>Cliente (Dirección)</label>
            <input type="text" v-model="editandoPresupuesto.clienteDireccion" placeholder="Ej. Calle Mayor, 12" />
          </div>
          <div class="form-group">
            <label>Estado</label>
            <select v-model="editandoPresupuesto.estado">
              <option value="BORRADOR">Borrador</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="ACEPTADO">Aceptado</option>
              <option value="RECHAZADA">Rechazado</option>
            </select>
          </div>
          <div class="form-group span-all">
            <label>Notas / Observaciones</label>
            <textarea v-model="editandoPresupuesto.notes" placeholder="Condiciones de pago, validez de la oferta, etc."></textarea>
          </div>
        </div>
      </div>

      <!-- Editor de Mecanismos -->
      <div class="editor-table-card">
        <h3>Mecanismos Incluidos</h3>
        <div class="table-container">
          <table class="editor-table">
            <thead>
              <tr>
                <th>Mecanismo</th>
                <th>Habitación</th>
                <th>Descripción</th>
                <th width="140">Cantidad</th>
                <th width="150">Precio Unitario</th>
                <th width="120">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="editandoPresupuesto.mecanismos.length === 0">
                <td colspan="6" class="text-center italic">No hay mecanismos en este presupuesto. Puedes añadirlos en la sección principal.</td>
              </tr>
              <tr v-for="m in editandoPresupuesto.mecanismos" :key="m.idPresupuestoMecanismo">
                <td class="font-bold">{{ m.nombre }}</td>
                <td><span class="room-tag">{{ m.idHabitacion || 'General' }}</span></td>
                <td class="text-secondary">{{ m.descripcion || '-' }}</td>
                <td>
                  <div class="quantity-input-container">
                    <button class="btn-qty-minus" @click="m.cantidad = Math.max(1, m.cantidad - 1)">-</button>
                    <input type="number" class="qty-input" v-model.number="m.cantidad" min="1" />
                    <button class="btn-qty-plus" @click="m.cantidad = m.cantidad + 1">+</button>
                  </div>
                </td>
                <td>
                  <div class="price-input-container">
                    <input type="number" class="price-input" v-model.number="m.precioUnitario" step="0.01" min="0" />
                    <span class="euro-symbol">€</span>
                  </div>
                </td>
                <td class="font-bold">{{ (m.cantidad * m.precioUnitario).toFixed(2) }}€</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Editor de Añadidos (Conceptos Extras) -->
      <div class="editor-table-card">
        <div class="card-header-with-action">
          <h3>Conceptos Adicionales (Añadidos)</h3>
          <button class="btn-small-add" @click="anyadirConceptoExtra">
            + Añadir Concepto Extra
          </button>
        </div>
        <div class="table-container">
          <table class="editor-table">
            <thead>
              <tr>
                <th>Concepto / Descripción</th>
                <th width="140">Cantidad</th>
                <th width="150">Precio Unitario</th>
                <th width="120">Total</th>
                <th width="80" class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="editandoPresupuesto.anadidos.length === 0">
                <td colspan="5" class="text-center italic">Sin conceptos adicionales añadidos. (Ej. Mano de obra, cableado adicional)</td>
              </tr>
              <tr v-for="(a, index) in editandoPresupuesto.anadidos" :key="index">
                <td>
                  <input type="text" class="table-text-input" v-model="a.concepto" placeholder="Ej. Mano de obra instalación" />
                </td>
                <td>
                  <div class="quantity-input-container">
                    <button class="btn-qty-minus" @click="a.cantidad = Math.max(1, a.cantidad - 1)">-</button>
                    <input type="number" class="qty-input" v-model.number="a.cantidad" min="1" />
                    <button class="btn-qty-plus" @click="a.cantidad = a.cantidad + 1">+</button>
                  </div>
                </td>
                <td>
                  <div class="price-input-container">
                    <input type="number" class="price-input" v-model.number="a.precioUnitario" step="0.01" min="0" />
                    <span class="euro-symbol">€</span>
                  </div>
                </td>
                <td class="font-bold">{{ (a.cantidad * a.precioUnitario).toFixed(2) }}€</td>
                <td class="text-center">
                  <button class="btn-row-delete" @click="eliminarConceptoExtra(index)" title="Eliminar concepto">
                    ×
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Resumen de Costes -->
      <div class="summary-and-notes-grid">
        <div class="summary-card">
          <h3>Resumen Económico</h3>
          <div class="summary-line">
            <span>Subtotal Mecanismos:</span>
            <span>{{ subtotalMecanismos.toFixed(2) }}€</span>
          </div>
          <div class="summary-line">
            <span>Subtotal Añadidos:</span>
            <span>{{ subtotalAnadidos.toFixed(2) }}€</span>
          </div>
          <div class="summary-line font-bold border-top">
            <span>Suma Total:</span>
            <span>{{ subtotalGeneral.toFixed(2) }}€</span>
          </div>
          <div class="summary-line align-items-center">
            <span>Descuento (%):</span>
            <input type="number" class="summary-number-input" v-model.number="editandoPresupuesto.descuento" min="0" max="100" />
          </div>
          <div class="summary-line font-bold text-red">
            <span>Descuento Restado:</span>
            <span>-{{ descuentoCalculado.toFixed(2) }}€</span>
          </div>
          <div class="summary-line font-bold border-top">
            <span>Base Imponible:</span>
            <span>{{ baseImponibleCalculada.toFixed(2) }}€</span>
          </div>
          <div class="summary-line align-items-center">
            <span>IVA (%):</span>
            <input type="number" class="summary-number-input" v-model.number="editandoPresupuesto.iva" min="0" />
          </div>
          <div class="summary-line">
            <span>Importe IVA:</span>
            <span>{{ ivaCalculado.toFixed(2) }}€</span>
          </div>
          <div class="summary-line total-highlight">
            <span>TOTAL PRESUPUESTO:</span>
            <span>{{ totalPresupuestoCalculado.toFixed(2) }}€</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Popup de Nuevo Presupuesto -->
    <div id="blur-nuevo-presupuesto" :class="{ active: popupNuevoPresupuesto }">
      <div id="popup-nuevo-presupuesto">
        <div id="titulo-nuevo-presupuesto">Crear Nuevo Presupuesto</div>
        <div class="popup-body-presupuesto">
          <div class="form-group-popup">
            <label>Nombre del Presupuesto *</label>
            <input type="text" placeholder="Ej. Presupuesto Base" v-model="nuevoPresupuestoNombre" />
          </div>
          <div class="form-group-popup">
            <label>Cliente (Nombre)</label>
            <input type="text" placeholder="Ej. Ramón Gómez" v-model="nuevoPresupuestoCliente" />
          </div>
          <div class="form-group-popup">
            <label>Cliente (Dirección)</label>
            <input type="text" placeholder="Ej. Av. Constitución 4" v-model="nuevoPresupuestoDireccion" />
          </div>
          <div class="form-group-popup-half">
            <div class="half-field">
              <label>IVA (%)</label>
              <input type="number" v-model.number="nuevoPresupuestoIva" />
            </div>
            <div class="half-field">
              <label>Descuento (%)</label>
              <input type="number" v-model.number="nuevoPresupuestoDescuento" />
            </div>
          </div>
          
          <p class="popup-info-msg">
            💡 **Se clonarán automáticamente los mecanismos configurados en esta vivienda** para que sirvan de base a este presupuesto.
          </p>

          <div class="popup-buttons-presupuesto">
            <button class="btn-cancelar-presupuesto" @click="cerrarNuevoPresupuestoPopup">Cancelar</button>
            <button class="btn-guardar-presupuesto" :disabled="!nuevoPresupuestoNombre.trim()" @click="crearPresupuesto">
              Crear Presupuesto
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default {
  props: {
    idViviendaSeleccionada: Number,
    token: String,
    viviendas: Array
  },
  data() {
    return {
      presupuestos: [],
      editandoPresupuesto: null,
      popupNuevoPresupuesto: false,

      // Formulario de creación
      nuevoPresupuestoNombre: "",
      nuevoPresupuestoCliente: "",
      nuevoPresupuestoDireccion: "",
      nuevoPresupuestoIva: 21,
      nuevoPresupuestoDescuento: 0
    };
  },
  watch: {
    idViviendaSeleccionada: {
      immediate: true,
      handler() {
        this.cargarPresupuestos();
        this.editandoPresupuesto = null;
      }
    }
  },
  computed: {
    subtotalMecanismos() {
      if (!this.editandoPresupuesto || !this.editandoPresupuesto.mecanismos) return 0;
      return this.editandoPresupuesto.mecanismos.reduce((sum, m) => sum + (m.cantidad * m.precioUnitario), 0);
    },
    subtotalAnadidos() {
      if (!this.editandoPresupuesto || !this.editandoPresupuesto.anadidos) return 0;
      return this.editandoPresupuesto.anadidos.reduce((sum, a) => sum + (a.cantidad * a.precioUnitario), 0);
    },
    subtotalGeneral() {
      return this.subtotalMecanismos + this.subtotalAnadidos;
    },
    descuentoCalculado() {
      if (!this.editandoPresupuesto) return 0;
      const pct = parseFloat(this.editandoPresupuesto.descuento) || 0;
      return this.subtotalGeneral * (pct / 100);
    },
    baseImponibleCalculada() {
      return this.subtotalGeneral - this.descuentoCalculado;
    },
    ivaCalculado() {
      if (!this.editandoPresupuesto) return 0;
      const pct = parseFloat(this.editandoPresupuesto.iva) || 0;
      return this.baseImponibleCalculada * (pct / 100);
    },
    totalPresupuestoCalculado() {
      return this.baseImponibleCalculada + this.ivaCalculado;
    }
  },
  methods: {
    cargarPresupuestos() {
      if (!this.idViviendaSeleccionada || !this.token) {
        this.presupuestos = [];
        return;
      }
      fetch(`${window.API_URL}/presupuestos?idVivienda=${this.idViviendaSeleccionada}`, {
        headers: {
          "Authorization": `Bearer ${this.token}`
        }
      })
      .then(res => {
        if (!res.ok) throw new Error("Error en servidor al cargar presupuestos");
        return res.json();
      })
      .then(data => {
        this.presupuestos = data;
      })
      .catch(err => {
        console.error("Error cargando presupuestos:", err);
      });
    },
    cargarDetallePresupuesto(id) {
      fetch(`${window.API_URL}/presupuestos/${id}`, {
        headers: {
          "Authorization": `Bearer ${this.token}`
        }
      })
      .then(res => {
        if (!res.ok) throw new Error("Error al obtener detalle del presupuesto");
        return res.json();
      })
      .then(data => {
        // Mapear notes a notes para compatibilidad
        this.editandoPresupuesto = {
          ...data,
          notes: data.notas || ""
        };
      })
      .catch(err => {
        this.$emit("alertar", "Error al abrir el presupuesto: " + err.message);
      });
    },
    calcularTotalPresupuestoGeneral(presupuesto) {
      // Cálculo general simple si viene precalculado o de forma síncrona
      // Como no tenemos el detalle de items en la lista principal, estimaremos o cargaremos los totales
      // En una aplicación real podemos hacer fetch del detalle, pero aquí podemos computar un total base
      // Guardaremos los precios calculados o haremos una consulta de sumas, pero para la vista general,
      // estimar o calcular basándose en el subtotal guardado (si existe) o lo calculamos tras cargar detalles.
      // O podemos estimar 0 y cargarlo tras entrar. Pero para un comportamiento fluido, cuando listamos
      // no tenemos los mecanismos cargados para cada presupuesto de la lista. Podemos hacer un truco:
      // en la lista mostramos 'Ver detalles' y el total lo calculamos si tenemos guardados datos.
      // Para solucionarlo elegantemente, podemos dejarlo como 'Calculando...' o simplemente consultar
      // el subtotal de mecanismos + añadidos. O, mucho mejor: como los presupuestos son pocos en la grid,
      // podemos hacer fetch de totales o tenerlos calculados. Vamos a estimar el precio final o guardarlo al editar.
      // O, de forma rápida, si no tenemos los ítems cargados en la cabecera, podemos hacer un fetch del detalle de cada
      // presupuesto al cargar la lista, o en este componente cargar los detalles en paralelo.
      // Vamos a cargar los detalles en paralelo para mostrar los totales reales en las tarjetas.
      // ¡Eso dará una experiencia de usuario increíble!
      if (presupuesto.totalCalculado !== undefined) {
        return presupuesto.totalCalculado;
      }
      // Inicializar y fetch silencioso
      presupuesto.totalCalculado = 0;
      fetch(`${window.API_URL}/presupuestos/${presupuesto.idPresupuesto}`, {
        headers: { "Authorization": `Bearer ${this.token}` }
      })
      .then(res => res.json())
      .then(d => {
        const subMec = d.mecanismos ? d.mecanismos.reduce((s, m) => s + (m.cantidad * m.precioUnitario), 0) : 0;
        const subAnad = d.anadidos ? d.anadidos.reduce((s, a) => s + (a.cantidad * a.precioUnitario), 0) : 0;
        const totalBase = subMec + subAnad;
        const dto = totalBase * ((d.descuento || 0) / 100);
        const base = totalBase - dto;
        const iva = base * ((d.iva || 21) / 100);
        presupuesto.totalCalculado = base + iva;
      })
      .catch(() => {});
      
      return 0; // provisional hasta que resuelva
    },
    abrirNuevoPresupuestoPopup() {
      this.nuevoPresupuestoNombre = "";
      this.nuevoPresupuestoCliente = "";
      this.nuevoPresupuestoDireccion = "";
      this.nuevoPresupuestoIva = 21;
      this.nuevoPresupuestoDescuento = 0;
      this.popupNuevoPresupuesto = true;
    },
    cerrarNuevoPresupuestoPopup() {
      this.popupNuevoPresupuesto = false;
    },
    crearPresupuesto() {
      if (!this.nuevoPresupuestoNombre.trim()) return;

      const payload = {
        idVivienda: this.idViviendaSeleccionada,
        nombre: this.nuevoPresupuestoNombre.trim(),
        fecha: new Date().toISOString().split("T")[0],
        clienteNombre: this.nuevoPresupuestoCliente.trim() || null,
        clienteDireccion: this.nuevoPresupuestoDireccion.trim() || null,
        iva: parseFloat(this.nuevoPresupuestoIva) || 21,
        descuento: parseFloat(this.nuevoPresupuestoDescuento) || 0,
        notas: "",
        estado: "BORRADOR"
      };

      fetch(`${window.API_URL}/presupuestos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`
        },
        body: JSON.stringify(payload)
      })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error en servidor al crear el presupuesto");
        return data;
      })
      .then(data => {
        this.presupuestos.push(data);
        this.cerrarNuevoPresupuestoPopup();
        // Abrir la edición inmediatamente
        this.cargarDetallePresupuesto(data.idPresupuesto);
      })
      .catch(err => {
        this.$emit("alertar", "Error al crear presupuesto: " + err.message);
      });
    },
    guardarCambiosPresupuesto() {
      if (!this.editandoPresupuesto) return;

      const payload = {
        nombre: this.editandoPresupuesto.nombre,
        fecha: this.editandoPresupuesto.fecha,
        clienteNombre: this.editandoPresupuesto.clienteNombre,
        clienteDireccion: this.editandoPresupuesto.clienteDireccion,
        descuento: parseFloat(this.editandoPresupuesto.descuento) || 0,
        iva: parseFloat(this.editandoPresupuesto.iva) || 0,
        notas: this.editandoPresupuesto.notes,
        estado: this.editandoPresupuesto.estado,
        mecanismos: this.editandoPresupuesto.mecanismos,
        anadidos: this.editandoPresupuesto.anadidos
      };

      fetch(`${window.API_URL}/presupuestos/${this.editandoPresupuesto.idPresupuesto}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`
        },
        body: JSON.stringify(payload)
      })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error en servidor al guardar cambios");
        return data;
      })
      .then(() => {
        // Actualizar datos locales en la lista
        const idx = this.presupuestos.findIndex(p => p.idPresupuesto === this.editandoPresupuesto.idPresupuesto);
        if (idx !== -1) {
          this.presupuestos[idx].nombre = this.editandoPresupuesto.nombre;
          this.presupuestos[idx].fecha = this.editandoPresupuesto.fecha;
          this.presupuestos[idx].clienteNombre = this.editandoPresupuesto.clienteNombre;
          this.presupuestos[idx].clienteDireccion = this.editandoPresupuesto.clienteDireccion;
          this.presupuestos[idx].estado = this.editandoPresupuesto.estado;
          this.presupuestos[idx].totalCalculado = this.totalPresupuestoCalculado;
        }
        this.$emit("alertar", "Presupuesto guardado correctamente.");
      })
      .catch(err => {
        this.$emit("alertar", "Error al guardar el presupuesto: " + err.message);
      });
    },
    eliminarPresupuesto(id) {
      this.$emit("confirmar", {
        mensaje: "¿Estás seguro de que deseas eliminar este presupuesto? Se borrarán todos los precios e ítems personalizados del mismo.",
        callback: () => {
          fetch(`${window.API_URL}/presupuestos/${id}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${this.token}`
            }
          })
          .then(res => {
            if (!res.ok) throw new Error("Error en servidor al eliminar");
            this.presupuestos = this.presupuestos.filter(p => p.idPresupuesto !== id);
          })
          .catch(err => {
            this.$emit("alertar", "No se pudo eliminar el presupuesto: " + err.message);
          });
        }
      });
    },
    descargarPDFDirecto(id) {
      fetch(`${window.API_URL}/presupuestos/${id}`, {
        headers: {
          "Authorization": `Bearer ${this.token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        this.generarPDF(data);
      })
      .catch(err => {
        this.$emit("alertar", "Error al generar PDF: " + err.message);
      });
    },
    volverAlListado() {
      this.editandoPresupuesto = null;
      this.cargarPresupuestos();
    },
    anyadirConceptoExtra() {
      this.editandoPresupuesto.anadidos.push({
        concepto: "",
        precioUnitario: 0,
        cantidad: 1
      });
    },
    eliminarConceptoExtra(index) {
      this.editandoPresupuesto.anadidos.splice(index, 1);
    },
    generarPDF(presupuesto) {
      const doc = new jsPDF();
      
      // Encabezado premium - Color principal de la app #6462C2
      doc.setFillColor(100, 98, 194);
      doc.rect(0, 0, 210, 38, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("PRESUPUESTO DE INSTALACIÓN", 15, 24);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Nº Presupuesto: PRE-${presupuesto.idPresupuesto}`, 150, 16);
      doc.text(`Fecha: ${presupuesto.fecha || new Date().toISOString().split('T')[0]}`, 150, 22);
      doc.text(`Estado: ${presupuesto.estado}`, 150, 28);
      
      // Datos de cliente
      doc.setTextColor(33, 37, 41);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("CLIENTE Y PROYECTO", 15, 50);
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 52, 195, 52);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text(`Cliente: ${presupuesto.clienteNombre || 'Sin especificar'}`, 15, 60);
      doc.text(`Dirección: ${presupuesto.clienteDireccion || 'Sin especificar'}`, 15, 66);
      
      const casa = this.viviendas.find(v => v.idVivienda === this.idViviendaSeleccionada);
      doc.text(`Vivienda base: ${casa ? casa.nombre : 'Vivienda actual'}`, 120, 60);

      // Tabla de Mecanismos
      let finalY = 80;
      
      const colsMec = [
        { title: "Mecanismo", dataKey: "nombre" },
        { title: "Habitación", dataKey: "habitacion" },
        { title: "Descripción", dataKey: "descripcion" },
        { title: "Cantidad", dataKey: "cantidad" },
        { title: "Precio U.", dataKey: "precio" },
        { title: "Subtotal", dataKey: "subtotal" }
      ];
      
      const rowsMec = (presupuesto.mecanismos || []).map(m => ({
        nombre: m.nombre,
        habitacion: m.idHabitacion || "General",
        descripcion: m.descripcion || "-",
        cantidad: m.cantidad,
        precio: `${m.precioUnitario.toFixed(2)} €`,
        subtotal: `${(m.cantidad * m.precioUnitario).toFixed(2)} €`
      }));

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("DESGLOSE DE MATERIALES (MECANISMOS)", 15, 78);

      if (rowsMec.length > 0) {
        autoTable(doc, {
          columns: colsMec,
          body: rowsMec,
          startY: 81,
          theme: "striped",
          headStyles: { fillColor: [100, 98, 194], textColor: [255, 255, 255] },
          styles: { fontSize: 8.5 },
          margin: { left: 15, right: 15 }
        });
        finalY = doc.lastAutoTable.finalY + 12;
      } else {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9.5);
        doc.text("No se incluyeron mecanismos en este desglose.", 15, 86);
        finalY = 96;
      }

      // Tabla de Añadidos
      const colsAnad = [
        { title: "Concepto Adicional", dataKey: "concepto" },
        { title: "Cantidad", dataKey: "cantidad" },
        { title: "Precio U.", dataKey: "precio" },
        { title: "Subtotal", dataKey: "subtotal" }
      ];
      
      const rowsAnad = (presupuesto.anadidos || []).map(a => ({
        concepto: a.concepto || "Sin concepto",
        cantidad: a.cantidad,
        precio: `${a.precioUnitario.toFixed(2)} €`,
        subtotal: `${(a.cantidad * a.precioUnitario).toFixed(2)} €`
      }));

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("CONCEPTOS ADICIONALES Y SERVICIOS", 15, finalY - 4);

      if (rowsAnad.length > 0) {
        autoTable(doc, {
          columns: colsAnad,
          body: rowsAnad,
          startY: finalY - 1,
          theme: "striped",
          headStyles: { fillColor: [138, 191, 240], textColor: [255, 255, 255] },
          styles: { fontSize: 8.5 },
          margin: { left: 15, right: 15 }
        });
        finalY = doc.lastAutoTable.finalY + 12;
      } else {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9.5);
        doc.text("Sin conceptos adicionales asociados.", 15, finalY + 3);
        finalY = finalY + 14;
      }

      // Financieros
      const subM = presupuesto.mecanismos ? presupuesto.mecanismos.reduce((s, m) => s + (m.cantidad * m.precioUnitario), 0) : 0;
      const subA = presupuesto.anadidos ? presupuesto.anadidos.reduce((s, a) => s + (a.cantidad * a.precioUnitario), 0) : 0;
      const subG = subM + subA;
      const dtoP = parseFloat(presupuesto.descuento) || 0;
      const dtoV = subG * (dtoP / 100);
      const base = subG - dtoV;
      const ivaP = parseFloat(presupuesto.iva) || 21;
      const ivaV = base * (ivaP / 100);
      const total = base + ivaV;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      
      const summaryX = 140;
      doc.text("Subtotal:", summaryX, finalY);
      doc.text(`${subG.toFixed(2)} €`, 195, finalY, { align: "right" });
      
      doc.text(`Descuento (${dtoP}%):`, summaryX, finalY + 6);
      doc.text(`- ${dtoV.toFixed(2)} €`, 195, finalY + 6, { align: "right" });
      
      doc.text("Base Imponible:", summaryX, finalY + 12);
      doc.text(`${base.toFixed(2)} €`, 195, finalY + 12, { align: "right" });
      
      doc.text(`IVA (${ivaP}%):`, summaryX, finalY + 18);
      doc.text(`${ivaV.toFixed(2)} €`, 195, finalY + 18, { align: "right" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("TOTAL NETO:", summaryX, finalY + 25);
      doc.text(`${total.toFixed(2)} €`, 195, finalY + 25, { align: "right" });

      // Notas
      if (presupuesto.notas || presupuesto.notas === "") {
        const notasTexto = presupuesto.notas || presupuesto.notasText || presupuesto.notes || "";
        if (notasTexto) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text("Observaciones:", 15, finalY);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          const splitNotas = doc.splitTextToSize(notasTexto, 110);
          doc.text(splitNotas, 15, finalY + 6);
        }
      }

      // Footer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 110, 120);
      doc.text("Este presupuesto tiene una validez de 30 días naturales a partir de la fecha de emisión.", 15, 275);
      doc.text("Gracias por confiar en nosotros.", 15, 281);

      const filename = `Presupuesto_${presupuesto.nombre.replace(/\s+/g, "_")}.pdf`;
      doc.save(filename);
    }
  }
};
</script>

<style scoped>
.presupuestos-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 15px 80px 15px;
  text-align: left;
}

/* No Selection State */
.no-selection-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 60px 20px;
  text-align: center;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);
  max-width: 600px;
  margin: 40px auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.no-selection-card h2, .empty-state h3 {
  color: var(--text-color);
  margin-bottom: 10px;
}

.no-selection-card p, .empty-state p {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* List View */
.seccion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.seccion-header h2 {
  color: var(--text-color);
  font-weight: 700;
}

.btn-primary {
  background: linear-gradient(135deg, rgb(109, 180, 247), rgb(74, 151, 237));
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(109, 180, 247, 0.3);
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(109, 180, 247, 0.45);
}

.btn-secondary {
  background-color: var(--card-bg);
  color: rgb(100, 98, 194);
  border: 2px solid rgb(100, 98, 194);
  border-radius: 12px;
  padding: 11px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: var(--dropdown-hover);
  transform: translateY(-1px);
}

/* Empty State */
.empty-state {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 50px 20px;
  text-align: center;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

/* Grid of Cards */
.presupuestos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.presupuesto-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
  position: relative;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
}

.presupuesto-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.07);
}

.card-status-badge {
  position: absolute;
  top: 24px;
  right: 24px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-status-badge.borrador {
  background: #edf2f7;
  color: #4a5568;
}

.card-status-badge.pendiente {
  background: #feebc8;
  color: #c05621;
}

.card-status-badge.aceptado {
  background: #c6f6d5;
  color: #22543d;
}

.card-status-badge.rechazada, .card-status-badge.rechazado {
  background: #fed7d7;
  color: #9b2c2c;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-block;
}

.status-badge.borrador {
  background: #edf2f7;
  color: #4a5568;
}

.status-badge.pendiente {
  background: #feebc8;
  color: #c05621;
}

.status-badge.aceptado {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.rechazada, .status-badge.rechazado {
  background: #fed7d7;
  color: #9b2c2c;
}

.card-header {
  margin-bottom: 16px;
  padding-right: 90px;
}

.card-header h3 {
  margin: 0 0 4px 0;
  font-size: 1.25rem;
  color: var(--text-color);
  font-weight: 700;
}

.card-date {
  font-size: 0.8rem;
  color: #a0aec0;
}

.card-body {
  margin-bottom: 20px;
  flex-grow: 1;
}

.card-body p {
  margin: 6px 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.totals-line {
  margin-top: 15px;
  padding-top: 12px;
  border-top: 1px dashed var(--card-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-weight: 600;
  color: #718096;
}

.total-value {
  font-size: 1.3rem;
  font-weight: 800;
  color: rgb(100, 98, 194);
}

.card-footer {
  display: flex;
  gap: 8px;
}

.btn-card-edit {
  flex-grow: 1;
  background-color: rgba(43, 108, 176, 0.15);
  color: #3182ce;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-card-edit:hover {
  background-color: rgba(43, 108, 176, 0.25);
}

.btn-card-pdf {
  background-color: rgba(34, 84, 61, 0.15);
  color: #38a169;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-card-pdf:hover {
  background-color: rgba(34, 84, 61, 0.25);
}

.btn-card-delete {
  background-color: rgba(197, 48, 48, 0.15);
  color: #e53e3e;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-card-delete:hover {
  background-color: rgba(197, 48, 48, 0.25);
}

/* Detail Editor View */
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 15px;
  flex-wrap: wrap;
}

.btn-back {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  padding: 8px 0;
  transition: color 0.2s;
}

.btn-back:hover {
  color: rgb(100, 98, 194);
}

.editor-header-details {
  display: flex;
  align-items: center;
  gap: 12px;
}

.editor-header-details h2 {
  margin: 0;
  color: var(--text-color);
  font-weight: 750;
}

.editor-actions {
  display: flex;
  gap: 12px;
}

/* Form Card */
.editor-form-card, .editor-table-card, .summary-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
}

.editor-form-card h3, .editor-table-card h3, .summary-card h3 {
  margin: 0 0 20px 0;
  color: var(--text-color);
  font-size: 1.15rem;
  font-weight: 700;
  border-left: 4px solid rgb(100, 98, 194);
  padding-left: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.span-all {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-group input, .form-group select, .form-group textarea {
  border: 1px solid var(--input-border);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.95rem;
  outline: none;
  background: var(--input-bg);
  color: var(--text-color);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  border-color: rgb(138, 191, 240);
  box-shadow: 0 0 0 3px rgba(138, 191, 240, 0.15);
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

/* Tables Section */
.card-header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header-with-action h3 {
  margin: 0;
}

.btn-small-add {
  background-color: rgba(43, 108, 176, 0.15);
  color: #3182ce;
  border: 1px solid rgba(43, 108, 176, 0.2);
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-small-add:hover {
  background-color: #3182ce;
  color: white;
}

.table-container {
  overflow-x: auto;
  border: 1px solid var(--card-border);
  border-radius: 12px;
}

.editor-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.editor-table th {
  background-color: var(--input-bg);
  padding: 12px 16px;
  font-weight: 600;
  color: var(--text-color);
  border-bottom: 1px solid var(--card-border);
}

.editor-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--card-border);
  color: var(--text-color);
}

.editor-table tbody tr:last-child td {
  border-bottom: none;
}

.font-bold {
  font-weight: 700;
}

.text-secondary {
  color: #718096;
}

.text-center {
  text-align: center;
}

.italic {
  font-style: italic;
}

/* Room Tag */
.room-tag {
  background-color: rgba(43, 108, 176, 0.15);
  color: #3182ce;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Quantity buttons in table */
.quantity-input-container {
  display: flex;
  align-items: center;
  border: 1px solid var(--input-border);
  border-radius: 6px;
  overflow: hidden;
  max-width: 110px;
}

.btn-qty-minus, .btn-qty-plus {
  background: var(--input-bg);
  color: var(--text-color);
  border: none;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-qty-minus:hover, .btn-qty-plus:hover {
  background: var(--dropdown-hover);
}

.qty-input {
  width: 40px;
  border: none;
  background: var(--input-bg);
  color: var(--text-color);
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  outline: none;
  -moz-appearance: textfield;
}

.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Price inputs in table */
.price-input-container {
  display: flex;
  align-items: center;
  border: 1px solid var(--input-border);
  border-radius: 6px;
  padding: 0 8px;
  max-width: 120px;
  background: var(--input-bg);
}

.price-input {
  background: transparent;
  color: var(--text-color);
  border: none;
  width: 100%;
  padding: 5px 0;
  font-size: 0.9rem;
  font-weight: 600;
  outline: none;
}

.euro-symbol {
  color: #a0aec0;
  font-weight: 600;
}

.table-text-input {
  width: 100%;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-color);
  border-radius: 6px;
  padding: 6px 10px;
  outline: none;
}

.table-text-input:focus {
  border-color: rgb(138, 191, 240);
}

.btn-row-delete {
  background: #fff5f5;
  color: #c53030;
  border: 1px solid rgba(197, 48, 48, 0.2);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.2s;
}

.btn-row-delete:hover {
  background: #c53030;
  color: white;
}

/* Summary Box */
.summary-and-notes-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media(min-width: 768px) {
  .summary-and-notes-grid {
    grid-template-columns: 380px;
    justify-content: end;
  }
}

.summary-card {
  margin-top: 10px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 0.95rem;
  color: var(--text-color);
}

.summary-line.align-items-center {
  align-items: center;
}

.border-top {
  border-top: 1px solid var(--card-border);
  padding-top: 14px;
  margin-top: 4px;
}

.text-red {
  color: #e53e3e;
}

.summary-number-input {
  width: 70px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-color);
  border-radius: 6px;
  padding: 5px 8px;
  text-align: right;
  font-weight: 600;
  outline: none;
}

.summary-number-input:focus {
  border-color: rgb(138, 191, 240);
}

.total-highlight {
  border-top: 2px solid rgb(100, 98, 194);
  padding: 16px 0 8px 0;
  margin-top: 8px;
  font-weight: 800;
  font-size: 1.25rem;
  color: rgb(100, 98, 194);
}

/* Popup Nuevo Presupuesto */
#blur-nuevo-presupuesto {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 100;
  display: none;
}

#blur-nuevo-presupuesto.active {
  display: block;
}

#popup-nuevo-presupuesto {
  position: fixed;
  background-color: var(--popup-bg);
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 20px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);
  width: 420px;
  overflow: hidden;
}

#titulo-nuevo-presupuesto {
  background-color: rgb(138, 191, 240);
  padding: 20px;
  color: white;
  font-size: 1.35rem;
  font-weight: 700;
  text-align: center;
}

.popup-body-presupuesto {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
}

.form-group-popup {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.form-group-popup-half {
  display: flex;
  gap: 16px;
  text-align: left;
}

.half-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group-popup label, .half-field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-group-popup input, .half-field input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 0.95rem;
  outline: none;
}

.form-group-popup input:focus, .half-field input:focus {
  border-color: rgb(138, 191, 240);
}

.popup-info-msg {
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: var(--input-bg);
  padding: 10px 14px;
  border-radius: 8px;
  border-left: 3px solid rgb(138, 191, 240);
  margin: 0;
  line-height: 1.4;
  text-align: left;
}

.popup-buttons-presupuesto {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.popup-buttons-presupuesto button {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.btn-cancelar-presupuesto {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn-cancelar-presupuesto:hover {
  background-color: #e5e7eb;
}

.btn-guardar-presupuesto {
  background-color: rgb(109, 180, 247);
  color: white;
}

.btn-guardar-presupuesto:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-guardar-presupuesto:hover:not(:disabled) {
  background-color: rgb(74, 151, 237);
}

/* Responsive Table */
@media (max-width: 768px) {
  .editor-table th, .editor-table td {
    padding: 8px;
    font-size: 0.8rem;
  }
  .quantity-input-container {
    max-width: 90px;
  }
  .btn-qty-minus, .btn-qty-plus {
    width: 24px;
    height: 24px;
  }
  .qty-input {
    width: 30px;
  }
  .price-input-container {
    max-width: 90px;
  }
}
</style>
