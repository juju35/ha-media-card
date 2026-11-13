# ha-media-card

[![Marketplace](https://img.shields.io/badge/Marketplace-Custom-41BDF5.svg)](https://www.home-assistant.io/integrations/marketplace/)
[![HACS Validation](https://github.com/juju35/ha-media-card/actions/workflows/hacs.yml/badge.svg)](https://github.com/juju35/ha-media-card/actions/workflows/hacs.yml)
[![Validate](https://github.com/juju35/ha-media-card/actions/workflows/validate.yml/badge.svg)](https://github.com/juju35/ha-media-card/actions/workflows/validate.yml)
[![Lint](https://github.com/juju35/ha-media-card/actions/workflows/lint.yml/badge.svg)](https://github.com/juju35/ha-media-card/actions/workflows/lint.yml)
[![Release](https://img.shields.io/github/v/release/juju35/ha-media-card)](https://github.com/juju35/ha-media-card/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/juju35/ha-media-card/blob/main/LICENSE)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/julienstep9)

<p align="center">
  <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/sonos.png" alt="Sonos" width="64">&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/music_assistant.png" alt="Music Assistant" width="64">&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/squeezebox.png" alt="Squeezebox" width="64">&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/cast.png" alt="Google Cast" width="64">&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/apple_tv.png" alt="Apple TV" width="64">&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/spotify.png" alt="Spotify" width="64">&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/jellyfin.png" alt="Jellyfin" width="64">&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/alexa_media.png" alt="Alexa Media Player" width="64">&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/bluesound.png" alt="Bluesound" width="64">&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/heos.png" alt="HEOS" width="64">
</p>

Lovelace cards for Home Assistant media players and multiroom speakers — **Sonos**, **Music Assistant**, **Squeezebox**, **Google Cast**, **AirPlay**, **Spotify** and any other `media_player` entity: artwork over a blurred background, title and artist, progress, controls, volume per room, speaker groups (join / unjoin), source and sound mode, the Music Assistant queue and your favorites.

The cards work on top of the integrations you already use, and draw only what each player can do: the controls follow its `supported_features`, so a radio without seeking gets no seek bar, a receiver gets its sources and sound modes, a speaker that cannot group gets no link button.

[![Open your Home Assistant instance and open a repository inside the Marketplace.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/marketplace_repository/?owner=juju35&repository=ha-media-card&category=plugin)

| Media Card | Media Mini Card |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card.png" alt="media card" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card.png" alt="media mini card" width="380"><br><img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-spotify.png" alt="media mini card, Spotify" width="380"><br><img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-tv.png" alt="media mini card, TV" width="380"> |

## Features

- Two cards: a full **Media Card** (`custom:media-card`) and a compact **Media Mini Card** (`custom:media-mini-card`)
- Artwork with a **blurred artwork background** behind the whole card (`show_background`), title, artist, album, and "Track 3 of 12" when the player tells its queue position (Sonos)
- **Progress** bar with elapsed and total time, moving every second while playing; click it to seek, or focus it and use the arrow keys (10 s), Home and End
- **Controls**: power, shuffle, previous, play / pause (or stop), next, repeat (off → all → one), each one only when the player supports it
- **Volume** slider with the whole percentage, mute, or - / + buttons for a player that only steps its volume
- **Several players** (`players`): the full card stacks a block per player (artwork, track, progress, controls, volume), the mini card lists them one per row; `only_playing` keeps only the ones that are playing (see [Several players](#several-players))
- **Rooms**: every speaker the shown player can be grouped with (same integration, grouping supported) or the players of the `entities` option, each with its state, its track, its own volume and mute; a click on a room's name shows that player in the card
- **Speaker groups**: a link button per room joins it to the group or takes it out (`media_player.join` / `unjoin`); **Ungroup all** asks first, in a popup at the top of the card; the subtitle tells who the player plays with
- **Source** and **sound mode** chips (inputs of a receiver, Sonos favorites and line-in, Spotify Connect devices…)
- **Queue** of Music Assistant players: current and next track with their artwork, and the queue length; a click on the next track skips to it
- **Favorites**: your own list (any `play_media` content: radio, playlist, Music Assistant URI, Alexa content…) and the Sonos favorites, played on the shown player
- **Jellyfin**: an episode shows its series and episode ("Harbor Tales · S2E5"), a film says so, the client app is in the subtitle, and idle sessions stay out of the way (`hide_idle_sessions`)
- **Alexa Media Player** (Echo): "Last called" badge, next alarm, timer and reminder, a do-not-disturb button, and Alexa speaker groups shown as groups
- **Apple TV and HomePod**: the app playing in the subtitle, the episode (*Series · S1E4*), the apps as sources, an optional **remote** (`show_remote`); a HomePod is a speaker
- **Animated**: the record slides out of the sleeve and turns while playing, the equalizer bounces, glows while paused, a ring turns while buffering, the drawn speaker beats, the TV screen glows, the playing rooms of a group ring (see [Animations](#animations)); `prefers-reduced-motion` stops them
- Drawn **speaker, TV and receiver** pictures for a player without artwork, following its `device_class`, and **device pictures** by model for Echo speakers and displays, HomePods and Apple TV boxes (see [Drawn pictures](#drawn-pictures))
- Header icon of the kind of player (speaker, speaker group, TV, receiver) in a tinted circle colored by its state, and a state chip on the title line
- Collapsible sections (source, queue and favorites folded by default); a click elsewhere on the page folds them back
- Detail button on the mini card (top right): it switches the mini card to the full card's content and back; a click anywhere outside the card brings the compact view back
- Buttons disabled while the player is unavailable
- Sections view: the full card takes 12 columns by default and at least 6, the mini card 6; narrow widths get their own layout
- Visual editor in the dashboard UI for both cards (no YAML needed)
- Light and dark themes, English, French, German, Spanish, Serbian (Cyrillic and Latin), Italian, Dutch, European Portuguese, Polish, Romanian, Danish, Swedish, Bulgarian, Russian, Ukrainian, Hungarian, Slovak, Czech, Slovenian, Latvian and Greek
- Single file, no external dependency

## Supported integrations

Any `media_player` entity works: the card reads what the player supports. These integrations get more:

| Integration | What the cards show |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/sonos.png" alt="" width="16"> [Sonos](https://www.home-assistant.io/integrations/sonos/) (core) | Playback, seek, shuffle / repeat, volume per room, **groups** (join / unjoin), **sources** (Sonos favorites, line-in, TV), **favorites** from the Sonos favorites sensor (`sensor.sonos_favorites`, disabled by default in Home Assistant: enable it), "Track n of m" |
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/music_assistant.png" alt="" width="16"> [Music Assistant](https://www.home-assistant.io/integrations/music_assistant/) (core) | Playback, seek, shuffle / repeat, volume per room, **groups** (players that can sync), **queue** (current and next track, queue length, through `music_assistant.get_queue`), favorites with Music Assistant URIs in the `favorites` option. Music Assistant also brings AirPlay, Chromecast, Squeezelite, DLNA and Snapcast speakers |
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/squeezebox.png" alt="" width="16"> [Squeezebox (Lyrion Music Server)](https://www.home-assistant.io/integrations/squeezebox/) (core) | Playback, seek, shuffle / repeat, volume, **sync groups** (join / unjoin) |
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/cast.png" alt="" width="16"> [Google Cast](https://www.home-assistant.io/integrations/cast/) (core) | Playback, seek, volume, app name; Google Home speaker groups are players of their own (no join) |
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/apple_tv.png" alt="" width="16"> [Apple TV](https://www.home-assistant.io/integrations/apple_tv/) (core: Apple TV, HomePod, AirPlay) | Playback, volume, the **app playing** in the subtitle (else the device's model), the **apps as sources**, the **episode** as *Series · S1E4*, a drawn box or speaker by model; an optional **remote** (`show_remote: true`): direction pad, select, menu, home and play / pause through the device's `remote` entity (`remote.send_command`). A **HomePod** is a speaker (volume and playback as it supports them); the integration has no grouping, so there is no join button |
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/spotify.png" alt="" width="16"> [Spotify](https://www.home-assistant.io/integrations/spotify/) (core) | Playback, seek, shuffle / repeat, volume, **Spotify Connect devices** as sources |
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/bluesound.png" alt="" width="16"> [Bluesound](https://www.home-assistant.io/integrations/bluesound/), <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/heos.png" alt="" width="16"> [HEOS](https://www.home-assistant.io/integrations/heos/), <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/linkplay.png" alt="" width="16"> [LinkPlay](https://www.home-assistant.io/integrations/linkplay/), <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/yamaha_musiccast.png" alt="" width="16"> [Yamaha MusicCast](https://www.home-assistant.io/integrations/yamaha_musiccast/), <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/snapcast.png" alt="" width="16"> [Snapcast](https://www.home-assistant.io/integrations/snapcast/) (core) | Playback, volume, sources, **groups** (join / unjoin) |
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/jellyfin.png" alt="" width="16"> [Jellyfin](https://www.home-assistant.io/integrations/jellyfin/) (core) | One player per client session: the **episode** as *Series · S2E5* (or *Movie*), the **client app** in the subtitle (the session's device model, e.g. *Jellyfin Android TV*), a drawn TV when there is no artwork; **idle sessions** (an app left open, nothing playing) are left out of `players` and of the rooms (`hide_idle_sessions`) |
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/alexa_media.png" alt="" width="16"> [Alexa Media Player](https://github.com/alandtse/alexa_media_player) (custom) | Echo speakers and groups: playback, volume, **Last called** badge (`last_called`), the **next alarm, timer and reminder** of the Echo (its *Next alarm / timer / reminder* sensors) in one line, a **do-not-disturb** button (its *Do not disturb* switch), **speaker groups** (*Everywhere*, multiroom groups) shown as groups (Alexa cannot join or unjoin speakers from Home Assistant), and Alexa content in `favorites` (`AMAZON_MUSIC`, `TUNEIN`, `SPOTIFY`…, or `custom` for a voice command) |
| Receivers and TVs (<img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/denonavr.png" alt="" width="16"> [Denon AVR](https://www.home-assistant.io/integrations/denonavr/), <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/yamaha.png" alt="" width="16"> [Yamaha](https://www.home-assistant.io/integrations/yamaha/), <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/samsungtv.png" alt="" width="16"> [Samsung TV](https://www.home-assistant.io/integrations/samsungtv/), <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/images/webostv.png" alt="" width="16"> [LG webOS](https://www.home-assistant.io/integrations/webostv/)…) | Power, volume, **sources** and **sound modes**, drawn receiver or TV picture |

## Prerequisites

Home Assistant 2024.8 or later, with at least one media player. The Music Assistant queue needs a Music Assistant integration that has the `music_assistant.get_queue` action (Home Assistant 2025 and later).

## Installation

### Via the Marketplace (recommended)

Click the button below to add the repository directly:

[![Add to the Marketplace](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/marketplace_repository/?owner=juju35&repository=ha-media-card&category=plugin)

Then click **Install**, and reload your browser when the Marketplace asks you to.

Or manually:

1. Open **Settings → Marketplace → Add from link** (top right; this needs a GitHub account connected)
2. Add `https://github.com/juju35/ha-media-card` — Type: **Dashboard**
3. Open **Media Card** and click **Install**
4. Clear your browser cache and refresh

The Marketplace adds the resource `/local/community/ha-media-card/media-card.js` to your dashboards.

### Manual

1. Download `media-card.js` and the `media-card.i18n.*.js` translation files from the [latest release](https://github.com/juju35/ha-media-card/releases/latest)
2. Copy them all to `/config/www/` (without the translation files, the cards show in English)
3. Go to **Settings → Dashboards → ⋮ → Resources** → Add resource:
   - URL: `/local/media-card.js`
   - Type: **JavaScript Module**
4. Clear your browser cache and refresh

## Configuration

### Card types

| Card | Type |
|---|---|
| Media Card | `custom:media-card` |
| Media Mini Card | `custom:media-mini-card` |

### Visual editor

Edit a dashboard, click **Add card** and search for **Media Card** or **Media Mini Card**. The first playing player is preselected; pick another one (or several players to show together), the rooms, an optional title, the sections to show and the language. The preview updates live, and options left at their default are kept out of the generated YAML.

### Minimal

```yaml
type: custom:media-card
entity: media_player.living_room
```

```yaml
type: custom:media-mini-card
entity: media_player.living_room
```

Without `entity`, the card shows the first player that is playing.

Several players in one card:

```yaml
type: custom:media-card
players:
  - media_player.living_room
  - media_player.kitchen
  - media_player.bedroom
only_playing: true
```

### Full options

```yaml
type: custom:media-card
entity: media_player.living_room
title: Music
entities:
  - media_player.kitchen
  - media_player.office
  - media_player.bedroom
show_title: true
show_subtitle: true
show_background: true
show_progress: true
show_controls: true
show_volume: true
show_rooms: true
show_source: true
show_queue: true
show_favorites: true
collapsed:
  - source
  - queue
  - favorites
favorites_entity: sensor.sonos_favorites
favorites:
  - name: Jazz radio
    media_content_id: http://radio.example/jazz.mp3
    media_content_type: music
  - name: Focus playlist
    media_content_id: library://playlist/12
    media_content_type: playlist
    image: /local/covers/focus.jpg
language: fr
```

```yaml
type: custom:media-mini-card
entity: media_player.spotify
title: Spotify
show_progress: true
show_controls: true
show_volume: true
zoom: true
language: fr
```

### Options reference

| Option | Card | Default | Description |
|---|---|---|---|
| `entity` | both | First playing player | The `media_player` entity to show |
| `players` | both | — | Two `media_player` entities or more, shown together (see [Several players](#several-players)); takes the place of `entity` |
| `only_playing` | both | `false` | With `players`: only the players that are playing (or buffering); the others are summed up in one line at the bottom, which shows them on click. When none plays, the one that changed last is shown |
| `include_paused` | both | `false` | With `only_playing`: paused players count as playing |
| `show_remote` | both | `false` | Apple TV: a remote section (direction pad, select, menu, home, play / pause) sent to the device's `remote` entity; on the mini card, a remote button in the compact view opens it in a popup (and the detailed view keeps the section) |
| `hide_idle_sessions` | both | `true` | Jellyfin: leave the sessions with nothing playing out of `players` (named in the line at the bottom) and of the rooms |
| `title` | both | Player name | Card title |
| `show_title` | both | `true` | Show the title in the header (e.g. `false` under a section heading of your own) |
| `show_subtitle` | both | `true` | Show the subtitle (group members, app or source) under the title |
| `show_progress` | both | `true` | Progress bar and times (only while a track with a duration plays) |
| `show_controls` | both | `true` | Transport buttons; the mini card keeps previous, play / pause and next |
| `show_volume` | both | `true` | Volume slider (or - / + buttons) and mute |
| `zoom` | mini | `true` | Detail button at the top right of the mini card: it shows the full card's content (with the same options, so `entities`, `favorites`, `collapsed`… can be set on the mini card too) and switches back; `false` removes the button |
| `show_background` | full | `true` | Blurred artwork behind the whole card |
| `entities` | full | Players the shown one can group with | Rooms of the card: a list of `media_player` entities (or `- entity: media_player.x`), listed after the shown player |
| `show_rooms` | full | `true` | Rooms section: volume per room, join / leave the group, Ungroup all |
| `show_source` | full | `true` | Source and sound mode section (players that support them) |
| `show_queue` | full | `true` | Queue section (Music Assistant players) |
| `show_favorites` | full | `true` | Favorites section (players that can play media) |
| `collapsed` | full | `[source, queue, favorites]` | Sections folded by default, among `rooms`, `source`, `queue`, `favorites` and `remote` (`[]` to unfold everything). Click a section title (or Tab to it and press Enter or Space) to fold or unfold it; a click elsewhere on the page folds them back |
| `favorites` | full | — | Your favorites, played with `media_player.play_media`: a list of `name`, `media_content_id`, `media_content_type` (default `music`) and an optional `image` |
| `favorites_entity` | full | Sonos favorites sensor | Sensor whose `items` attribute lists favorites as `{ id: title }` (found by itself for a Sonos player) |
| `language` | both | Auto | Force language: `en`, `fr`, `de`, `es`, `sr`, `sr-Latn`, `it`, `nl`, `pt`, `pl`, `ro`, `da`, `sv`, `bg`, `ru`, `uk`, `hu`, `sk`, `cs`, `sl`, `lv` or `el` (auto-detects from HA settings) |

### Rooms and groups

The rooms are the speakers of the same integration that can be grouped with the shown player, found by themselves: a Music Assistant player lists the other Music Assistant players, a Sonos speaker the other Sonos speakers. List them yourself with `entities` to pick or order them, or to show players of several integrations (their volume only: a group only joins players of one integration).

- The **link** button of a room joins it to the group of the shown player (to the group's leader, the first of its `group_members`), or takes it out. The new membership shows at once, until the integration reports it.
- **Ungroup all** takes every other speaker out of the group, after a confirmation.
- A click on a room's **name** shows that player in the card (the title then follows it); a click on the configured player's name brings it back.

### Several players

With two players or more in `players`, the card shows them together, in the order of the list:

- The **Media Card** stacks a block per player, separated by a thin line: artwork, track, progress, the controls the player supports, volume and mute. The header gives the card's title (`title`, *Media* by default), how many players it has and how many play. A click on a player's **name** opens it in the full view (rooms and groups, source, queue, favorites), with a **back** button to the stack.
- The **Media Mini Card** lists them one per row: artwork, name, track, play / pause and a small volume slider. A click on a row unfolds it (progress, every control, volume with its percentage); a click elsewhere on the page folds it back. The detail button switches to the stacked view.
- `only_playing: true` keeps the players that are playing (add `include_paused: true` for the paused ones); the others are named in one line at the bottom, a click on it shows them too.

`title`, `show_progress`, `show_controls` and `show_volume` apply to every player. Without `players` (or with a single one), the cards behave exactly as with `entity`.

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-players.png" alt="several players" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-players-dark.png" alt="several players dark" width="400"> |

Only the players that are playing (`only_playing`), the others in one line at the bottom:

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-players-playing.png" alt="only playing" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-players-playing-dark.png" alt="only playing dark" width="400"> |

The mini card lists them one per row; a click on a row unfolds it:

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-players.png" alt="mini card, several players" width="380"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-players-dark.png" alt="mini card, several players dark" width="380"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-players-open.png" alt="mini card, a row unfolded" width="380"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-players-open-dark.png" alt="mini card, a row unfolded dark" width="380"> |

### Jellyfin and Alexa

A Jellyfin session shows the episode and the client app; an Echo its *Last called* badge, its next alarm and timer, and a do-not-disturb button. Stacked with other players, an idle Jellyfin session (here a web browser left open) is left out and named at the bottom:

| Jellyfin | Alexa |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-jellyfin.png" alt="Jellyfin session" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-alexa.png" alt="Echo speaker" width="400"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-jellyfin-dark.png" alt="Jellyfin session dark" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-alexa-dark.png" alt="Echo speaker dark" width="400"> |

| Several players | Mini card |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-players-jellyfin-alexa.png" alt="Echo, Jellyfin and an Alexa group" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-alexa.png" alt="mini card, Echo" width="380"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-players-jellyfin-alexa-dark.png" alt="Echo, Jellyfin and an Alexa group dark" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-alexa-dark.png" alt="mini card, Echo dark" width="380"> |

Alexa favorites go through `media_player.play_media` like any other: a music provider and a search, or a voice command.

```yaml
type: custom:media-card
entity: media_player.kitchen_echo
favorites:
  - name: Morning jazz
    media_content_id: morning jazz playlist
    media_content_type: AMAZON_MUSIC
  - name: Radio
    media_content_id: France Inter
    media_content_type: TUNEIN
  - name: Good night
    media_content_id: turn off the lights and play rain sounds
    media_content_type: custom
```

The do-not-disturb switch and the next alarm, timer and reminder sensors are found on the Echo's device (Alexa Media Player creates them; a disabled sensor is simply not shown).

### Apple TV and HomePod

The Apple TV shows the app playing, the episode and its apps as sources; `show_remote: true` adds the remote. A HomePod is a speaker:

| Apple TV | HomePod |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-apple-tv.png" alt="Apple TV with the remote" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-homepod.png" alt="HomePod" width="400"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-apple-tv-dark.png" alt="Apple TV with the remote dark" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-homepod-dark.png" alt="HomePod dark" width="400"> |

```yaml
type: custom:media-card
entity: media_player.living_room_apple_tv
show_remote: true
```

On the mini card, `show_remote: true` adds a remote button to the compact view; it opens the remote in a popup at the top of the card, which stays open while its keys are pressed:

| Compact view | Remote popup |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-apple-tv.png" alt="Mini card with the remote button" width="360"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-remote.png" alt="Remote popup of the mini card" width="360"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-apple-tv-dark.png" alt="Mini card with the remote button dark" width="360"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-remote-dark.png" alt="Remote popup of the mini card dark" width="360"> |

```yaml
type: custom:media-mini-card
entity: media_player.living_room_apple_tv
show_remote: true
```

### Drawn pictures

With no artwork, the card draws the device. Echo speakers and displays, HomePods and Apple TV boxes get a picture of their own, chosen from the **model** of their device in Home Assistant's device registry (tolerant: case, spacing and generation suffix do not matter); any other player keeps the speaker, TV or receiver picture of its `device_class`. These are original, stylized silhouettes of the general shape of each device, with no logo or brand. Only their lights move, and only while playing (a soft pulse, stopped by `prefers-reduced-motion`); the bodies follow the light or dark theme.

| Family | Models | Light |
|---|---|---|
| Cylinder | Echo (Gen1, Gen2), Echo Plus | cyan ring on top |
| Large cylinder | Echo Studio | light slit on top |
| Sphere | Echo Dot (Gen4, Gen5, Clock), Echo (Gen4) | cyan ring at the base |
| Puck | Echo Dot (Gen1 to Gen3) | cyan ring on top |
| Half sphere | Echo Pop | light bar on the front |
| Display | Echo Show 10, 15, Show (Gen1, Gen2) | screen and light bar |
| Small display | Echo Show 5, 8, Echo Spot | screen and light bar |
| Tall mesh speaker | HomePod, HomePod (gen 2) | violet halo on top |
| Small mesh speaker | HomePod Mini | violet top surface (seen from above in the full card, straight on in the mini card) |
| Streaming box | Apple TV, Apple TV 4K | blinking status light, a small screen with a play triangle while playing |

| | | | | |
|---|---|---|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/picture-echo.gif" alt="cylinder" width="170"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/picture-echo-studio.gif" alt="large cylinder" width="170"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/picture-echo-dot.gif" alt="sphere" width="170"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/picture-echo-dot-puck.gif" alt="puck" width="170"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/picture-echo-pop.gif" alt="half sphere" width="170"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/picture-echo-show.gif" alt="display" width="170"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/picture-echo-show-small.gif" alt="small display" width="170"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/picture-homepod.gif" alt="tall mesh speaker" width="170"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/picture-homepod-mini.gif" alt="small mesh speaker" width="170"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/picture-apple-tv.gif" alt="streaming box" width="170"> |

Each one has a dark twin (`picture-…-dark.gif`); the small mesh speaker straight on in the mini card: `picture-homepod-mini-front.gif`.

## Screenshots

All captures are rendered from mock data by `npm run screenshots`, each in the light and the dark theme.

### Animations

Each state plays its own animation, and every one of them honours `prefers-reduced-motion`.

While playing, the record slides out of its sleeve and turns behind the artwork, and the equalizer bars bounce:

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/playing.gif" alt="playing animation" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/playing-dark.gif" alt="playing animation dark" width="400"> |

Paused, the record stops and the equalizer glows slowly:

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/paused.gif" alt="paused animation" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/paused-dark.gif" alt="paused animation dark" width="400"> |

Buffering, a ring turns over the artwork:

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/buffering.gif" alt="buffering animation" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/buffering-dark.gif" alt="buffering animation dark" width="400"> |

A player with no artwork gets a drawn picture: the speaker's woofer beats and sound waves leave it while it plays:

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/speaker.gif" alt="speaker animation" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/speaker-dark.gif" alt="speaker animation dark" width="400"> |

A TV that is on glows (a receiver's level meter moves the same way):

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/tv.gif" alt="tv animation" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/tv-dark.gif" alt="tv animation dark" width="400"> |

The playing rooms of a group ring:

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/group.gif" alt="group animation" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/group-dark.gif" alt="group animation dark" width="400"> |

### Media Card

A Music Assistant group: the living room plays with the kitchen, the office and the bedroom can join; volume per room:

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card.png" alt="media card" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-dark.png" alt="media card dark" width="400"> |

The Music Assistant queue, current and next track:

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-queue.png" alt="queue" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-queue-dark.png" alt="queue dark" width="400"> |

A Sonos speaker: shuffle on, "Track 3 of 12", its sources and the Sonos favorites:

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-sonos.png" alt="sonos" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-sonos-dark.png" alt="sonos dark" width="400"> |

A receiver: no transport buttons (it has none), power, volume, sources and sound modes, its drawn picture:

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-receiver.png" alt="receiver" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-receiver-dark.png" alt="receiver dark" width="400"> |

**Ungroup all** asks first, in a popup at the top of the card:

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-ungroup.png" alt="ungroup confirmation" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-ungroup-dark.png" alt="ungroup confirmation dark" width="400"> |

### Media Mini Card

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card.png" alt="mini card" width="380"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-dark.png" alt="mini card dark" width="380"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-spotify.png" alt="mini card spotify" width="380"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-spotify-dark.png" alt="mini card spotify dark" width="380"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-tv.png" alt="mini card tv" width="380"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-tv-dark.png" alt="mini card tv dark" width="380"> |

The detail button (top right) shows the full card's content; a click outside the card brings the compact view back:

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-zoom.png" alt="mini card zoomed in" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-zoom-dark.png" alt="mini card zoomed in dark" width="400"> |

### Narrow widths

The full card at 6 columns of a phone's Sections view (the record and some spacing give way), and the mini card at 6 columns too (the controls move under the track, then the artwork gives way):

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-narrow.png" alt="narrow card" width="238"> <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-narrow.png" alt="narrow mini card" width="170"> | <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/card-narrow-dark.png" alt="narrow card dark" width="238"> <img src="https://raw.githubusercontent.com/juju35/ha-media-card/main/screenshots/mini-card-narrow-dark.png" alt="narrow mini card dark" width="170"> |

## How it works

What the card draws follows the `supported_features` of the player:

| Feature | What it adds |
|---|---|
| `PLAY`, `PAUSE`, `STOP` | Play / pause button (stop when the player cannot pause) |
| `PREVIOUS_TRACK`, `NEXT_TRACK` | Previous and next buttons |
| `SEEK` | Clickable progress bar, arrow keys |
| `SHUFFLE_SET`, `REPEAT_SET` | Shuffle and repeat buttons |
| `VOLUME_SET`, `VOLUME_STEP`, `VOLUME_MUTE` | Volume slider, or - / + buttons, and mute |
| `TURN_ON`, `TURN_OFF` | Power button (an off player only shows it) |
| `SELECT_SOURCE`, `SELECT_SOUND_MODE` | Source and sound mode chips |
| `GROUPING` | Rooms found by themselves, link buttons, Ungroup all |
| `PLAY_MEDIA` | Favorites |

The services called are the standard `media_player` ones (`media_play`, `media_pause`, `media_seek`, `volume_set`, `select_source`, `join`, `unjoin`, `play_media`…), plus `music_assistant.get_queue` for the queue. The progress moves with `media_position` and `media_position_updated_at`, without a request every second. The artwork is read from `entity_picture_local` (the Home Assistant proxy) or `entity_picture`.

## Development

```bash
npm install
npm run build        # bundles src/media-card.js into dist/media-card.js, translations split into dist/media-card.i18n.<lang>.js
npm run check        # builds and checks the card (run in CI)
npm test             # unit tests (node --test)
npm run screenshots  # renders the cards (and one GIF per animation, needs ffmpeg) with mock data into screenshots/
```

`dist/` is not committed: `npm run build` creates it locally, CI builds it on every push, and the release workflow attaches the built files to the release, which is where the Marketplace installs it from. The **Screenshots** workflow renders the captures on every pull request and commits the changed ones to its branch.

### Releasing

1. Bump `version` in `package.json` (and `package-lock.json`, `npm install`)
2. Add a `## <version>` section at the top of [CHANGELOG.md](https://github.com/juju35/ha-media-card/blob/main/CHANGELOG.md)
3. Push to `main`: the **Release** workflow builds the card, creates the tag and the GitHub release with the changelog section as notes, and attaches `media-card.js` and its translation files

## Translations

The cards auto-detect the language from your Home Assistant settings. Currently supported:

| Language | Code |
|---|---|
| English | `en` |
| Français | `fr` |
| Deutsch | `de` |
| Español | `es` |
| Српски | `sr` |
| Srpski (latinica) | `sr-Latn` |
| Italiano | `it` |
| Nederlands | `nl` |
| Português (European; also used for `pt-BR`) | `pt` |
| Polski | `pl` |
| Română | `ro` |
| Dansk | `da` |
| Svenska | `sv` |
| Български | `bg` |
| Русский | `ru` |
| Українська | `uk` |
| Magyar | `hu` |
| Slovenčina | `sk` |
| Čeština | `cs` |
| Slovenščina | `sl` |
| Latviešu | `lv` |
| Ελληνικά | `el` |

Contributions for additional languages are welcome!

## Credits

Sonos, Music Assistant, Squeezebox, Google Cast, AirPlay, Apple TV, HomePod and Spotify are trademarks of their respective owners. This project is not affiliated with any of them. Icons from [Material Design Icons](https://pictogrammers.com/library/mdi/); the artworks of the screenshots are drawn for them.

## License

[MIT](https://github.com/juju35/ha-media-card/blob/main/LICENSE)

## Support

If you find this project useful, you can support its development:

<a href="https://buymeacoffee.com/julienstep9"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" height="50"></a>
