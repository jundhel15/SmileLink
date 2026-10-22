import { createRouter, createWebHistory } from "vue-router";
import GuessView from "@/views/GuessView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "guess",
      component: GuessView,
    },
    {
      path: "/celebrate",
      name: "celebrate",
      component: () => import("../views/CelebrateView.vue"),
    },
    {
      path: "/create/occasion",
      name: "create-occasion",
      component: () => import("../views/CelebrateView.vue"),
    },
    {
      path: "/create/template",
      name: "birthday-template",
      component: () => import("../views/CelebrateView.vue"),
    },
    {
      path: "/create/package",
      name: "create-package",
      component: () => import("../views/CelebrateView.vue"),
    },
    {
      path: "/create/recipient",
      name: "create-recipient",
      component: () => import("../views/CelebrateView.vue"),
    },
    {
      path: "/create/content",
      name: "create-content",
      component: () => import("../views/CelebrateView.vue"),
    },
    {
      path: "/create/review",
      name: "create-review",
      component: () => import("../views/CelebrateView.vue"),
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
    },
  ],
});

export default router;
