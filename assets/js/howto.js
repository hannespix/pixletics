// Verständliche Anleitungen pro Übung: Schritt-für-Schritt-Durchführung („steps")
// und die wichtigsten Punkte, auf die man besonders achten muss („tips" –
// Technik, Sicherheit, häufige Fehler).
//
// Statische Zuordnung über die Übungs-ID. Vorteil: keine Migration nötig –
// die Anzeige schlägt zur Laufzeit per ID nach. Eigene/zusätzliche Übungen
// ohne Eintrag zeigen einfach keine Anleitung.

export const EX_HOWTO = {
  // ---------------- Standard-Übungen ----------------
  burpees: {
    steps: [
      'Aus dem Stand in die Hocke gehen und beide Hände schulterbreit vor dir aufsetzen.',
      'Die Füße mit einem Sprung nach hinten strecken, bis du in der Liegestützposition bist.',
      'Optional eine Liegestütze, dann die Füße zurück zu den Händen springen.',
      'Aus der Hocke explosiv nach oben springen und die Arme über den Kopf strecken.',
      'Weich auf den Fußballen landen und direkt die nächste Wiederholung beginnen.',
    ],
    tips: [
      'Halte den Rücken gerade – in der Liegestützposition nicht durchhängen.',
      'Lande weich mit leicht gebeugten Knien, das schont die Gelenke.',
      'Lieber sauberes, gleichmäßiges Tempo als hektische, unsaubere Wiederholungen.',
      'Knieprobleme? Ohne Sprung – nur hochkommen und auf die Zehenspitzen.',
    ],
  },
  pushups: {
    steps: [
      'Hände etwas mehr als schulterbreit aufsetzen, Körper bildet eine gerade Linie von Kopf bis Ferse.',
      'Den Körper kontrolliert absenken, bis die Ellbogen etwa 90 Grad gebeugt sind.',
      'Kurz unten halten, dann kraftvoll wieder nach oben drücken.',
    ],
    tips: [
      'Bauch und Po anspannen – die Hüfte darf weder durchhängen noch hochstehen.',
      'Ellbogen zeigen leicht nach hinten (ca. 45°), nicht seitlich abspreizen.',
      'Nacken lang lassen, Blick schräg nach vorn-unten.',
      'Zu schwer? Auf den Knien abstützen.',
    ],
  },
  squats: {
    steps: [
      'Schulterbreiter Stand, Fußspitzen leicht nach außen gedreht.',
      'Hüfte nach hinten schieben und in die Knie gehen, als würdest du dich auf einen Stuhl setzen.',
      'Mindestens bis die Oberschenkel waagerecht sind, dann über die Fersen wieder hochdrücken.',
    ],
    tips: [
      'Die Knie folgen der Richtung der Fußspitzen – nicht nach innen kippen lassen.',
      'Fersen bleiben am Boden, das Gewicht liegt eher auf der Ferse.',
      'Brust aufrecht, Rücken gerade, Blick nach vorn.',
    ],
  },
  lunges: {
    steps: [
      'Aufrechter Stand, dann einen großen Schritt nach vorn machen.',
      'Beide Knie beugen, bis das hintere Knie fast den Boden berührt.',
      'Über die vordere Ferse zurück in den Stand drücken und die Seite wechseln.',
    ],
    tips: [
      'Das vordere Knie bleibt über dem Knöchel, nicht über die Fußspitze hinausschieben.',
      'Oberkörper aufrecht halten, nicht nach vorn kippen.',
      'Pro Seite gleich viele Wiederholungen, sauber im Gleichgewicht bleiben.',
    ],
  },
  situps: {
    steps: [
      'Auf den Rücken legen, Knie anwinkeln, Füße flach am Boden.',
      'Hände an die Schläfen legen oder vor der Brust kreuzen.',
      'Mit Bauchkraft den Oberkörper bis zum Sitzen aufrollen, dann kontrolliert zurück.',
    ],
    tips: [
      'Nicht am Kopf oder Nacken ziehen – die Kraft kommt aus dem Bauch.',
      'Langsam und kontrolliert bewegen, keinen Schwung aus den Armen nehmen.',
      'Beim Ablegen nicht ins Hohlkreuz fallen, Bauch bleibt angespannt.',
    ],
  },
  climbers: {
    steps: [
      'In den hohen Stütz (Liegestützposition) gehen, Hände unter den Schultern.',
      'Ein Knie zügig zur Brust ziehen, dann das Bein wechseln – wie Laufen am Boden.',
      'Das Tempo steigern, der Rumpf bleibt dabei stabil.',
    ],
    tips: [
      'Hüfte tief und ruhig halten, der Po schaukelt nicht nach oben.',
      'Schultern direkt über den Händen, Rücken gerade.',
      'Gleichmäßig weiteratmen, nicht die Luft anhalten.',
    ],
  },
  jacks: {
    steps: [
      'Aufrechter Stand, Arme an den Seiten.',
      'Mit einem Sprung die Beine grätschen und gleichzeitig die Arme über den Kopf führen.',
      'Mit dem nächsten Sprung zurück in die Ausgangsposition.',
    ],
    tips: [
      'Weich auf den Fußballen landen, Knie leicht gebeugt.',
      'Gleichmäßigen Rhythmus finden und locker bleiben.',
      'Gelenke schonen: Step-Variante – ein Bein nach dem anderen ohne Sprung.',
    ],
  },
  plank: {
    steps: [
      'Auf die Unterarme stützen, Ellbogen direkt unter den Schultern.',
      'Beine strecken, nur Unterarme und Fußspitzen berühren den Boden.',
      'Der Körper bildet eine gerade Linie – diese Position halten.',
    ],
    tips: [
      'Po und Bauch fest anspannen, die Hüfte nicht durchhängen lassen.',
      'Den Po auch nicht zu hoch strecken – keine „Bergspitze".',
      'Ruhig weiteratmen, Nacken lang (Blick zum Boden).',
    ],
  },
  highknees: {
    steps: [
      'Auf der Stelle laufen und dabei die Knie abwechselnd mindestens hüfthoch ziehen.',
      'Die Arme gegengleich mitschwingen.',
      'Tempo hochhalten und auf den Fußballen bleiben.',
    ],
    tips: [
      'Oberkörper aufrecht, den Bauch leicht anspannen.',
      'Die Knie aktiv hochziehen, nicht nur trippeln.',
      'Weich landen, nicht in die Fersen stampfen.',
    ],
  },
  legraises: {
    steps: [
      'Auf den Rücken legen, Beine gestreckt, Hände neben oder unter dem Po.',
      'Die gestreckten Beine kontrolliert bis etwa 90 Grad anheben.',
      'Langsam absenken, ohne dass die Fersen den Boden berühren.',
    ],
    tips: [
      'Der untere Rücken bleibt fest am Boden gedrückt – kein Hohlkreuz.',
      'Vor allem beim Absenken langsam und kontrolliert bewegen.',
      'Zieht die Oberschenkelrückseite zu stark, die Knie leicht beugen.',
    ],
  },
  superman: {
    steps: [
      'Bäuchlings auf den Boden legen, Arme nach vorn ausgestreckt.',
      'Arme, Brust und Beine gleichzeitig vom Boden abheben.',
      'Kurz oben halten, dann kontrolliert wieder ablegen.',
    ],
    tips: [
      'Blick zum Boden, der Nacken bleibt in Verlängerung der Wirbelsäule.',
      'Die Bewegung kommt aus Rücken und Po, nicht ruckartig hochreißen.',
      'Nur so hoch heben, wie es ohne Schmerzen im unteren Rücken geht.',
    ],
  },
  wallsit: {
    steps: [
      'Mit dem Rücken an eine Wand stellen und langsam nach unten rutschen.',
      'Oberschenkel waagerecht, Knie im 90-Grad-Winkel – wie auf einem unsichtbaren Stuhl.',
      'Diese Position halten.',
    ],
    tips: [
      'Die Knie genau über den Knöcheln, nicht nach vorn über die Zehen.',
      'Der ganze Rücken liegt flach an der Wand.',
      'Gewicht auf den Fersen, gleichmäßig weiteratmen.',
    ],
  },
  twists: {
    steps: [
      'Auf den Po setzen, Knie gebeugt, Oberkörper leicht nach hinten lehnen.',
      'Hände vor der Brust (oder ein Gewicht) halten, Füße bei Bedarf anheben.',
      'Den Oberkörper kontrolliert von einer Seite zur anderen drehen.',
    ],
    tips: [
      'Die Drehung kommt aus dem Rumpf, nicht nur aus den Armen.',
      'Rücken gerade halten, nicht rund machen.',
      'Schwieriger wird es mit angehobenen Füßen.',
    ],
  },
  diamond: {
    steps: [
      'In die Liegestützposition gehen, Hände eng zusammen – Daumen und Zeigefinger bilden eine Raute.',
      'Den Körper gerade absenken, die Ellbogen bleiben nah am Körper.',
      'Kraftvoll wieder hochdrücken.',
    ],
    tips: [
      'Ellbogen eng am Körper führen – das belastet gezielt den Trizeps.',
      'Die Hüfte nicht durchhängen lassen, Körper bleibt eine Linie.',
      'Zu schwer? Auf den Knien ausführen.',
    ],
  },
  tricepdips: {
    steps: [
      'Mit dem Rücken zu einer Bank/einem Stuhl, Hände auf der Kante, Finger nach vorn.',
      'Den Po vor die Kante schieben, Beine nach vorn ausstrecken.',
      'Die Ellbogen nach hinten beugen, den Körper absenken, dann wieder hochdrücken.',
    ],
    tips: [
      'Die Ellbogen zeigen nach hinten, nicht nach außen.',
      'Schultern weg von den Ohren, nicht hochziehen.',
      'Den Po nah an der Bank entlangführen.',
    ],
  },
  jumpsquats: {
    steps: [
      'In die Kniebeuge gehen.',
      'Explosiv nach oben springen und die Beine strecken.',
      'Weich landen und direkt in die nächste Kniebeuge gehen.',
    ],
    tips: [
      'Weich über die Fußballen landen, die Knie federn ab.',
      'Die Knie beim Landen nicht nach innen kippen lassen.',
      'Bei Gelenkproblemen lieber normale Kniebeugen ohne Sprung.',
    ],
  },
  plankjacks: {
    steps: [
      'In die Unterarmstütz-Position gehen.',
      'Mit Sprüngen die Beine grätschen und wieder zusammenführen (wie ein Hampelmann mit den Beinen).',
      'Der Rumpf bleibt dabei stabil.',
    ],
    tips: [
      'Die Hüfte ruhig halten, nicht nach oben schaukeln.',
      'Po und Bauch durchgehend angespannt.',
      'Bei wenig Platz oder Knieproblemen kleinere Sprünge machen.',
    ],
  },
  crunches: {
    steps: [
      'Auf den Rücken legen, Knie gebeugt, Füße am Boden.',
      'Mit Bauchkraft die Schulterblätter leicht vom Boden lösen.',
      'Kurz halten, dann langsam zurück.',
    ],
    tips: [
      'Nur die Schulterblätter heben – das ist kein kompletter Sit-up.',
      'Das Kinn nicht auf die Brust pressen, etwa eine Faust Abstand lassen.',
      'Langsam bewegen und den Bauch bewusst anspannen.',
    ],
  },
  bridge: {
    steps: [
      'Auf den Rücken legen, Knie gebeugt, Füße hüftbreit am Boden.',
      'Den Po anspannen und die Hüfte nach oben drücken, bis Knie, Hüfte und Schulter eine Linie bilden.',
      'Kurz halten, dann kontrolliert absenken.',
    ],
    tips: [
      'Die Kraft kommt aus dem Po, nicht aus dem unteren Rücken.',
      'Oben nicht ins Hohlkreuz drücken.',
      'Füße fest am Boden, das Gewicht liegt auf den Fersen.',
    ],
  },
  sideplank: {
    steps: [
      'Seitlich auf einen Unterarm stützen, der Ellbogen ist unter der Schulter.',
      'Beine gestreckt übereinander, die Hüfte vom Boden heben.',
      'Der Körper bildet eine gerade Linie – halten, dann die Seite wechseln.',
    ],
    tips: [
      'Die Hüfte oben halten, nicht absacken lassen.',
      'Die Schulter bleibt stabil über dem Ellbogen.',
      'Leichter wird es, wenn du das untere Knie ablegst.',
    ],
  },
  skater: {
    steps: [
      'Seitlich von einem Bein auf das andere springen, wie ein Eisschnellläufer.',
      'Das hintere Bein kreuzt locker hinter dem Standbein.',
      'Weich landen und sofort zur anderen Seite springen.',
    ],
    tips: [
      'Weich auf dem Fußballen landen, das Knie federt ab.',
      'Das Knie des Standbeins nicht nach innen kippen lassen.',
      'Die Arme zum Schwungholen mitnehmen, der Rumpf bleibt stabil.',
    ],
  },
  // ---------------- Ergänzende Übungen ----------------
  pikepushups: {
    steps: [
      'Aus dem hohen Stütz die Hüfte hoch schieben – der Körper bildet ein umgekehrtes „V".',
      'Den Kopf Richtung Boden senken, indem du die Ellbogen beugst.',
      'Kraftvoll wieder hochdrücken.',
    ],
    tips: [
      'Je steiler die Hüfte steht, desto mehr arbeiten die Schultern.',
      'Die Ellbogen nicht weit ausstellen.',
      'Den Kopf bewusst zwischen den Händen absenken.',
    ],
  },
  shouldertaps: {
    steps: [
      'In den hohen Stütz gehen, Füße etwas breiter für mehr Stabilität.',
      'Mit einer Hand die gegenüberliegende Schulter antippen.',
      'Die Hand zurücksetzen und die Seite wechseln.',
    ],
    tips: [
      'Die Hüfte so ruhig wie möglich halten – kein Hin- und Herrollen.',
      'Po und Bauch fest anspannen.',
      'Ein breiterer Stand macht die Übung stabiler.',
    ],
  },
  calfraises: {
    steps: [
      'Aufrechter Stand, bei Bedarf an einer Wand festhalten.',
      'Langsam auf die Zehenspitzen heben, so hoch wie möglich.',
      'Oben kurz halten, dann langsam absenken.',
    ],
    tips: [
      'Oben die Spannung kurz halten (etwa eine Sekunde).',
      'Langsam absenken, nicht einfach fallen lassen.',
      'Schwieriger: einbeinig oder auf einer Stufe (größerer Bewegungsumfang).',
    ],
  },
  swimmers: {
    steps: [
      'Bäuchlings liegen, Arme nach vorn ausgestreckt.',
      'Wechselseitig rechten Arm und linkes Bein heben, dann links und rechts – wie Kraulen.',
      'In einem gleichmäßigen Rhythmus weitermachen.',
    ],
    tips: [
      'Kontrolliert bewegen, nicht hektisch zappeln.',
      'Blick zum Boden, der Nacken bleibt lang.',
      'Den Bauch leicht anspannen, um den unteren Rücken zu schützen.',
    ],
  },
  // ---------------- Zirkel-/Gerätestationen ----------------
  'circ-rope': {
    steps: [
      'Das Seil hinter dem Körper, die Ellbogen nah am Oberkörper.',
      'Aus den Handgelenken schwingen und über die Fußballen springen.',
      'Kleine, lockere Sprünge im Takt des Seils.',
    ],
    tips: [
      'Nur wenige Zentimeter springen – nicht hoch hüpfen.',
      'Aus den Handgelenken drehen, nicht aus den ganzen Armen.',
      'Weich auf den Ballen landen, die Fersen bleiben oben.',
    ],
  },
  'circ-shuttle': {
    steps: [
      'Zwischen zwei Markierungen hin- und hersprinten.',
      'An jeder Linie tief abbremsen und antippen bzw. umkehren.',
      'Explosiv wieder beschleunigen.',
    ],
    tips: [
      'Beim Abbremsen in die Knie gehen, den Schwerpunkt tief halten.',
      'Kontrolliert wenden, das schont die Knie.',
      'Kurze, schnelle Schritte beim Antritt.',
    ],
  },
  'circ-scooter': {
    steps: [
      'Bäuchlings auf das Rollbrett legen.',
      'Mit den Händen am Boden nach vorn ziehen.',
      'Gleichmäßig durch den Parcours ziehen.',
    ],
    tips: [
      'Den Rumpf anspannen, damit der Rücken stabil bleibt.',
      'Kräftige, gleichmäßige Züge.',
      'Den Kopf neutral halten, den Nacken nicht überstrecken.',
    ],
  },
  'circ-ballwall': {
    steps: [
      'Den Ball mit beiden Händen vor der Brust halten.',
      'Kraftvoll nach oben werfen und wieder fangen.',
      'Aus den Beinen mitarbeiten.',
    ],
    tips: [
      'Beim Fangen leicht in die Knie gehen, um abzufedern.',
      'Die Augen immer am Ball.',
      'Stabiler Stand, der Rumpf bleibt angespannt.',
    ],
  },
  'circ-lunge': {
    steps: [
      'Einen großen Schritt nach vorn machen und beide Knie beugen.',
      'Das hintere Knie Richtung Boden senken, dann wieder hochdrücken.',
      'Die Seite wechseln oder gehend vorwärts arbeiten.',
    ],
    tips: [
      'Das vordere Knie über dem Knöchel halten.',
      'Den Oberkörper aufrecht lassen.',
      'Mit Gewichten: locker an den Seiten halten, Schultern zurück.',
    ],
  },
  'circ-rings': {
    steps: [
      'Die Ringe greifen und den Körper nach hinten lehnen (oder hängen).',
      'Die Schulterblätter zusammenziehen und den Körper hochziehen.',
      'Kontrolliert wieder ablassen.',
    ],
    tips: [
      'Zuerst die Schulterblätter zusammenziehen, dann mit den Armen ziehen.',
      'Den Rumpf fest halten, der Körper bleibt gerade (kein Hohlkreuz).',
      'Die Ellbogen nah am Körper führen.',
    ],
  },
  'circ-bench': {
    steps: [
      'Auf der Bank liegen, Stange oder Gewicht über der Brust.',
      'Kontrolliert zur Brust absenken.',
      'Kraftvoll wieder nach oben drücken.',
    ],
    tips: [
      'Handgelenke gerade, die Ellbogen etwa 45 Grad zum Körper.',
      'Schulterblätter zusammen und stabil auf der Bank.',
      'Füße fest am Boden. Bei freien Gewichten möglichst mit Partner sichern.',
    ],
  },
  'circ-wallbars': {
    steps: [
      'An der Sprossenwand hängen, die Arme gestreckt.',
      'Die gestreckten oder gebeugten Beine kontrolliert anheben.',
      'Langsam wieder absenken.',
    ],
    tips: [
      'Nicht schwingen – die Bewegung kommt aus dem Bauch.',
      'Die Schultern aktiv halten (leicht herabgezogen), nicht passiv durchhängen.',
      'Die Knie beugen, falls gestreckt zu schwer ist.',
    ],
  },
  'circ-overhead': {
    steps: [
      'Die Stange auf Schulterhöhe, Hände etwas mehr als schulterbreit.',
      'Den Rumpf anspannen und die Stange gerade über den Kopf drücken.',
      'Kontrolliert wieder absenken.',
    ],
    tips: [
      'Po und Bauch fest – kein Hohlkreuz beim Drücken.',
      'Die Stange über der Körpermitte ausbalancieren.',
      'Mit einem Gewicht beginnen, das du sauber beherrschst.',
    ],
  },
  'circ-hipthrust': {
    steps: [
      'Mit dem oberen Rücken an eine Bank lehnen, das Gewicht auf der Hüfte.',
      'Den Po anspannen und die Hüfte nach oben drücken, bis der Körper waagerecht ist.',
      'Kurz halten, dann kontrolliert absenken.',
    ],
    tips: [
      'Die Kraft kommt aus dem Po; oben nicht ins Hohlkreuz drücken.',
      'Das Kinn leicht zur Brust, Blick nach vorn.',
      'Die Schienbeine stehen senkrecht, die Füße fest am Boden.',
    ],
  },
  'circ-boxjump': {
    steps: [
      'Vor der Box stehen und leicht in die Knie gehen.',
      'Mit Armschwung beidbeinig auf die Box springen.',
      'Sauber landen, dann kontrolliert wieder heruntersteigen.',
    ],
    tips: [
      'Weich mit beiden Füßen ganz auf der Box landen, die Knie federn.',
      'Heruntersteigen statt -springen – das schont die Gelenke.',
      'Eine Boxhöhe wählen, die du sicher schaffst.',
    ],
  },
  'circ-battlerope': {
    steps: [
      'Leicht in die Knie gehen, die Taue in den Händen.',
      'Die Arme schnell abwechselnd auf und ab schlagen und Wellen erzeugen.',
      'Durchgehend das Tempo halten.',
    ],
    tips: [
      'Aus einer stabilen, tiefen Position arbeiten.',
      'Den Rumpf anspannen, die Bewegung kommt aus Armen und Schultern.',
      'Gleichmäßig atmen und locker greifen.',
    ],
  },
  'circ-kettlebell': {
    steps: [
      'Schulterbreiter Stand, die Kettlebell mit beiden Händen vor dem Körper.',
      'Die Hüfte nach hinten schieben und die Kettlebell zwischen die Beine schwingen.',
      'Die Hüfte explosiv nach vorn strecken – der Schwung bringt die Kugel auf Schulterhöhe.',
    ],
    tips: [
      'Der Schwung kommt aus der Hüfte, nicht aus den Armen.',
      'Der Rücken bleibt gerade – nicht rund machen.',
      'Am höchsten Punkt den Po fest anspannen, die Arme bleiben locker.',
    ],
  },
  'circ-medball': {
    steps: [
      'Den Ball mit beiden Händen über den Kopf heben, dabei auf die Zehenspitzen.',
      'Mit dem ganzen Körper den Ball kraftvoll auf den Boden schmettern.',
      'In die Hocke gehen, den Ball aufnehmen und wiederholen.',
    ],
    tips: [
      'Die Bewegung kommt aus dem ganzen Körper, den Rumpf anspannen.',
      'Beim Aufheben in die Knie gehen, der Rücken bleibt gerade.',
      'Einen geeigneten Ball verwenden, der nicht zurückspringt.',
    ],
  },
  'circ-stepups': {
    steps: [
      'Vor eine Bank oder Box stellen.',
      'Mit einem Fuß ganz aufsteigen und das andere Knie nach oben ziehen.',
      'Kontrolliert wieder heruntersteigen und die Seite wechseln.',
    ],
    tips: [
      'Den ganzen Fuß auf die Bank setzen und über die Ferse hochdrücken.',
      'Das vordere Knie in Linie mit dem Fuß halten, nicht nach innen.',
      'Den Oberkörper aufrecht halten, nicht nach vorn fallen.',
    ],
  },
};

// Liefert das kuratierte Anleitungs-Objekt zu einer Übungs-ID (oder null).
export function getHowto(exId) {
  return EX_HOWTO[exId] || null;
}

// Auflösen für eine konkrete Übung: bevorzugt die am Objekt gespeicherte,
// editierbare Anleitung (ex.steps / ex.tips – auch bei eigenen Übungen),
// sonst die kuratierte Vorlage aus EX_HOWTO. Hat der Nutzer die Anleitung
// bewusst geleert (leere Arrays), wird NICHTS angezeigt (kein Rückfall).
// Gibt { steps, tips } zurück oder null, wenn nichts vorhanden ist.
export function resolveHowto(ex) {
  if (!ex) return null;
  const ownSteps = Array.isArray(ex.steps) ? ex.steps : null;
  const ownTips = Array.isArray(ex.tips) ? ex.tips : null;
  if (ownSteps || ownTips) {
    const out = { steps: ownSteps || [], tips: ownTips || [] };
    return (out.steps.length || out.tips.length) ? out : null;
  }
  return EX_HOWTO[ex.id] || null;
}
