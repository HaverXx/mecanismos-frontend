import { createRouter, createWebHistory } from "vue-router";
import PaginaPrincipal from "../views/PaginaPrincipal.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/PaginaPrincipal",
            name: "Pagina Principal",
            component: PaginaPrincipal,
        },
    ],
});

export default router;