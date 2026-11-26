import { defineAsyncComponent } from "vue";

import { templatePhotos } from "@/utils/surprisePhotos";

// Lahat ng template na may interactive na bersyon. Lazy para hindi lahat nilo-load nang sabay.
// Ginagamit ng pahina ng tatanggap (/s/:slug) at ng Live preview sa Content step.
export const surpriseComponents = {
  "soft-celebration": defineAsyncComponent(() => import("./BirthdaySoftCelebration.vue")),
  "starry-night": defineAsyncComponent(() => import("./BirthdayStarryNight.vue")),
  "memory-matrix": defineAsyncComponent(() => import("./BirthdayMemoryMatrix.vue")),
  "cozy-corner": defineAsyncComponent(() => import("./BirthdayCozyCorner.vue")),
  "happy-vibes": defineAsyncComponent(() => import("./BirthdayGoldenHour.vue")),
  "timeless-elegance": defineAsyncComponent(() => import("./BirthdayTimelessElegance.vue")),
  "ocean-breeze": defineAsyncComponent(() => import("./BirthdayOceanBreeze.vue")),
  "garden-bloom": defineAsyncComponent(() => import("./BirthdayGardenBloom.vue")),
  "monthsary-template-1": defineAsyncComponent(() => import("./MonthsaryTemplate1.vue")),
  "monthsary-template-2": defineAsyncComponent(() => import("./MonthsaryTemplate2.vue")),
  "monthsary-template-3": defineAsyncComponent(() => import("./MonthsaryTemplate3.vue")),
};

// Mga template na direktang ine-edit sa loob mismo ng template (click sa text o litrato)
export const INLINE_EDIT_TEMPLATES = ["soft-celebration"];

// Ang laman na ipinapasa sa template. Ang wala pa (hal. walang message) ay sample muna ang lalabas.
// template_content = mga in-edit sa loob ng template; photo_urls = { photo id: link }
export function surpriseContent(
  templateId,
  { recipient_name, sender_name, message, photos, template_content, photo_urls } = {},
) {
  if (template_content?.template === templateId) {
    const { template: _template, photos: slots, ...texts } = template_content;
    return {
      ...(recipient_name && { recipient: recipient_name }),
      ...(sender_name && { sender: sender_name }),
      ...texts,
      // walang litrato sa slot = ang sample na litrato ng template ang lalabas doon
      ...(Array.isArray(slots) && {
        photos: slots.map((slot) => ({
          src: (slot.photo && photo_urls?.[slot.photo]) || "",
          caption: slot.caption ?? "",
          photo: slot.photo || "",
        })),
      }),
    };
  }
  return Object.fromEntries(
    Object.entries({
      recipient: recipient_name,
      sender: sender_name,
      message: message?.trim() ? message : "",
      ...templatePhotos(templateId, photos),
    }).filter(([, value]) => value),
  );
}
