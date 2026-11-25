// Iba-iba ang hugis ng litrato sa bawat template: { src, caption } ang sa mga ito, URL lang ang sa iba
const CAPTIONED_TEMPLATES = ["soft-celebration", "starry-night", "memory-lane", "memory-matrix"];

// Walang caption na isinusulat ang customer, kaya blangko (hindi sample) ang ilalagay
export function templatePhotos(templateId, photos) {
  const urls = (photos ?? []).filter(Boolean);
  if (urls.length === 0) return {}; // sample muna ang lalabas
  if (CAPTIONED_TEMPLATES.includes(templateId)) {
    return { photos: urls.map((src) => ({ src, caption: "" })) };
  }
  return { photos: urls, captions: urls.map(() => " ") };
}
