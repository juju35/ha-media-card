// The README screenshots (PNG) and animations (GIF) rendered by scripts/screenshots.mjs.
// Every light capture has a "-dark" twin that shows exactly the same state: only the theme differs (checked by
// test/screenshots.test.mjs), as in the other ha-* cards.
import { buffering, paused } from "./mock-states.mjs";

const LIVING = "media_player.living_room";
const ALL = ["rooms", "source", "queue", "favorites"];
const pair = (file, rest) => [
  { file, theme: "light", ...rest },
  { file: `${file}-dark`, theme: "dark", ...rest },
];

export const shots = [
  ...pair("card", { type: "media-card", width: 460, config: { entity: LIVING } }),
  ...pair("card-queue", { type: "media-card", width: 460, config: { entity: LIVING, collapsed: ["rooms", "source", "favorites"] } }),
  ...pair("card-sonos", { type: "media-card", width: 460, config: { entity: "media_player.lounge", collapsed: ["queue"] } }),
  ...pair("card-receiver", { type: "media-card", width: 460, config: { entity: "media_player.home_cinema", collapsed: [] } }),
  ...pair("card-ungroup", { type: "media-card", width: 460, config: { entity: LIVING }, clicks: ['[data-action="ungroup_all"]'] }),
  ...pair("mini-card", { type: "media-mini-card", width: 380, config: { entity: LIVING } }),
  ...pair("mini-card-spotify", { type: "media-mini-card", width: 380, config: { entity: "media_player.spotify" } }),
  ...pair("mini-card-tv", { type: "media-mini-card", width: 380, config: { entity: "media_player.tv" } }),
  ...pair("mini-card-zoom", { type: "media-mini-card", width: 460, config: { entity: LIVING, collapsed: ["source", "queue", "favorites"] }, clicks: [".zoom"] }),
  // Narrow cards: the full card at 6 of 12 columns of a phone's Sections view, the mini card likewise.
  ...pair("card-narrow", { type: "media-card", width: 238, config: { entity: LIVING, collapsed: ALL } }),
  ...pair("mini-card-narrow", { type: "media-mini-card", width: 170, config: { entity: LIVING } }),
];

// One looping GIF per distinct animation of the card (each plays different keyframes):
//   playing   — the record slides out of the sleeve and turns, the equalizer bars bounce (mc-slide, mc-spin, mc-eq)
//   paused    — the record stops, the equalizer glows slowly (mc-glow)
//   buffering — a ring turns over the artwork (mc-spin)
//   speaker   — no artwork: the drawn speaker's woofer beats and sound waves leave it (mc-beat, mc-wave)
//   tv        — the drawn TV's screen glows (mc-glow on the picture)
//   group     — rings around the playing rooms of the group (mc-ring)
export const gifs = [
  ...pair("playing", { type: "media-card", width: 460, config: { entity: LIVING, collapsed: ALL }, overrides: {} }),
  ...pair("paused", { type: "media-card", width: 460, config: { entity: LIVING, collapsed: ALL }, overrides: paused }),
  ...pair("buffering", { type: "media-card", width: 460, config: { entity: LIVING, collapsed: ALL }, overrides: buffering }),
  ...pair("speaker", { type: "media-card", width: 460, config: { entity: "media_player.bathroom", collapsed: ALL }, overrides: {} }),
  ...pair("tv", { type: "media-card", width: 460, config: { entity: "media_player.tv", collapsed: ALL }, overrides: {} }),
  ...pair("group", { type: "media-card", width: 460, config: { entity: LIVING, show_controls: false, show_progress: false, show_volume: false, collapsed: ["source", "queue", "favorites"] }, overrides: {} }),
];
