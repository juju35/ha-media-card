// Keyboard access: every clickable element is a <button>, a range input, or has a button / slider role and a tab stop.
import assert from "node:assert/strict";
import { test } from "node:test";
import { callWS, entities, states } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const mc = load();
const makeHass = () => ({ states, entities, language: "en", callService() {}, callWS });

const clickables = (html) => html.match(/<[a-z-]+\b[^>]*\bdata-(?:entity|action)="[^"]*"[^>]*>/g) || [];

for (const entity of ["media_player.living_room", "media_player.lounge", "media_player.home_cinema", "media_player.tv"]) {
  test(`every clickable element of the cards of ${entity} can be reached and used from the keyboard`, () => {
    const full = new mc.MediaCard();
    full.setConfig({ entity, collapsed: [] });
    full.hass = makeHass();
    const mini = new mc.MediaMiniCard();
    mini.setConfig({ entity });
    mini.hass = makeHass();
    for (const card of [full, mini]) {
      const tags = clickables(card.shadowRoot.innerHTML);
      assert.ok(tags.length > 2);
      for (const tag of tags) {
        if (tag.startsWith("<button")) {
          // An icon-only button gets a name; the others carry their text.
          if (/class="(btn round|zoom)/.test(tag)) assert.match(tag, /\baria-label="[^"]+"/, tag);
          continue;
        }
        assert.match(tag, /\brole="(button|slider)"/, tag);
        assert.match(tag, /\btabindex="0"/, tag);
      }
      for (const input of card.shadowRoot.innerHTML.match(/<input [^>]*>/g) || []) assert.match(input, /aria-label="[^"]+"/, input);
    }
  });
}

test("Enter and Space on a button role click it; the arrows seek on the progress slider", () => {
  const calls = [];
  const card = new mc.MediaCard();
  card.setConfig({ entity: "media_player.living_room" });
  card.hass = { ...makeHass(), callService: (...a) => calls.push(JSON.parse(JSON.stringify(a))) };
  let clicks = 0;
  const el = { getAttribute: (a) => (a === "role" ? "button" : null), click: () => clicks++, dataset: {} };
  card._onKeyDown({ key: "Enter", target: el, preventDefault() {} });
  card._onKeyDown({ key: " ", target: el, preventDefault() {} });
  assert.equal(clicks, 2);
  const slider = { getAttribute: (a) => (a === "role" ? "slider" : null), dataset: { action: "seek", target: "media_player.lounge" } };
  card._onKeyDown({ key: "Home", target: slider, preventDefault() {} });
  assert.deepEqual(calls, [["media_player", "media_seek", { entity_id: "media_player.lounge", seek_position: 0 }]]);
});

test("reduced motion stops every animation", () => {
  const card = new mc.MediaCard();
  card.setConfig({ entity: "media_player.living_room" });
  card.hass = makeHass();
  assert.match(card.shadowRoot.innerHTML, /@media \(prefers-reduced-motion: reduce\) \{ \*, \*::before, \*::after \{ animation: none !important;/);
});
