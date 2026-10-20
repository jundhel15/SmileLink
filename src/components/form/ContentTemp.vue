<template>
  <main class="content-page">
    <h2 class="section-title">Add your content</h2>
    <p class="section-intro">
      Everything saves as you type. The preview updates live.
      <span v-if="saveStatus" class="save-status" role="status">{{ saveStatus }}</span>
    </p>

    <div class="content-layout">
      <nav class="content-card section-menu" aria-label="Content sections">
        <button
          v-for="section in sections"
          :key="section.id"
          class="menu-item"
          :class="{ active: activeSection === section.id, locked: section.locked }"
          type="button"
          :aria-current="activeSection === section.id ? 'true' : undefined"
          :aria-disabled="section.locked"
          @click="openSection(section)"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              v-for="(path, i) in ICONS[section.icon]"
              :key="i"
              :d="path"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="menu-label">{{ section.label }}</span>
          <span v-if="section.locked" class="upgrade-badge">Upgrade</span>
          <span v-else-if="section.id === 'photos' && photos.length" class="count-badge">
            {{ photos.length }}
          </span>
        </button>
      </nav>

      <section class="content-card editor-card" aria-label="Editor">
        <template v-if="activeSection === 'message'">
          <label class="field">
            <span>Headline</span>
            <input v-model="form.headline" type="text" maxlength="80" placeholder="Happy Birthday, Maria!" />
          </label>

          <label class="field">
            <span>Your message</span>
            <textarea
              v-model="form.message"
              rows="5"
              :maxlength="MESSAGE_LIMIT"
              placeholder="Write something from the heart..."
            ></textarea>
            <small class="char-count">{{ form.message.length }} / {{ MESSAGE_LIMIT.toLocaleString() }}</small>
          </label>

          <label class="field">
            <span>Sign-off</span>
            <input v-model="form.sign_off" type="text" maxlength="60" placeholder="Love, Juan" />
          </label>
        </template>

        <div v-if="activeSection === 'message' || activeSection === 'photos'" class="photos-block">
          <div class="block-head">
            <span>Photos</span>
            <small>{{ photos.length }} of {{ packageLimits.max_photos }} used</small>
          </div>
          <div class="photo-grid">
            <div v-for="(photo, index) in photos" :key="photo.id" class="photo-tile" :class="`tone-${index % 4}`">
              <img :src="photo.url" :alt="`Photo ${index + 1}`" />
              <button class="remove-photo" type="button" :aria-label="`Remove photo ${index + 1}`" @click="removePhoto(photo.id)">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
                </svg>
              </button>
            </div>
            <label v-if="photos.length < packageLimits.max_photos" class="photo-add">
              <input
                type="file"
                accept="image/jpeg,image/png,image/heic,.heic"
                multiple
                @change="addPhotos"
              />
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 16V4m0 0-5 5m5-5 5 5M5 20h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>Add</span>
            </label>
          </div>
          <small v-if="photoError" class="field-error" role="alert">{{ photoError }}</small>
          <small v-else-if="activeSection === 'photos'" class="field-hint">
            JPG, PNG or HEIC. Large photos are resized to 1600 px wide.
          </small>
        </div>

        <template v-if="activeSection === 'music'">
          <div class="block-head"><span>Background music</span></div>
          <label v-for="track in TRACKS" :key="track.id" class="radio-option">
            <input v-model="form.music_track" type="radio" :value="track.id" />
            <span>{{ track.name }} <small>{{ track.length }}</small></span>
          </label>
          <label class="radio-option">
            <input v-model="form.music_track" type="radio" value="link" />
            <span>Paste a YouTube or Spotify link</span>
          </label>
          <label v-if="form.music_track === 'link'" class="field">
            <input
              v-model="form.music_link"
              type="url"
              placeholder="https://open.spotify.com/track/..."
              :aria-invalid="Boolean(musicLinkError)"
            />
            <small v-if="musicLinkError" class="field-error">{{ musicLinkError }}</small>
          </label>
        </template>

        <template v-if="activeSection === 'password'">
          <label class="copy-option">
            <input v-model="form.password_enabled" type="checkbox" />
            <span>Ask for a password before the surprise opens</span>
          </label>
          <label v-if="form.password_enabled" class="field">
            <span>Password</span>
            <input v-model="form.password" type="text" maxlength="40" placeholder="Something only they know" />
          </label>
          <label v-if="form.password_enabled" class="field">
            <span>Hint (optional)</span>
            <input v-model="form.password_hint" type="text" maxlength="80" placeholder="Our favorite ice cream" />
          </label>
        </template>

        <template v-if="activeSection === 'video'">
          <div class="block-head"><span>Video clip</span></div>
          <label class="field">
            <span>YouTube link</span>
            <input v-model="form.video_link" type="url" placeholder="https://youtu.be/..." />
          </label>
          <small class="field-hint">Or upload a short clip after checkout.</small>
        </template>

        <template v-if="activeSection === 'group'">
          <div class="block-head"><span>Group wishes</span></div>
          <p class="field-hint">
            After checkout you get a link to share with friends so they can add their own wishes.
          </p>
        </template>
      </section>

      <section class="content-card preview-card" aria-label="Live preview">
        <div class="preview-head">
          <span>Live preview</span>
          <div class="device-toggle" role="group" aria-label="Preview device">
            <button
              type="button"
              :class="{ active: previewDevice === 'phone' }"
              aria-label="Phone preview"
              :aria-pressed="previewDevice === 'phone'"
              @click="previewDevice = 'phone'"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" stroke-width="1.8" />
              </svg>
            </button>
            <button
              type="button"
              :class="{ active: previewDevice === 'desktop' }"
              aria-label="Desktop preview"
              :aria-pressed="previewDevice === 'desktop'"
              @click="previewDevice = 'desktop'"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.8" />
                <path d="M9 20h6M12 16v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div class="device" :class="`device-${previewDevice}`">
          <div class="device-screen">
            <div class="preview-hero" aria-hidden="true">
              <span class="balloon balloon-blue"></span>
              <span class="balloon balloon-yellow"></span>
              <span class="balloon balloon-red"></span>
              <span class="balloon balloon-navy"></span>
              <span class="cake">
                <span class="candles"><i></i><i></i><i></i></span>
                <span class="cake-top"></span>
                <span class="cake-base"></span>
              </span>
            </div>
            <div class="preview-body">
              <h3>{{ form.headline.trim() || "Your headline" }}</h3>
              <p class="preview-message">{{ previewMessage }}</p>
              <div class="preview-photos">
                <span
                  v-for="(slot, index) in previewPhotos"
                  :key="index"
                  class="preview-photo"
                  :class="`tone-${index % 4}`"
                >
                  <img v-if="slot" :src="slot.url" alt="" />
                </span>
              </div>
              <p class="preview-signoff">{{ form.sign_off.trim() || "Your sign-off" }}</p>
            </div>
            <span class="watermark" aria-hidden="true">PREVIEW</span>
          </div>
        </div>
      </section>

      <footer class="form-actions">
        <button class="back-button" type="button" @click="router.push('/create/recipient')">Back</button>
        <button class="continue-button" type="button" @click="saveContent">
          Continue
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </footer>
    </div>
  </main>
</template>

<script setup>
import { computed, onUnmounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { readOrderDraft, updateOrderDraft } from "@/utils/orderDraft";

const MESSAGE_LIMIT = 1000;
const MAX_PHOTO_WIDTH = 1600;
const AUTOSAVE_DELAY = 2000;

// kapareho ng limits sa PackageTemp
const PACKAGE_LIMITS = {
  "greeting-card": { max_photos: 3, has_music: false, has_video: false, has_password: false, has_group: false },
  "surprise-website": { max_photos: 10, has_music: true, has_video: false, has_password: true, has_group: false },
  "complete-surprise": { max_photos: 20, has_music: true, has_video: true, has_password: true, has_group: true },
};

const ICONS = {
  message: ["M4 5h16v11H8l-4 4V5Z"],
  photos: ["M4 5h16v14H4z", "m4 16 5-5 4 4 2-2 5 5", "M15.5 9.5h.01"],
  music: ["M9 18V6l11-2v12", "M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z", "M20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"],
  lock: ["M5 11h14v10H5z", "M8 11V7a4 4 0 0 1 8 0v4"],
  video: ["M3 6h13v12H3z", "m16 10 5-3v10l-5-3"],
  group: ["M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z", "M2.5 20c.6-3.6 3.2-6 6.5-6s5.9 2.4 6.5 6", "M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14c2 .6 3.3 2.7 3.5 6"],
};

// lisensyadong listahan ng musika
const TRACKS = [
  { id: "happy-day", name: "Happy Day (acoustic)", length: "2:41" },
  { id: "sunny-ukulele", name: "Sunny Ukulele", length: "2:12" },
  { id: "warm-piano", name: "Warm Piano", length: "3:05" },
];

const router = useRouter();
const draft = readOrderDraft();
const packageLimits = PACKAGE_LIMITS[draft.package_id] || PACKAGE_LIMITS["surprise-website"];

const form = reactive({
  headline: draft.headline ?? (draft.recipient_name ? `Happy Birthday, ${draft.recipient_name}!` : ""),
  message: draft.message || "",
  sign_off: draft.sign_off ?? (draft.sender_name ? `Love, ${draft.sender_name}` : ""),
  music_track: draft.music_track || "",
  music_link: draft.music_link || "",
  password_enabled: draft.password_enabled ?? false,
  password: draft.password || "",
  password_hint: draft.password_hint || "",
  video_link: draft.video_link || "",
});

const sections = computed(() => [
  { id: "message", label: "Message", icon: "message", locked: false },
  { id: "photos", label: "Photos", icon: "photos", locked: false },
  { id: "music", label: "Music", icon: "music", locked: !packageLimits.has_music },
  { id: "password", label: "Password lock", icon: "lock", locked: !packageLimits.has_password },
  { id: "video", label: "Video clip", icon: "video", locked: !packageLimits.has_video },
  { id: "group", label: "Group wishes", icon: "group", locked: !packageLimits.has_group },
]);
const activeSection = ref("message");
const previewDevice = ref("phone");
const photos = ref([]);
const photoError = ref("");
const saveStatus = ref("");

const previewMessage = computed(() => {
  const text = form.message.trim() || "Your message will appear here.";
  return text.length > 110 ? `${text.slice(0, 110).trimEnd()}...` : text;
});
const previewPhotos = computed(() => {
  const count = previewDevice.value === "desktop" ? 3 : 2;
  return Array.from({ length: count }, (_, index) => photos.value[index] || null);
});
const musicLinkError = computed(() => {
  if (form.music_track !== "link" || !form.music_link.trim()) return "";
  return /^https:\/\/(www\.)?(youtube\.com|youtu\.be|open\.spotify\.com)\//.test(form.music_link.trim())
    ? ""
    : "Paste a YouTube or Spotify link.";
});

let autosaveTimer;
watch(
  form,
  () => {
    saveStatus.value = "Saving...";
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(persistDraft, AUTOSAVE_DELAY);
  },
  { deep: true },
);
onUnmounted(() => {
  clearTimeout(autosaveTimer);
  photos.value.forEach((photo) => URL.revokeObjectURL(photo.url));
});

function persistDraft() {
  updateOrderDraft({ ...form, photo_count: photos.value.length });
  saveStatus.value = "Saved";
}

function openSection(section) {
  if (section.locked) {
    router.push("/create/package");
    return;
  }
  activeSection.value = section.id;
}

// pinapaliit ang litrato hanggang 1600 px bago i-upload
async function resizePhoto(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_PHOTO_WIDTH / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
}

async function addPhotos(event) {
  photoError.value = "";
  const files = [...event.target.files];
  event.target.value = "";

  const remaining = packageLimits.max_photos - photos.value.length;
  if (files.length > remaining) {
    photoError.value = `Your package allows ${packageLimits.max_photos} photos.`;
  }

  for (const file of files.slice(0, remaining)) {
    try {
      const blob = await resizePhoto(file);
      photos.value.push({ id: crypto.randomUUID(), blob, url: URL.createObjectURL(blob) });
    } catch {
      photoError.value = `${file.name} could not be read. Try a JPG or PNG.`;
    }
  }
  persistDraft();
}

function removePhoto(id) {
  const photo = photos.value.find((item) => item.id === id);
  URL.revokeObjectURL(photo.url);
  photos.value = photos.value.filter((item) => item.id !== id);
  photoError.value = "";
  persistDraft();
}

function saveContent() {
  clearTimeout(autosaveTimer);
  persistDraft();
}
</script>

<style scoped>
.content-page {
  width: min(1490px, 92%);
  margin: 0 auto;
  padding: 30px 0 30px;
}
.section-title {
  margin: 0;
  color: #1c2344;
  font-size: 22px;
  font-weight: 900;
}
.section-intro {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 2px 0 17px;
  font-size: 13px;
  color: #1c2344;
}
.save-status {
  color: #768099;
  font-size: 11px;
  font-weight: 700;
}
.content-layout {
  display: grid;
  grid-template-columns: minmax(170px, 0.62fr) minmax(0, 1.45fr) minmax(250px, 0.82fr);
  align-items: stretch;
  gap: 14px;
}
.content-card {
  min-width: 0;
  border: 1px solid #e9e1d3;
  border-radius: 14px;
  background: #fff;
  padding: 14px;
}

/* ===== Section menu ===== */
.section-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 38px;
  border: 0;
  border-radius: 8px;
  background: none;
  padding: 8px 10px;
  color: #404a63;
  font-size: 12px;
  font-weight: 600;
  text-align: left;
}
.menu-item svg {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
}
.menu-label {
  flex: 1;
  min-width: 0;
}
.menu-item:hover {
  background: #f6f2ea;
}
.menu-item.active {
  background: #e8efff;
  color: #3265df;
  font-weight: 800;
}
.menu-item.locked {
  color: #a7adbb;
}
.count-badge {
  min-width: 22px;
  border-radius: 999px;
  background: #e8efff;
  padding: 2px 7px;
  color: #3265df;
  font-size: 10px;
  font-weight: 800;
  text-align: center;
}
.upgrade-badge {
  border-radius: 999px;
  background: #ffb629;
  padding: 2px 8px;
  color: #3d2b00;
  font-size: 9.5px;
  font-weight: 800;
}

/* ===== Editor ===== */
.editor-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
  color: #404a63;
  font-size: 11px;
  font-weight: 800;
}
.field input,
.field textarea {
  width: 100%;
  min-width: 0;
  min-height: 39px;
  border: 1px solid #e2dacb;
  border-radius: 8px;
  background: #fff;
  padding: 8px 10px;
  color: #27314f;
  font: inherit;
  font-size: 12px;
  font-weight: 500;
}
.field textarea {
  resize: vertical;
  line-height: 1.5;
}
.field input:focus,
.field textarea:focus {
  border-color: #3265df;
  outline: 2px solid #c9d8ff;
  outline-offset: 0;
}
.field input::placeholder,
.field textarea::placeholder {
  color: #8b93a4;
}
.field input[aria-invalid="true"] {
  border-color: #df4949;
}
.char-count {
  align-self: flex-end;
  color: #768099;
  font-size: 10px;
  font-weight: 600;
}
.field-error {
  color: #d83a3a;
  font-size: 11px;
  font-weight: 600;
}
.field-hint {
  margin: 0;
  color: #768099;
  font-size: 11px;
}
.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #404a63;
  font-size: 11px;
  font-weight: 800;
}
.block-head small {
  color: #768099;
  font-size: 10px;
  font-weight: 600;
}
.photos-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.photo-tile,
.photo-add {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 9px;
}
.photo-tile img {
  width: 100%;
  height: 100%;
  border-radius: 9px;
  object-fit: cover;
}
.tone-0 {
  background: #dbe6ff;
}
.tone-1 {
  background: #ffe7a8;
}
.tone-2 {
  background: #ffdbe4;
}
.tone-3 {
  background: #dcf2d8;
}
.remove-photo {
  position: absolute;
  top: -5px;
  right: -5px;
  display: grid;
  width: 18px;
  height: 18px;
  place-items: center;
  border: 1px solid #e2dacb;
  border-radius: 50%;
  background: #fff;
  padding: 0;
  color: #404a63;
}
.remove-photo svg {
  width: 10px;
  height: 10px;
}
.photo-add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: 1px dashed #c9d3ea;
  color: #3265df;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}
.photo-add:focus-within {
  outline: 3px solid #9bb7ff;
  outline-offset: 2px;
}
.photo-add input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}
.photo-add svg {
  width: 18px;
  height: 18px;
}
.radio-option,
.copy-option {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #404a63;
  font-size: 12px;
}
.radio-option small {
  color: #768099;
}
.radio-option input,
.copy-option input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: #3265df;
}

/* ===== Live preview ===== */
.preview-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #1c2344;
  font-size: 11px;
  font-weight: 800;
}
.device-toggle {
  display: flex;
  gap: 4px;
}
.device-toggle button {
  display: grid;
  width: 26px;
  height: 22px;
  place-items: center;
  border: 1px solid #e2dacb;
  border-radius: 6px;
  background: #fff;
  padding: 0;
  color: #404a63;
}
.device-toggle button.active {
  border-color: #1c2344;
  background: #1c2344;
  color: #fff;
}
.device-toggle svg {
  width: 13px;
  height: 13px;
}
.device {
  display: flex;
  align-self: center;
  width: 100%;
  border: 7px solid #1c2344;
  background: #1c2344;
}
.device-phone {
  flex: 1;
  max-width: 270px;
  min-height: 440px;
  border-radius: 30px;
}
.device-desktop {
  max-width: 100%;
  margin-block: auto;
  aspect-ratio: 16 / 11;
  border-width: 8px 8px 18px;
  border-radius: 12px;
}
.device-screen {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  border-radius: 23px;
  background: #fff;
}
.device-desktop .device-screen {
  border-radius: 4px;
}
.preview-hero {
  position: relative;
  flex: 0 0 auto;
  height: 160px;
  background: linear-gradient(#e3edff 0 70%, #fde9be 70%);
}
.device-desktop .preview-hero {
  height: 38%;
}
.balloon {
  position: absolute;
  width: 24px;
  height: 30px;
  border-radius: 50% 50% 48% 48%;
}
.balloon::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  width: 1px;
  height: 24px;
  background: #9aa3b8;
}
.balloon-blue {
  top: 20px;
  left: 10px;
  background: #3f74ef;
}
.balloon-yellow {
  top: 8px;
  left: 34px;
  background: #ffc13b;
}
.balloon-red {
  top: 12px;
  right: 30px;
  background: #ff7d7d;
}
.balloon-navy {
  top: 32px;
  right: 6px;
  background: #3a5bd0;
}
.cake {
  position: absolute;
  bottom: 24px;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateX(-50%);
}
.candles {
  display: flex;
  gap: 5px;
  margin-bottom: 1px;
}
.candles i {
  width: 4px;
  height: 14px;
  border-radius: 2px;
  background: #ffb629;
}
.cake-top {
  width: 64px;
  height: 20px;
  border-radius: 8px 8px 0 0;
  background: #ff9fb3;
}
.cake-base {
  width: 76px;
  height: 20px;
  border-radius: 0 0 5px 5px;
  background: #fff;
  box-shadow: inset 0 -3px 0 #ffd2dc;
}
.preview-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 16px 16px 20px;
  text-align: center;
}
.preview-body h3 {
  margin: 0 0 10px;
  color: #3265df;
  font-family: var(--sl-font-display);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.15;
  overflow-wrap: anywhere;
}
.preview-message {
  margin: 0 0 14px;
  color: #69738a;
  font-size: 11px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.preview-photos {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 8px;
  margin-bottom: 14px;
}
.preview-photo {
  height: 54px;
  overflow: hidden;
  border-radius: 6px;
}
.device-desktop .preview-photo {
  height: 64px;
}
.preview-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.preview-signoff {
  margin: auto 0 0;
  color: #404a63;
  font-size: 11px;
  font-style: italic;
  overflow-wrap: anywhere;
}
.watermark {
  position: absolute;
  top: 54%;
  left: 50%;
  color: rgba(28, 35, 68, 0.13);
  font-family: var(--sl-font-display);
  font-size: 40px;
  font-weight: 700;
  letter-spacing: 4px;
  pointer-events: none;
  transform: translate(-50%, -50%) rotate(-30deg);
  user-select: none;
}

/* ===== Actions ===== */
.form-actions {
  display: flex;
  grid-column: 1 / -1;
  justify-content: space-between;
  gap: 12px;
  margin-top: 2px;
}
.back-button,
.continue-button {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 800;
}
.back-button {
  border: 1px solid #d9d0c0;
  background: #fff;
  color: #1c2344;
}
.continue-button {
  border: 0;
  background: #3265df;
  color: #fff;
}
.continue-button svg {
  width: 17px;
  height: 17px;
}

@media (max-width: 1000px) {
  .content-layout {
    grid-template-columns: minmax(160px, 0.6fr) minmax(0, 1.4fr);
  }
  .preview-card {
    grid-column: 1 / -1;
  }
}
@media (max-width: 760px) {
  .content-page {
    width: auto;
    padding: 24px 18px 32px;
  }
  .content-layout {
    grid-template-columns: 1fr;
  }
  .section-menu {
    flex-direction: row;
    overflow-x: auto;
  }
  .menu-item {
    flex: 0 0 auto;
  }
  .menu-label {
    flex: 0 0 auto;
  }
}
@media (max-width: 480px) {
  .content-page {
    padding-inline: 14px;
  }
}
</style>
