import {
  MESSAGE_LIMIT,
  MUSIC_LINK_PATTERN,
  OCCASION_IDS,
  PACKAGES,
  TEMPLATES,
  TRACKS,
  VIDEO_LINK_PATTERN,
} from "../../src/shared/catalog.js";

// Longest text allowed per field
const TEXT_LIMITS = {
  recipient_name: 80,
  recipient_email: 254,
  sender_name: 80,
  sender_email: 254,
  headline: 160,
  message: MESSAGE_LIMIT,
  sign_off: 120,
  music_link: 300,
  video_link: 300,
  password: 40,
  password_hint: 80,
};
const MULTILINE = ["message"];
const BOOLEANS = ["is_group", "send_copy", "password_enabled"];
const CHOICES = {
  occasion: OCCASION_IDS,
  template_id: TEMPLATES.map((template) => template.id),
  package_id: Object.keys(PACKAGES),
  music_track: [...TRACKS.map((track) => track.id), "link"],
  delivery_mode: ["now", "scheduled"],
};

// Control characters could break an email header, so only the message may have tabs and line breaks
function hasControlCharacter(text, allowLines) {
  return [...text].some((ch) => {
    const code = ch.charCodeAt(0);
    if (allowLines && (code === 9 || code === 10 || code === 13)) return false;
    return code < 32 || code === 127;
  });
}

const label = (field) => field.replace(/_id$/, "").replaceAll("_", " ");
const isBlank = (value) => value === undefined || value === null || value === "";

// Limits for template_content: the text and photo slots edited inside a template
const TEMPLATE_CONTENT_BYTES = 20000;
const TEMPLATE_KEY_PATTERN = /^[a-zA-Z]{1,32}$/;
const TEMPLATE_TEXT_MAX = MESSAGE_LIMIT;
const TEMPLATE_ITEM_MAX = 300;
const TEMPLATE_LIST_MAX = 20;
// a saved photo's id ("<time>-<uuid>.jpg"), or "" for the template's own sample photo
const SLOT_PHOTO_PATTERN = /^([\w-]{1,80}\.jpg)?$/;

const isPlainObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const badText = (value, max) => typeof value !== "string" || value.length > max || hasControlCharacter(value, true);

// Returns a message for the customer, or "" if it's fine
export function templateContentProblem(content) {
  if (isBlank(content)) return "";
  const invalid = "Your template changes couldn't be saved. Please refresh the page.";
  if (!isPlainObject(content)) return invalid;
  if (JSON.stringify(content).length > TEMPLATE_CONTENT_BYTES) return "Your template text is too long.";
  if (!TEMPLATES.some((template) => template.id === content.template)) return invalid;

  for (const [key, value] of Object.entries(content)) {
    if (!TEMPLATE_KEY_PATTERN.test(key)) return invalid;
    if (key === "template") continue;
    if (key === "photos") {
      if (!Array.isArray(value) || value.length > TEMPLATE_LIST_MAX) return invalid;
      if (!value.every((slot) => isPlainObject(slot) && SLOT_PHOTO_PATTERN.test(slot.photo ?? ""))) return invalid;
      if (value.some((slot) => badText(slot.caption ?? "", TEMPLATE_ITEM_MAX))) return "A photo caption is too long.";
    } else if (Array.isArray(value)) {
      if (value.length > TEMPLATE_LIST_MAX) return invalid;
      if (value.some((item) => badText(item, TEMPLATE_ITEM_MAX))) return "One of your template lines is too long.";
    } else if (badText(value, TEMPLATE_TEXT_MAX)) {
      return "One of your template texts is too long.";
    }
  }
  return "";
}

// Checks what a draft contains, not whether it's finished: customers save half-filled forms.
// Returns a message for the customer, or "" if it's fine.
export function draftProblem(draft) {
  if (typeof draft !== "object" || draft === null || Array.isArray(draft)) return "Invalid order.";

  for (const [field, max] of Object.entries(TEXT_LIMITS)) {
    const value = draft[field];
    if (isBlank(value)) continue;
    if (typeof value !== "string") return `The ${label(field)} must be text.`;
    if (value.length > max) return `The ${label(field)} is too long (${max} characters at most).`;
    if (hasControlCharacter(value, MULTILINE.includes(field))) return `The ${label(field)} has characters that aren't allowed.`;
  }
  for (const [field, options] of Object.entries(CHOICES)) {
    if (!isBlank(draft[field]) && !options.includes(draft[field])) {
      return `Please choose the ${label(field)} again.`;
    }
  }
  for (const field of BOOLEANS) {
    if (!isBlank(draft[field]) && typeof draft[field] !== "boolean") return `Invalid ${label(field)}.`;
  }
  const templateProblem = templateContentProblem(draft.template_content);
  if (templateProblem) return templateProblem;
  if (!isBlank(draft.scheduled_at)) {
    if (typeof draft.scheduled_at !== "string" || Number.isNaN(Date.parse(draft.scheduled_at))) {
      return "Choose a valid delivery date and time.";
    }
  }
  return "";
}

// The database doesn't take "" for these, and null for a yes/no column would be refused
export function cleanFields(fields) {
  const cleaned = { ...fields };
  for (const field of [...Object.keys(CHOICES), "scheduled_at"]) {
    if (cleaned[field] === "") cleaned[field] = null;
  }
  for (const field of [...BOOLEANS, "delivery_mode"]) {
    if (cleaned[field] === null) delete cleaned[field];
  }
  return cleaned;
}

const EMAIL_PATTERN = /^[^\s@,;:<>()[\]"\\]+@[^\s@,;:<>()[\]"\\]+\.[^\s@,;:<>()[\]"\\]+$/;
export const isEmail = (value) => EMAIL_PATTERN.test(value?.trim() ?? "");

export const isMusicLink = (value) => MUSIC_LINK_PATTERN.test(value ?? "");
export const isVideoLink = (value) => VIDEO_LINK_PATTERN.test(value ?? "");

// Checks a saved order is complete before any payment starts. Returns { field, error } or null.
// expectedPhotos is how many the customer sees in their browser
export function unpayableReason(order, delivery, content, photoCount, expectedPhotos) {
  const limits = PACKAGES[order.package_id];
  const problem = (field, error) => ({ field, error });

  if (!limits) return problem("package", "Choose a package first.");
  const template = TEMPLATES.find((item) => item.id === order.template_id);
  if (!template || template.occasion !== order.occasion) {
    return problem("template", "Choose a template first.");
  }
  if (!delivery?.recipient_name?.trim() || !delivery.sender_name?.trim()) {
    return problem("recipient", "Add the recipient and sender names first.");
  }
  if (!isEmail(delivery.recipient_email)) {
    return problem("recipient", "Check the recipient's email address.");
  }
  if (!isEmail(delivery.sender_email)) return problem("recipient", "Check your email address.");
  if (delivery.delivery_mode === "scheduled" && !(new Date(delivery.scheduled_at) > new Date())) {
    return problem("recipient", "Choose a delivery time in the future.");
  }
  if (!content?.message?.trim()) return problem("content", "Write your message first.");
  if (photoCount > limits.max_photos) {
    return problem(
      "content",
      `Your package allows ${limits.max_photos} photos. Please remove ${photoCount - limits.max_photos}.`,
    );
  }
  if (Number.isInteger(expectedPhotos) && expectedPhotos > photoCount) {
    return problem("content", "Some photos weren't saved. Go back to Content and add them again.");
  }
  if (limits.has_music && content.music_track === "link" && !isMusicLink(content.music_link)) {
    return problem("content", "Paste a YouTube or Spotify link for the music, or choose a track.");
  }
  if (limits.has_video && content.video_link && !isVideoLink(content.video_link)) {
    return problem("content", "Paste a YouTube link for the video, or leave it empty.");
  }
  if (content.password_enabled && !content.password_hash) {
    return problem("password", "Type the password for the password lock again, or turn it off.");
  }
  return null;
}
