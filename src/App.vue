<template>
  <div id="tools">
    <img src="./assets/logo.png" alt="Logo" width="50px"/>
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
  text-align: left;
}

#tools img {
  left: 20px;
}
</style>
