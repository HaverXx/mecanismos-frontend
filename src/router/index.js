import { createRouter, createWebHistory } from "vue-router";
import PaginaPrincipal from "../views/PaginaPrincipal.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "Pagina Principal",
            component: PaginaPrincipal,
        },
    ],
});

export default router;