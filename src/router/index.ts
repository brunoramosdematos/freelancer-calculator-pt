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
let pendingInternalQueryUpdate = false;

export const consumeInternalQueryUpdate = () => {
  if (!pendingInternalQueryUpdate) {
    return false;
  }

  pendingInternalQueryUpdate = false;
  return true;
};

const markInternalQueryUpdate = () => {
  pendingInternalQueryUpdate = true;
};

const clearInternalQueryUpdate = () => {
  pendingInternalQueryUpdate = false;
};

export const updateUrlQuery = (paramValuePair: object) => {
  const queryParams = { ...router.currentRoute.value.query };
  for (const [param, value] of Object.entries(paramValuePair)) {
    queryParams[param] = value;
  }
  markInternalQueryUpdate();
  router.push({ query: queryParams }).finally(clearInternalQueryUpdate);
};

export const clearUrlQuery = () => {
  markInternalQueryUpdate();
  router.push({ query: undefined }).finally(clearInternalQueryUpdate);
};

export default router;
