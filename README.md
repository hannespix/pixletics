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
  anpassen (Name, Beschreibung, Emoji, Bereich, Wiederholungen **und die
  detaillierte Anleitung**), neue anlegen und löschen.
- **Übungssets**: Mehrere Sets anlegen, Übungen per Checkliste auswählen und
  per **Drag & Drop** (Maus oder Touch) in die gewünschte Reihenfolge bringen.
  Beim Training lassen sich mehrere Sets auswählen, die nacheinander
  abgespielt werden. Sets können eine **Beschreibung** tragen (wofür/wie es wirkt).
- **Auto-Set (✨)**: Set automatisch erstellen lassen – Assistent fragt
  **Intensität**, **Schwerpunkt** (Kraft/Ausdauer/Mix), **Körperfokus** und
  **gewünschte Dauer** ab und stellt daraus ein **ausgewogenes, abwechslungs-
  reiches** Set zusammen (gleichmäßige Muskelabdeckung, Aufwärmen/Finisher,
  passende Beschreibung). Per **„Neu würfeln"** gibt es jederzeit eine frische
  Variante.
- **Übungsanleitungen**: Zu jeder Standard-Übung gibt es eine verständliche
  Schritt-für-Schritt-**Durchführung** plus **„Worauf besonders achten"**
  (Technik, Sicherheit, häufige Fehler). Im Training erscheint dazu in jeder
  Pause/Übung eine gut sichtbare **„ℹ️ So geht's"-Schaltfläche** für die
  anstehende Übung. Im Übungs-Editor wird die Anleitung zunächst nur **angezeigt**;
  **Bearbeiten** erfolgt bewusst erst per Button – frei editierbar (eine Anweisung
  pro Zeile), auch für **selbst angelegte Übungen** (die kuratierten Texte dienen
  als Vorlage).
- **Aussprache-Korrektur (Sprachausgabe)**: Knifflige Wörter (Anglizismen wie
  *Skater*, *Burpees*, *Mountain Climbers* oder Vokalfolgen wie *beeindruckt*)
  werden für die deutsche Text-to-Speech lautnah umgeschrieben, damit sie korrekt
  klingen – die Anzeige bleibt unverändert (`fixPronunciation` in `audio.js`).
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
- **Intervall-Timer** (im Training-Tab): reiner Timer **ohne** Übungsliste mit
  Schnellstart-Vorlagen – **Tabata** (20 s/10 s · 8 Runden), **EMOM** (jede
  Minute ein Intervall), **AMRAP** (ein durchgehender Timer) und **Frei**
  (Belastung/Pause/Runden frei wählbar). Coach-Ansagen und Countdown laufen wie
  beim normalen Workout.
- **Vollbild**: Umschalter in der Kopfzeile und im Workout-Screen (sofern der
  Browser die Fullscreen-API unterstützt).
- **Animiertes Logo**: **Gooey-Morph**-Ping-Pong im Kopfzeilen-Logo (das weiße
  Pixel-Logo „pixletics“ zerfließt flüssig zu „workout timer“ und zurück).
  Komplett selbst enthalten (SVG-Filter: `feTurbulence` + `feDisplacementMap` +
  Gooey), respektiert `prefers-reduced-motion`, pausiert im Workout/bei
  verstecktem Tab. (Kein Lade-/Intro-Screen – die App startet direkt.)
- **Sprachansagen** (deutsche Sprachausgabe) und **Signaltöne** – einzeln
  abschaltbar; dazu separate **Lautstärke-Regler für Coach und Musik**.
- **Stimme & Coach** (im Training-Tab): wählbare **Coach-Charaktere** mit
  eigenem Tonfall und Spruch-Pool – *Der Klassiker*, *Der Schleifer*, *Der
  Antreiber*, *Das Schlitzohr*, *Die Mutmacherin* (weiblich) oder *Der Ruhepol*
  (weiblich). Dazu Schieberegler für **Stimmlage**, **Tempo** und **Motivation**
  (wie oft motivierende/freche Zwischenrufe kommen), Auswahl der **Gerätestimme**
  und ein optionales **Namensfeld**, mit dem der Coach dich anspricht
  („Auf geht's, Alex!"). Nutzt die auf dem Gerät installierten Stimmen.
- **Ansage-Umfang** wählbar: **Voll** (Coach-Sprüche + Übungsnamen + Erklärungen),
  **Sprüche ohne Übungsnamen** (alle Kommentare, aber ohne zu sagen welche Übung –
  praktisch fürs Zirkeltraining, wenn jeder etwas anderes macht), **Knapp**
  (nur das Wichtigste: Modus, Übungsname, Countdown, Status) oder **Minimal**
  (nur „Pause/Los" + Countdown – fürs eigene Training). Der **Standard-Coach**
  ist bewusst sprüche-frei. Die **erste Übung** startet ohne lange Pause
  (kurze Ansage → Countdown → los).
- **Rundenwechsel** (z. B. Zirkel): nach jeder vollen Runde ein kleiner **Applaus**,
  eine **längere Pause** und die Ansage „Runde X geschafft". Beim Zirkel wird ab
  Runde 2 die **Aktivpause angekündigt**.
- **Musik** (Tab „Musik"): zwei Optionen –
  - **Internet-Radio**: ~30 kuratierte Sender quer durch die Genres – Auswahl
    nach **werbefrei/werbearm, nur Musik, workout-tauglich** (nicht zu langsam),
    mit Schwerpunkt **Electro/EDM** (SomaFM Beat Blender, DEF CON, The Trip,
    Dub Step Beyond, Suburbs of Goa, cliqhop, PopTron + bigFM Dance/Groove Night/
    Workout) sowie **Pop & Charts**, **HipHop & Rap** (bigFM Deutschrap/Old School,
    SomaFM Fluid), **Rock**, **Punk** (RADIO BOB! Punk Rock, laut.fm Punk),
    **Metal** und **80er/90er**. Ein **Genre-Filter**
    (Chip-Leiste) hält die Liste übersichtlich. Alles **ohne Login/Key/Premium**;
    eigene Sender (HTTPS-Stream-URL) lassen sich hinzufügen. Für SomaFM wird der
    **aktuell laufende Song** angezeigt (andere Sender liefern im Browser keine
    Track-Infos).
  - **Spotify** (optional, ohne Key): jeder verbindet einfach seinen **eigenen
    Account** („Mit Spotify verbinden"), läuft im Browser mit und ist von hier
    steuerbar. Benötigt **Spotify Premium**. (Die App-Client-ID ist fest
    eingebaut; in der Test-Phase max. 25 freigeschaltete Accounts.)
  Beide werden bei Sprachansagen automatisch **sanft (≈0,5 s) leiser geblendet**
  und danach wieder hoch (während des Countdowns durchgehend leise). Die
  **Musik-Lautstärke** lässt sich im Musik-Fenster regeln, der **Account-Wechsel**
  bei Spotify geht über „Trennen“ → „Verbinden“ (Konto-Auswahl wird gezeigt).
  - **Musik-Schnellwahl** (🎵 in der Kopfzeile und im Workout-Screen): kleines
    Fenster, um direkt einen Sender zu wählen oder Spotify zu verbinden – ohne
    den Tab zu wechseln, auch mitten im laufenden Workout.

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
