// The README screenshots (PNG) and animations (GIF) rendered by scripts/screenshots.mjs.
// Every light capture has a "-dark" twin that shows exactly the same state: only the theme differs (checked by
// test/screenshots.test.mjs), as in the other ha-* cards.
import { FAMILY_PLAYERS, buffering, paused } from "./mock-states.mjs";

const LIVING = "media_player.living_room";
const ALL = ["rooms", "source", "queue", "favorites"];
const PLAYERS = [LIVING, "media_player.lounge", "media_player.spotify", "media_player.office"];
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
  // Several players (`players`): stacked in the full card, filtered with only_playing, listed in the mini card.
  ...pair("card-players", { type: "media-card", width: 460, config: { players: [LIVING, "media_player.lounge", "media_player.tv"] } }),
  ...pair("card-players-playing", { type: "media-card", width: 460, config: { players: PLAYERS, only_playing: true } }),
  ...pair("mini-card-players", { type: "media-mini-card", width: 380, config: { players: PLAYERS } }),
  ...pair("mini-card-players-open", { type: "media-mini-card", width: 380, config: { players: PLAYERS }, clicks: ['[data-action="expand_player"][data-target="media_player.lounge"]'] }),
  // Jellyfin (an episode, the client app in the subtitle) and Alexa Media Player (last called, next alarm and timer,
  // do not disturb), with the extra mock players; stacked, the idle Jellyfin session is left out.
  ...pair("card-jellyfin", { type: "media-card", width: 460, extras: true, config: { entity: "media_player.living_room_tv" } }),
  ...pair("card-alexa", { type: "media-card", width: 460, extras: true, config: { entity: "media_player.kitchen_echo" } }),
  ...pair("mini-card-alexa", { type: "media-mini-card", width: 380, extras: true, config: { entity: "media_player.kitchen_echo" } }),
  ...pair("card-players-jellyfin-alexa", {
    type: "media-card",
    width: 460,
    extras: true,
    config: { players: ["media_player.kitchen_echo", "media_player.living_room_tv", "media_player.web_browser", "media_player.everywhere"] },
  }),
  // Apple TV (episode in an app, its apps as sources, the remote) and a HomePod.
  ...pair("card-apple-tv", { type: "media-card", width: 460, extras: true, config: { entity: "media_player.family_room_apple_tv", show_remote: true, collapsed: ["queue", "favorites"] } }),
  ...pair("card-homepod", { type: "media-card", width: 460, extras: true, config: { entity: "media_player.study_homepod" } }),
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
  // Drawn device pictures by model family (no artwork): the light ring or halo glows, the body beats while playing.
  ...Object.entries(FAMILY_PLAYERS).flatMap(([family, entity]) =>
    pair(`picture-${family.replace(/_/g, "-")}`, { type: "media-card", width: 460, extras: true, config: { entity, collapsed: ALL }, overrides: {} }),
  ),
  // The small mesh speaker straight on, in the mini card.
  ...pair("picture-homepod-mini-front", { type: "media-mini-card", width: 380, extras: true, config: { entity: FAMILY_PLAYERS.homepod_mini }, overrides: {} }),
  ...pair("group", { type: "media-card", width: 460, config: { entity: LIVING, show_controls: false, show_progress: false, show_volume: false, collapsed: ["source", "queue", "favorites"] }, overrides: {} }),
];
