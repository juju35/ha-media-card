// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

// Animations of the card, as in the other ha-* cards: each state plays its own, and prefers-reduced-motion stops them.
//   mc-spin   — the record turns behind the artwork while playing; the buffering ring turns
//   mc-eq     — the equalizer bars bounce while playing (and the receiver's level meter)
//   mc-glow   — the paused equalizer and the TV screen glow slowly
//   mc-beat   — the speaker's woofer beats while playing
//   mc-wave   — sound waves leave the drawn speaker
//   mc-ring   — rings around the playing rooms of a group
//   mc-slide  — the record slides out of the sleeve when playback starts
export const ANIM_STYLE = `
  @keyframes mc-spin { to { transform: rotate(360deg); } }
  @keyframes mc-eq { 0%, 100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
  @keyframes mc-glow { from { opacity: .45; } to { opacity: 1; } }
  @keyframes mc-beat { 0%, 100% { transform: scale(1); } 40% { transform: scale(1.07); } }
  @keyframes mc-wave { 0% { opacity: 0; transform: scale(.7); } 35% { opacity: .9; } 100% { opacity: 0; transform: scale(1.15); } }
  @keyframes mc-ring { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--mc-accent) 55%, transparent); } 100% { box-shadow: 0 0 0 8px transparent; } }
  @keyframes mc-slide { from { transform: translateX(-40%) rotate(-90deg); } to { transform: translateX(0) rotate(0deg); } }
  .cone { transform-box: fill-box; transform-origin: center; }
  .cone.beat { animation: mc-beat .5s ease-in-out infinite; }
  .wave { transform-box: fill-box; transform-origin: center; animation: mc-wave 1.5s ease-out infinite; }
  .wave.d1 { animation-delay: -.75s; }
  .glow { animation: mc-glow 1.8s ease-in-out infinite alternate; }
  .glow.d1 { animation-delay: -.9s; }
  .meter { transform-box: fill-box; transform-origin: bottom; animation: mc-eq .9s ease-in-out infinite; }
  .m1 { animation-delay: -.3s; } .m2 { animation-delay: -.6s; } .m3 { animation-delay: -.15s; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
`;

export const BASE_STYLE = `
  :host { --mc-accent: var(--primary-color, #03a9f4); --mc-ok: var(--success-color, #43a047); --mc-warn: var(--warning-color, #ffa600);
          --mc-crit: var(--error-color, #db4437); --mc-idle: var(--disabled-text-color, #9e9e9e); --mc-active: var(--info-color, #039be5);
          /* Text in a state or accent color is mixed with the text color so that it reads at 4.5:1 at least. */
          --mc-accent-text: color-mix(in srgb, var(--mc-accent) 50%, var(--primary-text-color)); }
  ha-card { overflow: hidden; container-type: inline-size; position: relative; isolation: isolate; }
  /* A size container has no width of its own: this zero-height grid gives the card a natural width without a minimum
     (as in the other ha-* cards), so that it neither falls to its borders nor overflows a narrow parent. */
  :host { display: block; min-width: 0; --mc-natural-width: 380px; }
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, var(--mc-natural-width)); height: 0; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .clickable { cursor: pointer; }
  [role="button"]:focus-visible, [role="slider"]:focus-visible, .btn:focus-visible { outline: 2px solid var(--primary-color, var(--mc-accent)); outline-offset: 2px; border-radius: 4px; }
  .ok { --c: var(--mc-ok); } .warn { --c: var(--mc-warn); } .crit { --c: var(--mc-crit); } .idle { --c: var(--mc-idle); } .active { --c: var(--mc-active); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--mc-ok)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; white-space: nowrap;
          background: color-mix(in srgb, var(--c, var(--mc-ok)) 15%, transparent); color: color-mix(in srgb, var(--c, var(--mc-ok)) 50%, var(--primary-text-color));
          flex: 0 1 auto; min-width: 0; max-width: 50%; overflow: hidden; box-sizing: border-box; }
  .chip-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  /* Blurred artwork behind the whole card, under a veil of the card color so that the text keeps its contrast. */
  .backdrop-art { position: absolute; inset: -40px; z-index: -1; background-size: cover; background-position: center;
                  filter: blur(36px) saturate(1.5); opacity: .55; pointer-events: none; }
  .backdrop-art::after { content: ""; position: absolute; inset: 0; background: color-mix(in srgb, var(--card-background-color, #fff) 58%, transparent); }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 0; }
  .type-icon { position: relative; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex: none;
               --mc-tint: var(--c, var(--mc-accent)); background: color-mix(in srgb, var(--mc-tint) 16%, transparent); transition: background-color .3s ease; }
  .type-icon .icon { width: 24px; height: 24px; fill: color-mix(in srgb, var(--mc-tint) 60%, var(--primary-text-color)); transition: fill .3s ease; }
  .titles { flex: 1 1 0; min-width: 5ch; }
  :host([hide-title]) .titles > .name, :host([hide-subtitle]) .titles > .sub { display: none; }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .warning { padding: 16px; color: color-mix(in srgb, var(--mc-warn) 50%, var(--primary-text-color)); }
  /* Buttons as in the other ha-* cards: a light tint, never a solid fill; the icon of an active one in the accent color. */
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: none; cursor: pointer; font: inherit; font-size: 13px;
         font-weight: 500; padding: 6px 12px; border-radius: 18px; background: color-mix(in srgb, var(--secondary-background-color, rgba(127,127,127,.12)) 80%, transparent);
         color: var(--primary-text-color); min-width: 0; -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }
  .btn span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .btn:not(.disabled):hover { background: color-mix(in srgb, var(--mc-accent) 12%, var(--secondary-background-color, rgba(127,127,127,.12))); }
  .btn.primary { background: color-mix(in srgb, var(--mc-accent) 16%, transparent); color: var(--mc-accent-text); }
  .btn.primary .icon, .btn.on .icon { color: var(--mc-accent); }
  .btn.on { color: var(--mc-accent-text); }
  .btn.primary:not(.disabled):hover { background: color-mix(in srgb, var(--mc-accent) 24%, transparent); }
  .btn.round { width: 36px; height: 36px; padding: 0; border-radius: 50%; flex: none; }
  .btn.round.big { width: 48px; height: 48px; }
  .btn.round.big .icon { width: 26px; height: 26px; }
  .btn.disabled { opacity: .45; cursor: default; }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px -4px -4px 0; border-radius: 50%;
          display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--mc-idle) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, var(--mc-accent)); outline-offset: 1px; }
  /* Artwork, with the equalizer bars over its corner. */
  .art { position: relative; flex: none; border-radius: 10px; overflow: hidden; background: color-mix(in srgb, var(--mc-accent) 14%, var(--secondary-background-color, #eee));
         display: grid; place-items: center; box-shadow: 0 4px 14px rgba(0,0,0,.22); }
  .art img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .art > .icon { width: 40%; height: 40%; color: var(--mc-accent); }
  .eq { position: absolute; left: 6px; bottom: 6px; display: flex; align-items: flex-end; gap: 2px; height: 14px; padding: 3px 4px; border-radius: 6px;
        background: rgba(0,0,0,.45); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
  .eq i { width: 3px; height: 100%; border-radius: 1px; background: #fff; transform-origin: bottom; transform: scaleY(.35); }
  .eq.playing i { animation: mc-eq .8s ease-in-out infinite; }
  .eq.playing i:nth-child(2) { animation-delay: -.35s; } .eq.playing i:nth-child(3) { animation-delay: -.6s; } .eq.playing i:nth-child(4) { animation-delay: -.15s; }
  .eq.paused { animation: mc-glow 1.4s ease-in-out infinite alternate; }
  .spinner { position: absolute; inset: 0; margin: auto; width: 42%; height: 42%; border-radius: 50%; border: 3px solid rgba(255,255,255,.35);
             border-top-color: #fff; animation: mc-spin .9s linear infinite; box-sizing: border-box; }
  .meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .track { font-size: 15px; font-weight: 500; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .artist, .album { font-size: 13px; color: var(--secondary-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .album { font-size: 12px; }
  .progress { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--secondary-text-color); font-variant-numeric: tabular-nums; }
  .bar { flex: 1; height: 4px; border-radius: 3px; background: var(--divider-color, rgba(127,127,127,.25)); overflow: hidden; position: relative; }
  .bar.seek { cursor: pointer; height: 6px; }
  .bar > div { height: 100%; border-radius: 3px; background: var(--mc-accent); }
  /* Volume slider: the filled part in the accent color (--p, set inline and while dragging). */
  input[type="range"] { -webkit-appearance: none; appearance: none; flex: 1; min-width: 40px; height: 4px; margin: 0; border-radius: 3px; cursor: pointer;
                        background: linear-gradient(to right, var(--mc-accent) var(--p, 0%), var(--divider-color, rgba(127,127,127,.25)) var(--p, 0%)); }
  input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--card-background-color, #fff);
                                              border: 2px solid var(--mc-accent); box-sizing: border-box; }
  input[type="range"]::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: var(--card-background-color, #fff); border: 2px solid var(--mc-accent); box-sizing: border-box; }
  input[type="range"]:focus-visible { outline: 2px solid var(--primary-color, var(--mc-accent)); outline-offset: 4px; }
  input[type="range"]:disabled { opacity: .45; cursor: default; }
  .volume { display: flex; align-items: center; gap: 8px; }
  .volume .pct { font-size: 12px; min-width: 38px; text-align: right; color: var(--secondary-text-color); font-variant-numeric: tabular-nums; }
  /* Narrow card: the status chip keeps only its colored dot (its text stays in its title and aria-label). */
  @container (max-width: 230px) {
    .chip { padding: 4px; flex: none; }
    .chip-text { display: none; }
  }
  @container (max-width: 200px) { .header { gap: 6px; } }
`;

// In-card popup, as in the other ha-* cards: a backdrop over the card with a small dialog at the top of the card.
export const DIALOG_STYLE = `
  ha-card.dialog-open { min-height: 160px; }
  .dialog-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
                     padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 340px); max-height: calc(100% - 24px);
           box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4); display: flex; flex-direction: column; gap: 12px; }
  .modal .msg { font-size: 14px; line-height: 1.4; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
`;

export const FULL_STYLE = `
  .content { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .hero { display: flex; gap: 14px; align-items: center; min-width: 0; }
  .art-wrap { position: relative; flex: none; width: 112px; height: 112px; }
  .art-wrap.vinyl-on { width: 140px; }
  .art-wrap .art { position: absolute; left: 0; top: 0; width: 112px; height: 112px; z-index: 1; }
  /* The record, half out of its sleeve behind the artwork; it turns while playing. */
  .vinyl { position: absolute; left: 28px; top: 4px; width: 104px; height: 104px; border-radius: 50%;
           /* Light catching the grooves (the conic layer), so that the turning of the record shows. */
           background: conic-gradient(transparent 0 6%, rgba(255,255,255,.3) 13%, transparent 20% 56%, rgba(255,255,255,.2) 63%, transparent 70%),
                       repeating-radial-gradient(circle, #1b1b1d 0 2px, #2a2a2e 2px 3px); box-shadow: 0 2px 8px rgba(0,0,0,.3); }
  .vinyl::after { content: ""; position: absolute; inset: 34%; border-radius: 50%; background: var(--mc-accent);
                  box-shadow: inset 0 0 0 7px color-mix(in srgb, var(--mc-accent) 70%, #fff), inset 0 0 0 15px var(--mc-accent); }
  .vinyl::before { content: ""; position: absolute; inset: 47%; border-radius: 50%; background: #111; z-index: 1; }
  /* The record turns on a clock of its own (--mc-spin-delay, set after each render) so that a rewrite of the card does
     not restart it; it slides out of the sleeve once per track (.slide, added after the render that starts it). */
  .vinyl.playing { animation: mc-spin 3s linear var(--mc-spin-delay, 0s) infinite; }
  .vinyl.playing.slide { animation: mc-slide .6s ease-out both, mc-spin 3s linear .6s infinite; }
  .pic-box { width: 112px; height: 112px; flex: none; display: grid; place-items: center; }
  .pic { width: 100%; height: 100%; }
  .controls { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase;
                   letter-spacing: .04em; color: var(--secondary-text-color); margin-bottom: 6px; }
  .section-title .icon { width: 16px; height: 16px; }
  .section-title span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .section-title.toggle { cursor: pointer; user-select: none; }
  .section-title.toggle[aria-expanded="false"] { margin-bottom: 0; }
  .section-title .chevron { margin-left: auto; width: 16px; height: 16px; transition: transform .2s ease; }
  .section-title.toggle[aria-expanded="false"] .chevron { transform: rotate(-90deg); }
  .rooms { display: flex; flex-direction: column; gap: 8px; }
  .room { display: flex; align-items: center; gap: 10px; padding: 6px 8px; border-radius: 12px; min-width: 0;
          background: color-mix(in srgb, var(--secondary-background-color, rgba(127,127,127,.08)) 70%, transparent); }
  .room.current { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--mc-accent) 45%, transparent); }
  .room-icon { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; flex: none;
               background: color-mix(in srgb, var(--c, var(--mc-idle)) 16%, transparent); }
  .room-icon .icon { width: 18px; height: 18px; fill: color-mix(in srgb, var(--c, var(--mc-idle)) 60%, var(--primary-text-color)); }
  .room-icon.ring { animation: mc-ring 1.6s ease-out infinite; }
  .room-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
  .room-name { font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .room-sub { font-size: 11px; color: var(--secondary-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .room .volume .btn.round { width: 28px; height: 28px; }
  .room .volume .btn.round .icon { width: 16px; height: 16px; }
  .room .volume .pct { min-width: 34px; font-size: 11px; }
  .room > .btn.round { width: 32px; height: 32px; }
  .group-actions { display: flex; justify-content: flex-end; }
  .options { display: flex; flex-wrap: wrap; gap: 6px; }
  .options + .section-sub { margin-top: 10px; }
  .section-sub { font-size: 11px; color: var(--secondary-text-color); margin-bottom: 6px; display: flex; align-items: center; gap: 4px; }
  .section-sub .icon { width: 14px; height: 14px; }
  .options .btn { font-weight: 400; }
  .queue { display: flex; flex-direction: column; gap: 6px; }
  .q-item { display: flex; align-items: center; gap: 10px; padding: 6px; border-radius: 10px; min-width: 0;
            background: color-mix(in srgb, var(--secondary-background-color, rgba(127,127,127,.08)) 70%, transparent); }
  .q-item .art { width: 40px; height: 40px; border-radius: 6px; box-shadow: none; }
  .q-label { font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: var(--mc-accent-text); }
  .q-name { font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .q-sub { font-size: 11px; color: var(--secondary-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .q-msg { font-size: 12px; color: var(--secondary-text-color); }
  .favs { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 6px; }
  .fav { justify-content: flex-start; border-radius: 12px; padding: 6px 10px 6px 6px; font-weight: 400; }
  .fav .art { width: 28px; height: 28px; border-radius: 6px; box-shadow: none; }
  .fav .art .icon { width: 16px; height: 16px; }
  .fav .art ha-icon { --mdc-icon-size: 16px; display: flex; color: var(--mc-accent); }
  /* Narrow card: the artwork shrinks, then the hero stacks. */
  @container (max-width: 340px) {
    .art-wrap, .art-wrap .art, .pic-box { width: 88px; height: 88px; }
    .art-wrap.vinyl-on { width: 110px; }
    .vinyl { left: 22px; width: 82px; height: 82px; }
    .controls { gap: 6px; }
  }
  @container (max-width: 250px) {
    .art-wrap, .art-wrap .art, .pic-box { width: 64px; height: 64px; }
    .art-wrap.vinyl-on { width: 64px; }
    .vinyl { display: none; }
    .hero { gap: 10px; }
    .controls { gap: 4px; }
    .controls .btn.round { width: 30px; height: 30px; }
    .controls .btn.round.big { width: 36px; height: 36px; }
  }
`;

export const MINI_STYLE = `
  :host { --mc-natural-width: 300px; }
  .content { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 8px; }
  .row { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .row .art { width: 52px; height: 52px; border-radius: 8px; }
  .row .eq { left: 4px; bottom: 4px; height: 10px; padding: 2px 3px; }
  .row .eq i { width: 2px; }
  .pic-box { width: 52px; height: 52px; flex: none; display: grid; place-items: center; }
  .pic { width: 100%; height: 100%; }
  .track { font-size: 14px; }
  .artist { font-size: 12px; }
  .controls { display: flex; gap: 4px; flex: none; align-items: center; }
  /* In the column of .content, the flex: 1 of .bar would set its height to 0. */
  .content > .bar { flex: none; height: 3px; }
  @container (max-width: 260px) {
    .row { flex-wrap: wrap; row-gap: 8px; }
    .controls { flex-basis: 100%; justify-content: flex-end; }
  }
  @container (max-width: 190px) { .row .art, .row .pic-box { display: none; } }
`;

// Several players (`players`): the full card stacks a block per player, the mini card lists them one per row.
export const STACK_STYLE = `
  .zoom.back { margin: -4px 0 -4px -4px; }
  .players { display: flex; flex-direction: column; }
  .player { display: flex; flex-direction: column; gap: 8px; padding: 12px 0; min-width: 0; }
  .player:first-child { padding-top: 0; }
  .player:last-child { padding-bottom: 0; }
  .player + .player { border-top: 1px solid var(--divider-color, rgba(127,127,127,.2)); }
  .player-head { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .player-head .art, .player-head .pic-box { width: 64px; height: 64px; border-radius: 8px; }
  .player-head .eq { left: 4px; bottom: 4px; height: 10px; padding: 2px 3px; }
  .player-head .eq i { width: 2px; }
  .player-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .player-name { display: inline-flex; align-items: center; gap: 2px; align-self: flex-start; max-width: 100%; font-size: 11px; font-weight: 500;
                 text-transform: uppercase; letter-spacing: .04em; color: var(--secondary-text-color); }
  .player-name span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .player-name .icon { width: 14px; height: 14px; }
  .player-name:hover { color: var(--primary-text-color); }
  .player-head > .chip { align-self: flex-start; }
  .player .controls { gap: 6px; }
  .more-players { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding-top: 10px; font-size: 12px; color: var(--secondary-text-color);
                  border-top: 1px solid var(--divider-color, rgba(127,127,127,.2)); }
  .more-players > span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .more-players .chevron { width: 16px; height: 16px; transition: transform .2s ease; }
  .more-players[aria-expanded="false"] .chevron { transform: rotate(-90deg); }
  @container (max-width: 250px) {
    .player-head .art, .player-head .pic-box { width: 44px; height: 44px; }
    .player-head { gap: 8px; }
    .player-head > .chip { display: none; }
  }
`;

export const LIST_STYLE = `
  .plist { display: flex; flex-direction: column; gap: 6px; }
  .pitem { display: flex; flex-direction: column; gap: 8px; padding: 6px 8px; border-radius: 12px; min-width: 0;
           background: color-mix(in srgb, var(--secondary-background-color, rgba(127,127,127,.08)) 70%, transparent); }
  .pitem.open { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--mc-accent) 45%, transparent); }
  .prow { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .prow .art, .prow .pic-box { width: 32px; height: 32px; border-radius: 6px; box-shadow: none; }
  .prow .eq { display: none; }
  .prow-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .prow-name { font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .prow-sub { font-size: 11px; color: var(--secondary-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .prow .btn.round, .pitem .controls .btn.round { width: 32px; height: 32px; }
  .prow .btn.round .icon { width: 18px; height: 18px; }
  .prow input[type="range"] { flex: 0 0 64px; min-width: 0; }
  .pitem .controls { justify-content: center; }
  @container (max-width: 260px) { .prow input[type="range"] { display: none; } }
  @container (max-width: 190px) { .prow .art, .prow .pic-box { display: none; } }
`;

// Element names of Home Assistant dialogs (more-info opened from the card, among others).
export const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);
export const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app)
// a tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to
// the page. It counts when the press and the release are both outside the card (a slider dragged out of the card
// does not fold it), and a scroll does not count (the browser cancels the pointer). Keyboard clicks still go through
// the click event.
// Patch the shadow DOM in place from the new HTML instead of rewriting it: a volume step, a new position or a
// group change rewrote the whole card, so the artwork's <img> was decoded again (a blink, a frame without it in
// WebKit), the drawn devices and animations started over and the dashboard moved under the finger. Nodes whose tag
// is unchanged are kept and only the changed text and attributes are written. Children carrying a data-key are
// matched by it wherever they moved, the others by position. A node marked data-live keeps the attributes the card
// sets on it after the render (the record's slide and turn): its data-key carries everything its markup depends on.
export const patchAttrs = (cur, next) => {
  if (next.hasAttribute("data-live")) return;
  for (const { name } of [...cur.attributes]) if (!next.hasAttribute(name)) cur.removeAttribute(name);
  for (const { name, value } of next.attributes) if (cur.getAttribute(name) !== value) cur.setAttribute(name, value);
  // A slider the user moved no longer follows its value attribute: its value is set too.
  if (cur.localName === "input" && cur.value !== (next.getAttribute("value") ?? cur.value)) cur.value = next.getAttribute("value");
};
export const keyOf = (n) => (n.nodeType === 1 ? n.getAttribute("data-key") : null);
export const place = (parent, node, ref) => {
  if (node === ref) return;
  try {
    // moveBefore (where supported) keeps the focus of a moved node.
    if (parent.moveBefore && node.parentNode === parent) return parent.moveBefore(node, ref);
  } catch (_e) {
    /* fall back to insertBefore */
  }
  parent.insertBefore(node, ref);
};
export const patchChildren = (cur, next) => {
  const old = [...cur.childNodes];
  const fresh = [...next.childNodes];
  const byKey = new Map();
  for (const o of old) {
    const k = keyOf(o);
    if (k !== null && !byKey.has(k)) byKey.set(k, o);
  }
  const used = new Set();
  fresh.forEach((n, i) => {
    const k = keyOf(n);
    let o = k !== null ? byKey.get(k) : old[i];
    if (!o || o.nodeType !== n.nodeType || o.nodeName !== n.nodeName || used.has(o) || (k === null && keyOf(o) !== null)) o = null;
    const ref = cur.childNodes[i] ?? null;
    if (!o) {
      cur.insertBefore(n, ref);
      return;
    }
    used.add(o);
    place(cur, o, ref);
    if (n.nodeType === 1) {
      patchAttrs(o, n);
      patchChildren(o, n);
    } else if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
  });
  for (const o of old) if (!used.has(o)) o.remove();
};
export const morph = (root, html) => {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  // Without a real DOM (the unit tests' stand-ins), the HTML is written as it is; so is the first render (nothing to
  // keep yet): Chromium lays some text out a pixel apart when it comes from a template rather than from the parser.
  if (!tpl.content || !root.childNodes || !root.firstChild) root.innerHTML = html;
  else patchChildren(root, tpl.content);
};

export const watchOutside = (card, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = isOutside(card, ev);
  };
  const onUp = (ev) => {
    if (downOutside && isOutside(card, ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0 && isOutside(card, ev)) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    // A tap (press and release at the same spot), for the tests.
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
  };
};

// Elements a click acts on, and how one is told from the others across renders (focus kept for keyboard users).
export const FOCUS_SELECTOR = "[data-action], [data-entity], input[type=range]";
export const focusKey = (el) => {
  const data = Object.entries({ ...el.dataset });
  return data.length ? `${el.tagName}|${JSON.stringify(data)}` : "";
};

// Clicks that send a command to a player: none while it is unavailable.
export const PLAYER_ACTIONS = new Set(["play", "pause", "stop", "next", "previous", "shuffle", "repeat", "mute", "vol_down", "vol_up", "power", "seek", "source", "sound_mode", "favorite", "queue_next", "join", "leave"]);
export const REPEAT_NEXT = { off: "all", all: "one", one: "off" };
