# Changelog

## 1.8.0 - 2026-11-25

### Features
- Long track texts: a `title_overflow` option — `ellipsis` (default, as before), `wrap` on up to `title_lines` lines (2 by default, `0` for no limit) or `scroll`, a marquee that runs only when the text does not fit its line (and stays cut with `…` under reduced motion). It applies to the title, artist and album lines and to a player's track line in the lists; both options are in the visual editors (#39).

## 1.7.0 - 2026-11-25

### Features
- Favorites: an optional `icon` (`mdi:…`) per entry of the `favorites` option, shown when the favorite has no `image` (the image still comes first; a star by default), to tell favorites apart without hosting picture files (#37).

## 1.6.5 - 2026-11-24

### Maintenance
- The card source is split into ES modules: `src/` (entry `src/index.js`), cut at its sections, with the translations in one file per language (`i18n/<lang>.js`). `scripts/bundle.mjs` concatenates them back, in their original order, into the same single file and per-language files as before; the tests evaluate that bundle.

## 1.6.4 - 2026-11-22

### Performance
- Card picker: the previews are back (`preview: true`), and light. Each card's preview is drawn only once it scrolls into view of Home Assistant's card picker, which otherwise builds the preview of every card at once: until then it holds Home Assistant's state (no render, no history request, no animation). On a dashboard or in the card editor the card is drawn as before.

## 1.6.3 - 2026-11-22

### Performance
- Card picker: the cards no longer ask Home Assistant for a live preview (`preview: false` in `window.customCards`). The picker drew every card at once (history requests, animations), which made the list slow to open; it now shows each card's description instead.

## 1.6.2 - 2026-11-20

### Fixes
- **The dashboard no longer jumps on state updates**: a volume step, a new position or a group change rewrote the whole card, so the artwork was loaded and decoded again (a blink, in Safari a frame without it), the drawn devices and the record restarted. The card is now patched in place: only the changed texts and values are written, the artwork, the record and the sliders stay the same nodes (a slider moved by hand still takes the new volume), and the 1 s progress ticker writes only when the time shown changes.

### Performance
- The card checks on every state change of Home Assistant whether it has to render: the entities it finds in the entity registry (Alexa do-not-disturb switch and next alarm, timer and reminder sensors, Philips TV Ambilight and screen entities, Apple TV and Philips TV remotes, the Sonos favorites sensor) are now looked up once per registry instead of scanning every entity each time, and a player set with `entity` is no longer found by listing and sorting every player.

### Maintenance
- CI: the branch cleanup recognises the commits of the `juju35-screenshots` app.
- New browser test: state updates leave the cards' nodes and height alone.
- CI: Validate runs in a Debian 12 container with Chromium, so the browser tests (status pill placement, no layout shift on updates) now run on every pull request instead of being skipped; a missing browser fails the job.

## 1.6.1 - 2026-11-18

### Fixes
- Speaker groups: a member that its integration leaves `idle` while the group plays (Music Assistant keeps every member but the leader idle) now shows the leader's playing, paused or buffering state — its room rings, the mini card offers *Pause*, and `only_playing` / `hide_when_idle` keep it. Commands still target the member itself. Thanks @nvcs (#26).

## 1.6.0 - 2026-11-18

### Features
- `hide_when_idle` (both cards, in the visual editors, labels in the 22 languages): the card hides itself while nothing is playing nor paused — the player (or the room shown), or every player of `players` — and shows again with the first track. Home Assistant gives its space back in the sections view; it stays visible while the dashboard is edited and in the editor's preview.

## 1.5.1 - 2026-11-18

### Fixes
- Illustrated header: `auto` now follows the Home Assistant theme alone — a light theme keeps the day picture after sunset, a dark theme still shows the night one.

## 1.5.0 - 2026-11-17

### Features
- **Illustrated header** on the full and mini cards (90 px, as in the other ha-* cards): a media room (TV console, plant, a 10 px parquet strip edge to edge) with the player's own drawn device standing big in front (its model's picture, else the speaker, TV or receiver), animated as in the card. The TV behind it shows a moving equalizer while playing, a resting one while paused, and goes dark when off; a TV player stands on the console itself, with a framed picture and a floor lamp beside it.
- The round header icon takes the player's state colour (playing, paused in amber, idle or off in grey, unavailable in red); the state is a pill right after the title (a dot and its label in the same colour; beside the title only when the whole title and its whole label fit there, measured in every language, else on its own line under the subtitle, which then keeps one line; its dot alone when its label does not fit there or above the floor, and on cards of 200 px or less), not repeated in the subtitle, and a click on the icon or the pill opens the player. The mini card's expand / collapse button is a 24 px frosted round button in the banner's top-right corner, the room moving left of it.
- Night picture with the sun (`sun.sun`) or the dark theme; `illustration_theme: day | night` forces one, `illustration: false` keeps the classic header. Both options are in the visual editors, their labels in the 22 languages.
- Night picture with the dark theme even while the sun is up.
## 1.4.1 - 2026-11-14

### Fixes
- Mini card visual editor: it now offers the full card's options that its detail view uses (rooms list, folded sections, favorites sensor, background, and the rooms, source, queue and favorites sections), not only the compact view's.
- Visual editor: rooms and players written as `- entity: media_player.x` in YAML now show in the entity pickers, and keep their YAML form when the list is edited.
- README: `favorites` is YAML only (the visual editor keeps it).

## 1.4.0 - 2026-11-13

### Features
- **Philips TV** (`philips_js`): a row with the *Recording* and *New recording* tags of the TV, and buttons for its **Ambilight**, **Ambilight + Hue** and **screen** (on / off), each toggling its entity; the buttons show while the TV is on. Found on the TV's device by their translation key, else by the entity ids the integration gives them.
- **Philips TV remote**: `show_remote: true` now works with a Philips TV too (remote section, and the remote popup of the mini card); the keys are sent as Philips keys (`CursorUp`, `Confirm`, `Back`, `Home`, `PlayPause`…).
- The new texts in the 22 languages.

## 1.3.3 - 2026-11-13

### Fixes
- An update held while a press was in progress is drawn right after the release, even when the click hits no button. Before, it waited for the next update from Home Assistant.

## 1.3.2 - 2026-11-13

### Fixes
- A click could do nothing: Home Assistant updates the card several times a second, and a rewrite of the card between the press and the release replaced the element pressed, so that the click was lost (most visible on *Show less* of the hidden players, which then seemed stuck). The card is no longer rewritten while a press is in progress; the pending update is drawn right after the click.
- The hidden players (`only_playing`) hide again when the card folds back: a tap elsewhere, the mini card back to its compact view, or the card leaving the page.
- No focus ring after a mouse click or a tap: the focus is kept across updates only for the keyboard.

## 1.3.1 - 2026-11-13

### Fixes
- Folding back on a tap elsewhere now works on iOS (Safari and the companion app): a tap on something that is not clickable sent no click to the page, so the detailed view of the mini card, the unfolded sections, the unfolded rows of the players and the remote popup stayed open. The press and the release are caught instead; a slider dragged out of the card and a scroll do not fold anything.
- Leaving the card (another dashboard view, a conditional card hidden) brings it back in its default state: sections folded as configured, popup closed, mini card compact.

## 1.3.0 - 2026-11-13

### Features
- **Apple TV mini card**: with `show_remote: true`, a remote button sits before the controls of the compact view; it opens the remote (direction pad, select, menu, home, play / pause) in a popup at the top of the card, which stays open while its keys are pressed and closes with its cross, Escape or a click elsewhere. The detailed view keeps its remote section.
- The *Close the remote* text in the 22 languages.

## 1.2.0 - 2026-11-13

### Features
- **Jellyfin**: an episode shows its series and episode (*Series · S2E5*), a film shows *Movie*, the subtitle names the client app (the session's device model) and a session with no artwork draws a TV.
- `hide_idle_sessions` (default on): Jellyfin sessions with nothing playing are left out of `players` (named in the line at the bottom) and of the rooms.
- **Alexa Media Player**: *Last called* badge, the Echo's next alarm, timer and reminder in one line, a do-not-disturb button (its *Do not disturb* switch), Alexa speaker groups (*Everywhere*, multiroom) shown as groups; the mini card and the stacked players get the compact line.
- Alexa content in `favorites` documented (`AMAZON_MUSIC`, `TUNEIN`… or `custom` for a voice command).
- **Apple TV**: the app playing in the subtitle (else the device's model), the episode (*Series · S1E4*), the apps as sources, and an optional **remote** (`show_remote`): direction pad, select, menu, home and play / pause through the device's `remote` entity.
- **HomePod**: a speaker, with the controls it supports and no join button (the integration has no grouping).
- **Device pictures**: with no artwork, Echo speakers and displays, HomePods and Apple TV boxes are drawn from their device model (cylinder, large cylinder, sphere, puck, half sphere, display, small display, tall and small mesh speakers, streaming box): original stylized silhouettes with no logo or brand, whose lights pulse while playing; the small mesh speaker is seen from above in the full card and straight on in the mini card.
- Visual editors: the *Hide idle Jellyfin sessions* and *Show the remote* options; the new texts in the 22 languages.
- Other players render exactly as before.

## 1.1.0 - 2026-11-13

### Features
- **Several players** (`players`): with two media players or more, the Media Card stacks a block per player (artwork, track, progress, controls, volume) under a common header that counts the players and the ones playing; a click on a player's name opens it in the full view (rooms, source, queue, favorites), with a back button to the stack.
- The Media Mini Card lists the players one per row (artwork, name, track, play / pause, volume); a click on a row unfolds it (progress, every control, volume), and the detail button switches to the stacked view.
- `only_playing`: only the players that are playing (`include_paused` adds the paused ones); the others are named in one line at the bottom that shows them on click, and the player that changed last is shown when none plays.
- Visual editors: players, only playing and paused players options; their texts in the 22 languages.

## 1.0.0 - 2026-11-13

### Features
- **Media Card** (`custom:media-card`): artwork with a blurred artwork background, title, artist and album, progress bar (click or arrow keys to seek), transport controls (power, shuffle, previous, play / pause, next, repeat), volume slider (or - / + buttons) and mute.
- **Rooms and groups**: every speaker of the integration that can group (or the players of the `entities` option) with its own volume; a link button joins a room to the shown player's group or takes it out (`media_player.join` / `unjoin`), "Ungroup all" asks first in a popup at the top of the card, and a click on a room shows that player in the card.
- **Source and sound mode** chips (`select_source`, `select_sound_mode`).
- **Queue** of Music Assistant players (`music_assistant.get_queue`): current and next track and the queue length; a click on the next track skips to it.
- **Favorites**: the `favorites` option (any `play_media` content) and the Sonos favorites sensor, found by itself or given by `favorites_entity`.
- **Media Mini Card** (`custom:media-mini-card`): artwork, track, previous / play-pause / next, progress and volume; its detail button switches to the full card and back.
- Everything follows the player's `supported_features`: a control the player cannot take is not drawn.
- Animations for each state: the record slides out of its sleeve and turns while playing, the equalizer bounces (playing) or glows (paused), a ring turns while buffering, the drawn speaker beats and sends sound waves, the TV screen glows, and the playing rooms of a group ring; all of them honour `prefers-reduced-motion`.
- Drawn speaker, TV and receiver pictures for players without artwork.
- Visual editors for both cards, light and dark themes, 22 languages (English in the bundle, each other language loaded on demand).
