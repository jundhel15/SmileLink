import { defineStore } from "pinia";

export const smileor = defineStore("smile", {
  state: () => ({
    items: [],
    cartItems: [],
  }),
});
