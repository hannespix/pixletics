// Coach-Charaktere ("Personas"): je eigene Tonlage (pitch/rate), bevorzugtes
// Geschlecht der Gerätestimme und Spruch-Pools je Trainingsmoment.
// Platzhalter: {ex} = Übungsname, {name} = optionaler Name des Nutzers.
//
// Die Pools sind bewusst groß (pro Coach ~90+ Sprüche, davon ~40+ „work“ und
// ~16 „mid“). Über einen Shuffle-Bag (siehe line()) kommt jeder Spruch einmal
// dran, bevor sich etwas wiederholt – so bleibt es im ganzen Workout abwechslungs-
// reich. Tonfall: trockener, frecher Humor mit Sticheleien (Speck-/Bierbauch,
// „Waschbrettbauch statt Fass“, die unbeeindruckten Damen nebenan …), jeweils
// passend zum Charakter.
//
// Hinweis zur Sprachausgabe: bewusst KEINE englischen Lehnwörter, keine
// Abkürzungen, keine Ziffern und keine Apostrophe – das spricht die deutsche
// KI-Stimme am zuverlässigsten korrekt aus.

export const PERSONAS = [
  {
    id: 'standard',
    name: 'Standard',
    emoji: '🎯',
    desc: 'Neutral & sachlich – mit feinem, trockenem Humor.',
    gender: 'any',
    pitch: 1.0,
    rate: 1.05,
    lines: {
      start: ['Los geht es.', 'Training startet.', 'Auf geht es.', 'Wir fangen an.', 'Bereit, dann los.'],
      next: ['Nächste Übung: {ex}.', 'Weiter mit {ex}.', 'Es folgt {ex}.', 'Jetzt kommt {ex}.', 'Als Nächstes {ex}.'],
      again: ['Noch einmal {ex}.', '{ex}, gleiche Übung.', '{ex}, weiter so.'],
      work: [
        'Los geht es.', 'Sauber durchziehen.', 'Technik vor Tempo.', 'Kontrolliert arbeiten.',
        'Konzentriert bleiben.', 'Gleichmäßig atmen.', 'Jede Wiederholung zählt.',
        'Nicht schummeln, der Boden sieht alles.', 'Der Speck verschwindet nicht beim Zuschauen.',
        'Ein Waschbrettbauch baut sich nicht von allein.', 'Bewegung schlägt gute Vorsätze.',
        'Sauber von Kopf bis Fuß.', 'Kopf hoch, Bauch rein.', 'Volle Spannung halten.',
        'Ruhig und stark.', 'Da geht noch etwas.', 'Weiter im Takt.', 'Form bewahren.',
        'Nicht nachlassen.', 'Atme, dann zieh durch.', 'Das ist machbar.', 'Halte die Linie.',
        'Tempo halten.', 'Sauber bis zum Schluss.', 'Das Sofa läuft nicht weg, also bleib dran.',
        'Aus dem Fass wird ein Fässchen.', 'Die Rettungsringe darfst du gern abgeben.',
        'Heute schmilzt das Hüftgold.', 'Ordentlich, aber da ist mehr drin.',
        'Beine fest, Rumpf stabil.', 'Ein bisschen mehr Ehrgeiz.', 'Sieht solide aus, jetzt nachlegen.',
        'Schwitzen ist erlaubt.', 'Konzentration auf die Bewegung.', 'Sauber, ruhig, stark.',
        'Kein Grund zum Trödeln.', 'Der Bauch wackelt, das ist ein Anfang.',
        'Qualität in jeder Wiederholung.', 'Bleib bei der Sache.', 'Brust raus, Haltung zeigen.',
        'Jetzt zählt Durchhalten.', 'Weniger denken, mehr bewegen.',
      ],
      mid: [
        'Weiter so, {name}.', 'Sauber, dranbleiben.', 'Konzentriert bleiben, {name}.',
        'Gleichmäßig weiter.', 'Halte das Tempo.', 'Noch ist Luft nach oben.',
        'Der Speck schmilzt nicht von allein, {name}.', 'Sieht ordentlich aus, mehr geht.',
        'Atmen nicht vergessen.', 'Stabil bleiben, {name}.', 'Jetzt nicht einschlafen.',
        'Sauber durchhalten.', 'Der Waschbrettbauch lässt grüßen.', 'Noch ein Stück, {name}.',
        'Form halten, nicht hängen lassen.', 'Gut, weiter im Rhythmus.',
      ],
      rest: [
        'Pause.', 'Kurz durchatmen.', 'Verschnauf, aber bleib wach.', 'Kurze Pause, dann weiter.',
        'Atmen, sammeln.', 'Kurz Luft holen.', 'Lockerlassen, gleich geht es weiter.',
        'Pause, aber nicht hinlegen.', 'Trink einen Schluck Wasser.', 'Schüttel die Arme aus.',
        'Ruhig atmen, bereit machen.', 'Kurz sammeln.',
        'Durchatmen, der Speck ruht sich auch nicht aus.', 'Kurze Verschnaufpause, dann weiter.',
        'Atme tief, gleich wird wieder gearbeitet.', 'Locker bleiben, der nächste Satz wartet.',
        'Kurz Kraft tanken.', 'Schultern locker, Kopf frei.',
        'Pause, das Sofa bleibt trotzdem leer.', 'Atmen und kurz abschalten.',
      ],
      warn15: ['Noch fünfzehn Sekunden.', 'Fünfzehn Sekunden, durchhalten.', 'Noch ein kleines Stück.', 'Fünfzehn Sekunden, dranbleiben.'],
      finish: ['Geschafft. Sauber gemacht.', 'Fertig. Solide Leistung.', 'Erledigt. Gut durchgezogen, {name}.', 'Geschafft, der Speck hat es schwer heute.', 'Fertig. Das war ordentlich.'],
    },
  },
  {
    id: 'drill',
    name: 'Drill-Sergeant Stahl',
    emoji: '🪖',
    desc: 'Laut, tief, befehlend. Keine Ausreden, kein Mitleid!',
    gender: 'male',
    pitch: 0.85,
    rate: 1.15,
    lines: {
      start: ['Aufstellung! Wir legen los!', 'Antreten! Training beginnt!', 'Keine Ausreden, los geht es!', 'Strammgestanden, dann Bewegung!', 'Antreten, der Speck zittert schon!'],
      next: ['Antreten! Jetzt {ex}!', 'Bewegung! Es folgt {ex}!', 'Bereitmachen für {ex}!', 'Aufstellung für {ex}!', 'Jetzt {ex}, keine Diskussion!'],
      again: ['Nochmal {ex}! Keine Diskussion!', '{ex}! Und diesmal richtig!', '{ex}, von vorne, Soldat!'],
      work: [
        'Bewegung, sofort!', 'Keine Ausreden!', 'Tempo, Soldat!', 'Anpacken!', 'Vollgas, marsch!',
        'Zähne zusammen!', 'Durchhalten, das ist ein Befehl!', 'Schneller, Bewegung!',
        'Aufgeben gibt es nicht!', 'Reiß dich zusammen!', 'Mehr Einsatz!', 'Bewegt euch!',
        'Kein Gejammer!', 'Volle Kraft, sofort!', 'Durchziehen!', 'Disziplin, los!',
        'Nicht nachlassen!', 'Kämpfen!', 'Bis zum Anschlag!', 'Der Bierbauch wackelt, weiter so!',
        'Aus dem Fass wird ein Waschbrettbauch, Bewegung!', 'Den Speck wegtrainiert, marsch!',
        'Die Rentnergruppe nebenan ist schneller als du!', 'Die Damen beim Seniorensport lachen schon!',
        'Schwitzen, bis das Fett kapituliert!', 'Rettungsringe abgeben, sofort!',
        'Ich höre noch kein Ächzen!', 'Das nennst du Anstrengung?', 'Mein Großvater drückt tiefer!',
        'Hoch das Knie, nicht einschlafen!', 'Der Waschbärbauch hat heute keinen Urlaub!',
        'Vorwärts, kein Rückzug!', 'Haltung, Soldat!', 'Strammstehen kannst du später!',
        'Schneller als deine Ausreden!', 'Keine Pause im Kopf!', 'Volle Spannung, sofort!',
        'Beiß dich durch!', 'Das Sofa hat dich nicht verdient!', 'Mehr Tempo, oder ich zähle nochmal!',
        'Durchhalten oder weglaufen, deine Wahl!', 'Bauch rein, Brust raus, Bewegung!',
      ],
      mid: [
        'Schneller, {name}, nicht einschlafen!', 'Schwäche ist keine Option!', 'Aufgeben gibt es nicht!',
        'Zähne zusammen, {name}!', 'Ich hör dich noch nicht ächzen!', 'Mehr Tempo!',
        'Der Speck gibt zuerst auf, nicht du!', 'Die Damen nebenan grinsen, {name}!',
        'Bierbauch einziehen, weiter!', 'Kein Gejammer, durchhalten!', 'Bewegung, {name}, Bewegung!',
        'Das Fass wird zum Fässchen!', 'Strammbleiben, nicht hängen!', 'Noch nicht schlappmachen, Soldat!',
        'Disziplin, {name}!', 'Marsch, marsch, durchziehen!',
      ],
      rest: [
        'Pause! Aber nicht hinlegen!', 'Durchatmen, Soldat!', 'Kurz Luft holen, dann weiter!',
        'Verschnaufen, aber strammbleiben!', 'Wasser fassen, schnell!', 'Pause. Der Speck ruht sich nicht aus!',
        'Locker, aber wach bleiben!', 'Kurze Erholung, dann volle Kraft!', 'Atmen, dann zurück an die Arbeit!',
        'Ruhe vor dem nächsten Sturm!', 'Sammeln, gleich geht es weiter!', 'Kurze Pause, kein Nickerchen!',
        'Verschnaufpause, Soldat, nicht einschlafen!', 'Kurz Kraft tanken, dann marschieren wir weiter!',
        'Atemholen, der Bierbauch zittert noch!', 'Pause, aber Haltung bewahren!',
        'Schnell durchatmen, dann Vollgas!', 'Ruhe, dann zeigst du es dem Speck!',
        'Kurze Rast, die Rentnergruppe macht derweil weiter!', 'Sammeln und bereitmachen!',
      ],
      warn15: ['Noch fünfzehn Sekunden! Durchhalten!', 'Fünfzehn! Nicht nachlassen!', 'Fünfzehn Sekunden, kämpfen!', 'Noch fünfzehn, kein Rückzug!'],
      finish: ['Mission erfüllt! Wegtreten!', 'Geschafft, Soldat. Respekt!', 'Erledigt. Der Speck hat heute verloren!', 'Fertig. Das war fast schon Disziplin!', 'Wegtreten, {name}. Gut gekämpft!'],
    },
  },
  {
    id: 'hype',
    name: 'Hype-Coach Max',
    emoji: '🚀',
    desc: 'Pusht dich nach vorn – maximale Motivation mit Augenzwinkern.',
    gender: 'male',
    pitch: 1.0,
    rate: 1.1,
    lines: {
      start: ['Auf geht es, das wird stark!', 'Los, volle Energie!', 'Bereit? Dann geben wir alles!', 'Heute räumen wir ab!', 'Energie an, los geht es!'],
      next: ['Jetzt kommt {ex}, du packst das!', 'Auf zu {ex}!', 'Bereit für {ex}? Los!', 'Gleich {ex}, Feuer frei!', 'Jetzt {ex}, zeig es allen!'],
      again: ['Noch einmal {ex}, volle Energie!', '{ex}, einmal noch, du Maschine!', '{ex}, die Zugabe gehört dir!'],
      work: [
        'Auf geht es, du schaffst das!', 'Energie an!', 'Zeig, was in dir steckt!', 'Vollgas!',
        'Du bist eine Maschine!', 'Gib alles!', 'Jetzt ziehst du das durch!', 'Energie hoch!',
        'Das wird stark!', 'Zeig deine Stärke!', 'Du packst das!', 'Lass es krachen!',
        'Voller Einsatz, los!', 'Du bist in Fahrt!', 'Beweg dich, Held!', 'Heute ist dein Tag!',
        'Stärker als gestern!', 'Komm, durchstarten!', 'Volle Kraft!', 'Jetzt erst recht!',
        'Hol dir das!', 'Der Speck hat keine Chance gegen dich!', 'Heute schmilzt das Hüftgold, fühl es!',
        'Tschüss Bierbauch, hallo Waschbrettbauch!', 'Aus dem Fass wird ein Kunstwerk!',
        'Die Rettungsringe sind sowas von gestern!', 'Sogar die Damen nebenan klatschen gleich Beifall!',
        'Du glühst, weiter so!', 'Das sieht nach Held aus!', 'Schwitzen ist flüssiger Stolz!',
        'Jede Wiederholung ein Sieg!', 'Du wächst gerade über dich hinaus!', 'Noch ein Funke mehr Energie!',
        'Spür die Kraft in dir!', 'Heute schreibst du Geschichte!', 'Das Feuer brennt, leg nach!',
        'Mega, genau so!', 'Du bist stärker als jede Ausrede!', 'Zeig dem Speck, wer hier Chef ist!',
        'Voll dabei, einfach stark!', 'Das ist dein Moment!', 'Energie pur, weiter!',
      ],
      mid: [
        'Auf geht es, {name}, nicht schlappmachen!', 'Du bist stärker als du denkst!', 'Weiter, {name}, weiter!',
        'Genau so, bleib dran!', 'Das sieht klasse aus!', 'Noch mehr Energie!',
        'Der Speck schmilzt, ich sehe es!', 'Du bist eine Maschine, {name}!', 'Halt das Feuer am Brennen!',
        'Stärker als gestern, {name}!', 'Komm, der Waschbrettbauch ruft!', 'Wahnsinn, einfach weiter!',
        'Die Damen nebenan staunen gleich!', 'Voller Stolz durchziehen!', 'Du glühst, {name}!',
        'Jetzt nicht bremsen!',
      ],
      rest: [
        'Stark! Kurz erholen.', 'Top gemacht, Pause genießen.', 'Atme tief, gleich geht es weiter.',
        'Kurze Pause, du Held.', 'Durchatmen, der Speck zittert schon.', 'Sammeln, dann zünden wir wieder!',
        'Pause, aber das Feuer bleibt an!', 'Schnauf durch, gleich kommt der nächste Sieg!',
        'Kurz Luft holen, Held der Halle!', 'Wasser trinken, Energie tanken!',
        'Locker bleiben, gleich geht es ab!', 'Kurze Pause, dann volle Energie!',
        'Atme, dein Körper lädt gerade auf!', 'Kurz erholen, der nächste Satz wird stark!',
        'Durchatmen, du bist auf einem super Weg!', 'Pause, Stolz auftanken!',
        'Kurz sammeln, dann legst du wieder los!', 'Schnauf durch, gleich glühst du wieder!',
        'Pause, das Hüftgold hat gleich wieder zu tun!', 'Energie halten, gleich geht es weiter!',
      ],
      warn15: ['Noch fünfzehn Sekunden, Endspurt!', 'Fünfzehn! Da geht noch etwas!', 'Fünfzehn Sekunden, jetzt alles!', 'Noch fünfzehn, hol es dir!'],
      finish: ['Geschafft! Riesenleistung, {name}!', 'Stark! Sei stolz auf dich!', 'Fertig, der Speck hat heute verloren!', 'Wahnsinn! Das war Weltklasse, {name}!', 'Geschafft, die Halle nebenan applaudiert!'],
    },
  },
  {
    id: 'cheeky',
    name: 'Frechdachs Freddy',
    emoji: '😏',
    desc: 'Foppt dich mit frechen Sprüchen – Sticheleien inklusive.',
    gender: 'male',
    pitch: 1.12,
    rate: 1.06,
    lines: {
      start: ['Na endlich, auf geht es!', 'Schluss mit Aufwärmen im Kopf, los!', 'Dann zeig mal, was du draufhast!', 'Na, ausgeschlafen? Dann los!', 'Der Speck wartet schon, fangen wir an!'],
      next: ['So, jetzt {ex}, kein Drücken!', 'Na los, {ex}. Du wolltest doch fit werden.', 'Jetzt {ex}, der Spaß beginnt.', 'Ab zu {ex}, Sportsfreund.', 'Jetzt {ex}, und tu mal so als ob.'],
      again: ['Nochmal {ex}? Tja, selber schuld.', '{ex}, die Zweite. Genießen!', '{ex}, nochmal, du wolltest das so.'],
      work: [
        'Na los, beweg dich!', 'Nicht so zaghaft!', 'Mehr als gucken musst du schon!',
        'Komm, keine Ausreden!', 'Meine Oma macht das schneller!', 'Schwitzt du, oder weinst du?',
        'Na, schon müde?', 'Stell dich nicht so an!', 'Ein bisschen mehr Tempo, ja?',
        'Das war jetzt nicht alles, oder?', 'Hey, aufwachen!', 'Bewegung, Faulpelz!',
        'Du wolltest doch mal fit werden!', 'Jetzt aber zackig!', 'Nicht schummeln!',
        'Geht da noch etwas? Sicher!', 'Zeig mal Muskeln, falls vorhanden!', 'Halbe Sachen gibt es nicht!',
        'Ran an den Speck, ganz wörtlich!', 'Der Bierbauch wackelt ja schon ganz nett!',
        'Aus dem Fass wird heute ein Fässchen, vielleicht!',
        'Ein Waschbrettbauch sieht echt besser aus als ein Bierfass!',
        'Dein Waschbärbauch sieht ja super gemütlich aus!',
        'Die Rettungsringe brauchst du im Schwimmbad, nicht hier!',
        'Die Damen in der Halle nebenan sind noch nicht beeindruckt!',
        'Sogar das Kaffeekränzchen nebenan schwitzt mehr!',
        'Komm schon, das Sofa vermisst dich auch ohne dich!', 'Atme, sonst kippst du mir noch um!',
        'War das ein Seufzer oder ein Hilferuf?', 'Das Hüftgold darf jetzt ruhig gehen!',
        'Noch wackelt mehr als nur die Motivation!',
        'Streng dich an, die Pizza danach schmeckt dann besser!', 'Deine Ausreden sind fitter als du!',
        'Ich habe schon Schnecken mit mehr Tempo gesehen!', 'Na, kommt da noch was aus dem Tank?',
        'Mehr Einsatz, weniger Drama!', 'Der Speck lacht dich gerade aus, ändere das!',
        'Schau nicht so, der Boden tut dir nichts!', 'Tu so, als wäre der Kühlschrank am anderen Ende!',
        'Bisschen mehr Feuer, du Kerze!', 'Heute schmilzt etwas, und es ist nicht dein Wille!',
        'Komm, beeindruck wenigstens dich selbst!', 'Noch so schlapp und die Oma überholt dich!',
        'Zähne zusammen, Held vom Sofa!', 'Jetzt zeig, dass das kein Versehen war!',
      ],
      mid: [
        'Schneller, {name}, nicht einschlafen!', 'Na, schon müde? Stell dich nicht so an!',
        'Meine Oma macht das schneller!', 'Komm, {name}, das war nicht alles, oder?',
        'Schwitzt du oder weinst du?', 'Mehr Schwung, weniger Wackelpudding!',
        'Der Bierbauch grüßt zurück, {name}!', 'Die Damen nebenan sind noch nicht beeindruckt!',
        'Dein Waschbärbauch macht es sich gemütlich, vertreib ihn!', 'Halbe Kraft reicht der Pizza, nicht mir!',
        'Noch wackelt das Hüftgold fröhlich mit!', 'Ein Fass wird nicht von allein zum Waschbrettbauch, {name}!',
        'Komm, beeindruck wenigstens die Schnecke da hinten!', 'Mehr Feuer, du Teelicht!',
        'Atme, {name}, ich brauch dich noch!', 'Noch so lahm und die Oma macht das Foto!',
      ],
      rest: [
        'Pause. Aber bild dir nichts darauf ein.', 'Verschnauf mal, Held vom Sofa.', 'Pause, du Glückspilz.',
        'Atme durch, der Speck tut es auch.', 'Kurze Pause, nicht einnicken!',
        'Erhol dich, die Oma macht derweil weiter.', 'Wasser trinken, Tränen zählen nicht.',
        'Pause. Genieß es, gleich wird wieder gejammert.', 'Locker, das Fässchen freut sich auch.',
        'Kurz durchatmen, dann wieder Drama.', 'Pause, der Kühlschrank bleibt trotzdem zu.',
        'Sammel dich, gleich blamierst du dich weiter.', 'Verschnauf, der Waschbärbauch macht es sich gemütlich.',
        'Kurze Pause, das Sofa lässt grüßen.', 'Atme, sonst hält die Pause länger als du.',
        'Pause, die Damen nebenan trinken jetzt Kaffee.', 'Ruh dich aus, der Speck hat es nicht eilig.',
        'Kurz Luft holen, die Pizza wartet ja.', 'Pause, fast hättest du dich angestrengt.',
        'Verschnauf, gleich geht es dem Hüftgold an den Kragen.',
      ],
      warn15: ['Noch fünfzehn Sekunden, dann darfst du jammern.', 'Fünfzehn Sekunden, halt durch.', 'Fünfzehn, die Oma feuert dich an.', 'Noch fünfzehn, nicht schlappmachen.'],
      finish: ['Geschafft! Und es lebt noch.', 'Fertig! War doch halb so wild, {name}.', 'Erledigt. Der Speck zittert, ein bisschen.', 'Geschafft. Die Damen nebenan nicken anerkennend, fast.', 'Fertig, {name}. Die Pizza hast du dir jetzt verdient.'],
    },
  },
  {
    id: 'lena',
    name: 'Coach Lena',
    emoji: '💪',
    desc: 'Weibliche Stimme, motivierend & freundlich – mit Augenzwinkern.',
    gender: 'female',
    pitch: 1.12,
    rate: 1.05,
    lines: {
      start: ['Schön, dass du da bist, los geht es!', 'Wir starten, du schaffst das!', 'Auf geht es, gemeinsam durch!', 'Bereit? Dann legen wir los!', 'Heute tust du dir etwas Gutes, los!'],
      next: ['Weiter geht es mit {ex}.', 'Jetzt {ex}, du schaffst das!', 'Als Nächstes {ex}.', 'Gleich {ex}, bereit?', 'Jetzt {ex}, ich bin bei dir.'],
      again: ['Noch ein Satz {ex}, komm!', '{ex}, einmal noch, stark bleiben!', '{ex}, nochmal, du machst das.'],
      work: [
        'Komm schon, du packst das!', 'Los geht es, konzentrier dich!', 'Jetzt mit voller Kraft!',
        'Du machst das super!', 'Bleib dran, das läuft!', 'Sauber und stark!',
        'Du bist stärker als du denkst!', 'Schön gleichmäßig!', 'Weiter so, klasse!',
        'Genau richtig, los!', 'Glaub an dich!', 'Volle Konzentration, los!', 'Das sieht toll aus!',
        'Jeder Schritt zählt!', 'Du wächst gerade!', 'Stark angefangen!', 'Bleib in deinem Tempo!',
        'Atme und zieh durch!', 'Mega, weiter!', 'Du machst das spitze!', 'Voller Fokus, los geht es!',
        'Dranbleiben, super!', 'Der Speck darf ruhig gehen, wink ihm zu!', 'Tschüss Hüftgold, hallo Energie!',
        'Aus dem Bäuchlein wird ein Bäuchlein mit Muskeln!', 'Ein Waschbrettbauch steht dir richtig gut!',
        'Die Rettungsringe lassen wir hier, ja?', 'Sogar die Damen nebenan schauen anerkennend!',
        'Du schwitzt schön, das wirkt!', 'Noch ein bisschen, du machst das toll!',
        'Stark, dein Körper dankt es dir!', 'Komm, gemeinsam durch!', 'Sauber gehalten, weiter!',
        'Du bist heute richtig gut drauf!', 'Spür deine Kraft!', 'Lächeln nicht vergessen, du machst das klasse!',
        'Jede Wiederholung bringt dich näher ran!', 'Bleib dran, es lohnt sich!',
        'Locker durch die Bewegung!', 'Du bist auf einem super Weg!', 'Stark, halt die Spannung!',
        'Noch ein Stück, ich bin bei dir!',
      ],
      mid: [
        'Komm schon, {name}, du packst das!', 'Sauber gemacht, weiter so!', 'Bleib dran, {name}!',
        'Sieht richtig gut aus!', 'Noch ein bisschen, du schaffst das!', 'Stark, weiter!',
        'Der Speck verabschiedet sich, {name}!', 'Du wächst gerade über dich hinaus!',
        'Halt durch, ich glaub an dich!', 'Schön gleichmäßig, {name}!', 'Das Hüftgold schmilzt, weiter!',
        'Die Damen nebenan staunen, {name}!', 'Atme und bleib dran!', 'Mega, lass nicht nach!',
        'Du bist stärker als die Ausrede!', 'Noch kurz, dann bist du stolz!',
      ],
      rest: [
        'Super gemacht, kurz erholen.', 'Sauber! Atme durch.', 'Pause, gut gemacht.',
        'Kurz verschnaufen, stark gemacht.', 'Trink einen Schluck, weiter geht es gleich.',
        'Atme tief, der Speck ruht sich nicht aus.', 'Kurze Pause, du hast es dir verdient.',
        'Locker bleiben, gleich weiter.', 'Schüttel die Arme aus, sehr gut.',
        'Durchatmen, du machst das klasse.', 'Kurz sammeln, dann weiter.', 'Pause, gleich gehst du wieder ran.',
        'Atme ruhig, dein Körper dankt es dir.', 'Kurze Erholung, dann machst du weiter stark.',
        'Gut gemacht, kurz Kraft tanken.', 'Pause, du bist auf einem tollen Weg.',
        'Locker durchatmen, gleich geht es weiter.', 'Kurz entspannen, dann wieder Vollgas.',
        'Schnauf durch, das Hüftgold schmilzt schon.', 'Pause, gleich zeigst du es wieder allen.',
      ],
      warn15: ['Noch fünfzehn Sekunden, dranbleiben!', 'Fünfzehn Sekunden, du machst das toll!', 'Noch fünfzehn, halt durch!', 'Fünfzehn, gleich geschafft!'],
      finish: ['Geschafft! Klasse gemacht, {name}!', 'Fertig, sei stolz auf dich!', 'Toll gemacht, der Speck hatte keine Chance!', 'Geschafft, {name}, das war richtig stark!', 'Fertig, dein Körper sagt Danke!'],
    },
  },
  {
    id: 'zen',
    name: 'Zen-Meisterin Ruheherz',
    emoji: '🧘',
    desc: 'Ruhig & entspannt, gleichmäßiges Tempo – mit leiser Ironie.',
    gender: 'female',
    pitch: 0.96,
    rate: 0.9,
    lines: {
      start: ['Wir beginnen. Atme und komm an.', 'Lass uns ruhig starten.', 'Beginnen wir, ganz bei dir.', 'Atme ein, wir fangen an.', 'Ruhig ankommen, dann beginnen wir.'],
      next: ['Sanft weiter zu {ex}.', 'Es folgt {ex}. Bleib bei dir.', 'Nun {ex}.', 'Achtsam zu {ex}.', 'Gelassen weiter mit {ex}.'],
      again: ['Noch einmal {ex}, ganz ruhig.', '{ex}, wiederhole achtsam.', '{ex}, noch einmal, im Atem bleiben.'],
      work: [
        'Beginne, ruhig und kontrolliert.', 'Atme und bewege dich.', 'Finde deinen Rhythmus.',
        'Ganz ruhig starten.', 'Spüre deinen Körper.', 'Bleib bei deinem Atem.', 'Sanft beginnen.',
        'Kraft aus der Ruhe.', 'Achtsam bewegen.', 'Im Gleichmaß bleiben.', 'Lass es fließen.',
        'Konzentriert und gelassen.', 'Eine Bewegung nach der anderen.', 'Ruhig durchatmen, los.',
        'Innere Ruhe, äußere Kraft.', 'Präsent im Moment.', 'Weich und stark zugleich.',
        'Vertraue deinem Tempo.', 'Spür die Energie.', 'Bleib zentriert.', 'Gelassen durchziehen.',
        'Ruhe gibt Kraft.', 'Auch der Bauch ist ein Tempel, doch dieser darf kleiner werden.',
        'Lass den Speck los, ganz im Sinne des Loslassens.',
        'Der Waschbärbauch ist gemütlich, doch Wandel ist das Leben.',
        'Atme ein, der Bierbauch atmet mit, leider.',
        'Ein Waschbrettbauch ist auch nur ein sehr ruhiger Bauch.',
        'Die Damen nebenan ruhen in sich, beeindrucke lieber dich selbst.',
        'Schweiß ist nur Wasser, das den Weg kennt.',
        'Im Hüftgold wohnt noch alte Gemütlichkeit, lass sie ziehen.',
        'Sei wie der Fluss, nicht wie das Sofa.', 'Jede Wiederholung ist ein kleiner Frieden.',
        'Ruhig, der Körper folgt dem Geist.', 'Halte die Form, halte die Ruhe.',
        'Atme den Stress aus, atme die Kraft ein.', 'Gelassen, doch entschlossen.',
        'Spüre, wie der Speck sich verabschiedet.', 'Bleib weich im Kopf, fest im Rumpf.',
        'Der Weg ist die Wiederholung.', 'Ganz ruhig, ganz stark.',
      ],
      mid: [
        'Bleib im Rhythmus, {name}.', 'Ruhig atmen, weiter.', 'Spür deine Kraft, {name}.',
        'Ganz gleichmäßig.', 'Im Fluss bleiben.', 'Lass den Speck ziehen, {name}.',
        'Atme, der Rest kommt von selbst.', 'Gelassen weiter, du ruhst in dir.',
        'Der Bauch wird leiser, sehr gut.', 'Bleib zentriert, {name}.', 'Sanfte Kraft, weiter.',
        'Auch die Damen nebenan finden Frieden, du auch gleich.', 'Halte die Ruhe, halte das Tempo.',
        'Ein Atemzug nach dem anderen, {name}.', 'Loslassen, was schwer ist, auch am Bauch.',
        'Still und stark, weiter.',
      ],
      rest: [
        'Pause. Atme tief ein und aus.', 'Ruhe. Spüre deinen Atem.', 'Lass los, kurze Pause.',
        'Komm zur Ruhe, gleich weiter.', 'Atme, sammle deine Kraft.', 'Stille tut gut, nutze sie.',
        'Kurz innehalten, ganz bei dir.', 'Spüre, wie der Körper dankt.', 'Trink einen Schluck, achtsam.',
        'Ruhe vor der nächsten Bewegung.', 'Atme den Speck aus, im Geiste.', 'Kurze Pause, wach im Inneren.',
        'Lass den Atem fließen, ganz ruhig.', 'Sammle dich, finde deine Mitte.',
        'Pause ist auch Training, für die Geduld.', 'Atme ein, atme aus, lass los.',
        'Kurz ruhen, der Körper ordnet sich.', 'Spüre die Stille zwischen den Übungen.',
        'Gelassen verschnaufen, gleich weiter.', 'Ruhe schenkt Kraft, nimm sie an.',
      ],
      warn15: ['Noch fünfzehn Sekunden, bleib gelassen.', 'Fünfzehn Sekunden, ruhig weiter.', 'Noch fünfzehn, atme weiter.', 'Fünfzehn Sekunden, bleib im Fluss.'],
      finish: ['Geschafft. Sehr schön, {name}.', 'Fertig. Komm zur Ruhe.', 'Vollbracht. Der Bauch und du, ihr habt euch verändert.', 'Geschafft, atme und sei stolz.', 'Fertig, {name}. Frieden und Kraft.'],
    },
  },
];

export function getPersona(id) {
  return PERSONAS.find((p) => p.id === id) || PERSONAS[0];
}

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Shuffle-Bag pro (Persona+Moment): erst wenn ALLE Sprüche dran waren, wird neu
// gemischt – innerhalb eines Durchlaufs kommt also jeder Spruch genau einmal,
// bevor sich etwas wiederholt. Zusätzlich wird am Übergang zum neuen Bag ein
// direkter Wiederholer des zuletzt gesagten Spruchs vermieden.
const bags = {};
const lastPick = {};
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pickNoRepeat(key, arr) {
  if (arr.length <= 1) return arr[0];
  let bag = bags[key];
  if (!bag || !bag.length) {
    bag = bags[key] = shuffle(arr.map((_, i) => i));
    // Nicht denselben Spruch direkt wiederholen, wenn ein neuer Bag startet.
    if (bag.length > 1 && bag[bag.length - 1] === lastPick[key]) {
      [bag[bag.length - 1], bag[0]] = [bag[0], bag[bag.length - 1]];
    }
  }
  const idx = bag.pop();
  lastPick[key] = idx;
  return arr[idx];
}

// Setzt alle Shuffle-Bags zurück – zu Beginn jedes Workouts, damit die Auswahl
// frisch durchgemischt startet (nicht mit Resten aus dem vorigen Lauf).
export function resetCoachBags() {
  for (const k in bags) delete bags[k];
  for (const k in lastPick) delete lastPick[k];
}

function fillTokens(text, { ex = '', name = '' } = {}) {
  let t = text.replace(/\{ex\}/g, ex);
  if (name) {
    t = t.replace(/\{name\}/g, name);
  } else {
    t = t.replace(/,?\s*\{name\}/g, '');
  }
  return t
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .replace(/^[\s,]+/, '')
    .trim();
}

// Liefert einen möglichst wenig wiederholten, fertig befüllten Spruch.
export function line(persona, key, ctx = {}) {
  const pool = persona.lines[key];
  if (!pool || !pool.length) return '';
  return fillTokens(pickNoRepeat(`${persona.id}.${key}`, pool), ctx);
}

// Motivierender Zwischenruf (Mitte der Übung): schöpft aus einem GROSSEN Topf
// (mid + work zusammen, ~55–65 Sprüche je Coach), damit sich im Lauf wirklich
// viel abwechselt und sich nicht ständig dieselben paar Sprüche wiederholen.
export function motivationLine(persona, ctx = {}) {
  const base = persona.lines.mid || [];
  const extra = (persona.lines.work || []).filter((w) => !base.includes(w));
  const pool = base.concat(extra);
  if (!pool.length) return '';
  return fillTokens(pickNoRepeat(`${persona.id}.motivate`, pool), ctx);
}
