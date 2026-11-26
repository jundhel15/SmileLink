<template>
  <!-- Text sa loob ng template na puwedeng i-click at palitan (edit mode lang).
       Kapag hindi edit mode, ordinaryong text lang. Sine-save kapag umalis sa text (blur) o nag-Enter. -->
  <component
    :is="tag"
    v-if="editing"
    ref="el"
    class="sl-editable"
    contenteditable="plaintext-only"
    role="textbox"
    :aria-label="label"
    :aria-multiline="multiline ? 'true' : 'false'"
    :data-placeholder="placeholder || label"
    spellcheck="true"
    @focus="onFocus"
    @blur="commit"
    @keydown="onKey"
    @input="onInput"
    @paste="onPaste"
    @pointerdown.stop
    @click.stop
  />
  <component :is="tag" v-else>{{ value }}</component>
</template>

<script setup>
import { inject, nextTick, onMounted, ref, watch } from "vue";

const props = defineProps({
  value: { type: String, default: "" },
  label: { type: String, required: true },
  tag: { type: String, default: "span" },
  multiline: { type: Boolean, default: false },
  maxlength: { type: Number, default: 300 },
  placeholder: { type: String, default: "" },
  // hindi puwedeng blangko: babalik sa dati kapag binura lahat
  required: { type: Boolean, default: true },
});
const emit = defineEmits(["change"]);

// galing sa template: true kapag naka-edit mode (Content step)
const editing = inject("slEditing", ref(false));
const el = ref(null);
let focused = false;

// ang text sa screen ay pinapalitan lang kapag hindi tina-type, para hindi tumalon ang cursor
function show(text) {
  if (el.value && !focused) el.value.textContent = text;
}
watch(() => props.value, show);
watch(editing, (on) => on && nextTick(() => show(props.value)));
onMounted(() => show(props.value));

function onFocus() {
  focused = true;
}
function read() {
  const text = (el.value?.innerText ?? "").replace(/ /g, " ");
  const clean = props.multiline ? text.replace(/\n{3,}/g, "\n\n").trim() : text.replace(/\s+/g, " ").trim();
  return clean.slice(0, props.maxlength);
}
function commit() {
  focused = false;
  const text = read();
  if (!text && props.required) {
    show(props.value);
    return;
  }
  if (text !== props.value) emit("change", text);
  show(text || props.value);
}
function onKey(event) {
  event.stopPropagation(); // hindi para sa laro ng template (hal. number keys ng lock)
  if (event.key === "Escape") {
    focused = false;
    show(props.value);
    el.value?.blur();
  } else if (event.key === "Enter" && !props.multiline) {
    event.preventDefault();
    el.value?.blur();
  } else if (event.key === " ") {
    // sa loob ng <button>, kinakain ng browser ang space (pinipindot ang button), kaya dito na ilalagay
    event.preventDefault();
    document.execCommand("insertText", false, " ");
  }
}
// hindi lalampas sa maxlength habang nagta-type
function onInput() {
  const text = el.value?.innerText ?? "";
  if (text.length > props.maxlength) {
    el.value.textContent = text.slice(0, props.maxlength);
    const range = document.createRange();
    range.selectNodeContents(el.value);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
// text lang ang ididikit (walang formatting o litrato)
function onPaste(event) {
  event.preventDefault();
  const text = event.clipboardData?.getData("text/plain") ?? "";
  document.execCommand("insertText", false, props.multiline ? text : text.replace(/\s+/g, " "));
}
</script>

<style>
/* hindi scoped: kailangang lumabas ang outline kahit nasa loob ng scoped na template */
.sl-editable {
  min-width: 2ch;
  border-radius: 6px;
  outline: 1.5px dashed rgb(255 120 170 / 0.75);
  outline-offset: 3px;
  cursor: text;
  user-select: text;
  -webkit-user-select: text;
  pointer-events: auto;
  touch-action: auto;
  transition: outline-color 0.2s, background 0.2s;
}
.sl-editable:hover {
  outline-color: rgb(255 80 140);
  background: rgb(255 255 255 / 0.18);
}
.sl-editable:focus {
  outline: 2px solid #ff5f8d;
  background: rgb(255 255 255 / 0.28);
}
.sl-editable:empty::before {
  content: attr(data-placeholder);
  opacity: 0.55;
}
</style>
