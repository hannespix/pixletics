// Spotify-Integration (optional) über Authorization Code + PKCE.
// Erfordert Spotify Premium und eine eigene Client-ID (Spotify Developer Dashboard).
// Läuft komplett im Browser ohne Server.

// Optional fest eingebaute Client-ID: Ist sie gesetzt, müssen Nutzer KEINEN
// Key mehr eingeben – sie klicken nur noch „Mit Spotify verbinden“ und melden
// sich mit ihrem Account an. Leer = manueller Modus (jeder trägt eigene ID ein).
// Spotify erlaubt keinen Zugriff ohne registrierte App/Client-ID – diese eine
// ID muss also einmalig im Spotify Developer Dashboard angelegt werden.
export const DEFAULT_CLIENT_ID = '050f0f4096584acd8c216e985ea7ca0a';

const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
].join(' ');

const LS = {
  clientId: 'spotify.clientId',
  verifier: 'spotify.verifier',
  token: 'spotify.token', // { access_token, refresh_token, expires_at }
};

function redirectUri() {
  // Exakt diese URI muss im Spotify Dashboard eingetragen sein.
  return window.location.origin + window.location.pathname;
}

function base64url(bytes) {
  let str = '';
  bytes.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hash);
}

function randomString(len = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const arr = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(arr, (n) => chars[n % chars.length]).join('');
}

export class Spotify {
  constructor() {
    this.player = null;
    this.deviceId = null;
    this.ready = false;
    this.state = null;
    this._duckRestore = null;
    this.onState = null; // Callback(state)
    this.onReady = null;
  }

  get clientId() {
    return DEFAULT_CLIENT_ID || localStorage.getItem(LS.clientId) || '';
  }
  set clientId(v) {
    localStorage.setItem(LS.clientId, (v || '').trim());
  }
  // true, wenn eine Client-ID fest eingebaut ist → „ohne Key“-Modus (nur Login).
  get keyless() {
    return !!DEFAULT_CLIENT_ID;
  }

  get redirectUri() {
    return redirectUri();
  }

  _token() {
    try {
      return JSON.parse(localStorage.getItem(LS.token) || 'null');
    } catch {
      return null;
    }
  }

  isConnected() {
    const t = this._token();
    return !!(t && t.access_token);
  }

  async login() {
    if (!this.clientId) throw new Error('Bitte zuerst die Spotify Client-ID eintragen.');
    const verifier = randomString(64);
    localStorage.setItem(LS.verifier, verifier);
    const challenge = base64url(await sha256(verifier));
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      code_challenge_method: 'S256',
      code_challenge: challenge,
      scope: SCOPES,
    });
    window.location.href = `https://accounts.spotify.com/authorize?${params}`;
  }

  // Nach Redirect: Code gegen Token tauschen. Liefert true wenn etwas passiert ist.
  async handleRedirect() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    if (error) {
      this._cleanUrl();
      throw new Error('Spotify-Login abgebrochen: ' + error);
    }
    if (!code) return false;
    const verifier = localStorage.getItem(LS.verifier);
    const body = new URLSearchParams({
      client_id: this.clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      code_verifier: verifier || '',
    });
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) {
      this._cleanUrl();
      throw new Error('Token-Austausch fehlgeschlagen.');
    }
    const data = await res.json();
    this._storeToken(data);
    this._cleanUrl();
    return true;
  }

  _cleanUrl() {
    window.history.replaceState({}, document.title, this.redirectUri);
  }

  _storeToken(data) {
    const existing = this._token() || {};
    const token = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || existing.refresh_token,
      expires_at: Date.now() + (data.expires_in || 3600) * 1000 - 60000,
    };
    localStorage.setItem(LS.token, JSON.stringify(token));
  }

  async getAccessToken() {
    let token = this._token();
    if (!token) return null;
    if (Date.now() < token.expires_at) return token.access_token;
    // Refresh
    if (!token.refresh_token) return null;
    const body = new URLSearchParams({
      client_id: this.clientId,
      grant_type: 'refresh_token',
      refresh_token: token.refresh_token,
    });
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) return null;
    this._storeToken(await res.json());
    return this._token().access_token;
  }

  logout() {
    localStorage.removeItem(LS.token);
    if (this.player) {
      this.player.disconnect();
      this.player = null;
    }
    this.ready = false;
    this.deviceId = null;
  }

  // Lädt das Web-Playback-SDK und erstellt einen Player im Browser.
  async initPlayer() {
    if (!this.isConnected()) return;
    await this._loadSdk();
    return new Promise((resolve) => {
      this.player = new window.Spotify.Player({
        name: 'pixletics',
        getOAuthToken: (cb) => this.getAccessToken().then((t) => cb(t)),
        volume: 0.6,
      });
      this.player.addListener('ready', ({ device_id }) => {
        this.deviceId = device_id;
        this.ready = true;
        if (this.onReady) this.onReady(device_id);
        resolve(device_id);
      });
      this.player.addListener('not_ready', () => (this.ready = false));
      this.player.addListener('player_state_changed', (s) => {
        this.state = s;
        if (this.onState) this.onState(s);
      });
      this.player.addListener('initialization_error', ({ message }) => console.warn('Spotify init', message));
      this.player.addListener('authentication_error', ({ message }) => console.warn('Spotify auth', message));
      this.player.addListener('account_error', ({ message }) => console.warn('Spotify account (Premium nötig)', message));
      this.player.connect();
    });
  }

  _loadSdk() {
    if (window.Spotify && window.Spotify.Player) return Promise.resolve();
    return new Promise((resolve) => {
      window.onSpotifyWebPlaybackSDKReady = () => resolve();
      if (!document.getElementById('spotify-sdk')) {
        const s = document.createElement('script');
        s.id = 'spotify-sdk';
        s.src = 'https://sdk.scdn.co/spotify-player.js';
        document.body.appendChild(s);
      }
    });
  }

  // Muss aus einer echten Nutzer-Interaktion (Tippen/Klicken) heraus aufgerufen
  // werden. Hält das interne Audio-Element „aktiv“, damit das Übertragen der
  // Wiedergabe auf dieses Gerät auf Mobilgeräten (v. a. iOS/Safari) nicht als
  // Autoplay blockiert wird – sonst bricht die Verbindung beim Transfer ab.
  async activate() {
    try {
      await this.player?.activateElement?.();
    } catch {}
  }

  async togglePlay() {
    if (!this.player) return;
    await this.activate();
    await this.player.togglePlay();
  }
  async next() {
    if (!this.player) return;
    await this.activate();
    await this.player.nextTrack();
  }
  async previous() {
    if (!this.player) return;
    await this.activate();
    await this.player.previousTrack();
  }

  // Lautstärke weich über ~0,5 s faden (statt schlagartig).
  _fadeVol(target, ms = 500) {
    if (!this.player) return;
    if (this._fadeTimer) clearInterval(this._fadeTimer);
    this.player.getVolume().then((start) => {
      const steps = Math.max(1, Math.round(ms / 60));
      let i = 0;
      this._fadeTimer = setInterval(() => {
        i += 1;
        const v = start + (target - start) * (i / steps);
        this.player.setVolume(Math.max(0, Math.min(1, v))).catch(() => {});
        if (i >= steps) { clearInterval(this._fadeTimer); this._fadeTimer = null; }
      }, 60);
    }).catch(() => {});
  }

  // Macht Spotify während einer Ansage sanft leiser und stellt danach wieder her.
  async duck() {
    if (!this.player) return;
    try {
      if (this._duckRestore == null) this._duckRestore = await this.player.getVolume();
      this._fadeVol(Math.min(this._duckRestore, 0.15), 500);
    } catch {}
  }
  async unduck() {
    if (!this.player || this._duckRestore == null) return;
    const target = this._duckRestore;
    this._duckRestore = null;
    this._fadeVol(target, 500);
  }
}
