// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
import { F } from "./core.js";
import { STRINGS } from "./i18n/strings.js";

export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

export const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

// True when the player announces every feature bit of `f` in its supported_features.
export const has = (s, f) => ((Number(s?.attributes?.supported_features) || 0) & f) === f;
export const offline = (s) => !s || s.state === "unavailable" || s.state === "unknown";
export const isOff = (s) => s?.state === "off" || s?.state === "standby";
export const isActive = (s) => s?.state === "playing" || s?.state === "paused" || s?.state === "buffering";

// 83 → "1:23", 3725 → "1:02:05".
export const fmtTime = (sec) => {
  if (!Number.isFinite(sec) || sec < 0) return "";
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
};

// Current position in seconds: media_position as of media_position_updated_at, moved on while playing.
export const position = (s, now = Date.now()) => {
  const a = s?.attributes || {};
  let p = Number(a.media_position);
  if (a.media_position === undefined || a.media_position === null || !Number.isFinite(p)) return null;
  const at = Date.parse(a.media_position_updated_at);
  if (s.state === "playing" && Number.isFinite(at)) p += Math.max(0, (now - at) / 1000);
  const d = Number(a.media_duration);
  if (d > 0) p = Math.min(p, d);
  return Math.max(0, p);
};

export const duration = (s) => {
  const d = Number(s?.attributes?.media_duration);
  return d > 0 ? d : null;
};

// Volume as a whole percentage, null when the player does not report it.
export const volPct = (s) => {
  const v = Number(s?.attributes?.volume_level);
  return s?.attributes?.volume_level === undefined || s?.attributes?.volume_level === null || !Number.isFinite(v) ? null : Math.round(v * 100);
};

// Player state → color class of the header icon and the status chip.
export const statusClass = (state) => {
  switch (state) {
    case "playing":
    case "buffering":
      return "active";
    case "paused":
      return "warn";
    case "on":
    case "idle":
      return "ok";
    case "unavailable":
      return "crit";
    default:
      return "idle";
  }
};

// Kind of device: drawn picture and header icon.
export const kindOf = (s) => {
  const c = s?.attributes?.device_class;
  return c === "tv" ? "tv" : c === "receiver" ? "receiver" : "speaker";
};

export const platformOf = (hass, id) => hass?.entities?.[id]?.platform || "";
export const nameOf = (hass, id) => hass?.states?.[id]?.attributes?.friendly_name || id;
export const deviceOf = (hass, id) => {
  const d = hass?.entities?.[id]?.device_id;
  return d ? hass?.devices?.[d] || null : null;
};

// Jellyfin (core): one player per client session, with no device_class; its device's model is the client app.
export const isJellyfin = (hass, id) => platformOf(hass, id) === "jellyfin";
// Alexa Media Player (custom alexa_media): a group of Echo speakers ("Everywhere", multiroom) has the model
// "Speaker Group" (WHA device family); Alexa cannot join or unjoin speakers from Home Assistant.
export const isAlexa = (hass, id) => platformOf(hass, id) === "alexa_media";
export const isAlexaGroup = (hass, id) => {
  if (!isAlexa(hass, id)) return false;
  const model = String(deviceOf(hass, id)?.model || "");
  return model === "Speaker Group" || /^WHA\b/.test(model);
};

// Apple TV (core apple_tv): Apple TV boxes, HomePods and AirPlay speakers; the device's model tells them apart.
export const isAppleTv = (hass, id) => platformOf(hass, id) === "apple_tv";
// Philips TV (core philips_js): a TV with its remote, its Ambilight light and its switches on the same device.
export const isPhilips = (hass, id) => platformOf(hass, id) === "philips_js";

// Remote entity of an Apple TV or a Philips TV (the same device). The keys of the card are named after pyatv's
// remote control (up, down, left, right, select, menu, home, play_pause); a Philips TV takes its JointSpace keys.
export const REMOTE_PLATFORMS = new Set(["apple_tv", "philips_js"]);
export const REMOTE_COMMANDS = {
  philips_js: { up: "CursorUp", down: "CursorDown", left: "CursorLeft", right: "CursorRight", select: "Confirm", menu: "Back", home: "Home", play_pause: "PlayPause" },
};
export const remoteCommand = (hass, rid, cmd) => REMOTE_COMMANDS[platformOf(hass, rid)]?.[cmd] || cmd;
// Lookups in the entity registry, made once per registry: the card checks what it reads from it on every state
// change of Home Assistant (to know whether to render), and a scan of every entity each time adds up on large
// installs. The registry object is replaced when an entity is added, removed or changed.
export const registryMemo = new WeakMap();
export const fromRegistry = (hass, key, find) => {
  const reg = hass?.entities;
  if (!reg) return find();
  let memo = registryMemo.get(reg);
  if (!memo) registryMemo.set(reg, (memo = new Map()));
  if (!memo.has(key)) memo.set(key, find());
  return memo.get(key);
};

export const remoteOf = (hass, id) => {
  const platform = platformOf(hass, id);
  if (!REMOTE_PLATFORMS.has(platform)) return null;
  const rid = fromRegistry(hass, `remote|${id}`, () => {
    const device = hass.entities?.[id]?.device_id;
    const base = id.slice(id.indexOf(".") + 1);
    return (
      Object.values(hass.entities || {}).find(
        (x) => x?.platform === platform && String(x.entity_id).startsWith("remote.") && ((device && x.device_id === device) || x.entity_id === `remote.${base}`),
      )?.entity_id || null
    );
  });
  return rid && hass.states?.[rid] ? rid : null;
};

// Picture family of a player's device (its model in the device registry), "" for a generic picture.
export const familyOf = (hass, id) => {
  const d = deviceOf(hass, id);
  return d ? pictureFamily(d.model, d.manufacturer, platformOf(hass, id)) : "";
};
export const SCREEN_FAMILIES = new Set(["apple_tv", "echo_show", "echo_show_small"]);

// Kind of device of a player (header icon, generic picture): its device_class first, then its device's model; a
// Jellyfin session is a screen, an Apple TV device with apps (sources) too.
export const kindFor = (hass, id, s) => {
  if (s?.attributes?.device_class) return kindOf(s);
  const family = familyOf(hass, id);
  if (family) return SCREEN_FAMILIES.has(family) ? "tv" : "speaker";
  if (isJellyfin(hass, id)) return "tv";
  if (isAppleTv(hass, id)) return Array.isArray(s?.attributes?.source_list) && s.attributes.source_list.length ? "tv" : "speaker";
  return kindOf(s);
};

// A Jellyfin session with nothing playing (an app left open somewhere): left out of the stack and of the rooms
// while `hide_idle_sessions` is on (default).
export const idleSession = (hass, config, id) => config?.hide_idle_sessions !== false && isJellyfin(hass, id) && !isActive(hass?.states?.[id]);

// Entities of a player's device that its integration adds next to the media player: found on the same device by
// their translation key, else by the entity ids the integration gives them (`<domain>.<player id>_<suffix>`).
// `table` maps a key to [domain, translation key, entity id suffixes].
export const deviceExtras = (hass, id, platform, table) => {
  const found = fromRegistry(hass, `extras|${platform}|${id}`, () => {
    const device = hass.entities?.[id]?.device_id;
    const base = id.slice(id.indexOf(".") + 1);
    const all = Object.values(hass.entities || {});
    const ids = {};
    for (const [key, [domain, tkey, suffixes]] of Object.entries(table)) {
      const e = all.find(
        (x) =>
          x?.platform === platform &&
          String(x.entity_id).startsWith(`${domain}.`) &&
          ((device && x.device_id === device && x.translation_key === tkey) || suffixes.some((sfx) => x.entity_id === `${domain}.${base}_${sfx}`)),
      );
      if (e) ids[key] = e.entity_id;
    }
    return ids;
  });
  const out = {};
  for (const [key, eid] of Object.entries(found)) if (hass.states?.[eid]) out[key] = eid;
  return out;
};

// The Alexa entities of an Echo device: the do-not-disturb switch and the next alarm, timer and reminder sensors.
export const ALEXA_EXTRAS = {
  dnd: ["switch", "do_not_disturb", ["do_not_disturb", "do_not_disturb_switch"]],
  alarm: ["sensor", "next_alarm", ["next_alarm", "next_alarm_switch"]],
  timer: ["sensor", "next_timer", ["next_timer", "next_timer_switch"]],
  reminder: ["sensor", "next_reminder", ["next_reminder", "next_reminder_switch"]],
};
export const alexaExtras = (hass, id) => (isAlexa(hass, id) ? deviceExtras(hass, id, "alexa_media", ALEXA_EXTRAS) : null);

// The Philips entities of a TV: Ambilight (light), Ambilight + Hue and the screen (switches), the recordings
// (binary sensors).
export const PHILIPS_EXTRAS = {
  ambilight: ["light", "ambilight", ["ambilight"]],
  ambilight_hue: ["switch", "ambilight_hue", ["ambilight_hue"]],
  screen: ["switch", "screen_state", ["screen_state"]],
  recording: ["binary_sensor", "recording_ongoing", ["recording_ongoing"]],
  new_recording: ["binary_sensor", "recording_new", ["recording_new", "new_recording_available"]],
};
export const philipsExtras = (hass, id) => (isPhilips(hass, id) ? deviceExtras(hass, id, "philips_js", PHILIPS_EXTRAS) : null);

// Brand accent of the integrations that have one; the theme's primary color otherwise.
export const ACCENTS = { spotify: "#1db954", plex: "#e5a00d", jellyfin: "#aa5cc3", music_assistant: "#3a8fde", alexa_media: "#00a8e1", philips_js: "#0b5ed7" };

// Apple TV remote section: its style goes with it too.
export const REMOTE_STYLE = `
  .remote { display: flex; align-items: center; justify-content: center; gap: 24px; flex-wrap: wrap; padding: 4px 0; }
  .dpad { display: grid; grid-template-columns: repeat(3, 44px); grid-template-rows: repeat(3, 44px); gap: 4px; place-items: center; }
  .remote-keys { display: flex; flex-direction: column; gap: 8px; }`;

// Header of the remote popup (mini card): icon, title and the close button.
export const REMOTE_POPUP_STYLE = `
  ha-card.dialog-open.remote-open { min-height: 290px; }
  .remote-open .modal { max-height: none; }
  .remote-head { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; text-transform: uppercase;
                 letter-spacing: .04em; color: var(--secondary-text-color); }
  .remote-head > .icon { width: 18px; height: 18px; flex: none; }
  .remote-head span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`;

// Alexa row (badge, next alarm / timer / reminder, do not disturb): its style goes with it, so that the other
// players render exactly as before.
export const ALEXA_STYLE = `
  .alexa { display: flex; align-items: center; gap: 8px; min-width: 0; font-size: 12px; color: var(--secondary-text-color); }
  .alexa-info { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; flex: 1; min-width: 0; }
  .alexa .next { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
  .alexa .next .icon { width: 16px; height: 16px; flex: none; }
  .alexa .tag { padding: 0 8px; border: 1px solid var(--mc-accent, var(--primary-color)); border-radius: 10px; color: var(--mc-accent, var(--primary-color)); font-size: 11px; font-weight: 500; line-height: 18px; white-space: nowrap; }
  .alexa.compact { gap: 6px; }
  .alexa.compact .alexa-info { gap: 2px 8px; }`;
// Philips row (recording tags, Ambilight, Ambilight + Hue, screen): the same layout as the Alexa row.
export const PHILIPS_STYLE = `${ALEXA_STYLE.replaceAll(".alexa", ".philips")}
  .philips .tag.rec { border-color: var(--error-color, #db4437); color: var(--error-color, #db4437); }`;
export const accentStyle = (hass, id) => {
  const a = ACCENTS[platformOf(hass, id)];
  return a ? `:host { --mc-accent: ${a}; }` : "";
};

// Artwork URL: the local proxy first (works from outside the network), made absolute for a remote frontend.
export const artOf = (hass, s) => {
  const a = s?.attributes || {};
  const url = a.entity_picture_local || a.entity_picture;
  if (!url) return "";
  return url.startsWith("/") && typeof hass?.hassUrl === "function" ? hass.hassUrl(url) : url;
};

export const playerIds = (hass) =>
  Object.keys(hass?.states || {})
    .filter((id) => id.startsWith("media_player."))
    .sort((a, b) => nameOf(hass, a).localeCompare(nameOf(hass, b)));

// The player to show: the room clicked in the card, else `entity`, else the first playing one, else the first one.
export const findPlayer = (hass, config, active) => {
  const listed = listedPlayers(config);
  const want = active || config.entity || (listed.length === 1 ? listed[0] : null);
  // A player given by the config: found without listing (and sorting) every player at each state change.
  if (want && hass.states[want]) return { id: want };
  const ids = playerIds(hass);
  if (!ids.length) return { error: "no_player" };
  if (want) return { error: "unknown_entity" };
  return { id: ids.find((id) => hass.states[id].state === "playing") || ids.find((id) => !offline(hass.states[id])) || ids[0] };
};

// The `players` option: the players stacked in the card, as entity ids (strings or { entity }), in its order.
export function listedPlayers(config) {
  const list = Array.isArray(config?.players) ? config.players : [];
  return [...new Set(list.map((e) => (typeof e === "string" ? e : e?.entity)).filter(Boolean))];
}

// Two players or more in `players`: the card stacks them (one player only is the same as `entity`).
export const isStacked = (config) => listedPlayers(config).length >= 2;
export const isPlaying = (s) => s?.state === "playing" || s?.state === "buffering";

// Players of the stacked view, in the order of the option. With `only_playing`, only the playing ones (and the
// paused ones with `include_paused`); the others are counted in `hidden`. When none of them plays, the one that
// changed last (the last one active) is shown, else the first one.
export const stackedPlayers = (hass, config) => {
  const listed = listedPlayers(config).filter((id) => hass?.states?.[id]);
  // Idle Jellyfin sessions join the hidden ones (unless every listed player is one of them).
  const idle = listed.filter((id) => idleSession(hass, config, id));
  const ids = idle.length < listed.length ? listed.filter((id) => !idle.includes(id)) : listed;
  const asleep = ids === listed ? [] : idle;
  if (!config.only_playing) return { shown: ids, hidden: asleep };
  const on = (id) => {
    const s = memberState(hass.states, id);
    return isPlaying(s) || (config.include_paused === true && s.state === "paused");
  };
  let shown = ids.filter(on);
  if (!shown.length && ids.length) {
    const changed = (id) => Date.parse(hass.states[id].last_changed) || 0;
    const last = ids.filter((id) => !offline(hass.states[id])).sort((a, b) => changed(b) - changed(a))[0];
    shown = [last || ids[0]];
  }
  return { shown, hidden: [...ids.filter((id) => !shown.includes(id)), ...asleep] };
};

export const groupOf = (s) => (Array.isArray(s?.attributes?.group_members) ? s.attributes.group_members : []);

// The state a player is shown with. A member of a group can keep its own state while the group plays: Music Assistant
// leaves every member but the leader `idle` while the leader plays. Such a member (idle or on, listed in the group of
// its leader, the first of its group_members) takes the leader's playing, paused or buffering state.
export const memberState = (states, id) => {
  const s = states?.[id];
  const leaderId = groupOf(s)[0];
  if (!leaderId || leaderId === id || (s.state !== "idle" && s.state !== "on")) return s;
  const leader = states[leaderId];
  if (!isActive(leader) || !groupOf(leader).includes(id)) return s;
  return { ...s, state: leader.state };
};

// Rooms of the card: the `entities` option, else, for a player that can group, every player of the same
// integration that can group too (the speakers it can be joined with).
export const roomIds = (hass, config, mainId) => {
  const listed = (Array.isArray(config.entities) ? config.entities : []).map((e) => (typeof e === "string" ? e : e?.entity)).filter(Boolean);
  if (listed.length) return [...new Set([mainId, ...listed])].filter((id) => hass.states[id] && (id === mainId || !idleSession(hass, config, id)));
  const main = hass.states[mainId];
  if (!has(main, F.GROUPING)) return [];
  const platform = platformOf(hass, mainId);
  const peers = playerIds(hass).filter(
    (id) => id !== mainId && has(hass.states[id], F.GROUPING) && (!platform || !platformOf(hass, id) || platformOf(hass, id) === platform),
  );
  for (const m of groupOf(main)) if (m !== mainId && hass.states[m] && !peers.includes(m)) peers.push(m);
  return peers.length ? [mainId, ...peers] : [];
};

// Music Assistant players expose their queue through the music_assistant.get_queue service.
export const isMusicAssistant = (hass, id) => {
  const s = hass.states[id];
  return platformOf(hass, id) === "music_assistant" || s?.attributes?.mass_player_type !== undefined || s?.attributes?.active_queue !== undefined;
};

// Favorites: the `favorites` option, then the items of a favorites sensor (Sonos: sensor.sonos_favorites, an
// `items` attribute of { item id: title }), found by itself for a Sonos player or given by `favorites_entity`.
export const favoritesSensor = (hass, config, mainId) => {
  if (config.favorites_entity) return hass.states[config.favorites_entity] ? config.favorites_entity : null;
  if (platformOf(hass, mainId) !== "sonos") return null;
  const sonos = fromRegistry(hass, "sonos-sensors", () =>
    Object.keys(hass.entities || {}).filter((id) => id.startsWith("sensor.") && platformOf(hass, id) === "sonos"),
  );
  return sonos.find((id) => hass.states[id]?.attributes?.items && typeof hass.states[id].attributes.items === "object") || null;
};

export const favoritesOf = (hass, config, mainId) => {
  const own = (Array.isArray(config.favorites) ? config.favorites : [])
    .filter((f) => f?.media_content_id)
    .map((f) => ({
      name: String(f.name || f.media_content_id),
      media_content_id: String(f.media_content_id),
      media_content_type: String(f.media_content_type || "music"),
      image: f.image || "",
      icon: typeof f.icon === "string" && f.icon.includes(":") ? f.icon : "",
    }));
  const sensor = favoritesSensor(hass, config, mainId);
  const items = sensor ? hass.states[sensor].attributes.items || {} : {};
  const sonos = Object.entries(items).map(([id, title]) => ({ name: String(title), media_content_id: id, media_content_type: "favorite_item_id", image: "", icon: "" }));
  return [...own, ...sonos];
};

// URL for a CSS url('…') in a style attribute: the entity escapes of esc() are decoded before the CSS is read, so
// the characters that could close the url() or the declaration are percent-encoded first.
export const cssUrl = (u) => esc(String(u).replace(/["'()\\\s;]/g, (c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`));

export const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;

export const sameDeps = (a, b) => !!a && !!b && a.length === b.length && a.every((d, i) => d === b[i]);

// ---------------------------------------------------------------------------
// Drawn pictures, for a player with no artwork: a speaker, a TV or a receiver, animated by what it is doing
// (the woofer beats and sound waves leave the speaker, the TV screen glows, the receiver's level meter moves).
// Inline SVG in the card's shadow root: its animations are the card's own (and honour prefers-reduced-motion).
// ---------------------------------------------------------------------------

export const FINISH = { light: ["#f6f7f8", "#c9cdd2", "#9aa0a6"], dark: ["#4a4e55", "#26292d", "#7d838a"] };

export const speakerSvg = (on, f) => `<svg class="pic" viewBox="0 0 140 120" aria-hidden="true">
  <defs><linearGradient id="mc-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${f[0]}"/><stop offset="1" stop-color="${f[1]}"/></linearGradient></defs>
  <ellipse cx="70" cy="114" rx="30" ry="4" fill="#000" opacity=".14"/>
  <rect x="40" y="6" width="60" height="104" rx="14" fill="url(#mc-body)" stroke="${f[2]}" stroke-width="1.2"/>
  <circle cx="70" cy="30" r="9" fill="${f[1]}" stroke="${f[2]}"/><circle cx="70" cy="30" r="3.5" fill="${f[2]}"/>
  <g class="cone${on ? " beat" : ""}"><circle cx="70" cy="74" r="24" fill="${f[1]}" stroke="${f[2]}"/><circle cx="70" cy="74" r="15" fill="${f[2]}" opacity=".55"/><circle cx="70" cy="74" r="6" fill="${f[1]}"/></g>
  ${
    on
      ? `<g class="waves" fill="none" stroke="var(--mc-accent)" stroke-width="3" stroke-linecap="round">
    <path class="wave" d="M108 56a26 26 0 0 1 0 36"/><path class="wave d1" d="M116 48a38 38 0 0 1 0 52"/>
    <path class="wave" d="M32 56a26 26 0 0 0 0 36"/><path class="wave d1" d="M24 48a38 38 0 0 0 0 52"/></g>`
      : ""
  }
</svg>`;

export const tvSvg = (on, f) => `<svg class="pic" viewBox="0 0 140 120" aria-hidden="true">
  <defs><linearGradient id="mc-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--mc-accent)"/><stop offset="1" stop-color="#7e57c2"/></linearGradient></defs>
  <ellipse cx="70" cy="112" rx="34" ry="4" fill="#000" opacity=".14"/>
  <rect x="8" y="12" width="124" height="78" rx="7" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  <rect x="13" y="17" width="114" height="68" rx="3" fill="#101317"/>
  ${on ? `<rect class="glow" x="13" y="17" width="114" height="68" rx="3" fill="url(#mc-screen)" opacity=".85"/><path class="glow d1" d="M13 62L42 40L64 58L88 34L127 66V85H13Z" fill="#fff" opacity=".18"/>` : ""}
  <path d="M60 90h20l5 14H55z" fill="${f[1]}" stroke="${f[2]}"/><rect x="40" y="103" width="60" height="5" rx="2.5" fill="${f[1]}" stroke="${f[2]}"/>
</svg>`;

export const receiverSvg = (on, f) => `<svg class="pic" viewBox="0 0 140 120" aria-hidden="true">
  <ellipse cx="70" cy="96" rx="58" ry="4" fill="#000" opacity=".14"/>
  <rect x="8" y="30" width="124" height="62" rx="6" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  <rect x="18" y="44" width="62" height="22" rx="3" fill="#101317"/>
  ${on ? `<rect class="glow" x="18" y="44" width="62" height="22" rx="3" fill="var(--mc-accent)" opacity=".35"/>` : ""}
  <g fill="var(--mc-accent)" opacity="${on ? 1 : 0.25}">${[0, 1, 2, 3, 4, 5, 6]
    .map((i) => `<rect class="${on ? `meter m${i % 4}` : ""}" x="${23 + i * 8}" y="48" width="5" height="14" rx="1"/>`)
    .join("")}</g>
  <circle cx="108" cy="58" r="15" fill="${f[0]}" stroke="${f[2]}"/><circle cx="108" cy="58" r="10" fill="${f[1]}"/><rect x="107" y="46" width="2" height="7" rx="1" fill="${f[2]}"/>
  <g fill="${f[2]}">${[0, 1, 2, 3].map((i) => `<circle cx="${24 + i * 12}" cy="78" r="3"/>`).join("")}</g>
</svg>`;

export const PICTURES = { speaker: speakerSvg, tv: tvSvg, receiver: receiverSvg };

// Device pictures by model family: original, stylized silhouettes of the general shape of a device (a sphere, a
// cylinder, a box), with no logo, brand or product name, drawn for this card. Only their lights move, and only
// while playing: a soft pulse (mc-glow, 1.8 s), stopped by prefers-reduced-motion. The body follows the theme's
// grays (FINISH); the lights keep their own color: cyan rings for the cylinders and spheres, a violet top for the
// mesh speakers. `front`: the straight-on view of the mini card (where a family has one).
export const LIGHT = { cyan: "#22c3e6", violet: "#9b6dff" };
export const svgPic = (body) => `<svg class="pic" viewBox="0 0 140 120" aria-hidden="true">${body}</svg>`;
export const shadow = (rx, y = 112) => `<ellipse cx="70" cy="${y}" rx="${rx}" ry="4" fill="#000" opacity=".14"/>`;
export const lit = (on) => (on ? ` class="glow"` : "");
export const lightOpacity = (on) => (on ? 1 : 0.22);
// Fine horizontal lines of a fabric cover.
export const fabric = (x, y, w, h, f, step = 5) =>
  Array.from({ length: Math.floor(h / step) }, (_, i) => `<line x1="${x}" y1="${(y + (i + 0.5) * step).toFixed(1)}" x2="${x + w}" y2="${(y + (i + 0.5) * step).toFixed(1)}" stroke="${f[2]}" stroke-width=".7" opacity=".5"/>`).join(
    "",
  );
// Rows of small dots of a mesh cover that follow the curve of a sphere (centre cx, cy, radius r) from y0 to y1.
export const meshDots = (cx, cy, r, y0, y1, f, gap = 6) => {
  const out = [];
  for (let y = y0 + gap / 2; y < y1; y += gap) {
    const w = Math.sqrt(Math.max(0, r * r - (y - cy) ** 2)) - 3;
    const n = Math.max(1, Math.round((Math.PI * w) / gap / 1.6));
    for (let i = 0; i <= n; i++) {
      const x = cx + w * Math.sin(-Math.PI / 2 + (Math.PI * i) / n);
      out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r=".95" fill="${f[2]}" opacity=".55"/>`);
    }
  }
  return out.join("");
};

// Classic cylinder: a fabric body with a cyan light ring on its top edge.
export const cylinderSvg = (on, f) =>
  svgPic(`${shadow(28)}
  <path d="M48 16V102a22 6 0 0 0 44 0V16z" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  ${fabric(50, 40, 40, 62, f)}
  <ellipse cx="70" cy="16" rx="22" ry="6" fill="${f[0]}" stroke="${f[2]}" stroke-width="1.2"/>
  <ellipse${lit(on)} cx="70" cy="16" rx="19" ry="4.2" fill="none" stroke="${LIGHT.cyan}" stroke-width="3" opacity="${lightOpacity(on)}"/>`);

// Large cylinder with rounded corners and a light slit at the top.
export const studioSvg = (on, f) =>
  svgPic(`${shadow(40)}
  <rect x="32" y="14" width="76" height="96" rx="16" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  ${fabric(36, 34, 68, 70, f)}
  <rect x="36" y="16" width="68" height="14" rx="7" fill="${f[0]}" opacity=".7"/>
  <rect${lit(on)} x="46" y="21" width="48" height="4" rx="2" fill="${LIGHT.cyan}" opacity="${lightOpacity(on)}"/>`);

// Sphere with a cyan light ring along its base.
export const sphereSvg = (on, f) =>
  svgPic(`${shadow(36, 110)}
  <path d="M33 96a42 42 0 1 1 74 0z" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  ${meshDots(70, 70, 42, 34, 92, f)}
  <path d="M33 96h74a37 7 0 0 1 -74 0z" fill="${f[0]}" stroke="${f[2]}"/>
  <path${lit(on)} d="M36 98a34 5 0 0 0 68 0" fill="none" stroke="${LIGHT.cyan}" stroke-width="3" stroke-linecap="round" opacity="${lightOpacity(on)}"/>`);

// Low puck (older small speaker): a short cylinder with a cyan light ring on its top.
export const puckSvg = (on, f) =>
  svgPic(`${shadow(46, 96)}
  <path d="M24 60v22a46 12 0 0 0 92 0V60z" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  ${fabric(26, 66, 88, 16, f, 4)}
  <ellipse cx="70" cy="60" rx="46" ry="12" fill="${f[0]}" stroke="${f[2]}" stroke-width="1.2"/>
  <ellipse${lit(on)} cx="70" cy="60" rx="42" ry="10" fill="none" stroke="${LIGHT.cyan}" stroke-width="3" opacity="${lightOpacity(on)}"/>
  <g fill="${f[2]}" opacity=".6"><circle cx="56" cy="58" r="2.2"/><circle cx="70" cy="55" r="2.2"/><circle cx="84" cy="58" r="2.2"/><circle cx="70" cy="64" r="2.2"/></g>`);

// Half sphere on its flat side, with a light bar on its front.
export const domeSvg = (on, f) =>
  svgPic(`${shadow(46, 104)}
  <path d="M24 100a46 46 0 0 1 92 0z" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  ${meshDots(70, 100, 46, 58, 98, f)}
  <rect x="24" y="99" width="92" height="5" rx="2.5" fill="${f[0]}" stroke="${f[2]}"/>
  <rect${lit(on)} x="54" y="92" width="32" height="4" rx="2" fill="${LIGHT.cyan}" opacity="${lightOpacity(on)}"/>`);

// Smart display: a screen leaning back on a trapezoid base; a blue screen with a few white lines, a light bar below
// (`big`: the wider variant).
export const displaySvg = (big) => (on, f) => {
  const w = big ? 110 : 78;
  const x = 70 - w / 2;
  return svgPic(`${shadow(w / 2 - 6, 108)}
  <path d="M${x + 10} 106L${x + 20} 62H${x + w - 20}L${x + w - 10} 106z" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  ${fabric(x + 16, 68, w - 32, 36, f)}
  <path d="M${x} 16H${x + w}l-6 62H${x + 6}z" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  <path d="M${x + 5} 20H${x + w - 5}l-5 50H${x + 10}z" fill="${on ? "#1f5fbf" : "#101317"}"/>
  ${
    on
      ? `<g stroke="#fff" stroke-linecap="round" opacity=".85"><line x1="${x + 18}" y1="34" x2="${x + w * 0.55}" y2="34" stroke-width="3"/><line x1="${x + 18}" y1="44" x2="${x + w * 0.42}" y2="44" stroke-width="2"/><line x1="${x + 18}" y1="54" x2="${x + w * 0.62}" y2="54" stroke-width="2"/></g>`
      : ""
  }
  <rect${lit(on)} x="${x + 18}" y="73" width="${w - 36}" height="3" rx="1.5" fill="${LIGHT.cyan}" opacity="${lightOpacity(on)}"/>`);
};

// Tall mesh speaker: a cylinder with very rounded edges, fine horizontal mesh lines, a violet halo on top.
export const meshTallSvg = (on, f) =>
  svgPic(`${shadow(36)}
  <rect x="38" y="12" width="64" height="98" rx="28" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  ${fabric(42, 28, 56, 70, f, 3.5)}
  <ellipse cx="70" cy="20" rx="22" ry="5" fill="${f[0]}" stroke="${f[2]}"/>
  <ellipse${lit(on)} cx="70" cy="20" rx="14" ry="3" fill="${LIGHT.violet}" opacity="${on ? 0.95 : 0.2}"/>`);

// Small mesh speaker: a nearly whole sphere cut flat at the top (its touch surface) and at the bottom (where it
// stands), with rows of mesh dots. Seen slightly from above (the full card: the top ellipse, its glowing surface and
// small + and − marks), or straight on (`front`, the mini card: the top is a flat line with its light).
export const meshSmallSvg = (on, f, front = false) => {
  const cx = 70;
  const cy = 66;
  const r = 44;
  const top = 30;
  const bottom = 104;
  const half = (y) => Math.sqrt(r * r - (y - cy) ** 2);
  const tw = half(top);
  const bw = half(bottom);
  const body = `M${cx - tw} ${top}A${r} ${r} 0 0 0 ${cx - bw} ${bottom}H${cx + bw}A${r} ${r} 0 0 0 ${cx + tw} ${top}z`;
  const topFace = front
    ? `<rect x="${cx - tw}" y="${top - 1.5}" width="${tw * 2}" height="3" rx="1.5" fill="${f[0]}" stroke="${f[2]}" stroke-width=".8"/>
       <rect${lit(on)} x="${cx - tw + 6}" y="${top - 1}" width="${tw * 2 - 12}" height="2" rx="1" fill="${LIGHT.violet}" opacity="${lightOpacity(on)}"/>`
    : `<ellipse cx="${cx}" cy="${top}" rx="${tw}" ry="7" fill="${f[0]}" stroke="${f[2]}" stroke-width="1"/>
       <ellipse${lit(on)} cx="${cx}" cy="${top}" rx="${tw - 5}" ry="4.6" fill="${LIGHT.violet}" opacity="${on ? 0.9 : 0.18}"/>
       <g stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity="${on ? 0.95 : 0.7}"><line x1="${cx - 13}" y1="${top}" x2="${cx - 9}" y2="${top}"/><line x1="${cx + 9}" y1="${top}" x2="${cx + 13}" y2="${top}"/><line x1="${cx + 11}" y1="${top - 2}" x2="${cx + 11}" y2="${top + 2}"/></g>`;
  return svgPic(`${shadow(bw + 6, bottom + 4)}
  <path d="${body}" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  ${meshDots(cx, cy, r, top + (front ? 2 : 6), bottom - 2, f)}
  <path d="M${cx - bw} ${bottom}H${cx + bw}" stroke="${f[2]}" stroke-width="1.2"/>
  ${topFace}`);
};

// Streaming box: a low square box with rounded corners and a small white status light that blinks; while a video
// plays, a small stylized screen with a play triangle shows above it.
export const boxSvg = (on, f) =>
  svgPic(`${shadow(42, 108)}
  ${
    on
      ? `<rect x="34" y="8" width="72" height="44" rx="5" fill="#101317" stroke="${f[2]}"/><rect class="glow" x="38" y="12" width="64" height="36" rx="3" fill="#1f5fbf"/><path d="M64 22L80 30L64 38z" fill="#fff"/>`
      : ""
  }
  <path d="M30 72L42 62H110L98 72z" fill="${f[0]}" stroke="${f[2]}" stroke-width="1.2" stroke-linejoin="round"/>
  <rect x="30" y="72" width="68" height="32" rx="6" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  <path d="M98 72L110 62V94Q110 98 106 100L98 104z" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2" stroke-linejoin="round" opacity=".85"/>
  <circle${lit(on)} cx="38" cy="96" r="2" fill="${on ? "#fff" : f[2]}" stroke="${f[2]}" stroke-width=".5"/>`);

export const DEVICE_PICTURES = {
  echo: cylinderSvg,
  echo_studio: studioSvg,
  echo_dot: sphereSvg,
  echo_dot_puck: puckSvg,
  echo_pop: domeSvg,
  echo_show: displaySvg(true),
  echo_show_small: displaySvg(false),
  homepod: meshTallSvg,
  homepod_mini: meshSmallSvg,
  apple_tv: boxSvg,
};

// Model (device registry) → picture family: tolerant (case, spacing, generation suffix), Amazon and Apple devices
// only (manufacturer, or the integration when the manufacturer is not set). Anything else keeps the generic picture.
export const AMAZON_MODELS = [
  [/echo\s*(show\s*(5|8)\b|spot)/i, "echo_show_small"],
  [/echo\s*show/i, "echo_show"],
  [/echo\s*studio/i, "echo_studio"],
  [/echo\s*pop/i, "echo_pop"],
  [/echo\s*dot(?!.*clock).*(gen\s*[1-3]\b|\b[1-3](st|nd|rd)\s*gen)/i, "echo_dot_puck"],
  [/echo\s*dot/i, "echo_dot"],
  [/^echo\s*\(?\s*(gen\s*[45]|[45]th\s*gen)/i, "echo_dot"],
  [/^echo(\s*plus)?(\s*\(.*\))?\s*$/i, "echo"],
];
export const APPLE_MODELS = [
  [/homepod\s*mini/i, "homepod_mini"],
  [/homepod/i, "homepod"],
  [/apple\s*tv/i, "apple_tv"],
];
export const pictureFamily = (model, manufacturer, platform = "") => {
  const m = String(model || "").trim();
  if (!m) return "";
  const maker = String(manufacturer || "").toLowerCase();
  const amazon = maker ? maker.includes("amazon") : platform === "alexa_media";
  const apple = maker ? maker.includes("apple") : platform === "apple_tv";
  const list = [...(amazon ? AMAZON_MODELS : []), ...(apple ? APPLE_MODELS : [])];
  return list.find(([re]) => re.test(m))?.[1] || "";
};

// ---------------------------------------------------------------------------
// The illustrated header ("banner"): a media room drawn at the right of a 90 px banner (the title on the wall at
// its left), over a 10 px parquet strip edge to edge. The device in front is the card's own picture of the player
// (DEVICE_PICTURES by model family, else the generic speaker, TV or receiver), drawn big: standing on the floor
// (a tall speaker) or on the TV console. Behind it, a TV on the console shows an equalizer while playing (none
// when the device is itself a TV: a framed picture and a floor lamp instead). Night with the dark theme (a light
// theme keeps the day picture after sunset); `illustration_theme: day | night` forces one, `illustration: false` keeps the classic header.
// Scene picture 200 × 80, anchored bottom right; on a narrow card its left (the decor) is cut, never the device.
// ---------------------------------------------------------------------------

// Night picture: forced by illustration_theme, else Home Assistant's dark theme alone (a light theme keeps the day picture after sunset).
export const isNight = (hass, config) => {
  const theme = config?.illustration_theme;
  if (theme === "night") return true;
  if (theme === "day") return false;
  return !!hass?.themes?.darkMode;
};

// Player state → colour of the banner icon: playing in the active colour, paused amber, on green, unavailable red,
// anything else (idle, off, standby) neutral grey.
export const iconClass = (state) => {
  switch (state) {
    case "playing":
    case "buffering":
      return "active";
    case "paused":
      return "warn";
    case "on":
      return "ok";
    case "unavailable":
      return "crit";
    default:
      return "idle";
  }
};

// Where and how big the device stands in the scene: [height of its 140 × 120 picture, y of its feet in the
// picture, on the floor (true) or on the console]. Sized so that each one reads big beside the console.
export const SCENE_FLOOR = 80;
export const SCENE_CONSOLE = 62;
export const devicePlace = (kind, family) => {
  if (!family && kind === "speaker") return [76, 114, true];
  if (!family && kind === "receiver") return [70, 96, false];
  return [64, 112, false];
};

// The device's picture placed in the scene, its gradient ids made unique to this card (`uid`), with no box behind.
export const sceneDevice = (svg, kind, family, uid) => {
  const [h, feet, floor] = devicePlace(kind, family);
  const k = h / 120;
  const w = 140 * k;
  const y = (floor ? SCENE_FLOOR : SCENE_CONSOLE) - feet * k;
  return svg
    .replace(/id="mc-/g, `id="mc${uid}-`)
    .replace(/url\(#mc-/g, `url(#mc${uid}-`)
    .replace(/<svg class="pic"/, `<svg class="mc-dev" x="${(158 - w / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h}"`);
};

// The room: a plant, the TV console, and the TV behind the device (its screen: off, lit, or an equalizer that
// moves while playing and rests while paused) or, when the device is a TV, a framed picture and a floor lamp.
export const sceneSvg = ({ device, tv, screen }) => {
  const bars = [0, 1, 2, 3, 4, 5, 6]
    .map((i) => `<rect class="${screen === "play" ? `meter m${i % 4}` : ""}" x="${57 + i * 7}" y="${24 + ((i * 5) % 9)}" width="4" height="${16 - ((i * 5) % 9)}" rx="1"/>`)
    .join("");
  const back = tv
    ? `<rect class="mc-tv" x="44" y="10" width="64" height="40" rx="2"/>
       <rect class="mc-screen${screen === "off" ? "" : " lit"}" x="47" y="13" width="58" height="34"/>
       ${screen === "play" || screen === "pause" ? `<g class="mc-bars${screen === "pause" ? " glow" : ""}">${bars}</g>` : ""}
       <rect class="mc-tv" x="70" y="50" width="12" height="12"/>`
    : `<rect class="mc-frame" x="56" y="14" width="34" height="26" rx="1"/><rect class="mc-canvas" x="59" y="17" width="28" height="20"/>
       <path class="mc-hill" d="M59 37l8-9 6 6 5-4 9 7z"/><circle class="mc-sunlet" cx="81" cy="22" r="2.6"/>
       <g class="mc-lamp"><path class="mc-beam" d="M101 26h10l6 36H95z"/><path class="mc-shade" d="M100 26h12l-3-10h-6z"/><rect class="mc-pole" x="105.3" y="26" width="1.4" height="36"/></g>`;
  return `<svg class="mc-scene" viewBox="0 0 200 80" preserveAspectRatio="xMaxYMax slice" aria-hidden="true" focusable="false">
    <g class="mc-plant"><path class="mc-stem" d="M23 62V44M23 54l-5-6M23 50l6-7"/><path class="mc-leaf" d="M22 62c-9-4-12-15-5-22 3 9 7 13 5 22zM24 62c2-11 11-18 19-15-4 9-11 13-19 15zM23 62c-6-9-4-22 2-29 3 11 3 20-2 29z"/><path class="mc-pot" d="M16 62h14l-2 18H18z"/></g>
    ${back}
    <rect class="mc-console" x="34" y="62" width="166" height="5" rx="1"/><rect class="mc-cabinet" x="38" y="67" width="158" height="13"/>
    <rect class="mc-console" x="38" y="73" width="158" height="1"/><rect class="mc-console" x="116" y="67" width="1" height="13"/>
    ${device}
  </svg><div class="mc-floor" aria-hidden="true"></div>`;
};

// The width of an element's whole text in its own font, in fractional pixels (scrollWidth is rounded).
export let textCtx;
export const textWidth = (el) => {
  const cs = getComputedStyle(el);
  textCtx ??= document.createElement("canvas").getContext?.("2d");
  if (!textCtx) return el.scrollWidth;
  textCtx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
  return Math.max(el.scrollWidth, textCtx.measureText(el.textContent.trim()).width + pad);
};

export const SCENE_STYLE = `
  .banner { position: relative; overflow: hidden; height: 90px; --mc-scene-w: min(200px, 40%); color: #2b2622; background: #f2eee8; }
  .banner.night { color: #fff; background: #2a2f3d; }
  .mc-scene { position: absolute; right: var(--mc-btn, 0px); bottom: 10px; height: 80px; width: var(--mc-scene-w);
              -webkit-mask-image: linear-gradient(90deg, transparent, #000 16px); mask-image: linear-gradient(90deg, transparent, #000 16px); }
  .mc-dev { overflow: visible; }
  /* The parquet: a 10 px strip under the whole banner, edge to edge. */
  .mc-floor { position: absolute; left: 0; right: 0; bottom: 0; height: 10px; background: repeating-linear-gradient(90deg, #c99a6b 0 38px, #b98a5c 38px 40px);
              box-shadow: inset 0 2px 0 #a97c50; }
  .night .mc-floor { background: repeating-linear-gradient(90deg, #4a3a2c 0 38px, #3e3024 38px 40px); box-shadow: inset 0 2px 0 #34281e; }
  .mc-tv { fill: #20242c; }
  .mc-screen { fill: #15181e; } .mc-screen.lit { fill: #2c3442; } .night .mc-screen.lit { fill: #3d5a8a; }
  .mc-bars { fill: #5f8fd8; } .night .mc-bars { fill: #7fb3ff; }
  .mc-console { fill: #c9b79c; } .mc-cabinet { fill: #d9c9ad; }
  .night .mc-console { fill: #3c4558; } .night .mc-cabinet { fill: #323a4c; }
  .mc-leaf { fill: #7cb87a; } .night .mc-leaf { fill: #3e6a4a; }
  .mc-pot { fill: #b0855a; } .night .mc-pot { fill: #7a5c40; }
  .mc-frame { fill: #b0855a; } .night .mc-frame { fill: #6e5440; }
  .mc-canvas { fill: #cfe6f5; } .night .mc-canvas { fill: #34476a; }
  .mc-hill { fill: #8cc084; } .night .mc-hill { fill: #3e6a4a; }
  .mc-sunlet { fill: #ffd65a; } .night .mc-sunlet { fill: #f4f1dc; }
  .mc-shade { fill: #e8dcc6; stroke: #c9b79c; stroke-width: .6; } .night .mc-shade { fill: #ffd27a; stroke: #b4935a; }
  .mc-pole { fill: #8a7a66; }
  .mc-stem { stroke: #6f9b5a; stroke-width: 1; fill: none; } .night .mc-stem { stroke: #34573d; }
  .mc-beam { fill: #ffd27a; opacity: 0; } .night .mc-beam { opacity: .16; }
  /* The title and subtitle on the wall at the left; the round icon tinted by the player's state. */
  .htext { position: absolute; left: 12px; top: 0; bottom: 10px; right: calc(var(--mc-scene-w) + var(--mc-btn, 0px) + 4px); display: flex; align-items: center; gap: 10px; min-width: 0; }
  .htext .titles { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .banner .type-icon { background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px rgba(43,38,34,.12); }
  .banner.night .type-icon { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  .banner .type-icon .icon { fill: color-mix(in srgb, var(--c, var(--mc-idle)) 78%, #2b2622); }
  .banner.night .type-icon .icon { fill: color-mix(in srgb, var(--c, var(--mc-idle)) 72%, #fff); }
  .banner .name { font-weight: 600; }
  .banner .sub { font-size: 13px; color: #5e554c; }
  .banner.night .sub { color: rgba(255,255,255,.8); }
  /* The title row: the name, then the status pill right after it, when the whole name and the pill's whole label fit
     there (measured, see _fitPill); otherwise the pill takes a line of its own under the subtitle, which keeps one
     line, and when that does not fit above the floor (or on the narrowest cards) only its dot stays. */
  .htext .trow { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .htext .trow > .name { flex: 0 1 auto; min-width: 4.5ch; }
  .banner .chip.bst { flex: none; max-width: none; gap: 5px; padding: 1px 8px; font-size: 11px; font-weight: 500; line-height: 16px;
                      background: color-mix(in srgb, var(--c, var(--mc-idle)) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c, var(--mc-idle)) 45%, #0d2a45); }
  .banner.night .chip.bst { background: color-mix(in srgb, var(--c, var(--mc-idle)) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c, var(--mc-idle)) 35%, #ffffff); }
  .banner .chip.bst .dot { width: 7px; height: 7px; }
  .htext .titles.below .trow { display: contents; }
  .htext .titles.below .trow > .chip.bst { order: 2; align-self: flex-start; margin-top: 1px; }
  .htext .titles.below .sub { order: 1; }
  .htext .titles.dot-only .chip.bst { padding: 4px; } .htext .titles.dot-only .chip.bst .chip-text { display: none; }
  @container (max-width: 200px) { .banner .chip.bst { padding: 4px; } .banner .chip.bst .chip-text { display: none; } }
  /* The detail button: a 24 px frosted round in the banner's top-right corner; the room moves left of it. */
  .banner:has(> .zoom) { --mc-btn: 32px; }
  .banner > .zoom { position: absolute; z-index: 2; top: 5px; right: 5px; width: 24px; height: 24px; margin: 0; color: #33506b;
                    background: rgba(255,255,255,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); backdrop-filter: blur(4px); }
  .banner > .zoom:hover { background: rgba(255,255,255,.75); color: #33506b; }
  .banner.night > .zoom { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .banner.night > .zoom:hover { background: rgba(255,255,255,.22); color: #fff; }
  .banner .zoom.back { position: static; flex: none; margin: 0 -4px 0 -4px; }
  /* Narrow card: the decor gives way to the title (the device stays whole), then the sky alone stays. */
  @container (max-width: 300px) { .banner { --mc-scene-w: 36%; } }
  @container (max-width: 220px) { .mc-scene { display: none; } .htext { right: calc(var(--mc-btn, 0px) + 8px); } }
`;
