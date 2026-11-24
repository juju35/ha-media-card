// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------
import { pickerDefine } from "./card-picker.js";
import { VERSION } from "./core.js";
import { MediaCard, MediaMiniCard } from "./cards.js";
import { MediaCardEditor, MediaMiniCardEditor } from "./visual-editors.js";

export const define = (name, cls) => {
  if (!customElements.get(name)) pickerDefine(name, cls);
};
define("media-card", MediaCard);
define("media-mini-card", MediaMiniCard);
define("media-card-editor", MediaCardEditor);
define("media-mini-card-editor", MediaMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  {
    type: "media-card",
    name: "Media Card",
    description: "Media player and multiroom speakers: artwork, progress, controls, volume per room, speaker groups, source, queue and favorites.",
  },
  {
    type: "media-mini-card",
    name: "Media Mini Card",
    description: "Compact media player: artwork, track, play / pause, next and volume.",
  },
]) {
  if (!window.customCards.some((c) => c.type === card.type)) window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-media-card" });
}

console.info(`%c MEDIA-CARD %c v${VERSION} `, "color: white; background: #03a9f4; font-weight: 700;", "color: #03a9f4; background: white; font-weight: 700;");
