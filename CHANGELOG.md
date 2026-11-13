# Changelog

## 1.2.0 - 2026-11-13

### Features
- **Jellyfin**: an episode shows its series and episode (*Series · S2E5*), a film shows *Movie*, the subtitle names the client app (the session's device model) and a session with no artwork draws a TV.
- `hide_idle_sessions` (default on): Jellyfin sessions with nothing playing are left out of `players` (named in the line at the bottom) and of the rooms.
- **Alexa Media Player**: *Last called* badge, the Echo's next alarm, timer and reminder in one line, a do-not-disturb button (its *Do not disturb* switch), Alexa speaker groups (*Everywhere*, multiroom) shown as groups; the mini card and the stacked players get the compact line.
- Alexa content in `favorites` documented (`AMAZON_MUSIC`, `TUNEIN`… or `custom` for a voice command).
- Visual editors: the *Hide idle Jellyfin sessions* option; the new texts in the 22 languages.
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
