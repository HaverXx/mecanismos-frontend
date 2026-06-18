<template>
    <div id="rooms">
        <span class="roomOpt" :class="{ roomOptActive: habitacionSeleccionada === null }" @click="habitacionSeleccionada = null">
            General
        </span>
        <span v-for="habitacion in habitaciones" :key="habitacion" class="roomOpt" :class="{ roomOptActive: habitacionSeleccionada === habitacion }" @click="habitacionSeleccionada = habitacion">{{ habitacion }}</span>
    </div>

    <div id="mecanismos">
        <div class="mecanismo" v-for="mecanismo in mecanismosFiltrados" :key="mecanismo.idMecanismo">
            <img src="../assets/editarM.png" alt="Editar" width="10px" class="editar" @click="editarMecanismo(mecanismo), this.editando = true, mecanismoEditado = mecanismo.idMecanismo"/>
            <h3 class="titulo">{{ mecanismo.nombre }}</h3>
            <img src="../assets/borrar.png" alt="Borrar" width="10px" class="borrar" @click="eliminarMecanismo(mecanismo.idMecanismo)" />
            <h3 class="desc">{{ mecanismo.descripcion }}</h3>
            <img :src="mecanismo.foto || defaultImagen" alt="Imagen de mecanismo" width="200px" class="mecanismo-img" />
            <h3>Precio Unitario: {{ (parseFloat(mecanismo.precioUnitario) || 0).toFixed(2) }}€</h3>
            <h3>Total: {{ ((parseFloat(mecanismo.precioUnitario) || 0) * (mecanismo.cantidad || 0)).toFixed(2) }}€</h3>
            <h3>
                <button class="minus" @click="actualizarCantidad(mecanismo, -1)">-</button> {{ mecanismo.cantidad }}
                <button class="plus" @click="actualizarCantidad(mecanismo, 1)">+</button>
            </h3>
        </div>
    </div>
    <img src="../assets/anyadirM.png" alt="Añadir" @click="popupVisible = true, editando = false" id="anyadirMecanismo"/>
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
                 <p>Nombre</p>
                 <input type="text" placeholder="Ej. Enchufe simple" v-model="nombreAnyadir"/>
                 <p>Descripción</p>
                 <input type="text" placeholder="Ej. Marca Legrand" v-model="descripcionAnyadir"/>
                 <p>Precio</p>
                 <div class="precio-container">
                     <input type="text" placeholder="Ej. 4" v-model="precioAnyadir"/>
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

export default {
    data() {
        return {
            mecanismos: [],
            nombreAnyadir: "",
            descripcionAnyadir: "",
            precioAnyadir: null,
            cantidadAnyadir: null,
            fotoAnyadir: "",
            error: "",
            popupVisible: false,
            defaultImagen,
            editando: false,
            mecanismoEditado: null,
            habitaciones: ["Salón", "Cocina", "Dormitorio", "Baño"],
            habitacionSeleccionada: null,
        }
    },
    props: {
        idViviendaSeleccionada: Number,
        token: String,
    },
    watch: {
        idViviendaSeleccionada: {
            immediate: true,
            handler() {
                this.cargarMecanismos();
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
            fetch(`http://localhost:3000/mecanismos?idVivienda=${this.idViviendaSeleccionada}`, {
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
            if (this.$refs.fileInput) {
                this.$refs.fileInput.value = "";
            }
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
            fetch("http://localhost:3000/mecanismos", {
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
            fetch(`http://localhost:3000/mecanismos/${mecanismo.idMecanismo}`, {
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
                    fetch(`http://localhost:3000/mecanismos/${id}`, {
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
        },
        actualizarMecanismo(id) {
            if (!this.puedeGuardar) return;
            fetch(`http://localhost:3000/mecanismos/${id}`, {
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
        anyadirMecanismo() {
            this.popupVisible = true;
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
    background-color: rgba(239, 240, 253, 0.8);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    z-index: -1;
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
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: linear-gradient(145deg, #ffffff, #f0f2f5);
    border-radius: 20px;
    width: 220px;
    text-align: center;
    padding: 20px 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.mecanismo:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
}

.mecanismo img {
    border-radius: 12px;
    background-color: #fff;
    padding: 10px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    margin: 8px 0;
    max-width: 100%;
    height: auto;
}

.mecanismo h3 {
    margin: 4px 0;
    font-size: 0.9rem;
    font-weight: 500;
    color: #555;
}

.mecanismo .titulo {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c3e50;
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
}

.roomOpt::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #2c3e50;
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
    top: -3px;
    left: 10px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    opacity: 0;
    transition: background-color 0.2s ease, opacity 0.2s ease;
}

.editar:hover {
    background-color: rgba(59, 130, 246, 0.25);
}

.borrar {
    position: absolute;
    top: -3px;
    right: 10px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
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
    background-color: white;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 20px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(0, 0, 0, 0.08);
    width: 380px;
    overflow: hidden;
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
    color: #4a5568;
    font-size: 0.95rem;
    text-align: left;
}

.popup-body input {
    width: 100%;
    box-sizing: border-box;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.12);
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
    width: 3%;
    height: 6%;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.15s ease;
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
    width: 100%;
    max-width: 200px;
    height: 150px;
    object-fit: contain;
    border-radius: 12px;
    margin: 8px 0;
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
</style>