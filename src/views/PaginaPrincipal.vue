<template>
    <div id="rooms">
        <span class="roomOpt">
            <b>General</b>
        </span>
        <span class="roomOpt">Salón</span>
        <span class="roomOpt">Cocina</span>
        <span class="roomOpt">Dormitorio</span>
        <span class="roomOpt">Baño</span>
    </div>

    <div id="mecanismos">
        <div class="mecanismo" v-for="mecanismo in mecanismos" :key="mecanismo.idMecanismo">
            <img src="../assets/editar.png" alt="Editar" width="10px" class="editar" />
            <h3 class="titulo">{{ mecanismo.nombre }}</h3>
            <img src="../assets/borrar.png" alt="Borrar" width="10px" class="borrar" @click="eliminarMecanismo(mecanismo.idMecanismo)" />
            <h3 class="desc">{{ mecanismo.descripcion }}</h3>
            <img :src="mecanismo.foto || defaultImagen" alt="Imagen de mecanismo" width="200px" class="mecanismo-img" />
            <h3>Precio Unitario: {{ mecanismo.precioUnitario }}€</h3>
            <h3>Total: {{ (mecanismo.precioUnitario * mecanismo.cantidad) }}€</h3>
            <h3>
                <button class="minus" @click="actualizarCantidad(mecanismo, -1)">-</button> {{ mecanismo.cantidad }}
                <button class="plus" @click="actualizarCantidad(mecanismo, 1)">+</button>
            </h3>
        </div>
    </div>
    <button @click="popupVisible = true" id="anyadirMecanismo">
        <p>+</p>
    </button>
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <div id="blur" :class="{ active: popupVisible }">
        <div id="popup">
             <!-- Popup para anyadir mecanismos -->
             <div id="titulo">Añadir mecanismo</div>
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
                     <button id="btn-guardar" :disabled="!puedeGuardar" @click="guardarMecanismo">Guardar</button>
                 </div>
             </div>
        </div>
    </div>
    <footer>
        <h3 id="cantidadMecanismos">Mecanismos: {{ mecanismos.length }}</h3>
        <h3 id="aproxFinal">Precio aproximado: {{ precioAproxFinal }}€</h3>
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
            fotoPreview: "",
            error: "",
            popupVisible: false,
            defaultImagen,
        }
    },
    computed: {
        puedeGuardar() {
            return this.nombreAnyadir && this.descripcionAnyadir && this.precioAnyadir && this.cantidadAnyadir;
        },
        precioAproxFinal() {
            return this.mecanismos.reduce((sum, m) => sum + (parseFloat(m.precioUnitario) * parseInt(m.cantidad)), 0);
        }
    },
    methods: {
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
                idVivienda: 1
            };
            fetch("http://localhost:3000/mecanismos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
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
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ cantidad: nuevaCantidad })
            })
            .then(res => {
                if (!res.ok) throw new Error("Error al actualizar la cantidad");
                mecanismo.cantidad = nuevaCantidad;
            })
            .catch(err => {
                alert("No se pudo actualizar la cantidad: " + err.message);
            });
        },
        eliminarMecanismo(id) {
            if (!confirm("¿Estás seguro de que deseas eliminar este mecanismo?")) return;
            fetch(`http://localhost:3000/mecanismos/${id}`, {
                method: "DELETE"
            })
            .then(res => {
                if (!res.ok) throw new Error("Error al eliminar del servidor");
                this.mecanismos = this.mecanismos.filter(m => m.idMecanismo !== id);
            })
            .catch(err => {
                alert("No se pudo eliminar el mecanismo: " + err.message);
            });
        }
    },
    mounted() {
        fetch("http://localhost:3000/mecanismos")
            .then(res => res.json())
            .then(data => {
                this.mecanismos = data;
            });
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
    background-color: rgb(109, 180, 247);
    color: white;
    position: fixed;
    bottom: 15%;
    right: 2%;
}

#anyadirMecanismo:hover {
    cursor: pointer;
    background-color: rgb(138, 191, 240);
}

#anyadirMecanismo p{
    padding: 0;
    margin: 0;
    font-size: 2rem;
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
</style>