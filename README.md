# Freeletics Timer

Ein browser-basierter Intervall-Timer für Freeletics-/Bodyweight-Workouts.
Läuft komplett im Browser (statische Seite, keine Installation nötig) unter
**https://hannespix.github.io/pixletics/**.

> Deployment: Die Seite wird per GitHub Actions automatisch nach GitHub Pages
> veröffentlicht, sobald Änderungen auf den `main`-Branch gelangen
> (siehe `.github/workflows/deploy.yml`).

## Funktionen

- **Intervall-Training**: Standardmäßig 60 Sek. Übung, 30 Sek. Pause, 10 Sek.
  Vorbereitung – frei einstellbar. Das Programm füllt automatisch die
  gewünschte Gesamtdauer (Standard: 1 Stunde).
- **Ablauf pro Übung**: Ansage „Nächste Runde: …“ → 10-Sekunden-Countdown →
  Startsignal → Übung (mit „Noch 30 Sekunden“-Ansage und Countdown der letzten
  Sekunden) → Pausensymbol mit Pause. Danach geht es mit der nächsten Übung
  weiter.
- **Übungssets**: Mehrere Sets anlegen, Übungen per Checkliste auswählen und
  per **Drag & Drop** (Maus oder Touch) in die gewünschte Reihenfolge bringen.
  Beim Training lassen sich mehrere Sets auswählen, die nacheinander
  abgespielt werden.
- **Sprachansagen** (deutsche Sprachausgabe) und **Signaltöne** – einzeln
  abschaltbar.
- **Spotify** (optional): Musik läuft im Browser mit, lässt sich aus der App
  steuern (Play/Pause/Weiter/Zurück) und wird bei Sprachansagen automatisch
  leiser. Benötigt Spotify Premium und eine eigene Client-ID (Einrichtung im
  Spotify-Tab beschrieben).
- **Bildschirm bleibt an** während des Workouts (Wake Lock, sofern vom Browser
  unterstützt).

## Bedienung

1. **Übungssets** anlegen/bearbeiten.
2. Im **Training**-Tab Set(s) auswählen, Zeiten prüfen und „Workout starten“.
3. Während des Workouts: Pause/Weiter, Übung überspringen oder beenden.

## Spotify einrichten (optional)

Im Tab „Spotify“ ist die einmalige Einrichtung beschrieben:
App im [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
anlegen, die angezeigte Redirect-URI eintragen, „Web Playback SDK“ aktivieren
und die Client-ID in die App kopieren.

## Technik

Reine statische Seite ohne Build-Schritt: HTML, CSS und ES-Module (Vanilla JS).
Daten (Sets & Einstellungen) werden lokal im Browser gespeichert
(`localStorage`).

```
index.html
assets/css/style.css
assets/js/
  exercises.js   – Übungsbibliothek & Beispiel-Sets
  store.js       – Speicherung (localStorage)
  audio.js       – Töne (WebAudio) & Sprachausgabe
  engine.js      – Ablaufplan & Phasen-Zustandsmaschine
  spotify.js     – Spotify-Anbindung (PKCE + Web Playback SDK)
  main.js        – UI & Verdrahtung
```
