import { defineStore } from "pinia";
import { ORDER_DRAFT_KEY, readOrderDraft } from "@/utils/orderDraft";

export const useOrderStore = defineStore("order", {
  state: () => ({
    orders: readOrderDraft(),
    cartitems: [],
  }),
  actions: {
    updateOrderDraft(updates) {
      this.orders = { ...readOrderDraft(), ...updates };
      delete this.orders.password; // hindi sine-save sa browser
      localStorage.setItem(ORDER_DRAFT_KEY, JSON.stringify(this.orders));
      return this.orders;
    },
  },
});
