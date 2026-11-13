// Jellyfin and Alexa Media Player: what the cards add for them, rendered with the extra mock players
// (scripts/mock-states.mjs). No assertion depends on the time of day: the dates are relative to now.
import assert from "node:assert/strict";
import { test } from "node:test";
import { callWS, devices, extraEntities, extraStates, entities, states } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const mc = load();
const TV = "media_player.living_room_tv";
const WEB = "media_player.web_browser";
const ECHO = "media_player.kitchen_echo";
const GROUP = "media_player.everywhere";
const DND = "switch.kitchen_echo_do_not_disturb_switch";

const home = (patch = {}) => {
  const st = { ...states, ...extraStates };
  for (const [id, p] of Object.entries(patch)) st[id] = { ...st[id], ...p, attributes: { ...st[id]?.attributes, ...p.attributes } };
  return st;
};
const makeHass = (st = home(), extra = {}) => {
  const calls = [];
  return { calls, states: st, entities: { ...entities, ...extraEntities }, devices, language: "en", callService: (...a) => calls.push(JSON.parse(JSON.stringify(a))), callWS, ...extra };
};
const card = (config, hass = makeHass(), Card = mc.MediaCard) => {
  const c = new Card();
  c.setConfig({ collapsed: [], ...config });
  c.hass = hass;
  return c;
};
const html = (c) => c.shadowRoot.innerHTML;
const click = (c, dataset) => c._onClick({ composedPath: () => [{ dataset }], stopPropagation() {} });
const inMinutes = (m) => new Date(Date.now() + m * 60_000).toISOString();

test("Jellyfin: an episode shows its series and episode, the client app in the subtitle", () => {
  const h = html(card({ entity: TV }));
  assert.match(h, /<div class="track" title="The Lighthouse Keeper">The Lighthouse Keeper<\/div>/);
  assert.match(h, /<div class="artist">Harbor Tales · S2E5<\/div>/);
  assert.match(h, /<div class="sub">Jellyfin Android TV · Jellyfin<\/div>/);
});

test("Jellyfin: a film says so; with no artwork the session draws a TV", () => {
  const movie = home({ [TV]: { attributes: { media_content_type: "movie", media_series_title: undefined, media_season: undefined, media_episode: undefined, entity_picture: undefined } } });
  const h = html(card({ entity: TV }, makeHass(movie)));
  assert.match(h, /<div class="artist">Movie<\/div>/);
  assert.match(h, /class="pic-box/);
  assert.match(h, /class="pic" viewBox="0 0 [0-9 ]+"[^>]*>[\s\S]*screen/, "the drawn picture is the TV");
});

test("Jellyfin: idle sessions are left out of the stack, unless hide_idle_sessions is off", () => {
  const ids = (c) => [...html(c).matchAll(/data-action="show_player" data-target="([^"]+)"/g)].map((m) => m[1]);
  const players = [ECHO, TV, WEB];
  assert.deepEqual(ids(card({ players })), [ECHO, TV]);
  assert.match(html(card({ players })), /1 more: Web browser/);
  assert.deepEqual(ids(card({ players, hide_idle_sessions: false })), [ECHO, TV, WEB]);
  // Every listed player idle: they are shown anyway rather than an empty card.
  assert.doesNotMatch(html(card({ players: [WEB, TV] }, makeHass(home({ [TV]: { state: "idle" } })))), /No media player found/);
});

test("Jellyfin: idle sessions are left out of the rooms too", () => {
  const h = html(card({ entity: TV, entities: [WEB, ECHO] }));
  assert.doesNotMatch(h, /Web browser/);
  assert.match(h, /Kitchen Echo/);
  assert.match(html(card({ entity: TV, entities: [WEB, ECHO], hide_idle_sessions: false })), /Web browser/);
});

test("Alexa: last called badge, next alarm and timer, do-not-disturb switch", () => {
  const h = html(card({ entity: ECHO }));
  assert.match(h, /<span class="tag">Last called<\/span>/);
  assert.match(h, /title="Alarm [^"]+"/);
  assert.match(h, /title="Timer [^"]+"/);
  assert.doesNotMatch(h, /title="Reminder/, "an unavailable sensor is not shown");
  assert.match(h, /data-action="dnd" data-target="switch\.kitchen_echo_do_not_disturb_switch"/);
  assert.doesNotMatch(h, /data-action="dnd"[^>]*aria-pressed="true"/);
  const on = html(card({ entity: ECHO }, makeHass(home({ [DND]: { state: "on" } }))));
  assert.match(on, /data-action="dnd"[^>]*aria-pressed="true"/);
  const quiet = html(card({ entity: ECHO }, makeHass(home({ [ECHO]: { attributes: { last_called: false } } }))));
  assert.doesNotMatch(quiet, /Last called/);
});

test("Alexa: the do-not-disturb button toggles the Echo's switch", () => {
  const hass = makeHass();
  const c = card({ entity: ECHO }, hass);
  click(c, { action: "dnd", target: DND });
  assert.deepEqual(hass.calls, [["switch", "toggle", { entity_id: DND }]]);
});

test("Alexa: the next timer shows the time today, the day otherwise", () => {
  const c = card({ entity: ECHO });
  const today = new Date(Date.now());
  today.setHours(23, 59, 0, 0);
  const later = c._when(today.toISOString());
  assert.ok(later && !/[A-Za-z]{2,}/.test(later.replace(/[AP]M/i, "")), `today: the time only (${later})`);
  const nextWeek = c._when(new Date(Date.now() + 3 * 86_400_000).toISOString());
  assert.match(nextWeek, /[A-Za-z]{2,}/, "another day: with the day");
  assert.equal(c._when("unavailable"), "");
  assert.match(html(card({ entity: ECHO }, makeHass(home({ "sensor.kitchen_echo_next_timer": { state: inMinutes(5) } })))), /title="Timer [^"]+"/);
});

test("Alexa: the speaker group is shown as one, with no join button", () => {
  const h = html(card({ entity: GROUP }));
  assert.match(h, /<div class="sub">Speaker group<\/div>/);
  assert.doesNotMatch(h, /data-action="join"/);
});

test("Alexa: the mini card has the compact row; the stack too", () => {
  const mini = html(card({ entity: ECHO }, makeHass(), mc.MediaMiniCard));
  assert.match(mini, /class="alexa compact"/);
  assert.match(mini, /data-action="dnd"/);
  assert.doesNotMatch(mini, /<span>Alarm<\/span>/, "compact: the icon stands for the label");
  assert.match(html(card({ players: [ECHO, TV] })), /class="alexa compact"/);
});

test("Alexa: favorites take Alexa content types (Amazon Music, TuneIn, a voice command)", () => {
  const hass = makeHass();
  const favorites = [
    { name: "Jazz", media_content_id: "jazz playlist", media_content_type: "AMAZON_MUSIC" },
    { name: "News", media_content_id: "play the news", media_content_type: "custom" },
  ];
  const c = card({ entity: ECHO, favorites }, hass);
  assert.match(html(c), /Jazz/);
  assert.match(html(c), /News/);
});

test("other integrations: no Alexa row, no Jellyfin line", () => {
  const h = html(card({ entity: "media_player.living_room" }));
  assert.doesNotMatch(h, /class="alexa/);
  assert.match(h, /<div class="artist">The Neon Drifters<\/div>/);
});

const ATV = "media_player.family_room_apple_tv";
const HOMEPOD = "media_player.study_homepod";
const REMOTE = "remote.family_room_apple_tv";

test("Apple TV: the app in the subtitle, the episode, its apps as sources, a drawn box with no artwork", () => {
  const h = html(card({ entity: ATV }));
  assert.match(h, /<div class="sub">TV<\/div>/);
  assert.match(h, /<div class="artist">Northern Lights · S1E4<\/div>/);
  assert.match(h, /Arcade/);
  assert.match(h, /M30 72L42 62H110L98 72z/, "the drawn streaming box");
  assert.match(h, /M64 22L80 30L64 38z/, "a video plays: the small screen with its play triangle");
  assert.doesNotMatch(h, /data-action="join"/, "no grouping in apple_tv");
});

test("Apple TV: the remote only with show_remote, and its keys send remote.send_command", () => {
  assert.doesNotMatch(html(card({ entity: ATV })), /data-action="remote"/);
  const hass = makeHass();
  const c = card({ entity: ATV, show_remote: true }, hass);
  const keys = [...html(c).matchAll(/data-action="remote" data-target="remote\.family_room_apple_tv" data-value="([a-z_]+)"/g)].map((m) => m[1]);
  assert.deepEqual(keys, ["up", "left", "select", "right", "down", "menu", "home", "play_pause"]);
  click(c, { action: "remote", target: REMOTE, value: "select" });
  assert.deepEqual(hass.calls, [["remote", "send_command", { entity_id: REMOTE, command: "select" }]]);
  // Not an Apple TV: no remote section even with the option.
  assert.doesNotMatch(html(card({ entity: ECHO, show_remote: true })), /data-action="remote"/);
});

test("Apple TV mini card: a remote button opens the remote in a popup that stays open while its keys are pressed", () => {
  const mini = (config, hass) => card(config, hass, mc.MediaMiniCard);
  assert.doesNotMatch(html(mini({ entity: ATV })), /data-action="open_remote"/, "only with show_remote");
  assert.doesNotMatch(html(mini({ entity: ECHO, show_remote: true })), /data-action="open_remote"/, "only an Apple TV");
  const hass = makeHass();
  const c = mini({ entity: ATV, show_remote: true }, hass);
  assert.match(html(c), /data-action="open_remote" data-target="remote\.family_room_apple_tv"/);
  assert.doesNotMatch(html(c), /data-action="remote"/, "no keys before the popup opens");
  click(c, { action: "open_remote", target: REMOTE });
  const h = html(c);
  assert.match(h, /<ha-card class="dialog-open remote-open">/);
  assert.match(h, /role="dialog"/);
  const keys = [...h.matchAll(/data-action="remote" data-target="remote\.family_room_apple_tv" data-value="([a-z_]+)"/g)].map((m) => m[1]);
  assert.deepEqual(keys, ["up", "left", "select", "right", "down", "menu", "home", "play_pause"]);
  click(c, { action: "remote", target: REMOTE, value: "up" });
  click(c, { action: "remote", target: REMOTE, value: "select" });
  assert.deepEqual(hass.calls, [
    ["remote", "send_command", { entity_id: REMOTE, command: "up" }],
    ["remote", "send_command", { entity_id: REMOTE, command: "select" }],
  ]);
  assert.match(html(c), /role="dialog"/, "still open after the keys");
  click(c, { action: "confirm_cancel" });
  assert.doesNotMatch(html(c), /role="dialog"/, "closed by its cross");
});

test("HomePod: a speaker, with its drawn mesh speaker and no join button", () => {
  const h = html(card({ entity: HOMEPOD }));
  assert.match(h, /class="pic-box/);
  assert.match(h, /<rect x="38" y="12" width="64" height="98" rx="28"/);
  assert.doesNotMatch(h, /data-action="join"/);
});

test("device pictures: model → family, tolerant, Amazon and Apple only", () => {
  const pf = mc.pictureFamily;
  const cases = [
    ["Echo (Gen2)", "Amazon", "echo"],
    ["Echo Plus (Gen1)", "Amazon", "echo"],
    ["Echo (Gen4)", "Amazon", "echo_dot"],
    ["Echo Studio", "Amazon", "echo_studio"],
    ["Echo Dot (Gen5)", "Amazon", "echo_dot"],
    ["Echo Dot (5th Gen)", "Amazon", "echo_dot"],
    ["echo dot clock (gen4)", "Amazon", "echo_dot"],
    ["Echo Dot (Gen3)", "Amazon", "echo_dot_puck"],
    ["Echo Dot (2nd Gen)", "Amazon", "echo_dot_puck"],
    ["Echo Pop", "Amazon", "echo_pop"],
    ["Echo Show 5 (Gen2)", "Amazon", "echo_show_small"],
    ["Echo Show 8 (Gen3)", "Amazon", "echo_show_small"],
    ["Echo Spot (Gen2)", "Amazon", "echo_show_small"],
    ["Echo Show 10 (Gen3)", "Amazon", "echo_show"],
    ["Echo Show 15 (Gen1)", "Amazon", "echo_show"],
    ["HomePod", "Apple", "homepod"],
    ["HomePod (gen 2)", "Apple", "homepod"],
    ["HomePod Mini", "Apple", "homepod_mini"],
    ["homepod mini", "Apple", "homepod_mini"],
    ["Apple TV 4K (gen 3)", "Apple", "apple_tv"],
    ["Apple TV 4", "Apple", "apple_tv"],
  ];
  for (const [model, maker, family] of cases) assert.equal(pf(model, maker), family, model);
  assert.equal(pf("Echo Auto", "Amazon"), "", "not a speaker of these families");
  assert.equal(pf("Echo Buds (Gen2)", "Amazon"), "");
  assert.equal(pf("Speaker Group", "Amazon"), "");
  assert.equal(pf("AirPort Express (gen 2)", "Apple"), "");
  assert.equal(pf("HomePod", "Sonos"), "", "another manufacturer");
  assert.equal(pf("Echo Pop", "", "alexa_media"), "echo_pop", "no manufacturer: the integration decides");
  assert.equal(pf("Echo Pop", "", "sonos"), "");
  assert.equal(pf("", "Amazon"), "");
  for (const draw of Object.values(mc.DEVICE_PICTURES)) {
    const on = draw(true, ["#fff", "#ccc", "#999"]);
    assert.match(on, /^<svg class="pic"/);
    assert.match(on, /class="glow"/, "the lights pulse while playing");
    assert.doesNotMatch(draw(false, ["#fff", "#ccc", "#999"]), /class="glow"/, "still when not playing");
    assert.doesNotMatch(on, /<text|Amazon|Apple|Echo|HomePod/i, "no brand, logo or name in the drawing");
  }
});

test("device pictures: shown for the matching devices only, generic picture otherwise", () => {
  const noArt = (id) => home({ [id]: { attributes: { entity_picture: undefined } } });
  assert.match(html(card({ entity: ECHO }, makeHass(noArt(ECHO)))), /M33 96a42 42 0 1 1 74 0z/, "Echo Dot (5th Gen): the sphere");
  const generic = html(card({ entity: "media_player.bathroom" }));
  assert.match(generic, /<rect x="40" y="6" width="60" height="104" rx="14"/, "a player with no known device keeps the generic speaker");
});

test("HomePod mini: seen from slightly above in the full card (+ and − on its top), straight on in the mini card", () => {
  const draw = mc.DEVICE_PICTURES.homepod_mini;
  const f = ["#fff", "#ccc", "#999"];
  const above = draw(true, f);
  const front = draw(true, f, true);
  assert.match(above, /<ellipse class="glow" cx="70" cy="30"/, "the glowing top surface");
  assert.match(above, /stroke="#fff"/, "the + and − marks");
  assert.doesNotMatch(front, /stroke="#fff"/);
  assert.match(front, /<rect class="glow"/, "front: the top light as a line");
  assert.match(draw(true, f), /#9b6dff/, "violet while playing");
  assert.equal(mc.DEVICE_PICTURES.echo(true, f).includes("#22c3e6"), true, "cyan ring");
});
