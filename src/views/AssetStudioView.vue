<template>
  <!-- ASSET STUDIO (dev lang): mag-upload ng reference, piliin kung saan ise-save, tingnan ang mga webp -->
  <main class="min-h-screen bg-[#fff7f4] px-4 py-8 text-[#192448] sm:px-8">
    <div class="mx-auto max-w-6xl">
      <header class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold">Asset Studio</h1>
          <p class="mt-1 max-w-2xl text-[15px] text-[#5f6680]">
            Mag-upload ng reference dito, tapos sabihin kay Claude na hatiin ito. Ang mga tapos na
            asset ay kusang lalabas sa gallery sa ibaba.
          </p>
        </div>
        <span class="rounded-full bg-white px-3 py-1 text-xs text-[#5f6680] shadow-sm">
          {{ lastUpdated ? `Updated ${lastUpdated}` : "Loading..." }}
        </span>
      </header>

      <!-- DESTINATION: saang folder ise-save ang mga bagong webp -->
      <section class="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <label class="text-sm font-semibold" for="dest-folder">I-save ang mga bagong webp sa:</label>
        <div class="flex items-center gap-1 rounded-full border border-[#f3c6d2] bg-[#fffaf8] pl-3 text-sm">
          <span class="text-[#5f6680]">src/assets/</span>
          <select id="dest-folder" v-model="destFolder" class="rounded-full bg-transparent py-1.5 pr-3 font-semibold">
            <option v-for="item in folders" :key="item.folder" :value="item.folder">{{ item.folder }}/</option>
          </select>
        </div>
        <button class="rounded-full border border-[#f3c6d2] px-3 py-1.5 text-sm" type="button" @click="createFolder('dest')">
          + Bagong folder
        </button>
        <p v-if="destFolder !== defaultFolder" class="w-full text-xs text-amber-700">
          Paalala: ang <b>{{ defaultFolder }}/</b> lang ang kusang binabasa ng surprise. Ang webp sa ibang folder ay
          kailangan pang ikabit ni Claude sa code.
        </p>
      </section>

      <!-- UPLOAD -->
      <label
        class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-white px-6 py-10 text-center transition"
        :class="dragging ? 'border-[#e8597a] bg-[#fff0f4]' : 'border-[#f3c6d2] hover:border-[#e8597a]'"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="onDrop"
      >
        <input class="hidden" type="file" accept=".png,.jpg,.jpeg,.webp" multiple @change="onPick" />
        <span class="text-4xl" aria-hidden="true">🖼️</span>
        <strong class="text-lg">I-drag dito ang mga reference, o i-click para pumili</strong>
        <span class="text-sm text-[#5f6680]">PNG, JPG o WEBP · mase-save muna sa assets-inbox/</span>
        <span v-if="uploading" class="text-sm font-semibold text-[#e8597a]">Ina-upload... {{ uploading }}</span>
      </label>
      <p
        v-if="message"
        class="mt-3 whitespace-pre-line rounded-xl px-4 py-2 text-sm"
        :class="messageError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'"
      >
        {{ message }}
      </p>

      <!-- INBOX: mga na-upload na hindi pa nahahati -->
      <section v-if="data.inbox.length" class="mt-8">
        <h2 class="mb-1 text-xl font-bold">Inbox ({{ data.inbox.length }})</h2>
        <p class="mb-3 text-sm text-[#5f6680]">
          Para sa buong reference: sabihin kay Claude na hatiin ito. Para sa isang elemento lang: pindutin ang
          Auto-cut (mase-save sa <b>src/assets/{{ destFolder }}/</b>).
        </p>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article v-for="file in data.inbox" :key="file.name" class="overflow-hidden rounded-2xl bg-white shadow-sm">
            <img class="h-48 w-full bg-[#f6eee9] object-contain" :src="fileUrl('inbox', file)" :alt="file.name" loading="lazy" />
            <div class="flex flex-col gap-2 p-3">
              <strong class="truncate text-sm">{{ file.name }}</strong>
              <span class="text-xs text-[#5f6680]">{{ file.width }}×{{ file.height }} · {{ kb(file.size) }}</span>
              <div class="flex flex-wrap items-center gap-2">
                <select v-model="cutMode[file.name]" class="rounded-lg border border-[#f3c6d2] px-2 py-1 text-sm">
                  <option value="auto">auto</option>
                  <option value="color">color (flat na background)</option>
                  <option value="ai">ai (magulong background)</option>
                  <option value="none">none (buong larawan)</option>
                </select>
                <button
                  class="rounded-full bg-[#e8597a] px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                  type="button"
                  :disabled="busy[file.name]"
                  @click="autoCut(file)"
                >
                  {{ busy[file.name] ? "Hinihiwa..." : "Auto-cut" }}
                </button>
                <button class="rounded-full border border-[#f3c6d2] px-3 py-1.5 text-sm" type="button" @click="removeInbox(file)">
                  Delete
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- GALLERY: mga webp sa napiling folder -->
      <section class="mt-10">
        <h2 class="mb-3 text-xl font-bold">Mga asset</h2>
        <div class="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Mga folder">
          <button
            v-for="item in folders"
            :key="item.folder"
            class="rounded-full border px-3 py-1.5 text-sm"
            :class="galleryFolder === item.folder ? 'border-[#e8597a] bg-[#e8597a] text-white' : 'border-[#f3c6d2] bg-white'"
            type="button"
            role="tab"
            :aria-selected="galleryFolder === item.folder"
            @click="galleryFolder = item.folder"
          >
            {{ item.folder }}/ <span class="opacity-70">({{ item.count }})</span>
          </button>
        </div>
        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-[#5f6680]">
            src/assets/<b>{{ galleryFolder }}</b>/ · {{ filteredAssets.length }} file · gamitin ang <b>Dark</b> o
            <b>Checker</b> para makita kung may natirang background.
          </p>
          <div class="flex flex-wrap items-center gap-2">
            <input v-model="search" class="rounded-full border border-[#f3c6d2] bg-white px-4 py-1.5 text-sm" type="search" placeholder="Hanapin..." />
            <div class="flex overflow-hidden rounded-full border border-[#f3c6d2] bg-white text-sm" role="group" aria-label="Filter ayon sa gamit">
              <button
                v-for="option in usageFilters"
                :key="option.id"
                class="px-3 py-1.5"
                :class="usageFilter === option.id ? 'bg-[#192448] text-white' : ''"
                type="button"
                @click="usageFilter = option.id"
              >
                {{ option.label }} ({{ usageCount(option.id) }})
              </button>
            </div>
            <div class="flex overflow-hidden rounded-full border border-[#f3c6d2] bg-white text-sm" role="group" aria-label="Background ng preview">
              <button
                v-for="option in backgrounds"
                :key="option.id"
                class="px-3 py-1.5"
                :class="background === option.id ? 'bg-[#e8597a] text-white' : ''"
                type="button"
                @click="background = option.id"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>

        <p v-if="!filteredAssets.length" class="rounded-2xl bg-white p-6 text-center text-[#5f6680]">Walang asset sa folder na ito.</p>
        <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <article v-for="file in filteredAssets" :key="file.name" class="overflow-hidden rounded-2xl bg-white shadow-sm">
            <button
              class="flex h-40 w-full items-center justify-center p-3 transition hover:opacity-90"
              :style="backgroundStyle"
              type="button"
              :aria-label="`Palakihin ang ${file.name}`"
              @click="zoomed = file"
            >
              <img class="max-h-full max-w-full object-contain" :src="fileUrl('assets', file)" :alt="file.name" loading="lazy" />
            </button>
            <div class="flex flex-col gap-1 p-3">
              <strong class="truncate text-sm" :title="file.name">{{ file.name }}</strong>
              <span class="flex flex-wrap items-center gap-1.5 text-xs text-[#5f6680]">
                {{ file.width }}×{{ file.height }} · {{ kb(file.size) }}
                <span v-if="!file.alpha" class="rounded bg-amber-100 px-1.5 text-amber-800">walang transparency</span>
                <span v-if="isNew(file)" class="rounded bg-[#ffe4ec] px-1.5 text-[#c9405f]">bago</span>
              </span>
              <!-- label kung ginagamit sa code (para hindi mabura ang kailangan) -->
              <span
                v-if="file.usedIn?.length"
                class="self-start rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800"
                :title="`Ginagamit sa:\n${file.usedIn.join('\n')}`"
              >
                ✓ Ginagamit · {{ usedLabel(file.usedIn) }}
              </span>
              <span v-else class="self-start rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                Hindi ginagamit
              </span>
              <div class="mt-1 flex flex-wrap gap-2">
                <button class="rounded-full border border-[#f3c6d2] px-3 py-1 text-xs" type="button" @click="openMove(file)">
                  Move to…
                </button>
                <button
                  class="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                  type="button"
                  @click="deleteAsset(file)"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- DONE: mga orihinal na naproseso na -->
      <details v-if="data.done.length" class="mt-10 rounded-2xl bg-white p-4 shadow-sm">
        <summary class="cursor-pointer font-semibold">Mga naprosesong reference ({{ data.done.length }})</summary>
        <div class="mt-3 grid grid-cols-3 gap-3 md:grid-cols-6">
          <div v-for="file in data.done" :key="file.name" class="relative">
            <img
              class="h-24 w-full rounded-lg bg-[#f6eee9] object-contain"
              :src="fileUrl('done', file)"
              :alt="file.name"
              :title="file.name"
              loading="lazy"
            />
            <button
              class="absolute top-1 right-1 rounded-full bg-white/90 px-2 text-xs text-red-600 shadow"
              type="button"
              :aria-label="`Delete ${file.name}`"
              @click="trashFile('done', file)"
            >
              ✕
            </button>
          </div>
        </div>
      </details>

      <!-- TRASH: mga binura (puwede pang ibalik) -->
      <details v-if="data.trash.length" class="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <summary class="cursor-pointer font-semibold">🗑️ Trash ({{ data.trash.length }}) · puwede pang ibalik</summary>
        <div class="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div v-for="file in data.trash" :key="file.trashName" class="overflow-hidden rounded-xl border border-[#f3d6de]">
            <img class="h-24 w-full bg-[#f6eee9] object-contain" :src="trashUrl(file)" :alt="file.name" loading="lazy" />
            <div class="flex flex-col gap-1 p-2">
              <strong class="truncate text-xs" :title="file.name">{{ file.name }}</strong>
              <span class="truncate text-[11px] text-[#5f6680]">galing sa {{ originLabel(file.origin) }}</span>
              <button class="self-start rounded-full border border-[#f3c6d2] px-2 py-0.5 text-xs" type="button" @click="restore(file)">
                Restore
              </button>
            </div>
          </div>
        </div>
        <button
          class="mt-4 rounded-full border border-red-200 px-4 py-1.5 text-sm text-red-600 hover:bg-red-50"
          type="button"
          @click="emptyTrash"
        >
          Empty trash (tuluyang burahin)
        </button>
      </details>
    </div>

    <!-- ZOOM: malaking preview -->
    <div
      v-if="zoomed"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      :aria-label="zoomed.name"
      @click.self="zoomed = null"
    >
      <div class="flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white">
        <header class="flex items-center justify-between gap-3 border-b border-[#f3d6de] px-4 py-3">
          <div class="min-w-0">
            <strong class="block truncate">{{ zoomed.name }}</strong>
            <span class="text-xs text-[#5f6680]">src/assets/{{ galleryFolder }}/ · {{ zoomed.width }}×{{ zoomed.height }} · {{ kb(zoomed.size) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex overflow-hidden rounded-full border border-[#f3c6d2] text-sm">
              <button
                v-for="option in backgrounds"
                :key="option.id"
                class="px-3 py-1"
                :class="background === option.id ? 'bg-[#e8597a] text-white' : ''"
                type="button"
                @click="background = option.id"
              >
                {{ option.label }}
              </button>
            </div>
            <button class="rounded-full border border-[#f3c6d2] px-3 py-1 text-sm" type="button" aria-label="Isara" @click="zoomed = null">✕</button>
          </div>
        </header>
        <div class="flex min-h-0 flex-1 items-center justify-center overflow-auto p-6" :style="backgroundStyle">
          <img class="max-h-[70vh] max-w-full object-contain" :src="fileUrl('assets', zoomed)" :alt="zoomed.name" />
        </div>
      </div>
    </div>

    <!-- MOVE: ilipat ang asset sa ibang folder -->
    <div
      v-if="moving"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Ilipat ang asset"
      @click.self="moving = null"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h3 class="text-lg font-bold">Ilipat ang {{ moving.file.name }}</h3>
        <p class="mt-1 text-sm text-[#5f6680]">Mula sa src/assets/{{ moving.from }}/</p>

        <label class="mt-4 block text-sm font-semibold" for="move-target">Ilipat sa:</label>
        <div class="mt-1 flex items-center gap-2">
          <select id="move-target" v-model="moving.to" class="flex-1 rounded-lg border border-[#f3c6d2] px-2 py-2 text-sm">
            <option v-for="item in folders.filter((f) => f.folder !== moving.from)" :key="item.folder" :value="item.folder">
              src/assets/{{ item.folder }}/
            </option>
          </select>
          <button class="rounded-full border border-[#f3c6d2] px-3 py-2 text-sm" type="button" @click="createFolder('move')">+ Bago</button>
        </div>

        <p v-if="moving.usage === null" class="mt-4 text-sm text-[#5f6680]">Tinitingnan kung ginagamit sa code...</p>
        <p v-else-if="moving.usage.length" class="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          ⚠️ Ginagamit ang file na ito sa:
          <span v-for="file in moving.usage" :key="file" class="block font-mono text-xs">{{ file }}</span>
          Kapag inilipat, puwedeng hindi na ito lumabas o masira ang page. Sabihin kay Claude para ayusin ang code.
        </p>
        <p v-else class="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">✓ Hindi ito nababanggit sa code, ligtas ilipat.</p>

        <div class="mt-5 flex justify-end gap-2">
          <button class="rounded-full border border-[#f3c6d2] px-4 py-2 text-sm" type="button" @click="moving = null">Cancel</button>
          <button
            class="rounded-full bg-[#e8597a] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            type="button"
            :disabled="!moving.to || moving.usage === null"
            @click="confirmMove"
          >
            Ilipat
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";

const data = ref({ inbox: [], done: [], assets: [], trash: [] });
const folders = ref([]);
const defaultFolder = ref("surprise");
const lastUpdated = ref("");
const search = ref("");
const dragging = ref(false);
const uploading = ref("");
const message = ref("");
const messageError = ref(false);
const zoomed = ref(null);
const moving = ref(null);
const cutMode = reactive({});
const busy = reactive({});
const pageOpenedAt = Date.now();

/* naaalala ang huling napiling folder (per browser lang; ok lang kung walang storage) */
function remembered(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}
function remember(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* walang storage (private window): hindi na lang maaalala */
  }
}
const destFolder = ref(remembered("asset-studio:dest", "surprise"));
const galleryFolder = ref(remembered("asset-studio:gallery", "surprise"));
watch(destFolder, (value) => remember("asset-studio:dest", value));
watch(galleryFolder, (value) => {
  remember("asset-studio:gallery", value);
  refresh();
});

const backgrounds = [
  { id: "cream", label: "Cream" },
  { id: "dark", label: "Dark" },
  { id: "checker", label: "Checker" },
  { id: "white", label: "White" },
];
const background = ref("cream");
const backgroundStyle = computed(() => {
  if (background.value === "dark") return { background: "#2a2440" };
  if (background.value === "white") return { background: "#ffffff" };
  if (background.value === "checker") {
    return { background: "repeating-conic-gradient(#e9e3e6 0 25%, #ffffff 0 50%) 50% / 18px 18px" };
  }
  return { background: "#fdf6f3" };
});

/* filter ayon sa gamit: para makita agad kung alin ang ligtas burahin */
const usageFilters = [
  { id: "all", label: "Lahat" },
  { id: "used", label: "Ginagamit" },
  { id: "unused", label: "Hindi ginagamit" },
];
const usageFilter = ref("all");
const matchesUsage = (file, filter) =>
  filter === "all" || (filter === "used" ? file.usedIn?.length > 0 : !file.usedIn?.length);
const usageCount = (filter) => data.value.assets.filter((file) => matchesUsage(file, filter)).length;
// maikling pangalan ng file kung saan ginagamit (hal. "BirthdaySoftCelebration.vue" o "2 files")
const usedLabel = (files) => (files.length === 1 ? files[0].split("/").pop() : `${files.length} files`);

const filteredAssets = computed(() => {
  const query = search.value.trim().toLowerCase();
  return [...data.value.assets]
    .filter((file) => !query || file.name.toLowerCase().includes(query))
    .filter((file) => matchesUsage(file, usageFilter.value))
    .sort((a, b) => b.modified - a.modified);
});

const kb = (bytes) => `${Math.max(1, Math.round(bytes / 1024))}KB`;
const query = (params) => new URLSearchParams(params).toString();
// ?v= para lumabas agad ang bagong bersyon kapag pinalitan ang file
const fileUrl = (dir, file) =>
  `/__assets/file?${query({ dir, folder: galleryFolder.value, name: file.name, v: Math.round(file.modified) })}`;
// "bago" = nagawa o napalitan habang bukas ang page (o sa huling 10 minuto)
const isNew = (file) => file.modified > Math.min(pageOpenedAt, Date.now() - 10 * 60 * 1000);

function notify(text, isError = false) {
  message.value = text;
  messageError.value = isError;
}

async function api(path, params = {}, options = {}) {
  const response = await fetch(`/__assets/${path}?${query(params)}`, options);
  const body = await response.json().catch(() => ({}));
  return { status: response.status, ok: response.ok, body };
}

async function loadFolders() {
  const { ok, body } = await api("folders");
  if (!ok) return;
  folders.value = body.folders.filter((item) => item.count > 0 || item.folder === body.default || item.folder === destFolder.value);
  defaultFolder.value = body.default;
  const names = body.folders.map((item) => item.folder);
  if (!names.includes(destFolder.value)) destFolder.value = body.default;
  if (!names.includes(galleryFolder.value)) galleryFolder.value = body.default;
}

async function refresh() {
  try {
    const { ok, status, body } = await api("list", { folder: galleryFolder.value });
    if (!ok) throw new Error(body.error ?? `HTTP ${status}`);
    data.value = body;
    for (const file of body.inbox) cutMode[file.name] ??= "auto";
    lastUpdated.value = new Date().toLocaleTimeString();
  } catch (error) {
    notify(`Hindi makuha ang listahan: ${error.message}. Naka-run ba ang npm run dev?`, true);
  }
}

async function refreshAll() {
  await loadFolders();
  await refresh();
}

async function createFolder(target) {
  const name = window.prompt("Pangalan ng bagong folder sa loob ng src/assets/ (hal. templates/debut):");
  if (!name) return;
  const { ok, body } = await api("mkdir", { folder: name.trim() }, { method: "POST" });
  if (!ok) return notify(body.error, true);
  // ipakita agad kahit wala pang laman
  if (!folders.value.some((item) => item.folder === body.folder)) folders.value.push({ folder: body.folder, count: 0 });
  if (target === "dest") destFolder.value = body.folder;
  if (target === "move" && moving.value) moving.value.to = body.folder;
  notify(`Nagawa ang src/assets/${body.folder}/`);
}

async function upload(files) {
  const images = [...files].filter((file) => /\.(png|jpe?g|webp)$/i.test(file.name));
  if (!images.length) return notify("PNG, JPG o WEBP lang ang puwede.", true);
  let saved = 0;
  for (const file of images) {
    uploading.value = file.name;
    const { ok, body } = await api("upload", { name: file.name }, { method: "POST", body: file });
    if (ok) saved += 1;
    else notify(`Hindi na-upload ang ${file.name}: ${body.error}`, true);
  }
  uploading.value = "";
  if (saved) notify(`Na-upload ang ${saved} file sa assets-inbox/. Sabihin na kay Claude para hatiin ang mga ito.`);
  await refresh();
}

function onDrop(event) {
  dragging.value = false;
  upload(event.dataTransfer.files);
}

function onPick(event) {
  upload(event.target.files);
  event.target.value = "";
}

async function autoCut(file, overwrite = false) {
  busy[file.name] = true;
  try {
    const params = { name: file.name, mode: cutMode[file.name] ?? "auto", folder: destFolder.value };
    if (overwrite) params.overwrite = "1";
    const { status, body } = await api("autocut", params, { method: "POST" });
    if (status === 409 && window.confirm(`${body.error}. Papalitan ba?`)) {
      busy[file.name] = false;
      return autoCut(file, true);
    }
    notify(body.output || body.error || "Tapos na.", !body.ok);
    galleryFolder.value = destFolder.value;
  } finally {
    busy[file.name] = false;
    await refreshAll();
  }
}

/* ===== Delete → Trash (assets-inbox/trash/), puwede pang i-Restore ===== */
const trashUrl = (file) => `/__assets/file?${query({ dir: "trash", name: file.trashName, v: Math.round(file.modified) })}`;
const originLabel = (origin) =>
  origin === "inbox" ? "assets-inbox/" : origin === "done" ? "assets-inbox/done/" : `src/assets/${origin}/`;

async function trashFile(dir, file, folder) {
  const params = { dir, name: file.name };
  if (folder) params.folder = folder;
  const { ok, body } = await api("delete", params, { method: "POST" });
  if (!ok) return notify(body.error, true);
  notify(`Nailipat sa Trash ang ${file.name}. Puwede pang i-Restore sa ibaba.`);
  if (zoomed.value?.name === file.name) zoomed.value = null;
  await refreshAll();
}

function removeInbox(file) {
  if (window.confirm(`Burahin ang ${file.name} sa assets-inbox/? (mapupunta sa Trash)`)) trashFile("inbox", file);
}

async function deleteAsset(file) {
  const folder = galleryFolder.value;
  const { body } = await api("usage", { name: file.name });
  const usedIn = body.usedIn ?? [];
  const warning = usedIn.length
    ? `\n\n⚠️ GINAGAMIT ito sa:\n${usedIn.join("\n")}\nKapag binura, hindi na ito lalabas sa page (babalik sa CSS/SVG na pamalit kung meron).`
    : "\n\n✓ Hindi ito ginagamit sa code.";
  if (window.confirm(`Burahin ang ${file.name} sa src/assets/${folder}/?${warning}\n\nMapupunta ito sa Trash at puwede pang ibalik.`)) {
    await trashFile("assets", file, folder);
  }
}

async function restore(file, overwrite = false) {
  const params = { name: file.trashName };
  if (overwrite) params.overwrite = "1";
  const { ok, status, body } = await api("restore", params, { method: "POST" });
  if (status === 409) {
    if (window.confirm(`${body.error}. Papalitan ba?`)) return restore(file, true);
    return;
  }
  if (!ok) return notify(body.error, true);
  notify(`Naibalik ang ${file.name} sa ${originLabel(body.origin)}`);
  await refreshAll();
}

async function emptyTrash() {
  if (!window.confirm(`Tuluyang burahin ang ${data.value.trash.length} file sa Trash? Hindi na ito maibabalik.`)) return;
  await api("empty-trash", {}, { method: "POST" });
  notify("Naubos ang Trash.");
  await refresh();
}

async function openMove(file) {
  const from = galleryFolder.value;
  const firstOther = folders.value.find((item) => item.folder !== from);
  moving.value = { file, from, to: firstOther?.folder ?? "", usage: null };
  const { body } = await api("usage", { name: file.name });
  if (moving.value?.file === file) moving.value.usage = body.usedIn ?? [];
}

async function confirmMove(overwrite = false) {
  const { file, from, to } = moving.value;
  const params = { name: file.name, from, to };
  if (overwrite === true) params.overwrite = "1";
  const { ok, status, body } = await api("move", params, { method: "POST" });
  if (status === 409) {
    if (window.confirm(`${body.error}. Papalitan ba?`)) return confirmMove(true);
    return;
  }
  if (!ok) return notify(body.error, true);
  notify(`Nailipat ang ${file.name} sa src/assets/${to}/`);
  moving.value = null;
  await refreshAll();
}

// kusang nagre-refresh para makita agad ang mga asset na ginagawa ni Claude
let timer = null;
function onKey(event) {
  if (event.key !== "Escape") return;
  zoomed.value = null;
  moving.value = null;
}
onMounted(() => {
  refreshAll();
  timer = setInterval(() => {
    if (document.visibilityState === "visible") refresh();
  }, 4000);
  window.addEventListener("keydown", onKey);
});
onUnmounted(() => {
  clearInterval(timer);
  window.removeEventListener("keydown", onKey);
});
</script>
