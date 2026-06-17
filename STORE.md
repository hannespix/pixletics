# pixletics im Google Play Store veröffentlichen

pixletics ist eine **PWA**. Für den Play Store wird sie **nicht neu gebaut**, sondern
in eine **TWA (Trusted Web Activity)** verpackt – ein dünner Android-Wrapper, der die
bestehende Web-App im Vollbild (ohne Browser-Leiste) lädt. Web-Speech (Coach-Stimme),
Web-Audio, Wake-Lock und Vollbild funktionieren darin nativ.

**Adresse der App:** `https://hannespix.github.io/pixletics/`

---

## 0. Voraussetzungen
- **Node.js** (für Bubblewrap) **oder** nur ein Browser (für PWABuilder).
- **Java JDK 17** (für Bubblewrap-Builds).
- **Google-Play-Developer-Konto** – einmalig **25 $**.
  - ⚠️ **Neue private Konten** müssen vor dem Produktiv-Release einen **geschlossenen Test
    mit mindestens 12 Testern über mindestens 14 Tage** durchführen. Das früh einplanen!

---

## 1. Digital Asset Links (Pflicht – entfernt die URL-Leiste)

Die Datei muss an der **Domain-Wurzel** liegen, **nicht** unter `/pixletics/`:

```
https://hannespix.github.io/.well-known/assetlinks.json
```

Da die App unter dem Projektpfad `/pixletics/` läuft, gehört die Datei in das **separate
GitHub-Pages-Repo** `hannespix/hannespix.github.io` (Domain-Wurzel):

1. Repo `hannespix/hannespix.github.io` anlegen (falls nicht vorhanden) und GitHub Pages aktivieren.
2. Datei `.well-known/assetlinks.json` anlegen – Vorlage: [`store/assetlinks.template.json`](store/assetlinks.template.json).
3. `package_name` setzen (z. B. `io.github.hannespix.pixletics`).
4. `sha256_cert_fingerprints` mit dem **SHA-256-Fingerprint des Signaturschlüssels** füllen.
   Den findest du nach dem ersten Upload in der **Play Console → Release → Einrichtung →
   App-Signatur → „Zertifikat des App-Signaturschlüssels" (SHA-256)**.
   (Bubblewrap/PWABuilder erzeugen diese Datei auch automatisch – Inhalt dann von dort übernehmen.)
5. Prüfen: `https://hannespix.github.io/.well-known/assetlinks.json` muss im Browser die JSON zeigen.

> Wenn in der installierten App **trotzdem eine URL-Leiste** erscheint, stimmt fast immer die
> assetlinks.json nicht (falscher Pfad, falscher Paketname oder falscher Fingerprint).

---

## 2. Android-Paket bauen

### Variante A – PWABuilder (am einfachsten, ohne lokale Tools)
1. Auf <https://www.pwabuilder.com> die URL `https://hannespix.github.io/pixletics/` eingeben.
2. „Package for stores" → **Android** → Optionen prüfen (Package-ID, App-Name, Signierung).
3. Das erzeugte **`.aab`** herunterladen und die mitgelieferte `assetlinks.json` verwenden (siehe Schritt 1).

### Variante B – Bubblewrap (Google offiziell, mehr Kontrolle)
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://hannespix.github.io/pixletics/manifest.webmanifest
# Fragen beantworten: Package-ID (z. B. io.github.hannespix.pixletics), App-Name, Farben …
bubblewrap build
# Ergebnis: app-release-bundle.aab  +  assetlinks.json (Inhalt für Schritt 1)
```
Bei jedem Update: `bubblewrap update` (übernimmt Manifest-Änderungen) und `versionCode` erhöhen, dann `bubblewrap build`.

---

## 3. Play Console einrichten
1. App anlegen (Name, Sprache, „App", kostenlos).
2. **App-Signatur** durch Google aktivieren (Standard) → danach den SHA-256 für Schritt 1 holen.
3. **Datenschutzerklärung-URL** eintragen: `https://hannespix.github.io/pixletics/privacy.html`
   (vorher Verantwortlichen/Kontakt in `privacy.html` ausfüllen!).
4. **Data-Safety-Formular** ausfüllen – passend zu dieser App:
   - Datenerfassung/-weitergabe durch die App selbst: **keine**.
   - Daten werden **lokal auf dem Gerät** gespeichert (Einstellungen), nicht übertragen.
   - Optional: Spotify-Login (durch Spotify), Radio-Streams (Drittanbieter).
5. **Inhaltseinstufung**, Zielgruppe, Kategorie *(Gesundheit & Fitness)* ausfüllen.

---

## 4. Store-Eintrag (Material liegt in `store/`)
- **App-Icon 512×512:** `assets/icons/icon-512.png`
- **Feature-Grafik 1024×500:** `store/feature-graphic.png`
- **Screenshots (Telefon):** `store/screenshot-*.png` (mind. 2)
- Kurzbeschreibung + ausführliche Beschreibung (Texte selbst formulieren).

---

## 5. Spotify (wichtig bei öffentlicher App)
- In deinem **Spotify-Developer-Dashboard** die **Redirect-URI** prüfen/ergänzen:
  `https://hannespix.github.io/pixletics/` (genau die Adresse, die die App nutzt).
- Spotifys Entwicklerbedingungen: Für eine **öffentlich** verfügbare App ggf. eine
  **Quota-Extension / Compliance-Prüfung** beantragen (sonst Limit von 25 Nutzern im Dev-Modus).
- Alternativ den Spotify-Hinweis in der App-Beschreibung als „optionales Feature" kennzeichnen.

---

## 6. Pflege / Updates
- Web-App ändern = einfach ins `main`-Repo pushen (GitHub Pages deployt automatisch). Bestehende
  Store-Installationen laden die neue Version automatisch (Service-Worker, network-first).
- Nur wenn sich **Manifest/Icons/Paket** ändern oder Play ein neues **Ziel-API-Level** verlangt:
  Wrapper neu bauen (`bubblewrap update && bubblewrap build`), `versionCode` erhöhen, neues `.aab` hochladen.

---

## Checkliste
- [ ] `privacy.html` mit Kontakt/Verantwortlichem ausgefüllt
- [ ] `.well-known/assetlinks.json` im Repo `hannespix.github.io` (richtiger Paketname + SHA-256)
- [ ] `.aab` mit Bubblewrap/PWABuilder erzeugt
- [ ] Play-Konto + (bei privatem Konto) 12 Tester / 14 Tage
- [ ] Data-Safety-Formular + Datenschutz-URL
- [ ] Spotify-Redirect-URI / Quota geklärt
- [ ] Store-Grafiken + Texte hochgeladen
