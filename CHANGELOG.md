# Changelog

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
