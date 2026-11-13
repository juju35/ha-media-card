/*
 * Media Card for Home Assistant
 * https://github.com/juju35/ha-media-card
 *
 * Lovelace cards for media players and multiroom speakers, whatever the integration: Sonos, Music Assistant,
 * Squeezebox (Lyrion Music Server), Google Cast, AirPlay (Apple TV, Music Assistant), Spotify and any other
 * `media_player` entity. What the card offers follows the `supported_features` of each player: a button the
 * player cannot take is not drawn.
 */

const VERSION = "__VERSION__";

// MediaPlayerEntityFeature (homeassistant/components/media_player/const.py)
const F = {
  PAUSE: 1,
  SEEK: 2,
  VOLUME_SET: 4,
  VOLUME_MUTE: 8,
  PREVIOUS_TRACK: 16,
  NEXT_TRACK: 32,
  TURN_ON: 128,
  TURN_OFF: 256,
  PLAY_MEDIA: 512,
  VOLUME_STEP: 1024,
  SELECT_SOURCE: 2048,
  STOP: 4096,
  PLAY: 16384,
  SHUFFLE_SET: 32768,
  SELECT_SOUND_MODE: 65536,
  REPEAT_SET: 262144,
  GROUPING: 524288,
};

const ICONS = {
  play: "M8,5.14V19.14L19,12.14L8,5.14Z",
  pause: "M14,19H18V5H14M6,19H10V5H6V19Z",
  stop: "M18,18H6V6H18V18Z",
  next: "M16,18H18V6H16M6,18L14.5,12L6,6V18Z",
  previous: "M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z",
  shuffle:
    "M17,3L22.25,7.5L17,12L22.25,16.5L17,21V18H14.26L11.44,15.18L13.56,13.06L15.5,15H17V12L17,9H15.5L6.5,18H2V15H5.26L14.26,6H17V3M2,6H6.5L9.32,8.82L7.2,10.94L5.26,9H2V6Z",
  repeat: "M17,17H7V14L3,18L7,22V19H19V13H17M7,7H17V10L21,6L17,2V5H5V11H7V7Z",
  repeat_one: "M13,15V9H12L10,10V11H11.5V15M17,17H7V14L3,18L7,22V19H19V13H17M7,7H17V10L21,6L17,2V5H5V11H7V7Z",
  volume:
    "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z",
  muted:
    "M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z",
  volume_down: "M3,9H7L12,4V20L7,15H3V9M14,11H22V13H14V11Z",
  volume_up: "M3,9H7L12,4V20L7,15H3V9M14,11H17V8H19V11H22V13H19V16H17V13H14V11Z",
  power:
    "M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44C5.36,6.88 4,9.28 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,9.28 18.64,6.88 16.56,5.44M13,3H11V13H13",
  speaker:
    "M12,12A3,3 0 0,0 9,15A3,3 0 0,0 12,18A3,3 0 0,0 15,15A3,3 0 0,0 12,12M12,20A5,5 0 0,1 7,15A5,5 0 0,1 12,10A5,5 0 0,1 17,15A5,5 0 0,1 12,20M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8C10.89,8 10,7.1 10,6C10,4.89 10.89,4 12,4M17,2H7C5.89,2 5,2.89 5,4V20A2,2 0 0,0 7,22H17A2,2 0 0,0 19,20V4C19,2.89 18.1,2 17,2Z",
  speakers:
    "M14,10A3,3 0 0,0 11,13A3,3 0 0,0 14,16A3,3 0 0,0 17,13A3,3 0 0,0 14,10M14,18A5,5 0 0,1 9,13A5,5 0 0,1 14,8A5,5 0 0,1 19,13A5,5 0 0,1 14,18M14,2A2,2 0 0,1 16,4A2,2 0 0,1 14,6A2,2 0 0,1 12,4A2,2 0 0,1 14,2M19,0H9A2,2 0 0,0 7,2V18A2,2 0 0,0 9,20H19A2,2 0 0,0 21,18V2A2,2 0 0,0 19,0M5,22H17V24H5A2,2 0 0,1 3,22V4H5V22Z",
  tv: "M21,17H3V5H21M21,3H3A2,2 0 0,0 1,5V17A2,2 0 0,0 3,19H8V21H16V19H21A2,2 0 0,0 23,17V5A2,2 0 0,0 21,3Z",
  // Receiver: a box with a display and a knob (holes wound the other way).
  receiver: "M3,7H21A1,1 0 0,1 22,8V16A1,1 0 0,1 21,17H3A1,1 0 0,1 2,16V8A1,1 0 0,1 3,7ZM5,10V14H11V10ZM17,10A2,2 0 1,0 17,14A2,2 0 1,0 17,10Z",
  music:
    "M21,3V15.5A3.5,3.5 0 0,1 17.5,19A3.5,3.5 0 0,1 14,15.5A3.5,3.5 0 0,1 17.5,12C18.04,12 18.55,12.12 19,12.34V6.47L9,8.6V17.5A3.5,3.5 0 0,1 5.5,21A3.5,3.5 0 0,1 2,17.5A3.5,3.5 0 0,1 5.5,14C6.04,14 6.55,14.12 7,14.34V6L21,3Z",
  album:
    "M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M12,16.5C9.5,16.5 7.5,14.5 7.5,12C7.5,9.5 9.5,7.5 12,7.5C14.5,7.5 16.5,9.5 16.5,12C16.5,14.5 14.5,16.5 12,16.5M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",
  link: "M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z",
  queue: "M15,6H3V8H15V6M15,10H3V12H15V10M3,16H11V14H3V16M17,6V14.18C16.69,14.07 16.35,14 16,14A3,3 0 0,0 13,17A3,3 0 0,0 16,20A3,3 0 0,0 19,17V8H22V6H17Z",
  star: "M12,17.27L18.18,21L16.54,13.64L22,8.27L14.81,7.62L12,1L9.19,7.62L2,8.27L7.45,13.64L5.82,21L12,17.27Z",
  source: "M14,12L10,8V11H2V13H10V16M20,18V6C20,4.89 19.1,4 18,4H6A2,2 0 0,0 4,6V9H6V6H18V18H6V15H4V18A2,2 0 0,0 6,20H18A2,2 0 0,0 20,18Z",
  sound_mode: "M10,20H14V4H10V20M4,20H8V12H4V20M16,9V20H20V9H16Z",
  close: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
  // mdi:alarm, mdi:timer-outline, mdi:bell-outline, mdi:minus-circle-outline (Alexa)
  alarm:
    "M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22A9,9 0 0,0 21,13A9,9 0 0,0 12,4M12.5,8H11V14L15.75,16.85L16.5,15.62L12.5,13.25V8M7.88,3.39L6.6,1.86L2,5.71L3.29,7.24L7.88,3.39M22,5.72L17.4,1.86L16.11,3.39L20.71,7.25L22,5.72Z",
  timer:
    "M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M19.03,7.39L20.45,5.97C20,5.46 19.55,5 19.04,4.56L17.62,6C16.07,4.74 14.12,4 12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22C17,22 21,17.97 21,13C21,10.88 20.26,8.93 19.03,7.39M11,14H13V8H11M15,1H9V3H15V1Z",
  reminder:
    "M10,21H14A2,2 0 0,1 12,23A2,2 0 0,1 10,21M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M17,11A5,5 0 0,0 12,6A5,5 0 0,0 7,11V18H17V11Z",
  dnd: "M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7,13H17V11H7",
  // Apple TV remote: mdi:remote, mdi:chevron-up / -left, mdi:circle-outline, mdi:home-outline, mdi:play-pause
  remote:
    "M12,0C8.96,0 6.21,1.23 4.22,3.22L5.63,4.63C7.26,3 9.5,2 12,2C14.5,2 16.74,3 18.36,4.64L19.77,3.23C17.79,1.23 15.04,0 12,0M7.05,6.05L8.46,7.46C9.37,6.56 10.62,6 12,6C13.38,6 14.63,6.56 15.54,7.46L16.95,6.05C15.68,4.78 13.93,4 12,4C10.07,4 8.32,4.78 7.05,6.05M12,15A2,2 0 0,1 10,13A2,2 0 0,1 12,11A2,2 0 0,1 14,13A2,2 0 0,1 12,15M15,9H9A1,1 0 0,0 8,10V22A1,1 0 0,0 9,23H15A1,1 0 0,0 16,22V10A1,1 0 0,0 15,9Z",
  chevron_up: "M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z",
  chevron_left: "M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z",
  select: "M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",
  home: "M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69M12 3L2 12H5V20H11V14H13V20H19V12H22L12 3Z",
  play_pause: "M3,5V19L11,12M13,19H16V5H13M18,5V19H21V5",
  chevron_down: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",
  chevron_right: "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z",
  back: "M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z",
  // mdi:arrow-expand and mdi:arrow-collapse (mini card detail button)
  expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
  collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
};

// Integrations the card knows by name (subtitle, queue, favorites); any other media_player works the same way.
const PLATFORMS = {
  sonos: "Sonos",
  music_assistant: "Music Assistant",
  squeezebox: "Squeezebox",
  cast: "Google Cast",
  apple_tv: "Apple TV",
  spotify: "Spotify",
  bluesound: "Bluesound",
  heos: "HEOS",
  linkplay: "LinkPlay",
  yamaha_musiccast: "MusicCast",
  snapcast: "Snapcast",
  denonavr: "Denon AVR",
  plex: "Plex",
  jellyfin: "Jellyfin",
  kodi: "Kodi",
  dlna_dmr: "DLNA",
};

const SECTIONS = ["rooms", "source", "queue", "favorites", "remote"];
const DEFAULT_COLLAPSED = ["source", "queue", "favorites"];
// A join / unjoin only shows in group_members on the integration's next update: the requested membership is shown
// meanwhile, until the player reports it or the delay runs out.
const PENDING_MS = 15000;
const CONFIRM_GUARD_MS = 400;

const STRINGS = {
  en: {
    st_playing: "Playing", st_paused: "Paused", st_idle: "Idle", st_on: "On", st_off: "Off", st_standby: "Standby", st_buffering: "Buffering", st_unavailable: "Unavailable", st_unknown: "Unknown",
    play: "Play", pause: "Pause", stop: "Stop", next: "Next track", previous: "Previous track", shuffle: "Shuffle", repeat_off: "Repeat off", repeat_all: "Repeat all", repeat_one: "Repeat one",
    mute: "Mute", unmute: "Unmute", volume: "Volume", volume_down: "Volume down", volume_up: "Volume up", power: "Turn on or off", seek: "Position",
    nothing_playing: "Nothing playing", source: "Source", sound_mode: "Sound mode", rooms: "Rooms", join: "Add {name} to the group", leave: "Remove {name} from the group",
    grouped: "With {names}", ungroup_all: "Ungroup all", confirm_ungroup: "Remove every speaker from the group of {name}?", queue: "Queue", now_playing: "Now playing", up_next: "Up next",
    queue_loading: "Loading the queue…", queue_empty: "Nothing in the queue.", queue_error: "Could not get the queue.", queue_count: "Tracks in the queue: {n}", favorites: "Favorites",
    play_favorite: "Play {name}", track_of: "Track {n} of {total}", show_player: "Show {name}", cancel: "Cancel", no_player: "No media player found.", unknown_entity: "Media player not found",
    zoom_in: "Show details", zoom_out: "Show less",
    entity: "Media player", entities: "Rooms (other players, optional)", title: "Title (optional, defaults to the player name)", show_title: "Show title", show_subtitle: "Show subtitle",
    show_background: "Blurred artwork background", show_progress: "Show progress", show_controls: "Show control buttons", show_volume: "Show volume", show_rooms: "Show rooms and groups",
    show_source: "Show source and sound mode", show_queue: "Show queue", show_favorites: "Show favorites", collapsed: "Sections folded by default", favorites_entity: "Favorites sensor (Sonos)",
    zoom: "Detail button", zoom_helper: "Top right button: switches to the full card and back", language: "Language", lang_auto: "Automatic (Home Assistant language)",
    media: "Media", players: "Players (several, stacked in the card)", players_helper: "Two or more: one block per player, one under the other", only_playing: "Only the players that are playing", include_paused: "Paused players too", n_playing: "{n} playing", players_count: "{n} players", more_players: "{n} more: {names}", back: "Back to all players",
    movie: "Movie", last_called: "Last called", next_alarm: "Alarm", next_timer: "Timer", next_reminder: "Reminder", dnd: "Do not disturb", speaker_group: "Speaker group", hide_idle_sessions: "Hide idle Jellyfin sessions",
    remote: "Remote", r_up: "Up", r_down: "Down", r_left: "Left", r_right: "Right", r_select: "Select", r_menu: "Menu", r_home: "Home", r_play_pause: "Play / pause", show_remote: "Show the remote (Apple TV)",
  },
  fr: {
    st_playing: "Lecture", st_paused: "En pause", st_idle: "Inactif", st_on: "Allumé", st_off: "Éteint", st_standby: "Veille", st_buffering: "Chargement", st_unavailable: "Indisponible", st_unknown: "Inconnu",
    play: "Lecture", pause: "Pause", stop: "Arrêt", next: "Piste suivante", previous: "Piste précédente", shuffle: "Aléatoire", repeat_off: "Sans répétition", repeat_all: "Tout répéter", repeat_one: "Répéter le titre",
    mute: "Couper le son", unmute: "Rétablir le son", volume: "Volume", volume_down: "Baisser le volume", volume_up: "Monter le volume", power: "Allumer ou éteindre", seek: "Position",
    nothing_playing: "Aucune lecture", source: "Source", sound_mode: "Mode son", rooms: "Pièces", join: "Ajouter {name} au groupe", leave: "Retirer {name} du groupe",
    grouped: "Avec {names}", ungroup_all: "Tout dégrouper", confirm_ungroup: "Retirer toutes les enceintes du groupe de {name} ?", queue: "File d'attente", now_playing: "En cours", up_next: "À suivre",
    queue_loading: "Chargement de la file d'attente…", queue_empty: "La file d'attente est vide.", queue_error: "Impossible de lire la file d'attente.", queue_count: "Titres dans la file : {n}", favorites: "Favoris",
    play_favorite: "Lire {name}", track_of: "Piste {n} sur {total}", show_player: "Afficher {name}", cancel: "Annuler", no_player: "Aucun lecteur multimédia trouvé.", unknown_entity: "Lecteur multimédia introuvable",
    zoom_in: "Afficher le détail", zoom_out: "Réduire",
    entity: "Lecteur multimédia", entities: "Pièces (autres lecteurs, facultatif)", title: "Titre (facultatif, nom du lecteur par défaut)", show_title: "Afficher le titre", show_subtitle: "Afficher le sous-titre",
    show_background: "Fond flouté de la pochette", show_progress: "Afficher la progression", show_controls: "Afficher les boutons de commande", show_volume: "Afficher le volume", show_rooms: "Afficher les pièces et groupes",
    show_source: "Afficher la source et le mode son", show_queue: "Afficher la file d'attente", show_favorites: "Afficher les favoris", collapsed: "Sections repliées par défaut", favorites_entity: "Capteur des favoris (Sonos)",
    zoom: "Bouton détail", zoom_helper: "Bouton en haut à droite : bascule vers la carte complète et revient", language: "Langue", lang_auto: "Automatique (langue de Home Assistant)",
    media: "Médias", players: "Lecteurs (plusieurs, empilés dans la carte)", players_helper: "Deux ou plus : un bloc par lecteur, l'un sous l'autre", only_playing: "Seulement les lecteurs en lecture", include_paused: "Les lecteurs en pause aussi", n_playing: "{n} en lecture", players_count: "{n} lecteurs", more_players: "{n} de plus : {names}", back: "Retour à tous les lecteurs",
    movie: "Film", last_called: "Dernier appelé", next_alarm: "Alarme", next_timer: "Minuteur", next_reminder: "Rappel", dnd: "Ne pas déranger", speaker_group: "Groupe d'enceintes", hide_idle_sessions: "Masquer les sessions Jellyfin inactives",
    remote: "Télécommande", r_up: "Haut", r_down: "Bas", r_left: "Gauche", r_right: "Droite", r_select: "Valider", r_menu: "Menu", r_home: "Accueil", r_play_pause: "Lecture / pause", show_remote: "Afficher la télécommande (Apple TV)",
  },
  de: {
    st_playing: "Wiedergabe", st_paused: "Pausiert", st_idle: "Untätig", st_on: "An", st_off: "Aus", st_standby: "Standby", st_buffering: "Puffern", st_unavailable: "Nicht verfügbar", st_unknown: "Unbekannt",
    play: "Abspielen", pause: "Pause", stop: "Stopp", next: "Nächster Titel", previous: "Vorheriger Titel", shuffle: "Zufallswiedergabe", repeat_off: "Wiederholen aus", repeat_all: "Alle wiederholen", repeat_one: "Titel wiederholen",
    mute: "Stumm", unmute: "Ton an", volume: "Lautstärke", volume_down: "Leiser", volume_up: "Lauter", power: "Ein- oder ausschalten", seek: "Position",
    nothing_playing: "Keine Wiedergabe", source: "Quelle", sound_mode: "Klangmodus", rooms: "Räume", join: "{name} zur Gruppe hinzufügen", leave: "{name} aus der Gruppe entfernen",
    grouped: "Mit {names}", ungroup_all: "Gruppe auflösen", confirm_ungroup: "Alle Lautsprecher aus der Gruppe von {name} entfernen?", queue: "Warteschlange", now_playing: "Läuft gerade", up_next: "Als Nächstes",
    queue_loading: "Warteschlange wird geladen…", queue_empty: "Die Warteschlange ist leer.", queue_error: "Warteschlange konnte nicht geladen werden.", queue_count: "Titel in der Warteschlange: {n}", favorites: "Favoriten",
    play_favorite: "{name} abspielen", track_of: "Titel {n} von {total}", show_player: "{name} anzeigen", cancel: "Abbrechen", no_player: "Kein Mediaplayer gefunden.", unknown_entity: "Mediaplayer nicht gefunden",
    zoom_in: "Details anzeigen", zoom_out: "Weniger anzeigen",
    entity: "Mediaplayer", entities: "Räume (weitere Player, optional)", title: "Titel (optional, standardmäßig der Playername)", show_title: "Titel anzeigen", show_subtitle: "Untertitel anzeigen",
    show_background: "Unscharfer Cover-Hintergrund", show_progress: "Fortschritt anzeigen", show_controls: "Steuertasten anzeigen", show_volume: "Lautstärke anzeigen", show_rooms: "Räume und Gruppen anzeigen",
    show_source: "Quelle und Klangmodus anzeigen", show_queue: "Warteschlange anzeigen", show_favorites: "Favoriten anzeigen", collapsed: "Standardmäßig eingeklappte Abschnitte", favorites_entity: "Favoriten-Sensor (Sonos)",
    zoom: "Detailtaste", zoom_helper: "Taste oben rechts: wechselt zur vollständigen Karte und zurück", language: "Sprache", lang_auto: "Automatisch (Sprache von Home Assistant)",
    media: "Medien", players: "Player (mehrere, in der Karte gestapelt)", players_helper: "Zwei oder mehr: ein Block pro Player, untereinander", only_playing: "Nur Player, die gerade abspielen", include_paused: "Auch pausierte Player", n_playing: "{n} spielen", players_count: "{n} Player", more_players: "{n} weitere: {names}", back: "Zurück zu allen Playern",
    movie: "Film", last_called: "Zuletzt angesprochen", next_alarm: "Wecker", next_timer: "Timer", next_reminder: "Erinnerung", dnd: "Nicht stören", speaker_group: "Lautsprechergruppe", hide_idle_sessions: "Inaktive Jellyfin-Sitzungen ausblenden",
    remote: "Fernbedienung", r_up: "Hoch", r_down: "Runter", r_left: "Links", r_right: "Rechts", r_select: "Auswählen", r_menu: "Menü", r_home: "Home", r_play_pause: "Wiedergabe / Pause", show_remote: "Fernbedienung anzeigen (Apple TV)",
  },
  es: {
    st_playing: "Reproduciendo", st_paused: "En pausa", st_idle: "Inactivo", st_on: "Encendido", st_off: "Apagado", st_standby: "En espera", st_buffering: "Cargando", st_unavailable: "No disponible", st_unknown: "Desconocido",
    play: "Reproducir", pause: "Pausa", stop: "Detener", next: "Pista siguiente", previous: "Pista anterior", shuffle: "Aleatorio", repeat_off: "Sin repetición", repeat_all: "Repetir todo", repeat_one: "Repetir una",
    mute: "Silenciar", unmute: "Activar sonido", volume: "Volumen", volume_down: "Bajar volumen", volume_up: "Subir volumen", power: "Encender o apagar", seek: "Posición",
    nothing_playing: "Nada en reproducción", source: "Fuente", sound_mode: "Modo de sonido", rooms: "Habitaciones", join: "Añadir {name} al grupo", leave: "Quitar {name} del grupo",
    grouped: "Con {names}", ungroup_all: "Desagrupar todo", confirm_ungroup: "¿Quitar todos los altavoces del grupo de {name}?", queue: "Cola", now_playing: "Sonando ahora", up_next: "A continuación",
    queue_loading: "Cargando la cola…", queue_empty: "La cola está vacía.", queue_error: "No se pudo obtener la cola.", queue_count: "Pistas en la cola: {n}", favorites: "Favoritos",
    play_favorite: "Reproducir {name}", track_of: "Pista {n} de {total}", show_player: "Mostrar {name}", cancel: "Cancelar", no_player: "No se encontró ningún reproductor multimedia.", unknown_entity: "Reproductor multimedia no encontrado",
    zoom_in: "Ver detalles", zoom_out: "Ver menos",
    entity: "Reproductor multimedia", entities: "Habitaciones (otros reproductores, opcional)", title: "Título (opcional, por defecto el nombre del reproductor)", show_title: "Mostrar título", show_subtitle: "Mostrar subtítulo",
    show_background: "Fondo difuminado de la carátula", show_progress: "Mostrar progreso", show_controls: "Mostrar botones de control", show_volume: "Mostrar volumen", show_rooms: "Mostrar habitaciones y grupos",
    show_source: "Mostrar fuente y modo de sonido", show_queue: "Mostrar cola", show_favorites: "Mostrar favoritos", collapsed: "Secciones plegadas por defecto", favorites_entity: "Sensor de favoritos (Sonos)",
    zoom: "Botón de detalle", zoom_helper: "Botón arriba a la derecha: cambia a la tarjeta completa y vuelve", language: "Idioma", lang_auto: "Automático (idioma de Home Assistant)",
    media: "Multimedia", players: "Reproductores (varios, apilados en la tarjeta)", players_helper: "Dos o más: un bloque por reproductor, uno debajo de otro", only_playing: "Solo los reproductores en reproducción", include_paused: "También los reproductores en pausa", n_playing: "{n} reproduciendo", players_count: "{n} reproductores", more_players: "{n} más: {names}", back: "Volver a todos los reproductores",
    movie: "Película", last_called: "Último llamado", next_alarm: "Alarma", next_timer: "Temporizador", next_reminder: "Recordatorio", dnd: "No molestar", speaker_group: "Grupo de altavoces", hide_idle_sessions: "Ocultar sesiones de Jellyfin inactivas",
    remote: "Mando", r_up: "Arriba", r_down: "Abajo", r_left: "Izquierda", r_right: "Derecha", r_select: "Seleccionar", r_menu: "Menú", r_home: "Inicio", r_play_pause: "Reproducir / pausa", show_remote: "Mostrar el mando (Apple TV)",
  },
  it: {
    st_playing: "In riproduzione", st_paused: "In pausa", st_idle: "Inattivo", st_on: "Acceso", st_off: "Spento", st_standby: "Standby", st_buffering: "Caricamento", st_unavailable: "Non disponibile", st_unknown: "Sconosciuto",
    play: "Riproduci", pause: "Pausa", stop: "Stop", next: "Brano successivo", previous: "Brano precedente", shuffle: "Casuale", repeat_off: "Ripetizione disattivata", repeat_all: "Ripeti tutto", repeat_one: "Ripeti brano",
    mute: "Disattiva audio", unmute: "Riattiva audio", volume: "Volume", volume_down: "Abbassa volume", volume_up: "Alza volume", power: "Accendi o spegni", seek: "Posizione",
    nothing_playing: "Nessuna riproduzione", source: "Sorgente", sound_mode: "Modalità audio", rooms: "Stanze", join: "Aggiungi {name} al gruppo", leave: "Rimuovi {name} dal gruppo",
    grouped: "Con {names}", ungroup_all: "Separa tutto", confirm_ungroup: "Rimuovere tutti gli altoparlanti dal gruppo di {name}?", queue: "Coda", now_playing: "In ascolto", up_next: "Prossimo",
    queue_loading: "Caricamento della coda…", queue_empty: "La coda è vuota.", queue_error: "Impossibile leggere la coda.", queue_count: "Brani in coda: {n}", favorites: "Preferiti",
    play_favorite: "Riproduci {name}", track_of: "Brano {n} di {total}", show_player: "Mostra {name}", cancel: "Annulla", no_player: "Nessun lettore multimediale trovato.", unknown_entity: "Lettore multimediale non trovato",
    zoom_in: "Mostra dettagli", zoom_out: "Mostra meno",
    entity: "Lettore multimediale", entities: "Stanze (altri lettori, facoltativo)", title: "Titolo (facoltativo, predefinito il nome del lettore)", show_title: "Mostra titolo", show_subtitle: "Mostra sottotitolo",
    show_background: "Sfondo sfocato della copertina", show_progress: "Mostra avanzamento", show_controls: "Mostra pulsanti di controllo", show_volume: "Mostra volume", show_rooms: "Mostra stanze e gruppi",
    show_source: "Mostra sorgente e modalità audio", show_queue: "Mostra coda", show_favorites: "Mostra preferiti", collapsed: "Sezioni chiuse per impostazione predefinita", favorites_entity: "Sensore dei preferiti (Sonos)",
    zoom: "Pulsante dettagli", zoom_helper: "Pulsante in alto a destra: passa alla scheda completa e ritorna", language: "Lingua", lang_auto: "Automatica (lingua di Home Assistant)",
    media: "Media", players: "Lettori (più lettori, impilati nella scheda)", players_helper: "Due o più: un blocco per lettore, uno sotto l'altro", only_playing: "Solo i lettori in riproduzione", include_paused: "Anche i lettori in pausa", n_playing: "{n} in riproduzione", players_count: "{n} lettori", more_players: "Altri {n}: {names}", back: "Torna a tutti i lettori",
    movie: "Film", last_called: "Ultimo chiamato", next_alarm: "Sveglia", next_timer: "Timer", next_reminder: "Promemoria", dnd: "Non disturbare", speaker_group: "Gruppo di altoparlanti", hide_idle_sessions: "Nascondi le sessioni Jellyfin inattive",
    remote: "Telecomando", r_up: "Su", r_down: "Giù", r_left: "Sinistra", r_right: "Destra", r_select: "Seleziona", r_menu: "Menu", r_home: "Home", r_play_pause: "Riproduci / pausa", show_remote: "Mostra il telecomando (Apple TV)",
  },
  nl: {
    st_playing: "Speelt af", st_paused: "Gepauzeerd", st_idle: "Inactief", st_on: "Aan", st_off: "Uit", st_standby: "Stand-by", st_buffering: "Bufferen", st_unavailable: "Niet beschikbaar", st_unknown: "Onbekend",
    play: "Afspelen", pause: "Pauze", stop: "Stop", next: "Volgend nummer", previous: "Vorig nummer", shuffle: "Willekeurig", repeat_off: "Herhalen uit", repeat_all: "Alles herhalen", repeat_one: "Nummer herhalen",
    mute: "Dempen", unmute: "Geluid aan", volume: "Volume", volume_down: "Zachter", volume_up: "Harder", power: "Aan- of uitzetten", seek: "Positie",
    nothing_playing: "Er speelt niets", source: "Bron", sound_mode: "Geluidsmodus", rooms: "Ruimtes", join: "{name} aan de groep toevoegen", leave: "{name} uit de groep halen",
    grouped: "Met {names}", ungroup_all: "Groep opheffen", confirm_ungroup: "Alle speakers uit de groep van {name} halen?", queue: "Wachtrij", now_playing: "Nu aan het spelen", up_next: "Hierna",
    queue_loading: "Wachtrij laden…", queue_empty: "De wachtrij is leeg.", queue_error: "Kon de wachtrij niet ophalen.", queue_count: "Nummers in de wachtrij: {n}", favorites: "Favorieten",
    play_favorite: "{name} afspelen", track_of: "Nummer {n} van {total}", show_player: "{name} tonen", cancel: "Annuleren", no_player: "Geen mediaspeler gevonden.", unknown_entity: "Mediaspeler niet gevonden",
    zoom_in: "Details tonen", zoom_out: "Minder tonen",
    entity: "Mediaspeler", entities: "Ruimtes (andere spelers, optioneel)", title: "Titel (optioneel, standaard de naam van de speler)", show_title: "Titel tonen", show_subtitle: "Ondertitel tonen",
    show_background: "Vervaagde hoesachtergrond", show_progress: "Voortgang tonen", show_controls: "Bedieningsknoppen tonen", show_volume: "Volume tonen", show_rooms: "Ruimtes en groepen tonen",
    show_source: "Bron en geluidsmodus tonen", show_queue: "Wachtrij tonen", show_favorites: "Favorieten tonen", collapsed: "Standaard ingeklapte secties", favorites_entity: "Favorietensensor (Sonos)",
    zoom: "Detailknop", zoom_helper: "Knop rechtsboven: schakelt naar de volledige kaart en terug", language: "Taal", lang_auto: "Automatisch (taal van Home Assistant)",
    media: "Media", players: "Spelers (meerdere, gestapeld in de kaart)", players_helper: "Twee of meer: één blok per speler, onder elkaar", only_playing: "Alleen spelers die afspelen", include_paused: "Ook gepauzeerde spelers", n_playing: "{n} spelen af", players_count: "{n} spelers", more_players: "Nog {n}: {names}", back: "Terug naar alle spelers",
    movie: "Film", last_called: "Laatst aangesproken", next_alarm: "Wekker", next_timer: "Timer", next_reminder: "Herinnering", dnd: "Niet storen", speaker_group: "Speakergroep", hide_idle_sessions: "Inactieve Jellyfin-sessies verbergen",
    remote: "Afstandsbediening", r_up: "Omhoog", r_down: "Omlaag", r_left: "Links", r_right: "Rechts", r_select: "Selecteren", r_menu: "Menu", r_home: "Home", r_play_pause: "Afspelen / pauze", show_remote: "Afstandsbediening tonen (Apple TV)",
  },
  pt: {
    st_playing: "A reproduzir", st_paused: "Em pausa", st_idle: "Inativo", st_on: "Ligado", st_off: "Desligado", st_standby: "Em espera", st_buffering: "A carregar", st_unavailable: "Indisponível", st_unknown: "Desconhecido",
    play: "Reproduzir", pause: "Pausa", stop: "Parar", next: "Faixa seguinte", previous: "Faixa anterior", shuffle: "Aleatório", repeat_off: "Sem repetição", repeat_all: "Repetir tudo", repeat_one: "Repetir faixa",
    mute: "Silenciar", unmute: "Ativar som", volume: "Volume", volume_down: "Diminuir volume", volume_up: "Aumentar volume", power: "Ligar ou desligar", seek: "Posição",
    nothing_playing: "Nada em reprodução", source: "Fonte", sound_mode: "Modo de som", rooms: "Divisões", join: "Adicionar {name} ao grupo", leave: "Retirar {name} do grupo",
    grouped: "Com {names}", ungroup_all: "Desagrupar tudo", confirm_ungroup: "Retirar todas as colunas do grupo de {name}?", queue: "Fila", now_playing: "A tocar agora", up_next: "A seguir",
    queue_loading: "A carregar a fila…", queue_empty: "A fila está vazia.", queue_error: "Não foi possível obter a fila.", queue_count: "Faixas na fila: {n}", favorites: "Favoritos",
    play_favorite: "Reproduzir {name}", track_of: "Faixa {n} de {total}", show_player: "Mostrar {name}", cancel: "Cancelar", no_player: "Nenhum leitor multimédia encontrado.", unknown_entity: "Leitor multimédia não encontrado",
    zoom_in: "Ver detalhes", zoom_out: "Ver menos",
    entity: "Leitor multimédia", entities: "Divisões (outros leitores, opcional)", title: "Título (opcional, por omissão o nome do leitor)", show_title: "Mostrar título", show_subtitle: "Mostrar subtítulo",
    show_background: "Fundo desfocado da capa", show_progress: "Mostrar progresso", show_controls: "Mostrar botões de controlo", show_volume: "Mostrar volume", show_rooms: "Mostrar divisões e grupos",
    show_source: "Mostrar fonte e modo de som", show_queue: "Mostrar fila", show_favorites: "Mostrar favoritos", collapsed: "Secções recolhidas por omissão", favorites_entity: "Sensor de favoritos (Sonos)",
    zoom: "Botão de detalhe", zoom_helper: "Botão no canto superior direito: muda para o cartão completo e volta", language: "Idioma", lang_auto: "Automático (idioma do Home Assistant)",
    media: "Multimédia", players: "Leitores (vários, empilhados no cartão)", players_helper: "Dois ou mais: um bloco por leitor, um por baixo do outro", only_playing: "Só os leitores em reprodução", include_paused: "Também os leitores em pausa", n_playing: "{n} a reproduzir", players_count: "{n} leitores", more_players: "Mais {n}: {names}", back: "Voltar a todos os leitores",
    movie: "Filme", last_called: "Último chamado", next_alarm: "Alarme", next_timer: "Temporizador", next_reminder: "Lembrete", dnd: "Não incomodar", speaker_group: "Grupo de colunas", hide_idle_sessions: "Ocultar sessões Jellyfin inativas",
    remote: "Comando", r_up: "Cima", r_down: "Baixo", r_left: "Esquerda", r_right: "Direita", r_select: "Selecionar", r_menu: "Menu", r_home: "Início", r_play_pause: "Reproduzir / pausa", show_remote: "Mostrar o comando (Apple TV)",
  },
  pl: {
    st_playing: "Odtwarzanie", st_paused: "Wstrzymano", st_idle: "Bezczynny", st_on: "Włączony", st_off: "Wyłączony", st_standby: "Czuwanie", st_buffering: "Buforowanie", st_unavailable: "Niedostępny", st_unknown: "Nieznany",
    play: "Odtwórz", pause: "Pauza", stop: "Zatrzymaj", next: "Następny utwór", previous: "Poprzedni utwór", shuffle: "Losowo", repeat_off: "Bez powtarzania", repeat_all: "Powtarzaj wszystko", repeat_one: "Powtarzaj utwór",
    mute: "Wycisz", unmute: "Włącz dźwięk", volume: "Głośność", volume_down: "Ciszej", volume_up: "Głośniej", power: "Włącz lub wyłącz", seek: "Pozycja",
    nothing_playing: "Nic nie jest odtwarzane", source: "Źródło", sound_mode: "Tryb dźwięku", rooms: "Pomieszczenia", join: "Dodaj {name} do grupy", leave: "Usuń {name} z grupy",
    grouped: "Z: {names}", ungroup_all: "Rozgrupuj wszystko", confirm_ungroup: "Usunąć wszystkie głośniki z grupy {name}?", queue: "Kolejka", now_playing: "Teraz odtwarzane", up_next: "Następne",
    queue_loading: "Wczytywanie kolejki…", queue_empty: "Kolejka jest pusta.", queue_error: "Nie udało się pobrać kolejki.", queue_count: "Utwory w kolejce: {n}", favorites: "Ulubione",
    play_favorite: "Odtwórz {name}", track_of: "Utwór {n} z {total}", show_player: "Pokaż {name}", cancel: "Anuluj", no_player: "Nie znaleziono odtwarzacza multimediów.", unknown_entity: "Nie znaleziono odtwarzacza multimediów",
    zoom_in: "Pokaż szczegóły", zoom_out: "Pokaż mniej",
    entity: "Odtwarzacz multimediów", entities: "Pomieszczenia (inne odtwarzacze, opcjonalnie)", title: "Tytuł (opcjonalny, domyślnie nazwa odtwarzacza)", show_title: "Pokaż tytuł", show_subtitle: "Pokaż podtytuł",
    show_background: "Rozmyte tło z okładki", show_progress: "Pokaż postęp", show_controls: "Pokaż przyciski sterowania", show_volume: "Pokaż głośność", show_rooms: "Pokaż pomieszczenia i grupy",
    show_source: "Pokaż źródło i tryb dźwięku", show_queue: "Pokaż kolejkę", show_favorites: "Pokaż ulubione", collapsed: "Sekcje domyślnie zwinięte", favorites_entity: "Czujnik ulubionych (Sonos)",
    zoom: "Przycisk szczegółów", zoom_helper: "Przycisk w prawym górnym rogu: przełącza na pełną kartę i z powrotem", language: "Język", lang_auto: "Automatycznie (język Home Assistant)",
    media: "Multimedia", players: "Odtwarzacze (kilka, jeden pod drugim na karcie)", players_helper: "Dwa lub więcej: jeden blok na odtwarzacz, jeden pod drugim", only_playing: "Tylko odtwarzacze, które odtwarzają", include_paused: "Także wstrzymane odtwarzacze", n_playing: "Odtwarza: {n}", players_count: "Odtwarzacze: {n}", more_players: "Jeszcze {n}: {names}", back: "Wróć do wszystkich odtwarzaczy",
    movie: "Film", last_called: "Ostatnio wywołany", next_alarm: "Alarm", next_timer: "Minutnik", next_reminder: "Przypomnienie", dnd: "Nie przeszkadzać", speaker_group: "Grupa głośników", hide_idle_sessions: "Ukryj nieaktywne sesje Jellyfin",
    remote: "Pilot", r_up: "W górę", r_down: "W dół", r_left: "W lewo", r_right: "W prawo", r_select: "Wybierz", r_menu: "Menu", r_home: "Ekran główny", r_play_pause: "Odtwarzaj / pauza", show_remote: "Pokaż pilota (Apple TV)",
  },
  sr: {
    st_playing: "Репродукција", st_paused: "Паузирано", st_idle: "Неактиван", st_on: "Укључен", st_off: "Искључен", st_standby: "Мировање", st_buffering: "Учитавање", st_unavailable: "Недоступан", st_unknown: "Непознато",
    play: "Пусти", pause: "Пауза", stop: "Заустави", next: "Следећа нумера", previous: "Претходна нумера", shuffle: "Насумично", repeat_off: "Без понављања", repeat_all: "Понови све", repeat_one: "Понови нумеру",
    mute: "Искључи звук", unmute: "Укључи звук", volume: "Јачина звука", volume_down: "Тише", volume_up: "Јаче", power: "Укључи или искључи", seek: "Позиција",
    nothing_playing: "Ништа се не пушта", source: "Извор", sound_mode: "Режим звука", rooms: "Просторије", join: "Додај {name} у групу", leave: "Уклони {name} из групе",
    grouped: "Са: {names}", ungroup_all: "Раздвоји све", confirm_ungroup: "Уклонити све звучнике из групе {name}?", queue: "Ред", now_playing: "Сада се пушта", up_next: "Следеће",
    queue_loading: "Учитавање реда…", queue_empty: "Ред је празан.", queue_error: "Није могуће учитати ред.", queue_count: "Нумере у реду: {n}", favorites: "Омиљено",
    play_favorite: "Пусти {name}", track_of: "Нумера {n} од {total}", show_player: "Прикажи {name}", cancel: "Откажи", no_player: "Није пронађен медија плејер.", unknown_entity: "Медија плејер није пронађен",
    zoom_in: "Прикажи детаље", zoom_out: "Прикажи мање",
    entity: "Медија плејер", entities: "Просторије (други плејери, опционо)", title: "Наслов (опционо, подразумевано име плејера)", show_title: "Прикажи наслов", show_subtitle: "Прикажи поднаслов",
    show_background: "Замућена позадина омота", show_progress: "Прикажи напредак", show_controls: "Прикажи командне тастере", show_volume: "Прикажи јачину звука", show_rooms: "Прикажи просторије и групе",
    show_source: "Прикажи извор и режим звука", show_queue: "Прикажи ред", show_favorites: "Прикажи омиљено", collapsed: "Подразумевано скупљени одељци", favorites_entity: "Сензор омиљених (Sonos)",
    zoom: "Тастер за детаље", zoom_helper: "Тастер горе десно: прелази на пуну картицу и назад", language: "Језик", lang_auto: "Аутоматски (језик Home Assistant-а)",
    media: "Медији", players: "Плејери (више њих, један испод другог у картици)", players_helper: "Два или више: један блок по плејеру, један испод другог", only_playing: "Само плејери који репродукују", include_paused: "И паузирани плејери", n_playing: "{n} репродукује", players_count: "Плејера: {n}", more_players: "Још {n}: {names}", back: "Назад на све плејере",
    movie: "Филм", last_called: "Последњи позван", next_alarm: "Аларм", next_timer: "Тајмер", next_reminder: "Подсетник", dnd: "Не узнемиравај", speaker_group: "Група звучника", hide_idle_sessions: "Сакриј неактивне Jellyfin сесије",
    remote: "Даљински", r_up: "Горе", r_down: "Доле", r_left: "Лево", r_right: "Десно", r_select: "Изабери", r_menu: "Мени", r_home: "Почетна", r_play_pause: "Пусти / пауза", show_remote: "Прикажи даљински (Apple TV)",
  },
  "sr-Latn": {
    st_playing: "Reprodukcija", st_paused: "Pauzirano", st_idle: "Neaktivan", st_on: "Uključen", st_off: "Isključen", st_standby: "Mirovanje", st_buffering: "Učitavanje", st_unavailable: "Nedostupan", st_unknown: "Nepoznato",
    play: "Pusti", pause: "Pauza", stop: "Zaustavi", next: "Sledeća numera", previous: "Prethodna numera", shuffle: "Nasumično", repeat_off: "Bez ponavljanja", repeat_all: "Ponovi sve", repeat_one: "Ponovi numeru",
    mute: "Isključi zvuk", unmute: "Uključi zvuk", volume: "Jačina zvuka", volume_down: "Tiše", volume_up: "Jače", power: "Uključi ili isključi", seek: "Pozicija",
    nothing_playing: "Ništa se ne pušta", source: "Izvor", sound_mode: "Režim zvuka", rooms: "Prostorije", join: "Dodaj {name} u grupu", leave: "Ukloni {name} iz grupe",
    grouped: "Sa: {names}", ungroup_all: "Razdvoji sve", confirm_ungroup: "Ukloniti sve zvučnike iz grupe {name}?", queue: "Red", now_playing: "Sada se pušta", up_next: "Sledeće",
    queue_loading: "Učitavanje reda…", queue_empty: "Red je prazan.", queue_error: "Nije moguće učitati red.", queue_count: "Numere u redu: {n}", favorites: "Omiljeno",
    play_favorite: "Pusti {name}", track_of: "Numera {n} od {total}", show_player: "Prikaži {name}", cancel: "Otkaži", no_player: "Nije pronađen medija plejer.", unknown_entity: "Medija plejer nije pronađen",
    zoom_in: "Prikaži detalje", zoom_out: "Prikaži manje",
    entity: "Medija plejer", entities: "Prostorije (drugi plejeri, opciono)", title: "Naslov (opciono, podrazumevano ime plejera)", show_title: "Prikaži naslov", show_subtitle: "Prikaži podnaslov",
    show_background: "Zamućena pozadina omota", show_progress: "Prikaži napredak", show_controls: "Prikaži komandne tastere", show_volume: "Prikaži jačinu zvuka", show_rooms: "Prikaži prostorije i grupe",
    show_source: "Prikaži izvor i režim zvuka", show_queue: "Prikaži red", show_favorites: "Prikaži omiljeno", collapsed: "Podrazumevano skupljeni odeljci", favorites_entity: "Senzor omiljenih (Sonos)",
    zoom: "Taster za detalje", zoom_helper: "Taster gore desno: prelazi na punu karticu i nazad", language: "Jezik", lang_auto: "Automatski (jezik Home Assistant-a)",
    media: "Mediji", players: "Plejeri (više njih, jedan ispod drugog u kartici)", players_helper: "Dva ili više: jedan blok po plejeru, jedan ispod drugog", only_playing: "Samo plejeri koji reprodukuju", include_paused: "I pauzirani plejeri", n_playing: "{n} reprodukuje", players_count: "Plejera: {n}", more_players: "Još {n}: {names}", back: "Nazad na sve plejere",
    movie: "Film", last_called: "Poslednji pozvan", next_alarm: "Alarm", next_timer: "Tajmer", next_reminder: "Podsetnik", dnd: "Ne uznemiravaj", speaker_group: "Grupa zvučnika", hide_idle_sessions: "Sakrij neaktivne Jellyfin sesije",
    remote: "Daljinski", r_up: "Gore", r_down: "Dole", r_left: "Levo", r_right: "Desno", r_select: "Izaberi", r_menu: "Meni", r_home: "Početna", r_play_pause: "Pusti / pauza", show_remote: "Prikaži daljinski (Apple TV)",
  },
  ro: {
    st_playing: "Redare", st_paused: "În pauză", st_idle: "Inactiv", st_on: "Pornit", st_off: "Oprit", st_standby: "Standby", st_buffering: "Se încarcă", st_unavailable: "Indisponibil", st_unknown: "Necunoscut",
    play: "Redă", pause: "Pauză", stop: "Oprește", next: "Piesa următoare", previous: "Piesa anterioară", shuffle: "Aleatoriu", repeat_off: "Fără repetare", repeat_all: "Repetă tot", repeat_one: "Repetă piesa",
    mute: "Fără sonor", unmute: "Activează sonorul", volume: "Volum", volume_down: "Mai încet", volume_up: "Mai tare", power: "Pornește sau oprește", seek: "Poziție",
    nothing_playing: "Nu se redă nimic", source: "Sursă", sound_mode: "Mod sunet", rooms: "Camere", join: "Adaugă {name} în grup", leave: "Scoate {name} din grup",
    grouped: "Cu {names}", ungroup_all: "Degrupează tot", confirm_ungroup: "Scoți toate boxele din grupul {name}?", queue: "Coadă", now_playing: "Se redă acum", up_next: "Urmează",
    queue_loading: "Se încarcă coada…", queue_empty: "Coada este goală.", queue_error: "Coada nu a putut fi citită.", queue_count: "Piese în coadă: {n}", favorites: "Favorite",
    play_favorite: "Redă {name}", track_of: "Piesa {n} din {total}", show_player: "Afișează {name}", cancel: "Anulează", no_player: "Nu a fost găsit niciun player media.", unknown_entity: "Playerul media nu a fost găsit",
    zoom_in: "Afișează detalii", zoom_out: "Afișează mai puțin",
    entity: "Player media", entities: "Camere (alte playere, opțional)", title: "Titlu (opțional, implicit numele playerului)", show_title: "Afișează titlul", show_subtitle: "Afișează subtitlul",
    show_background: "Fundal estompat al copertei", show_progress: "Afișează progresul", show_controls: "Afișează butoanele de comandă", show_volume: "Afișează volumul", show_rooms: "Afișează camerele și grupurile",
    show_source: "Afișează sursa și modul sunet", show_queue: "Afișează coada", show_favorites: "Afișează favoritele", collapsed: "Secțiuni restrânse implicit", favorites_entity: "Senzor de favorite (Sonos)",
    zoom: "Buton detalii", zoom_helper: "Butonul din dreapta sus: trece la cardul complet și înapoi", language: "Limbă", lang_auto: "Automat (limba Home Assistant)",
    media: "Media", players: "Playere (mai multe, stivuite în card)", players_helper: "Două sau mai multe: un bloc pe player, unul sub altul", only_playing: "Doar playerele care redau", include_paused: "Și playerele în pauză", n_playing: "{n} redau", players_count: "{n} playere", more_players: "Încă {n}: {names}", back: "Înapoi la toate playerele",
    movie: "Film", last_called: "Ultimul apelat", next_alarm: "Alarmă", next_timer: "Cronometru", next_reminder: "Memento", dnd: "Nu deranjați", speaker_group: "Grup de boxe", hide_idle_sessions: "Ascunde sesiunile Jellyfin inactive",
    remote: "Telecomandă", r_up: "Sus", r_down: "Jos", r_left: "Stânga", r_right: "Dreapta", r_select: "Selectează", r_menu: "Meniu", r_home: "Acasă", r_play_pause: "Redare / pauză", show_remote: "Afișează telecomanda (Apple TV)",
  },
  da: {
    st_playing: "Afspiller", st_paused: "Sat på pause", st_idle: "Inaktiv", st_on: "Tændt", st_off: "Slukket", st_standby: "Standby", st_buffering: "Buffer", st_unavailable: "Utilgængelig", st_unknown: "Ukendt",
    play: "Afspil", pause: "Pause", stop: "Stop", next: "Næste nummer", previous: "Forrige nummer", shuffle: "Bland", repeat_off: "Gentag fra", repeat_all: "Gentag alle", repeat_one: "Gentag nummer",
    mute: "Lyd fra", unmute: "Lyd til", volume: "Lydstyrke", volume_down: "Skru ned", volume_up: "Skru op", power: "Tænd eller sluk", seek: "Position",
    nothing_playing: "Intet afspilles", source: "Kilde", sound_mode: "Lydtilstand", rooms: "Rum", join: "Føj {name} til gruppen", leave: "Fjern {name} fra gruppen",
    grouped: "Med {names}", ungroup_all: "Opløs gruppen", confirm_ungroup: "Fjern alle højttalere fra gruppen for {name}?", queue: "Kø", now_playing: "Afspilles nu", up_next: "Næste",
    queue_loading: "Indlæser køen…", queue_empty: "Køen er tom.", queue_error: "Kunne ikke hente køen.", queue_count: "Numre i køen: {n}", favorites: "Favoritter",
    play_favorite: "Afspil {name}", track_of: "Nummer {n} af {total}", show_player: "Vis {name}", cancel: "Annuller", no_player: "Ingen medieafspiller fundet.", unknown_entity: "Medieafspiller ikke fundet",
    zoom_in: "Vis detaljer", zoom_out: "Vis mindre",
    entity: "Medieafspiller", entities: "Rum (andre afspillere, valgfrit)", title: "Titel (valgfri, standard er afspillerens navn)", show_title: "Vis titel", show_subtitle: "Vis undertitel",
    show_background: "Sløret coverbaggrund", show_progress: "Vis forløb", show_controls: "Vis betjeningsknapper", show_volume: "Vis lydstyrke", show_rooms: "Vis rum og grupper",
    show_source: "Vis kilde og lydtilstand", show_queue: "Vis kø", show_favorites: "Vis favoritter", collapsed: "Sektioner foldet sammen som standard", favorites_entity: "Favoritsensor (Sonos)",
    zoom: "Detaljeknap", zoom_helper: "Knap øverst til højre: skifter til det fulde kort og tilbage", language: "Sprog", lang_auto: "Automatisk (Home Assistants sprog)",
    media: "Medier", players: "Afspillere (flere, stablet i kortet)", players_helper: "To eller flere: én blok pr. afspiller, under hinanden", only_playing: "Kun afspillere, der afspiller", include_paused: "Også afspillere på pause", n_playing: "{n} afspiller", players_count: "{n} afspillere", more_players: "{n} mere: {names}", back: "Tilbage til alle afspillere",
    movie: "Film", last_called: "Sidst kaldt", next_alarm: "Alarm", next_timer: "Timer", next_reminder: "Påmindelse", dnd: "Forstyr ikke", speaker_group: "Højttalergruppe", hide_idle_sessions: "Skjul inaktive Jellyfin-sessioner",
    remote: "Fjernbetjening", r_up: "Op", r_down: "Ned", r_left: "Venstre", r_right: "Højre", r_select: "Vælg", r_menu: "Menu", r_home: "Hjem", r_play_pause: "Afspil / pause", show_remote: "Vis fjernbetjeningen (Apple TV)",
  },
  sv: {
    st_playing: "Spelar", st_paused: "Pausad", st_idle: "Inaktiv", st_on: "På", st_off: "Av", st_standby: "Viloläge", st_buffering: "Buffrar", st_unavailable: "Otillgänglig", st_unknown: "Okänd",
    play: "Spela", pause: "Paus", stop: "Stopp", next: "Nästa spår", previous: "Föregående spår", shuffle: "Blanda", repeat_off: "Upprepa av", repeat_all: "Upprepa alla", repeat_one: "Upprepa spår",
    mute: "Ljud av", unmute: "Ljud på", volume: "Volym", volume_down: "Sänk volymen", volume_up: "Höj volymen", power: "Slå på eller av", seek: "Position",
    nothing_playing: "Inget spelas", source: "Källa", sound_mode: "Ljudläge", rooms: "Rum", join: "Lägg till {name} i gruppen", leave: "Ta bort {name} från gruppen",
    grouped: "Med {names}", ungroup_all: "Dela upp gruppen", confirm_ungroup: "Ta bort alla högtalare från gruppen för {name}?", queue: "Kö", now_playing: "Spelas nu", up_next: "Härnäst",
    queue_loading: "Läser in kön…", queue_empty: "Kön är tom.", queue_error: "Kunde inte hämta kön.", queue_count: "Spår i kön: {n}", favorites: "Favoriter",
    play_favorite: "Spela {name}", track_of: "Spår {n} av {total}", show_player: "Visa {name}", cancel: "Avbryt", no_player: "Ingen mediaspelare hittades.", unknown_entity: "Mediaspelaren hittades inte",
    zoom_in: "Visa detaljer", zoom_out: "Visa mindre",
    entity: "Mediaspelare", entities: "Rum (andra spelare, valfritt)", title: "Titel (valfri, spelarens namn som standard)", show_title: "Visa titel", show_subtitle: "Visa undertitel",
    show_background: "Suddig omslagsbakgrund", show_progress: "Visa förlopp", show_controls: "Visa kontrollknappar", show_volume: "Visa volym", show_rooms: "Visa rum och grupper",
    show_source: "Visa källa och ljudläge", show_queue: "Visa kö", show_favorites: "Visa favoriter", collapsed: "Sektioner hopfällda som standard", favorites_entity: "Favoritsensor (Sonos)",
    zoom: "Detaljknapp", zoom_helper: "Knappen uppe till höger: växlar till hela kortet och tillbaka", language: "Språk", lang_auto: "Automatiskt (Home Assistants språk)",
    media: "Media", players: "Spelare (flera, staplade i kortet)", players_helper: "Två eller fler: ett block per spelare, under varandra", only_playing: "Bara spelare som spelar", include_paused: "Även pausade spelare", n_playing: "{n} spelar", players_count: "{n} spelare", more_players: "{n} till: {names}", back: "Tillbaka till alla spelare",
    movie: "Film", last_called: "Senast anropad", next_alarm: "Alarm", next_timer: "Timer", next_reminder: "Påminnelse", dnd: "Stör ej", speaker_group: "Högtalargrupp", hide_idle_sessions: "Dölj inaktiva Jellyfin-sessioner",
    remote: "Fjärrkontroll", r_up: "Upp", r_down: "Ned", r_left: "Vänster", r_right: "Höger", r_select: "Välj", r_menu: "Meny", r_home: "Hem", r_play_pause: "Spela / pausa", show_remote: "Visa fjärrkontrollen (Apple TV)",
  },
  bg: {
    st_playing: "Възпроизвежда", st_paused: "На пауза", st_idle: "Неактивен", st_on: "Включен", st_off: "Изключен", st_standby: "Готовност", st_buffering: "Зареждане", st_unavailable: "Недостъпен", st_unknown: "Неизвестно",
    play: "Пусни", pause: "Пауза", stop: "Спри", next: "Следваща песен", previous: "Предишна песен", shuffle: "Разбъркано", repeat_off: "Без повторение", repeat_all: "Повтаряй всички", repeat_one: "Повтаряй песента",
    mute: "Без звук", unmute: "Включи звука", volume: "Сила на звука", volume_down: "По-тихо", volume_up: "По-силно", power: "Включи или изключи", seek: "Позиция",
    nothing_playing: "Нищо не се възпроизвежда", source: "Източник", sound_mode: "Звуков режим", rooms: "Стаи", join: "Добави {name} към групата", leave: "Премахни {name} от групата",
    grouped: "С {names}", ungroup_all: "Разгрупирай всички", confirm_ungroup: "Да се премахнат ли всички тонколони от групата на {name}?", queue: "Опашка", now_playing: "Сега звучи", up_next: "Следва",
    queue_loading: "Зареждане на опашката…", queue_empty: "Опашката е празна.", queue_error: "Опашката не можа да бъде заредена.", queue_count: "Песни в опашката: {n}", favorites: "Любими",
    play_favorite: "Пусни {name}", track_of: "Песен {n} от {total}", show_player: "Покажи {name}", cancel: "Отказ", no_player: "Не е намерен медиен плейър.", unknown_entity: "Медийният плейър не е намерен",
    zoom_in: "Покажи подробности", zoom_out: "Покажи по-малко",
    entity: "Медиен плейър", entities: "Стаи (други плейъри, по избор)", title: "Заглавие (по избор, по подразбиране името на плейъра)", show_title: "Покажи заглавието", show_subtitle: "Покажи подзаглавието",
    show_background: "Размит фон от обложката", show_progress: "Покажи напредъка", show_controls: "Покажи бутоните за управление", show_volume: "Покажи силата на звука", show_rooms: "Покажи стаите и групите",
    show_source: "Покажи източника и звуковия режим", show_queue: "Покажи опашката", show_favorites: "Покажи любимите", collapsed: "Свити по подразбиране секции", favorites_entity: "Сензор за любими (Sonos)",
    zoom: "Бутон за подробности", zoom_helper: "Бутон горе вдясно: превключва към пълната карта и обратно", language: "Език", lang_auto: "Автоматично (езикът на Home Assistant)",
    media: "Медия", players: "Плейъри (няколко, един под друг в картата)", players_helper: "Два или повече: по един блок за плейър, един под друг", only_playing: "Само плейърите, които възпроизвеждат", include_paused: "И плейърите на пауза", n_playing: "Възпроизвеждат: {n}", players_count: "Плейъри: {n}", more_players: "Още {n}: {names}", back: "Назад към всички плейъри",
    movie: "Филм", last_called: "Последно извикан", next_alarm: "Аларма", next_timer: "Таймер", next_reminder: "Напомняне", dnd: "Не безпокойте", speaker_group: "Група високоговорители", hide_idle_sessions: "Скриване на неактивните сесии на Jellyfin",
    remote: "Дистанционно", r_up: "Нагоре", r_down: "Надолу", r_left: "Наляво", r_right: "Надясно", r_select: "Избор", r_menu: "Меню", r_home: "Начало", r_play_pause: "Пускане / пауза", show_remote: "Показване на дистанционното (Apple TV)",
  },
  ru: {
    st_playing: "Воспроизведение", st_paused: "Пауза", st_idle: "Бездействует", st_on: "Включён", st_off: "Выключен", st_standby: "Ожидание", st_buffering: "Буферизация", st_unavailable: "Недоступен", st_unknown: "Неизвестно",
    play: "Воспроизвести", pause: "Пауза", stop: "Стоп", next: "Следующий трек", previous: "Предыдущий трек", shuffle: "Перемешать", repeat_off: "Без повтора", repeat_all: "Повторять все", repeat_one: "Повторять трек",
    mute: "Выключить звук", unmute: "Включить звук", volume: "Громкость", volume_down: "Тише", volume_up: "Громче", power: "Включить или выключить", seek: "Позиция",
    nothing_playing: "Ничего не воспроизводится", source: "Источник", sound_mode: "Звуковой режим", rooms: "Комнаты", join: "Добавить {name} в группу", leave: "Убрать {name} из группы",
    grouped: "Вместе с: {names}", ungroup_all: "Разгруппировать все", confirm_ungroup: "Убрать все колонки из группы {name}?", queue: "Очередь", now_playing: "Сейчас играет", up_next: "Далее",
    queue_loading: "Загрузка очереди…", queue_empty: "Очередь пуста.", queue_error: "Не удалось получить очередь.", queue_count: "Треков в очереди: {n}", favorites: "Избранное",
    play_favorite: "Воспроизвести {name}", track_of: "Трек {n} из {total}", show_player: "Показать {name}", cancel: "Отмена", no_player: "Медиаплеер не найден.", unknown_entity: "Медиаплеер не найден",
    zoom_in: "Подробнее", zoom_out: "Свернуть",
    entity: "Медиаплеер", entities: "Комнаты (другие плееры, необязательно)", title: "Заголовок (необязательно, по умолчанию имя плеера)", show_title: "Показывать заголовок", show_subtitle: "Показывать подзаголовок",
    show_background: "Размытый фон обложки", show_progress: "Показывать прогресс", show_controls: "Показывать кнопки управления", show_volume: "Показывать громкость", show_rooms: "Показывать комнаты и группы",
    show_source: "Показывать источник и звуковой режим", show_queue: "Показывать очередь", show_favorites: "Показывать избранное", collapsed: "Свёрнутые по умолчанию разделы", favorites_entity: "Датчик избранного (Sonos)",
    zoom: "Кнопка подробностей", zoom_helper: "Кнопка справа вверху: переключает на полную карточку и обратно", language: "Язык", lang_auto: "Автоматически (язык Home Assistant)",
    media: "Медиа", players: "Плееры (несколько, друг под другом в карточке)", players_helper: "Два или больше: по блоку на плеер, друг под другом", only_playing: "Только воспроизводящие плееры", include_paused: "И плееры на паузе", n_playing: "Воспроизводят: {n}", players_count: "Плееров: {n}", more_players: "Ещё {n}: {names}", back: "Назад ко всем плеерам",
    movie: "Фильм", last_called: "Последний вызванный", next_alarm: "Будильник", next_timer: "Таймер", next_reminder: "Напоминание", dnd: "Не беспокоить", speaker_group: "Группа колонок", hide_idle_sessions: "Скрывать неактивные сеансы Jellyfin",
    remote: "Пульт", r_up: "Вверх", r_down: "Вниз", r_left: "Влево", r_right: "Вправо", r_select: "Выбрать", r_menu: "Меню", r_home: "Домой", r_play_pause: "Воспроизведение / пауза", show_remote: "Показывать пульт (Apple TV)",
  },
  uk: {
    st_playing: "Відтворення", st_paused: "Пауза", st_idle: "Неактивний", st_on: "Увімкнено", st_off: "Вимкнено", st_standby: "Очікування", st_buffering: "Буферизація", st_unavailable: "Недоступний", st_unknown: "Невідомо",
    play: "Відтворити", pause: "Пауза", stop: "Стоп", next: "Наступний трек", previous: "Попередній трек", shuffle: "Перемішати", repeat_off: "Без повтору", repeat_all: "Повторювати всі", repeat_one: "Повторювати трек",
    mute: "Вимкнути звук", unmute: "Увімкнути звук", volume: "Гучність", volume_down: "Тихіше", volume_up: "Гучніше", power: "Увімкнути або вимкнути", seek: "Позиція",
    nothing_playing: "Нічого не відтворюється", source: "Джерело", sound_mode: "Звуковий режим", rooms: "Кімнати", join: "Додати {name} до групи", leave: "Прибрати {name} з групи",
    grouped: "Разом з: {names}", ungroup_all: "Розгрупувати всі", confirm_ungroup: "Прибрати всі колонки з групи {name}?", queue: "Черга", now_playing: "Зараз грає", up_next: "Далі",
    queue_loading: "Завантаження черги…", queue_empty: "Черга порожня.", queue_error: "Не вдалося отримати чергу.", queue_count: "Треків у черзі: {n}", favorites: "Обране",
    play_favorite: "Відтворити {name}", track_of: "Трек {n} з {total}", show_player: "Показати {name}", cancel: "Скасувати", no_player: "Медіаплеєр не знайдено.", unknown_entity: "Медіаплеєр не знайдено",
    zoom_in: "Докладніше", zoom_out: "Згорнути",
    entity: "Медіаплеєр", entities: "Кімнати (інші плеєри, необов'язково)", title: "Заголовок (необов'язково, типово ім'я плеєра)", show_title: "Показувати заголовок", show_subtitle: "Показувати підзаголовок",
    show_background: "Розмитий фон обкладинки", show_progress: "Показувати прогрес", show_controls: "Показувати кнопки керування", show_volume: "Показувати гучність", show_rooms: "Показувати кімнати й групи",
    show_source: "Показувати джерело й звуковий режим", show_queue: "Показувати чергу", show_favorites: "Показувати обране", collapsed: "Типово згорнуті розділи", favorites_entity: "Датчик обраного (Sonos)",
    zoom: "Кнопка подробиць", zoom_helper: "Кнопка праворуч угорі: перемикає на повну картку й назад", language: "Мова", lang_auto: "Автоматично (мова Home Assistant)",
    media: "Медіа", players: "Плеєри (кілька, один під одним у картці)", players_helper: "Два чи більше: по блоку на плеєр, один під одним", only_playing: "Лише плеєри, що відтворюють", include_paused: "І плеєри на паузі", n_playing: "Відтворюють: {n}", players_count: "Плеєрів: {n}", more_players: "Ще {n}: {names}", back: "Назад до всіх плеєрів",
    movie: "Фільм", last_called: "Останній викликаний", next_alarm: "Будильник", next_timer: "Таймер", next_reminder: "Нагадування", dnd: "Не турбувати", speaker_group: "Група колонок", hide_idle_sessions: "Приховувати неактивні сеанси Jellyfin",
    remote: "Пульт", r_up: "Вгору", r_down: "Вниз", r_left: "Ліворуч", r_right: "Праворуч", r_select: "Вибрати", r_menu: "Меню", r_home: "Додому", r_play_pause: "Відтворення / пауза", show_remote: "Показувати пульт (Apple TV)",
  },
  hu: {
    st_playing: "Lejátszás", st_paused: "Szüneteltetve", st_idle: "Tétlen", st_on: "Be", st_off: "Ki", st_standby: "Készenlét", st_buffering: "Pufferelés", st_unavailable: "Nem elérhető", st_unknown: "Ismeretlen",
    play: "Lejátszás", pause: "Szünet", stop: "Leállítás", next: "Következő szám", previous: "Előző szám", shuffle: "Véletlen sorrend", repeat_off: "Ismétlés ki", repeat_all: "Összes ismétlése", repeat_one: "Szám ismétlése",
    mute: "Némítás", unmute: "Hang be", volume: "Hangerő", volume_down: "Halkítás", volume_up: "Hangosítás", power: "Be- vagy kikapcsolás", seek: "Pozíció",
    nothing_playing: "Nincs lejátszás", source: "Forrás", sound_mode: "Hangmód", rooms: "Helyiségek", join: "{name} hozzáadása a csoporthoz", leave: "{name} eltávolítása a csoportból",
    grouped: "Velük: {names}", ungroup_all: "Csoport bontása", confirm_ungroup: "Eltávolítod az összes hangszórót {name} csoportjából?", queue: "Lejátszási sor", now_playing: "Most szól", up_next: "Következik",
    queue_loading: "Lejátszási sor betöltése…", queue_empty: "A lejátszási sor üres.", queue_error: "Nem sikerült lekérni a lejátszási sort.", queue_count: "Számok a sorban: {n}", favorites: "Kedvencek",
    play_favorite: "{name} lejátszása", track_of: "{n}. szám / {total}", show_player: "{name} megjelenítése", cancel: "Mégse", no_player: "Nem található médialejátszó.", unknown_entity: "A médialejátszó nem található",
    zoom_in: "Részletek", zoom_out: "Kevesebb",
    entity: "Médialejátszó", entities: "Helyiségek (további lejátszók, opcionális)", title: "Cím (opcionális, alapértelmezés a lejátszó neve)", show_title: "Cím megjelenítése", show_subtitle: "Alcím megjelenítése",
    show_background: "Elmosott borító háttér", show_progress: "Haladás megjelenítése", show_controls: "Vezérlőgombok megjelenítése", show_volume: "Hangerő megjelenítése", show_rooms: "Helyiségek és csoportok megjelenítése",
    show_source: "Forrás és hangmód megjelenítése", show_queue: "Lejátszási sor megjelenítése", show_favorites: "Kedvencek megjelenítése", collapsed: "Alapértelmezésben összecsukott részek", favorites_entity: "Kedvencek érzékelő (Sonos)",
    zoom: "Részletek gomb", zoom_helper: "Jobb felső gomb: a teljes kártyára vált és vissza", language: "Nyelv", lang_auto: "Automatikus (Home Assistant nyelve)",
    media: "Média", players: "Lejátszók (több, egymás alatt a kártyán)", players_helper: "Kettő vagy több: lejátszónként egy blokk, egymás alatt", only_playing: "Csak a lejátszást végző lejátszók", include_paused: "A szüneteltetett lejátszók is", n_playing: "{n} játszik", players_count: "{n} lejátszó", more_players: "Még {n}: {names}", back: "Vissza az összes lejátszóhoz",
    movie: "Film", last_called: "Utoljára megszólítva", next_alarm: "Ébresztő", next_timer: "Időzítő", next_reminder: "Emlékeztető", dnd: "Ne zavarjanak", speaker_group: "Hangszórócsoport", hide_idle_sessions: "Inaktív Jellyfin-munkamenetek elrejtése",
    remote: "Távirányító", r_up: "Fel", r_down: "Le", r_left: "Balra", r_right: "Jobbra", r_select: "Kiválasztás", r_menu: "Menü", r_home: "Kezdőlap", r_play_pause: "Lejátszás / szünet", show_remote: "Távirányító megjelenítése (Apple TV)",
  },
  sk: {
    st_playing: "Prehráva sa", st_paused: "Pozastavené", st_idle: "Nečinný", st_on: "Zapnutý", st_off: "Vypnutý", st_standby: "Pohotovosť", st_buffering: "Načítava sa", st_unavailable: "Nedostupný", st_unknown: "Neznámy",
    play: "Prehrať", pause: "Pozastaviť", stop: "Zastaviť", next: "Ďalšia skladba", previous: "Predchádzajúca skladba", shuffle: "Náhodne", repeat_off: "Bez opakovania", repeat_all: "Opakovať všetko", repeat_one: "Opakovať skladbu",
    mute: "Stlmiť", unmute: "Zapnúť zvuk", volume: "Hlasitosť", volume_down: "Tichšie", volume_up: "Hlasnejšie", power: "Zapnúť alebo vypnúť", seek: "Pozícia",
    nothing_playing: "Nič sa neprehráva", source: "Zdroj", sound_mode: "Režim zvuku", rooms: "Miestnosti", join: "Pridať {name} do skupiny", leave: "Odobrať {name} zo skupiny",
    grouped: "S: {names}", ungroup_all: "Zrušiť skupinu", confirm_ungroup: "Odobrať všetky reproduktory zo skupiny {name}?", queue: "Poradie", now_playing: "Práve hrá", up_next: "Nasleduje",
    queue_loading: "Načítava sa poradie…", queue_empty: "Poradie je prázdne.", queue_error: "Poradie sa nepodarilo získať.", queue_count: "Skladby v poradí: {n}", favorites: "Obľúbené",
    play_favorite: "Prehrať {name}", track_of: "Skladba {n} z {total}", show_player: "Zobraziť {name}", cancel: "Zrušiť", no_player: "Nenašiel sa žiadny prehrávač médií.", unknown_entity: "Prehrávač médií sa nenašiel",
    zoom_in: "Zobraziť podrobnosti", zoom_out: "Zobraziť menej",
    entity: "Prehrávač médií", entities: "Miestnosti (iné prehrávače, voliteľné)", title: "Názov (voliteľný, predvolene názov prehrávača)", show_title: "Zobraziť názov", show_subtitle: "Zobraziť podnadpis",
    show_background: "Rozmazané pozadie obalu", show_progress: "Zobraziť priebeh", show_controls: "Zobraziť ovládacie tlačidlá", show_volume: "Zobraziť hlasitosť", show_rooms: "Zobraziť miestnosti a skupiny",
    show_source: "Zobraziť zdroj a režim zvuku", show_queue: "Zobraziť poradie", show_favorites: "Zobraziť obľúbené", collapsed: "Predvolene zbalené sekcie", favorites_entity: "Senzor obľúbených (Sonos)",
    zoom: "Tlačidlo podrobností", zoom_helper: "Tlačidlo vpravo hore: prepne na úplnú kartu a späť", language: "Jazyk", lang_auto: "Automaticky (jazyk Home Assistant)",
    media: "Médiá", players: "Prehrávače (viaceré, pod sebou v karte)", players_helper: "Dva alebo viac: jeden blok na prehrávač, pod sebou", only_playing: "Len prehrávače, ktoré prehrávajú", include_paused: "Aj pozastavené prehrávače", n_playing: "Prehráva: {n}", players_count: "Prehrávače: {n}", more_players: "Ďalšie {n}: {names}", back: "Späť na všetky prehrávače",
    movie: "Film", last_called: "Naposledy oslovený", next_alarm: "Budík", next_timer: "Časovač", next_reminder: "Pripomienka", dnd: "Nerušiť", speaker_group: "Skupina reproduktorov", hide_idle_sessions: "Skryť neaktívne relácie Jellyfin",
    remote: "Diaľkový ovládač", r_up: "Hore", r_down: "Dole", r_left: "Vľavo", r_right: "Vpravo", r_select: "Vybrať", r_menu: "Ponuka", r_home: "Domov", r_play_pause: "Prehrať / pozastaviť", show_remote: "Zobraziť diaľkový ovládač (Apple TV)",
  },
  cs: {
    st_playing: "Přehrává se", st_paused: "Pozastaveno", st_idle: "Nečinný", st_on: "Zapnuto", st_off: "Vypnuto", st_standby: "Pohotovost", st_buffering: "Načítání", st_unavailable: "Nedostupný", st_unknown: "Neznámý",
    play: "Přehrát", pause: "Pozastavit", stop: "Zastavit", next: "Další skladba", previous: "Předchozí skladba", shuffle: "Náhodně", repeat_off: "Bez opakování", repeat_all: "Opakovat vše", repeat_one: "Opakovat skladbu",
    mute: "Ztlumit", unmute: "Zapnout zvuk", volume: "Hlasitost", volume_down: "Tišeji", volume_up: "Hlasitěji", power: "Zapnout nebo vypnout", seek: "Pozice",
    nothing_playing: "Nic se nepřehrává", source: "Zdroj", sound_mode: "Režim zvuku", rooms: "Místnosti", join: "Přidat {name} do skupiny", leave: "Odebrat {name} ze skupiny",
    grouped: "S: {names}", ungroup_all: "Zrušit skupinu", confirm_ungroup: "Odebrat všechny reproduktory ze skupiny {name}?", queue: "Fronta", now_playing: "Právě hraje", up_next: "Následuje",
    queue_loading: "Načítání fronty…", queue_empty: "Fronta je prázdná.", queue_error: "Frontu se nepodařilo získat.", queue_count: "Skladby ve frontě: {n}", favorites: "Oblíbené",
    play_favorite: "Přehrát {name}", track_of: "Skladba {n} z {total}", show_player: "Zobrazit {name}", cancel: "Zrušit", no_player: "Nebyl nalezen žádný přehrávač médií.", unknown_entity: "Přehrávač médií nebyl nalezen",
    zoom_in: "Zobrazit podrobnosti", zoom_out: "Zobrazit méně",
    entity: "Přehrávač médií", entities: "Místnosti (další přehrávače, volitelné)", title: "Název (volitelný, výchozí je název přehrávače)", show_title: "Zobrazit název", show_subtitle: "Zobrazit podnadpis",
    show_background: "Rozmazané pozadí obalu", show_progress: "Zobrazit průběh", show_controls: "Zobrazit ovládací tlačítka", show_volume: "Zobrazit hlasitost", show_rooms: "Zobrazit místnosti a skupiny",
    show_source: "Zobrazit zdroj a režim zvuku", show_queue: "Zobrazit frontu", show_favorites: "Zobrazit oblíbené", collapsed: "Výchozí sbalené sekce", favorites_entity: "Senzor oblíbených (Sonos)",
    zoom: "Tlačítko podrobností", zoom_helper: "Tlačítko vpravo nahoře: přepne na úplnou kartu a zpět", language: "Jazyk", lang_auto: "Automaticky (jazyk Home Assistant)",
    media: "Média", players: "Přehrávače (více, pod sebou v kartě)", players_helper: "Dva a více: jeden blok na přehrávač, pod sebou", only_playing: "Jen přehrávače, které přehrávají", include_paused: "I pozastavené přehrávače", n_playing: "Přehrává: {n}", players_count: "Přehrávače: {n}", more_players: "Dalších {n}: {names}", back: "Zpět na všechny přehrávače",
    movie: "Film", last_called: "Naposledy oslovený", next_alarm: "Budík", next_timer: "Časovač", next_reminder: "Připomínka", dnd: "Nerušit", speaker_group: "Skupina reproduktorů", hide_idle_sessions: "Skrýt neaktivní relace Jellyfin",
    remote: "Dálkový ovladač", r_up: "Nahoru", r_down: "Dolů", r_left: "Vlevo", r_right: "Vpravo", r_select: "Vybrat", r_menu: "Nabídka", r_home: "Domů", r_play_pause: "Přehrát / pozastavit", show_remote: "Zobrazit dálkový ovladač (Apple TV)",
  },
  sl: {
    st_playing: "Predvajanje", st_paused: "Začasno ustavljeno", st_idle: "Nedejaven", st_on: "Vklopljen", st_off: "Izklopljen", st_standby: "Pripravljenost", st_buffering: "Nalaganje", st_unavailable: "Ni na voljo", st_unknown: "Neznano",
    play: "Predvajaj", pause: "Premor", stop: "Ustavi", next: "Naslednja skladba", previous: "Prejšnja skladba", shuffle: "Naključno", repeat_off: "Brez ponavljanja", repeat_all: "Ponavljaj vse", repeat_one: "Ponavljaj skladbo",
    mute: "Utišaj", unmute: "Vklopi zvok", volume: "Glasnost", volume_down: "Tiše", volume_up: "Glasneje", power: "Vklopi ali izklopi", seek: "Položaj",
    nothing_playing: "Nič se ne predvaja", source: "Vir", sound_mode: "Zvočni način", rooms: "Prostori", join: "Dodaj {name} v skupino", leave: "Odstrani {name} iz skupine",
    grouped: "Z: {names}", ungroup_all: "Razdruži vse", confirm_ungroup: "Odstranim vse zvočnike iz skupine {name}?", queue: "Čakalna vrsta", now_playing: "Zdaj se predvaja", up_next: "Sledi",
    queue_loading: "Nalaganje čakalne vrste…", queue_empty: "Čakalna vrsta je prazna.", queue_error: "Čakalne vrste ni bilo mogoče pridobiti.", queue_count: "Skladbe v vrsti: {n}", favorites: "Priljubljene",
    play_favorite: "Predvajaj {name}", track_of: "Skladba {n} od {total}", show_player: "Prikaži {name}", cancel: "Prekliči", no_player: "Ni najdenega predvajalnika predstavnosti.", unknown_entity: "Predvajalnika predstavnosti ni mogoče najti",
    zoom_in: "Prikaži podrobnosti", zoom_out: "Prikaži manj",
    entity: "Predvajalnik predstavnosti", entities: "Prostori (drugi predvajalniki, neobvezno)", title: "Naslov (neobvezno, privzeto ime predvajalnika)", show_title: "Prikaži naslov", show_subtitle: "Prikaži podnaslov",
    show_background: "Zamegljeno ozadje naslovnice", show_progress: "Prikaži napredek", show_controls: "Prikaži gumbe za upravljanje", show_volume: "Prikaži glasnost", show_rooms: "Prikaži prostore in skupine",
    show_source: "Prikaži vir in zvočni način", show_queue: "Prikaži čakalno vrsto", show_favorites: "Prikaži priljubljene", collapsed: "Privzeto strnjeni razdelki", favorites_entity: "Senzor priljubljenih (Sonos)",
    zoom: "Gumb za podrobnosti", zoom_helper: "Gumb zgoraj desno: preklopi na polno kartico in nazaj", language: "Jezik", lang_auto: "Samodejno (jezik Home Assistanta)",
    media: "Predstavnost", players: "Predvajalniki (več, drug pod drugim na kartici)", players_helper: "Dva ali več: en blok na predvajalnik, drug pod drugim", only_playing: "Samo predvajalniki, ki predvajajo", include_paused: "Tudi zaustavljeni predvajalniki", n_playing: "Predvaja: {n}", players_count: "Predvajalniki: {n}", more_players: "Še {n}: {names}", back: "Nazaj na vse predvajalnike",
    movie: "Film", last_called: "Nazadnje poklican", next_alarm: "Budilka", next_timer: "Časovnik", next_reminder: "Opomnik", dnd: "Ne moti", speaker_group: "Skupina zvočnikov", hide_idle_sessions: "Skrij neaktivne seje Jellyfin",
    remote: "Daljinec", r_up: "Gor", r_down: "Dol", r_left: "Levo", r_right: "Desno", r_select: "Izberi", r_menu: "Meni", r_home: "Domov", r_play_pause: "Predvajaj / premor", show_remote: "Prikaži daljinec (Apple TV)",
  },
  lv: {
    st_playing: "Atskaņo", st_paused: "Pauzēts", st_idle: "Dīkstāvē", st_on: "Ieslēgts", st_off: "Izslēgts", st_standby: "Gaidstāve", st_buffering: "Ielādē", st_unavailable: "Nav pieejams", st_unknown: "Nezināms",
    play: "Atskaņot", pause: "Pauze", stop: "Apturēt", next: "Nākamais ieraksts", previous: "Iepriekšējais ieraksts", shuffle: "Jaukt", repeat_off: "Bez atkārtošanas", repeat_all: "Atkārtot visu", repeat_one: "Atkārtot ierakstu",
    mute: "Izslēgt skaņu", unmute: "Ieslēgt skaņu", volume: "Skaļums", volume_down: "Klusāk", volume_up: "Skaļāk", power: "Ieslēgt vai izslēgt", seek: "Pozīcija",
    nothing_playing: "Nekas netiek atskaņots", source: "Avots", sound_mode: "Skaņas režīms", rooms: "Telpas", join: "Pievienot {name} grupai", leave: "Noņemt {name} no grupas",
    grouped: "Kopā ar: {names}", ungroup_all: "Izjaukt grupu", confirm_ungroup: "Noņemt visus skaļruņus no {name} grupas?", queue: "Rinda", now_playing: "Tagad skan", up_next: "Nākamais",
    queue_loading: "Ielādē rindu…", queue_empty: "Rinda ir tukša.", queue_error: "Neizdevās iegūt rindu.", queue_count: "Ieraksti rindā: {n}", favorites: "Izlase",
    play_favorite: "Atskaņot {name}", track_of: "Ieraksts {n} no {total}", show_player: "Rādīt {name}", cancel: "Atcelt", no_player: "Nav atrasts neviens multivides atskaņotājs.", unknown_entity: "Multivides atskaņotājs nav atrasts",
    zoom_in: "Rādīt detaļas", zoom_out: "Rādīt mazāk",
    entity: "Multivides atskaņotājs", entities: "Telpas (citi atskaņotāji, neobligāti)", title: "Nosaukums (neobligāts, pēc noklusējuma atskaņotāja nosaukums)", show_title: "Rādīt nosaukumu", show_subtitle: "Rādīt apakšvirsrakstu",
    show_background: "Izpludināts vāciņa fons", show_progress: "Rādīt progresu", show_controls: "Rādīt vadības pogas", show_volume: "Rādīt skaļumu", show_rooms: "Rādīt telpas un grupas",
    show_source: "Rādīt avotu un skaņas režīmu", show_queue: "Rādīt rindu", show_favorites: "Rādīt izlasi", collapsed: "Pēc noklusējuma sakļautās sadaļas", favorites_entity: "Izlases sensors (Sonos)",
    zoom: "Detaļu poga", zoom_helper: "Poga augšējā labajā stūrī: pārslēdz uz pilno karti un atpakaļ", language: "Valoda", lang_auto: "Automātiski (Home Assistant valoda)",
    media: "Multivide", players: "Atskaņotāji (vairāki, kartē cits zem cita)", players_helper: "Divi vai vairāk: viens bloks katram atskaņotājam, cits zem cita", only_playing: "Tikai atskaņotāji, kas atskaņo", include_paused: "Arī pauzētie atskaņotāji", n_playing: "Atskaņo: {n}", players_count: "Atskaņotāji: {n}", more_players: "Vēl {n}: {names}", back: "Atpakaļ uz visiem atskaņotājiem",
    movie: "Filma", last_called: "Pēdējais uzrunātais", next_alarm: "Modinātājs", next_timer: "Taimeris", next_reminder: "Atgādinājums", dnd: "Netraucēt", speaker_group: "Skaļruņu grupa", hide_idle_sessions: "Slēpt neaktīvās Jellyfin sesijas",
    remote: "Tālvadība", r_up: "Augšup", r_down: "Lejup", r_left: "Pa kreisi", r_right: "Pa labi", r_select: "Izvēlēties", r_menu: "Izvēlne", r_home: "Sākums", r_play_pause: "Atskaņot / pauze", show_remote: "Rādīt tālvadību (Apple TV)",
  },
  el: {
    st_playing: "Αναπαραγωγή", st_paused: "Σε παύση", st_idle: "Αδρανές", st_on: "Ενεργό", st_off: "Ανενεργό", st_standby: "Αναμονή", st_buffering: "Φόρτωση", st_unavailable: "Μη διαθέσιμο", st_unknown: "Άγνωστο",
    play: "Αναπαραγωγή", pause: "Παύση", stop: "Διακοπή", next: "Επόμενο κομμάτι", previous: "Προηγούμενο κομμάτι", shuffle: "Τυχαία σειρά", repeat_off: "Χωρίς επανάληψη", repeat_all: "Επανάληψη όλων", repeat_one: "Επανάληψη κομματιού",
    mute: "Σίγαση", unmute: "Κατάργηση σίγασης", volume: "Ένταση", volume_down: "Μείωση έντασης", volume_up: "Αύξηση έντασης", power: "Ενεργοποίηση ή απενεργοποίηση", seek: "Θέση",
    nothing_playing: "Δεν παίζει τίποτα", source: "Πηγή", sound_mode: "Λειτουργία ήχου", rooms: "Δωμάτια", join: "Προσθήκη {name} στην ομάδα", leave: "Αφαίρεση {name} από την ομάδα",
    grouped: "Με {names}", ungroup_all: "Διάλυση ομάδας", confirm_ungroup: "Αφαίρεση όλων των ηχείων από την ομάδα του {name};", queue: "Ουρά", now_playing: "Παίζει τώρα", up_next: "Ακολουθεί",
    queue_loading: "Φόρτωση της ουράς…", queue_empty: "Η ουρά είναι κενή.", queue_error: "Δεν ήταν δυνατή η λήψη της ουράς.", queue_count: "Κομμάτια στην ουρά: {n}", favorites: "Αγαπημένα",
    play_favorite: "Αναπαραγωγή {name}", track_of: "Κομμάτι {n} από {total}", show_player: "Εμφάνιση {name}", cancel: "Ακύρωση", no_player: "Δεν βρέθηκε συσκευή αναπαραγωγής πολυμέσων.", unknown_entity: "Η συσκευή αναπαραγωγής δεν βρέθηκε",
    zoom_in: "Εμφάνιση λεπτομερειών", zoom_out: "Λιγότερα",
    entity: "Συσκευή αναπαραγωγής πολυμέσων", entities: "Δωμάτια (άλλες συσκευές, προαιρετικό)", title: "Τίτλος (προαιρετικός, προεπιλογή το όνομα της συσκευής)", show_title: "Εμφάνιση τίτλου", show_subtitle: "Εμφάνιση υπότιτλου",
    show_background: "Θολό φόντο εξωφύλλου", show_progress: "Εμφάνιση προόδου", show_controls: "Εμφάνιση κουμπιών ελέγχου", show_volume: "Εμφάνιση έντασης", show_rooms: "Εμφάνιση δωματίων και ομάδων",
    show_source: "Εμφάνιση πηγής και λειτουργίας ήχου", show_queue: "Εμφάνιση ουράς", show_favorites: "Εμφάνιση αγαπημένων", collapsed: "Ενότητες κλειστές από προεπιλογή", favorites_entity: "Αισθητήρας αγαπημένων (Sonos)",
    zoom: "Κουμπί λεπτομερειών", zoom_helper: "Κουμπί πάνω δεξιά: μεταβαίνει στην πλήρη κάρτα και πίσω", language: "Γλώσσα", lang_auto: "Αυτόματα (γλώσσα του Home Assistant)",
    media: "Πολυμέσα", players: "Αναπαραγωγείς (πολλοί, ο ένας κάτω από τον άλλο)", players_helper: "Δύο ή περισσότεροι: ένα μπλοκ ανά αναπαραγωγέα, ο ένας κάτω από τον άλλο", only_playing: "Μόνο οι αναπαραγωγείς που παίζουν", include_paused: "Και οι αναπαραγωγείς σε παύση", n_playing: "{n} σε αναπαραγωγή", players_count: "{n} αναπαραγωγείς", more_players: "Ακόμη {n}: {names}", back: "Πίσω σε όλους τους αναπαραγωγείς",
    movie: "Ταινία", last_called: "Τελευταία κλήση", next_alarm: "Ξυπνητήρι", next_timer: "Χρονόμετρο", next_reminder: "Υπενθύμιση", dnd: "Μην ενοχλείτε", speaker_group: "Ομάδα ηχείων", hide_idle_sessions: "Απόκρυψη ανενεργών συνεδριών Jellyfin",
    remote: "Τηλεχειριστήριο", r_up: "Πάνω", r_down: "Κάτω", r_left: "Αριστερά", r_right: "Δεξιά", r_select: "Επιλογή", r_menu: "Μενού", r_home: "Αρχική", r_play_pause: "Αναπαραγωγή / παύση", show_remote: "Εμφάνιση τηλεχειριστηρίου (Apple TV)",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

// True when the player announces every feature bit of `f` in its supported_features.
const has = (s, f) => ((Number(s?.attributes?.supported_features) || 0) & f) === f;
const offline = (s) => !s || s.state === "unavailable" || s.state === "unknown";
const isOff = (s) => s?.state === "off" || s?.state === "standby";
const isActive = (s) => s?.state === "playing" || s?.state === "paused" || s?.state === "buffering";

// 83 → "1:23", 3725 → "1:02:05".
const fmtTime = (sec) => {
  if (!Number.isFinite(sec) || sec < 0) return "";
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
};

// Current position in seconds: media_position as of media_position_updated_at, moved on while playing.
const position = (s, now = Date.now()) => {
  const a = s?.attributes || {};
  let p = Number(a.media_position);
  if (a.media_position === undefined || a.media_position === null || !Number.isFinite(p)) return null;
  const at = Date.parse(a.media_position_updated_at);
  if (s.state === "playing" && Number.isFinite(at)) p += Math.max(0, (now - at) / 1000);
  const d = Number(a.media_duration);
  if (d > 0) p = Math.min(p, d);
  return Math.max(0, p);
};

const duration = (s) => {
  const d = Number(s?.attributes?.media_duration);
  return d > 0 ? d : null;
};

// Volume as a whole percentage, null when the player does not report it.
const volPct = (s) => {
  const v = Number(s?.attributes?.volume_level);
  return s?.attributes?.volume_level === undefined || s?.attributes?.volume_level === null || !Number.isFinite(v) ? null : Math.round(v * 100);
};

// Player state → color class of the header icon and the status chip.
const statusClass = (state) => {
  switch (state) {
    case "playing":
    case "buffering":
      return "active";
    case "paused":
      return "warn";
    case "on":
    case "idle":
      return "ok";
    case "unavailable":
      return "crit";
    default:
      return "idle";
  }
};

// Kind of device: drawn picture and header icon.
const kindOf = (s) => {
  const c = s?.attributes?.device_class;
  return c === "tv" ? "tv" : c === "receiver" ? "receiver" : "speaker";
};

const platformOf = (hass, id) => hass?.entities?.[id]?.platform || "";
const nameOf = (hass, id) => hass?.states?.[id]?.attributes?.friendly_name || id;
const deviceOf = (hass, id) => {
  const d = hass?.entities?.[id]?.device_id;
  return d ? hass?.devices?.[d] || null : null;
};

// Jellyfin (core): one player per client session, with no device_class; its device's model is the client app.
const isJellyfin = (hass, id) => platformOf(hass, id) === "jellyfin";
// Alexa Media Player (custom alexa_media): a group of Echo speakers ("Everywhere", multiroom) has the model
// "Speaker Group" (WHA device family); Alexa cannot join or unjoin speakers from Home Assistant.
const isAlexa = (hass, id) => platformOf(hass, id) === "alexa_media";
const isAlexaGroup = (hass, id) => {
  if (!isAlexa(hass, id)) return false;
  const model = String(deviceOf(hass, id)?.model || "");
  return model === "Speaker Group" || /^WHA\b/.test(model);
};

// Apple TV (core apple_tv): Apple TV boxes, HomePods and AirPlay speakers; the device's model tells them apart.
const isAppleTv = (hass, id) => platformOf(hass, id) === "apple_tv";

// Remote entity of an Apple TV (the same device), whose remote.send_command takes up, down, left, right, select,
// menu, home and play_pause (pyatv's remote control).
const remoteOf = (hass, id) => {
  if (!isAppleTv(hass, id)) return null;
  const device = hass.entities?.[id]?.device_id;
  const base = id.slice(id.indexOf(".") + 1);
  const e = Object.values(hass.entities || {}).find(
    (x) => x?.platform === "apple_tv" && String(x.entity_id).startsWith("remote.") && ((device && x.device_id === device) || x.entity_id === `remote.${base}`),
  );
  return e && hass.states?.[e.entity_id] ? e.entity_id : null;
};

// Picture family of a player's device (its model in the device registry), "" for a generic picture.
const familyOf = (hass, id) => {
  const d = deviceOf(hass, id);
  return d ? pictureFamily(d.model, d.manufacturer, platformOf(hass, id)) : "";
};
const SCREEN_FAMILIES = new Set(["apple_tv", "echo_show", "echo_show_small"]);

// Kind of device of a player (header icon, generic picture): its device_class first, then its device's model; a
// Jellyfin session is a screen, an Apple TV device with apps (sources) too.
const kindFor = (hass, id, s) => {
  if (s?.attributes?.device_class) return kindOf(s);
  const family = familyOf(hass, id);
  if (family) return SCREEN_FAMILIES.has(family) ? "tv" : "speaker";
  if (isJellyfin(hass, id)) return "tv";
  if (isAppleTv(hass, id)) return Array.isArray(s?.attributes?.source_list) && s.attributes.source_list.length ? "tv" : "speaker";
  return kindOf(s);
};

// A Jellyfin session with nothing playing (an app left open somewhere): left out of the stack and of the rooms
// while `hide_idle_sessions` is on (default).
const idleSession = (hass, config, id) => config?.hide_idle_sessions !== false && isJellyfin(hass, id) && !isActive(hass?.states?.[id]);

// The Alexa entities of an Echo device: the do-not-disturb switch and the next alarm, timer and reminder sensors.
// Found on the same device by their translation key, else by the entity ids Alexa Media Player gives them.
const ALEXA_EXTRAS = { dnd: ["switch", "do_not_disturb"], alarm: ["sensor", "next_alarm"], timer: ["sensor", "next_timer"], reminder: ["sensor", "next_reminder"] };
const alexaExtras = (hass, id) => {
  if (!isAlexa(hass, id)) return null;
  const device = hass.entities?.[id]?.device_id;
  const base = id.slice(id.indexOf(".") + 1);
  const all = Object.values(hass.entities || {});
  const out = {};
  for (const [key, [domain, tkey]] of Object.entries(ALEXA_EXTRAS)) {
    const e = all.find(
      (x) =>
        x?.platform === "alexa_media" &&
        String(x.entity_id).startsWith(`${domain}.`) &&
        ((device && x.device_id === device && x.translation_key === tkey) || x.entity_id === `${domain}.${base}_${tkey}` || x.entity_id === `${domain}.${base}_${tkey}_switch`),
    );
    if (e && hass.states?.[e.entity_id]) out[key] = e.entity_id;
  }
  return out;
};

// Brand accent of the integrations that have one; the theme's primary color otherwise.
const ACCENTS = { spotify: "#1db954", plex: "#e5a00d", jellyfin: "#aa5cc3", music_assistant: "#3a8fde", alexa_media: "#00a8e1" };

// Apple TV remote section: its style goes with it too.
const REMOTE_STYLE = `
  .remote { display: flex; align-items: center; justify-content: center; gap: 24px; flex-wrap: wrap; padding: 4px 0; }
  .dpad { display: grid; grid-template-columns: repeat(3, 44px); grid-template-rows: repeat(3, 44px); gap: 4px; place-items: center; }
  .remote-keys { display: flex; flex-direction: column; gap: 8px; }`;

// Alexa row (badge, next alarm / timer / reminder, do not disturb): its style goes with it, so that the other
// players render exactly as before.
const ALEXA_STYLE = `
  .alexa { display: flex; align-items: center; gap: 8px; min-width: 0; font-size: 12px; color: var(--secondary-text-color); }
  .alexa-info { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; flex: 1; min-width: 0; }
  .alexa .next { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
  .alexa .next .icon { width: 16px; height: 16px; flex: none; }
  .alexa .tag { padding: 0 8px; border: 1px solid var(--mc-accent, var(--primary-color)); border-radius: 10px; color: var(--mc-accent, var(--primary-color)); font-size: 11px; font-weight: 500; line-height: 18px; white-space: nowrap; }
  .alexa.compact { gap: 6px; }
  .alexa.compact .alexa-info { gap: 2px 8px; }`;
const accentStyle = (hass, id) => {
  const a = ACCENTS[platformOf(hass, id)];
  return a ? `:host { --mc-accent: ${a}; }` : "";
};

// Artwork URL: the local proxy first (works from outside the network), made absolute for a remote frontend.
const artOf = (hass, s) => {
  const a = s?.attributes || {};
  const url = a.entity_picture_local || a.entity_picture;
  if (!url) return "";
  return url.startsWith("/") && typeof hass?.hassUrl === "function" ? hass.hassUrl(url) : url;
};

const playerIds = (hass) =>
  Object.keys(hass?.states || {})
    .filter((id) => id.startsWith("media_player."))
    .sort((a, b) => nameOf(hass, a).localeCompare(nameOf(hass, b)));

// The player to show: the room clicked in the card, else `entity`, else the first playing one, else the first one.
const findPlayer = (hass, config, active) => {
  const ids = playerIds(hass);
  if (!ids.length) return { error: "no_player" };
  const listed = listedPlayers(config);
  const want = active || config.entity || (listed.length === 1 ? listed[0] : null);
  if (want) return hass.states[want] ? { id: want } : { error: "unknown_entity" };
  return { id: ids.find((id) => hass.states[id].state === "playing") || ids.find((id) => !offline(hass.states[id])) || ids[0] };
};

// The `players` option: the players stacked in the card, as entity ids (strings or { entity }), in its order.
function listedPlayers(config) {
  const list = Array.isArray(config?.players) ? config.players : [];
  return [...new Set(list.map((e) => (typeof e === "string" ? e : e?.entity)).filter(Boolean))];
}

// Two players or more in `players`: the card stacks them (one player only is the same as `entity`).
const isStacked = (config) => listedPlayers(config).length >= 2;
const isPlaying = (s) => s?.state === "playing" || s?.state === "buffering";

// Players of the stacked view, in the order of the option. With `only_playing`, only the playing ones (and the
// paused ones with `include_paused`); the others are counted in `hidden`. When none of them plays, the one that
// changed last (the last one active) is shown, else the first one.
const stackedPlayers = (hass, config) => {
  const listed = listedPlayers(config).filter((id) => hass?.states?.[id]);
  // Idle Jellyfin sessions join the hidden ones (unless every listed player is one of them).
  const idle = listed.filter((id) => idleSession(hass, config, id));
  const ids = idle.length < listed.length ? listed.filter((id) => !idle.includes(id)) : listed;
  const asleep = ids === listed ? [] : idle;
  if (!config.only_playing) return { shown: ids, hidden: asleep };
  const on = (id) => isPlaying(hass.states[id]) || (config.include_paused === true && hass.states[id].state === "paused");
  let shown = ids.filter(on);
  if (!shown.length && ids.length) {
    const changed = (id) => Date.parse(hass.states[id].last_changed) || 0;
    const last = ids.filter((id) => !offline(hass.states[id])).sort((a, b) => changed(b) - changed(a))[0];
    shown = [last || ids[0]];
  }
  return { shown, hidden: [...ids.filter((id) => !shown.includes(id)), ...asleep] };
};

const groupOf = (s) => (Array.isArray(s?.attributes?.group_members) ? s.attributes.group_members : []);

// Rooms of the card: the `entities` option, else, for a player that can group, every player of the same
// integration that can group too (the speakers it can be joined with).
const roomIds = (hass, config, mainId) => {
  const listed = (Array.isArray(config.entities) ? config.entities : []).map((e) => (typeof e === "string" ? e : e?.entity)).filter(Boolean);
  if (listed.length) return [...new Set([mainId, ...listed])].filter((id) => hass.states[id] && (id === mainId || !idleSession(hass, config, id)));
  const main = hass.states[mainId];
  if (!has(main, F.GROUPING)) return [];
  const platform = platformOf(hass, mainId);
  const peers = playerIds(hass).filter(
    (id) => id !== mainId && has(hass.states[id], F.GROUPING) && (!platform || !platformOf(hass, id) || platformOf(hass, id) === platform),
  );
  for (const m of groupOf(main)) if (m !== mainId && hass.states[m] && !peers.includes(m)) peers.push(m);
  return peers.length ? [mainId, ...peers] : [];
};

// Music Assistant players expose their queue through the music_assistant.get_queue service.
const isMusicAssistant = (hass, id) => {
  const s = hass.states[id];
  return platformOf(hass, id) === "music_assistant" || s?.attributes?.mass_player_type !== undefined || s?.attributes?.active_queue !== undefined;
};

// Favorites: the `favorites` option, then the items of a favorites sensor (Sonos: sensor.sonos_favorites, an
// `items` attribute of { item id: title }), found by itself for a Sonos player or given by `favorites_entity`.
const favoritesSensor = (hass, config, mainId) => {
  if (config.favorites_entity) return hass.states[config.favorites_entity] ? config.favorites_entity : null;
  if (platformOf(hass, mainId) !== "sonos") return null;
  return (
    Object.keys(hass.states).find(
      (id) => id.startsWith("sensor.") && platformOf(hass, id) === "sonos" && hass.states[id].attributes?.items && typeof hass.states[id].attributes.items === "object",
    ) || null
  );
};

const favoritesOf = (hass, config, mainId) => {
  const own = (Array.isArray(config.favorites) ? config.favorites : [])
    .filter((f) => f?.media_content_id)
    .map((f) => ({
      name: String(f.name || f.media_content_id),
      media_content_id: String(f.media_content_id),
      media_content_type: String(f.media_content_type || "music"),
      image: f.image || "",
    }));
  const sensor = favoritesSensor(hass, config, mainId);
  const items = sensor ? hass.states[sensor].attributes.items || {} : {};
  const sonos = Object.entries(items).map(([id, title]) => ({ name: String(title), media_content_id: id, media_content_type: "favorite_item_id", image: "" }));
  return [...own, ...sonos];
};

// URL for a CSS url('…') in a style attribute: the entity escapes of esc() are decoded before the CSS is read, so
// the characters that could close the url() or the declaration are percent-encoded first.
const cssUrl = (u) => esc(String(u).replace(/["'()\\\s;]/g, (c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`));

const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;

const sameDeps = (a, b) => !!a && !!b && a.length === b.length && a.every((d, i) => d === b[i]);

// ---------------------------------------------------------------------------
// Drawn pictures, for a player with no artwork: a speaker, a TV or a receiver, animated by what it is doing
// (the woofer beats and sound waves leave the speaker, the TV screen glows, the receiver's level meter moves).
// Inline SVG in the card's shadow root: its animations are the card's own (and honour prefers-reduced-motion).
// ---------------------------------------------------------------------------

const FINISH = { light: ["#f6f7f8", "#c9cdd2", "#9aa0a6"], dark: ["#4a4e55", "#26292d", "#7d838a"] };

const speakerSvg = (on, f) => `<svg class="pic" viewBox="0 0 140 120" aria-hidden="true">
  <defs><linearGradient id="mc-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${f[0]}"/><stop offset="1" stop-color="${f[1]}"/></linearGradient></defs>
  <ellipse cx="70" cy="114" rx="30" ry="4" fill="#000" opacity=".14"/>
  <rect x="40" y="6" width="60" height="104" rx="14" fill="url(#mc-body)" stroke="${f[2]}" stroke-width="1.2"/>
  <circle cx="70" cy="30" r="9" fill="${f[1]}" stroke="${f[2]}"/><circle cx="70" cy="30" r="3.5" fill="${f[2]}"/>
  <g class="cone${on ? " beat" : ""}"><circle cx="70" cy="74" r="24" fill="${f[1]}" stroke="${f[2]}"/><circle cx="70" cy="74" r="15" fill="${f[2]}" opacity=".55"/><circle cx="70" cy="74" r="6" fill="${f[1]}"/></g>
  ${
    on
      ? `<g class="waves" fill="none" stroke="var(--mc-accent)" stroke-width="3" stroke-linecap="round">
    <path class="wave" d="M108 56a26 26 0 0 1 0 36"/><path class="wave d1" d="M116 48a38 38 0 0 1 0 52"/>
    <path class="wave" d="M32 56a26 26 0 0 0 0 36"/><path class="wave d1" d="M24 48a38 38 0 0 0 0 52"/></g>`
      : ""
  }
</svg>`;

const tvSvg = (on, f) => `<svg class="pic" viewBox="0 0 140 120" aria-hidden="true">
  <defs><linearGradient id="mc-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--mc-accent)"/><stop offset="1" stop-color="#7e57c2"/></linearGradient></defs>
  <ellipse cx="70" cy="112" rx="34" ry="4" fill="#000" opacity=".14"/>
  <rect x="8" y="12" width="124" height="78" rx="7" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  <rect x="13" y="17" width="114" height="68" rx="3" fill="#101317"/>
  ${on ? `<rect class="glow" x="13" y="17" width="114" height="68" rx="3" fill="url(#mc-screen)" opacity=".85"/><path class="glow d1" d="M13 62L42 40L64 58L88 34L127 66V85H13Z" fill="#fff" opacity=".18"/>` : ""}
  <path d="M60 90h20l5 14H55z" fill="${f[1]}" stroke="${f[2]}"/><rect x="40" y="103" width="60" height="5" rx="2.5" fill="${f[1]}" stroke="${f[2]}"/>
</svg>`;

const receiverSvg = (on, f) => `<svg class="pic" viewBox="0 0 140 120" aria-hidden="true">
  <ellipse cx="70" cy="96" rx="58" ry="4" fill="#000" opacity=".14"/>
  <rect x="8" y="30" width="124" height="62" rx="6" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  <rect x="18" y="44" width="62" height="22" rx="3" fill="#101317"/>
  ${on ? `<rect class="glow" x="18" y="44" width="62" height="22" rx="3" fill="var(--mc-accent)" opacity=".35"/>` : ""}
  <g fill="var(--mc-accent)" opacity="${on ? 1 : 0.25}">${[0, 1, 2, 3, 4, 5, 6]
    .map((i) => `<rect class="${on ? `meter m${i % 4}` : ""}" x="${23 + i * 8}" y="48" width="5" height="14" rx="1"/>`)
    .join("")}</g>
  <circle cx="108" cy="58" r="15" fill="${f[0]}" stroke="${f[2]}"/><circle cx="108" cy="58" r="10" fill="${f[1]}"/><rect x="107" y="46" width="2" height="7" rx="1" fill="${f[2]}"/>
  <g fill="${f[2]}">${[0, 1, 2, 3].map((i) => `<circle cx="${24 + i * 12}" cy="78" r="3"/>`).join("")}</g>
</svg>`;

const PICTURES = { speaker: speakerSvg, tv: tvSvg, receiver: receiverSvg };

// Device pictures by model family: original, stylized silhouettes of the general shape of a device (a sphere, a
// cylinder, a box), with no logo, brand or product name, drawn for this card. Only their lights move, and only
// while playing: a soft pulse (mc-glow, 1.8 s), stopped by prefers-reduced-motion. The body follows the theme's
// grays (FINISH); the lights keep their own color: cyan rings for the cylinders and spheres, a violet top for the
// mesh speakers. `front`: the straight-on view of the mini card (where a family has one).
const LIGHT = { cyan: "#22c3e6", violet: "#9b6dff" };
const svgPic = (body) => `<svg class="pic" viewBox="0 0 140 120" aria-hidden="true">${body}</svg>`;
const shadow = (rx, y = 112) => `<ellipse cx="70" cy="${y}" rx="${rx}" ry="4" fill="#000" opacity=".14"/>`;
const lit = (on) => (on ? ` class="glow"` : "");
const lightOpacity = (on) => (on ? 1 : 0.22);
// Fine horizontal lines of a fabric cover.
const fabric = (x, y, w, h, f, step = 5) =>
  Array.from({ length: Math.floor(h / step) }, (_, i) => `<line x1="${x}" y1="${(y + (i + 0.5) * step).toFixed(1)}" x2="${x + w}" y2="${(y + (i + 0.5) * step).toFixed(1)}" stroke="${f[2]}" stroke-width=".7" opacity=".5"/>`).join(
    "",
  );
// Rows of small dots of a mesh cover that follow the curve of a sphere (centre cx, cy, radius r) from y0 to y1.
const meshDots = (cx, cy, r, y0, y1, f, gap = 6) => {
  const out = [];
  for (let y = y0 + gap / 2; y < y1; y += gap) {
    const w = Math.sqrt(Math.max(0, r * r - (y - cy) ** 2)) - 3;
    const n = Math.max(1, Math.round((Math.PI * w) / gap / 1.6));
    for (let i = 0; i <= n; i++) {
      const x = cx + w * Math.sin(-Math.PI / 2 + (Math.PI * i) / n);
      out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r=".95" fill="${f[2]}" opacity=".55"/>`);
    }
  }
  return out.join("");
};

// Classic cylinder: a fabric body with a cyan light ring on its top edge.
const cylinderSvg = (on, f) =>
  svgPic(`${shadow(28)}
  <path d="M48 16V102a22 6 0 0 0 44 0V16z" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  ${fabric(50, 40, 40, 62, f)}
  <ellipse cx="70" cy="16" rx="22" ry="6" fill="${f[0]}" stroke="${f[2]}" stroke-width="1.2"/>
  <ellipse${lit(on)} cx="70" cy="16" rx="19" ry="4.2" fill="none" stroke="${LIGHT.cyan}" stroke-width="3" opacity="${lightOpacity(on)}"/>`);

// Large cylinder with rounded corners and a light slit at the top.
const studioSvg = (on, f) =>
  svgPic(`${shadow(40)}
  <rect x="32" y="14" width="76" height="96" rx="16" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  ${fabric(36, 34, 68, 70, f)}
  <rect x="36" y="16" width="68" height="14" rx="7" fill="${f[0]}" opacity=".7"/>
  <rect${lit(on)} x="46" y="21" width="48" height="4" rx="2" fill="${LIGHT.cyan}" opacity="${lightOpacity(on)}"/>`);

// Sphere with a cyan light ring along its base.
const sphereSvg = (on, f) =>
  svgPic(`${shadow(36, 110)}
  <path d="M33 96a42 42 0 1 1 74 0z" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  ${meshDots(70, 70, 42, 34, 92, f)}
  <path d="M33 96h74a37 7 0 0 1 -74 0z" fill="${f[0]}" stroke="${f[2]}"/>
  <path${lit(on)} d="M36 98a34 5 0 0 0 68 0" fill="none" stroke="${LIGHT.cyan}" stroke-width="3" stroke-linecap="round" opacity="${lightOpacity(on)}"/>`);

// Low puck (older small speaker): a short cylinder with a cyan light ring on its top.
const puckSvg = (on, f) =>
  svgPic(`${shadow(46, 96)}
  <path d="M24 60v22a46 12 0 0 0 92 0V60z" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  ${fabric(26, 66, 88, 16, f, 4)}
  <ellipse cx="70" cy="60" rx="46" ry="12" fill="${f[0]}" stroke="${f[2]}" stroke-width="1.2"/>
  <ellipse${lit(on)} cx="70" cy="60" rx="42" ry="10" fill="none" stroke="${LIGHT.cyan}" stroke-width="3" opacity="${lightOpacity(on)}"/>
  <g fill="${f[2]}" opacity=".6"><circle cx="56" cy="58" r="2.2"/><circle cx="70" cy="55" r="2.2"/><circle cx="84" cy="58" r="2.2"/><circle cx="70" cy="64" r="2.2"/></g>`);

// Half sphere on its flat side, with a light bar on its front.
const domeSvg = (on, f) =>
  svgPic(`${shadow(46, 104)}
  <path d="M24 100a46 46 0 0 1 92 0z" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  ${meshDots(70, 100, 46, 58, 98, f)}
  <rect x="24" y="99" width="92" height="5" rx="2.5" fill="${f[0]}" stroke="${f[2]}"/>
  <rect${lit(on)} x="54" y="92" width="32" height="4" rx="2" fill="${LIGHT.cyan}" opacity="${lightOpacity(on)}"/>`);

// Smart display: a screen leaning back on a trapezoid base; a blue screen with a few white lines, a light bar below
// (`big`: the wider variant).
const displaySvg = (big) => (on, f) => {
  const w = big ? 110 : 78;
  const x = 70 - w / 2;
  return svgPic(`${shadow(w / 2 - 6, 108)}
  <path d="M${x + 10} 106L${x + 20} 62H${x + w - 20}L${x + w - 10} 106z" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  ${fabric(x + 16, 68, w - 32, 36, f)}
  <path d="M${x} 16H${x + w}l-6 62H${x + 6}z" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  <path d="M${x + 5} 20H${x + w - 5}l-5 50H${x + 10}z" fill="${on ? "#1f5fbf" : "#101317"}"/>
  ${
    on
      ? `<g stroke="#fff" stroke-linecap="round" opacity=".85"><line x1="${x + 18}" y1="34" x2="${x + w * 0.55}" y2="34" stroke-width="3"/><line x1="${x + 18}" y1="44" x2="${x + w * 0.42}" y2="44" stroke-width="2"/><line x1="${x + 18}" y1="54" x2="${x + w * 0.62}" y2="54" stroke-width="2"/></g>`
      : ""
  }
  <rect${lit(on)} x="${x + 18}" y="73" width="${w - 36}" height="3" rx="1.5" fill="${LIGHT.cyan}" opacity="${lightOpacity(on)}"/>`);
};

// Tall mesh speaker: a cylinder with very rounded edges, fine horizontal mesh lines, a violet halo on top.
const meshTallSvg = (on, f) =>
  svgPic(`${shadow(36)}
  <rect x="38" y="12" width="64" height="98" rx="28" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  ${fabric(42, 28, 56, 70, f, 3.5)}
  <ellipse cx="70" cy="20" rx="22" ry="5" fill="${f[0]}" stroke="${f[2]}"/>
  <ellipse${lit(on)} cx="70" cy="20" rx="14" ry="3" fill="${LIGHT.violet}" opacity="${on ? 0.95 : 0.2}"/>`);

// Small mesh speaker: a nearly whole sphere cut flat at the top (its touch surface) and at the bottom (where it
// stands), with rows of mesh dots. Seen slightly from above (the full card: the top ellipse, its glowing surface and
// small + and − marks), or straight on (`front`, the mini card: the top is a flat line with its light).
const meshSmallSvg = (on, f, front = false) => {
  const cx = 70;
  const cy = 66;
  const r = 44;
  const top = 30;
  const bottom = 104;
  const half = (y) => Math.sqrt(r * r - (y - cy) ** 2);
  const tw = half(top);
  const bw = half(bottom);
  const body = `M${cx - tw} ${top}A${r} ${r} 0 0 0 ${cx - bw} ${bottom}H${cx + bw}A${r} ${r} 0 0 0 ${cx + tw} ${top}z`;
  const topFace = front
    ? `<rect x="${cx - tw}" y="${top - 1.5}" width="${tw * 2}" height="3" rx="1.5" fill="${f[0]}" stroke="${f[2]}" stroke-width=".8"/>
       <rect${lit(on)} x="${cx - tw + 6}" y="${top - 1}" width="${tw * 2 - 12}" height="2" rx="1" fill="${LIGHT.violet}" opacity="${lightOpacity(on)}"/>`
    : `<ellipse cx="${cx}" cy="${top}" rx="${tw}" ry="7" fill="${f[0]}" stroke="${f[2]}" stroke-width="1"/>
       <ellipse${lit(on)} cx="${cx}" cy="${top}" rx="${tw - 5}" ry="4.6" fill="${LIGHT.violet}" opacity="${on ? 0.9 : 0.18}"/>
       <g stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity="${on ? 0.95 : 0.7}"><line x1="${cx - 13}" y1="${top}" x2="${cx - 9}" y2="${top}"/><line x1="${cx + 9}" y1="${top}" x2="${cx + 13}" y2="${top}"/><line x1="${cx + 11}" y1="${top - 2}" x2="${cx + 11}" y2="${top + 2}"/></g>`;
  return svgPic(`${shadow(bw + 6, bottom + 4)}
  <path d="${body}" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  ${meshDots(cx, cy, r, top + (front ? 2 : 6), bottom - 2, f)}
  <path d="M${cx - bw} ${bottom}H${cx + bw}" stroke="${f[2]}" stroke-width="1.2"/>
  ${topFace}`);
};

// Streaming box: a low square box with rounded corners and a small white status light that blinks; while a video
// plays, a small stylized screen with a play triangle shows above it.
const boxSvg = (on, f) =>
  svgPic(`${shadow(42, 108)}
  ${
    on
      ? `<rect x="34" y="8" width="72" height="44" rx="5" fill="#101317" stroke="${f[2]}"/><rect class="glow" x="38" y="12" width="64" height="36" rx="3" fill="#1f5fbf"/><path d="M64 22L80 30L64 38z" fill="#fff"/>`
      : ""
  }
  <path d="M30 72L42 62H110L98 72z" fill="${f[0]}" stroke="${f[2]}" stroke-width="1.2" stroke-linejoin="round"/>
  <rect x="30" y="72" width="68" height="32" rx="6" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2"/>
  <path d="M98 72L110 62V94Q110 98 106 100L98 104z" fill="${f[1]}" stroke="${f[2]}" stroke-width="1.2" stroke-linejoin="round" opacity=".85"/>
  <circle${lit(on)} cx="38" cy="96" r="2" fill="${on ? "#fff" : f[2]}" stroke="${f[2]}" stroke-width=".5"/>`);

const DEVICE_PICTURES = {
  echo: cylinderSvg,
  echo_studio: studioSvg,
  echo_dot: sphereSvg,
  echo_dot_puck: puckSvg,
  echo_pop: domeSvg,
  echo_show: displaySvg(true),
  echo_show_small: displaySvg(false),
  homepod: meshTallSvg,
  homepod_mini: meshSmallSvg,
  apple_tv: boxSvg,
};

// Model (device registry) → picture family: tolerant (case, spacing, generation suffix), Amazon and Apple devices
// only (manufacturer, or the integration when the manufacturer is not set). Anything else keeps the generic picture.
const AMAZON_MODELS = [
  [/echo\s*(show\s*(5|8)\b|spot)/i, "echo_show_small"],
  [/echo\s*show/i, "echo_show"],
  [/echo\s*studio/i, "echo_studio"],
  [/echo\s*pop/i, "echo_pop"],
  [/echo\s*dot(?!.*clock).*(gen\s*[1-3]\b|\b[1-3](st|nd|rd)\s*gen)/i, "echo_dot_puck"],
  [/echo\s*dot/i, "echo_dot"],
  [/^echo\s*\(?\s*(gen\s*[45]|[45]th\s*gen)/i, "echo_dot"],
  [/^echo(\s*plus)?(\s*\(.*\))?\s*$/i, "echo"],
];
const APPLE_MODELS = [
  [/homepod\s*mini/i, "homepod_mini"],
  [/homepod/i, "homepod"],
  [/apple\s*tv/i, "apple_tv"],
];
const pictureFamily = (model, manufacturer, platform = "") => {
  const m = String(model || "").trim();
  if (!m) return "";
  const maker = String(manufacturer || "").toLowerCase();
  const amazon = maker ? maker.includes("amazon") : platform === "alexa_media";
  const apple = maker ? maker.includes("apple") : platform === "apple_tv";
  const list = [...(amazon ? AMAZON_MODELS : []), ...(apple ? APPLE_MODELS : [])];
  return list.find(([re]) => re.test(m))?.[1] || "";
};

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
const ANIM_STYLE = `
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

const BASE_STYLE = `
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
const DIALOG_STYLE = `
  ha-card.dialog-open { min-height: 160px; }
  .dialog-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
                     padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 340px); max-height: calc(100% - 24px);
           box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4); display: flex; flex-direction: column; gap: 12px; }
  .modal .msg { font-size: 14px; line-height: 1.4; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
`;

const FULL_STYLE = `
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

const MINI_STYLE = `
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
const STACK_STYLE = `
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

const LIST_STYLE = `
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
const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);
const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};

// Elements a click acts on, and how one is told from the others across renders (focus kept for keyboard users).
const FOCUS_SELECTOR = "[data-action], [data-entity], input[type=range]";
const focusKey = (el) => {
  const data = Object.entries({ ...el.dataset });
  return data.length ? `${el.tagName}|${JSON.stringify(data)}` : "";
};

// Clicks that send a command to a player: none while it is unavailable.
const PLAYER_ACTIONS = new Set(["play", "pause", "stop", "next", "previous", "shuffle", "repeat", "mute", "vol_down", "vol_up", "power", "seek", "source", "sound_mode", "favorite", "queue_next", "join", "leave"]);
const REPEAT_NEXT = { off: "all", all: "one", one: "off" };

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

class MediaBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    const root = this.shadowRoot;
    root.addEventListener("click", (ev) => this._onClick(ev));
    root.addEventListener("keydown", (ev) => this._onKeyDown(ev));
    // Volume sliders: the label follows while dragging, the volume is set once released.
    root.addEventListener("input", (ev) => this._onInput(ev));
    root.addEventListener("change", (ev) => this._onChange(ev));
    root.addEventListener("pointerdown", (ev) => {
      if (ev.target?.type !== "range") return;
      this._dragging = true;
      window.addEventListener("pointerup", this._onRelease, true);
      window.addEventListener("pointercancel", this._onRelease, true);
    });
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

  _deps() {
    const h = this._hass;
    if (!h || !this._config) return null;
    const { id } = findPlayer(h, this._config, this._active);
    if (!id) return null;
    const ids = [id, ...roomIds(h, this._config, id), ...groupOf(h.states[id]), favoritesSensor(h, this._config, id), ...listedPlayers(this._config)];
    // Alexa: the switch and sensors of each Echo shown.
    // Apple TV: its remote entity.
    const extras = ids.flatMap((i) => (i ? [...Object.values(alexaExtras(h, i) || {}), remoteOf(h, i)] : []));
    return [h.entities, h.devices, h.language, h.locale, h.themes?.darkMode, this._active, ...[...ids, ...extras].map((i) => h.states[i])];
  }

  connectedCallback() {
    // A click elsewhere on the page folds the sections back to their defaults and closes the popup.
    this._onOutside ??= (ev) => {
      if ((!this._toggled?.size && !this._confirm) || !isOutside(this, ev)) return;
      this._toggled = new Map();
      if (this._confirm) this._closeConfirm();
      else this._update();
    };
    document.addEventListener("click", this._onOutside, true);
    if (this._confirm) window.addEventListener("keydown", this._onKey);
    // The position moves on its own while playing: only the progress bar and its time are updated every second.
    clearInterval(this._ticker);
    this._ticker = setInterval(() => this._tick(), 1000);
  }

  disconnectedCallback() {
    clearInterval(this._ticker);
    this._ticker = null;
    document.removeEventListener("click", this._onOutside, true);
    window.removeEventListener("keydown", this._onKey);
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
    return id ? this._hass.states[id] : undefined;
  }

  // Service call whose failure Home Assistant already reports (toast): handled here so that it does not end up as
  // "Uncaught (in promise)". `onError` undoes what the card showed meanwhile.
  _call(service, data, onError, domain = "media_player") {
    return Promise.resolve(this._hass.callService(domain, service, data)).catch(() => onError?.());
  }

  _update() {
    if (!this._hass || !this._config) return;
    // No rewrite under a slider being dragged: it would drop it from under the pointer. Done once released.
    if (this._dragging) {
      this._dirty = true;
      return;
    }
    let html = this._render();
    if (this._confirm) {
      html = html.replace(/<ha-card>([\s\S]*)<\/ha-card>\s*$/, (_, inner) => `<ha-card class="dialog-open">${inner}${this._confirmHtml()}</ha-card>`);
    }
    // The position is not in the HTML (it changes on every update of media_position): painted after the render.
    if (html === this._html) return this._afterRender();
    const focused = this._confirm && this.shadowRoot.activeElement?.dataset?.action;
    const kept = this._confirm ? null : this._focusedSpot();
    this._html = html;
    this.shadowRoot.innerHTML = html;
    this._afterRender(true);
    if (kept) this._focusables(kept.key)[kept.index]?.focus({ preventScroll: true });
    if (this._confirm) {
      const sel = focused === "confirm_cancel" ? '[data-action="confirm_cancel"]' : ".modal .primary";
      this.shadowRoot.querySelector(sel)?.focus({ preventScroll: true });
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
      if (v) el.style.width = `${((v.p / v.d) * 100).toFixed(2)}%`;
    }
    for (const el of this.shadowRoot.querySelectorAll("[data-elapsed]")) {
      const v = at(el, "elapsed");
      if (v) el.textContent = fmtTime(v.p);
    }
    for (const el of this.shadowRoot.querySelectorAll('[role="slider"][data-action="seek"]')) {
      const v = at(el, "target");
      if (!v) continue;
      el.setAttribute("aria-valuenow", String(Math.round(v.p)));
      el.setAttribute("aria-valuetext", `${fmtTime(v.p)} / ${fmtTime(v.d)}`);
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
        // Apple TV: the target is the device's remote entity, the value the command.
        return this._call("send_command", { entity_id: id, command: el.dataset.value }, null, "remote");
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

  _openConfirm(confirm) {
    this._confirm = confirm;
    window.addEventListener("keydown", this._onKey);
    this._update();
    this.shadowRoot.querySelector(".modal .primary")?.focus();
  }

  _closeConfirm() {
    this._confirm = null;
    this._confirmClosedAt = Date.now();
    window.removeEventListener("keydown", this._onKey);
    this._update();
  }

  _confirmHtml() {
    const c = this._confirm;
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
    const disc = isActive(s) ? `<div class="vinyl ${st === "playing" ? "playing" : ""}"></div>` : "";
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

  _meta(s, id = "") {
    const a = s?.attributes || {};
    const title = a.media_title || (s?.state === "on" || s?.state === "idle" ? a.source || a.app_name : "") || this._t("nothing_playing");
    const artist = (id && this._videoLine(id, s)) || a.media_artist || a.media_album_artist || a.media_series_title || a.media_channel || "";
    const extra = [a.media_album_name];
    if (Number(a.queue_size) > 1 && Number.isFinite(Number(a.queue_position))) extra.push(this._t("track_of", { n: a.queue_position, total: a.queue_size }));
    const album = extra.filter(Boolean).join(" · ");
    return `<div class="meta"><div class="track" title="${esc(title)}">${esc(title)}</div>${artist ? `<div class="artist">${esc(artist)}</div>` : ""}${album ? `<div class="album">${esc(album)}</div>` : ""}</div>`;
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

class MediaCard extends MediaBase {
  static getConfigElement() {
    return document.createElement("media-card-editor");
  }

  static getStubConfig(hass) {
    const { id } = hass ? findPlayer(hass, {}) : {};
    return id ? { entity: id } : {};
  }

  getCardSize() {
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
    if (c.show_volume !== false) parts.push(this._volume(id, s));
    if (c.show_remote === true) parts.push(this._remote(id));
    if (c.show_rooms !== false) parts.push(this._rooms(id, s));
    if (c.show_source !== false) parts.push(this._sources(id, s));
    if (c.show_queue !== false) parts.push(this._queueSection(id));
    if (c.show_favorites !== false) parts.push(this._favorites(id, s));
    const bg = art && c.show_background !== false ? `<div class="backdrop-art" style="background-image:url('${cssUrl(art)}')"></div>` : "";
    return `<style>${ANIM_STYLE}${BASE_STYLE}${FULL_STYLE}${accentStyle(this._hass, id)}</style>
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
      if (c.show_volume !== false) parts.push(this._volume(id, s));
      return `<div class="player">${parts.filter(Boolean).join("")}</div>`;
    });
    return `<style>${ANIM_STYLE}${BASE_STYLE}${FULL_STYLE}${STACK_STYLE}</style>
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
            <div class="room-sub">${esc(sub)}</div>
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

  // Apple TV remote (`show_remote`): a direction pad with select, then menu, home and play / pause, sent to the
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
            f.image ? `<img src="${esc(f.image)}" alt="">` : svgIcon(ICONS.star)
          }</span><span>${esc(f.name)}</span></button>`,
      );
      return `<div class="favs">${tiles.join("")}</div>`;
    });
  }
}

// The mini card is a full card drawn compact: its detail button (top right, `zoom: false` removes it) switches it
// to the full card's content and back, and a click anywhere else on the page brings the compact view back.
class MediaMiniCard extends MediaCard {
  constructor() {
    super();
    this._onUnzoom = (ev) => {
      if (this._zoomed && isOutside(this, ev)) this._setZoom(false);
    };
  }

  static getConfigElement() {
    return document.createElement("media-mini-card-editor");
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this._onUnzoom, true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this._onUnzoom, true);
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
    // Back to the compact list: a player opened from the stack closes too.
    if (!on && isStacked(this._config)) this._active = null;
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
    const controls = c.show_controls !== false ? this._controls(s, true) : "";
    return `<style>${ANIM_STYLE}${BASE_STYLE}${MINI_STYLE}${accentStyle(this._hass, id)}</style>
      <ha-card>
        ${this._header(id, s)}
        <div class="content">
          <div class="row">${this._art(id, s, { front: true })}${this._meta(s, id)}${controls ? `<div class="controls">${controls}</div>` : ""}</div>
          ${c.show_progress !== false ? this._progress(id, s, false) : ""}${this._alexaRow(id, s, true)}
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
            c.show_volume !== false ? this._volume(id, s) : "",
          ]
            .filter((p) => p && p !== '<div class="controls"></div>')
            .join("")
        : "";
      return `<div class="pitem${open ? " open" : ""}">
          <div class="prow">${this._art(id, s, { front: true })}<div class="prow-main clickable" role="button" tabindex="0" data-action="expand_player" data-target="${esc(id)}" aria-expanded="${open}"><div class="prow-name">${esc(
            nameOf(this._hass, id),
          )}</div><div class="prow-sub">${esc(sub)}</div></div>${play}${vol}</div>${detail}
        </div>`;
    });
    return `<style>${ANIM_STYLE}${BASE_STYLE}${MINI_STYLE}${STACK_STYLE}${LIST_STYLE}</style>
      <ha-card>
        ${this._stackHeader()}
        <div class="content"><div class="plist">${rows.join("")}</div>${this._hiddenRow(hidden)}</div>
      </ha-card>`;
  }
}

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

const LANGUAGES = [
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

const HELPERS = { zoom: "zoom_helper", players: "players_helper" };

// Several players stacked in the card (both editors).
const PLAYERS_FIELD = { name: "players", selector: { entity: { domain: "media_player", multiple: true } } };

class MediaEditorBase extends HTMLElement {
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

class MediaCardEditor extends MediaEditorBase {
  static get toggles() {
    return [
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
      ["hide_idle_sessions", true],
    ];
  }

  static get defaults() {
    return { collapsed: DEFAULT_COLLAPSED };
  }

  static extraFields(tr) {
    return [
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

class MediaMiniCardEditor extends MediaEditorBase {
  static get toggles() {
    return [
      ["show_title", true],
      ["show_subtitle", true],
      ["show_progress", true],
      ["show_controls", true],
      ["show_volume", true],
      ["zoom", true],
      ["show_remote", false],
      ["only_playing", false],
      ["include_paused", false],
      ["hide_idle_sessions", true],
    ];
  }

  static extraFields() {
    return [PLAYERS_FIELD];
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
};
define("media-card", MediaCard);
define("media-mini-card", MediaMiniCard);
define("media-card-editor", MediaCardEditor);
define("media-mini-card-editor", MediaMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  {
    type: "media-card",
    name: "Media Card",
    description: "Media player and multiroom speakers: artwork, progress, controls, volume per room, speaker groups, source, queue and favorites.",
  },
  {
    type: "media-mini-card",
    name: "Media Mini Card",
    description: "Compact media player: artwork, track, play / pause, next and volume.",
  },
]) {
  if (!window.customCards.some((c) => c.type === card.type)) window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-media-card" });
}

console.info(`%c MEDIA-CARD %c v${VERSION} `, "color: white; background: #03a9f4; font-weight: 700;", "color: #03a9f4; background: white; font-weight: 700;");
