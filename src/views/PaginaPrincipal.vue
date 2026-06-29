<template>
    <div id="rooms">
        <span class="roomOpt" :class="{ roomOptActive: habitacionSeleccionada === null }" @click="habitacionSeleccionada = null">
            General
        </span>
        <span v-for="hab in habitaciones" :key="hab.idHabitacion" class="roomOpt" :class="{ roomOptActive: habitacionSeleccionada === Number(hab.idHabitacion) }" @click="habitacionSeleccionada = Number(hab.idHabitacion)">
            {{ hab.nombre }}
            <span class="room-delete" @click.stop="eliminarHabitacion(hab.idHabitacion)">&times;</span>
        </span>
        <span v-if="!creandoHabitacion" class="roomOpt room-add" @click="creandoHabitacion = true">+</span>
        <span v-else class="room-input-wrapper">
            <input type="text" v-model="nuevaHabitacionNombre" placeholder="Nombre..." class="room-input" @keyup.enter="guardarHabitacion" ref="roomInput" />
            <button class="room-input-btn" @click="guardarHabitacion">&#10003;</button>
            <button class="room-input-btn room-input-cancel" @click="cancelarHabitacion">&times;</button>
        </span>
    </div>

    <div id="mecanismos">
        <div class="mecanismo" v-for="mecanismo in mecanismosFiltrados" :key="mecanismo.idMecanismo">
            <img src="../assets/editarM.png" alt="Editar" width="18px" class="editar" @click="prepararEdicion(mecanismo)"/>
            <h3 class="titulo">{{ mecanismo.nombre }}</h3>
            <img src="../assets/borrar.png" alt="Borrar" width="18px" class="borrar" @click="eliminarMecanismo(mecanismo.idMecanismo)" />
            <h3 class="desc">{{ mecanismo.descripcion }}</h3>
            <div class="mecanismo-img-container">
                <img :src="getMecanismoImagen(mecanismo)" alt="Imagen de mecanismo" class="mecanismo-img" />
            </div>
            <h3>Precio Unitario: {{ (parseFloat(mecanismo.precioUnitario) || 0).toFixed(2) }}€</h3>
            <h3>Total: {{ ((parseFloat(mecanismo.precioUnitario) || 0) * (mecanismo.cantidad || 0)).toFixed(2) }}€</h3>
            <h3>
                <button class="minus" @click="actualizarCantidad(mecanismo, -1)">-</button> {{ mecanismo.cantidad }}
                <button class="plus" @click="actualizarCantidad(mecanismo, 1)">+</button>
            </h3>
        </div>
    </div>
    <img src="../assets/anyadirM.png" alt="Añadir" @click="prepararAnyadir" id="anyadirMecanismo"/>
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <div id="blur" :class="{ active: popupVisible }">
        <div id="popup">
             <!-- Popup para anyadir mecanismos -->
             <div v-if="!editando" id="titulo">Añadir mecanismo</div>
             <div v-if="editando" id="titulo">Editar mecanismo</div>
             <div class="popup-body">
                 <!-- Plantillas rápidas -->
                 <div v-if="!editando" class="plantillas-seccion">
                     <p class="plantilla-titulo">Plantillas rápidas</p>
                     <div class="plantillas-grid">
                         <button 
                             type="button" 
                             class="btn-plantilla" 
                             v-for="t in plantillas" 
                             :key="t.id" 
                             @click="seleccionarPlantilla(t)"
                             :class="{ active: plantillaSeleccionada === t.id }"
                         >
                             <span class="plantilla-label">{{ t.label }}</span>
                         </button>
                     </div>
                 </div>

                 <p>Nombre</p>
                 <input type="text" placeholder="Ej. Enchufe simple" v-model="nombreAnyadir" @input="comprobarPlantillaManual"/>
                 <p>Descripción</p>
                 <input type="text" placeholder="Ej. Marca Legrand" v-model="descripcionAnyadir" @input="comprobarPlantillaManual"/>
                 <p>Precio</p>
                 <div class="precio-container">
                     <input type="text" placeholder="Ej. 4" v-model="precioAnyadir" @input="comprobarPlantillaManual"/>
                     <span class="currency">€</span>
                 </div>
                 <p>Cantidad</p>
                 <input type="text" placeholder="Ej. 1" v-model="cantidadAnyadir"/>
                 <p>Imagen</p>
                 <div class="upload-container">
                     <input type="file" ref="fileInput" @change="onFileChange" accept="image/*" style="display: none;" />
                     <button type="button" class="btn-upload" @click="$refs.fileInput.click()">
                         Seleccionar Imagen
                     </button>
                     <div v-if="fotoPreview" class="preview-container">
                         <img :src="fotoPreview" alt="Vista previa" class="image-preview" />
                         <button type="button" class="btn-remove-image" @click="removeImage">×</button>
                     </div>
                 </div>
                 <p id="error">{{ error }}</p>
                 <div class="popup-buttons">
                     <button id="btn-cancelar" @click="cerrarPopup">Cancelar</button>
                     <button v-if="!editando" id="btn-guardar" :disabled="!puedeGuardar" @click="guardarMecanismo">Guardar</button>
                     <button v-if="editando" id="btn-guardar" :disabled="!puedeGuardar" @click="actualizarMecanismo(mecanismoEditado)">Actualizar</button>
                 </div>
             </div>
        </div>
    </div>
    <footer>
        <h3 id="cantidadMecanismos">Mecanismos: {{ mecanismosFiltrados.length }}</h3>
        <h3 id="aproxFinal">Precio aproximado: {{ precioAproxFinal.toFixed(2) }}€</h3>
    </footer>
</template>

<script>
import defaultImagen from "@/assets/enchufe.png";
import svgEnchufe from "@/assets/enchufe.svg";
import svgInterruptor from "@/assets/interruptor.svg";
import svgConmutador from "@/assets/conmutador.svg";
import svgCruzamiento from "@/assets/cruzamiento.svg";
import svgPulsador from "@/assets/pulsador.svg";
import svgRJ45 from "@/assets/rj45.svg";
import svgTV from "@/assets/tv.svg";

export default {
    data() {
        return {
            mecanismos: [],
            nombreAnyadir: "",
            descripcionAnyadir: "",
            precioAnyadir: null,
            cantidadAnyadir: null,
            fotoAnyadir: "",
            fotoPreview: "",
            error: "",
            popupVisible: false,
            defaultImagen,
            editando: false,
            mecanismoEditado: null,
            habitaciones: [],
            habitacionSeleccionada: null,
            creandoHabitacion: false,
            nuevaHabitacionNombre: "",
            plantillaSeleccionada: null,
            plantillas: [
                { id: "enchufe", label: "Enchufe", nombre: "Enchufe simple", descripcion: "Toma de corriente Schuko 16A", precio: 4.50, imagen: svgEnchufe },
                { id: "interruptor", label: "Interruptor", nombre: "Interruptor simple", descripcion: "Interruptor monopolar 10AX", precio: 3.80, imagen: svgInterruptor },
                { id: "conmutador", label: "Conmutador", nombre: "Conmutador", descripcion: "Conmutador simple 10AX", precio: 4.20, imagen: svgConmutador },
                { id: "cruzamiento", label: "Cruzamiento", nombre: "Cruzamiento", descripcion: "Cruzamiento 10AX", precio: 5.90, imagen: svgCruzamiento },
                { id: "pulsador", label: "Pulsador", nombre: "Pulsador", descripcion: "Pulsador campana/luz 10A", precio: 4.00, imagen: svgPulsador },
                { id: "rj45", label: "Toma RJ45", nombre: "Toma RJ45", descripcion: "Toma de datos Cat6 UTP", precio: 7.50, imagen: svgRJ45 },
                { id: "tv", label: "Toma TV", nombre: "Toma TV", descripcion: "Toma de televisión intermedia", precio: 5.20, imagen: svgTV },
                { id: "marco_simple", label: "Marco 1", nombre: "Marco simple", descripcion: "Marco de 1 elemento", precio: 2.00, imagen: defaultImagen },
                { id: "marco_doble", label: "Marco 2", nombre: "Marco doble", descripcion: "Marco de 2 elementos", precio: 3.00, imagen: defaultImagen },
                { id: "marco_triple", label: "Marco 3", nombre: "Marco triple", descripcion: "Marco de 3 elementos", precio: 4.00, imagen: defaultImagen },
                { id: "marco_cuadruple", label: "Marco 4", nombre: "Marco cuádruple", descripcion: "Marco de 4 elementos", precio: 5.00, imagen: defaultImagen },
                { id: "interruptor_persiana", label: "Persiana", nombre: "Interruptor persiana", descripcion: "Mecanismo para persianas", precio: 8.50, imagen: svgInterruptor },
                { id: "doble_conmutador", label: "Doble Conm.", nombre: "Doble conmutador", descripcion: "Doble conmutador 10AX", precio: 7.20, imagen: svgConmutador }
            ]
        }
    },
    props: {
        idViviendaSeleccionada: Number,
        token: String,
    },
    emits: ["confirmar", "alertar"],
    watch: {
        idViviendaSeleccionada: {
            immediate: true,
            handler() {
                this.cargarMecanismos();
                this.cargarHabitaciones();
            }
        }
    },
    computed: {
        puedeGuardar() {
            return this.nombreAnyadir && this.descripcionAnyadir && this.precioAnyadir && this.cantidadAnyadir;
        },
        mecanismosFiltrados() {
            if (this.habitacionSeleccionada === null) {
                // General: mostrar TODOS los mecanismos de la vivienda
                return this.mecanismos;
            }
            // Habitación específica: mostrar solo los de esa habitación
            return this.mecanismos.filter(m => m.idHabitacion === this.habitacionSeleccionada);
        },
        precioAproxFinal() {
            return this.mecanismos.reduce((sum, m) => sum + ((parseFloat(m.precioUnitario) || 0) * (parseInt(m.cantidad) || 0)), 0);
        },
    },
    methods: {
        cargarMecanismos() {
            if (!this.idViviendaSeleccionada || !this.token) {
                this.mecanismos = [];
                return;
            }
            fetch(`${window.API_URL}/mecanismos?idVivienda=${this.idViviendaSeleccionada}`, {
                headers: {
                    "Authorization": `Bearer ${this.token}`
                }
            })
                .then(res => {
                    if (!res.ok) throw new Error("Error en servidor al obtener los mecanismos");
                    return res.json();
                })
                .then(data => {
                    this.mecanismos = data;
                })
                .catch(err => {
                    console.error("Error al cargar mecanismos:", err);
                });
        },
        onFileChange(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                this.fotoAnyadir = event.target.result;
                this.fotoPreview = event.target.result;
            };
            reader.readAsDataURL(file);
        },
        removeImage() {
            this.fotoAnyadir = "";
            this.fotoPreview = "";
            if (this.$refs.fileInput) {
                this.$refs.fileInput.value = "";
            }
        },
        cerrarPopup() {
            this.popupVisible = false;
            this.nombreAnyadir = "";
            this.descripcionAnyadir = "";
            this.precioAnyadir = null;
            this.cantidadAnyadir = null;
            this.fotoAnyadir = "";
            this.fotoPreview = "";
            this.error = "";
            this.plantillaSeleccionada = null;
            if (this.$refs.fileInput) {
                this.$refs.fileInput.value = "";
            }
        },
        cargarHabitaciones() {
            if (!this.idViviendaSeleccionada || !this.token) { this.habitaciones = []; return; }
            fetch(`${window.API_URL}/habitaciones?idVivienda=${this.idViviendaSeleccionada}`, {
                headers: { "Authorization": `Bearer ${this.token}` }
            })
            .then(r => r.json())
            .then(data => { 
                this.habitaciones = Array.isArray(data) ? data : [];
                this.habitacionSeleccionada = null;
            })
            .catch((err) => { 
                console.error("Error al cargar habitaciones:", err);
                this.habitaciones = []; 
            });
        },
        guardarHabitacion() {
            const nombre = this.nuevaHabitacionNombre.trim();
            if (!nombre) return;
            fetch(`${window.API_URL}/habitaciones`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${this.token}` },
                body: JSON.stringify({ nombre, idVivienda: this.idViviendaSeleccionada })
            })
            .then(r => r.json())
            .then(hab => {
                this.habitaciones.push(hab);
                this.nuevaHabitacionNombre = "";
                this.creandoHabitacion = false;
            })
            .catch(() => {});
        },
        eliminarHabitacion(id) {
            const idNum = Number(id);

            fetch(`${window.API_URL}/habitaciones/${idNum}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${this.token}` }
            })
            .then(res => {
                if (!res.ok) throw new Error("Error del servidor al eliminar habitación");
                return res.json();
            })
            .then(() => {
                this.habitaciones = this.habitaciones.filter(h => Number(h.idHabitacion) !== idNum);
                if (this.habitacionSeleccionada === idNum) {
                    this.habitacionSeleccionada = null;
                }
            })
            .catch((err) => {
                console.error("Error al eliminar habitación:", err);
                alert("No se pudo eliminar la habitación. Intenta nuevamente.");
            });
        },
        guardarMecanismo() {
            if (!this.puedeGuardar) return;
            const nuevoMecanismo = {
                nombre: this.nombreAnyadir,
                descripcion: this.descripcionAnyadir,
                precioUnitario: parseFloat(this.precioAnyadir),
                cantidad: parseInt(this.cantidadAnyadir),
                foto: this.fotoAnyadir || null,
                idVivienda: this.idViviendaSeleccionada,
                idHabitacion: this.habitacionSeleccionada
            };
            fetch(`${window.API_URL}/mecanismos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.token}`
                },
                body: JSON.stringify(nuevoMecanismo)
            })
            .then(res => {
                if (!res.ok) throw new Error("Error al guardar en el servidor");
                return res.json();
            })
            .then(data => {
                this.mecanismos.push(data);
                this.cerrarPopup();
            })
            .catch(err => {
                this.error = "No se pudo guardar el mecanismo: " + err.message;
            });
        },
        actualizarCantidad(mecanismo, cambio) {
            const nuevaCantidad = mecanismo.cantidad + cambio;
            if (nuevaCantidad < 1) return;
            fetch(`${window.API_URL}/mecanismos/${mecanismo.idMecanismo}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.token}`
                },
                body: JSON.stringify({ cantidad: nuevaCantidad })
            })
            .then(res => {
                if (!res.ok) throw new Error("Error al actualizar la cantidad");
                mecanismo.cantidad = nuevaCantidad;
            })
            .catch(err => {
                this.$emit("alertar", "No se pudo actualizar la cantidad: " + err.message);
            });
        },
        eliminarMecanismo(id) {
            this.$emit("confirmar", {
                mensaje: "¿Estás seguro de que deseas eliminar este mecanismo?",
                callback: () => {
                    fetch(`${window.API_URL}/mecanismos/${id}`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${this.token}`
                        }
                    })
                    .then(res => {
                        if (!res.ok) throw new Error("Error al eliminar del servidor");
                        this.mecanismos = this.mecanismos.filter(m => m.idMecanismo !== id);
                    })
                    .catch(err => {
                        this.$emit("alertar", "No se pudo eliminar el mecanismo: " + err.message);
                    });
                }
            });
        },
        editarMecanismo(mecanismo) {
            this.popupVisible = true;
            this.nombreAnyadir = mecanismo.nombre;
            this.descripcionAnyadir = mecanismo.descripcion;
            this.precioAnyadir = mecanismo.precioUnitario;
            this.cantidadAnyadir = mecanismo.cantidad;
            this.fotoAnyadir = mecanismo.foto;
            this.fotoPreview = mecanismo.foto;
            this.plantillaSeleccionada = null;
        },
        actualizarMecanismo(id) {
            if (!this.puedeGuardar) return;
            fetch(`${window.API_URL}/mecanismos/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    nombre: this.nombreAnyadir,
                    descripcion: this.descripcionAnyadir,
                    precioUnitario: parseFloat(this.precioAnyadir),
                    cantidad: parseInt(this.cantidadAnyadir),
                    foto: this.fotoAnyadir || null,
                    idVivienda: this.idViviendaSeleccionada
                })
            })
            .then(res => {
                if (!res.ok) throw new Error("Error al guardar en el servidor");
                return res.json();
            })
            .then(() => {
                const mecanismo = this.mecanismos.find(m => m.idMecanismo === id);
                if (mecanismo) {
                    mecanismo.nombre = this.nombreAnyadir;
                    mecanismo.descripcion = this.descripcionAnyadir;
                    mecanismo.precioUnitario = parseFloat(this.precioAnyadir);
                    mecanismo.cantidad = parseInt(this.cantidadAnyadir);
                    mecanismo.foto = this.fotoAnyadir || null;
                }
                this.cerrarPopup();
            })
            .catch(err => {
                this.$emit("alertar", "No se pudo guardar el mecanismo: " + err.message);
            });
        },
        seleccionarPlantilla(plantilla) {
            if (this.plantillaSeleccionada === plantilla.id) {
                this.plantillaSeleccionada = null;
                this.nombreAnyadir = "";
                this.descripcionAnyadir = "";
                this.precioAnyadir = null;
                this.cantidadAnyadir = null;
            } else {
                this.plantillaSeleccionada = plantilla.id;
                this.nombreAnyadir = plantilla.nombre;
                this.descripcionAnyadir = plantilla.descripcion;
                this.precioAnyadir = plantilla.precio;
                if (!this.cantidadAnyadir) {
                    this.cantidadAnyadir = 1;
                }
            }
        },
        comprobarPlantillaManual() {
            if (this.plantillaSeleccionada) {
                const plantilla = this.plantillas.find(p => p.id === this.plantillaSeleccionada);
                if (plantilla) {
                    if (this.nombreAnyadir !== plantilla.nombre ||
                        this.descripcionAnyadir !== plantilla.descripcion ||
                        parseFloat(this.precioAnyadir) !== plantilla.precio) {
                        this.plantillaSeleccionada = null;
                    }
                }
            }
        },
        getMecanismoImagen(mecanismo) {
            if (mecanismo.foto) {
                return mecanismo.foto;
            }
            const nombre = (mecanismo.nombre || "").toLowerCase();
            if (nombre.includes("enchufe") || nombre.includes("toma corriente")) {
                const p = this.plantillas.find(pl => pl.id === "enchufe");
                return p ? p.imagen : this.defaultImagen;
            }
            if (nombre.includes("conmutador")) {
                const p = this.plantillas.find(pl => pl.id === "conmutador");
                return p ? p.imagen : this.defaultImagen;
            }
            if (nombre.includes("cruzamiento")) {
                const p = this.plantillas.find(pl => pl.id === "cruzamiento");
                return p ? p.imagen : this.defaultImagen;
            }
            if (nombre.includes("pulsador")) {
                const p = this.plantillas.find(pl => pl.id === "pulsador");
                return p ? p.imagen : this.defaultImagen;
            }
            if (nombre.includes("rj45") || nombre.includes("datos") || nombre.includes("red") || nombre.includes("ethernet")) {
                const p = this.plantillas.find(pl => pl.id === "rj45");
                return p ? p.imagen : this.defaultImagen;
            }
            if (nombre.includes("tv") || nombre.includes("television") || nombre.includes("satelite") || nombre.includes("sat")) {
                const p = this.plantillas.find(pl => pl.id === "tv");
                return p ? p.imagen : this.defaultImagen;
            }
            if (nombre.includes("interruptor") || nombre.includes("llave")) {
                const p = this.plantillas.find(pl => pl.id === "interruptor");
                return p ? p.imagen : this.defaultImagen;
            }
            return this.defaultImagen;
        },
        anyadirMecanismo() {
            this.popupVisible = true;
        },
        prepararEdicion(mecanismo) {
            this.editando = true;
            this.mecanismoEditado = mecanismo.idMecanismo;
            this.editarMecanismo(mecanismo);
        },
        prepararAnyadir() {
            this.popupVisible = true;
            this.editando = false;
        },
        cancelarHabitacion() {
            this.creandoHabitacion = false;
            this.nuevaHabitacionNombre = "";
        }
    },
    mounted() {
        // Carga inicial controlada por el watch immediate
    }
}

</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}
#rooms {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 50px;
    padding: 20px;
}
h3 {
    display: inline-block;
}

footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    box-sizing: border-box;
    text-align: center;
    padding: 1%;
    background-color: var(--footer-bg);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    z-index: 0;
    color: var(--text-color);
}

#mecanismos {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
    width: 100%;
    box-sizing: border-box;
}

.mecanismo {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 1px solid var(--card-border);
    background: var(--card-bg);
    border-radius: 20px;
    width: 220px;
    text-align: center;
    padding: 20px 16px;
    box-shadow: var(--card-shadow);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.mecanismo:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
}

.mecanismo-img-container {
    border-radius: 12px;
    background-color: var(--input-bg);
    padding: 10px;
    border: 1px solid var(--card-border);
    margin: 8px 0;
    width: 200px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}

.mecanismo h3 {
    margin: 4px 0;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-secondary);
}

.mecanismo .titulo {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color);
    padding-top: 10%;
}

.desc {
}

.mecanismo .minus,
.mecanismo .plus {
    border-radius: 50%;
    border: none;
    width: 32px;
    height: 32px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.15s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.mecanismo .minus {
    background-color: #fce4e4;
    color: #d64545;
    margin-right: 10px;
}

.mecanismo .minus:hover {
    background-color: #f8c4c4;
    transform: scale(1.1);
}

.mecanismo .plus {
    background-color: #dff5e3;
    color: #2d8a4e;
    margin-left: 10px;
}

.mecanismo .plus:hover {
    background-color: #c3eacc;
    transform: scale(1.1);
}

.roomOpt {
    position: relative;
    cursor: pointer;
    text-decoration: none;
    padding: 6px 12px;
    border-radius: 8px;
    transition: background-color 0.2s ease, color 0.2s ease;
    color: var(--text-secondary);
}

.roomOpt::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--text-color);
    transform: scaleX(0);
    transition: transform 0.3s ease;
}

.roomOpt:hover::after {
    transform: scaleX(1);
}

.roomOptActive {
    background-color: rgba(109, 180, 247, 0.15);
    color: rgb(74, 151, 237);
    font-weight: 700;
}

.roomOptActive::after {
    transform: scaleX(1);
    background-color: rgb(74, 151, 237);
}

.editar {
    position: absolute;
    top: 10px;
    left: 12px;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    opacity: 0;
    transition: background-color 0.2s ease, opacity 0.2s ease;
}

.editar:hover {
    background-color: rgba(59, 130, 246, 0.25);
}

.borrar {
    position: absolute;
    top: 10px;
    right: 12px;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    opacity: 0;
    transition: background-color 0.2s ease, opacity 0.2s ease;
}

.borrar:hover {
    background-color: rgba(220, 38, 38, 0.25);
}

.mecanismo:hover .editar,
.mecanismo:hover .borrar {
    opacity: 1;
}

#popup {
    position: fixed;
    background-color: var(--popup-bg);
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 20px;
    box-shadow: var(--card-shadow);
    border: 1px solid var(--card-border);
    width: 380px;
    overflow: hidden;
    z-index: 100000;
}

#titulo {
    background-color: rgb(138, 191, 240);
    padding: 20px;
    color: white;
    font-size: 1.35rem;
    font-weight: 700;
    text-align: center;
}

.popup-body {
    padding: 24px;
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: 16px 12px;
    align-items: center;
}

.popup-body p {
    margin: 0;
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.95rem;
    text-align: left;
}

.popup-body input {
    width: 100%;
    box-sizing: border-box;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid var(--input-border);
    background-color: var(--input-bg);
    color: var(--text-color);
    font-size: 0.95rem;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
}

.popup-body input:focus {
    border-color: rgb(138, 191, 240);
    box-shadow: 0 0 0 3px rgba(138, 191, 240, 0.25);
}

.popup-buttons {
    grid-column: 1 / -1;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 10px;
}

.popup-buttons button {
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

#btn-cancelar {
    background-color: #f3f4f6;
    color: #4b5563;
}

#btn-cancelar:hover {
    background-color: #e5e7eb;
    cursor: pointer;
}

#btn-guardar {
    background-color: rgb(109, 180, 247);
    color: white;
}

#btn-guardar:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

#btn-guardar:hover:not(:disabled) {
    cursor: pointer;
}

#btn-guardar:hover {
    
}

#blur {
    position: fixed;
    background-color: rgba(255, 255, 255, 0.182);
    backdrop-filter: blur(10px);
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    cursor: default;
    display: none;
    z-index: 9999;
}

#blur.active {
    display: block;
}

.precio-container {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
}

.precio-container input {
    flex: 1;
    min-width: 0;
}

.currency {
    font-weight: 600;
    color: #4a5568;
    font-size: 1.1rem;
}

#error {
    grid-column: 1 / -1;
    color: red;
    font-size: 0.8rem;
    text-align: left;
}

#anyadirMecanismo{
    border-radius: 50%;
    border: none;
    width: 50px;
    height: 50px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    bottom: 15%;
    right: 2%;
    transition: opacity 0.2s ease, transform 0.2s ease;
    transform: scale(1);
}

#anyadirMecanismo:hover {
    cursor: pointer;
    opacity: 0.85;
    transform: scale(1.15);
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

.mecanismo-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 8px;
}

/* ===== MOBILE RESPONSIVE ===== */
@media (max-width: 640px) {
    #rooms {
        gap: 12px;
        padding: 12px 8px;
        flex-wrap: wrap;
    }

    .roomOpt {
        font-size: 0.85rem;
        padding: 5px 10px;
    }

    #mecanismos {
        justify-content: center;
        gap: 12px;
        padding: 12px 8px;
    }

    .mecanismo {
        width: calc(50% - 18px);
        min-width: 140px;
        padding: 14px 10px;
        border-radius: 16px;
    }

    .mecanismo .titulo {
        font-size: 1.1rem;
        padding-top: 6%;
    }

    .mecanismo h3 {
        font-size: 0.78rem;
    }

    .mecanismo .minus,
    .mecanismo .plus {
        width: 28px;
        height: 28px;
        font-size: 0.95rem;
    }

    .mecanismo .minus {
        margin-right: 6px;
    }

    .mecanismo .plus {
        margin-left: 6px;
    }

    .mecanismo-img {
        max-width: 120px;
        height: 100px;
    }

    .editar,
    .borrar {
        opacity: 0.7;
    }

    #anyadirMecanismo {
        width: 48px !important;
        height: 48px !important;
        bottom: 100px;
        right: 16px;
    }

    #popup {
        width: calc(100% - 32px);
        max-width: 380px;
    }

    .popup-body {
        padding: 16px;
        grid-template-columns: 1fr;
        gap: 10px;
    }

    .popup-body p {
        font-size: 0.85rem;
    }

    #titulo {
        padding: 16px;
        font-size: 1.15rem;
    }

    .popup-buttons {
        justify-content: stretch;
    }

    .popup-buttons button {
        flex: 1;
        padding: 10px 12px;
        font-size: 0.9rem;
    }

    footer {
        padding: 8px 12px;
        flex-direction: column;
        gap: 4px;
    }

    footer h3 {
        font-size: 0.8rem;
    }
}

@media (max-width: 360px) {
    .mecanismo {
        width: 100%;
    }

    #rooms {
        gap: 8px;
    }

    .roomOpt {
        font-size: 0.8rem;
        padding: 4px 8px;
    }
}

/* ===== PLANTILLAS CSS ===== */
.plantillas-seccion {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 4px;
    background: rgba(247, 250, 252, 0.6);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 12px;
    padding: 12px;
}

.plantilla-titulo {
    font-size: 0.85rem;
    font-weight: 700;
    color: #4a5568;
    text-align: left;
    margin: 0;
}

.plantillas-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
}

.btn-plantilla {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px 4px;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    outline: none;
}

.btn-plantilla:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.btn-plantilla:active {
    transform: translateY(0);
}

.btn-plantilla.active {
    background: linear-gradient(135deg, rgba(109, 180, 247, 0.15), rgba(74, 151, 237, 0.15));
    border-color: rgb(109, 180, 247);
    color: rgb(74, 151, 237);
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(109, 180, 247, 0.25);
}

.plantilla-icono {
    font-size: 1.25rem;
    margin-bottom: 4px;
}

.plantilla-label {
    font-size: 0.72rem;
    font-weight: 600;
    color: #4a5568;
}

.btn-plantilla.active .plantilla-label {
    color: rgb(59, 130, 246);
}

/* Ajustes responsivos para rejilla */
@media (max-width: 640px) {
    .plantillas-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* ===== ROOMS EDITING ===== */
.roomOpt {
    position: relative;
}

.room-delete {
    display: none;
    margin-left: 4px;
    font-size: 0.85rem;
    color: #e53e3e;
    cursor: pointer;
    font-weight: 700;
}

.roomOpt:hover .room-delete {
    display: inline;
}

.room-add {
    font-size: 1.2rem;
    font-weight: 700;
    color: rgb(74, 151, 237);
    padding: 4px 12px;
}

.room-input-wrapper {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.room-input {
    width: 100px;
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid var(--input-border);
    background: var(--input-bg);
    color: var(--text-color);
    font-size: 0.85rem;
    outline: none;
}

.room-input:focus {
    border-color: rgb(109, 180, 247);
    box-shadow: 0 0 0 2px rgba(109, 180, 247, 0.25);
}

.room-input-btn {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 700;
    color: #2d8a4e;
    padding: 2px 6px;
}

.room-input-cancel {
    color: #e53e3e;
}
</style>