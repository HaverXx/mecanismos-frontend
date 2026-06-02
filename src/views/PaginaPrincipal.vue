<template>
    <div id="rooms">
        <span class="roomOpt"><u><b>General</b></u></span>
        <span class="roomOpt">Salón</span>
        <span class="roomOpt">Cocina</span>
        <span class="roomOpt">Dormitorio</span>
        <span class="roomOpt">Baño</span>
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
    text-align: center;
    padding: 20px;
    background-color: rgba(149, 155, 158, 0.70);
    -webkit-backdrop-filter: blur(10px);
}

#cantidadMecanismos {
    right: 0;
}

#aproxFinal {
    margin-left: auto;
}
</style>