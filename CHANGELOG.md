# Changelog

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
