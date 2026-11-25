// The cards rendered with the mock players (scripts/mock-states.mjs) in a sandbox: what is drawn follows the
// supported_features of each player, and each control calls the right service.
import assert from "node:assert/strict";
import { test } from "node:test";
import { callWS, entities, FEATURES, states } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const mc = load();
const LIVING = "media_player.living_room";

const makeHass = (st = states, extra = {}) => {
  const calls = [];
  return { calls, states: st, entities, language: "en", callService: (...a) => calls.push(JSON.parse(JSON.stringify(a))), callWS, ...extra };
};

const withState = (id, patch, attrs = {}) => ({ ...states, [id]: { ...states[id], ...patch, attributes: { ...states[id].attributes, ...attrs } } });

const newCard = (config = {}, hass = makeHass(), Card = mc.MediaCard) => {
  const card = new Card();
  card.setConfig({ entity: LIVING, collapsed: [], ...config });
  card.hass = hass;
  return card;
};

const html = (card) => card.shadowRoot.innerHTML;
const click = (card, dataset, extra = {}) => card._onClick({ composedPath: () => [{ dataset }], stopPropagation() {}, ...extra });
const actions = (h) => [...h.matchAll(/data-action="([a-z_]+)"/g)].map((m) => m[1]);

test("supported_features: a feature bit set means supported", () => {
  const s = { attributes: { supported_features: mc.F.PAUSE | mc.F.VOLUME_SET } };
  assert.equal(mc.has(s, mc.F.PAUSE), true);
  assert.equal(mc.has(s, mc.F.VOLUME_SET), true);
  assert.equal(mc.has(s, mc.F.NEXT_TRACK), false);
  assert.equal(mc.has({ attributes: {} }, mc.F.PAUSE), false);
  assert.equal(mc.has(undefined, mc.F.PAUSE), false);
});

test("times, positions and volumes", () => {
  assert.equal(mc.fmtTime(0), "0:00");
  assert.equal(mc.fmtTime(83), "1:23");
  assert.equal(mc.fmtTime(3725), "1:02:05");
  assert.equal(mc.fmtTime(Number.NaN), "");
  const at = new Date(1_000_000).toISOString();
  const s = { state: "playing", attributes: { media_position: 10, media_position_updated_at: at, media_duration: 30 } };
  assert.equal(mc.position(s, 1_000_000 + 5000), 15);
  assert.equal(mc.position(s, 1_000_000 + 60000), 30, "never past the end");
  assert.equal(mc.position({ ...s, state: "paused" }, 1_000_000 + 5000), 10, "paused: the position stays");
  assert.equal(mc.position({ state: "playing", attributes: {} }), null);
  assert.equal(mc.volPct({ attributes: { volume_level: 0.426 } }), 43, "whole percentages");
  assert.equal(mc.volPct({ attributes: {} }), null);
});

test("the full card shows the artwork, the track, the progress, the controls and the volume", () => {
  const h = html(newCard());
  assert.match(h, /class="backdrop-art"/);
  assert.match(h, /<div class="track mt" title="Midnight Avenue">Midnight Avenue<\/div>/);
  assert.match(h, /The Neon Drifters/);
  assert.match(h, /City Lights/);
  assert.match(h, /class="vinyl playing"/);
  assert.match(h, /class="eq playing"/);
  assert.match(h, /role="slider" tabindex="0" data-action="seek"/);
  for (const a of ["shuffle", "previous", "pause", "next", "repeat", "power", "mute"]) assert.ok(actions(h).includes(a), a);
  assert.match(h, /<input type="range"[^>]*value="42"/);
  assert.match(h, /42 %/);
  assert.match(h, /With Kitchen/, "subtitle: the other members of the group");
});

test("buttons the player does not support are not drawn", () => {
  // The receiver: no transport, a volume, sources and sound modes.
  const card = newCard({ entity: "media_player.home_cinema" });
  const a = actions(html(card));
  for (const x of ["play", "pause", "next", "previous", "shuffle", "repeat", "seek"]) assert.ok(!a.includes(x), x);
  assert.ok(a.includes("power") && a.includes("mute") && a.includes("source") && a.includes("sound_mode"));
  // A player with only volume steps gets - / + buttons instead of a slider.
  const st = withState("media_player.home_cinema", {}, { supported_features: mc.F.VOLUME_STEP });
  const h = html(newCard({ entity: "media_player.home_cinema" }, makeHass(st)));
  assert.doesNotMatch(h, /<input type="range"/);
  assert.ok(actions(h).includes("vol_down") && actions(h).includes("vol_up"));
});

test("the drawn picture stands in for a missing artwork, animated while playing", () => {
  const speaker = html(newCard({ entity: "media_player.bathroom" }));
  assert.match(speaker, /class="cone beat"/);
  assert.match(speaker, /class="wave/);
  assert.doesNotMatch(speaker, /class="backdrop-art"/);
  const tv = html(newCard({ entity: "media_player.tv" }));
  assert.match(tv, /<rect class="glow"/);
  const off = html(newCard({ entity: "media_player.tv" }, makeHass(withState("media_player.tv", { state: "off" }))));
  assert.doesNotMatch(off, /class="glow"/);
  assert.deepEqual(actions(off).filter((a) => a !== "toggle_section"), ["power"], "an off player only gets its power button");
});

test("paused and buffering play their own animations", () => {
  const p = html(newCard({}, makeHass(withState(LIVING, { state: "paused" }))));
  assert.match(p, /class="eq paused"/);
  assert.match(p, /class="vinyl "/);
  assert.ok(actions(p).includes("play"));
  const b = html(newCard({}, makeHass(withState(LIVING, { state: "buffering" }))));
  assert.match(b, /class="spinner"/);
});

test("each control calls its service", () => {
  const hass = makeHass();
  const card = newCard({}, hass);
  for (const [action, service, data] of [
    ["pause", "media_pause", {}],
    ["next", "media_next_track", {}],
    ["previous", "media_previous_track", {}],
    ["shuffle", "shuffle_set", { shuffle: true }],
    ["repeat", "repeat_set", { repeat: "one" }],
    ["mute", "volume_mute", { is_volume_muted: true }],
    ["power", "turn_off", {}],
  ]) {
    hass.calls.length = 0;
    click(card, { action });
    assert.deepEqual(hass.calls, [["media_player", service, { entity_id: LIVING, ...data }]], action);
  }
  hass.calls.length = 0;
  click(card, { action: "seek" }, { clientX: 150 });
  assert.deepEqual(hass.calls, [], "seek needs the bar's box");
  card._onClick({ composedPath: () => [{ dataset: { action: "seek" }, getBoundingClientRect: () => ({ left: 100, width: 200 }) }], stopPropagation() {}, clientX: 200 });
  assert.deepEqual(hass.calls, [["media_player", "media_seek", { entity_id: LIVING, seek_position: 123 }]]);
});

test("the volume slider sets the volume once released, for the room it belongs to", () => {
  const hass = makeHass();
  const card = newCard({}, hass);
  card._dragging = true;
  card._onChange({ target: { type: "range", value: "64", dataset: { target: "media_player.kitchen" } } });
  assert.deepEqual(hass.calls, [["media_player", "volume_set", { entity_id: "media_player.kitchen", volume_level: 0.64 }]]);
  assert.equal(card._dragging, false);
});

test("no re-render under a slider being dragged, one once released", () => {
  const card = newCard();
  const before = html(card);
  card._dragging = true;
  card.hass = makeHass(withState(LIVING, {}, { media_title: "Another song" }));
  assert.equal(html(card), before);
  card._onChange({ target: { type: "range", value: "40", dataset: { target: LIVING } } });
  assert.match(html(card), /Another song/);
});

test("a slider released without a new value does not freeze the card", async () => {
  const card = newCard();
  card.shadowRoot.listeners.pointerdown({ target: { type: "range" } });
  assert.equal(card._dragging, true);
  card.hass = makeHass(withState(LIVING, {}, { media_title: "Another song" }));
  assert.doesNotMatch(html(card), /Another song/);
  mc.window.fire("pointerup", {});
  await new Promise((r) => setTimeout(r, 5));
  assert.equal(card._dragging, false);
  assert.match(html(card), /Another song/, "the render held back meanwhile is done");
});

test("the position is painted, not rendered: an update of media_position rewrites nothing", () => {
  const card = newCard();
  const before = html(card);
  assert.match(before, /<span data-elapsed><\/span>/);
  card.hass = makeHass(withState(LIVING, {}, { media_position: 99, media_position_updated_at: new Date().toISOString() }));
  assert.equal(html(card), before);
});

test("artwork URLs cannot close the CSS url() of the blurred background", () => {
  const card = newCard({}, makeHass(withState(LIVING, {}, { entity_picture_local: null, entity_picture: "https://x/a.jpg'); position: fixed; inset: 0; ('" })));
  const style = html(card).match(/class="backdrop-art" style="([^"]*)"/)[1];
  assert.equal(style.split("'").length, 3, "the url's own quotes only");
  assert.doesNotMatch(style, /;\s*position/);
  assert.match(style, /%27%29%3b%20position/);
});

test("rooms: every speaker that can group, with its volume, and join / leave", () => {
  const hass = makeHass();
  const card = newCard({}, hass);
  const h = html(card);
  assert.match(h, /data-section="rooms" aria-expanded="true"/);
  for (const n of ["Living room", "Kitchen", "Office", "Bedroom"]) assert.match(h, new RegExp(`data-action="show_player"[^>]*>${n}<`));
  assert.doesNotMatch(h, />Lounge</, "another integration's speaker cannot join this group");
  assert.match(h, /data-action="leave" data-target="media_player\.kitchen"/);
  assert.match(h, /data-action="join" data-target="media_player\.office"/);
  assert.match(h, /class="room-icon active ring"/, "the playing members of the group ring");
  click(card, { action: "join", target: "media_player.office" });
  assert.deepEqual(hass.calls.at(-1), ["media_player", "join", { entity_id: LIVING, group_members: ["media_player.office"] }]);
  // Shown as joined at once, until the player reports it.
  assert.match(html(card), /data-action="leave" data-target="media_player\.office"/);
  click(card, { action: "leave", target: "media_player.kitchen" });
  assert.deepEqual(hass.calls.at(-1), ["media_player", "unjoin", { entity_id: "media_player.kitchen" }]);
});

test("a group member left idle by its integration shows the leader's state", () => {
  // Music Assistant keeps every member but the leader idle while the group plays.
  const st = withState("media_player.kitchen", { state: "idle" });
  const rings = (h) => h.match(/class="room-icon active ring"/g)?.length || 0;
  assert.equal(rings(html(newCard({}, makeHass(st)))), 2, "both members of the playing group ring");
  const mini = newCard({ entity: "media_player.kitchen" }, makeHass(st), mc.MediaMiniCard);
  assert.match(html(mini), /data-action="pause"/, "the member offers pause, as the group plays");
  const paused = { ...st, [LIVING]: { ...st[LIVING], state: "paused" } };
  assert.match(html(newCard({ entity: "media_player.kitchen" }, makeHass(paused), mc.MediaMiniCard)), /data-action="play"/);
  // Not listed in the leader's group: its own state stays.
  const alone = { ...st, [LIVING]: { ...st[LIVING], attributes: { ...st[LIVING].attributes, group_members: [LIVING] } } };
  assert.doesNotMatch(html(newCard({ entity: "media_player.kitchen" }, makeHass(alone), mc.MediaMiniCard)), /data-action="pause"/);
});

test("ungroup all asks first, in a popup at the top of the card", () => {
  const hass = makeHass();
  const card = newCard({}, hass);
  click(card, { action: "ungroup_all" });
  assert.match(html(card), /<ha-card class="dialog-open">/);
  assert.match(html(card), /Remove every speaker from the group of Living room\?/);
  assert.deepEqual(hass.calls, []);
  card._onClick({ composedPath: () => [{ dataset: { action: "confirm_ok" } }], stopPropagation() {} });
  assert.deepEqual(hass.calls, [["media_player", "unjoin", { entity_id: "media_player.kitchen" }]]);
  assert.doesNotMatch(html(card), /dialog-open/);
});

test("the entities option lists the rooms, and a click on a room shows that player", () => {
  const card = newCard({ entities: ["media_player.lounge", "media_player.home_cinema"] });
  const h = html(card);
  assert.match(h, />Lounge</);
  assert.match(h, />Home cinema</);
  assert.doesNotMatch(h, />Office</);
  click(card, { action: "show_player", target: "media_player.lounge" });
  assert.match(html(card), /Golden Hour/);
  assert.match(html(card), /Track 3 of 12/);
});

test("source and sound mode chips select them", () => {
  const hass = makeHass();
  const card = newCard({ entity: "media_player.home_cinema" }, hass);
  const h = html(card);
  assert.match(h, /class="btn on" data-action="source" data-target="media_player\.home_cinema" data-value="TV Audio" aria-pressed="true"/);
  assert.match(h, /data-value="Dolby Surround" aria-pressed="true"/);
  click(card, { action: "source", value: "Phono" });
  click(card, { action: "sound_mode", value: "Direct" });
  assert.deepEqual(hass.calls, [
    ["media_player", "select_source", { entity_id: "media_player.home_cinema", source: "Phono" }],
    ["media_player", "select_sound_mode", { entity_id: "media_player.home_cinema", sound_mode: "Direct" }],
  ]);
});

test("Music Assistant queue: the current and the next track, fetched through get_queue", async () => {
  const seen = [];
  const hass = makeHass(states, {
    callWS: (m) => {
      seen.push(m);
      return callWS(m);
    },
  });
  const card = newCard({}, hass);
  assert.match(html(card), /Loading the queue/);
  await new Promise((r) => setTimeout(r, 10));
  assert.deepEqual(JSON.parse(JSON.stringify(seen[0])), { type: "call_service", domain: "music_assistant", service: "get_queue", service_data: { entity_id: LIVING }, return_response: true });
  const h = html(card);
  assert.match(h, /Now playing/);
  assert.match(h, /Up next/);
  assert.match(h, /Evergreen/);
  assert.match(h, /Tracks in the queue: 18/);
  click(card, { action: "queue_next", target: LIVING });
  assert.deepEqual(hass.calls.at(-1), ["media_player", "media_next_track", { entity_id: LIVING }]);
  // No queue section for a player of another integration.
  assert.doesNotMatch(html(newCard({ entity: "media_player.lounge" })), /data-section="queue"/);
});

test("favorites: the option's list and the Sonos favorites sensor, played with play_media", () => {
  const hass = makeHass();
  const card = newCard({ entity: "media_player.lounge", favorites: [{ name: "Radio", media_content_id: "radio://one", media_content_type: "channel" }] }, hass);
  const h = html(card);
  for (const n of ["Radio", "Morning Jazz", "Focus Beats"]) assert.match(h, new RegExp(`<span>${n}</span>`));
  click(card, { action: "favorite", index: "0" });
  click(card, { action: "favorite", index: "4" });
  assert.deepEqual(hass.calls, [
    ["media_player", "play_media", { entity_id: "media_player.lounge", media_content_id: "radio://one", media_content_type: "channel" }],
    ["media_player", "play_media", { entity_id: "media_player.lounge", media_content_id: "FV:2/34", media_content_type: "favorite_item_id" }],
  ]);
});

test("favorites: an mdi icon when there is no image, the image first, a star otherwise", () => {
  const favorites = [
    { name: "Web", media_content_id: "a", icon: "mdi:web" },
    { name: "Both", media_content_id: "b", icon: "mdi:radio", image: "/local/b.png" },
    { name: "Bad", media_content_id: "c", icon: "radio" },
    { name: "Url", media_content_id: "d", icon: "https://example.com/radio.svg" },
  ];
  const h = html(newCard({ entity: "media_player.lounge", favorites }));
  assert.match(h, /<ha-icon class="icon" icon="mdi:web"><\/ha-icon><\/span><span>Web<\/span>/);
  assert.doesNotMatch(h, /icon="mdi:radio"/);
  assert.match(h, /<img src="\/local\/b.png" alt=""><\/span><span>Both<\/span>/);
  assert.match(h, /<svg class="icon "[^>]*><path d="[^"]+"\/><\/svg><\/span><span>Bad<\/span>/);
  assert.match(h, /<svg class="icon "[^>]*><path d="[^"]+"\/><\/svg><\/span><span>Url<\/span>/);
  assert.doesNotMatch(h, /icon="https/);
});

test("sections fold by default as configured, and unfold on click", () => {
  const card = newCard({ collapsed: undefined });
  let h = html(card);
  assert.match(h, /data-section="rooms" aria-expanded="true"/);
  assert.match(h, /data-section="queue" aria-expanded="false"/);
  assert.doesNotMatch(h, /Loading the queue/);
  click(card, { action: "toggle_section", section: "queue" });
  h = html(card);
  assert.match(h, /data-section="queue" aria-expanded="true"/);
  // A click elsewhere on the page folds it back.
  card.connectedCallback();
  card._outside.tap({ composedPath: () => [] });
  assert.match(html(card), /data-section="queue" aria-expanded="false"/);
  card.disconnectedCallback();
});

test("folding: a tap elsewhere (pointer), not a drag that ends outside; leaving the page folds back too", () => {
  const card = newCard({ collapsed: undefined }, makeHass());
  card.connectedCallback();
  const inside = { composedPath: () => [card] };
  const outside = { composedPath: () => [] };
  click(card, { action: "toggle_section", section: "queue" });
  // A slider pressed in the card and released outside of it: nothing folds.
  card._outside.tap(inside);
  assert.match(html(card), /data-section="queue" aria-expanded="true"/);
  // A tap on a spot that sends no click (iOS): the pointer alone folds it.
  card._outside.tap(outside);
  assert.match(html(card), /data-section="queue" aria-expanded="false"/);
  // Left with a section open and back: folded.
  click(card, { action: "toggle_section", section: "queue" });
  card.disconnectedCallback();
  card.connectedCallback();
  assert.match(html(card), /data-section="queue" aria-expanded="false"/);
  card.disconnectedCallback();
  // The mini card comes back compact.
  const mini = newCard({}, makeHass(), mc.MediaMiniCard);
  mini.connectedCallback();
  click(mini, { action: "zoom" });
  assert.match(html(mini), /data-section="rooms"/);
  mini.disconnectedCallback();
  mini.connectedCallback();
  assert.doesNotMatch(html(mini), /data-section=/);
  mini.disconnectedCallback();
});

test("the hidden players hide again when the card folds back, and no rewrite happens under a press", () => {
  const c = stacked({ only_playing: true }, makeHass(), mc.MediaMiniCard);
  c.connectedCallback();
  const n = () => (html(c).match(/class="pitem/g) || []).length;
  assert.equal(n(), 2);
  click(c, { action: "toggle_hidden" });
  assert.equal(n(), 3, "shown in the compact list");
  c._outside.tap({ composedPath: () => [] });
  assert.equal(n(), 2, "a tap elsewhere hides them again");
  click(c, { action: "zoom" });
  click(c, { action: "toggle_hidden" });
  c._unzoom.tap({ composedPath: () => [] });
  assert.equal(n(), 2, "back to compact: hidden again");
  click(c, { action: "toggle_hidden" });
  c.disconnectedCallback();
  c.connectedCallback();
  assert.equal(n(), 2, "left and back: hidden again");
  // A press in the card holds the rewrites until its click.
  const before = html(c);
  c._pressing = true;
  c.hass = makeHass(withState("media_player.office", { state: "playing" }));
  assert.equal(html(c), before, "no rewrite under the pointer");
  click(c, { action: "toggle_hidden" });
  assert.notEqual(html(c), before, "the click renders at once");
  c.disconnectedCallback();
});

test("an update held under a press is drawn on release, even when the click hits no button", async () => {
  const c = stacked({ only_playing: true }, makeHass(), mc.MediaMiniCard);
  c.connectedCallback();
  const before = html(c);
  c._pressing = true;
  c.hass = makeHass(withState("media_player.office", { state: "playing" }));
  assert.equal(html(c), before, "held under the press");
  // A click beside every button: nothing to do, nothing rendered by the click itself.
  c._onClick({ composedPath: () => [], stopPropagation() {}, detail: 1 });
  c._onPressEnd();
  await new Promise((r) => setTimeout(r, 0));
  assert.notEqual(html(c), before, "drawn on release");
  c.disconnectedCallback();
});

test("an unavailable player gets disabled buttons, and a click on them does nothing", () => {
  const hass = makeHass(withState(LIVING, { state: "unavailable" }));
  for (const Card of [mc.MediaCard, mc.MediaMiniCard]) {
    // Rooms folded: the other rooms are available, their buttons stay usable.
    const card = newCard({ collapsed: ["rooms"] }, hass, Card);
    const h = html(card);
    assert.match(h, /Unavailable/);
    for (const tag of h.match(/<button class="btn round[^>]*>/g) || []) assert.match(tag, / disabled/, tag);
    click(card, { action: "pause" });
    click(card, { action: "join", target: LIVING });
  }
  assert.deepEqual(hass.calls, []);
});

test("the mini card is compact, and its detail button switches to the full card and back", () => {
  const card = newCard({}, makeHass(), mc.MediaMiniCard);
  let h = html(card);
  assert.match(h, /class="zoom" data-action="zoom"/);
  assert.doesNotMatch(h, /data-section=/);
  assert.deepEqual(actions(h).filter((a) => ["previous", "pause", "next"].includes(a)), ["previous", "pause", "next"]);
  assert.ok(!actions(h).includes("shuffle"));
  click(card, { action: "zoom" });
  h = html(card);
  assert.match(h, /data-section="rooms"/);
  assert.equal(card.getGridOptions().columns, 12);
  card.connectedCallback();
  card._unzoom.tap({ composedPath: () => [] });
  assert.doesNotMatch(html(card), /data-section=/);
  assert.equal(card.getGridOptions().columns, 6);
  card.disconnectedCallback();
  assert.doesNotMatch(html(newCard({ zoom: false }, makeHass(), mc.MediaMiniCard)), /class="zoom"/);
});

test("without an entity, the first playing player is shown; errors are reported", () => {
  const card = new mc.MediaCard();
  card.setConfig({});
  card.hass = makeHass();
  assert.match(html(card), /Midnight Avenue|Golden Hour|Paper Planes|Morning Briefing/);
  assert.equal(mc.findPlayer(makeHass(), {}).id && states[mc.findPlayer(makeHass(), {}).id].state, "playing");
  const missing = newCard({ entity: "media_player.nope" });
  assert.match(html(missing), /Media player not found: media_player\.nope/);
  const none = newCard({}, makeHass({}));
  assert.match(html(none), /No media player found/);
  assert.throws(() => new mc.MediaCard().setConfig({ entity: "light.kitchen" }));
});

test("the classic header (illustration: false): 40 px icon in a tinted circle, state chip on the title line, title options", () => {
  const card = newCard({ illustration: false });
  const h = html(card);
  assert.doesNotMatch(h, /class="banner/);
  assert.match(h, /<div class="type-icon active">/);
  assert.match(h, /<span class="chip clickable active" role="button" tabindex="0" data-entity="media_player\.living_room" title="Playing"/);
  assert.match(newCard({ title: "Music", illustration: false }).shadowRoot.innerHTML, /<div class="name">Music<\/div>/);
});

test("the illustrated header: media room, the player's own device, state pill in the icon colour after the title", () => {
  const h = html(newCard());
  assert.match(h, /<div class="banner">/);
  assert.match(h, /<svg class="mc-scene" viewBox="0 0 200 80"/);
  assert.match(h, /<div class="mc-floor"/, "the 10 px ground strip");
  assert.match(h, /<svg class="mc-dev" x="[\d.]+" y="[\d.]+" width="[\d.]+" height="\d+"/, "the device picture, placed big in the scene");
  assert.match(h, /class="meter m0"/, "the TV's equalizer moves while playing");
  assert.match(h, /<div class="type-icon active clickable" role="button" tabindex="0" data-entity="media_player\.living_room"/);
  assert.match(h, /<div class="trow"><div class="name">[^<]+<\/div><span class="chip bst active clickable" role="button" tabindex="0" data-entity="media_player\.living_room" title="Playing" aria-label="Playing"><span class="dot"><\/span><span class="chip-text">Playing<\/span><\/span><\/div>/);
  assert.match(h, /<div class="sub" title="[^"]+">With [^<]+<\/div>/, "the state is in the pill, not repeated in the subtitle");
  assert.match(newCard({ title: "Music" }).shadowRoot.innerHTML, /<div class="name">Music<\/div>/);
  // Icon colour by state: paused amber, idle grey, unavailable red.
  assert.match(html(newCard({}, makeHass(withState(LIVING, { state: "paused" })))), /<div class="type-icon warn clickable"/);
  assert.match(html(newCard({}, makeHass(withState(LIVING, { state: "idle" })))), /<div class="type-icon idle clickable"/);
  assert.match(html(newCard({}, makeHass(withState(LIVING, { state: "unavailable" })))), /<div class="type-icon crit clickable"/);
  // Night: forced, else from the dark theme alone (a light theme keeps the day after sunset); day forced over it.
  assert.match(html(newCard({ illustration_theme: "night" })), /<div class="banner night">/);
  const sun = (state) => ({ ...states, "sun.sun": { entity_id: "sun.sun", state, attributes: {} } });
  assert.match(html(newCard({}, makeHass(sun("below_horizon")))), /<div class="banner">/);
  assert.match(html(newCard({}, makeHass(sun("below_horizon"), { themes: { darkMode: true } }))), /<div class="banner night">/);
  assert.match(html(newCard({}, makeHass(states, { themes: { darkMode: true } }))), /<div class="banner night">/);
  assert.match(html(newCard({ illustration_theme: "day" }, makeHass(sun("below_horizon")))), /<div class="banner">/);
  assert.match(html(newCard({}, makeHass(sun("above_horizon"), { themes: { darkMode: true } }))), /<div class="banner night">/);
  assert.match(html(newCard({}, makeHass(sun("above_horizon"), { themes: { darkMode: false } }))), /<div class="banner">/);
  assert.match(html(newCard({ illustration_theme: "day" }, makeHass(sun("above_horizon"), { themes: { darkMode: true } }))), /<div class="banner">/);
});

test("the illustrated header: unique picture ids per card, on the mini card too", () => {
  const a = html(newCard({ entity: "media_player.bathroom" }));
  const b = html(newCard({ entity: "media_player.bathroom" }));
  const ids = (h) => [...h.matchAll(/<svg class="mc-dev"[\s\S]*?id="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids(a).length && ids(b).length);
  assert.notEqual(ids(a)[0], ids(b)[0]);
  const mini = html(newCard({}, makeHass(), mc.MediaMiniCard));
  assert.match(mini, /<div class="banner[^"]*">/);
  assert.match(mini, /--mc-scene-w: min\(200px, 36%\)/);
});

test("the card speaks the language of Home Assistant or of its option", () => {
  const fr = newCard({ language: "fr" });
  assert.match(html(fr), /Lecture/);
  assert.match(html(fr), /Avec Kitchen/);
  const hass = { ...makeHass(), language: "de" };
  assert.match(html(newCard({}, hass)), /Wiedergabe/);
  assert.equal(mc.lang({ language: "pt-BR" }, {}), "pt");
  assert.equal(mc.lang({ language: "sr-Latn" }, {}), "sr-Latn");
});

test("every language has every text, with the same placeholders", () => {
  const en = mc.STRINGS.en;
  const ph = (v) => [...String(v).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join();
  const langs = Object.keys(mc.STRINGS);
  assert.equal(langs.length, 22);
  for (const l of langs) {
    assert.deepEqual(Object.keys(mc.STRINGS[l]).sort(), Object.keys(en).sort(), l);
    for (const k of Object.keys(en)) assert.equal(ph(mc.STRINGS[l][k]), ph(en[k]), `${l}.${k}`);
  }
});

test("visual editors: stub config, and defaults kept out of the YAML", () => {
  assert.deepEqual(mc.MediaCard.getStubConfig(makeHass()).entity.startsWith("media_player."), true);
  assert.equal(mc.MediaCard.getConfigElement().tagName ?? "x", mc.MediaCard.getConfigElement().tagName ?? "x");
  const ed = new mc.MediaCardEditor();
  ed.setConfig({ entity: LIVING });
  const form = { listeners: {}, addEventListener(t, f) { this.listeners[t] = f; } };
  const doc = mc.document;
  const create = doc.createElement;
  doc.createElement = (t) => (t === "ha-form" ? form : create(t));
  ed.appendChild = () => {};
  ed.hass = makeHass();
  doc.createElement = create;
  assert.ok(form.schema.some((s) => s.name === "entities"));
  const events = [];
  ed.dispatchEvent = (e) => events.push(e);
  form.listeners["value-changed"]({ stopPropagation() {}, detail: { value: { entity: LIVING, show_volume: true, show_rooms: false, title: "", collapsed: ["source", "queue", "favorites"] } } });
  assert.deepEqual({ ...events[0].detail.config }, { entity: LIVING, show_rooms: false });
  assert.equal(FEATURES.music_assistant & mc.F.GROUPING, mc.F.GROUPING);
});

const editorForm = (Editor, config) => {
  const ed = new Editor();
  ed.setConfig(config);
  const form = { listeners: {}, addEventListener(t, f) { this.listeners[t] = f; } };
  const doc = mc.document;
  const create = doc.createElement;
  doc.createElement = (t) => (t === "ha-form" ? form : create(t));
  ed.appendChild = () => {};
  ed.hass = makeHass();
  doc.createElement = create;
  const events = [];
  ed.dispatchEvent = (e) => events.push(e);
  return { form, events };
};
const schemaNames = (schema) => schema.flatMap((s) => (s.schema ? schemaNames(s.schema) : [s.name]));

test("visual editors: the mini card offers the full card's options its detail view uses", () => {
  const full = schemaNames(editorForm(mc.MediaCardEditor, { entity: LIVING }).form.schema);
  const mini = schemaNames(editorForm(mc.MediaMiniCardEditor, { entity: LIVING }).form.schema);
  for (const n of full) assert.ok(mini.includes(n), n);
  for (const n of ["zoom", "entities", "collapsed", "favorites_entity", "show_rooms", "show_queue", "show_favorites", "show_background"]) assert.ok(mini.includes(n), n);
  assert.ok(!mini.includes("favorites") && !full.includes("favorites"), "favorites stay YAML only");
});

test("visual editors: `- entity:` items are handed over as ids and kept as objects", () => {
  const rooms = [{ entity: "media_player.lounge" }, "media_player.office"];
  const { form, events } = editorForm(mc.MediaMiniCardEditor, { entity: LIVING, entities: rooms });
  assert.deepEqual([...form.data.entities], ["media_player.lounge", "media_player.office"]);
  form.listeners["value-changed"]({ stopPropagation() {}, detail: { value: { entity: LIVING, entities: ["media_player.lounge", "media_player.office", "media_player.kitchen"] } } });
  assert.deepEqual(JSON.parse(JSON.stringify(events[0].detail.config.entities)), [{ entity: "media_player.lounge" }, "media_player.office", "media_player.kitchen"]);
});

// Several players (`players`): stacked in the full card, listed in the mini card.
const PLAYERS = ["media_player.living_room", "media_player.lounge", "media_player.office"];
const stacked = (config = {}, hass = makeHass(), Card = mc.MediaCard) => {
  const card = new Card();
  card.setConfig({ players: PLAYERS, collapsed: [], ...config });
  card.hass = hass;
  return card;
};

test("players: one block per player, under a common header, each with its own controls", () => {
  const card = stacked();
  const h = html(card);
  assert.equal((h.match(/<div class="player">/g) || []).length, 3);
  assert.match(h, /<div class="name">Media<\/div>/, "default title");
  assert.match(h, /3 players/);
  assert.match(h, /<span class="chip-text">2 playing<\/span><\/span><\/div><div class="sub" title="3 players">3 players<\/div>/, "playing count in the banner's pill");
  assert.match(stacked({ illustration: false }).shadowRoot.innerHTML, /<span class="chip active" title="2 playing">/, "playing count in the classic header chip");
  assert.match(h, /Midnight Avenue/);
  assert.match(h, /Golden Hour/);
  assert.match(h, /data-progress="media_player\.lounge"/, "each bar names its player");
  assert.doesNotMatch(h, /data-section=/, "the heavy sections stay in the full view");
  assert.match(stacked({ title: "Music" }).shadowRoot.innerHTML, /<div class="name">Music<\/div>/);
  const hass = makeHass();
  const c = stacked({}, hass);
  click(c, { action: "pause", target: "media_player.lounge" });
  click(c, { action: "next", target: "media_player.living_room" });
  assert.deepEqual(hass.calls, [
    ["media_player", "media_pause", { entity_id: "media_player.lounge" }],
    ["media_player", "media_next_track", { entity_id: "media_player.living_room" }],
  ]);
  assert.match(h, /data-action="pause" data-target="media_player\.lounge"/);
  assert.equal(card.getCardSize(), 10);
});

test("players: a click on a player's name opens it in the full view, the back button returns to the stack", () => {
  const card = stacked();
  click(card, { action: "show_player", target: "media_player.lounge" });
  let h = html(card);
  assert.match(h, /data-action="back"/);
  assert.match(h, /data-section="source"/);
  assert.match(h, /<div class="name">Lounge<\/div>/);
  click(card, { action: "back" });
  h = html(card);
  assert.doesNotMatch(h, /data-action="back"/);
  assert.equal((h.match(/<div class="player">/g) || []).length, 3);
});

test("players: the position of each player is painted from its own state", () => {
  // Fresh timestamps: the mock states carry a fixed date, so every playing position would be clamped to 100 %.
  const now = new Date().toISOString();
  let st = withState("media_player.living_room", {}, { media_position_updated_at: now });
  st = { ...st, "media_player.lounge": { ...st["media_player.lounge"], attributes: { ...st["media_player.lounge"].attributes, media_position_updated_at: now } } };
  const card = stacked({}, makeHass(st));
  const els = [
    { dataset: { progress: "media_player.living_room" }, style: {} },
    { dataset: { progress: "media_player.lounge" }, style: {} },
  ];
  card.shadowRoot.querySelectorAll = (sel) => (sel === "[data-progress]" ? els : []);
  card._paintProgress();
  assert.notEqual(els[0].style.width, els[1].style.width);
  assert.ok(els.every((e) => /%$/.test(e.style.width)));
});

test("only_playing: the playing players only, the others in one line that shows them on click", () => {
  const card = stacked({ only_playing: true });
  let h = html(card);
  assert.equal((h.match(/<div class="player">/g) || []).length, 2);
  assert.match(h, /1 more: Office/);
  click(card, { action: "toggle_hidden" });
  h = html(card);
  assert.equal((h.match(/<div class="player">/g) || []).length, 3);
  assert.match(h, /aria-expanded="true"/);
  const paused = stacked({ only_playing: true }, makeHass(withState("media_player.lounge", { state: "paused" })));
  assert.equal((html(paused).match(/<div class="player">/g) || []).length, 1, "paused players are left out by default");
  const withPaused = stacked({ only_playing: true, include_paused: true }, makeHass(withState("media_player.lounge", { state: "paused" })));
  assert.equal((html(withPaused).match(/<div class="player">/g) || []).length, 2);
});

test("only_playing: when nothing plays, the player that changed last is shown", () => {
  const st = { ...states };
  for (const [i, id] of PLAYERS.entries()) st[id] = { ...st[id], state: "idle", last_changed: new Date(1_000_000 + i * (id === "media_player.lounge" ? 10_000 : 1000)).toISOString() };
  const h = html(stacked({ only_playing: true }, makeHass(st)));
  assert.equal((h.match(/<div class="player">/g) || []).length, 1);
  assert.match(h, /data-target="media_player\.lounge"/);
  assert.match(h, /2 more: Living room, Office/);
  assert.match(h, /Nothing playing/);
});

test("players: one player is the same as entity; players must be media players", () => {
  const one = stacked({ players: ["media_player.lounge"] });
  assert.doesNotMatch(html(one), /<div class="player">/);
  assert.match(html(one), /<div class="name">Lounge<\/div>/);
  assert.throws(() => new mc.MediaCard().setConfig({ players: ["media_player.a", "light.kitchen"] }));
  assert.match(html(stacked({ players: ["media_player.nope", "media_player.gone"] })), /No media player found/);
});

test("mini card with players: one row per player, a click unfolds a row, the detail button shows the stack", () => {
  const hass = makeHass();
  const card = stacked({}, hass, mc.MediaMiniCard);
  let h = html(card);
  assert.equal((h.match(/<div class="pitem">/g) || []).length, 3);
  assert.match(h, /data-action="pause" data-target="media_player\.living_room"/);
  assert.match(h, /<input type="range"[^>]*data-target="media_player\.lounge"/);
  assert.doesNotMatch(h, /data-action="shuffle"/);
  assert.equal(card.getCardSize(), 4);
  click(card, { action: "expand_player", target: "media_player.lounge" });
  h = html(card);
  assert.match(h, /<div class="pitem open">/);
  assert.match(h, /data-action="shuffle" data-target="media_player\.lounge"/);
  card.connectedCallback();
  card._outside.tap({ composedPath: () => [] });
  assert.doesNotMatch(html(card), /pitem open/, "a click elsewhere folds the row back");
  click(card, { action: "zoom" });
  assert.equal((html(card).match(/<div class="player">/g) || []).length, 3);
  click(card, { action: "show_player", target: "media_player.office" });
  assert.match(html(card), /data-action="back"/);
  card._unzoom.tap({ composedPath: () => [] });
  assert.equal((html(card).match(/<div class="pitem">/g) || []).length, 3, "back to the list, the opened player closed");
  card.disconnectedCallback();
  const only = stacked({ only_playing: true }, makeHass(), mc.MediaMiniCard);
  assert.equal((html(only).match(/<div class="pitem">/g) || []).length, 2);
  assert.match(html(only), /1 more: Office/);
});

test("visual editors: players, only_playing and include_paused, left out of the YAML at their defaults", () => {
  for (const Editor of [mc.MediaCardEditor, mc.MediaMiniCardEditor]) {
    const ed = new Editor();
    ed.setConfig({ players: PLAYERS });
    const form = { listeners: {}, addEventListener(t, f) { this.listeners[t] = f; } };
    const doc = mc.document;
    const create = doc.createElement;
    doc.createElement = (t) => (t === "ha-form" ? form : create(t));
    ed.appendChild = () => {};
    ed.hass = makeHass();
    doc.createElement = create;
    assert.ok(form.schema.some((s) => s.name === "players"));
    const toggles = form.schema.find((s) => s.type === "grid").schema.map((s) => s.name);
    assert.ok(toggles.includes("only_playing") && toggles.includes("include_paused"));
    assert.equal(form.data.entity, undefined, "no stub entity when players are set");
    assert.equal(form.computeHelper({ name: "players" }), "Two or more: one block per player, one under the other");
    const events = [];
    ed.dispatchEvent = (e) => events.push(e);
    form.listeners["value-changed"]({ stopPropagation() {}, detail: { value: { players: PLAYERS, only_playing: true, include_paused: false } } });
    assert.deepEqual({ ...events[0].detail.config }, { players: PLAYERS, only_playing: true });
  }
});

test("hide_when_idle: the card hides itself when none of its players plays nor is paused, not while edited", () => {
  const idle = (ids) => {
    const st = { ...states };
    for (const id of ids) st[id] = { ...st[id], state: "idle" };
    return st;
  };
  const visible = (card) => !card.hidden && html(card) !== "";
  const visibility = (card) => (card.events || []).filter((e) => e.type === "card-visibility-changed").map((e) => e.detail.value);
  // One player.
  const hass = makeHass(idle([LIVING]));
  const card = new mc.MediaCard();
  card.toggleAttribute = function (name, on) {
    this[name] = on;
  };
  card.setConfig({ entity: LIVING, hide_when_idle: true });
  card.hass = hass;
  assert.equal(visible(card), false);
  assert.equal(card.getCardSize(), 0);
  assert.deepEqual(visibility(card), [false]);
  card.hass = makeHass(withState(LIVING, { state: "paused" }));
  assert.equal(visible(card), true, "a paused player keeps the card");
  assert.deepEqual(visibility(card), [false, true]);
  card.hass = hass;
  card.preview = true;
  assert.equal(visible(card), true, "shown in the editor's preview");
  card.preview = false;
  card.editMode = true;
  assert.equal(visible(card), true, "shown while the dashboard is edited");
  // Off by default.
  assert.match(html(newCard({}, makeHass(idle([LIVING])))), /<ha-card/);
  // Several players: hidden only when none of them plays.
  for (const Card of [mc.MediaCard, mc.MediaMiniCard]) {
    const one = stacked({ hide_when_idle: true }, makeHass(idle(PLAYERS.slice(1))), Card);
    assert.match(html(one), /<ha-card/, "one player still plays");
    const none = stacked({ hide_when_idle: true }, makeHass(idle(PLAYERS)), Card);
    assert.equal(html(none), "");
  }
});

test("title_overflow: ellipsis by default, wrap on title_lines lines, scroll in a marquee span", () => {
  const plain = html(newCard());
  assert.match(plain, /class="track mt"/);
  assert.doesNotMatch(plain, /class="mq"/);
  const attrs = {};
  const props = {};
  const card = new mc.MediaCard();
  card.setAttribute = (n, v) => (attrs[n] = v);
  card.removeAttribute = (n) => delete attrs[n];
  card.style = { setProperty: (n, v) => (props[n] = v) };
  card.setConfig({ entity: LIVING, title_overflow: "wrap", title_lines: 3 });
  assert.deepEqual([attrs["title-overflow"], props["--mc-lines"]], ["wrap", "3"]);
  card.setConfig({ entity: LIVING, title_overflow: "wrap", title_lines: 0 });
  assert.equal(props["--mc-lines"], "none");
  card.setConfig({ entity: LIVING, title_overflow: "bogus" });
  assert.equal("title-overflow" in attrs, false);
  card.setConfig({ entity: LIVING, collapsed: [], title_overflow: "scroll" });
  card.hass = makeHass();
  assert.match(html(card), /<div class="track mt"[^>]*><span class="mq">/);
  // A measure already taken is written in the HTML, so that a patch keeps the line scrolling as it was.
  const title = states[LIVING].attributes.media_title;
  card._mq.set(`track|${title}`, { shift: -42, dur: 4 });
  card._update();
  assert.match(html(card), /class="track mt scrolling" style="--mq-shift:-42px;--mq-dur:4s"/);
  const list = html(newCard({ entity: undefined, players: ["media_player.living_room", "media_player.kitchen"], title_overflow: "scroll" }, makeHass(), mc.MediaMiniCard));
  assert.match(list, /class="prow-sub mt"><span class="mq">/);
});

test("title_overflow: in both visual editors, default values kept out of the YAML", () => {
  for (const Editor of [mc.MediaCardEditor, mc.MediaMiniCardEditor]) {
    const { form, events } = editorForm(Editor, { entity: LIVING });
    const names = schemaNames(form.schema);
    assert.ok(names.includes("title_overflow") && names.includes("title_lines"));
    form.listeners["value-changed"]({ stopPropagation() {}, detail: { value: { entity: LIVING, title_overflow: "ellipsis", title_lines: 2 } } });
    assert.deepEqual({ ...events[0].detail.config }, { entity: LIVING });
  }
});
