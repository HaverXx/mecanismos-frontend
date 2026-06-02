<template>
  <div id="tools">
    <img src="./assets/logo.png" alt="Logo" width="50px"/>
    <select id="viviendas" name="viviendas">
      <option value="1">Casa de Pepe</option>
      <option value="2">Apartamento los Cibeles</option>
      <option value="3">Urbanización San Juan - Ramón</option>
      <option value="4">Chalet de Juan</option>
    </select>
    <img src="./assets/plus.png" alt="Add" width="20px" id="addRoom"/>
    <img src="./assets/user.png" alt="Usuario" width="30px" id="user"/>
  </div>
  <router-view />
</template>

<script>

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
