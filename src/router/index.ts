import { createRouter, createWebHashHistory } from "vue-router";
import Simulator from "@/views/SimulatorView.vue";

const routes = [
  {
    path: "/",
    name: "Simulator",
    component: Simulator,
  },
  {
    path: "/about",
    name: "About",
    component: () => import("@/views/AboutView.vue"),
  },
  {
    path: "/simulations",
    name: "Simulations",
    component: () => import("@/views/SimulationsView.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  linkActiveClass: "hover:text-foreground decoration-current",
  linkExactActiveClass: "underline underline-offset-8",
});
export const updateUrlQuery = (paramValuePair: object) => {
  const queryParams = { ...router.currentRoute.value.query };
  for (const [param, value] of Object.entries(paramValuePair)) {
    queryParams[param] = value;
  }
  router.push({ query: queryParams });
};

export const clearUrlQuery = () => {
  router.push({ query: undefined });
};

export default router;
