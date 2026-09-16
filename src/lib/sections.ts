/** Page sections, in page order. The index is also the camera keyframe index. */
export const sections = [
  { id: "hero", label: "Огляд" },
  { id: "feel", label: "Відчуття" },
  { id: "anatomy", label: "Анатомія" },
  { id: "configurator", label: "Конфігуратор" },
  { id: "order", label: "Замовлення" },
] as const;

export type SectionId = (typeof sections)[number]["id"];
