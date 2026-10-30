// Iisang listahan ng packages, templates at music — ginagamit ng frontend AT ng server.
// Dito lang magpalit ng presyo o limits para pareho ang ipinapakita at ang sinisingil.

export const PACKAGES = {
  "greeting-card": {
    id: "greeting-card",
    name: "Greeting Card",
    description: "One animated card with your message",
    price: 149,
    max_photos: 3,
    has_music: false,
    has_video: false,
    has_password: false,
    has_group: false,
    isPopular: false,
    icon: "mail",
    tone: "blue",
  },
  "surprise-website": {
    id: "surprise-website",
    name: "Surprise Website",
    description: "A full page with photo and music",
    price: 299,
    max_photos: 10,
    has_music: true,
    has_video: false,
    has_password: true,
    has_group: false,
    isPopular: true,
    icon: "image",
    tone: "gold",
  },
  "complete-surprise": {
    id: "complete-surprise",
    name: "Complete Surprise",
    description: "Everything, plus video and group wishes",
    price: 449,
    max_photos: 20,
    has_music: true,
    has_video: true,
    has_password: true,
    has_group: true,
    isPopular: false,
    icon: "sparkles",
    tone: "blue",
  },
};

export const DEFAULT_PACKAGE_ID = "surprise-website";

// mga larawan at posisyon ng button ay nasa src/data/templates.js (frontend lang)
export const TEMPLATES = [
  {
    id: "soft-celebration",
    occasion: "birthday",
    number: "01",
    name: "Soft Celebration",
    heading: "To a very special you",
    style: "Cute",
  },
  {
    id: "starry-night",
    occasion: "birthday",
    number: "02",
    name: "Starry Night",
    heading: "Make a Wish",
    style: "Dark",
    isNew: true,
  },
  {
    id: "memory-lane",
    occasion: "birthday",
    number: "03",
    name: "Memory Lane",
    heading: "Another Chapter",
    style: "Fun",
  },
  {
    id: "happy-vibes",
    occasion: "birthday",
    number: "04",
    name: "Happy Vibes",
    heading: "Good Vibes Only!",
    style: "Fun",
  },
  {
    id: "timeless-elegance",
    occasion: "birthday",
    number: "05",
    name: "Timeless Elegance",
    heading: "A Brighter Year Ahead",
    style: "Elegant",
  },
  {
    id: "ocean-breeze",
    occasion: "birthday",
    number: "06",
    name: "Ocean Breeze",
    heading: "Same Sun Brighter You",
    style: "Minimal",
  },
  {
    id: "garden-bloom",
    occasion: "birthday",
    number: "07",
    name: "Garden Bloom",
    heading: "Bloom and Shine",
    style: "Cute",
  },
  {
    id: "cozy-corner",
    occasion: "birthday",
    number: "08",
    name: "Cozy Corner",
    heading: "Cozy Moments",
    style: "Dark",
  },
];

// kapareho ng "action" sa CelebrateTemp (walang "/")
export const OCCASION_IDS = [
  "birthday",
  "monthsary",
  "anniversary",
  "wedding",
  "graduation",
  "debut",
  "reveal",
  "thanks",
  "congrats",
  "smile",
];

// lisensyadong listahan ng musika; "link" = YouTube/Spotify link ng user
export const TRACKS = [
  { id: "happy-day", name: "Happy Day (acoustic)", length: "2:41" },
  { id: "sunny-ukulele", name: "Sunny Ukulele", length: "2:12" },
  { id: "warm-piano", name: "Warm Piano", length: "3:05" },
];

export const PAYMENT_METHODS = ["gcash", "card"];

export const ORDER_STATUS = {
  DRAFT: "draft",
  PENDING_PAYMENT: "pending_payment",
  PAID: "paid",
  SCHEDULED: "scheduled",
  SENT: "sent",
  FAILED: "failed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
};

// bayad na: hindi na puwedeng i-edit ang order
export const PAID_STATUSES = [ORDER_STATUS.PAID, ORDER_STATUS.SCHEDULED, ORDER_STATUS.SENT];

export const MESSAGE_LIMIT = 1000;
export const MIN_SCHEDULE_MINUTES = 10;
export const MUSIC_LINK_PATTERN =
  /^https:\/\/(www\.)?(youtube\.com|youtu\.be|open\.spotify\.com)\//;
