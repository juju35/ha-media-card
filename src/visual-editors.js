// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------
import { DEFAULT_COLLAPSED, SECTIONS } from "./core.js";
import { lang, listedPlayers, t } from "./helpers.js";
import { MediaCard } from "./cards.js";

export const LANGUAGES = [
  ["en", "English"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["es", "Español"],
  ["sr", "Српски"],
  ["sr-Latn", "Srpski (latinica)"],
  ["it", "Italiano"],
  ["nl", "Nederlands"],
  ["pt", "Português (Portugal)"],
  ["pl", "Polski"],
  ["ro", "Română"],
  ["da", "Dansk"],
  ["sv", "Svenska"],
  ["bg", "Български"],
  ["ru", "Русский"],
  ["uk", "Українська"],
  ["hu", "Magyar"],
  ["sk", "Slovenčina"],
  ["cs", "Čeština"],
  ["sl", "Slovenščina"],
  ["lv", "Latviešu"],
  ["el", "Ελληνικά"],
];

export const HELPERS = { zoom: "zoom_helper", players: "players_helper" };

// Several players stacked in the card (both editors).
// Lists of players that accept `- entity: media_player.x` as well as plain ids in the YAML.
export const ENTITY_LISTS = ["players", "entities"];

export const PLAYERS_FIELD = { name: "players", selector: { entity: { domain: "media_player", multiple: true } } };

export class MediaEditorBase extends HTMLElement {
  // [name, default]
  static get toggles() {
    return [];
  }

  static get defaults() {
    return {};
  }

  static extraFields() {
    return [];
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _schema() {
    const tr = (k) => t(this._hass, this._config, k);
    return [
      { name: "entity", selector: { entity: { domain: "media_player" } } },
      { name: "title", selector: { text: {} } },
      ...this.constructor.extraFields(tr),
      { type: "grid", name: "", schema: this.constructor.toggles.map(([name]) => ({ name, selector: { boolean: {} } })) },
      {
        name: "language",
        selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("lang_auto") }, ...LANGUAGES.map(([value, label]) => ({ value, label }))] } },
      },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    const toggles = this.constructor.toggles;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => t(this._hass, this._config, s.name);
      this._form.computeHelper = (s) => (HELPERS[s.name] ? t(this._hass, this._config, HELPERS[s.name]) : undefined);
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        // The players and rooms keep their YAML form (`- entity: media_player.x`) when they were objects.
        for (const k of ENTITY_LISTS) {
          if (!Array.isArray(config[k])) continue;
          const prev = new Map([].concat(this._config[k] || []).map((e) => [typeof e === "string" ? e : e?.entity, e]));
          config[k] = config[k].map((id) => prev.get(id) ?? id);
        }
        const defaults = { ...Object.fromEntries(toggles), ...this.constructor.defaults };
        // Keep the YAML minimal: drop empty values and options left at their default.
        for (const [k, v] of Object.entries(config)) {
          const empty = v === "" || v === undefined || v === null || (Array.isArray(v) && !v.length && k !== "collapsed");
          if (empty || (k in defaults && JSON.stringify(v) === JSON.stringify(defaults[k]))) delete config[k];
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const data = { ...this.constructor.defaults, ...this._config };
    for (const [name, def] of toggles) if (data[name] === undefined) data[name] = def;
    // The entity pickers take entity ids: `- entity: media_player.x` items are handed over as their id.
    for (const k of ENTITY_LISTS) if (Array.isArray(data[k])) data[k] = data[k].map((e) => (typeof e === "string" ? e : e?.entity)).filter(Boolean);
    if (!data.entity && !listedPlayers(data).length) data.entity = MediaCard.getStubConfig(this._hass).entity;
    this._form.hass = this._hass;
    // A new data or schema object re-renders the whole form: only when the config or the language changed.
    if (this._dataFor !== this._config) {
      this._dataFor = this._config;
      this._form.data = data;
    }
    const l = lang(this._hass, this._config);
    if (this._schemaLang !== l) {
      this._schemaLang = l;
      this._form.schema = this._schema();
    }
  }
}

export class MediaCardEditor extends MediaEditorBase {
  static get toggles() {
    return [
      ["illustration", true],
      ["show_title", true],
      ["show_subtitle", true],
      ["show_background", true],
      ["show_progress", true],
      ["show_controls", true],
      ["show_volume", true],
      ["show_rooms", true],
      ["show_source", true],
      ["show_queue", true],
      ["show_favorites", true],
      ["show_remote", false],
      ["only_playing", false],
      ["include_paused", false],
      ["hide_when_idle", false],
      ["hide_idle_sessions", true],
    ];
  }

  static get defaults() {
    return { collapsed: DEFAULT_COLLAPSED, illustration_theme: "auto" };
  }

  static extraFields(tr) {
    return [
      { name: "illustration_theme", selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((v) => ({ value: v, label: tr(`theme_${v}`) })) } } },
      PLAYERS_FIELD,
      { name: "entities", selector: { entity: { domain: "media_player", multiple: true } } },
      {
        name: "collapsed",
        selector: {
          select: {
            multiple: true,
            mode: "list",
            options: SECTIONS.map((v) => ({ value: v, label: tr(v) })),
          },
        },
      },
      { name: "favorites_entity", selector: { entity: { domain: "sensor" } } },
    ];
  }
}

// The mini card's detail button shows the full card: its editor offers the full card's options as well (rooms,
// folded sections, favorites sensor and the sections' toggles), on top of its own.
export class MediaMiniCardEditor extends MediaCardEditor {
  // The full card's toggles, with the detail button after the volume.
  static get toggles() {
    const full = MediaCardEditor.toggles;
    const at = full.findIndex(([name]) => name === "show_volume") + 1;
    return [...full.slice(0, at), ["zoom", true], ...full.slice(at)];
  }
}
