// Mock Home Assistant registries and states of a multiroom home, used by the tests and to render the screenshots:
// a Music Assistant group (living room + kitchen) with an office and a bedroom speaker, a Sonos speaker with its
// favorites sensor, a receiver, a TV and a Cast speaker with no artwork, and Spotify. Names are neutral, and the
// artworks are drawn here (no real album cover).
export const states = {};
export const entities = {};

// Fixed "now" of the mock positions; the screenshot harness freezes Date.now() to it, so captures never move.
export const NOW = Date.parse("2026-11-13T10:00:00Z");
const at = new Date(NOW).toISOString();

// MediaPlayerEntityFeature bits, summed per kind of player.
const PAUSE = 1, SEEK = 2, VOLUME_SET = 4, VOLUME_MUTE = 8, PREV = 16, NEXT = 32, TURN_ON = 128, TURN_OFF = 256, PLAY_MEDIA = 512,
  VOLUME_STEP = 1024, SELECT_SOURCE = 2048, STOP = 4096, PLAY = 16384, SHUFFLE = 32768, SOUND_MODE = 65536, BROWSE = 131072, REPEAT = 262144, GROUPING = 524288;
const MUSIC = PAUSE | SEEK | VOLUME_SET | VOLUME_MUTE | PREV | NEXT | PLAY_MEDIA | VOLUME_STEP | STOP | PLAY | SHUFFLE | BROWSE | REPEAT;
export const FEATURES = {
  music_assistant: MUSIC | TURN_ON | TURN_OFF | GROUPING,
  sonos: MUSIC | SELECT_SOURCE | GROUPING,
  receiver: VOLUME_SET | VOLUME_MUTE | TURN_ON | TURN_OFF | VOLUME_STEP | SELECT_SOURCE | SOUND_MODE,
  tv: VOLUME_SET | VOLUME_MUTE | TURN_ON | TURN_OFF | PAUSE | PLAY | PLAY_MEDIA,
  cast: PAUSE | SEEK | VOLUME_SET | VOLUME_MUTE | PREV | NEXT | TURN_ON | TURN_OFF | PLAY_MEDIA | STOP | PLAY,
  spotify: PAUSE | SEEK | VOLUME_SET | PREV | NEXT | PLAY_MEDIA | SELECT_SOURCE | PLAY | SHUFFLE | REPEAT,
};

// Abstract artwork: a gradient with shapes, as a data URI.
const artwork = (a, b, shape) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <rect width="300" height="300" fill="url(#g)"/>${shape}</svg>`)}`;
export const ART = {
  city: artwork("#1a2a6c", "#b21f8a", `<circle cx="210" cy="96" r="46" fill="#ffd36e" opacity=".9"/><path d="M0 300V190h40v-40h36v60h30v-90h44v120h26v-70h40v40h34v-20h50v110z" fill="#0b1026" opacity=".85"/>`),
  sea: artwork("#f6a96b", "#2b6f9e", `<circle cx="150" cy="150" r="54" fill="#fff3d6" opacity=".9"/><path d="M0 200q37-18 75 0t75 0 75 0 75 0v100H0z" fill="#1d4f73"/><path d="M0 238q37-14 75 0t75 0 75 0 75 0v62H0z" fill="#153a56"/>`),
  forest: artwork("#134e3a", "#7fb77e", `<path d="M60 250l50-120 50 120zM140 250l60-150 60 150z" fill="#0b2e22" opacity=".85"/><circle cx="80" cy="80" r="24" fill="#f4f1de" opacity=".8"/>`),
  wave: artwork("#3a1c71", "#ffaf7b", `<path d="M0 170c50-60 100 60 150 0s100 60 150 0" stroke="#fff" stroke-width="10" fill="none" opacity=".8"/><path d="M0 210c50-60 100 60 150 0s100 60 150 0" stroke="#fff" stroke-width="6" fill="none" opacity=".5"/>`),
  jazz: artwork("#2c3e50", "#c0a062", `<circle cx="150" cy="150" r="80" fill="none" stroke="#f5e6c8" stroke-width="10" opacity=".8"/><circle cx="150" cy="150" r="20" fill="#f5e6c8" opacity=".8"/>`),
};

const player = (id, platform, name, state, features, attributes = {}) => {
  entities[id] = { entity_id: id, platform, device_id: `${id}_device` };
  states[id] = { entity_id: id, state, attributes: { friendly_name: name, supported_features: features, ...attributes } };
};

const track = (art, title, artist, album, duration, pos) => ({
  entity_picture: art,
  media_title: title,
  media_artist: artist,
  media_album_name: album,
  media_content_type: "music",
  media_content_id: `library://track/${title.toLowerCase().replace(/\W+/g, "-")}`,
  media_duration: duration,
  media_position: pos,
  media_position_updated_at: at,
});

// Music Assistant: the living room leads a group with the kitchen.
const group = ["media_player.living_room", "media_player.kitchen"];
const midnight = track(ART.city, "Midnight Avenue", "The Neon Drifters", "City Lights", 245, 83);
player("media_player.living_room", "music_assistant", "Living room", "playing", FEATURES.music_assistant, {
  ...midnight, volume_level: 0.42, is_volume_muted: false, shuffle: false, repeat: "all", group_members: group, mass_player_type: "player", active_queue: "living_room",
});
player("media_player.kitchen", "music_assistant", "Kitchen", "playing", FEATURES.music_assistant, {
  ...midnight, volume_level: 0.3, is_volume_muted: false, shuffle: false, repeat: "all", group_members: group, mass_player_type: "player",
});
player("media_player.office", "music_assistant", "Office", "idle", FEATURES.music_assistant, { volume_level: 0.25, is_volume_muted: true, group_members: [], mass_player_type: "player" });
player("media_player.bedroom", "music_assistant", "Bedroom", "off", FEATURES.music_assistant, { group_members: [], mass_player_type: "player" });

// Sonos, with its favorites sensor (sensor.sonos_favorites, items { item id: title }).
player("media_player.lounge", "sonos", "Lounge", "playing", FEATURES.sonos, {
  ...track(ART.sea, "Golden Hour", "Harbor Lights", "Seaside Sessions", 212, 54),
  volume_level: 0.35, is_volume_muted: false, shuffle: true, repeat: "off", queue_position: 3, queue_size: 12,
  source: "Seaside Sessions", source_list: ["Morning Jazz", "Seaside Sessions", "Rock Classics", "Line-in", "TV"], group_members: ["media_player.lounge"],
});
entities["sensor.sonos_favorites"] = { entity_id: "sensor.sonos_favorites", platform: "sonos" };
states["sensor.sonos_favorites"] = {
  entity_id: "sensor.sonos_favorites",
  state: "4",
  attributes: { friendly_name: "Sonos favorites", items: { "FV:2/31": "Morning Jazz", "FV:2/32": "Seaside Sessions", "FV:2/33": "Rock Classics", "FV:2/34": "Focus Beats" } },
};

// Receiver: sources and sound modes, no media.
player("media_player.home_cinema", "denonavr", "Home cinema", "on", FEATURES.receiver, {
  device_class: "receiver", volume_level: 0.5, is_volume_muted: false, source: "TV Audio", source_list: ["TV Audio", "Blu-ray", "Phono", "Tuner", "Bluetooth"],
  sound_mode: "Dolby Surround", sound_mode_list: ["Stereo", "Dolby Surround", "DTS Neural:X", "Direct"],
});

// TV switched on, and a Cast speaker playing a show with no artwork: the drawn pictures stand in.
player("media_player.tv", "cast", "TV", "on", FEATURES.tv, { device_class: "tv", app_name: "Streaming app", volume_level: 0.18, is_volume_muted: false });
player("media_player.bathroom", "cast", "Bathroom speaker", "playing", FEATURES.cast, {
  device_class: "speaker", media_title: "Morning Briefing", media_artist: "City Radio", media_content_type: "music", media_duration: 1800, media_position: 420,
  media_position_updated_at: at, volume_level: 0.22, is_volume_muted: false, app_name: "Podcasts",
});

// Spotify: Spotify Connect devices as sources.
player("media_player.spotify", "spotify", "Spotify", "playing", FEATURES.spotify, {
  ...track(ART.wave, "Paper Planes", "Skyline Echo", "Long Weekend", 198, 121),
  volume_level: 0.6, shuffle: true, repeat: "one", source: "Living room", source_list: ["Living room", "Kitchen", "Office", "Phone"],
});

// music_assistant.get_queue response for the living room.
export const QUEUE = {
  queue_id: "living_room",
  active: true,
  name: "Living room",
  items: 18,
  shuffle_enabled: false,
  repeat_mode: "all",
  current_index: 4,
  elapsed_time: 83,
  current_item: {
    queue_item_id: "q4",
    name: "The Neon Drifters - Midnight Avenue",
    duration: 245,
    media_item: { media_type: "track", name: "Midnight Avenue", image: ART.city, artists: [{ name: "The Neon Drifters" }], album: { name: "City Lights" } },
  },
  next_item: {
    queue_item_id: "q5",
    name: "The Neon Drifters - Evergreen",
    duration: 231,
    media_item: { media_type: "track", name: "Evergreen", image: ART.forest, artists: [{ name: "The Neon Drifters" }], album: { name: "City Lights" } },
  },
};

// Jellyfin sessions and Alexa Media Player Echo speakers, kept apart from the home above (whose players, tests and
// captures stay as they are): `withExtras()` returns the home with them, and `devices` the device registry.
export const devices = {};
export const extraStates = {};
export const extraEntities = {};
const extra = (id, platform, name, state, features, attributes = {}, device = {}) => {
  const device_id = `${id}_device`;
  extraEntities[id] = { entity_id: id, platform, device_id };
  extraStates[id] = { entity_id: id, state, attributes: { friendly_name: name, supported_features: features, ...attributes } };
  devices[device_id] = { id: device_id, name, ...device };
  return device_id;
};
const extraEntity = (id, platform, device_id, translation_key, state, attributes = {}) => {
  extraEntities[id] = { entity_id: id, platform, device_id, translation_key };
  extraStates[id] = { entity_id: id, state, attributes };
};
const JELLYFIN = PAUSE | SEEK | VOLUME_SET | VOLUME_MUTE | PLAY_MEDIA | STOP | PLAY | BROWSE;
// Alexa Media Player: SUPPORT_ALEXA (play, pause, stop, previous, next, volume set / mute, play media).
const ALEXA = PAUSE | VOLUME_SET | VOLUME_MUTE | PREV | NEXT | PLAY_MEDIA | STOP | PLAY | SHUFFLE | REPEAT;
export const EXTRA_FEATURES = { jellyfin: JELLYFIN, alexa: ALEXA };

// Jellyfin: an episode on the living room TV app, and a web browser session left open with nothing playing.
extra(
  "media_player.living_room_tv",
  "jellyfin",
  "Living room TV",
  "playing",
  JELLYFIN,
  {
    entity_picture: ART.sea,
    media_content_type: "tvshow",
    media_title: "The Lighthouse Keeper",
    media_series_title: "Harbor Tales",
    media_season: 2,
    media_episode: 5,
    media_duration: 2640,
    media_position: 1210,
    media_position_updated_at: at,
    volume_level: 0.6,
    is_volume_muted: false,
  },
  { manufacturer: "Jellyfin", model: "Jellyfin Android TV" },
);
extra("media_player.web_browser", "jellyfin", "Web browser", "idle", JELLYFIN, {}, { manufacturer: "Jellyfin", model: "Jellyfin Web" });

// Alexa Media Player: a kitchen Echo playing a station (the last one spoken to), with its do-not-disturb switch and
// its next alarm and timer, and the "Everywhere" speaker group.
const echo = extra(
  "media_player.kitchen_echo",
  "alexa_media",
  "Kitchen Echo",
  "playing",
  ALEXA,
  {
    entity_picture: ART.jazz,
    media_content_type: "music",
    media_title: "Morning Jazz",
    media_artist: "Harbor FM",
    volume_level: 0.35,
    is_volume_muted: false,
    last_called: true,
    last_called_summary: "play morning jazz",
  },
  { manufacturer: "Amazon", model: "Echo Dot (5th Gen)" },
);
extraEntity("switch.kitchen_echo_do_not_disturb_switch", "alexa_media", echo, "do_not_disturb", "off");
extraEntity("sensor.kitchen_echo_next_alarm", "alexa_media", echo, "next_alarm", new Date(NOW + 20 * 3600_000).toISOString(), { device_class: "timestamp" });
extraEntity("sensor.kitchen_echo_next_timer", "alexa_media", echo, "next_timer", new Date(NOW + 12 * 60_000).toISOString(), { device_class: "timestamp" });
extraEntity("sensor.kitchen_echo_next_reminder", "alexa_media", echo, "next_reminder", "unavailable", { device_class: "timestamp" });
extra("media_player.everywhere", "alexa_media", "Everywhere", "idle", ALEXA, { last_called: false }, { manufacturer: "Amazon", model: "Speaker Group" });

// Apple TV (core apple_tv): an Apple TV box playing an episode in an app (its apps as sources) with its remote
// entity, and a HomePod playing music. pyatv names the models "Apple TV 4K", "HomePod", "HomePod Mini"…
const APPLE_TV = PAUSE | SEEK | VOLUME_SET | PREV | NEXT | TURN_ON | TURN_OFF | PLAY_MEDIA | VOLUME_STEP | SELECT_SOURCE | STOP | PLAY | BROWSE;
const HOMEPOD = PAUSE | SEEK | VOLUME_SET | PREV | NEXT | TURN_ON | TURN_OFF | PLAY_MEDIA | VOLUME_STEP | STOP | PLAY | SHUFFLE | REPEAT;
EXTRA_FEATURES.apple_tv = APPLE_TV;
EXTRA_FEATURES.homepod = HOMEPOD;
const atv = extra(
  "media_player.family_room_apple_tv",
  "apple_tv",
  "Family room Apple TV",
  "playing",
  APPLE_TV,
  {
    app_id: "com.example.tv",
    app_name: "TV",
    source_list: ["TV", "Music", "Photos", "Arcade"],
    media_content_type: "tvshow",
    media_title: "The Long Crossing",
    media_series_title: "Northern Lights",
    media_season: "1",
    media_episode: "4",
    media_duration: 2900,
    media_position: 640,
    media_position_updated_at: at,
    volume_level: 0.4,
  },
  { manufacturer: "Apple", model: "Apple TV 4K (gen 3)" },
);
extraEntity("remote.family_room_apple_tv", "apple_tv", atv, undefined, "on");
extra(
  "media_player.study_homepod",
  "apple_tv",
  "Study HomePod",
  "playing",
  HOMEPOD,
  { media_content_type: "music", media_title: "Slow Tides", media_artist: "The Quiet Harbors", media_duration: 212, media_position: 40, media_position_updated_at: at, volume_level: 0.3 },
  { manufacturer: "Apple", model: "HomePod (gen 2)" },
);

// Philips TV (core philips_js): a TV on an app (its channels and apps as sources) with its remote, its Ambilight
// light, its Ambilight + Hue and screen switches and its recording sensors on the same device.
const PHILIPS = PAUSE | VOLUME_SET | VOLUME_MUTE | PREV | NEXT | TURN_ON | TURN_OFF | PLAY_MEDIA | VOLUME_STEP | SELECT_SOURCE | STOP | PLAY | BROWSE;
const ptv = extra(
  "media_player.bedroom_philips_tv",
  "philips_js",
  "Bedroom Philips TV",
  "on",
  PHILIPS,
  { device_class: "tv", source: "Netflix", source_list: ["TV", "Netflix", "YouTube", "HDMI 1"], app_name: "Netflix", volume_level: 0.25 },
  { manufacturer: "Philips", model: "55PUS6753/12" },
);
extraEntity("remote.bedroom_philips_tv_remote", "philips_js", ptv, "remote", "on");
extraEntity("light.bedroom_philips_tv_ambilight", "philips_js", ptv, "ambilight", "on");
extraEntity("switch.bedroom_philips_tv_ambilight_hue", "philips_js", ptv, "ambilight_hue", "off");
extraEntity("switch.bedroom_philips_tv_screen_state", "philips_js", ptv, "screen_state", "on");
extraEntity("binary_sensor.bedroom_philips_tv_recording_ongoing", "philips_js", ptv, "recording_ongoing", "on");
extraEntity("binary_sensor.bedroom_philips_tv_new_recording_available", "philips_js", ptv, "recording_new", "off");

// One player per drawn device family, playing with no artwork (the pictures and their animations).
export const FAMILY_PLAYERS = {};
for (const [family, platform, model, maker] of [
  ["echo", "alexa_media", "Echo (Gen2)", "Amazon"],
  ["echo_studio", "alexa_media", "Echo Studio", "Amazon"],
  ["echo_dot", "alexa_media", "Echo Dot (Gen5)", "Amazon"],
  ["echo_dot_puck", "alexa_media", "Echo Dot (Gen3)", "Amazon"],
  ["echo_pop", "alexa_media", "Echo Pop", "Amazon"],
  ["echo_show", "alexa_media", "Echo Show 10 (Gen3)", "Amazon"],
  ["echo_show_small", "alexa_media", "Echo Show 5 (Gen2)", "Amazon"],
  ["homepod", "apple_tv", "HomePod", "Apple"],
  ["homepod_mini", "apple_tv", "HomePod Mini", "Apple"],
  ["apple_tv", "apple_tv", "Apple TV 4K", "Apple"],
]) {
  const id = `media_player.demo_${family}`;
  FAMILY_PLAYERS[family] = id;
  extra(
    id,
    platform,
    `Demo ${family.replace(/_/g, " ")}`,
    "playing",
    platform === "alexa_media" ? ALEXA : family === "apple_tv" ? APPLE_TV : HOMEPOD,
    { media_title: "Evening Mix", media_artist: "Harbor FM", volume_level: 0.4 },
    { manufacturer: maker, model },
  );
}

// The home with the Jellyfin and Alexa players (states and entity registry).
export const withExtras = () => ({ states: { ...states, ...extraStates }, entities: { ...entities, ...extraEntities } });

// Answers of hass.callWS: the queue of a Music Assistant player.
export const callWS = async (msg) => {
  if (msg?.type === "call_service" && msg.domain === "music_assistant" && msg.service === "get_queue") {
    return { response: { [msg.service_data.entity_id]: QUEUE } };
  }
  throw new Error(`unexpected ${msg?.type}`);
};

// State overrides of the animated captures.
export const paused = { "media_player.living_room": { state: "paused" } };
export const buffering = { "media_player.living_room": { state: "buffering" } };
