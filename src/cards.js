// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
import { CONFIRM_GUARD_MS, DEFAULT_COLLAPSED, F, ICONS, PENDING_MS, PLATFORMS } from "./core.js";
import { ALEXA_STYLE, DEVICE_PICTURES, FINISH, PHILIPS_STYLE, PICTURES, REMOTE_POPUP_STYLE, REMOTE_STYLE, SCENE_STYLE, accentStyle, alexaExtras, artOf, cssUrl, deviceOf, duration, esc, familyOf, favoritesOf, favoritesSensor, findPlayer, fmtTime, groupOf, has, iconClass, isActive, isAlexaGroup, isAppleTv, isJellyfin, isMusicAssistant, isNight, isOff, isPlaying, isStacked, kindFor, lang, listedPlayers, memberState, nameOf, offline, philipsExtras, platformOf, position, remoteCommand, remoteOf, roomIds, sameDeps, sceneDevice, sceneSvg, stackedPlayers, statusClass, svgIcon, t, textWidth, volPct } from "./helpers.js";
import { ANIM_STYLE, BASE_STYLE, DIALOG_STYLE, FOCUS_SELECTOR, FULL_STYLE, LIST_STYLE, MINI_STYLE, PLAYER_ACTIONS, REPEAT_NEXT, STACK_STYLE, focusKey, morph, watchOutside } from "./styles.js";
import { STRINGS } from "./i18n/strings.js";

export let mediaUid = 0;
export const OVERFLOWS = ["ellipsis", "wrap", "scroll"];

export class MediaBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    // Keeps the ids of the banner's pictures apart from those of the body (the same device drawn twice).
    this._uid = ++mediaUid;
    const root = this.shadowRoot;
    root.addEventListener("click", (ev) => this._onClick(ev));
    root.addEventListener("keydown", (ev) => this._onKeyDown(ev));
    // Volume sliders: the label follows while dragging, the volume is set once released.
    root.addEventListener("input", (ev) => this._onInput(ev));
    root.addEventListener("change", (ev) => this._onChange(ev));
    root.addEventListener("pointerdown", (ev) => {
      this._byPointer = true;
      // No rewrite of the card between the press and the release: Home Assistant updates the card several times a
      // second, and a rewrite under the pointer replaces the element pressed, so that the click lands on the card
      // itself and does nothing (a button or a « show the hidden players » row that does not react). The pending
      // render is done once released (after the click).
      this._pressing = true;
      window.addEventListener("pointerup", this._onPressEnd, true);
      window.addEventListener("pointercancel", this._onPressEnd, true);
      if (ev.target?.type !== "range") return;
      this._dragging = true;
      window.addEventListener("pointerup", this._onRelease, true);
      window.addEventListener("pointercancel", this._onRelease, true);
    });
    root.addEventListener("keydown", () => {
      this._byPointer = false;
    });
    this._onPressEnd = () => {
      window.removeEventListener("pointerup", this._onPressEnd, true);
      window.removeEventListener("pointercancel", this._onPressEnd, true);
      // After the click (which may have rendered already, or not: a click beside every button renders nothing), the
      // update held during the press is drawn now rather than at the next one from Home Assistant.
      setTimeout(() => {
        this._pressing = false;
        if (this._dirty && !this._dragging) {
          this._dirty = false;
          this._update();
        }
      }, 0);
    };
    // A slider released without a new value fires no change: the card would stay frozen. The flag is dropped once
    // the release is over (after the change event, which comes in the same task), and the pending render done.
    this._onRelease = () => {
      window.removeEventListener("pointerup", this._onRelease, true);
      window.removeEventListener("pointercancel", this._onRelease, true);
      setTimeout(() => {
        if (!this._dragging) return;
        this._dragging = false;
        if (this._dirty) {
          this._dirty = false;
          this._update();
        }
      }, 0);
    };
    this._onKey = (ev) => {
      if (ev.key !== "Escape" || !this._confirm) return;
      ev.stopPropagation();
      this._closeConfirm();
    };
  }

  // Home Assistant pushes a new hass on every state change of the instance: the card is only rebuilt when something
  // it shows changed.
  set hass(hass) {
    this._hass = hass;
    const deps = this._deps();
    if (deps && sameDeps(deps, this._lastDeps)) return;
    this._lastDeps = deps;
    this._update();
  }

  get hass() {
    return this._hass;
  }

  // Set by Home Assistant on the cards of a dashboard being edited and in the card editor's preview: a card hidden
  // by `hide_when_idle` stays visible there, so that it can still be found and edited.
  set preview(value) {
    this._preview = !!value;
    this._update();
  }

  get preview() {
    return !!this._preview;
  }

  set editMode(value) {
    this._editMode = !!value;
    this._update();
  }

  get editMode() {
    return !!this._editMode;
  }

  // `hide_when_idle`: none of the card's players plays nor is paused (the main player, the one shown, or every player
  // of `players`). Never while the dashboard is edited.
  _idleHidden() {
    const c = this._config;
    if (c.hide_when_idle !== true || this._preview || this._editMode) return false;
    const ids = isStacked(c) ? listedPlayers(c) : [findPlayer(this._hass, c).id, this._active];
    return !ids.some((id) => isActive(this._s(id)));
  }

  // Shows or hides the card itself: the `hidden` attribute, and the event Home Assistant listens to so that the
  // dashboard grid gives the space back (sections view) and takes it again. Leaving the screen this way drops the
  // unfolded sections and the popup, as when the card leaves the page.
  _setIdleHidden(hide) {
    if (hide === !!this._idleHide) return;
    this._idleHide = hide;
    this.toggleAttribute?.("hidden", hide);
    if (hide) {
      this._toggled = new Map();
      this._confirm = null;
      this._showHidden = false;
      window.removeEventListener("keydown", this._onKey);
      this._html = "";
    }
    this.dispatchEvent(new CustomEvent("card-visibility-changed", { detail: { value: !hide }, bubbles: true, composed: true }));
  }

  _deps() {
    const h = this._hass;
    if (!h || !this._config) return null;
    const { id } = findPlayer(h, this._config, this._active);
    if (!id) return null;
    const ids = [id, ...roomIds(h, this._config, id), ...groupOf(h.states[id]), favoritesSensor(h, this._config, id), ...listedPlayers(this._config)];
    // Alexa: the switch and sensors of each Echo shown.
    // Apple TV and Philips TV: the remote entity; Philips TV: Ambilight, its switches and recording sensors.
    const extras = ids.flatMap((i) => (i ? [...Object.values(alexaExtras(h, i) || {}), ...Object.values(philipsExtras(h, i) || {}), remoteOf(h, i)] : []));
    return [h.entities, h.devices, h.language, h.locale, h.themes?.darkMode, this._active, ...[...ids, ...extras].map((i) => h.states[i])];
  }

  connectedCallback() {
    // A click elsewhere on the page folds the sections back to their defaults and closes the popup.
    this._outside ??= watchOutside(this, () => {
      if (!this._toggled?.size && !this._confirm && !this._showHidden) return;
      this._toggled = new Map();
      this._showHidden = false;
      if (this._confirm) this._closeConfirm();
      else this._update();
    });
    this._outside.on();
    // Back on the page after leaving it: rendered again in its default state.
    if (this._hass && this._config) this._update();
    if (this._confirm) window.addEventListener("keydown", this._onKey);
    // The position moves on its own while playing: only the progress bar and its time are updated every second.
    clearInterval(this._ticker);
    this._ticker = setInterval(() => this._tick(), 1000);
    if (!this._fitObserver && typeof ResizeObserver === "function")
      this._fitObserver = new ResizeObserver(() => {
        this._fitPill();
        this._fitMarquee();
      });
    document.fonts?.ready?.then(() => {
      this._fitPill();
      this._fitMarquee();
    });
    this._fitObserver?.observe(this);
  }

  disconnectedCallback() {
    clearInterval(this._ticker);
    this._ticker = null;
    this._fitObserver?.disconnect();
    this._outside?.off();
    window.removeEventListener("keydown", this._onKey);
    // Left (another dashboard view, a conditional card hidden): back to the defaults, so that the card does not come
    // back unfolded or with its popup open.
    this._toggled = new Map();
    this._confirm = null;
    this._showHidden = false;
    this._pressing = false;
    window.removeEventListener("pointerup", this._onPressEnd, true);
    window.removeEventListener("pointercancel", this._onPressEnd, true);
    window.removeEventListener("pointerup", this._onRelease, true);
    window.removeEventListener("pointercancel", this._onRelease, true);
    clearTimeout(this._pendingTimer);
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    if (config.entity && !String(config.entity).startsWith("media_player.")) throw new Error("entity must be a media_player");
    if (listedPlayers(config).some((id) => !String(id).startsWith("media_player."))) throw new Error("players must be media_player entities");
    this._config = { ...config };
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
    // Long track texts (title_overflow): ellipsis (default), wrap on title_lines lines (0: every line) or scroll.
    const overflow = OVERFLOWS.includes(config.title_overflow) ? config.title_overflow : "ellipsis";
    this._overflow = overflow;
    this._mq = new Map();
    if (overflow === "ellipsis") this.removeAttribute?.("title-overflow");
    else this.setAttribute?.("title-overflow", overflow);
    const lines = Number(config.title_lines ?? 2);
    this.style?.setProperty?.("--mc-lines", Number.isInteger(lines) && lines > 0 ? String(lines) : "none");
    this._active = null;
    this._showHidden = false;
    this._html = "";
    this._lastDeps = null;
    this._update();
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  _s(id) {
    return id ? memberState(this._hass.states, id) : undefined;
  }

  // Service call whose failure Home Assistant already reports (toast): handled here so that it does not end up as
  // "Uncaught (in promise)". `onError` undoes what the card showed meanwhile.
  _call(service, data, onError, domain = "media_player") {
    return Promise.resolve(this._hass.callService(domain, service, data)).catch(() => onError?.());
  }

  _update() {
    if (!this._hass || !this._config) return;
    // No rewrite under a slider being dragged: it would drop it from under the pointer. Done once released.
    if (this._dragging || this._pressing) {
      this._dirty = true;
      return;
    }
    this._setIdleHidden(this._idleHidden());
    if (this._idleHide) {
      this.shadowRoot.innerHTML = "";
      return;
    }
    let html = this._render();
    if (this._confirm) {
      html = html.replace(/<ha-card>([\s\S]*)<\/ha-card>\s*$/, (_, inner) => `<ha-card class="dialog-open${this._confirm.remote ? " remote-open" : ""}">${inner}${this._confirmHtml()}</ha-card>`);
    }
    // The position is not in the HTML (it changes on every update of media_position): painted after the render.
    if (html === this._html) return this._afterRender();
    const focused = this._confirm && this.shadowRoot.activeElement?.dataset?.action;
    const focusedKey = this._confirm && this.shadowRoot.activeElement?.dataset?.value;
    const kept = this._confirm || this._byPointer ? null : this._focusedSpot();
    this._html = html;
    morph(this.shadowRoot, html);
    this._fitPill();
    this._fitMarquee();
    this._afterRender(true);
    if (kept) this._focusables(kept.key)[kept.index]?.focus({ preventScroll: true });
    if (this._confirm) {
      // A remote key keeps the focus across the re-render, so that the keyboard can go on pressing it.
      const sel =
        focused === "remote" && focusedKey
          ? `.modal [data-action="remote"][data-value="${focusedKey}"]`
          : focused === "confirm_cancel"
            ? '[data-action="confirm_cancel"]'
            : ".modal .primary";
      if (focused) (this.shadowRoot.querySelector(sel) || this.shadowRoot.querySelector(".modal button"))?.focus({ preventScroll: true });
    }
  }

  _focusedSpot() {
    const el = this.shadowRoot.activeElement;
    if (!el?.dataset) return null;
    const key = focusKey(el);
    if (!key) return null;
    const index = this._focusables(key).indexOf(el);
    return index < 0 ? null : { key, index };
  }

  _focusables(key) {
    return [...this.shadowRoot.querySelectorAll(FOCUS_SELECTOR)].filter((n) => focusKey(n) === key);
  }

  _tick() {
    if (!this._hass || this._dragging) return;
    if (!(this._shownIds || [this._id]).some((id) => this._s(id)?.state === "playing")) return;
    this._paintProgress();
  }

  // After a render: the progress, and the record's turn (`fresh`: the DOM was rewritten).
  _afterRender(fresh = false) {
    this._paintProgress();
    if (!fresh) return;
    const vinyl = this.shadowRoot.querySelector(".vinyl.playing");
    const s = this._s(this._id);
    // A record kept by the patch goes on turning as it was.
    if (vinyl && vinyl === this._vinyl) return;
    this._vinyl = vinyl;
    if (!vinyl) {
      if (!isActive(s)) this._slid = null;
      return;
    }
    const track = `${this._id}|${s?.attributes?.media_content_id ?? ""}|${s?.attributes?.media_title ?? ""}`;
    if (this._slid !== track) {
      this._slid = track;
      vinyl.classList.add("slide");
    } else vinyl.style.setProperty("--mc-spin-delay", `${-((Date.now() % 3000) / 1000).toFixed(2)}s`);
  }

  // Progress bars, elapsed times and slider values, from media_position and its timestamp: of the shown player, or
  // of the player each element names (stacked players).
  _paintProgress() {
    const at = (el, key) => {
      const s = this._s(el.dataset[key] || this._id);
      const d = duration(s);
      return d ? { d, p: position(s) ?? 0 } : null;
    };
    for (const el of this.shadowRoot.querySelectorAll("[data-progress]")) {
      const v = at(el, "progress");
      const w = v && `${((v.p / v.d) * 100).toFixed(2)}%`;
      if (w && el.style.width !== w) el.style.width = w;
    }
    // Written only when it changed: the 1 s ticker leaves the DOM alone while the time shown stays the same.
    for (const el of this.shadowRoot.querySelectorAll("[data-elapsed]")) {
      const v = at(el, "elapsed");
      if (v && el.textContent !== fmtTime(v.p)) el.textContent = fmtTime(v.p);
    }
    for (const el of this.shadowRoot.querySelectorAll('[role="slider"][data-action="seek"]')) {
      const v = at(el, "target");
      if (!v) continue;
      if (el.getAttribute("aria-valuenow") !== String(Math.round(v.p))) el.setAttribute("aria-valuenow", String(Math.round(v.p)));
      if (el.getAttribute("aria-valuetext") !== `${fmtTime(v.p)} / ${fmtTime(v.d)}`) el.setAttribute("aria-valuetext", `${fmtTime(v.p)} / ${fmtTime(v.d)}`);
    }
  }

  _onInput(ev) {
    const el = ev.target;
    if (el?.type !== "range") return;
    el.style.setProperty("--p", `${el.value}%`);
    const pct = el.parentNode?.querySelector?.(".pct");
    if (pct) pct.textContent = `${el.value} %`;
  }

  _onChange(ev) {
    const el = ev.target;
    if (el?.type !== "range") return;
    this._dragging = false;
    const id = el.dataset.target;
    if (!offline(this._s(id))) this._call("volume_set", { entity_id: id, volume_level: Math.max(0, Math.min(100, Number(el.value))) / 100 });
    if (this._dirty) {
      this._dirty = false;
      this._update();
    }
  }

  _onKeyDown(ev) {
    const el = ev.target;
    // The progress bar is a slider: the arrows move 10 s back or forward, Home and End to the ends.
    if (el?.getAttribute?.("role") === "slider" && el.dataset?.action === "seek") {
      const s = this._s(el.dataset.target);
      // Repeated presses go on from the last requested position until the player reports its new one.
      const last = this._kbSeek;
      const p = last && last.id === el.dataset.target && last.at === s?.attributes?.media_position_updated_at ? last.to : (position(s) ?? 0);
      const d = duration(s) ?? 0;
      const to = { ArrowRight: p + 10, ArrowUp: p + 10, ArrowLeft: p - 10, ArrowDown: p - 10, Home: 0, End: d }[ev.key];
      if (to === undefined) return;
      ev.preventDefault();
      if (offline(s)) return;
      const pos = Math.max(0, Math.min(d, to));
      this._kbSeek = { id: el.dataset.target, at: s?.attributes?.media_position_updated_at, to: pos };
      this._call("media_seek", { entity_id: el.dataset.target, seek_position: pos });
      return;
    }
    // Enter / Space on an element with the button role acts as a click, as on a <button>.
    if ((ev.key !== "Enter" && ev.key !== " ") || el?.getAttribute?.("role") !== "button") return;
    ev.preventDefault();
    el.click();
  }

  // Requested group membership, shown until the player reports it (or PENDING_MS has passed).
  _setPending(id, member) {
    this._pending = { ...this._pending, [id]: { member, until: Date.now() + PENDING_MS } };
    clearTimeout(this._pendingTimer);
    this._pendingTimer = setTimeout(() => this._update(), PENDING_MS + 100);
    this._update();
  }

  _isMember(mainId, id) {
    const real = groupOf(this._s(mainId)).includes(id);
    const p = this._pending?.[id];
    if (p && (Date.now() > p.until || real === p.member)) delete this._pending[id];
    else if (p) return p.member;
    return real;
  }

  _onClick(ev) {
    this._pressing = false;
    if (ev.detail === 0) this._byPointer = false;
    const path = ev.composedPath();
    const el = path.find((n) => n.dataset && (n.dataset.entity || n.dataset.action));
    if (!this._confirm && Date.now() - (this._confirmClosedAt ?? 0) < CONFIRM_GUARD_MS) {
      ev.stopPropagation();
      return;
    }
    if (this._confirm) {
      ev.stopPropagation();
      const action = el?.dataset.action;
      if (action === "confirm_ok") {
        const run = this._confirm.run;
        this._closeConfirm();
        run();
      } else if (action === "confirm_cancel" || (action === "confirm_backdrop" && path[0] === el)) this._closeConfirm();
      else if (action === "remote" && this._confirm.remote && !el.disabled)
        this._call("send_command", { entity_id: el.dataset.target, command: remoteCommand(this._hass, el.dataset.target, el.dataset.value) }, null, "remote");
      return;
    }
    if (!el) return;
    ev.stopPropagation();
    const { action, entity } = el.dataset;
    const id = el.dataset.target || this._id;
    const s = this._s(id);
    if (PLAYER_ACTIONS.has(action) && offline(s)) return;
    const a = s?.attributes || {};
    switch (action) {
      case "zoom":
        return this._toggleZoom(ev);
      case "open_remote":
        return this._openConfirm({ remote: el.dataset.target }, { focus: ev?.detail === 0 });
      case "toggle_section": {
        const key = el.dataset.section;
        this._toggled = new Map(this._toggled).set(key, !this._isCollapsed(key));
        return this._update();
      }
      case "show_player":
        // Stacked players: the clicked one opens in the full view, with a back button to the stack.
        this._active = isStacked(this._config) || id !== this._config.entity ? id : null;
        this._lastDeps = null;
        return this._update();
      case "back":
        this._active = null;
        this._lastDeps = null;
        return this._update();
      case "toggle_hidden":
        this._showHidden = !this._showHidden;
        return this._update();
      case "expand_player": {
        // Folded back, like the sections, by a click elsewhere on the page.
        const key = `player:${id}`;
        this._toggled = new Map(this._toggled).set(key, !this._toggled?.get(key));
        return this._update();
      }
      case "remote":
        // Apple TV and Philips TV: the target is the device's remote entity, the value the key of the card, sent
        // as the integration names it.
        return this._call("send_command", { entity_id: id, command: remoteCommand(this._hass, id, el.dataset.value) }, null, "remote");
      case "toggle_extra":
        // Philips TV: the target is its Ambilight light or one of its switches.
        return this._call("toggle", { entity_id: id }, null, id.slice(0, id.indexOf(".")));
      case "dnd":
        // Alexa: the target is the Echo's do-not-disturb switch.
        return this._call("toggle", { entity_id: id }, null, "switch");
      case "play":
      case "pause":
      case "stop":
        return this._call(`media_${action}`, { entity_id: id });
      case "next":
      case "queue_next":
        return this._call("media_next_track", { entity_id: id });
      case "previous":
        return this._call("media_previous_track", { entity_id: id });
      case "shuffle":
        return this._call("shuffle_set", { entity_id: id, shuffle: !a.shuffle });
      case "repeat":
        return this._call("repeat_set", { entity_id: id, repeat: REPEAT_NEXT[a.repeat] || "all" });
      case "mute":
        return this._call("volume_mute", { entity_id: id, is_volume_muted: !a.is_volume_muted });
      case "vol_down":
        return this._call("volume_down", { entity_id: id });
      case "vol_up":
        return this._call("volume_up", { entity_id: id });
      case "power":
        return this._call(isOff(s) ? "turn_on" : "turn_off", { entity_id: id });
      case "seek": {
        const d = duration(s);
        const box = el.getBoundingClientRect?.();
        if (!d || !box?.width || typeof ev.clientX !== "number") return;
        const frac = Math.max(0, Math.min(1, (ev.clientX - box.left) / box.width));
        return this._call("media_seek", { entity_id: id, seek_position: Math.round(frac * d) });
      }
      case "source":
        return this._call("select_source", { entity_id: id, source: el.dataset.value });
      case "sound_mode":
        return this._call("select_sound_mode", { entity_id: id, sound_mode: el.dataset.value });
      case "favorite": {
        const f = favoritesOf(this._hass, this._config, this._id)[Number(el.dataset.index)];
        if (!f) return;
        return this._call("play_media", { entity_id: this._id, media_content_id: f.media_content_id, media_content_type: f.media_content_type });
      }
      case "join":
      case "leave": {
        const join = action === "join";
        // Joined to the leader of the group the shown player is in (the first of its group_members).
        const leader = groupOf(this._s(this._id))[0] || this._id;
        this._setPending(id, join);
        const undo = () => {
          if (this._pending) delete this._pending[id];
          this._update();
        };
        return join ? this._call("join", { entity_id: leader, group_members: [id] }, undo) : this._call("unjoin", { entity_id: id }, undo);
      }
      case "ungroup_all": {
        const members = groupOf(this._s(this._id));
        const leader = members[0];
        return this._openConfirm({
          text: this._t("confirm_ungroup", { name: nameOf(this._hass, leader || this._id) }),
          ok: this._t("ungroup_all"),
          run: () => {
            for (const m of members.slice(1)) {
              this._setPending(m, false);
              this._call("unjoin", { entity_id: m });
            }
          },
        });
      }
      default:
        if (entity) this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: entity }, bubbles: true, composed: true }));
    }
  }

  _openConfirm(confirm, { focus = true } = {}) {
    this._confirm = confirm;
    window.addEventListener("keydown", this._onKey);
    this._update();
    if (focus) (this.shadowRoot.querySelector(".modal .primary") || this.shadowRoot.querySelector(".modal button"))?.focus();
  }

  _closeConfirm() {
    this._confirm = null;
    this._confirmClosedAt = Date.now();
    window.removeEventListener("keydown", this._onKey);
    this._update();
  }

  _confirmHtml() {
    const c = this._confirm;
    if (c.remote) return this._remotePopupHtml(c.remote);
    return `<style>${DIALOG_STYLE}</style><div class="dialog-backdrop" data-action="confirm_backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="mc-confirm-msg">
        <div class="msg" id="mc-confirm-msg">${esc(c.text)}</div>
        <div class="modal-actions">
          <button class="btn" data-action="confirm_cancel"><span>${esc(this._t("cancel"))}</span></button>
          <button class="btn primary" data-action="confirm_ok"><span>${esc(c.ok)}</span></button>
        </div>
      </div>
    </div>`;
  }

  // Remote popup of the mini card: the same keys as the remote section, in a dialog at the top of the card that
  // stays open while the keys are pressed (closed by its cross, Escape or a click elsewhere).
  _remotePopupHtml(rid) {
    const disabled = offline(this._s(rid));
    const key = (cmd, icon) => this._btn("remote", ICONS[icon], this._t(`r_${cmd}`), { target: rid, value: cmd, disabled });
    const title = esc(this._t("remote"));
    return `<style>${DIALOG_STYLE}${REMOTE_STYLE}${REMOTE_POPUP_STYLE}</style><div class="dialog-backdrop" data-action="confirm_backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="mc-remote-title">
        <div class="remote-head">${svgIcon(ICONS.remote)}<span id="mc-remote-title">${title}</span>${this._btn("confirm_cancel", ICONS.close, this._t("close_remote"))}</div>
        <div class="remote">
          <div class="dpad"><i></i>${key("up", "chevron_up")}<i></i>${key("left", "chevron_left")}${key("select", "select")}${key("right", "chevron_right")}<i></i>${key("down", "chevron_down")}<i></i></div>
          <div class="remote-keys">${key("menu", "back")}${key("home", "home")}${key("play_pause", "play_pause")}</div>
        </div>
      </div>
    </div>`;
  }

  // The player shown (remembered for the actions and the progress ticker) and its state, or the error to show.
  _player() {
    const { id, error } = findPlayer(this._hass, this._config, this._active);
    this._shownIds = null;
    if (error) return { error };
    this._id = id;
    return { id, s: this._s(id) };
  }

  _toggleZoom() {}

  _zoomButton() {
    return "";
  }

  _errorCard(key) {
    const text = key === "unknown_entity" ? `${this._t(key)}: ${this._config.entity}` : this._t(key);
    return `<style>${BASE_STYLE}</style><ha-card><div class="warning">${esc(text)}</div></ha-card>`;
  }

  // Translated state: the card's own words first (they follow the language option), then Home Assistant's.
  _stateText(s) {
    const own = STRINGS[lang(this._hass, this._config)][`st_${s?.state}`];
    if (own) return own;
    if (s && this._hass.formatEntityState) {
      try {
        return this._hass.formatEntityState(s);
      } catch (_e) {
        /* older Home Assistant */
      }
    }
    return String(s?.state ?? "");
  }

  _subtitle(id, s) {
    const members = groupOf(s).filter((m) => m !== id && this._s(m));
    if (members.length) return this._t("grouped", { names: members.map((m) => nameOf(this._hass, m)).join(", ") });
    const a = s?.attributes || {};
    // Jellyfin: the client app of the session (its device's model); Alexa: a speaker group says so.
    if (isJellyfin(this._hass, id)) return [deviceOf(this._hass, id)?.model, PLATFORMS.jellyfin].filter(Boolean).join(" · ");
    if (isAlexaGroup(this._hass, id)) return this._t("speaker_group");
    // Apple TV integration: the app playing, else the device's model (an Apple TV box, a HomePod).
    if (isAppleTv(this._hass, id)) return a.app_name || a.source || deviceOf(this._hass, id)?.model || PLATFORMS.apple_tv;
    return a.app_name || a.source || PLATFORMS[platformOf(this._hass, id)] || "";
  }

  _header(id, s) {
    const c = this._config;
    const cls = statusClass(s?.state);
    const icon = groupOf(s).length > 1 || isAlexaGroup(this._hass, id) ? ICONS.speakers : ICONS[kindFor(this._hass, id, s)];
    const sub = this._subtitle(id, s);
    const back = isStacked(c) && this._active ? this._iconButton("back", ICONS.back, this._t("back"), "zoom back") : "";
    if (c.illustration !== false) {
      // The state in a pill right after the name, in the icon's colour; the rest of the line under it.
      const name = esc(c.title && !this._active ? c.title : nameOf(this._hass, id));
      const pill = this._pill(this._stateText(s), iconClass(s?.state), id);
      return this._banner(id, s, `${back}${this._bannerIcon(icon, iconClass(s?.state), id, this._stateText(s))}<div class="titles"><div class="trow"><div class="name">${name}</div>${pill}</div>${
        sub ? `<div class="sub" title="${esc(sub)}">${esc(sub)}</div>` : ""
      }</div>`);
    }
    return `
      <div class="header">${back}
        <div class="type-icon ${cls}">${svgIcon(icon)}</div>
        <div class="titles">
          <div class="name">${esc(c.title && !this._active ? c.title : nameOf(this._hass, id))}</div>
          ${sub ? `<div class="sub">${esc(sub)}</div>` : ""}
        </div>
        ${this._stateChip(id, s)}
        ${this._zoomButton()}
      </div>`;
  }

  // The banner: the media room with the player's device in front, the title on its wall (`text`).
  _banner(id, s, text) {
    const st = s?.state;
    const kind = s ? kindFor(this._hass, id, s) : "speaker";
    const family = s ? familyOf(this._hass, id) : "";
    const on = st === "playing" || (st === "on" && kind !== "speaker");
    const draw = DEVICE_PICTURES[family] || PICTURES[kind];
    const screen = st === "playing" || st === "buffering" ? "play" : st === "paused" ? "pause" : st === "on" || st === "idle" ? "lit" : "off";
    const device = sceneDevice(draw(on, FINISH.dark), kind, family, this._uid);
    const night = isNight(this._hass, this._config);
    return `<div class="banner${night ? " night" : ""}">${sceneSvg({ device, tv: !(!family && kind === "tv"), screen })}<div class="htext">${text}</div>${this._zoomButton()}</div>`;
  }

  // The banner's styles, only when it is shown (the mini card leaves more of its width to the title).
  _sceneStyle(mini = false) {
    if (this._config.illustration === false) return "";
    return mini ? `${SCENE_STYLE} .banner { --mc-scene-w: min(200px, 36%); }` : SCENE_STYLE;
  }

  // Round icon of the banner, tinted by the state; a click opens the player's more-info (`id`).
  _bannerIcon(icon, cls, id, label) {
    const open = id ? ` clickable" role="button" tabindex="0" data-entity="${esc(id)}" title="${esc(label)}" aria-label="${esc(label)}` : "";
    return `<div class="type-icon ${cls}${open}">${svgIcon(icon)}</div>`;
  }

  // Artwork (or the drawn picture of the device when there is none), with the playback animation over it.
  _art(id, s, { vinyl = false, front = false } = {}) {
    const art = artOf(this._hass, s);
    const st = s?.state;
    const label = esc(s?.attributes?.media_title || nameOf(this._hass, id));
    if (!art) {
      const kind = kindFor(this._hass, id, s);
      const on = st === "playing" || (st === "on" && kind !== "speaker");
      const f = FINISH[this._hass.themes?.darkMode ? "dark" : "light"];
      const draw = DEVICE_PICTURES[familyOf(this._hass, id)] || PICTURES[kind];
      return `<div class="pic-box clickable" role="button" tabindex="0" aria-label="${label}" data-entity="${esc(id)}">${draw(on, f, front)}</div>`;
    }
    const over = st === "buffering" ? `<div class="spinner"></div>` : st === "playing" || st === "paused" ? `<div class="eq ${st}"><i></i><i></i><i></i><i></i></div>` : "";
    const box = `<div class="art clickable" role="button" tabindex="0" aria-label="${label}" data-entity="${esc(id)}"><img src="${esc(art)}" alt="">${over}</div>`;
    if (!vinyl) return box;
    const disc = isActive(s)
      ? `<div class="vinyl ${st === "playing" ? "playing" : ""}" data-live data-key="${esc(`vinyl|${id}|${st}|${s?.attributes?.media_content_id ?? ""}|${s?.attributes?.media_title ?? ""}`)}"></div>`
      : "";
    return `<div class="art-wrap${disc ? " vinyl-on" : ""}">${disc}${box}</div>`;
  }

  // Date and time of an Alexa alarm, timer or reminder: the time today, with the day otherwise.
  _when(iso) {
    const t = Date.parse(iso);
    if (!Number.isFinite(t)) return "";
    const d = new Date(t);
    const same = d.toDateString() === new Date(Date.now()).toDateString();
    const opts = same ? { hour: "2-digit", minute: "2-digit" } : { weekday: "short", hour: "2-digit", minute: "2-digit" };
    try {
      return new Intl.DateTimeFormat(lang(this._hass, this._config), opts).format(d);
    } catch (_e) {
      return d.toLocaleString();
    }
  }

  // Alexa: "Last called" badge, the next alarm, timer and reminder of the Echo, and its do-not-disturb switch.
  _alexaRow(id, s, compact = false) {
    const x = alexaExtras(this._hass, id);
    if (!x) return "";
    const items = [];
    if (s?.attributes?.last_called === true) items.push(`<span class="tag">${esc(this._t("last_called"))}</span>`);
    for (const key of ["alarm", "timer", "reminder"]) {
      const st = x[key] ? this._s(x[key]) : null;
      const when = st && !offline(st) ? this._when(st.state) : "";
      if (!when) continue;
      const label = this._t(`next_${key}`);
      items.push(
        `<span class="next" title="${esc(`${label} ${when}`)}">${svgIcon(ICONS[key])}${compact ? "" : `<span>${esc(label)}</span>`}<span>${esc(when)}</span></span>`,
      );
    }
    const sw = x.dnd ? this._s(x.dnd) : null;
    const dnd = sw ? this._btn("dnd", ICONS.dnd, this._t("dnd"), { on: sw.state === "on", target: x.dnd, disabled: offline(sw) }) : "";
    if (!items.length && !dnd) return "";
    return `<div class="alexa${compact ? " compact" : ""}"><style>${ALEXA_STYLE}</style><div class="alexa-info">${items.join("")}</div>${dnd}</div>`;
  }

  // Philips TV: "Recording" and "New recording" tags, then Ambilight, Ambilight + Hue and the screen, each a
  // button that toggles its entity (shown only while the TV is on, as the integration only reaches them then).
  _philipsRow(id, s, compact = false) {
    const x = philipsExtras(this._hass, id);
    if (!x) return "";
    const items = [];
    for (const key of ["recording", "new_recording"]) {
      const st = x[key] ? this._s(x[key]) : null;
      if (st?.state === "on") items.push(`<span class="tag${key === "recording" ? " rec" : ""}">${esc(this._t(key))}</span>`);
    }
    const buttons = isOff(s)
      ? []
      : [
          ["ambilight", ICONS.ambilight],
          ["ambilight_hue", ICONS.ambilight_hue],
          ["screen", ICONS.screen_off],
        ]
          .filter(([key]) => x[key])
          .map(([key, icon]) => {
            const st = this._s(x[key]);
            // The screen switch is on while the picture shows: its button lights up when the screen is off.
            const on = key === "screen" ? st.state === "off" : st.state === "on";
            return this._btn("toggle_extra", icon, this._t(key), { on, target: x[key], disabled: offline(st) });
          });
    if (!items.length && !buttons.length) return "";
    return `<div class="philips${compact ? " compact" : ""}"><style>${PHILIPS_STYLE}</style><div class="philips-info">${items.join("")}</div>${buttons.join("")}</div>`;
  }

  // Second line of a Jellyfin or Apple TV item: "Series · S1E3" for an episode, "Movie" for a film; nothing else changes.
  _videoLine(id, s) {
    if (!(isJellyfin(this._hass, id) || isAppleTv(this._hass, id)) || !isActive(s)) return "";
    const a = s.attributes || {};
    const type = String(a.media_content_type || "");
    if (a.media_series_title || type === "tvshow" || type === "episode") {
      const n = (v) => (v === undefined || v === null || v === "" ? "" : String(v));
      const code = `${n(a.media_season) ? `S${n(a.media_season)}` : ""}${n(a.media_episode) ? `E${n(a.media_episode)}` : ""}`;
      return [a.media_series_title, code].filter(Boolean).join(" · ");
    }
    return type === "movie" ? this._t("movie") : "";
  }

  // Second line of a player in a list (rooms, stacked rows): the track and its artist, or the episode line.
  _rowSub(id, s) {
    const a = s?.attributes || {};
    if (!isActive(s) || !a.media_title) return this._stateText(s);
    return [a.media_title, this._videoLine(id, s) || a.media_artist].filter(Boolean).join(" · ");
  }

  // A track text (title, artist, album, a list row's track line): its text in a span that scrolls when
  // title_overflow is scroll and it is wider than its line (measured after the render, _fitMarquee). The measure is
  // kept by text so that a render patching the same line keeps it scrolling as it was.
  _mt(cls, text, attrs = "") {
    if (this._overflow !== "scroll") return `<div class="${cls} mt"${attrs}>${esc(text)}</div>`;
    const m = this._mq?.get(`${cls}|${text}`);
    const run = m ? ` scrolling" style="--mq-shift:${m.shift}px;--mq-dur:${m.dur}s` : "";
    return `<div class="${cls} mt${run}"${attrs}><span class="mq">${esc(text)}</span></div>`;
  }

  // title_overflow: scroll — each track text wider than its line scrolls by what it overflows, at about 30 px a second
  // between two pauses at the ends.
  _fitMarquee() {
    if (this._overflow !== "scroll") return;
    for (const el of this.shadowRoot?.querySelectorAll?.(".mt") || []) {
      const span = el.querySelector?.(".mq");
      if (!span?.getBoundingClientRect) continue;
      const cls = [...el.classList].find((c) => c !== "mt" && c !== "scrolling");
      const key = `${cls}|${span.textContent}`;
      const over = Math.ceil(span.scrollWidth - el.clientWidth);
      const was = this._mq.get(key);
      if (over > 1 && el.clientWidth > 0) {
        const m = { shift: -over, dur: Math.max(4, Math.round((over / 30 / 0.7) * 10) / 10) };
        if (was?.shift === m.shift && el.classList.contains("scrolling")) continue;
        this._mq.set(key, m);
        el.style.setProperty("--mq-shift", `${m.shift}px`);
        el.style.setProperty("--mq-dur", `${m.dur}s`);
        el.classList.add("scrolling");
      } else if (el.clientWidth > 0) {
        this._mq.delete(key);
        el.classList.remove("scrolling");
        el.style.removeProperty("--mq-shift");
        el.style.removeProperty("--mq-dur");
      }
    }
  }

  _meta(s, id = "") {
    const a = s?.attributes || {};
    const title = a.media_title || (s?.state === "on" || s?.state === "idle" ? a.source || a.app_name : "") || this._t("nothing_playing");
    const artist = (id && this._videoLine(id, s)) || a.media_artist || a.media_album_artist || a.media_series_title || a.media_channel || "";
    const extra = [a.media_album_name];
    if (Number(a.queue_size) > 1 && Number.isFinite(Number(a.queue_position))) extra.push(this._t("track_of", { n: a.queue_position, total: a.queue_size }));
    const album = extra.filter(Boolean).join(" · ");
    return `<div class="meta">${this._mt("track", title, ` title="${esc(title)}"`)}${artist ? this._mt("artist", artist) : ""}${album ? this._mt("album", album) : ""}</div>`;
  }

  // `own`: the bar and the time name their player (several players in the card), painted from its own position.
  _progress(id, s, times = true, own = false) {
    const d = duration(s);
    if (!d || !isActive(s)) return "";
    const seek = has(s, F.SEEK) && !offline(s);
    const of = own ? `="${esc(id)}"` : "";
    const bar = `<div class="bar${seek ? " seek clickable" : ""}"${
      seek
        ? ` role="slider" tabindex="0" data-action="seek" data-target="${esc(id)}" aria-label="${esc(this._t("seek"))}" aria-valuemin="0" aria-valuemax="${Math.round(d)}"`
        : ""
    }><div data-progress${of} style="width:0%"></div></div>`;
    return times ? `<div class="progress"><span data-elapsed${of}></span>${bar}<span>${fmtTime(d)}</span></div>` : bar;
  }

  // Small borderless icon button of the header (detail, back).
  _iconButton(action, icon, label, cls = "zoom") {
    return `<button class="${cls}" data-action="${action}" title="${esc(label)}" aria-label="${esc(label)}">${svgIcon(icon)}</button>`;
  }

  _btn(action, icon, label, { on = false, disabled = false, big = false, primary = false, target = "", value = "" } = {}) {
    const cls = ["btn", "round", big && "big", primary && "primary", on && "on", disabled && "disabled"].filter(Boolean).join(" ");
    return `<button class="${cls}" data-action="${action}"${target ? ` data-target="${esc(target)}"` : ""}${value ? ` data-value="${esc(value)}"` : ""} title="${esc(label)}" aria-label="${esc(label)}"${
      on ? ' aria-pressed="true"' : ""
    }${disabled ? " disabled" : ""}>${svgIcon(icon)}</button>`;
  }

  // Play / pause (or stop) button of the player, the one its state calls for.
  _playButton(s, { big = false, target = "" } = {}) {
    const dis = offline(s);
    const playing = isPlaying(s);
    if (playing && has(s, F.PAUSE)) return this._btn("pause", ICONS.pause, this._t("pause"), { big, primary: true, disabled: dis, target });
    if (playing && has(s, F.STOP)) return this._btn("stop", ICONS.stop, this._t("stop"), { big, primary: true, disabled: dis, target });
    if (!playing && has(s, F.PLAY)) return this._btn("play", ICONS.play, this._t("play"), { big, primary: true, disabled: dis, target });
    return "";
  }

  // Transport buttons the player supports: power, shuffle, previous, play / pause, next, repeat (`compact`: the
  // three middle ones only). `target`: the player the buttons act on, when it is not the shown one.
  _controls(s, compact = false, { target = "", big = !compact } = {}) {
    const dis = offline(s);
    const a = s?.attributes || {};
    const out = [];
    const power = isOff(s) ? has(s, F.TURN_ON) : has(s, F.TURN_OFF);
    if (power && (!compact || isOff(s))) out.push(this._btn("power", ICONS.power, this._t("power"), { disabled: dis, on: !isOff(s) && !compact, target }));
    if (isOff(s)) return out.join("");
    if (!compact && has(s, F.SHUFFLE_SET)) out.push(this._btn("shuffle", ICONS.shuffle, this._t("shuffle"), { on: !!a.shuffle, disabled: dis, target }));
    if (has(s, F.PREVIOUS_TRACK)) out.push(this._btn("previous", ICONS.previous, this._t("previous"), { disabled: dis, target }));
    out.push(this._playButton(s, { big, target }));
    if (has(s, F.NEXT_TRACK)) out.push(this._btn("next", ICONS.next, this._t("next"), { disabled: dis, target }));
    if (!compact && has(s, F.REPEAT_SET)) {
      const r = a.repeat || "off";
      out.push(this._btn("repeat", r === "one" ? ICONS.repeat_one : ICONS.repeat, this._t(`repeat_${r === "one" || r === "all" ? r : "off"}`), { on: r !== "off", disabled: dis, target }));
    }
    return out.join("");
  }

  _slider(id, v, dis) {
    return `<input type="range" min="0" max="100" step="1" value="${v}" style="--p:${v}%" data-target="${esc(id)}" aria-label="${esc(`${this._t("volume")} ${nameOf(this._hass, id)}`)}"${dis ? " disabled" : ""}>`;
  }

  // Mute button and volume slider (or - / + buttons for a player that only steps its volume).
  _volume(id, s) {
    if (isOff(s)) return "";
    const dis = offline(s);
    const a = s?.attributes || {};
    const parts = [];
    const muted = !!a.is_volume_muted;
    if (has(s, F.VOLUME_MUTE)) parts.push(this._btn("mute", muted ? ICONS.muted : ICONS.volume, this._t(muted ? "unmute" : "mute"), { on: muted, disabled: dis, target: id }));
    const v = volPct(s);
    if (has(s, F.VOLUME_SET) && v !== null) {
      parts.push(this._slider(id, v, dis), `<span class="pct">${v} %</span>`);
    } else if (has(s, F.VOLUME_STEP)) {
      parts.push(this._btn("vol_down", ICONS.volume_down, this._t("volume_down"), { disabled: dis, target: id }), this._btn("vol_up", ICONS.volume_up, this._t("volume_up"), { disabled: dis, target: id }));
    }
    return parts.length ? `<div class="volume">${parts.join("")}</div>` : "";
  }
}

export class MediaCard extends MediaBase {
  static getConfigElement() {
    return document.createElement("media-card-editor");
  }

  static getStubConfig(hass) {
    const { id } = hass ? findPlayer(hass, {}) : {};
    return id ? { entity: id } : {};
  }

  getCardSize() {
    if (this._idleHide) return 0;
    return isStacked(this._config) && !this._active ? 1 + 3 * listedPlayers(this._config).length : 7;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  _isCollapsed(key) {
    if (this._toggled?.has(key)) return this._toggled.get(key);
    const c = this._config.collapsed ?? DEFAULT_COLLAPSED;
    return (Array.isArray(c) ? c : [c]).includes(key);
  }

  _section(key, icon, label, body) {
    const closed = this._isCollapsed(key);
    return `<div class="section"><div class="section-title toggle" role="button" tabindex="0" data-action="toggle_section" data-section="${key}" aria-expanded="${!closed}">${svgIcon(
      icon,
    )}<span>${esc(label)}</span>${svgIcon(ICONS.chevron_down, "chevron")}</div>${closed ? "" : body()}</div>`;
  }

  _render() {
    if (isStacked(this._config) && !this._active) return this._renderStack();
    const { id, s, error } = this._player();
    if (error) return this._errorCard(error);
    const c = this._config;
    const art = artOf(this._hass, s);
    const parts = [`<div class="hero">${this._art(id, s, { vinyl: true })}${this._meta(s, id)}</div>`];
    if (c.show_progress !== false) parts.push(this._progress(id, s));
    if (c.show_controls !== false) parts.push(`<div class="controls">${this._controls(s)}</div>`);
    parts.push(this._alexaRow(id, s));
    parts.push(this._philipsRow(id, s));

    if (c.show_volume !== false) parts.push(this._volume(id, s));
    if (c.show_remote === true) parts.push(this._remote(id));
    if (c.show_rooms !== false) parts.push(this._rooms(id, s));
    if (c.show_source !== false) parts.push(this._sources(id, s));
    if (c.show_queue !== false) parts.push(this._queueSection(id));
    if (c.show_favorites !== false) parts.push(this._favorites(id, s));
    const bg = art && c.show_background !== false ? `<div class="backdrop-art" style="background-image:url('${cssUrl(art)}')"></div>` : "";
    return `<style>${ANIM_STYLE}${BASE_STYLE}${FULL_STYLE}${this._sceneStyle()}${accentStyle(this._hass, id)}</style>
      <ha-card>${bg}
        ${this._header(id, s)}
        <div class="content">${parts.filter((p) => p && p !== '<div class="controls"></div>').join("")}</div>
      </ha-card>`;
  }

  // Players of the stacked view (`players`, filtered by `only_playing`), remembered for the actions and the ticker.
  _stack() {
    const { shown, hidden } = stackedPlayers(this._hass, this._config);
    this._shownIds = this._showHidden ? [...shown, ...hidden] : shown;
    this._id = shown[0];
    return { ids: this._shownIds, hidden };
  }

  // Header of the stacked view: the card's title, how many players it has, and how many play.
  _stackHeader() {
    const c = this._config;
    const all = listedPlayers(c)
      .map((id) => this._s(id))
      .filter(Boolean);
    const n = all.filter(isPlaying).length;
    const cls = n ? "active" : all.some((s) => s.state === "paused") ? "warn" : all.some((s) => !offline(s) && !isOff(s)) ? "ok" : "idle";
    const text = n ? this._t("n_playing", { n }) : this._t("nothing_playing");
    if (c.illustration !== false) {
      // The device of the first player that plays (else the first one) stands in the room.
      const first = all.find(isPlaying) || all[0];
      const fid = first?.entity_id || listedPlayers(c)[0];
      const sub = this._t("players_count", { n: all.length });
      return this._banner(fid, first, `${this._bannerIcon(ICONS.speakers, cls, "", "")}<div class="titles"><div class="trow"><div class="name">${esc(c.title || this._t("media"))}</div>${this._pill(text, cls)}</div><div class="sub" title="${esc(sub)}">${esc(sub)}</div></div>`);
    }
    return `
      <div class="header">
        <div class="type-icon ${cls}">${svgIcon(ICONS.speakers)}</div>
        <div class="titles">
          <div class="name">${esc(c.title || this._t("media"))}</div>
          <div class="sub">${esc(this._t("players_count", { n: all.length }))}</div>
        </div>
        <span class="chip ${cls}" title="${esc(text)}"><span class="dot"></span><span class="chip-text">${esc(text)}</span></span>
        ${this._zoomButton()}
      </div>`;
  }

  // The players `only_playing` leaves out, in one line at the bottom: a click shows them too, and hides them again.
  _hiddenRow(hidden) {
    if (!hidden.length) return "";
    const label = this._showHidden ? this._t("zoom_out") : this._t("more_players", { n: hidden.length, names: hidden.map((id) => nameOf(this._hass, id)).join(", ") });
    return `<div class="more-players clickable" role="button" tabindex="0" data-action="toggle_hidden" aria-expanded="${!!this._showHidden}">${svgIcon(ICONS.speakers)}<span>${esc(
      label,
    )}</span>${svgIcon(ICONS.chevron_down, "chevron")}</div>`;
  }

  // Status pill of the banner: a dot and the label in the colour class `cls`; a click opens `id`'s more-info.
  _pill(text, cls, id) {
    const open = id ? ` clickable" role="button" tabindex="0" data-entity="${esc(id)}` : "";
    return `<span class="chip bst ${cls}${open}" title="${esc(text)}" aria-label="${esc(text)}"><span class="dot"></span><span class="chip-text">${esc(text)}</span></span>`;
  }

  // The banner's status pill, measured after each render and on a new width (in every language): it sits on the
  // title's row, right after the title, only when the whole title and the pill's whole label fit there; otherwise it
  // takes a line of its own under the subtitle (.below), the title whole on its row (cut only when it does not fit
  // alone) and the subtitle on one line. When the three lines do not fit in the banner above the ground strip, or
  // the label does not fit its line, the pill shows its dot alone (.dot-only): beside the title when the whole title
  // leaves it room, else under the subtitle.
  _fitPill() {
    for (const t of this.shadowRoot?.querySelectorAll?.(".htext .titles") || []) {
      const row = t.querySelector(".trow");
      const chips = row ? [...row.querySelectorAll(":scope > .bst")] : [];
      if (!chips[0]?.getBoundingClientRect) continue;
      t.classList.remove("below", "dot-only");
      const name = row.querySelector(".name");
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      const outer = (c) => c.getBoundingClientRect().width + (parseFloat(getComputedStyle(c).marginLeft) || 0) + (parseFloat(getComputedStyle(c).marginRight) || 0);
      const others = [...row.children].filter((c) => c !== name && !chips.includes(c) && c.getClientRects().length);
      const room = row.getBoundingClientRect().width - others.reduce((w, c) => w + outer(c) + gap, 0);
      const title = name && getComputedStyle(name).display !== "none" ? textWidth(name) + gap : 0;
      const pills = () => chips.reduce((w, c) => w + c.getBoundingClientRect().width, gap * (chips.length - 1));
      if (title + pills() <= room) continue;
      t.classList.add("below");
      const banner = t.closest(".banner") || t;
      const ground = banner.querySelector(".mc-floor");
      const floor = ground ? ground.getBoundingClientRect().top : banner.getBoundingClientRect().bottom;
      const box = t.getBoundingClientRect();
      // Whole: the label not cut and the pill not past the title block (into the picture).
      const whole = chips.every((c) => {
        const tx = c.querySelector(".chip-text");
        return (!tx || tx.scrollWidth <= tx.clientWidth + 0.5) && c.getBoundingClientRect().right <= box.right + 0.5;
      });
      if (whole && box.bottom <= floor + 0.5 && box.top >= banner.getBoundingClientRect().top - 0.5) continue;
      t.classList.add("dot-only");
      if (title + pills() <= room) t.classList.remove("below");
    }
  }

  _stateChip(id, s) {
    const text = this._stateText(s);
    return `<span class="chip clickable ${statusClass(s?.state)}" role="button" tabindex="0" data-entity="${esc(id)}" title="${esc(text)}" aria-label="${esc(
      text,
    )}"><span class="dot"></span><span class="chip-text">${esc(text)}</span></span>`;
  }

  // Several players: a block per player (artwork, track, progress, controls, volume); a click on its name shows
  // it in the full view (rooms, source, queue, favorites), with a back button to the stack.
  _renderStack() {
    const { ids, hidden } = this._stack();
    if (!ids.length) return this._errorCard("no_player");
    const c = this._config;
    const blocks = ids.map((id) => {
      const s = this._s(id);
      const name = nameOf(this._hass, id);
      const parts = [
        `<div class="player-head">${this._art(id, s)}<div class="player-main"><div class="player-name clickable" role="button" tabindex="0" data-action="show_player" data-target="${esc(
          id,
        )}" title="${esc(this._t("show_player", { name }))}"><span>${esc(name)}</span>${svgIcon(ICONS.chevron_right)}</div>${this._meta(s, id)}</div>${this._stateChip(id, s)}</div>`,
      ];
      if (c.show_progress !== false) parts.push(this._progress(id, s, true, true));
      if (c.show_controls !== false) {
        const controls = this._controls(s, false, { target: id, big: false });
        if (controls) parts.push(`<div class="controls">${controls}</div>`);
      }
      parts.push(this._alexaRow(id, s, true));
      parts.push(this._philipsRow(id, s, true));

      if (c.show_volume !== false) parts.push(this._volume(id, s));
      return `<div class="player">${parts.filter(Boolean).join("")}</div>`;
    });
    return `<style>${ANIM_STYLE}${BASE_STYLE}${FULL_STYLE}${STACK_STYLE}${this._sceneStyle()}</style>
      <ha-card>
        ${this._stackHeader()}
        <div class="content"><div class="players">${blocks.join("")}</div>${this._hiddenRow(hidden)}</div>
      </ha-card>`;
  }

  // Rooms: every speaker of the card, with its volume, and a link button that joins it to the shown player's
  // group or takes it out (players that can group); a click on a room's name shows that player in the card.
  _rooms(mainId, main) {
    const ids = roomIds(this._hass, this._config, mainId);
    if (!ids.length) return "";
    const canGroup = has(main, F.GROUPING) && !offline(main);
    const members = groupOf(main);
    return this._section("rooms", ICONS.speakers, this._t("rooms"), () => {
      const rows = ids.map((rid) => {
        const s = this._s(rid);
        const isMain = rid === mainId;
        const member = isMain || this._isMember(mainId, rid);
        const name = nameOf(this._hass, rid);
        const sub = this._rowSub(rid, s);
        const ring = member && members.length > 1 && main?.state === "playing" && s?.state === "playing" ? " ring" : "";
        const link =
          !isMain && canGroup && has(s, F.GROUPING)
            ? this._btn(member ? "leave" : "join", ICONS.link, this._t(member ? "leave" : "join", { name }), { on: member, target: rid, disabled: offline(s) })
            : "";
        return `<div class="room${isMain ? " current" : ""}">
          <div class="room-icon ${statusClass(s?.state)}${ring}">${svgIcon(ICONS[kindFor(this._hass, rid, s)])}</div>
          <div class="room-main">
            <div class="room-name clickable" role="button" tabindex="0" data-action="show_player" data-target="${esc(rid)}" title="${esc(this._t("show_player", { name }))}">${esc(name)}</div>
            ${this._mt("room-sub", sub)}
            ${this._volume(rid, s)}
          </div>
          ${link}
        </div>`;
      });
      const ungroup =
        canGroup && members.length > 1
          ? `<div class="group-actions"><button class="btn" data-action="ungroup_all">${svgIcon(ICONS.close)}<span>${esc(this._t("ungroup_all"))}</span></button></div>`
          : "";
      return `<div class="rooms">${rows.join("")}${ungroup}</div>`;
    });
  }

  _options(action, list, current, id, dis) {
    return `<div class="options">${list
      .map(
        (v) =>
          `<button class="btn${v === current ? " on" : ""}" data-action="${action}" data-target="${esc(id)}" data-value="${esc(v)}"${v === current ? ' aria-pressed="true"' : ""}${
            dis ? " disabled" : ""
          }><span>${esc(v)}</span></button>`,
      )
      .join("")}</div>`;
  }

  _sources(id, s) {
    const a = s?.attributes || {};
    const sources = has(s, F.SELECT_SOURCE) && Array.isArray(a.source_list) ? a.source_list : [];
    const modes = has(s, F.SELECT_SOUND_MODE) && Array.isArray(a.sound_mode_list) ? a.sound_mode_list : [];
    if ((!sources.length && !modes.length) || isOff(s)) return "";
    const dis = offline(s);
    const label = sources.length ? this._t("source") : this._t("sound_mode");
    return this._section("source", sources.length ? ICONS.source : ICONS.sound_mode, label, () => {
      let html = sources.length ? this._options("source", sources, a.source, id, dis) : "";
      if (modes.length) {
        if (sources.length) html += `<div class="section-sub">${svgIcon(ICONS.sound_mode)}<span>${esc(this._t("sound_mode"))}</span></div>`;
        html += this._options("sound_mode", modes, a.sound_mode, id, dis);
      }
      return html;
    });
  }

  // Music Assistant queue (music_assistant.get_queue): the current and the next item, and the queue length.
  // Fetched when the section is open, again when the track changes.
  _queueSection(id) {
    if (!isMusicAssistant(this._hass, id)) return "";
    return this._section("queue", ICONS.queue, this._t("queue"), () => {
      const s = this._s(id);
      const key = `${id}|${s?.attributes?.media_content_id ?? ""}|${s?.attributes?.media_title ?? ""}`;
      if (this._queue?.key !== key) this._fetchQueue(id, key);
      const q = this._queue;
      if (q.state === "loading" && !q.data) return `<div class="q-msg">${esc(this._t("queue_loading"))}</div>`;
      if (q.state === "error") return `<div class="q-msg">${esc(this._t("queue_error"))}</div>`;
      const d = q.data || {};
      const items = [
        [d.current_item, "now_playing", ""],
        [d.next_item, "up_next", "queue_next"],
      ].filter(([it]) => it);
      if (!items.length) return `<div class="q-msg">${esc(this._t("queue_empty"))}</div>`;
      const rows = items.map(([it, label, action]) => {
        const m = it.media_item || {};
        const img = typeof m.image === "string" ? m.image : m.image?.path || (typeof it.image === "string" ? it.image : it.image?.path) || "";
        const artists = (Array.isArray(m.artists) ? m.artists : []).map((x) => x?.name).filter(Boolean).join(", ");
        // A radio station: its stream title (the song on air) stands in for the artist.
        const sub = [artists || it.stream_title, m.album?.name].filter(Boolean).join(" · ");
        const attrs = action ? ` clickable" role="button" tabindex="0" data-action="${action}" data-target="${esc(id)}` : "";
        return `<div class="q-item${attrs}"><div class="art">${img ? `<img src="${esc(img)}" alt="">` : svgIcon(ICONS.music)}</div><div class="meta"><div class="q-label">${esc(
          this._t(label),
        )}</div><div class="q-name">${esc(m.name || it.name || "")}</div>${sub ? `<div class="q-sub">${esc(sub)}</div>` : ""}</div></div>`;
      });
      const count = Number(d.items) > 0 ? `<div class="q-msg">${esc(this._t("queue_count", { n: d.items }))}</div>` : "";
      return `<div class="queue">${rows.join("")}${count}</div>`;
    });
  }

  _fetchQueue(id, key) {
    const prev = this._queue?.data;
    this._queue = { key, state: "loading", data: prev && this._queue?.key?.startsWith(`${id}|`) ? prev : null };
    if (typeof this._hass.callWS !== "function") {
      this._queue.state = "error";
      return;
    }
    Promise.resolve()
      .then(() =>
        this._hass.callWS({ type: "call_service", domain: "music_assistant", service: "get_queue", service_data: { entity_id: id }, return_response: true }),
      )
      .then(
        (r) => {
          if (this._queue?.key !== key) return;
          const resp = r?.response || {};
          this._queue = { key, state: "ok", data: resp[id] || Object.values(resp)[0] || null };
          this._html = "";
          this._update();
        },
        () => {
          if (this._queue?.key !== key) return;
          this._queue = { key, state: "error", data: null };
          this._html = "";
          this._update();
        },
      );
  }

  // Apple TV and Philips TV remote (`show_remote`): a direction pad with select, then menu, home and play / pause, sent to the
  // device's remote entity (remote.send_command).
  _remote(id) {
    const rid = remoteOf(this._hass, id);
    if (!rid) return "";
    const disabled = offline(this._s(rid));
    const key = (cmd, icon) => this._btn("remote", ICONS[icon], this._t(`r_${cmd}`), { target: rid, value: cmd, disabled });
    return this._section(
      "remote",
      ICONS.remote,
      this._t("remote"),
      () => `<style>${REMOTE_STYLE}</style><div class="remote">
        <div class="dpad"><i></i>${key("up", "chevron_up")}<i></i>${key("left", "chevron_left")}${key("select", "select")}${key("right", "chevron_right")}<i></i>${key("down", "chevron_down")}<i></i></div>
        <div class="remote-keys">${key("menu", "back")}${key("home", "home")}${key("play_pause", "play_pause")}</div>
      </div>`,
    );
  }

  _favorites(id, s) {
    const favs = favoritesOf(this._hass, this._config, id);
    if (!favs.length || !has(s, F.PLAY_MEDIA)) return "";
    const dis = offline(s);
    return this._section("favorites", ICONS.star, this._t("favorites"), () => {
      const tiles = favs.map(
        (f, i) =>
          `<button class="btn fav" data-action="favorite" data-index="${i}" title="${esc(this._t("play_favorite", { name: f.name }))}"${dis ? " disabled" : ""}><span class="art">${
            f.image ? `<img src="${esc(f.image)}" alt="">` : f.icon ? `<ha-icon class="icon" icon="${esc(f.icon)}"></ha-icon>` : svgIcon(ICONS.star)
          }</span><span>${esc(f.name)}</span></button>`,
      );
      return `<div class="favs">${tiles.join("")}</div>`;
    });
  }
}

// The mini card is a full card drawn compact: its detail button (top right, `zoom: false` removes it) switches it
// to the full card's content and back, and a click anywhere else on the page brings the compact view back.
export class MediaMiniCard extends MediaCard {
  constructor() {
    super();
    this._unzoom = watchOutside(this, () => {
      if (this._zoomed) this._setZoom(false);
    });
  }

  static getConfigElement() {
    return document.createElement("media-mini-card-editor");
  }

  connectedCallback() {
    super.connectedCallback();
    this._unzoom.on();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unzoom.off();
    // Back to the compact view once off the screen (see the full card).
    if (this._zoomed) {
      this._zoomed = false;
      if (isStacked(this._config)) this._active = null;
    }
  }

  getCardSize() {
    if (this._zoomed) return super.getCardSize();
    return isStacked(this._config) ? 1 + listedPlayers(this._config).length : 3;
  }

  getGridOptions() {
    return { ...(this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 }), rows: "auto" };
  }

  _zoomButton() {
    if (this._config.zoom === false) return "";
    const label = esc(this._t(this._zoomed ? "zoom_out" : "zoom_in"));
    return `<button class="zoom" data-action="zoom" title="${label}" aria-label="${label}">${svgIcon(this._zoomed ? ICONS.collapse : ICONS.expand)}</button>`;
  }

  _setZoom(on) {
    this._zoomed = on;
    // Back to the compact list: a player opened from the stack closes too, and the hidden players hide again.
    if (!on && isStacked(this._config)) {
      this._active = null;
      this._showHidden = false;
    }
    this._update();
    this.dispatchEvent(new CustomEvent("iron-resize", { bubbles: true, composed: true }));
  }

  _toggleZoom(ev) {
    this._setZoom(!this._zoomed);
    if (ev?.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus({ preventScroll: true });
  }

  _render() {
    if (this._zoomed) return super._render();
    if (isStacked(this._config)) return this._renderList();
    const { id, s, error } = this._player();
    if (error) return this._errorCard(error);
    const c = this._config;
    // Apple TV and Philips TV (`show_remote`): a remote button before the controls opens the remote in a popup.
    const rid = c.show_remote === true ? remoteOf(this._hass, id) : null;
    const remote = rid ? this._btn("open_remote", ICONS.remote, this._t("remote"), { target: rid, disabled: offline(this._s(rid)) }) : "";
    const controls = (remote || "") + (c.show_controls !== false ? this._controls(s, true) : "");
    return `<style>${ANIM_STYLE}${BASE_STYLE}${MINI_STYLE}${this._sceneStyle(true)}${accentStyle(this._hass, id)}</style>
      <ha-card>
        ${this._header(id, s)}
        <div class="content">
          <div class="row">${this._art(id, s, { front: true })}${this._meta(s, id)}${controls ? `<div class="controls">${controls}</div>` : ""}</div>
          ${c.show_progress !== false ? this._progress(id, s, false) : ""}${this._alexaRow(id, s, true)}${this._philipsRow(id, s, true)}
          ${c.show_volume !== false ? this._volume(id, s) : ""}
        </div>
      </ha-card>`;
  }

  // Several players: one row per player (artwork, name, track, play / pause, volume); a click on a row unfolds it
  // (progress, controls, volume with its percentage), the detail button switches to the stacked full view.
  _renderList() {
    const { ids, hidden } = this._stack();
    if (!ids.length) return this._errorCard("no_player");
    const c = this._config;
    const rows = ids.map((id) => {
      const s = this._s(id);
      const open = !!this._toggled?.get(`player:${id}`);
      const sub = this._rowSub(id, s);
      const play = !open && c.show_controls !== false && !isOff(s) ? this._playButton(s, { target: id }) : "";
      const v = volPct(s);
      const vol =
        !open && c.show_volume !== false && !isOff(s) && has(s, F.VOLUME_SET) && v !== null
          ? this._slider(id, v, offline(s))
          : "";
      const detail = open
        ? [
            c.show_progress !== false ? this._progress(id, s, true, true) : "",
            c.show_controls !== false ? `<div class="controls">${this._controls(s, false, { target: id, big: false })}</div>` : "",
            this._alexaRow(id, s, true),
            this._philipsRow(id, s, true),
            c.show_volume !== false ? this._volume(id, s) : "",
          ]
            .filter((p) => p && p !== '<div class="controls"></div>')
            .join("")
        : "";
      return `<div class="pitem${open ? " open" : ""}">
          <div class="prow">${this._art(id, s, { front: true })}<div class="prow-main clickable" role="button" tabindex="0" data-action="expand_player" data-target="${esc(id)}" aria-expanded="${open}"><div class="prow-name">${esc(
            nameOf(this._hass, id),
          )}</div>${this._mt("prow-sub", sub)}</div>${play}${vol}</div>${detail}
        </div>`;
    });
    return `<style>${ANIM_STYLE}${BASE_STYLE}${MINI_STYLE}${STACK_STYLE}${LIST_STYLE}${this._sceneStyle(true)}</style>
      <ha-card>
        ${this._stackHeader()}
        <div class="content"><div class="plist">${rows.join("")}</div>${this._hiddenRow(hidden)}</div>
      </ha-card>`;
  }
}
