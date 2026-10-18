<template>
  <div
    class="confirm-overlay"
    role="dialog"
    aria-modal="true"
    :aria-label="templateName"
    tabindex="-1"
    @click.self="$emit('cancel')"
    @keydown.esc.prevent.stop="$emit('cancel')"
  >
    <section class="confirm-dialog">
      <h2>{{ templateName }}</h2>
      <p>{{ message }}</p>
      <div class="confirm-actions">
        <button class="cancel-template-button" type="button" @click="$emit('cancel')">
          {{ cancelLabel }}
        </button>
        <button class="use-template-button" type="button" @click="$emit('confirm')">
          {{ confirmLabel }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
defineProps({
  templateName: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  cancelLabel: {
    type: String,
    required: true,
  },
  confirmLabel: {
    type: String,
    required: true,
  },
});

defineEmits(["cancel", "confirm"]);
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  z-index: 11;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgb(20 25 47 / 68%);
}
.confirm-dialog {
  width: min(420px, 100%);
  padding: 28px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 20px 70px rgb(0 0 0 / 25%);
  text-align: center;
}
.confirm-dialog h2 {
  margin: 0 0 8px;
  color: #1c2344;
  font-size: 23px;
  font-weight: 900;
}
.confirm-dialog p {
  margin: 0;
  color: #606981;
}
.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;
}
.cancel-template-button {
  border: 1px solid #d9d0c0;
  border-radius: 12px;
  background: #fff;
  color: #1c2344;
  padding: 12px 20px;
  font-weight: 800;
}
.use-template-button {
  border: 0;
  border-radius: 12px;
  background: #3265df;
  color: #fff;
  padding: 12px 20px;
  font-weight: 800;
}
</style>
