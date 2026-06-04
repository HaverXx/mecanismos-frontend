<template>
  <div id="tools">
    <img src="./assets/logo.png" alt="Logo" width="50px"/>
    <select id="viviendas" name="viviendas">
      <option v-if="viviendas.length === 0">No hay viviendas</option>
      <option v-else v-for="vivienda in viviendas" :key="vivienda.id" :value="vivienda.id">
        {{ vivienda.nombre }}
      </option>
    </select>
    <img src="./assets/plus.png" alt="Add" width="20px" id="addRoom"/>
    <img src="./assets/user.png" alt="Usuario" width="30px" id="user"/>
  </div>
  <router-view />
</template>

<script>
export default {
  data() {
    return {
      viviendas: [],
    };
  },

  mounted() {
    fetch("http://localhost:3000/viviendas")
      .then(res => res.json())
      .then(data => {
        this.viviendas = data;
      });
  }
};
</script>

<style>
p {
  margin: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
body {
  margin: 0;
  padding: 0;
  background: linear-gradient(158deg,rgba(240, 245, 255, 1) 0%, rgba(203, 202, 221, 1) 100%);
  min-height: 100vh;
}
#tools {
  background: linear-gradient(158deg,rgba(171, 202, 255, 1) 0%, rgba(100, 98, 194, 1) 100%);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

#viviendas {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 16px;
  width: 200px;
  background: linear-gradient(158deg, rgba(240, 245, 255, 1) 0%, rgba(203, 202, 221, 1) 100%);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

#user {
  margin-left: auto;
}

#addRoom {
  gap-left: 10px;
  cursor: pointer;
}
</style>
