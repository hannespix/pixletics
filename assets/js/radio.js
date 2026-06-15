// Internet-Radio über ein HTML5-<audio>-Element. Spielt direkte HTTPS-Streams
// (MP3/AAC/Icecast) – ganz ohne Login, Key oder Premium. Funktioniert auf
// statischen Seiten (GitHub Pages). Lautstärke wird bei Ansagen gedämpft.
export class Radio {
  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'none';
    // Kein crossOrigin setzen: fürs reine Abspielen ist CORS nicht nötig, und
    // viele Radio-Streams senden keine CORS-Header (würden sonst blockiert).
    this.audio.volume = 0.8;
    this.current = null;       // aktuell gewählter Sender (Objekt)
    this._duckRestore = null;
    this.onState = null;       // Callback(stateString)
    this.audio.addEventListener('playing', () => this._emit('playing'));
    this.audio.addEventListener('pause', () => this._emit('paused'));
    this.audio.addEventListener('waiting', () => this._emit('loading'));
    this.audio.addEventListener('error', () => this._emit('error'));
  }

  get playing() {
    return !!this.audio.src && !this.audio.paused;
  }

  // Sender starten (live: immer neu verbinden, kein echtes "Resume").
  play(station) {
    const s = station || this.current;
    if (!s) return;
    this.current = s;
    this._emit('loading');
    this.audio.src = s.url;
    const p = this.audio.play();
    if (p && p.catch) p.catch(() => this._emit('error'));
  }

  stop() {
    this.audio.pause();
    this.audio.removeAttribute('src');
    try { this.audio.load(); } catch {}
    this._emit('stopped');
  }

  // Umschalten: läuft etwas -> stoppen, sonst gewählten Sender starten.
  toggle(station) {
    if (this.playing) this.stop();
    else this.play(station);
  }

  // Bei Ansagen leiser machen und danach wiederherstellen.
  duck() {
    if (this._duckRestore == null) this._duckRestore = this.audio.volume;
    this.audio.volume = Math.min(this.audio.volume, 0.12);
  }
  unduck() {
    if (this._duckRestore == null) return;
    this.audio.volume = this._duckRestore;
    this._duckRestore = null;
  }

  setVolume(v) {
    const vol = Math.max(0, Math.min(1, v));
    if (this._duckRestore != null) this._duckRestore = vol;
    else this.audio.volume = vol;
  }

  _emit(state) {
    if (this.onState) this.onState(state);
  }
}
