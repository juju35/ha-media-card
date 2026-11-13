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
