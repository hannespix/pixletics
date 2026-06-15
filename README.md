# pixletics

Ein browser-basierter Intervall-Timer für Bodyweight- und Zirkeltraining.
Läuft komplett im Browser (statische Seite, keine Installation nötig) unter
**https://hannespix.github.io/pixletics/**.

> Deployment: Die Seite wird per GitHub Actions automatisch nach GitHub Pages
> veröffentlicht, sobald Änderungen auf den `main`-Branch gelangen
> (siehe `.github/workflows/deploy.yml`).

## Funktionen

- **Intervall-Training**: Standardmäßig 30 Sek. Übung, 30 Sek. Pause, 10 Sek.
  Vorbereitung – alles frei einstellbar. Das Programm füllt automatisch die
  gewünschte Gesamtdauer.
- **Ablauf pro Übung**: Ansage „Nächste Runde: …“ (bzw. „Nochmal: …“ bei der
  Wiederholung) → 10-Sekunden-Countdown → Startsignal → Übung (mit „Noch 15
  Sekunden“-Ansage und lautem Countdown der letzten 10 Sekunden) → Pause.
  Danach geht es mit der nächsten Übung weiter. Am **Ende des Workouts** gibt
  es Applaus. 👏
- **Wiederholungen pro Übung**: Jede Übung hat eine eigene Wiederholungszahl
  (Standard **3**, beidseitige Übungen wie Ausfallschritte oder Seitstütz **4**),
  individuell einstellbar. Die Übung wird entsprechend oft hintereinander
  ausgeführt, bevor die nächste folgt.
- **Übungen bearbeiten**: Im Tab **„Übungen“** lassen sich alle Übungen voll
  anpassen (Name, Beschreibung, Emoji, Bereich, Wiederholungen), neue anlegen
  und löschen.
- **Übungssets**: Mehrere Sets anlegen, Übungen per Checkliste auswählen und
  per **Drag & Drop** (Maus oder Touch) in die gewünschte Reihenfolge bringen.
  Beim Training lassen sich mehrere Sets auswählen, die nacheinander
  abgespielt werden.
- **Pause = Pause + Vorbereitung**: Vor jeder Übung gibt es **einen** Block
  (standardmäßig 30 s), in dem man sich erholt und **gleich zu Beginn die
  nächste Übung angesagt** bekommt – so kann man sich mental vorbereiten.
- **Freeletics-Sets**: Drei abwechslungsreiche Ganzkörper-Workouts (A · Kraft &
  Core, B · Cardio & Stabilität, C · Ganzkörper-Mix), sportphysiologisch
  aufgebaut (~45–55 min, Gesamtdauer einstellbar).
- **Zirkeltraining**: Vorgefertigtes Set mit **15 Stationen** (Seilspringen,
  Pendellauf, Rollbrett, Ringe, Bank, Sprossenwand, Kettlebell, Battle Ropes
  u. v. m.) – jede Station wird pro Runde einmal „im Kreis“ absolviert. **Ab der
  2. Runde Aktivpause**: in jeder Pause eine Runde um die Halle laufen (wird
  angesagt). Mit den Standardwerten (30 s Übung + 30 s Pause) dauert eine Runde
  genau ~15 min.
- **Vollbild**: Umschalter in der Kopfzeile und im Workout-Screen (sofern der
  Browser die Fullscreen-API unterstützt).
- **Animiertes Logo**: Intro-Splash beim Start mit **Gooey-Morph** (das
  weiße Pixel-Logo „pixletics“ zerfließt flüssig und verformt sich zu „workout
  timer“ und zurück) sowie eine **dauerhafte Ping-Pong-Schleife** im
  Kopfzeilen-Logo. Komplett selbst enthalten (SVG-Filter: `feTurbulence` +
  `feDisplacementMap` + Gooey), respektiert `prefers-reduced-motion`, pausiert
  im Workout/bei verstecktem Tab, antippbar überspringbar.
- **Sprachansagen** (deutsche Sprachausgabe) und **Signaltöne** – einzeln
  abschaltbar.
- **Stimme & Coach** (im Training-Tab): wählbare **Coach-Charaktere** mit
  eigenem Tonfall und Spruch-Pool – z. B. *Drill-Sergeant Stahl*, *Hype-Coach
  Max*, *Frechdachs Freddy*, *Coach Lena* (weiblich) oder *Zen-Meisterin
  Ruheherz*. Dazu Schieberegler für **Stimmlage**, **Tempo** und **Motivation**
  (wie oft motivierende/freche Zwischenrufe kommen), Auswahl der **Gerätestimme**
  und ein optionales **Namensfeld**, mit dem der Coach dich anspricht
  („Auf geht's, Alex!"). Nutzt die auf dem Gerät installierten Stimmen.
- **Musik** (Tab „Musik"): zwei Optionen –
  - **Internet-Radio**: kuratierte **Power-Sender** quer durch die Genres
    (bigFM Workout, sunshine live, TechnoBase.FM, ROCK ANTENNE, SomaFM u. a.),
    **ohne Login/Key/Premium**. Eigene Sender (HTTPS-Stream-URL) lassen sich
    hinzufügen. Für SomaFM-Sender wird der **aktuell laufende Song** angezeigt
    (andere Sender liefern im Browser keine Track-Infos).
  - **Spotify** (optional): läuft im Browser mit, steuerbar aus der App
    (Play/Pause/Weiter/Zurück). Benötigt Spotify Premium und eine eigene
    Client-ID (Einrichtung im Musik-Tab beschrieben).
  Beide werden bei Sprachansagen automatisch **sanft (≈0,5 s) leiser geblendet**
  und danach wieder hoch (während des Countdowns durchgehend leise). **ROCK
  ANTENNE** ist das Standard-Internetradio.

## Credits

Applaus-Sound: „Applause i" von Wikimedia Commons (**Public Domain**), gekürzt
und nach WAV konvertiert (`assets/audio/applause.wav`).
- **Teilen & Sichern**: Übungen, Sets, Sender und Einstellungen als
  **komprimierten Link** teilen (Kollege öffnet ihn → Import per Klick) oder
  als **JSON-Datei** exportieren/importieren. Läuft komplett ohne Server.
- **Bildschirm bleibt an** während des Workouts (Wake Lock, sofern vom Browser
  unterstützt).

## Bedienung

1. **Übungen** im gleichnamigen Tab anpassen (Name, Beschreibung, Emoji,
   Wiederholungen) oder neue anlegen.
2. **Übungssets** anlegen/bearbeiten.
3. Im **Training**-Tab Set(s) auswählen, Zeiten prüfen und „Workout starten“.
4. Während des Workouts: Pause/Weiter, Übung überspringen oder beenden.

## Spotify einrichten (optional)

Im Tab „Musik“ (Bereich Spotify) ist die einmalige Einrichtung beschrieben:
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
  audio.js       – Töne (WebAudio) & Sprachausgabe (Stimmenwahl/-einstellungen)
  coach.js       – Coach-Charaktere & Spruch-Pools
  engine.js      – Ablaufplan & Phasen-Zustandsmaschine
  spotify.js     – Spotify-Anbindung (PKCE + Web Playback SDK)
  radio.js       – Internet-Radio (HTML5-Audio)
  share.js       – Teilen/Sichern (komprimierter Link & Datei)
  main.js        – UI & Verdrahtung
```
