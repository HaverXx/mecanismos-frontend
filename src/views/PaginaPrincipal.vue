<template>
    <div id="rooms">
        <span class="roomOpt"><u><b>General</b></u></span>
        <span class="roomOpt">Salón</span>
        <span class="roomOpt">Cocina</span>
        <span class="roomOpt">Dormitorio</span>
        <span class="roomOpt">Baño</span>
    </div>

    <div id="mecanismos">
        <div class="mecanismo">
            <h3>Enchufe simple</h3>
            <h3>Enchufe marca Legrand modelo 7015912</h3>
            <img src="../assets/enchufe.png" alt="Enchufe" width="200px"/>
            <h3>Precio Unitario: 4€</h3>
            <h3>Total: 4€</h3>
            <h3><button class="minus">-</button> 1 <button class="plus">+</button></h3>
        </div>
        <div class="mecanismo">
            <h3>Enchufe simple</h3>
            <h3>Enchufe marca Legrand modelo 7015912</h3>
            <img src="../assets/enchufe.png" alt="Enchufe" width="200px"/>
            <h3>Precio Unitario: 4€</h3>
            <h3>Total: 4€</h3>
            <h3><button class="minus">-</button> 1 <button class="plus">+</button></h3>
        </div>
        <div class="mecanismo">
            <h3>Enchufe simple</h3>
            <h3>Enchufe marca Legrand modelo 7015912</h3>
            <img src="../assets/enchufe.png" alt="Enchufe" width="200px"/>
            <h3>Precio Unitario: 4€</h3>
            <h3>Total: 4€</h3>
            <h3><button class="minus">-</button> 1 <button class="plus">+</button></h3>
        </div>
        <div class="mecanismo">
            <h3>Enchufe simple</h3>
            <h3>Enchufe marca Legrand modelo 7015912</h3>
            <img src="../assets/enchufe.png" alt="Enchufe" width="200px"/>
            <h3>Precio Unitario: 4€</h3>
            <h3>Total: 4€</h3>
            <h3><button class="minus">-</button> 1 <button class="plus">+</button></h3>
        </div>
        <br>
        <br>
        <br>
        <br>
        <br>
    </div>

    <footer>
        <h3 id="cantidadMecanismos">Mecanismos: 3</h3>
        <h3 id="aproxFinal">Precio aproximado: 300€</h3>
    </footer>
</template>

<script>

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
    padding: 20px;
    background-color: rgba(149, 155, 158, 0.70);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

#mecanismos {
    display: grid;
    gap: 10px;
    padding: 10px;
    width: 100%;
    box-sizing: border-box;
}

.mecanismo {
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

.mecanismo h3:first-child {
    font-size: 1.05rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 6px;
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
}

.mecanismo .minus:hover {
    background-color: #f8c4c4;
    transform: scale(1.1);
}

.mecanismo .plus {
    background-color: #dff5e3;
    color: #2d8a4e;
}

.mecanismo .plus:hover {
    background-color: #c3eacc;
    transform: scale(1.1);
}
</style>