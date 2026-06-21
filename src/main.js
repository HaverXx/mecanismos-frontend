import { createApp } from 'vue'  
import App from './App.vue'  
import router from './router'  
  
window.API_URL = process.env.VUE_APP_API_URL || 'http://192.168.1.212:3000';  
  
createApp(App).use(router).mount('#app') 
