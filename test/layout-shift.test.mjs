// Browser test (Chromium through Playwright) of the cards on state updates: Home Assistant sends a new hass on every
// state change of the instance, and a card rewritten at each one made the dashboard jump. Updates of an entity the
// card does not show change nothing in its DOM; volume and position updates of its own player patch it in place (no
// element added or removed, the artwork's <img> and the record are the same nodes), its height holds on every frame,
// and a slider the user moved takes the new volume. Skipped when Playwright or Chromium is not installed.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { devices, entities, NOW, states } from "../scripts/mock-states.mjs";

const src = readFileSync(new URL("../src/media-card.js", import.meta.url), "utf8");
// Home Assistant's <ha-card> is a Lit element: it renders its slot a few microtasks after it is attached, so that a
// card rewritten from scratch measured its header (the status pill) in an empty frame. A plain stand-in hides that;
// this one renders late, like Lit.
const HA_CARD = `customElements.define("ha-card", class extends HTMLElement { connectedCallback() { if (this.shadowRoot) return;
  const r = this.attachShadow({ mode: "open" });
  Promise.resolve().then(() => Promise.resolve()).then(() => { r.innerHTML = "<style>:host{display:block;overflow:hidden}</style><slot></slot>"; }); } });`;
let browser;
let skip = false;
before(async () => {
  try {
    const { chromium } = await import("playwright");
    browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  } catch (err) {
    if (process.env.REQUIRE_BROWSER === "1") throw err;
    skip = `Chromium not available: ${err.message.split("\n")[0]}`;
  }
});
after(() => browser?.close());

const ID = "media_player.living_room";
const lr = states[ID];
const unrelated = Array.from({ length: 10 }, (_, i) => ({ "sensor.other": { entity_id: "sensor.other", state: String(i), attributes: {} } }));
const relevant = Array.from({ length: 10 }, (_, i) => {
  const at = new Date(NOW + i * 10000).toISOString();
  return { [ID]: { ...lr, attributes: { ...lr.attributes, media_position: 83 + i * 10, media_position_updated_at: at, volume_level: 0.3 + i / 50 } } };
});

test("state updates patch the cards in place: nothing for others' entities, no node replaced, a steady height", async (t) => {
  if (skip) return t.skip(skip);
  const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
  await page.clock.setFixedTime(NOW);
  await page.setContent("<!doctype html><body style='margin:0;font-family:Roboto,Arial,sans-serif'></body>");
  await page.addScriptTag({ content: HA_CARD });
  await page.addScriptTag({ content: src });
  const failures = await page.evaluate(
    async ({ data, unrelated, relevant, ID }) => {
      const frame = () => new Promise((r) => requestAnimationFrame(r));
      const out = [];
      for (const [type, zoom] of [["media-card", false], ["media-mini-card", false], ["media-mini-card", true]]) {
        const what = `${type}${zoom ? " zoomed" : ""}`;
        const box = document.body.appendChild(document.createElement("div"));
        box.style.width = "400px";
        let states = data.states;
        const el = document.createElement(type);
        el.setConfig({ type: `custom:${type}`, entity: ID });
        const push = (patch) => {
          states = { ...states, ...patch };
          el.hass = { ...data, states, themes: { darkMode: false }, callService: async () => {} };
        };
        push({ "sensor.other": { entity_id: "sensor.other", state: "x", attributes: {} } });
        box.appendChild(el);
        await frame();
        if (zoom) el.shadowRoot.querySelector(".zoom").dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, detail: 1 }));
        const mount = new Set();
        for (let i = 0; i < 3; i++) {
          await frame();
          mount.add(Math.round(el.getBoundingClientRect().height * 10) / 10);
        }
        if (mount.size !== 1) out.push(`${what}: height moved after it was shown: ${[...mount].join(" → ")}`);
        const r = el.shadowRoot;
        const nodes = [...r.querySelectorAll("*")];
        const height = el.getBoundingClientRect().height;
        const slider = r.querySelector("input[type=range]");
        if (slider) slider.value = "5"; // moved by the user: no longer follows its attribute
        const muts = [];
        new MutationObserver((l) => muts.push(...l)).observe(r, { subtree: true, childList: true, attributes: true, characterData: true });
        for (const p of unrelated) {
          push(p);
          await frame();
        }
        await new Promise((res) => setTimeout(res));
        if (muts.length) out.push(`${what}: ${muts.length} mutations on updates of another entity`);
        const heights = new Set();
        for (const p of relevant) {
          push(p);
          for (let f = 0; f < 3; f++) {
            heights.add(Math.round(el.getBoundingClientRect().height * 10) / 10);
            await frame();
          }
        }
        await new Promise((res) => setTimeout(res));
        const changed = muts.filter((m) => m.type === "childList" && [...m.addedNodes, ...m.removedNodes].some((n) => n.nodeType === 1));
        if (changed.length) out.push(`${what}: ${changed.length} element insertions/removals on updates of its own player`);
        const gone = nodes.filter((n) => !n.isConnected).map((n) => n.localName);
        if (gone.length) out.push(`${what}: nodes replaced: ${[...new Set(gone)].join(", ")}`);
        if (heights.size !== 1 || !heights.has(Math.round(height * 10) / 10)) out.push(`${what}: height moved: ${height} → ${[...heights].join(", ")}`);
        if (slider?.isConnected && slider.value !== String(Math.round(relevant.at(-1)[ID].attributes.volume_level * 100))) out.push(`${what}: slider at ${slider.value}`);
        box.remove();
      }
      return out;
    },
    { data: { states: { ...states }, entities, devices, language: "en", locale: { language: "en" } }, unrelated, relevant, ID },
  );
  await page.close();
  assert.deepEqual(failures, []);
});
